"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { apiScanHistoryPrefix } from "@/routes";

interface HistoryEntry {
    id: string;
    url: string;
    status: string;
    safe_percentage: number;
    unsafe_percentage: number;
    ip_address: string;
    location: string;
    asn: string;
    country_code: string;
    last_checked: string;
}

const HistoryPage = () => {
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchHistory = async () => {
        try {
            const response = await fetch(`${apiScanHistoryPrefix}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data: HistoryEntry[] = await response.json();
            setHistory(data);
        } catch (e: unknown) {
            if (e instanceof Error) {
                setError(e.message);
            } else {
                setError("An unknown error occurred.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const handleDelete = async (id: string) => {
        try {
            const response = await fetch(`${apiScanHistoryPrefix}/delete-one`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id }),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            setHistory(history.filter((entry) => entry.id !== id));
            toast.success("History entry deleted successfully.");
        } catch (e: unknown) {
            if (e instanceof Error) {
                setError(e.message);
                toast.error(e.message);
            } else {
                setError("An unknown error occurred.");
                toast.error("An unknown error occurred.");
            }
        }
    };

    const handleClearAll = async () => {
        if (window.confirm("Are you sure you want to clear all history? This action cannot be undone.")) {
            try {
                const response = await fetch(`${apiScanHistoryPrefix}/clear-all`, {
                    method: "POST",
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                setHistory([]);
                toast.success("All history cleared successfully.");
            } catch (e: unknown) {
                if (e instanceof Error) {
                    setError(e.message);
                    toast.error(e.message);
                } else {
                    setError("An unknown error occurred.");
                    toast.error("An unknown error occurred.");
                }
            }
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading history...</div>;
    }

    if (error) {
        return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>;
    }

    return (
        <div className="container mx-auto py-10">
            <Card>
                <CardHeader>
                    <CardTitle>Browsing History (Last 30 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                    {history.length === 0 ? (
                        <p>No browsing history found for the last 30 days.</p>
                    ) : (
                        <>
                            <div className="flex justify-end mb-4">
                                <Button variant="destructive" onClick={handleClearAll}>
                                    Clear All History
                                </Button>
                            </div>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>URL</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Safe %</TableHead>
                                            <TableHead>Unsafe %</TableHead>
                                            <TableHead>IP Address</TableHead>
                                            <TableHead>Location</TableHead>
                                            <TableHead>ASN</TableHead>
                                            <TableHead>Country</TableHead>
                                            <TableHead>Last Checked</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {history.map((entry) => (
                                            <TableRow key={entry.id}>
                                                <TableCell className="font-medium">{entry.url}</TableCell>
                                                <TableCell>{entry.status}</TableCell>
                                                <TableCell>{entry.safe_percentage}</TableCell>
                                                <TableCell>{entry.unsafe_percentage}</TableCell>
                                                <TableCell>{entry.ip_address}</TableCell>
                                                <TableCell>{entry.location}</TableCell>
                                                <TableCell>{entry.asn}</TableCell>
                                                <TableCell>{entry.country_code}</TableCell>
                                                <TableCell>{new Date(entry.last_checked).toLocaleString()}</TableCell>
                                                <TableCell>
                                                    <Button variant="destructive" size="sm" onClick={() => handleDelete(entry.id)}>
                                                        Delete
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default HistoryPage;
