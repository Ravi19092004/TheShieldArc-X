// packages/web/app/(protected)/settings/scan-history/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Scan {
    id: string;
    url: string;
    safe_percentage: number;
    unsafe_percentage: number;
    createdAt: string;
}

const ScanHistoryPage = () => {
    const [history, setHistory] = useState<Scan[]>([]);
    const [error, setError] = useState<string | undefined>("");

    const fetchHistory = async () => {
        try {
            const response = await fetch("/api/scan-history");
            if (!response.ok) {
                throw new Error("Failed to fetch scan history");
            }
            const data = await response.json();
            setHistory(data);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred');
            }
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const handleDelete = async (id: string) => {
        try {
            const response = await fetch("/api/scan-history", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id }),
            });

            if (!response.ok) {
                throw new Error("Failed to delete scan");
            }

            fetchHistory(); // Refetch history after deletion
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred');
            }
        }
    };

    return (
        <Card className="w-full max-w-4xl mx-auto my-8">
            <CardHeader>
                <CardTitle>Scan History (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
                {error && <p className="text-red-500">{error}</p>}
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>URL</TableHead>
                            <TableHead>Safe Score</TableHead>
                            <TableHead>Unsafe Score</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {history.map((scan) => (
                            <TableRow key={scan.id}>
                                <TableCell>{scan.url}</TableCell>
                                <TableCell>{scan.safe_percentage?.toFixed(2) || '0.00'}</TableCell>
                                <TableCell>{scan.unsafe_percentage?.toFixed(2) || '0.00'}</TableCell>
                                <TableCell>{new Date(scan.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <Button variant="destructive" onClick={() => handleDelete(scan.id)}>
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
