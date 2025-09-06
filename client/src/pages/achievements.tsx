import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  const names = ["מטיין", "חוקר", "נוודן", "מומחה טיולים", "גלוברוטר"];
  return names[level - 1] || "גלוברוטר";
};

export default function Achievements() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch user points summary
  const { data: pointsSummary, isLoading: pointsLoading } = useQuery({
    queryKey: ["/api/rewards/summary"],
    enabled: !!user,
  });

  // Fetch achievements
  const { data: achievements, isLoading: achievementsLoading } = useQuery({
    queryKey: ["/api/achievements"],
    enabled: !!user,
  });

  // Fetch missions
  const { data: missions, isLoading: missionsLoading } = useQuery({
    queryKey: ["/api/missions"],
    enabled: !!user,
  });

  // Fetch leaderboard
  const { data: leaderboard, isLoading: leaderboardLoading } = useQuery({
    queryKey: ["/api/rewards/leaderboard"],
    enabled: !!user,
  });

  // Fetch points history
  const { data: pointsHistory, isLoading: historyLoading } = useQuery({
    queryKey: ["/api/rewards/history"],
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-center">נדרש להתחבר</CardTitle>
            <CardDescription className="text-center">
              התחבר כדי לצפות בהישגים ובנקודות שלך
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}>
              התחבר עם Google
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalPoints = pointsSummary?.totalPoints || 0;
  const currentLevel = calculateLevel(totalPoints);
  const pointsToNext = getPointsToNextLevel(totalPoints);
  const levelName = getLevelName(currentLevel);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <Trophy className="w-6 h-6 text-yellow-600" />
            <h1 className="text-2xl font-bold">הישגים ונקודות</h1>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <span>בית</span>
            <ChevronRight className="w-4 h-4" />
            <span>הישגים</span>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">סקירה</TabsTrigger>
            <TabsTrigger value="missions">משימות</TabsTrigger>
            <TabsTrigger value="badges">באדג'ים</TabsTrigger>
            <TabsTrigger value="leaderboard">דירוג</TabsTrigger>
            <TabsTrigger value="history">היסטוריה</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* My Balance Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Crown className="w-5 h-5 text-yellow-600" />
                  <span>היתרה שלי</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{totalPoints.toLocaleString()}</div>
                    <div className="text-gray-600">נקודות כולל</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">רמה {currentLevel}</div>
                    <div className="text-gray-600">{levelName}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-600">{pointsToNext > 0 ? pointsToNext : "MAX"}</div>
                    <div className="text-gray-600">לרמה הבאה</div>
                  </div>
                </div>
                {currentLevel < 5 && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>התקדמות לרמה {currentLevel + 1}</span>
                      <span>{Math.round(((totalPoints - [0, 100, 300, 700, 1500][currentLevel - 1]) / ([100, 300, 700, 1500, Infinity][currentLevel - 1] - [0, 100, 300, 700, 1500][currentLevel - 1])) * 100)}%</span>
                    </div>
                    <Progress 
                      value={((totalPoints - [0, 100, 300, 700, 1500][currentLevel - 1]) / ([100, 300, 700, 1500, Infinity][currentLevel - 1] - [0, 100, 300, 700, 1500][currentLevel - 1])) * 100} 
                      className="h-2"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Unlocked Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Medal className="w-5 h-5 text-yellow-600" />
                  <span>הישגים שנפתחו</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements?.filter((ach: any) => ach.isCompleted)?.map((achievement: any) => (
                    <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <Award className="w-8 h-8 text-yellow-600" />
                      <div>
                        <div className="font-semibold">{achievement.name}</div>
                        <div className="text-sm text-gray-600">{achievement.description}</div>
                        <div className="text-xs text-green-600">+{achievement.points} נקודות</div>
                      </div>
                    </div>
                  )) || []}
                </div>
                {(!achievements?.some((ach: any) => ach.isCompleted)) && (
                  <div className="text-center py-8 text-gray-500">
                    <Trophy className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>עדיין לא השגת הישגים</p>
                    <p className="text-sm">התחל לפעול כדי לפתוח הישגים!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Active Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <span>התקדמות פעילה</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {achievements?.filter((ach: any) => !ach.isCompleted && ach.progress > 0)?.map((achievement: any) => (
                    <div key={achievement.id} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <div className="font-semibold">{achievement.name}</div>
                        <div className="text-sm text-blue-600">{achievement.progress}/{achievement.progressMax}</div>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">{achievement.description}</div>
                      <Progress value={(achievement.progress / achievement.progressMax) * 100} className="h-2" />
                    </div>
                  )) || []}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-orange-600" />
                  <span>פעולות מהירות</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button className="h-20 flex-col space-y-2" variant="outline">
                    <MessageSquare className="w-6 h-6" />
                    <span>כתוב ביקורת (+50)</span>
                  </Button>
                  <Button className="h-20 flex-col space-y-2" variant="outline">
                    <Camera className="w-6 h-6" />
                    <span>העלה תמונה (+10)</span>
                  </Button>
                  <Button className="h-20 flex-col space-y-2" variant="outline">
                    <MapPin className="w-6 h-6" />
                    <span>שתף מסלול (+20)</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Missions Tab */}
          <TabsContent value="missions" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Daily Missions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-green-600" />
                    <span>משימות יומיות</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {missions?.filter((m: any) => m.type === 'daily')?.map((mission: any) => (
                      <div key={mission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">{mission.nameHe || mission.name}</div>
                          <div className="text-sm text-gray-600">{mission.descriptionHe || mission.description}</div>
                          <div className="text-sm text-green-600">+{mission.pointsReward} נקודות</div>
                        </div>
                        {mission.isCompleted ? (
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        ) : (
                          <div className="text-sm text-gray-500">{mission.currentCount || 0}/{mission.targetCount}</div>
                        )}
                      </div>
                    )) || []}
                  </div>
                </CardContent>
              </Card>

              {/* Weekly Missions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <span>משימות שבועיות</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {missions?.filter((m: any) => m.type === 'weekly')?.map((mission: any) => (
                      <div key={mission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">{mission.nameHe || mission.name}</div>
                          <div className="text-sm text-gray-600">{mission.descriptionHe || mission.description}</div>
                          <div className="text-sm text-blue-600">+{mission.pointsReward} נקודות</div>
                        </div>
                        {mission.isCompleted ? (
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        ) : (
                          <div className="text-sm text-gray-500">{mission.currentCount || 0}/{mission.targetCount}</div>
                        )}
                      </div>
                    )) || []}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Badges Tab */}
          <TabsContent value="badges" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-purple-600" />
                  <span>קטלוג הישגים</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements?.map((achievement: any) => (
                    <div key={achievement.id} className={`p-4 border rounded-lg ${achievement.isCompleted ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-center space-x-3 mb-3">
                        <Award className={`w-8 h-8 ${achievement.isCompleted ? 'text-yellow-600' : 'text-gray-400'}`} />
                        <div>
                          <div className="font-semibold">{achievement.name}</div>
                          <Badge variant={achievement.rarity === 'legendary' ? 'destructive' : achievement.rarity === 'epic' ? 'default' : 'secondary'}>
                            {achievement.rarity === 'common' ? 'רגיל' : achievement.rarity === 'rare' ? 'נדיר' : achievement.rarity === 'epic' ? 'אפי' : 'אגדי'}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                      <div className="text-xs text-blue-600">+{achievement.points} נקודות</div>
                      {!achievement.isCompleted && (
                        <div className="mt-2">
                          <Progress value={(achievement.progress / achievement.progressMax) * 100} className="h-2" />
                          <div className="text-xs text-gray-500 mt-1">{achievement.progress}/{achievement.progressMax}</div>
                        </div>
                      )}
                    </div>
                  )) || []}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-orange-600" />
                  <span>טופ 10 ב-30 הימים האחרונים</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaderboard?.map((user: any, index: number) => (
                    <div key={user.id} className={`flex items-center space-x-4 p-3 rounded-lg ${index < 3 ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-400' : 'bg-gray-300'}`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{user.firstName} {user.lastName}</div>
                        <div className="text-sm text-gray-600">רמה {calculateLevel(user.totalPoints)} • {getLevelName(calculateLevel(user.totalPoints))}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{user.totalPoints.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">נקודות</div>
                      </div>
                    </div>
                  )) || []}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-gray-600" />
                  <span>היסטוריית נקודות</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pointsHistory?.map((entry: any) => (
                    <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${entry.points > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          {entry.points > 0 ? <Plus className="w-4 h-4" /> : <span>-</span>}
                        </div>
                        <div>
                          <div className="font-medium">{entry.description}</div>
                          <div className="text-sm text-gray-600">{new Date(entry.createdAt).toLocaleDateString('he-IL')}</div>
                        </div>
                      </div>
                      <div className={`font-bold ${entry.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {entry.points > 0 ? '+' : ''}{entry.points}
                      </div>
                    </div>
                  )) || []}
                </div>
                {(!pointsHistory || pointsHistory.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>עדיין אין פעילות נקודות</p>
                    <p className="text-sm">התחל לפעול כדי לצבור נקודות!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}