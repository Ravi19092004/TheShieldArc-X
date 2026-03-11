"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, ExternalLink, AlertTriangle, CheckCircle } from "lucide-react"; // Importing icons
import { useRouter } from "next/navigation"; // Added useRouter import

export interface ScanResult {
  id: string;
  url: string;
  score: number;
  predict: 'Safe' | 'Unsafe'; // Removed 'Error'
  date: Date;
  domainAgeDays?: number | null;
  domainStatus?: string | string[];
  ip_address?: string | null;
  asn?: string | null;
  location?: string | null;
  country_code?: string | null;  // Added to fix TS error
  safe_percentage: number;
  unsafe_percentage: number;
  createdAt: string;
}

const ScanHistoryPage = () => {
  const router = useRouter();
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchScanHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      // Dummy data for presentation
      const realisticUrls = [
        "https://www.google.com", "https://www.facebook.com", "https://www.amazon.com", // Safe
        "https://paypal-secure-login.com", "https://bankofamerica-verify.net", "https://apple-support-id.co", // Unsafe-looking
        "https://www.microsoft.com", "https://www.wikipedia.org", "https://www.github.com", // Safe
        "https://netflix-billing-update.info", "https://wellsfargo-online.org", "https://docs.google.com"
      ];
      const countries = [
        "USA 🇺🇸", "Canada 🇨🇦", "Germany 🇩🇪", "Japan 🇯🇵", "Australia 🇦🇺",
        "India 🇮🇳", "Brazil 🇧🇷", "France 🇫🇷", "UK 🇬🇧", "China 🇨🇳"
      ];

      const dummyScanResults: ScanResult[] = Array.from({ length: 10 }, (_, i) => {
        const isUnsafe = i % 3 === 0 || i % 5 === 0; // More realistic mix of safe/unsafe
        const safePercentage = isUnsafe ? Math.floor(Math.random() * 40) : Math.floor(Math.random() * 30) + 70;
        const unsafePercentage = 100 - safePercentage;

        return {
          id: `dummy-scan-${i + 1}`,
          url: realisticUrls[i % realisticUrls.length],
          score: safePercentage, // Score represents safety
          predict: isUnsafe ? 'Unsafe' : 'Safe',
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000), // Days ago
          domainAgeDays: 365 + i * 30,
          domainStatus: isUnsafe ? 'Inactive' : 'Active',
          ip_address: `192.168.1.${i + 1}`,
          asn: `AS1234${i + 1}`,
          location: countries[i % countries.length],
          safe_percentage: safePercentage,
          unsafe_percentage: unsafePercentage,
          createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        };
      });
      setScanHistory(dummyScanResults);
    } catch (err) {
      setError("Error generating dummy scan history.");
      console.error("Error generating dummy scan history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScanHistory();
  }, []);

  const handleDeleteScan = async (scanId: string) => {
    if (!confirm("Are you sure you want to delete this scan?")) {
      return;
    }
    try {
      const response = await fetch("/api/scan-history/delete-one", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scanId }),
      });
      if (response.ok) {
        fetchScanHistory(); // Refresh history after deletion
      } else {
        alert("Failed to delete scan.");
        console.error("Failed to delete scan:", await response.text());
      }
    } catch (err) {
      alert("Error deleting scan.");
      console.error("Error deleting scan:", err);
    }
  };

  const handleClearAllHistory = async () => {
    if (!confirm("Are you sure you want to clear all scan history? This action cannot be undone.")) {
      return;
    }
    try {
      const response = await fetch("/api/scan-history/clear-all", {
        method: "DELETE",
      });
      if (response.ok) {
        setScanHistory([]); // Clear local state
        alert("All scan history cleared.");
      } else {
        alert("Failed to clear all history.");
        console.error("Failed to clear all history:", await response.text());
      }
    } catch (err) {
      alert("Error clearing all history.");
      console.error("Error clearing all history:", err);
    }
  };

  const formatDomainAge = (days: number | null | undefined) => {
    if (days === null || days === undefined) return 'N/A';
    const years = Math.floor(days / 365);
    const remainingDays = days % 365;
    return years > 0 ? `${years}y ${remainingDays}d` : `${days}d`;
  };

  const getDomainStatusLabel = (status: string | string[] | undefined) => {
    if (!status || status === 'N/A') return 'Unknown';
    const statusStr = Array.isArray(status) ? status.join(' ').toLowerCase() : status.toLowerCase();
    return statusStr.includes('clientdeleteprohibited') || statusStr.includes('ok') || statusStr.includes('active')
      ? 'Active'
      : 'Inactive';
  };

  const getScoreColor = (score: number, predict: string) => {
    if (predict === 'Unsafe') { // Changed from Phishing to Unsafe
      return score >= 50 ? 'bg-red-500' : score >= 30 ? 'bg-orange-500' : 'bg-yellow-500';
    } else if (predict === 'Safe') {
      return score >= 90 ? 'bg-green-500' : score >= 75 ? 'bg-teal-500' : 'bg-blue-500';
    }
    return 'bg-gray-500'; // For Error
  };

  const getFlagEmoji = (countryCode: string) => {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 0x1F1E6 + char.charCodeAt(0) - 'A'.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10 text-center text-white">
        Loading scan history...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 text-center text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="cyber-card bg-neutral-900 text-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold glitch-text font-orbitron mb-1 neon-text">Scan History</CardTitle>
          <div className="flex gap-2">
            <Button variant="neon" size="sm" onClick={() => router.push('/dashboard')} className="cyber-button">
              Go to Dashboard
            </Button>
            <Button variant="neon" size="sm" onClick={handleClearAllHistory} className="cyber-button-destructive">
              Clear All History
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-400 mb-4">
            Showing last 30 days of scan results. Scans older than 30 days are automatically deleted.
          </p>
          {scanHistory.length === 0 ? (
            <p className="text-center text-gray-400">No scan history found for the last 30 days.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-800 text-left">
                    <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">URL</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Confidence Score</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">predict</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Domain Age</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Domain Status</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">IP Address</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">ASN</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Date Scanned</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {scanHistory.map((result) => (
                    <tr key={result.id} className="hover:bg-gray-800 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-200 truncate max-w-[200px]">
                            {result.url}
                          </span>
                          <a
                            href={result.url.startsWith('http') ? result.url : `https://${result.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 text-gray-400 hover:text-gray-200"
                          >
                            <ExternalLink size={16} />
                          </a>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-24 bg-gray-700 rounded-full h-2.5">
                            <div
                              className={`h-2.5 rounded-full ${getScoreColor(result.score, result.predict)}`}
                              style={{ width: `${result.score}%` }}
                            ></div>
                          </div>
                          <span className="ml-2 text-sm text-gray-300">
                            {result.score.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {result.predict === 'Safe' ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-900 text-green-300">
                            <CheckCircle size={16} className="mr-1" /> Safe
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-900 text-red-300">
                            <AlertTriangle size={16} className="mr-1" /> Unsafe
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {formatDomainAge(result.domainAgeDays)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          getDomainStatusLabel(result.domainStatus) === 'Active'
                            ? 'bg-green-900 text-green-300'
                            : getDomainStatusLabel(result.domainStatus) === 'Inactive'
                              ? 'bg-red-900 text-red-300'
                              : 'bg-gray-800 text-gray-300'
                        }`}>
                          {getDomainStatusLabel(result.domainStatus)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{result.ip_address || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{result.asn || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {result.location || 'N/A'}
                        {result.country_code && <span className="ml-1">{getFlagEmoji(result.country_code)}</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {result.date.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Button
                          variant="neon"
                          size="sm"
                          onClick={() => handleDeleteScan(result.id)}
                          className="p-2 cyber-button-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ScanHistoryPage;