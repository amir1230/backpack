import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Trophy, 
  Target, 
  Medal, 
  Crown, 
  Calendar,
  Clock,
  Star,
  Gift,
  TrendingUp,
  Users,
  ChevronRight,
  Plus,
  CheckCircle,
  Camera,
  MessageSquare,
  Heart,
  MapPin,
  Award,
  Zap
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import * as rewardsService from "@/services/rewardsService";

// Helper function to calculate level from points
const calculateLevel = (totalPoints: number) => {
  if (totalPoints < 100) return 1;
  if (totalPoints < 300) return 2;
  if (totalPoints < 700) return 3;
  if (totalPoints < 1500) return 4;
  return 5;
};

const getPointsToNextLevel = (totalPoints: number) => {
  const level = calculateLevel(totalPoints);
  const thresholds = [0, 100, 300, 700, 1500, Infinity];
  return thresholds[level] - totalPoints;
};

const getLevelName = (level: number) => {
  const names = ["Beginner", "Explorer", "Wanderer", "Travel Expert", "Globetrotter"];
  return names[level - 1] || "Globetrotter";
};

export default function Achievements() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user points summary
  const { data: pointsSummary, isLoading: pointsLoading } = useQuery({
    queryKey: ["rewards", "summary"],
    queryFn: rewardsService.fetchMySummary,
    enabled: !!user,
  });

  // Fetch user achievements
  const { data: achievements, isLoading: achievementsLoading } = useQuery({
    queryKey: ["rewards", "achievements"],
    queryFn: rewardsService.fetchMyAchievements,
    enabled: !!user,
  });

  // Fetch catalog achievements for Badges tab
  const { data: catalogAchievements, isLoading: catalogLoading } = useQuery({
    queryKey: ["rewards", "catalog"],
    queryFn: rewardsService.fetchCatalogAchievements,
    enabled: !!user,
  });

  // Fetch missions
  const { data: missions, isLoading: missionsLoading } = useQuery({
    queryKey: ["rewards", "missions"],
    queryFn: rewardsService.fetchMissions,
    enabled: !!user,
  });

  // Fetch leaderboard
  const { data: leaderboard, isLoading: leaderboardLoading } = useQuery({
    queryKey: ["rewards", "leaderboard"],
    queryFn: () => rewardsService.fetchLeaderboard30d(10),
    enabled: !!user,
  });

  // Fetch points history
  const { data: pointsHistory, isLoading: historyLoading } = useQuery({
    queryKey: ["rewards", "history"],
    queryFn: () => rewardsService.fetchMyPointsHistory(50),
    enabled: !!user,
  });

  // Daily check-in mutation
  const dailyCheckInMutation = useMutation({
    mutationFn: rewardsService.dailyCheckIn,
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: "Daily Check-in Successful!",
          description: "Points added successfully",
        });
        // Refresh relevant queries
        queryClient.invalidateQueries({ queryKey: ["rewards", "summary"] });
        queryClient.invalidateQueries({ queryKey: ["rewards", "history"] });
      } else {
        toast({
          title: "Already checked in today",
          description: result.message,
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Check-in Error",
        description: "Error awarding points, please try again",
        variant: "destructive",
      });
    },
  });

  // Demo mutations for quick actions
  const awardReviewPointsMutation = useMutation({
    mutationFn: () => rewardsService.awardReviewPointsWithProgress(
      `demo-review-${Date.now()}`, 
      "demo-place-123"
    ),
    onSuccess: (result) => {
      const progressResult = result.progressResult;
      if (progressResult.unlocked) {
        toast({
          title: "🏆 New badge unlocked!",
          description: `${progressResult.achievement?.name} (+${progressResult.achievement?.points} pts)`,
        });
      } else {
        toast({
          title: "Points added successfully",
          description: "+50 points for writing a review",
        });
      }
      queryClient.invalidateQueries({ queryKey: ["rewards"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Error awarding points, please try again",
        variant: "destructive",
      });
    },
  });

  const awardPhotoPointsMutation = useMutation({
    mutationFn: () => rewardsService.awardPhotoPointsWithProgress(
      `demo-photo-${Date.now()}`, 
      "demo-place-456"
    ),
    onSuccess: (result) => {
      const progressResult = result.progressResult;
      if (progressResult.unlocked) {
        toast({
          title: "🏆 New badge unlocked!",
          description: `${progressResult.achievement?.name} (+${progressResult.achievement?.points} pts)`,
        });
      } else {
        toast({
          title: "Points added successfully",
          description: "+10 points for uploading a photo",
        });
      }
      queryClient.invalidateQueries({ queryKey: ["rewards"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Error awarding points, please try again",
        variant: "destructive",
      });
    },
  });

  const awardItineraryPointsMutation = useMutation({
    mutationFn: () => rewardsService.awardItineraryPointsWithProgress(
      `demo-itinerary-${Date.now()}`, 
      true // isShare = true
    ),
    onSuccess: (result) => {
      const progressResult = result.progressResult;
      if (progressResult.unlocked) {
        toast({
          title: "🏆 New badge unlocked!",
          description: `${progressResult.achievement?.name} (+${progressResult.achievement?.points} pts)`,
        });
      } else {
        toast({
          title: "Points added successfully",
          description: "+20 points for sharing an itinerary",
        });
      }
      queryClient.invalidateQueries({ queryKey: ["rewards"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Error awarding points, please try again",
        variant: "destructive",
      });
    },
  });

  // Authentication check
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 p-4 md:pr-64" dir="ltr">
        <div className="max-w-4xl mx-auto pt-8">
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                <Trophy className="w-8 h-8 text-orange-500" />
                Achievements
              </CardTitle>
              <CardDescription>
                Sign in with Google to save your progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => window.location.href = '/api/auth/google'}>
                Sign In with Google
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const totalPoints = (pointsSummary as any)?.totalPoints || 0;
  const currentLevel = calculateLevel(totalPoints);
  const pointsToNext = getPointsToNextLevel(totalPoints);
  const levelName = getLevelName(currentLevel);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 p-4 md:pr-64" dir="ltr">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
            <Trophy className="w-10 h-10 text-orange-500" />
            Achievements
          </h1>
          <p className="text-gray-600 text-lg">Track your travel progress and unlock rewards</p>
        </div>

        {/* Quick Actions Bar */}
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 flex-wrap">
              <Button 
                onClick={() => dailyCheckInMutation.mutate()}
                disabled={dailyCheckInMutation.isPending}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                {dailyCheckInMutation.isPending ? "Checking in..." : "Daily Check-in"}
              </Button>
              
              <Button 
                onClick={() => awardReviewPointsMutation.mutate()}
                disabled={awardReviewPointsMutation.isPending}
                variant="outline"
                className="flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                {awardReviewPointsMutation.isPending ? "Adding..." : "Write Review (+50 pts)"}
              </Button>
              
              <Button 
                onClick={() => awardPhotoPointsMutation.mutate()}
                disabled={awardPhotoPointsMutation.isPending}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Camera className="w-4 h-4" />
                {awardPhotoPointsMutation.isPending ? "Adding..." : "Upload Photo (+10 pts)"}
              </Button>
              
              <Button 
                onClick={() => awardItineraryPointsMutation.mutate()}
                disabled={awardItineraryPointsMutation.isPending}
                variant="outline"
                className="flex items-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                {awardItineraryPointsMutation.isPending ? "Adding..." : "Share Itinerary (+20 pts)"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="overview" className="text-left">Overview</TabsTrigger>
            <TabsTrigger value="missions" className="text-left">Missions</TabsTrigger>
            <TabsTrigger value="badges" className="text-left">Badges</TabsTrigger>
            <TabsTrigger value="leaderboard" className="text-left">Leaderboard</TabsTrigger>
            <TabsTrigger value="history" className="text-left">History</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* User Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* My Balance */}
              <Card className="bg-gradient-to-br from-orange-100 to-orange-200 border-orange-300">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2 text-orange-800">
                    <Star className="w-5 h-5" />
                    My Balance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-3xl font-bold text-orange-900">{totalPoints.toLocaleString()} pts</div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-orange-700">
                        <span>Level {currentLevel} - {levelName}</span>
                        <span>{pointsToNext > 0 ? `${pointsToNext} to next` : 'Max Level!'}</span>
                      </div>
                      {pointsToNext > 0 && (
                        <Progress 
                          value={((totalPoints % 100) / 100) * 100} 
                          className="h-2 bg-orange-200"
                        />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Unlocked Badges */}
              <Card className="bg-gradient-to-br from-blue-100 to-blue-200 border-blue-300">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2 text-blue-800">
                    <Medal className="w-5 h-5" />
                    Unlocked Badges
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-900 mb-2">
                    {(achievements as any)?.unlocked?.length || 0}
                  </div>
                  <p className="text-blue-700 text-sm">Achievements completed</p>
                </CardContent>
              </Card>

              {/* Current Rank */}
              <Card className="bg-gradient-to-br from-purple-100 to-purple-200 border-purple-300">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2 text-purple-800">
                    <Crown className="w-5 h-5" />
                    Current Rank
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-900 mb-2">#1</div>
                  <p className="text-purple-700 text-sm">This month</p>
                </CardContent>
              </Card>
            </div>

            {/* Unlocked Achievements */}
            {(achievements as any)?.unlocked?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <span>Unlocked Badges ({(achievements as any)?.unlocked?.length || 0})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(achievements as any).unlocked.map((userAchievement: any) => (
                      <div key={userAchievement.id} className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-yellow-200 rounded-full">
                            <Trophy className="w-5 h-5 text-yellow-700" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-yellow-900">
                              {userAchievement.achievement?.name || 'Achievement'}
                            </h4>
                            <p className="text-sm text-yellow-700 mb-2">
                              {userAchievement.achievement?.description || 'No description'}
                            </p>
                            <div className="flex items-center justify-between">
                              <Badge variant="secondary" className="bg-yellow-300 text-yellow-800">
                                {userAchievement.achievement?.rarity || 'common'}
                              </Badge>
                              <span className="text-sm font-semibold text-yellow-900">
                                +{userAchievement.achievement?.points || 0} pts
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* In Progress Achievements */}
            {(achievements as any)?.inProgress?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-500" />
                    <span>In Progress ({(achievements as any)?.inProgress?.length || 0})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(achievements as any).inProgress.map((userAchievement: any) => (
                      <div key={userAchievement.id} className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-blue-200 rounded-full">
                            <Target className="w-5 h-5 text-blue-700" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-blue-900 mb-1">
                              {userAchievement.achievement?.name || 'Achievement'}
                            </h4>
                            <p className="text-sm text-blue-700 mb-3">
                              {userAchievement.achievement?.description || 'No description'}
                            </p>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-blue-700">Progress</span>
                                <span className="text-blue-900 font-semibold">
                                  {userAchievement.progress || 0} / {userAchievement.progressMax || 1}
                                </span>
                              </div>
                              <Progress 
                                value={((userAchievement.progress || 0) / (userAchievement.progressMax || 1)) * 100} 
                                className="h-2"
                              />
                            </div>
                            <div className="flex items-center justify-between mt-3">
                              <Badge variant="outline" className="border-blue-300 text-blue-800">
                                {userAchievement.achievement?.rarity || 'common'}
                              </Badge>
                              <span className="text-sm font-semibold text-blue-900">
                                +{userAchievement.achievement?.points || 0} pts
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Empty State */}
            {(!(achievements as any)?.unlocked || (achievements as any)?.unlocked?.length === 0) && (
              <Card className="text-center py-8">
                <CardContent>
                  <Trophy className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No badges unlocked yet</h3>
                  <p className="text-gray-500 mb-4">Complete missions and activities to earn your first badges!</p>
                  <Button onClick={() => setActiveTab("missions")}>
                    View Missions
                  </Button>
                </CardContent>
              </Card>
            )}

            {(!(achievements as any)?.inProgress || (achievements as any)?.inProgress?.length === 0) && (
              <Card className="text-center py-8">
                <CardContent>
                  <Target className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No badges in progress</h3>
                  <p className="text-gray-500 mb-4">Start completing activities to work towards new badges!</p>
                  <Button onClick={() => setActiveTab("badges")}>
                    View All Badges
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Missions Tab */}
          <TabsContent value="missions" className="space-y-6">
            {/* Daily Missions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-orange-500" />
                  Daily Missions
                </CardTitle>
                <CardDescription>Reset every day at midnight</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(missions as any)?.filter?.((m: any) => m.type === 'daily')?.map?.((mission: any) => (
                    <div key={mission.id} className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900">{mission.name}</h4>
                          <p className="text-sm text-gray-600">{mission.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-orange-600">+{mission.pointsReward}</div>
                          <div className="text-sm text-gray-500">points</div>
                        </div>
                      </div>
                    </div>
                  )) || []}
                  
                  {/* Default daily missions if none from DB */}
                  <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">Daily Check-in</h4>
                        <p className="text-sm text-gray-600">Visit the app and check in for the day</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-orange-600">+5</div>
                        <div className="text-sm text-gray-500">points</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Weekly Missions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  Weekly Missions
                </CardTitle>
                <CardDescription>Reset every Monday</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(missions as any)?.filter?.((m: any) => m.type === 'weekly')?.map?.((mission: any) => (
                    <div key={mission.id} className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900">{mission.name}</h4>
                          <p className="text-sm text-gray-600">{mission.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-blue-600">+{mission.pointsReward}</div>
                          <div className="text-sm text-gray-500">points</div>
                        </div>
                      </div>
                    </div>
                  )) || []}
                  
                  {/* Default weekly missions if none from DB */}
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">Write 3 Reviews</h4>
                        <p className="text-sm text-gray-600">Share your travel experiences with others</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">+100</div>
                        <div className="text-sm text-gray-500">points</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Badges Tab */}
          <TabsContent value="badges" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Category: Travel */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MapPin className="w-5 h-5 text-green-500" />
                    Travel Badges
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(achievements as any)?.unlocked?.filter?.((ua: any) => ua.achievement?.category === 'travel')?.map?.((userAchievement: any) => (
                    <div key={userAchievement.id} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <div className="font-semibold text-green-900">{userAchievement.achievement.name}</div>
                        <div className="text-sm text-green-700">+{userAchievement.achievement.points} pts</div>
                      </div>
                    </div>
                  )) || []}
                  
                  {(achievements as any)?.inProgress?.filter?.((ua: any) => ua.achievement?.category === 'travel')?.map?.((userAchievement: any) => (
                    <div key={userAchievement.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <Target className="w-5 h-5 text-gray-600" />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{userAchievement.achievement.name}</div>
                        <div className="text-sm text-gray-700">
                          {userAchievement.progress} / {userAchievement.progressMax}
                        </div>
                        <Progress value={((userAchievement.progress || 0) / (userAchievement.progressMax || 1)) * 100} className="h-1 mt-1" />
                      </div>
                    </div>
                  )) || []}
                  
                  {/* Default badges if none from DB */}
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <Target className="w-5 h-5 text-gray-600" />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">First Trip</div>
                      <div className="text-sm text-gray-700">Plan your first trip</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Category: Social */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="w-5 h-5 text-blue-500" />
                    Social Badges
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <Target className="w-5 h-5 text-gray-600" />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">Helpful Reviewer</div>
                      <div className="text-sm text-gray-700">Write 5 helpful reviews</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Category: Exploration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Star className="w-5 h-5 text-purple-500" />
                    Explorer Badges
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <Target className="w-5 h-5 text-gray-600" />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">Photo Explorer</div>
                      <div className="text-sm text-gray-700">Upload 10 photos</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-orange-500" />
                  Top Travelers (Last 30 Days)
                </CardTitle>
                <CardDescription>See how you rank among other travelers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(leaderboard as any)?.map?.((entry: any, index: number) => (
                    <div key={entry.userId} className={`flex items-center gap-4 p-4 rounded-lg border ${
                      index === 0 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' :
                      index === 1 ? 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200' :
                      index === 2 ? 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200' :
                      'bg-white border-gray-200'
                    }`}>
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                        index === 0 ? 'bg-yellow-400 text-yellow-900' :
                        index === 1 ? 'bg-gray-400 text-gray-900' :
                        index === 2 ? 'bg-orange-400 text-orange-900' :
                        'bg-gray-200 text-gray-700'
                      }`}>
                        {index < 3 ? ['🥇', '🥈', '🥉'][index] : entry.rank}
                      </div>
                      
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">
                          {entry.user?.firstName && entry.user?.lastName 
                            ? `${entry.user.firstName} ${entry.user.lastName}`
                            : entry.user?.email?.split('@')[0] || 'Anonymous User'
                          }
                        </div>
                        <div className="text-sm text-gray-600">Level {calculateLevel(entry.totalPoints)} • {getLevelName(calculateLevel(entry.totalPoints))}</div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">{entry.totalPoints.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">points</div>
                      </div>
                    </div>
                  )) || []}
                  
                  {/* Empty state */}
                  {!(leaderboard as any)?.length && (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                      <p>No leaderboard data available yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  Points History
                </CardTitle>
                <CardDescription>Your recent point-earning activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(pointsHistory as any)?.map?.((entry: any) => (
                    <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div>
                        <div className="font-semibold text-gray-900">{entry.description || entry.action}</div>
                        <div className="text-sm text-gray-600">
                          {new Date(entry.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                      <div className={`text-lg font-bold ${entry.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {entry.points > 0 ? '+' : ''}{entry.points}
                      </div>
                    </div>
                  )) || []}
                  
                  {/* Empty state */}
                  {!(pointsHistory as any)?.length && (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                      <p>No activity history yet</p>
                      <p className="text-sm">Start earning points to see your history!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}