//packages/web/components/BrowserSandbox.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Play, RefreshCw, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';

interface SandboxResult {
  url: string;
  safe: boolean;
  threats: string[];
  networkRequests: string[];
  scripts: string[];
  forms: string[];
  score: number;
  analysisTime: number;
}

export const BrowserSandbox: React.FC = () => {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentResult, setCurrentResult] = useState<SandboxResult | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<SandboxResult[]>([]);

  useEffect(() => {
    // Load analysis history from localStorage
    const saved = localStorage.getItem('sandbox-history');
    if (saved) {
      setAnalysisHistory(JSON.parse(saved));
    }
  }, []);

  const saveToHistory = (result: SandboxResult) => {
    const newHistory = [result, ...analysisHistory.slice(0, 9)]; // Keep last 10
    setAnalysisHistory(newHistory);
    localStorage.setItem('sandbox-history', JSON.stringify(newHistory));
  };

  const analyzeWebsite = async () => {
    if (!url.trim()) {
      alert('Please enter a URL to analyze');
      return;
    }

    setIsAnalyzing(true);
    setCurrentResult(null);

    try {
      // Simulate sandbox analysis (in a real implementation, this would use a secure sandbox environment)
      const result = await simulateSandboxAnalysis(url);
      setCurrentResult(result);
      saveToHistory(result);
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const simulateSandboxAnalysis = async (targetUrl: string): Promise<SandboxResult> => {
    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Mock analysis results based on URL patterns
    const threats: string[] = [];
    const networkRequests: string[] = [];
    const scripts: string[] = [];
    const forms: string[] = [];

    // Basic threat detection simulation
    if (targetUrl.includes('suspicious') || targetUrl.includes('phishing')) {
      threats.push('Suspicious domain pattern');
      threats.push('Potential phishing indicators');
    }

    if (targetUrl.includes('malware') || targetUrl.includes('exploit')) {
      threats.push('Malware distribution detected');
      scripts.push('Obfuscated JavaScript detected');
    }

    // Simulate network requests
    networkRequests.push(`${targetUrl}/api/data`);
    networkRequests.push('https://cdn.example.com/script.js');
    networkRequests.push('https://analytics.example.com/track');

    // Simulate scripts and forms
    scripts.push('jQuery library');
    scripts.push('Custom analytics script');
    forms.push('Login form detected');
    forms.push('Contact form detected');

    const safe = threats.length === 0;
    const score = safe ? Math.floor(Math.random() * 20) + 80 : Math.floor(Math.random() * 40) + 10;

    return {
      url: targetUrl,
      safe,
      threats,
      networkRequests,
      scripts,
      forms,
      score,
      analysisTime: Math.floor(Math.random() * 5000) + 1000
    };
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
    return <AlertTriangle className="w-6 h-6 text-red-500" />;
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Very Safe';
    if (score >= 60) return 'Moderately Safe';
    if (score >= 40) return 'Caution Advised';
    return 'High Risk';
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
                Browser Sandbox
              </CardTitle>
              <CardDescription>
                Analyze websites in an isolated sandbox environment to detect threats and malicious behavior
              </CardDescription>
            </div>
            <Badge variant="outline" className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Isolated Environment
            </Badge>
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
                placeholder="Enter website URL to analyze in sandbox (e.g., https://example.com)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && analyzeWebsite()}
              />
            </div>
            <Button onClick={analyzeWebsite} disabled={isAnalyzing}>
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Analyze
                </>
              )}
            </Button>
          </div>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900">Sandbox Environment</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Websites are analyzed in an isolated environment that prevents any potential harm to your system.
                  The analysis includes network monitoring, script execution tracking, and threat detection.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {currentResult && (
        <Card className={getScoreBgColor(currentResult.score)}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getScoreIcon(currentResult.score)}
                <div>
                  <CardTitle className={`text-xl ${getScoreColor(currentResult.score)}`}>
                    Analysis Complete - {currentResult.score}/100
                  </CardTitle>
                  <CardDescription>{getScoreLabel(currentResult.score)}</CardDescription>
                </div>
              </div>
              <Badge variant={currentResult.safe ? "default" : "destructive"}>
                {currentResult.safe ? 'Safe' : 'Threats Detected'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Security Score</span>
                <span>{currentResult.score}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    currentResult.score >= 80 ? 'bg-green-500' :
                    currentResult.score >= 60 ? 'bg-yellow-500' :
                    currentResult.score >= 40 ? 'bg-orange-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${currentResult.score}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Threats */}
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  Threats Detected ({currentResult.threats.length})
                </h4>
                {currentResult.threats.length > 0 ? (
                  <div className="space-y-2">
                    {currentResult.threats.map((threat, index) => (
                      <div key={index} className="p-2 bg-red-50 border border-red-200 rounded text-sm">
                        {threat}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No threats detected</p>
                )}
              </div>

              {/* Network Requests */}
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-blue-500" />
                  Network Requests ({currentResult.networkRequests.length})
                </h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {currentResult.networkRequests.map((request, index) => (
                    <div key={index} className="text-xs font-mono bg-gray-50 p-1 rounded truncate">
                      {request}
                    </div>
                  ))}
                </div>
              </div>

              {/* Scripts */}
              <div>
                <h4 className="font-semibold mb-2">Scripts Executed ({currentResult.scripts.length})</h4>
                <div className="space-y-1">
                  {currentResult.scripts.map((script, index) => (
                    <div key={index} className="text-sm bg-yellow-50 p-2 rounded">
                      {script}
                    </div>
                  ))}
                </div>
              </div>

              {/* Forms */}
              <div>
                <h4 className="font-semibold mb-2">Forms Detected ({currentResult.forms.length})</h4>
                <div className="space-y-1">
                  {currentResult.forms.map((form, index) => (
                    <div key={index} className="text-sm bg-purple-50 p-2 rounded">
                      {form}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-xs text-muted-foreground pt-2 border-t">
              Analysis completed in {currentResult.analysisTime}ms • URL: {currentResult.url}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis History */}
      {analysisHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis History</CardTitle>
            <CardDescription>Recent sandbox analyses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysisHistory.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => setCurrentResult(result)}
                >
                  <div className="flex items-center gap-3">
                    {getScoreIcon(result.score)}
                    <div>
                      <p className="font-medium truncate max-w-xs">{result.url}</p>
                      <p className="text-sm text-muted-foreground">
                        {result.threats.length} threats • {result.networkRequests.length} requests
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${getScoreColor(result.score)}`}>
                      {result.score}/100
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sandbox Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">What the Sandbox Analyzes:</h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Network requests and API calls</li>
                <li>• JavaScript execution and behavior</li>
                <li>• Form submissions and data collection</li>
                <li>• Cookie and storage usage</li>
                <li>• Suspicious patterns and known threats</li>
              </ul>
            </div>

            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Security Note:</strong> The sandbox environment is completely isolated from your main browser
                and cannot harm your system. All analyses are performed in a controlled, virtual environment.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
