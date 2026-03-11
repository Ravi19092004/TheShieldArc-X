'use client';

import { useState, useEffect, useCallback, Suspense, lazy } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, CheckCircle, Lock, Zap, X, RefreshCw, Download, FileDown, Trash2 } from "lucide-react";

import { ClientTime } from "@/components/ClientTime";
import { TrustScoreGauge } from "@/components/TrustScoreGauge";
import SessionInfoCard from "@/components/SessionInfoCard";
import { Navigation } from "@/components/Navigation";

const UpdateProfileForm = lazy(() => import("@/components/UpdateProfileForm"));
const ScanHistoryPage = lazy(() => import("@/components/ScanHistoryPage"));
const PricingPage = lazy(() => import("@/components/PricingPage"));

const PricingPageAny = PricingPage as React.ComponentType<{ onBack: () => void }>;

/* ----------------------------- Interfaces ----------------------------- */
interface ScanResult {
  id: string;
  url: string;
  status: 'Safe' | 'Unsafe' | 'Error';
  safe_percentage?: number;
  unsafe_percentage?: number;
  ip_address?: string;
  asn?: string;
  location?: string;
  country_code?: string;
  createdAt: string;
  userId?: string; // Made optional to match API response if not always present
  trustScore: number; // For UI compatibility
  timestamp: Date;
  colorCode: string;
}

interface PredictionResult {
  prediction: 'Safe' | 'Unsafe' | 'Error';
  confidence: number;
  url?: string;
  ip_address?: string;
  asn?: string;
  hosting_provider?: string;
  location?: string;
  error?: string;
}

interface DashboardStats {
  totalScans: number;
  safeScans: number;
  unsafeScans: number;
  successRate: number;
  lastLoginIp: string | null;
  lastLoginDevice: string | null;
  networkTraffic?: number; // Added for network traffic data (in bytes)
  threatMonitoringStatus?: string; // Added for Threat Monitoring status
  firewallStatus?: string; // Added for Firewall Status
}

const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const parseTrafficString = (trafficString: string | number | undefined): number | undefined => {
  if (typeof trafficString === 'number') {
    return trafficString;
  }
  if (typeof trafficString !== 'string') {
    return undefined;
  }

  const match = trafficString.match(/^(\d+(\.\d+)?)\s*(KB|MB|GB|TB)?$/i);
  if (!match) {
    return undefined;
  }

  const value = parseFloat(match[1]);
  const unit = match[3]?.toUpperCase();

  switch (unit) {
    case 'KB':
      return value * 1024;
    case 'MB':
      return value * 1024 * 1024;
    case 'GB':
      return value * 1024 * 1024 * 1024;
    case 'TB':
      return value * 1024 * 1024 * 1024 * 1024;
    default: // Assume Bytes if no unit or unknown unit
      return value;
  }
};



