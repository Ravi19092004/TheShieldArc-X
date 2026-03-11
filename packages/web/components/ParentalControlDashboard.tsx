"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Shield, Clock, Globe, Plus, Trash2 } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface ParentalControl {
  id?: string; // Make id optional as it might not exist for new controls
  userId: string;
  enabled: boolean;
  blocklist: string[];
  timeLimits: {
    enabled: boolean;
    dailyLimit: number; // minutes
    allowedHours: { start: string; end: string };
  };
  safeBrowsing: boolean;
  contentFiltering: boolean;
  createdAt: string;
  updatedAt: string;
}

export const ParentalControlDashboard: React.FC = () => {
  const { data: session } = useSession();
  const [controls, setControls] = useState<ParentalControl | null>(null); // Initialize as null, let fetchControls populate
  const [loading, setLoading] = useState(true);
  const [newBlockSite, setNewBlockSite] = useState('');

  const fetchControls = useCallback(async () => {
    try {
      const response = await fetch('/api/parental-controls');
      if (response.ok) {
        const data: ParentalControl = await response.json();
        // Ensure timeLimits is always an object, even if API returned null (though API fix should prevent this)
        if (data.timeLimits === null || data.timeLimits === undefined) {
          data.timeLimits = { enabled: false, dailyLimit: 120, allowedHours: { start: '08:00', end: '20:00' } };
        }
        data.userId = data.userId || session?.user?.id || ''; // Ensure userId is set, especially for default objects
        setControls(data);
      }
    } catch (error) {
      console.error('Failed to fetch parental controls:', error);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (session?.user?.id) { // Fetch whenever session.user.id changes
      fetchControls();
    }
  }, [session, fetchControls]);

  const updateControls = async (updates: Partial<ParentalControl>) => {
    try {
      const response = await fetch('/api/parental-controls', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (response.ok) {
        await fetchControls();
      }
    } catch (error) {
      console.error('Failed to update controls:', error);
    }
  };

  const addToBlocklist = async () => {
    if (!newBlockSite.trim() || !controls) return;

    const updatedBlocklist = [...controls.blocklist, newBlockSite.trim()];
    await updateControls({ blocklist: updatedBlocklist });
    setNewBlockSite('');
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="text-center">
            <LoadingSpinner size={64} className="mb-4" />
            Loading parental controls...
          </div>
        </CardContent>
      </Card>
    );
  }

  // If controls is null after loading (e.g., API error or no session), display a message
  if (!controls || !session?.user?.id) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            {session?.user?.id ? "No parental controls configured or failed to load." : "Please log in to manage parental controls."}
          </div>
        </CardContent>
      </Card>
    );
  }

  const removeFromBlocklist = async (site: string) => {
    // controls is guaranteed to be not null here due to the check above
    const updatedBlocklist = controls.blocklist.filter(s => s !== site);
    await updateControls({ blocklist: updatedBlocklist });
  };

  return (
    <div className="space-y-6">
      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-500" />
            Parental Controls
          </CardTitle>
          <CardDescription>
            Protect your family with comprehensive web filtering and time management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enable-controls" className="text-base font-medium">
                Enable Parental Controls
              </Label>
              <p className="text-sm text-muted-foreground">
                Activate all parental control features
              </p>
            </div>
            <Checkbox
              id="enable-controls"
              checked={controls.enabled}
              onCheckedChange={(checked) => updateControls({ enabled: checked === true })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Blocklist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-red-500" />
            Website Blocklist
          </CardTitle>
          <CardDescription>
            Prevent access to specific websites
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter website URL (e.g., example.com)"
              value={newBlockSite}
              onChange={(e) => setNewBlockSite(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addToBlocklist()}
            />
            <Button onClick={addToBlocklist} disabled={!newBlockSite.trim()}>
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>

          <div className="space-y-2">
            {controls.blocklist.length === 0 ? (
              <p className="text-sm text-muted-foreground">No blocked websites</p>
            ) : (
              controls.blocklist.map((site, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-red-50 rounded">
                  <span className="text-sm">{site}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFromBlocklist(site)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Time Limits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-green-500" />
            Time Limits
          </CardTitle>
          <CardDescription>
            Set daily usage limits and allowed browsing hours
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Enable Time Limits</Label>
              <p className="text-sm text-muted-foreground">
                Restrict browsing time and hours
              </p>
            </div>
            <Checkbox
              checked={controls.timeLimits.enabled}
              onCheckedChange={(enabled) =>
                updateControls({
                  timeLimits: { ...controls.timeLimits, enabled: enabled === true }
                })
              }
            />
          </div>

          {controls.timeLimits.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="daily-limit">Daily Limit (minutes)</Label>
                <Input
                  id="daily-limit"
                  type="number"
                  value={controls.timeLimits.dailyLimit}
                  onChange={(e) =>
                    updateControls({
                      timeLimits: {
                        ...controls.timeLimits,
                        dailyLimit: parseInt(e.target.value) || 0
                      }
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Allowed Hours</Label>
                <div className="flex gap-2">
                  <Input
                    type="time"
                    value={controls.timeLimits.allowedHours.start}
                    onChange={(e) =>
                      updateControls({
                        timeLimits: {
                          ...controls.timeLimits,
                          allowedHours: {
                            ...controls.timeLimits.allowedHours,
                            start: e.target.value
                          }
                        }
                      })
                    }
                  />
                  <span className="self-center">to</span>
                  <Input
                    type="time"
                    value={controls.timeLimits.allowedHours.end}
                    onChange={(e) =>
                      updateControls({
                        timeLimits: {
                          ...controls.timeLimits,
                          allowedHours: {
                            ...controls.timeLimits.allowedHours,
                            end: e.target.value
                          }
                        }
                      })
                    }
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Safe Browsing</Label>
                <p className="text-sm text-muted-foreground">
                  Filter inappropriate content
                </p>
              </div>
              <Checkbox
                checked={controls.safeBrowsing}
                onCheckedChange={(checked) => updateControls({ safeBrowsing: checked === true })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Content Filtering</Label>
                <p className="text-sm text-muted-foreground">
                  Block adult and harmful content
                </p>
              </div>
              <Checkbox
                checked={controls.contentFiltering}
                onCheckedChange={(checked) => updateControls({ contentFiltering: checked === true })}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
