"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, ExternalLink, RefreshCw, Search, Download, TrendingUp, Filter, Wifi, WifiOff } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ThreatFeedItem {
  source: string;
  title: string;
  url: string;
  severity: string;
  publishedAt: string;
}

export const ThreatIntelligenceFeed: React.FC = () => {
  const [threats, setThreats] = useState<ThreatFeedItem[]>([]);
  const [filteredThreats, setFilteredThreats] = useState<ThreatFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [isRealtimeEnabled, setIsRealtimeEnabled] = useState(true); // Enabled by default
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const fetchThreatFeeds = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/threat-feeds');
      if (!response.ok) throw new Error('Failed to fetch threat feeds');
      const data = await response.json();
      setThreats(data.feeds || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to load threat feeds');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThreatFeeds();
  }, []);

  // WebSocket for realtime updates
  useEffect(() => {
    // Use a NEXT_PUBLIC_ environment variable to control this in the browser.
    // This will be 'true' only when you run `npm run dev`.
    const isDevEnvironment = process.env.NEXT_PUBLIC_NODE_ENV === 'development';
    if (isRealtimeEnabled && isDevEnvironment) {
      const ws = new WebSocket('ws://localhost:3001'); // Connect to the root of the extension server
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Connected to threat feeds websocket');
      };

      ws.onmessage = (event: MessageEvent) => {
        try {
          const newThreat = JSON.parse(event.data);
          setThreats(prev => [newThreat, ...prev.slice(0, 19)]); // Keep only 20 items
          setLastUpdate(new Date());
        } catch (error) {
          console.error('Error parsing websocket message:', error);
        }
      };

      ws.onclose = () => {
        console.log('Disconnected from threat feeds websocket');
        setIsRealtimeEnabled(false);
      };

      ws.onerror = (error) => {
        console.error('WebSocket connection failed:', error);
        setIsRealtimeEnabled(false);
        // Optionally show a user-friendly message
        // toast.error('Realtime updates unavailable. Please check your connection.');
      };

      return () => {
        ws.close();
      };
    } else {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      return undefined;
    }
  }, [isRealtimeEnabled]);

  // Filter threats based on search and filters
  useEffect(() => {
    let filtered = threats;

    if (searchTerm) {
      filtered = filtered.filter(threat =>
        threat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        threat.source.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (severityFilter !== 'all') {
      filtered = filtered.filter(threat =>
        threat.severity.toLowerCase() === severityFilter.toLowerCase()
      );
    }

    if (sourceFilter !== 'all') {
      filtered = filtered.filter(threat =>
        threat.source.toLowerCase() === sourceFilter.toLowerCase()
      );
    }

    setFilteredThreats(filtered);
  }, [threats, searchTerm, severityFilter, sourceFilter]);

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'bg-gradient-to-r from-red-500 to-red-600 text-white';
      case 'high': return 'bg-gradient-to-r from-orange-500 to-orange-600 text-white';
      case 'medium': return 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-800 font-semibold';
      case 'low': return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white';
    }
  };

  const getBorderColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'border-l-red-500';
      case 'high': return 'border-l-orange-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-blue-500';
      default: return 'border-l-gray-500';
    }
  };

  const exportToPDF = async () => {
    try {
      const response = await fetch('/api/threat-feeds/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threats: filteredThreats }),
      });

      if (!response.ok) throw new Error('Failed to export PDF');

      const pdfBlob = await response.blob();
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `threat-intelligence-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF report');
    }
  };

  const uniqueSources = [...new Set(threats.map(t => t.source))];
  const severityCounts = threats.reduce((acc, threat) => {
    acc[threat.severity] = (acc[threat.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-card border-border shadow-glow-red">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-red-500" />
                Threat Intelligence Feed
                {isRealtimeEnabled ? (
                  <Wifi className="w-4 h-4 text-green-500" />
                ) : (
                  <WifiOff className="w-4 h-4 text-gray-400" />
                )}
              </CardTitle>
              <CardDescription>
                Live global threat intelligence from community sources
                {isRealtimeEnabled && lastUpdate && (
                  <span className="text-green-600 font-medium">
                    • Realtime updates active
                  </span>
                )}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsRealtimeEnabled(!isRealtimeEnabled)}
                className={isRealtimeEnabled ? 'bg-green-900/50 border-green-700 text-green-300 hover:bg-green-900/70' : ''}
              >
                {isRealtimeEnabled ? (
                  <Wifi className="w-4 h-4 mr-2" />
                ) : (
                  <WifiOff className="w-4 h-4 mr-2" />
                )}
                {isRealtimeEnabled ? 'Disable' : 'Enable'} Realtime
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportToPDF}
                disabled={loading || filteredThreats.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchThreatFeeds}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search threats..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                {uniqueSources.map(source => (
                  <SelectItem key={source} value={source.toLowerCase()}>
                    {source}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Threat Statistics and Trend Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['critical', 'high', 'medium', 'low'].map((severity) => (
            <Card key={severity} className="text-center bg-card/50">
              <CardContent className="pt-4">
                <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${getSeverityColor(severity)} mb-2`}>
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="text-2xl font-bold">{severityCounts[severity] || 0}</div>
                <div className="text-sm text-muted-foreground capitalize">{severity}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Threat Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={Object.entries(severityCounts).map(([severity, count]) => ({ name: severity, count }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                <XAxis dataKey="name" tick={{ fill: '#a1a1aa' }} />
                <YAxis tick={{ fill: '#a1a1aa' }} />
                <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46' }} />
                <Bar dataKey="count" fill="#f97316" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Threat Feed */}
      <Card>
        <CardContent className="pt-6">
          {error && (
            <div className="text-center py-8 text-red-500">
              {error}
            </div>
          )}

          {loading && threats.length === 0 && (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
              Loading threat feeds...
            </div>
          )}

          {!loading && filteredThreats.length === 0 && !error && (
            <div className="text-center py-8 text-muted-foreground">
              {threats.length === 0 ? 'No threat feeds available at the moment.' : 'No threats match your filters.'}
            </div>
          )}

          <div className="space-y-4">
            {filteredThreats.map((threat, index) => (
              <Card key={index} className={`border-l-4 ${getBorderColor(threat.severity)} hover:bg-muted/50 transition-colors`}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getSeverityColor(threat.severity)}>
                          {threat.severity}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {threat.source}
                        </span>
                      </div>
                      <h3 className="font-medium mb-2">{threat.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(threat.publishedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                    >
                      <a
                        href={threat.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
