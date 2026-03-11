"use client"

import React, { useState, useEffect } from "react"
import { AlertTriangle, ArrowLeft, CheckCircle, Shield } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface ScanHistoryPageProps {
  onBack: () => void
}

// Interface for database scan model
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
  userId: string;
}

// Helper functions copied from dashboard/page.tsx for consistency
const getStatusIcon = (status: string) => {
  switch (status) {
    case "Safe":
      return <CheckCircle className="w-5 h-5 text-safe" />
    case "Suspicious":
      return <AlertTriangle className="w-5 h-5 text-warning" />
    case "Unsafe":
      return <Shield className="w-5 h-5 text-destructive" />
    default:
      return null
  }
}

const getStatusBadge = (status: string) => {
  const variants: Record<string, "default" | "destructive" | "secondary"> = {
    Safe: "default",
    Suspicious: "secondary",
    Unsafe: "destructive",
  }
    return (
      <Badge
        variant={variants[status]}
        className={
          status === "Safe"
            ? "bg-safe"
            : status === "Suspicious"
            ? "bg-warning text-warning-foreground"
            : ""
        }
      >
        {status}
      </Badge>
    )
  }

  const ScanHistoryPage: React.FC<ScanHistoryPageProps> = ({ onBack }) => {
    const [scanHistory, setScanHistory] = useState<ScanResult[]>([])
    const [loading, setLoading] = useState(true)
    const [, setError] = useState<string | null>(null);

    // Fetch scan history on component mount
    useEffect(() => {
      const fetchScanHistory = async () => {
        try {
          const response = await fetch('/api/scan-history');
          if (response.ok) {
            const data = await response.json();
            setScanHistory(data);
          }
        } catch (err) {
          if (err instanceof Error) {
            setError(err.message);
          } else {
            setError('An unknown error occurred');
          }
          console.error('Failed to fetch scan history:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchScanHistory();
    }, []);

  // Helper to calculate domain age (dummy implementation)
  const getDomainAge = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const years = Math.floor(days / 365)
    const remainingDays = days % 365
    return `${years}y ${remainingDays}d`
  }

  // Dummy domain status for demonstration
  const getDomainStatus = () => "Active"

  // Delete scan from list
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/scan-history/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setScanHistory((prev) => prev.filter((scan) => scan.id !== id));
      } else {
        console.error('Failed to delete scan:', response.statusText);
      }
    } catch (error) {
      console.error('Failed to delete scan:', error);
    }
  }

  // Delete all scans
  const handleDeleteAll = async () => {
    if (!confirm('Are you sure you want to delete all scan history? This action cannot be undone.')) {
      return;
    }
    try {
      const deletePromises = scanHistory.map(scan => fetch(`/api/scan-history/${scan.id}`, { method: 'DELETE' }));
      await Promise.all(deletePromises);
      setScanHistory([]);
    } catch (error) {
      console.error('Failed to delete all scans:', error);
    }
  }

  return (
    <Card className="bg-card border-border shadow-glow-cyan animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Full Scan History</span>
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </CardTitle>
        <CardDescription>
          A complete log of all URLs you have scanned.
        </CardDescription>
        {scanHistory.length > 0 && (
          <Button variant="destructive" onClick={handleDeleteAll} className="ml-auto">
            Delete All Scans
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>URL</TableHead>
              <TableHead>Confidence Score</TableHead>
              <TableHead>Predict</TableHead>
              <TableHead>Domain Age</TableHead>
              <TableHead>Domain Status</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>ASN</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Date Scanned</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8">
                  Loading scan history...
                </TableCell>
              </TableRow>
            ) : scanHistory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8">
                  No scans found. Start scanning URLs to see your history here.
                </TableCell>
              </TableRow>
            ) : (
              scanHistory.map((scan) => (
                <TableRow key={scan.id}>
                  <TableCell className="max-w-xs truncate font-medium">{scan.url}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 rounded-full bg-gray-700">
                        <div
                          className="h-2 rounded-full bg-blue-500"
                          style={{ width: `${scan.status === 'Safe' ? (scan.safe_percentage || 85) : (scan.unsafe_percentage ? 100 - scan.unsafe_percentage : 25)}%` }}
                        />
                      </div>
                      <span>{scan.status === 'Safe' ? (scan.safe_percentage || 85) : (scan.unsafe_percentage ? 100 - scan.unsafe_percentage : 25)}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(scan.status)}
                      {getStatusBadge(scan.status)}
                    </div>
                  </TableCell>
                  <TableCell>{getDomainAge(scan.createdAt)}</TableCell>
                  <TableCell>{getDomainStatus()}</TableCell>
                  <TableCell>{scan.ip_address || "N/A"}</TableCell>
                  <TableCell>{scan.asn || "N/A"}</TableCell>
                  <TableCell>{scan.location || "N/A"}</TableCell>
                  <TableCell>
                    {new Intl.DateTimeFormat("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(new Date(scan.createdAt))}
                  </TableCell>
                  <TableCell>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(scan.id)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export default ScanHistoryPage
