'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, Loader2, ShieldQuestion } from 'lucide-react';

interface ScanResult {
  prediction: 'Safe' | 'Unsafe' | 'Error';
  confidence: number; // Probability of Unsafe
  domain?: string | null;
  safe_percentage?: number;
  unsafe_percentage?: number;
  ip_address?: string;
  asn?: string;
  hosting_provider?: string;
  location?: string;
  error?: string;
  domainAgeDays?: number | null;
  domainStatus?: string | string[] | null;
  country_code?: string | null;
  trust_score?: number | null;
}

interface UserLocation {
  city: string;
  country: string;
  isp: string;
  timezone: string;
}

const formatDomainAge = (days: number | null | undefined) => {
  if (days === null || days === undefined) return 'N/A';
  const years = Math.floor(days / 365);
  const remainingDays = days % 365;
  return years > 0 ? `${years}y ${remainingDays}d` : `${days}d`;
};

export const URLScanner = () => {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<ScanResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);

  // Fetch user's location on component mount
  useEffect(() => {
    const fetchUserLocation = async () => {
      try {
        const response = await fetch('http://ip-api.com/json/?fields=status,country,city,isp,timezone');
        if (response.ok) {
          const data = await response.json();
          if (data.status === 'success') {
            setUserLocation({
              city: data.city || 'N/A',
              country: data.country || 'N/A',
              isp: data.isp || 'N/A',
              timezone: data.timezone || 'N/A'
            });
          }
        }
      } catch (error) {
        console.error('Error fetching user location:', error);
      }
    };

    fetchUserLocation();
  }, []);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get a prediction.');
      }

      setResult(data);

      // Save the scan to the database
      try {
        await fetch('/api/save-scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: url.trim(),
            redirectedUrl: data.redirectedUrl || url.trim(),
            status: data.prediction,
            safe_percentage: data.safe_percentage,
            unsafe_percentage: data.unsafe_percentage,
            ip_address: data.ip_address,
            asn: data.asn,
            location: data.location,
            country_code: data.country_code,
          }),
        });
      } catch (saveError) {
        console.error('Failed to save scan:', saveError);
        // Don't throw error here as the scan result is still valid
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      setResult({ prediction: 'Error', confidence: 0, error: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const getResultColor = () => {
    if (!result) return 'text-white';
    switch (result.prediction) {
      case 'Safe': return 'text-green-400';
      case 'Unsafe': return 'text-red-400';
      case 'Error': return 'text-yellow-400';
      default: return 'text-white';
    }
  };

  return (
    <Card className="bg-gradient-to-br from-purple-900/20 via-slate-900/30 to-indigo-900/20 backdrop-blur border-purple-500/30 shadow-glow-cyan hover:border-purple-400/50 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <CardHeader>
        <CardTitle className="text-2xl font-bold glitch-text font-orbitron mb-1 neon-text animate-pulse">
          Manual URL Scan
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 items-center animate-in fade-in slide-in-from-left-4 duration-500 delay-200">
          <Input
            type="text"
            placeholder="Enter URL to scan (e.g., https://google.com)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isLoading && url.trim()) {
                e.preventDefault();
                handleScan(e as unknown as React.FormEvent);
              }
            }}
            className="flex-grow bg-black/50 border-primary/30 text-white placeholder:text-muted-foreground focus:ring-primary transition-all duration-300 hover:border-primary/50 focus:scale-105 transform"
            disabled={isLoading}
          />
          <Button
            onClick={(e) => handleScan(e as unknown as React.FormEvent)}
            variant="neon"
            className="cyber-button transition-all duration-300 hover:scale-105 transform hover:shadow-lg hover:shadow-primary/25"
            disabled={!url || isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Scan URL'}
          </Button>
        </div>

        {result && (
          <div className="mt-6 p-4 border border-primary/30 rounded-lg bg-black/30 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500">
            <h4 className="font-semibold text-lg mb-4 neon-white-blue-glow animate-pulse">Scan Result:</h4>

            {/* Key Information Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div className="bg-black/50 p-3 rounded-lg border border-primary/20 animate-in fade-in slide-in-from-left-4 duration-500 delay-600 hover:scale-105 transition-all duration-300 transform">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">URL</p>
                <p className="text-sm text-white font-mono break-all">{url}</p>
              </div>
              <div className="bg-black/50 p-3 rounded-lg border border-primary/20 animate-in fade-in slide-in-from-left-4 duration-500 delay-700 hover:scale-105 transition-all duration-300 transform">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Predict</p>
                <div className={`flex items-center gap-2 text-lg font-bold ${getResultColor()} animate-pulse`}>
                  {result.prediction === 'Safe' && <CheckCircle size={20} className="animate-bounce" />}
                  {result.prediction === 'Unsafe' && <AlertTriangle size={20} className="animate-pulse" />}
                  {result.prediction === 'Error' && <ShieldQuestion size={20} className="animate-spin" />}
                  <span>{result.prediction}</span>
                </div>
              </div>
              <div className="bg-black/50 p-3 rounded-lg border border-primary/20 animate-in fade-in slide-in-from-left-4 duration-500 delay-800 hover:scale-105 transition-all duration-300 transform">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Domain Age</p>
                <p className="text-sm text-white">
                  {result.domainAgeDays != null ? formatDomainAge(result.domainAgeDays) : 'N/A'}
                </p>
              </div>
              <div className="bg-black/50 p-3 rounded-lg border border-primary/20 animate-in fade-in slide-in-from-left-4 duration-500 delay-900 hover:scale-105 transition-all duration-300 transform">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Domain</p>
                <p className="text-sm text-white font-mono">{result.domain || 'N/A'}</p>
              </div>
            </div>

            {result.prediction !== 'Error' && (
              <>
                {/* Website network info */}
                <div className="mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-1000">
                  <h5 className="font-semibold text-sm mb-2 neon-white-blue-glow animate-pulse">Website Information:</h5>
                  {result.ip_address && <p className="text-sm mt-1 text-white neon-white-blue-glow animate-in fade-in slide-in-from-left-4 duration-500 delay-1100">IP Address: {result.ip_address}</p>}
                  {result.asn && <p className="text-sm mt-1 text-white neon-white-blue-glow animate-in fade-in slide-in-from-left-4 duration-500 delay-1200">ASN: {result.asn}</p>}
                  {result.hosting_provider && <p className="text-sm mt-1 text-white neon-white-blue-glow animate-in fade-in slide-in-from-left-4 duration-500 delay-1300">Hosting Provider: {result.hosting_provider}</p>}
                  {result.location && (
                    <p className="text-sm mt-1 text-white neon-white-blue-glow animate-in fade-in slide-in-from-left-4 duration-500 delay-1400">
                      Location: {result.location} {result.country_code}
                    </p>
                  )}
                  {result.domainAgeDays != null && (
                    <p className="text-sm mt-1 text-white neon-white-blue-glow animate-in fade-in slide-in-from-left-4 duration-500 delay-1500">Domain Age: {formatDomainAge(result.domainAgeDays)}</p>
                  )}
                  {result.domainStatus && (
                    <p className="text-sm mt-1 text-white neon-white-blue-glow animate-in fade-in slide-in-from-left-4 duration-500 delay-1600">
                      Domain Status:{' '}
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full transition-all duration-300 hover:scale-105 transform ${!Array.isArray(result.domainStatus) && result.domainStatus.toLowerCase().includes('active') ? 'bg-green-900 text-orange-400' : 'bg-gray-900 text-orange-300'}`}>
                        {Array.isArray(result.domainStatus) ? result.domainStatus.join(', ') : result.domainStatus}
                      </span>
                    </p>
                  )}
                </div>

                {/* User's session info */}
                <div className="mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-1700">
                  <h5 className="font-semibold text-sm mb-2 neon-white-blue-glow animate-pulse">📍 Session Information:</h5>
                  <p className="text-sm mt-1 text-white neon-white-blue-glow animate-in fade-in slide-in-from-left-4 duration-500 delay-1800">Country / Region: {userLocation?.country || 'Loading...'}</p>
                  <p className="text-sm mt-1 text-white neon-white-blue-glow animate-in fade-in slide-in-from-left-4 duration-500 delay-1900">City: {userLocation?.city || 'Loading...'}</p>
                  <p className="text-sm mt-1 text-white neon-white-blue-glow animate-in fade-in slide-in-from-left-4 duration-500 delay-2000">ISP: {userLocation?.isp || 'Loading...'}</p>
                  <p className="text-sm mt-1 text-white neon-white-blue-glow animate-in fade-in slide-in-from-left-4 duration-500 delay-2100">Timezone: {userLocation?.timezone || 'Loading...'}</p>
                </div>
              </>
            )}



            {result.error && (
              <p className="text-sm text-red-400 mt-1 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-2200 animate-pulse">
                Error: {result.error}
              </p>
            )}

            {/* Additional Functions */}
            {result && result.prediction !== 'Error' && (
              <div className="mt-6 flex flex-wrap gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-2300">
                <Button
                  variant="outline"
                  size="sm"
                  className="transition-all duration-300 hover:scale-105 transform hover:bg-primary/10 hover:border-primary/50"
                  onClick={() => navigator.clipboard.writeText(url)}
                >
                  Copy URL
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="transition-all duration-300 hover:scale-105 transform hover:bg-primary/10 hover:border-primary/50"
                  onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
                >
                  Visit URL
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="transition-all duration-300 hover:scale-105 transform hover:bg-primary/10 hover:border-primary/50"
                  onClick={() => {
                    const report = `URL Scan Report:\nURL: ${url}\nPrediction: ${result.prediction}\nConfidence: ${result.confidence}\nDomain: ${result.domain || 'N/A'}\nIP: ${result.ip_address || 'N/A'}\nLocation: ${result.location || 'N/A'}`;
                    navigator.clipboard.writeText(report);
                  }}
                >
                  Copy Report
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
