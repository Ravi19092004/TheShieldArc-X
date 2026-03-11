"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lightbulb, TrendingUp, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

interface Insight {
  id: string;
  type: 'security' | 'behavior' | 'trend' | 'recommendation';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
  createdAt: string;
}

export const PersonalizedInsights: React.FC = () => {
  const { data: session } = useSession();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/insights');
      if (!response.ok) throw new Error('Failed to fetch insights');
      const data = await response.json();
      setInsights(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load insights');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchInsights();
    }
  }, [session]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'security': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'behavior': return <TrendingUp className="w-5 h-5 text-blue-500" />;
      case 'trend': return <TrendingUp className="w-5 h-5 text-purple-500" />;
      case 'recommendation': return <Lightbulb className="w-5 h-5 text-yellow-500" />;
      default: return <Lightbulb className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'security': return 'border-red-500';
      case 'behavior': return 'border-blue-500';
      case 'trend': return 'border-purple-500';
      case 'recommendation': return 'border-yellow-500';
      default: return 'border-gray-500';
    }
  };

  const handleTakeAction = (insight: Insight) => {
    toast.info(`Action required for: "${insight.title}"`, { description: 'This feature is in development. In the future, this will guide you to the appropriate page.' });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              AI-Powered Insights
            </CardTitle>
            <CardDescription>
              Personalized security recommendations based on your browsing habits
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchInsights}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="text-center py-8 text-red-500">
            {error}
          </div>
        )}

        {loading && insights.length === 0 && (
          <div className="text-center py-8">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />Analyzing your security posture...
          </div>
        )}

        {!loading && insights.length === 0 && !error && (
          <div className="text-center py-8 text-muted-foreground">
            No insights available at the moment. Continue using the extension to generate personalized recommendations.
          </div>
        )}

        <div className="space-y-4">
          {insights.map((insight) => (
            <Card
              key={insight.id}
              className={`border-l-4 ${getTypeColor(insight.type)}`}
            >
              <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getTypeIcon(insight.type)}
                      <Badge variant={getPriorityColor(insight.priority)}>
                        {insight.priority} priority
                      </Badge>
                      {insight.actionable && (
                        <Badge variant="outline" className="text-green-600">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Actionable
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-medium mb-2 text-gray-100">{insight.title}</h3>
                    <p className="text-sm text-gray-300 mb-2">
                      {insight.description}
                    </p>
                    <p className="text-xs text-gray-400">
                      Generated {new Date(insight.createdAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  {insight.actionable && (
                    <Button
                      variant="secondary"
                      size="sm" onClick={() => handleTakeAction(insight)}
                      className="bg-cyan-900/50 text-cyan-300 hover:bg-cyan-900/80 border border-cyan-700">
                      Take Action
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card> 
  );
};
