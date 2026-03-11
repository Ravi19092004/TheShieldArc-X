'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Define the type for a scan object
interface Scan {
  id: string;
  url: string;
  isPhishing: boolean;
  createdAt: string;
}

const ScanHistoryPage = () => {
  const [history, setHistory] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('/api/scan-history');
        if (!response.ok) {
          throw new Error('Failed to fetch scan history');
        }
        const data = await response.json();
        setHistory(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError("An unknown error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/scan-history/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete scan history item');
      }

      setHistory(history.filter((scan) => scan.id !== id));
    } catch (err: unknown) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError("An unknown error occurred.");
        }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scan History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>URL</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((scan) => (
              <TableRow key={scan.id}>
                <TableCell>{scan.url}</TableCell>
                <TableCell>{scan.isPhishing ? 'Phishing' : 'Safe'}</TableCell>
                <TableCell>{new Date(scan.createdAt).toLocaleString()}</TableCell>
                <TableCell>
                  <Button variant='destructive' onClick={() => handleDelete(scan.id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ScanHistoryPage;