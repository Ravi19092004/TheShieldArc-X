"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Shield, Eye, Cookie, Search, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface PrivacyScore {
  id: string;
  url: string;
  domain: string;
  score: number;
  trackers: string[];
  cookies: string[];
  lastScannedAt: string;
  nextScanAt?: string;
}

export const SitePrivacyScore: React.FC = () => {
  const { data: session } = useSession();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentScore, setCurrentScore] = useState<PrivacyScore | null>(null);
  const [recentScans, setRecentScans] = useState<PrivacyScore[]>([]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchRecentScans();
    }
  }, [session]);

  const fetchRecentScans = async () => {
    try {
      const response = await fetch('/api/privacy-scores');
      if (response.ok) {
        const data = await response.json();
        setRecentScans(data);
      }
    } catch (error) {
      console.error('Failed to fetch recent scans:', error);
    }
  };

  const analyzePrivacy = async () => {
    if (!url.trim()) {
      alert('Please enter a URL to analyze');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/privacy-scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (response.ok) {
        const result = await response.json();
        setCurrentScore(result);
        await fetchRecentScans(); // Refresh the list
      } else {
        alert('Failed to analyze privacy score');
      }
    } catch (error) {
      console.error('Error analyzing privacy:', error);
      alert('Error analyzing privacy score');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-yellow-50 border-yellow-200';
    if (score >= 40) return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="w-6 h-6 text-green-500" />;
    if (score >= 60) return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
    return <XCircle className="w-6 h-6 text-red-500" />;
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent Privacy';
    if (score >= 60) return 'Good Privacy';
    if (score >= 40) return 'Fair Privacy';
    return 'Poor Privacy';
  };

  const getCookieTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'essential': return 'bg-blue-100 text-blue-800';
      case 'analytics': return 'bg-purple-100 text-purple-800';
      case 'marketing': return 'bg-red-100 text-red-800';
      case 'functional': return 'bg-green-100 text-green-800';
      case 'third-party': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-500" />
                Site Privacy Score
              </CardTitle>
              <CardDescription>
                Analyze website privacy practices and track data collection
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* URL Input */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                type="url"
                placeholder="Enter website URL (e.g., https://example.com)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && analyzePrivacy()}
              />
            </div>
            <Button onClick={analyzePrivacy} disabled={loading}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Analyze
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Score Display */}
      {currentScore && (
        <Card className={getScoreBgColor(currentScore.score)}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getScoreIcon(currentScore.score)}
                <div>
                  <CardTitle className={`text-xl ${getScoreColor(currentScore.score)}`}>
                    Privacy Score: {currentScore.score}/100
                  </CardTitle>
                  <CardDescription>{getScoreLabel(currentScore.score)}</CardDescription>
                </div>
              </div>
              <Badge variant="outline">{currentScore.domain}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Privacy Rating</span>
                <span>{currentScore.score}%</span>
              </div>
              <Progress value={currentScore.score} className="h-2" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Trackers */}
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Trackers Detected ({currentScore.trackers.length})
                </h4>
                {currentScore.trackers.length > 0 ? (
                  <div className="space-y-1">
                    {currentScore.trackers.slice(0, 5).map((tracker, index) => (
                      <Badge key={index} variant="secondary" className="mr-1 mb-1">
                        {tracker}
                      </Badge>
                    ))}
                    {currentScore.trackers.length > 5 && (
                      <Badge variant="outline">+{currentScore.trackers.length - 5} more</Badge>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No trackers detected</p>
                )}
              </div>

              {/* Cookies */}
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Cookie className="w-4 h-4" />
                  Cookies ({currentScore.cookies.length})
                </h4>
                {currentScore.cookies.length > 0 ? (
                  <div className="space-y-1">
                    {currentScore.cookies.slice(0, 5).map((cookie, index) => (
                      <Badge key={index} className={getCookieTypeColor(cookie)}>
                        {cookie}
                      </Badge>
                    ))}
                    {currentScore.cookies.length > 5 && (
                      <Badge variant="outline">+{currentScore.cookies.length - 5} more</Badge>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No cookies detected</p>
                )}
              </div>
            </div>

            <div className="text-xs text-muted-foreground pt-2 border-t">
              Last scanned: {new Date(currentScore.lastScannedAt).toLocaleString('en-IN')}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Scans */}
      {recentScans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Privacy Scans</CardTitle>
            <CardDescription>Your recent website privacy analyses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentScans.slice(0, 10).map((scan) => (
                <div
                  key={scan.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => setCurrentScore(scan)}
                >
                  <div className="flex items-center gap-3">
                    {getScoreIcon(scan.score)}
                    <div>
                      <p className="font-medium">{scan.domain}</p>
                      <p className="text-sm text-muted-foreground">
                        {scan.trackers.length} trackers, {scan.cookies.length} cookies
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${getScoreColor(scan.score)}`}>
                      {scan.score}/100
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(scan.lastScannedAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!currentScore && recentScans.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Enter a website URL above to analyze its privacy practices.</p>
              <p className="text-sm">We&apos;ll check for trackers, cookies, and data collection practices.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
