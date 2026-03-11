"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

import { Trophy, Star, Target, Award, Users, Flame, Calendar, Zap, Shield } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface Achievement {
  type: string;
  title: string;
  description: string;
  points: number;
  earnedAt: string;
}

interface UserStats {
  totalPoints: number;
  achievements: Achievement[];
  rank: string;
  nextMilestone: number;
}

export const GamificationDashboard: React.FC = () => {
  const { data: session } = useSession();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchAchievements();
    }
  }, [session]);

  const fetchAchievements = async () => {
    try {
      const response = await fetch('/api/gamification');
      if (response.ok) {
        const data = await response.json();
        setStats({
          totalPoints: data.totalPoints,
          achievements: data.achievements,
          rank: `Rank ${data.rank}`,
          nextMilestone: data.nextMilestone
        });
      }
    } catch (error) {
      console.error('Failed to fetch achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="text-center">
            <LoadingSpinner size={64} className="mb-4" />
            <p className="text-muted-foreground">Unlocking your security milestones...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            No achievements data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const progressToNext = (stats.totalPoints / stats.nextMilestone) * 100;

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-full">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalPoints}</p>
                <p className="text-sm text-muted-foreground">Total Points</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Trophy className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.achievements.length}</p>
                <p className="text-sm text-muted-foreground">Achievements</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.rank}</p>
                <p className="text-sm text-muted-foreground">Current Rank</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress to Next Milestone */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Progress to Next Rank
          </CardTitle>
          <CardDescription>
            Earn {stats.nextMilestone - stats.totalPoints} more points to reach the next level
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={Math.min(progressToNext, 100)} className="w-full" />
          <div className="flex justify-between text-sm text-muted-foreground mt-2">
            <span>{stats.totalPoints} points</span>
            <span>{stats.nextMilestone} points</span>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different views */}
      <Tabs defaultValue="achievements" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
        </TabsList>

        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Your Achievements
              </CardTitle>
              <CardDescription>
                Badges and milestones you&apos;ve earned
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats.achievements.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No achievements yet. Start scanning to earn your first badge!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {stats.achievements.map((achievement, index) => (
                    <Card key={index} className="border-l-4 border-l-primary">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="default">
                                {achievement.type}
                              </Badge>
                              <span className="text-sm font-medium text-primary">
                                +{achievement.points} pts
                              </span>
                            </div>
                            <h3 className="font-medium mb-1">{achievement.title}</h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              {achievement.description}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Earned {new Date(achievement.earnedAt).toLocaleDateString('en-IN')}
                            </p>
                          </div>
                          <div className="p-2 bg-primary/10 rounded-full">
                            <Award className="w-5 h-5 text-primary" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Global Leaderboard
              </CardTitle>
              <CardDescription>
                Top security champions this month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Mock leaderboard data - in real implementation, fetch from API */}
                {[
                  { rank: 1, name: "SecurityMaster", points: 2450, avatar: "SM" },
                  { rank: 2, name: "CyberGuard", points: 2230, avatar: "CG" },
                  { rank: 3, name: "PhishHunter", points: 1980, avatar: "PH" },
                  { rank: 4, name: "DataShield", points: 1750, avatar: "DS" },
                  { rank: 5, name: "PrivacyPro", points: 1620, avatar: "PP" },
                ].map((user, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full text-sm font-bold">
                        {user.rank}
                      </div>
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {user.avatar}
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.points} points</p>
                      </div>
                    </div>
                    {user.rank <= 3 && (
                      <div className="flex items-center gap-1">
                        {user.rank === 1 && <Trophy className="w-4 h-4 text-yellow-500" />}
                        {user.rank === 2 && <Award className="w-4 h-4 text-gray-400" />}
                        {user.rank === 3 && <Award className="w-4 h-4 text-amber-600" />}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="challenges" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="w-5 h-5" />
                Daily Challenges
              </CardTitle>
              <CardDescription>
                Complete challenges to earn bonus points and unlock achievements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    title: "Scan 5 URLs",
                    description: "Perform 5 security scans today",
                    progress: 3,
                    total: 5,
                    points: 50,
                    icon: Shield
                  },
                  {
                    title: "Weekly Streak",
                    description: "Scan URLs for 7 consecutive days",
                    progress: 4,
                    total: 7,
                    points: 100,
                    icon: Calendar
                  },
                  {
                    title: "Threat Hunter",
                    description: "Detect 3 phishing attempts",
                    progress: 1,
                    total: 3,
                    points: 75,
                    icon: Target
                  },
                  {
                    title: "Privacy Guardian",
                    description: "Review 10 privacy scores",
                    progress: 7,
                    total: 10,
                    points: 60,
                    icon: Zap
                  }
                ].map((challenge, index) => {
                  const Icon = challenge.icon;
                  const progressPercent = (challenge.progress / challenge.total) * 100;
                  return (
                    <Card key={index} className="border-l-4 border-l-orange-500">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Icon className="w-4 h-4 text-orange-500" />
                              <h3 className="font-medium">{challenge.title}</h3>
                              <Badge variant="outline" className="text-xs">
                                +{challenge.points} pts
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {challenge.description}
                            </p>
                            <div className="space-y-2">
                              <Progress value={progressPercent} className="w-full h-2" />
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>{challenge.progress}/{challenge.total} completed</span>
                                <span>{Math.round(progressPercent)}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