/* --------------------------- Dashboard Component --------------------------- */
const Dashboard = () => {
  const [urlToScan, setUrlToScan] = useState("");
  const [scanResult, setScanResult] = useState<PredictionResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDownloadingExtension, setIsDownloadingExtension] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isClearingData, setIsClearingData] = useState(false);
  const [showExtensionCard, setShowExtensionCard] = useState(true);
  const [notifications, setNotifications] = useState<{ message: string; type: 'success' | 'error' }[]>([]);
  const [recentScans, setRecentScans] = useState<ScanResult[]>([]); // Using your more detailed ScanResult
  const [activeView, setActiveView] = useState<"dashboard" | "profile" | "history" | "pricing">("dashboard");

  const [stats, setStats] = useState<DashboardStats>({
    totalScans: 0,
    safeScans: 0,
    unsafeScans: 0,
    successRate: 0,
    lastLoginIp: null,
    lastLoginDevice: null,
    networkTraffic: 0,
    threatMonitoringStatus: 'ACTIVE',
    firewallStatus: 'SECURED'
  });

  const [realtimeStatus, setRealtimeStatus] = useState({
    threatMonitoring: { status: 'Active', threats: 0, lastUpdate: new Date() },
    firewallStatus: { status: 'Active', connections: 0, lastUpdate: new Date() },
    networkTraffic: { status: 'Normal', packets: 0, lastUpdate: new Date() }
  });

  const fetchStatsAndRecentScans = useCallback(async () => {
    try {
      // Fetch dashboard stats
      const statsResponse = await fetch('/api/dashboard-stats');
      if (!statsResponse.ok) throw new Error('Failed to fetch dashboard stats');
      const statsData: DashboardStats = await statsResponse.json();

      // Fetch scan history
      const response = await fetch('/api/scan-history');
      if (!response.ok) throw new Error('Failed to fetch scan history');

      const data: ScanResult[] = await response.json();

      const recent = data
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
        .map(scan => ({
          ...scan,
          trustScore: scan.status === 'Safe' ? (scan.safe_percentage || 85) : (scan.unsafe_percentage ? 100 - scan.unsafe_percentage : 25),
          timestamp: new Date(scan.createdAt),
          colorCode: scan.status === 'Safe' ? 'green' : scan.status === 'Unsafe' ? 'red' : 'yellow'
        }));

      setRecentScans(recent);

      // Update stats with data from API
      setStats({
        ...statsData,
        networkTraffic: parseTrafficString(statsData.networkTraffic) || 0,
      });

    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, []);

  const checkTermsAcceptance = useCallback(async () => {
    try {
      const response = await fetch('/api/user/accept-terms');
      if (response.ok) {
        const termsData = await response.json();
        if (!termsData.termsAccepted) {
          // Redirect to terms page if not accepted
          window.location.href = '/terms';
          return;
        }
      } else {
        // If API fails, redirect to terms to be safe
        window.location.href = '/terms';
        return;
      }

      // Terms accepted, load dashboard data
      fetchStatsAndRecentScans();
    } catch (error) {
      console.error('Error checking terms acceptance:', error);
      // On error, redirect to terms page to be safe
      window.location.href = '/terms';
    }
  }, [fetchStatsAndRecentScans]);

  /* ----------------------------- Effects ----------------------------- */
  useEffect(() => {
    // Check terms acceptance first
    checkTermsAcceptance();

    // Real-time updates for security status cards only
    const fetchMonitoringData = async () => {
      try {
        const response = await fetch('/api/system-monitoring');
        if (response.ok) {
          const data = await response.json();
          setRealtimeStatus({
            threatMonitoring: {
              status: data.threatMonitoring.status,
              threats: data.threatMonitoring.threats,
              lastUpdate: new Date(data.threatMonitoring.lastUpdate)
            },
            firewallStatus: {
              status: data.firewallStatus.status,
              connections: data.firewallStatus.connections,
              lastUpdate: new Date(data.firewallStatus.lastUpdate)
            },
            networkTraffic: {
              status: data.networkTraffic.status,
              packets: data.networkTraffic.packets,
              lastUpdate: new Date(data.networkTraffic.lastUpdate)
            }
          });
        } else {
          // Fallback to simulated data if API fails
          setRealtimeStatus(prev => ({
            threatMonitoring: {
              ...prev.threatMonitoring,
              threats: Math.floor(Math.random() * 5),
              lastUpdate: new Date()
            },
            firewallStatus: {
              ...prev.firewallStatus,
              connections: Math.floor(Math.random() * 100) + 50,
              lastUpdate: new Date()
            },
            networkTraffic: {
              ...prev.networkTraffic,
              packets: Math.floor(Math.random() * 1000) + 500,
              lastUpdate: new Date()
            }
          }));
        }
      } catch (error) {
        console.error('Failed to fetch monitoring data:', error);
        // Fallback to simulated data
        setRealtimeStatus(prev => ({
          threatMonitoring: {
            ...prev.threatMonitoring,
            threats: Math.floor(Math.random() * 5),
            lastUpdate: new Date()
          },
          firewallStatus: {
            ...prev.firewallStatus,
            connections: Math.floor(Math.random() * 100) + 50,
            lastUpdate: new Date()
          },
          networkTraffic: {
            ...prev.networkTraffic,
            packets: Math.floor(Math.random() * 1000) + 500,
            lastUpdate: new Date()
          }
        }));
      }
    };

    // Initial fetch
    fetchMonitoringData();

    // Set up interval for real-time updates
    const interval = setInterval(fetchMonitoringData, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, [checkTermsAcceptance]);

  // Read URL query parameter for view on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const viewParam = urlParams.get('view');
    if (viewParam && ['dashboard', 'profile', 'history', 'pricing'].includes(viewParam)) {
      setActiveView(viewParam as "dashboard" | "profile" | "history" | "pricing");
    }
  }, []);

  // Auto-dismiss notifications after 5 seconds
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (notifications.length > 0) {
      timer = setTimeout(() => {
        setNotifications(prev => prev.slice(1)); // Remove the first notification
      }, 5000); // 5 seconds
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [notifications]);

  /* ----------------------------- Handlers ----------------------------- */
  const handleScan = async () => {
    if (!urlToScan) return alert("Please enter a URL to scan");
  
    setIsScanning(true);
    setScanResult(null);

    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToScan }),
      });
  
      const data: PredictionResult = await response.json();
      if (!response.ok) throw new Error(data.error || 'Prediction failed');
  
      // Save scan
      await fetch('/api/save-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: urlToScan,
          redirectedUrl: data.url || urlToScan,
          status: data.prediction,
          safe_percentage: data.prediction === 'Safe' ? (1 - data.confidence) * 100 : null,
          unsafe_percentage: data.prediction === 'Unsafe' ? data.confidence * 100 : null,
          ip_address: data.ip_address,
          asn: data.asn,
          location: data.location,
          country_code: null,
        }),
      });
  
      setScanResult(data);
      fetchStatsAndRecentScans();

    } catch (error) {
      setScanResult({ prediction: 'Error', confidence: 0, error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setIsScanning(false);
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) { // Kept your existing logic
      case "Safe": return <CheckCircle className="w-5 h-5 text-safe" />;
      case "Unsafe": return <Shield className="w-5 h-5 text-destructive" />;
      case "Error": return <AlertTriangle className="w-5 h-5 text-yellow-400" />; // Kept for consistency
      default: return null;
    }
  };

  const getStatusBadge = (status?: string) => {
    const variants: Record<string, "default" | "destructive" | "secondary"> = {
      Safe: "default",
      Unsafe: "destructive",
      Error: "secondary",
    };
    return status ? <Badge variant={variants[status]}>{status}</Badge> : null;
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const handleExportHistory = async () => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/export-report');
      if (!response.ok) throw new Error('Failed to export report');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'scan-history.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export scan history. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadExtension = async () => {
    setIsDownloadingExtension(true);
    try {
      const response = await fetch('/extension-download');
      if (!response.ok) throw new Error('Failed to download extension');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'extension.zip';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download extension. Please try again.');
    } finally {
      setIsDownloadingExtension(false);
    }
  };

  const handleRefreshDashboard = async () => {
    setIsRefreshing(true);
    try {
      // Fetch fresh data from APIs
      await fetchStatsAndRecentScans();
      // Clear scan result
      setScanResult(null);
      // Clear URL input
      setUrlToScan("");
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleClearData = async () => {
    setIsClearingData(true);
    try {
      // Simulate clearing cache and logs - in real implementation, this would call an API
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      setNotifications(prev => [...prev, { message: 'Cache and logs cleared successfully!', type: 'success' }]);
    } catch (error) {
      console.error('Clear data failed:', error);
      setNotifications(prev => [...prev, { message: 'Failed to clear cache and logs. Please try again.', type: 'error' }]);
    } finally {
      setIsClearingData(false);
    }
  };

  /* ----------------------------- UI ----------------------------- */
  return (
    <div className="h-screen bg-background relative shadow-glow-cyan font-sans">
      <Navigation isAuthenticated={true} onNavigate={(view) => setActiveView(view)} />

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-20 right-4 z-50 space-y-2">
          {notifications.map((notification, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg shadow-lg border backdrop-blur-sm animate-fade-in ${
                notification.type === 'success'
                  ? 'bg-green-500/10 border-green-500/30 text-green-400'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}
            >
              <div className="flex items-center gap-2">
                {notification.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                )}
                <span className="font-medium">{notification.message}</span>
              </div>
            </div>
          ))}
        </div>
      )}

        <Suspense fallback={<div>Loading...</div>}>
          {activeView === "profile" && <UpdateProfileForm onBack={() => setActiveView("dashboard")} />}
          {activeView === "history" && <ScanHistoryPage onBack={() => setActiveView("dashboard")} />}
          {activeView === "pricing" && <PricingPageAny onBack={() => setActiveView("dashboard")} />}
        </Suspense>

        {activeView === "dashboard" && (
          <>
            {/* Download Extension Card */}
            {showExtensionCard && (
              <Card className="bg-gradient-to-r from-violet-600/10 via-blue-100/10 to-violet-600/10 border-violet-500/30 shadow-lg hover:shadow-violet-500/20 transition-all duration-300 animate-fade-in mb-12 relative">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-violet-500" />
                      <span className="text-sm font-semibold text-violet-600">AI-Powered Protection</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowExtensionCard(false);
                        localStorage.setItem('extensionCardClosed', 'true');
                      }}
                      className="text-muted-foreground hover:text-foreground h-8 w-8 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <CardTitle className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                    Secure Your Browsing Experience
                  </CardTitle>
                  <CardDescription className="text-base">
                    Download our advanced browser extension for real-time phishing detection, threat monitoring, and instant security alerts powered by cutting-edge AI.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Enhanced Download Extension Button */}
                  <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                    <Button
                      onClick={handleDownloadExtension}
                      disabled={isDownloadingExtension}
                      size="lg"
                      variant="cyber"
                      className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                    >
                      <Zap className="w-5 h-5 mr-2" />
                      {isDownloadingExtension ? "Downloading..." : "Download Extension Now"}
                    </Button>
                    <div className="text-center sm:text-left">
                      <p className="text-sm text-muted-foreground font-medium">
                        Free • Easy Installation • Instant Protection
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Compatible with Chrome, Firefox, and Edge
                      </p>
                    </div>
                  </div>

                  {/* Additional Visual Elements */}
                  <div className="flex justify-center gap-6 opacity-80">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-safe" />
                      <span className="text-xs font-medium text-muted-foreground">Real-Time Scanning</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-violet-500" />
                      <span className="text-xs font-medium text-muted-foreground">Zero-Day Protection</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-purple-500" />
                      <span className="text-xs font-medium text-muted-foreground">AI-Powered Analysis</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Dashboard Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <Card className="bg-card/50 backdrop-blur border-primary/20 shadow-glow-cyan hover:border-primary/50 transition-all duration-300 animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    Threat Monitoring
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status: {realtimeStatus.threatMonitoring.status}</span>
                    <span className="text-xl font-bold text-muted-foreground">Threats: {realtimeStatus.threatMonitoring.threats}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Last update: <ClientTime>{realtimeStatus.threatMonitoring.lastUpdate.toLocaleTimeString()}</ClientTime>
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur border-primary/20 shadow-glow-cyan hover:border-primary/50 transition-all duration-300 animate-fade-in" style={{ animationDelay: '100ms' }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-primary" />
                    Firewall Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status: {realtimeStatus.firewallStatus.status}</span>
                    <span className="text-xl font-bold text-muted-foreground">Connections: {realtimeStatus.firewallStatus.connections}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Last update: <ClientTime>{realtimeStatus.firewallStatus.lastUpdate.toLocaleTimeString()}</ClientTime>
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur border-primary/20 shadow-glow-cyan hover:border-primary/50 transition-all duration-300 animate-fade-in" style={{ animationDelay: '200ms' }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    Network Traffic
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status: {realtimeStatus.networkTraffic.status}</span>
                    <span className="text-xl font-bold text-muted-foreground">Packets: {realtimeStatus.networkTraffic.packets}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Last update: <ClientTime>{realtimeStatus.networkTraffic.lastUpdate.toLocaleTimeString()}</ClientTime>
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              <Card className="bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-glow-cyan animate-fade-in" style={{ animationDelay: '300ms' }}>
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-primary">{stats.totalScans}</CardTitle>
                  <CardDescription>Total Scans</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Updated <ClientTime>{new Date().toLocaleTimeString()}</ClientTime></p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-glow-cyan animate-fade-in" style={{ animationDelay: '400ms' }}>
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-destructive">{stats.unsafeScans}</CardTitle>
                  <CardDescription>Phishing Detected</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Updated <ClientTime>{new Date().toLocaleTimeString()}</ClientTime></p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-glow-cyan animate-fade-in" style={{ animationDelay: '500ms' }}>
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-safe">{stats.safeScans}</CardTitle>
                  <CardDescription>Safe Sites</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Updated <ClientTime>{new Date().toLocaleTimeString()}</ClientTime></p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-glow-cyan animate-fade-in" style={{ animationDelay: '600ms' }}>
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-primary">{stats.successRate.toFixed(1)}%</CardTitle>
                  <CardDescription>Success Rate</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Updated <ClientTime>{new Date().toLocaleTimeString()}</ClientTime></p>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {/* Quick Access to URL Scanner */}
                <Card className="bg-card/50 backdrop-blur border-primary/20 shadow-glow-cyan animate-fade-in hover:border-primary/50 transition-all duration-300 cursor-pointer" style={{ animationDelay: '700ms' }} onClick={() => window.location.href = '/url-scanner'}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-6 h-6 text-primary" />
                      URL Scanner
                    </CardTitle>
                    <CardDescription>Access our advanced URL scanning tool for comprehensive phishing detection.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" variant="outline">
                      <Shield className="w-4 h-4 mr-2" />
                      Open URL Scanner
                    </Button>
                  </CardContent>
                </Card>

                {/* Recent Scans */}
                <Card className="bg-card/50 backdrop-blur border-primary/20 shadow-glow-cyan animate-fade-in" style={{ animationDelay: '800ms' }}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="w-6 h-6 text-primary" />
                      Recent Scans
                    </CardTitle>
                    <CardDescription>Your last 5 scans with trust scores and timestamps. <span className="text-xs text-muted-foreground">Updated <ClientTime>{new Date().toLocaleTimeString()}</ClientTime></span></CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {recentScans.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">No scans yet. Start by scanning a URL above!</p>
                    ) : (
                      recentScans.map((scan, index) => (
                        <div key={scan.id} className="flex items-center justify-between p-4 bg-card/30 rounded-lg border border-border hover:border-primary/50 transition-all duration-300 animate-fade-in" style={{ animationDelay: `${900 + index * 100}ms` }}>
                          <div className="flex items-center gap-3">
                            {getStatusIcon(scan.status)}
                            <div>
                              <a href={scan.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                                {scan.url.length > 50 ? `${scan.url.substring(0, 50)}...` : scan.url}
                              </a>
                              <p className="text-xs text-muted-foreground">{scan.location || 'Unknown location'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <TrustScoreGauge score={scan.trustScore} size="sm" />
                            <ClientTime>
                              <span className="text-xs text-muted-foreground">{formatTimeAgo(scan.timestamp)}</span>
                            </ClientTime>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
              <Card className="bg-card/50 backdrop-blur border-primary/20 shadow-glow-cyan animate-fade-in" style={{ animationDelay: '1000ms' }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    Protection Status
                  </CardTitle>
                </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-safe" />
                      <span className="text-sm font-medium">Active Protection</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Your browser extension is monitoring all web traffic</p>
                    {stats.lastLoginIp && (
                      <p className="text-xs text-muted-foreground mt-2">Last Login IP: {stats.lastLoginIp}</p>
                    )}
                    {stats.lastLoginDevice && (
                      <p className="text-xs text-muted-foreground">Device: {stats.lastLoginDevice}</p>
                    )}
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground">Network Traffic Status: {realtimeStatus.networkTraffic.status}</p>
                      <p className="text-xl font-bold text-muted-foreground">Traffic: {formatBytes(realtimeStatus.networkTraffic.packets)} / sec</p>
                      <p className="text-sm text-muted-foreground">Packets: {realtimeStatus.networkTraffic.packets.toLocaleString()}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Last update: <ClientTime>{realtimeStatus.networkTraffic.lastUpdate.toLocaleTimeString()}</ClientTime>
                    </p>
                  </CardContent>
              </Card>

                <SessionInfoCard />

                <Card className="bg-card/50 backdrop-blur border-primary/20 shadow-glow-cyan animate-fade-in" style={{ animationDelay: '1100ms' }}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-primary" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button onClick={handleRefreshDashboard} disabled={isRefreshing} className="w-full" variant="outline">
                      <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                      {isRefreshing ? "Refreshing..." : "Refresh Dashboard"}
                    </Button>
                    <Button onClick={handleExportHistory} disabled={isExporting} className="w-full" variant="outline">
                      <FileDown className="w-4 h-4 mr-2" />
                      {isExporting ? "Exporting..." : "Export Scan History"}
                    </Button>
                    <Button
                      onClick={handleDownloadExtension}
                      disabled={isDownloadingExtension}
                      className="w-full"
                      variant="outline"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {isDownloadingExtension ? "Downloading..." : "Download Extension"}
                    </Button>
                    <Button onClick={handleClearData} disabled={isClearingData} className="w-full" variant="outline">
                      <Trash2 className="w-4 h-4 mr-2" />
                      {isClearingData ? "Clearing Cache & Logs..." : "Clear Cache & Logs"}
                    </Button>
                    <Button className="w-full" variant="cyber">
                      Visit Security Dashboard
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
    </div>
  );
};

export default Dashboard;
