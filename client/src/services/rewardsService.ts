import { supabase } from '@/lib/supabase';

// Types for rewards system
export interface UserPointsSummary {
  userId: string;
  totalPoints: number;
  level: number;
  weeklyPoints: number;
  monthlyPoints: number;
  lastResetDate: string;
  updatedAt: string;
}

export interface Achievement {
  id: number;
  name: string;
  description: string;
  category: string;
  iconName: string;
  badgeColor: string;
  requirement: string;
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  isActive: boolean;
  createdAt: string;
}

export interface UserAchievement {
  id: number;
  userId: string;
  achievementId: number;
  unlockedAt: string | null;
  progress: number;
  progressMax: number;
  isCompleted: boolean;
  createdAt: string;
  achievement?: Achievement;
}

export interface PointsLedgerEntry {
  id: number;
  userId: string;
  action: string;
  actionKey: string;
  points: number;
  metadata: any;
  description: string;
  createdAt: string;
}

export interface Mission {
  id: number;
  name: string;
  nameHe?: string;
  description: string;
  descriptionHe?: string;
  type: 'daily' | 'weekly';
  action: string;
  targetCount: number;
  pointsReward: number;
  isActive: boolean;
  validFrom: string;
  validUntil?: string;
  createdAt: string;
}

export interface LeaderboardEntry {
  userId: string;
  totalPoints: number;
  weeklyPoints: number;
  rank: number;
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    profileImageUrl?: string;
  };
}

// Calculate user level based on total points
export function calcLevel(totalPoints: number): number {
  if (totalPoints >= 2000) return 5;
  if (totalPoints >= 1000) return 4;
  if (totalPoints >= 500) return 3;
  if (totalPoints >= 200) return 2;
  return 1;
}

// Get current user session
export async function getCurrentUser() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session?.user || null;
}

// Fetch user points summary
export async function fetchMySummary(): Promise<UserPointsSummary> {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('user_points_summary')
    .select('*')
    .eq('userId', user.id)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // 116 = no rows found

  if (!data) {
    // Return default summary if no record exists
    return {
      userId: user.id,
      totalPoints: 0,
      level: 1,
      weeklyPoints: 0,
      monthlyPoints: 0,
      lastResetDate: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  return {
    ...data,
    level: calcLevel(data.totalPoints)
  };
}

// Fetch user achievements with progress
export async function fetchMyAchievements() {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('user_achievements')
    .select(`
      id,
      userId,
      achievementId,
      unlockedAt,
      progress,
      progressMax,
      isCompleted,
      createdAt,
      achievement:achievements (
        id, name, description, category, iconName, badgeColor, 
        requirement, points, rarity, isActive, createdAt
      )
    `)
    .eq('userId', user.id)
    .order('unlockedAt', { ascending: false, nullsFirst: false });

  if (error) throw error;

  const achievements = (data as UserAchievement[]) || [];
  const unlocked = achievements.filter(a => a.isCompleted && a.unlockedAt);
  const inProgress = achievements.filter(a => !a.isCompleted && a.progress < a.progressMax);

  return { unlocked, inProgress, all: achievements };
}

// Fetch all available achievements catalog
export async function fetchCatalogAchievements(): Promise<Achievement[]> {
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .eq('isActive', true)
    .order('rarity', { ascending: true })
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
}

// Fetch missions (daily/weekly)
export async function fetchMissions(): Promise<Mission[]> {
  const now = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('missions')
    .select('*')
    .eq('isActive', true)
    .or(`validUntil.is.null,validUntil.gt.${now}`)
    .order('type', { ascending: true })
    .order('pointsReward', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Fetch leaderboard for last 30 days
export async function fetchLeaderboard30d(limit = 10): Promise<LeaderboardEntry[]> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Query points ledger for last 30 days, aggregated by user
  const { data, error } = await supabase
    .from('points_ledger')
    .select(`
      userId,
      points,
      users!inner (
        id,
        firstName,
        lastName,
        email,
        profileImageUrl
      )
    `)
    .gte('createdAt', thirtyDaysAgo.toISOString())
    .order('points', { ascending: false })
    .limit(limit * 5); // Get more data to aggregate properly

  if (error) throw error;

  // Aggregate points by user
  const userPointsMap = new Map<string, { points: number; user: any }>();
  
  data?.forEach(entry => {
    const existing = userPointsMap.get(entry.userId);
    if (existing) {
      existing.points += entry.points;
    } else {
      userPointsMap.set(entry.userId, {
        points: entry.points,
        user: entry.users
      });
    }
  });

  // Convert to leaderboard entries and sort
  const leaderboard = Array.from(userPointsMap.entries())
    .map(([userId, data]) => ({
      userId,
      totalPoints: data.points,
      weeklyPoints: data.points, // For now, same as total in 30d period
      rank: 0, // Will be set below
      user: data.user
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, limit);

  // Set ranks
  leaderboard.forEach((entry, index) => {
    entry.rank = index + 1;
  });

  return leaderboard;
}

// Fetch user's points history
export async function fetchMyPointsHistory(limit = 50): Promise<PointsLedgerEntry[]> {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('points_ledger')
    .select('*')
    .eq('userId', user.id)
    .order('createdAt', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

// Award points via RPC (idempotent)
export async function awardPoints(
  action: string,
  points: number,
  actionKey: string,
  meta?: any
): Promise<{ success: boolean; message: string }> {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase.rpc('award_points', {
    p_user_id: user.id,
    p_action: action,
    p_points: points,
    p_action_key: actionKey,
    p_meta: meta || {}
  });

  if (error) {
    if (error.code === '23505') { // Unique violation - duplicate action_key
      return { success: false, message: 'כבר קיבלת נקודות עבור פעולה זו' };
    }
    throw error;
  }

  return { success: true, message: 'נקודות נוספו בהצלחה!' };
}

// Daily check-in
export async function dailyCheckIn(): Promise<{ success: boolean; message: string }> {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const actionKey = `checkin:${today}`;
  
  return awardPoints('daily.checkin', 5, actionKey, { date: today });
}

// Award points for specific actions
export async function awardReviewPoints(reviewId: number, placeId?: string) {
  return awardPoints('review.create', 50, `review:${reviewId}`, { placeId, reviewId });
}

export async function awardPhotoPoints(photoId: number) {
  return awardPoints('photo.upload', 10, `photo:${photoId}`, { photoId });
}

export async function awardItineraryPoints(itineraryId: number) {
  return awardPoints('itinerary.save', 10, `itinerary:${itineraryId}`, { itineraryId });
}

export async function awardSharePoints(itineraryId: number, slug: string) {
  return awardPoints('itinerary.share', 20, `share:${itineraryId}:${slug}`, { itineraryId, slug });
}