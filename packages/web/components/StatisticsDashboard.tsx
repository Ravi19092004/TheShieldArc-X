import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Shield, Users, Globe, Trophy, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";

export const StatisticsDashboard = () => {
  const [gamificationStats, setGamificationStats] = useState({ totalPoints: 0, achievements: 0 });

  useEffect(() => {
    // Fetch gamification stats for authenticated users
    const fetchGamificationStats = async () => {
      try {
        const response = await fetch('/api/gamification');
        if (response.ok) {
          const data = await response.json();
          setGamificationStats({
            totalPoints: data.totalPoints || 0,
            achievements: data.achievements?.length || 0
          });
        }
      } catch (error) {
        console.error('Failed to fetch gamification stats:', error);
      }
    };
    fetchGamificationStats();
  }, []);

  const stats = [
    {
      icon: TrendingUp,
      value: "2.3M",
      label: "Sites Scanned Today",
      change: "+12%",
    },
    {
      icon: Shield,
      value: "847K",
      label: "Phishing Attempts Blocked",
      change: "+8%",
    },
    {
      icon: Users,
      value: "67K",
      label: "Active Users",
      change: "+15%",
    },
    {
      icon: Globe,
      value: "195",
      label: "Countries Protected",
      change: "+3",
    },
    {
      icon: Trophy,
      value: gamificationStats.totalPoints.toString(),
      label: "Total Gamification Points",
      change: "Earned today",
    },
    {
      icon: AlertTriangle,
      value: gamificationStats.achievements.toString(),
      label: "Achievements Unlocked",
      change: "This week",
    },
  ];

  return (
    <section id="statistics" className="container mx-auto px-4 py-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Real-Time Protection Metrics</h2>
          <p className="text-lg text-muted-foreground">
            Live statistics showing our global impact against cyber threats
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-glow-cyan"
            >
              <CardContent className="p-6 text-center">
                <stat.icon className="w-12 h-12 text-primary mx-auto mb-4" />
                <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground mb-2">{stat.label}</div>
                <div className="text-xs text-green-500 font-medium">{stat.change} from yesterday</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            * Statistics update every 5 minutes
          </p>
        </div>
      </div>
    </section>
  );
};
