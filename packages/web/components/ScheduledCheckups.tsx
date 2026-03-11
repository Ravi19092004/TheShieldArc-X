"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Calendar, Play, Pause, Settings, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface ScheduledCheckup {
  id: string;
  name: string;
  type: 'password-audit' | 'software-updates' | 'security-scan' | 'privacy-check' | 'malware-scan';
  frequency: 'daily' | 'weekly' | 'monthly';
  nextRun: string;
  lastRun?: string;
  isActive: boolean;
  settings: {
    scanDepth?: 'quick' | 'full';
    includeSystem?: boolean;
    notifyOnFailure?: boolean;
    customSchedule?: string;
  };
}

const CHECKUP_TYPES = [
  { value: 'password-audit', label: 'Password Security Audit', description: 'Check password strength and reuse' },
  { value: 'software-updates', label: 'Software Updates Check', description: 'Scan for outdated software and security patches' },
  { value: 'security-scan', label: 'Security Vulnerability Scan', description: 'Comprehensive security assessment' },
  { value: 'privacy-check', label: 'Privacy Settings Review', description: 'Review privacy configurations' },
  { value: 'malware-scan', label: 'Malware Detection Scan', description: 'Scan for malware and suspicious files' }
];

export const ScheduledCheckups: React.FC = () => {
  const { data: session } = useSession();
  const [checkups, setCheckups] = useState<ScheduledCheckup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCheckup, setNewCheckup] = useState({
    name: '',
    type: 'security-scan' as ScheduledCheckup['type'],
    frequency: 'weekly' as ScheduledCheckup['frequency'],
    settings: {
      scanDepth: 'quick' as 'quick' | 'full',
      includeSystem: true,
      notifyOnFailure: true
    }
  });

  useEffect(() => {
    if (session?.user?.id) {
      fetchCheckups();
    }
  }, [session]);

  const fetchCheckups = async () => {
    try {
      const response = await fetch('/api/scheduled-checkups');
      if (response.ok) {
        const data = await response.json();
        setCheckups(data);
      }
    } catch (error) {
      console.error('Failed to fetch checkups:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCheckup = async () => {
    if (!newCheckup.name.trim()) {
      alert('Please enter a checkup name');
      return;
    }

    try {
      const response = await fetch('/api/scheduled-checkups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCheckup),
      });

      if (response.ok) {
        setShowCreateForm(false);
        setNewCheckup({
          name: '',
          type: 'security-scan',
          frequency: 'weekly',
          settings: {
            scanDepth: 'quick',
            includeSystem: true,
            notifyOnFailure: true
          }
        });
        await fetchCheckups();
      } else {
        alert('Failed to create checkup');
      }
    } catch (error) {
      console.error('Failed to create checkup:', error);
      alert('Error creating checkup');
    }
  };

  const toggleCheckup = async (checkupId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/scheduled-checkups/${checkupId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      });

      if (response.ok) {
        await fetchCheckups();
      }
    } catch (error) {
      console.error('Failed to toggle checkup:', error);
    }
  };

  const deleteCheckup = async (checkupId: string) => {
    if (!confirm('Are you sure you want to delete this scheduled checkup?')) return;

    try {
      const response = await fetch(`/api/scheduled-checkups/${checkupId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchCheckups();
      }
    } catch (error) {
      console.error('Failed to delete checkup:', error);
    }
  };

  const runCheckupNow = async (checkupId: string) => {
    try {
      const response = await fetch(`/api/scheduled-checkups/${checkupId}/run`, {
        method: 'POST',
      });

      if (response.ok) {
        alert('Checkup started successfully');
        await fetchCheckups();
      } else {
        alert('Failed to start checkup');
      }
    } catch (error) {
      console.error('Failed to run checkup:', error);
      alert('Error starting checkup');
    }
  };

  const getTypeLabel = (type: string) => {
    const checkupType = CHECKUP_TYPES.find(ct => ct.value === type);
    return checkupType?.label || type;
  };

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      default: return frequency;
    }
  };

  const getStatusBadge = (checkup: ScheduledCheckup) => {
    if (!checkup.isActive) {
      return <Badge variant="secondary">Inactive</Badge>;
    }

    const nextRun = new Date(checkup.nextRun);
    const now = new Date();
    const hoursUntil = (nextRun.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntil < 0) {
      return <Badge variant="destructive">Overdue</Badge>;
    } else if (hoursUntil < 24) {
      return <Badge className="bg-orange-100 text-orange-800">Due Soon</Badge>;
    } else {
      return <Badge className="bg-green-100 text-green-800">Scheduled</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <LoadingSpinner size={64} className="mb-4" />
            <p className="text-muted-foreground">Loading scheduled checkups...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                Scheduled Security Checkups
              </CardTitle>
              <CardDescription>
                Automate regular security scans and maintenance tasks
              </CardDescription>
            </div>
            <Button onClick={() => setShowCreateForm(!showCreateForm)}>
              <Settings className="w-4 h-4 mr-2" />
              {showCreateForm ? 'Cancel' : 'Create Checkup'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Create Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Scheduled Checkup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="checkup-name">Checkup Name</Label>
                <Input
                  id="checkup-name"
                  placeholder="Weekly Security Scan"
                  value={newCheckup.name}
                  onChange={(e) => setNewCheckup(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="checkup-type">Checkup Type</Label>
                <Select
                  value={newCheckup.type}
                  onValueChange={(value) => setNewCheckup(prev => ({ ...prev, type: value as ScheduledCheckup['type'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CHECKUP_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-muted-foreground">{type.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="frequency">Frequency</Label>
                <Select
                  value={newCheckup.frequency}
                  onValueChange={(value) => setNewCheckup(prev => ({ ...prev, frequency: value as ScheduledCheckup['frequency'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newCheckup.type === 'security-scan' && (
                <div>
                  <Label htmlFor="scan-depth">Scan Depth</Label>
                  <Select
                    value={newCheckup.settings.scanDepth}
                    onValueChange={(value) => setNewCheckup(prev => ({
                      ...prev,
                      settings: { ...prev.settings, scanDepth: value as 'quick' | 'full' }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="quick">Quick Scan</SelectItem>
                      <SelectItem value="full">Full Scan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-system"
                  checked={newCheckup.settings.includeSystem}
                  onCheckedChange={(checked) => setNewCheckup(prev => ({
                    ...prev,
                    settings: { ...prev.settings, includeSystem: checked === true }
                  }))}
                />
                <Label htmlFor="include-system">Include system-wide checks</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="notify-failure"
                  checked={newCheckup.settings.notifyOnFailure}
                  onCheckedChange={(checked) => setNewCheckup(prev => ({
                    ...prev,
                    settings: { ...prev.settings, notifyOnFailure: checked === true }
                  }))}
                />
                <Label htmlFor="notify-failure">Notify on checkup failure</Label>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
              <Button onClick={createCheckup}>
                Create Checkup
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Checkups List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {checkups.map((checkup) => (
          <Card key={checkup.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {checkup.isActive ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-gray-400" />
                  )}
                  {getStatusBadge(checkup)}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteCheckup(checkup.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <CardTitle className="text-lg">{checkup.name}</CardTitle>
              <CardDescription>
                {getTypeLabel(checkup.type)} • {getFrequencyLabel(checkup.frequency)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Next run:</span>
                  <span>{new Date(checkup.nextRun).toLocaleString()}</span>
                </div>

                {checkup.lastRun && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Last run:</span>
                    <span>{new Date(checkup.lastRun).toLocaleString()}</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleCheckup(checkup.id, !checkup.isActive)}
                    className="flex-1"
                  >
                    {checkup.isActive ? (
                      <>
                        <Pause className="w-3 h-3 mr-1" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 mr-1" />
                        Resume
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => runCheckupNow(checkup.id)}
                    className="flex-1"
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Run Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {checkups.length === 0 && !showCreateForm && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No scheduled checkups yet.</p>
              <p className="text-sm">Create automated security scans to keep your system protected.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      {checkups.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Checkup Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {checkups.length}
                </div>
                <div className="text-sm text-muted-foreground">Total Checkups</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {checkups.filter(c => c.isActive).length}
                </div>
                <div className="text-sm text-muted-foreground">Active</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {checkups.filter(c => {
                    const nextRun = new Date(c.nextRun);
                    const now = new Date();
                    return c.isActive && (nextRun.getTime() - now.getTime()) / (1000 * 60 * 60) < 24;
                  }).length}
                </div>
                <div className="text-sm text-muted-foreground">Due Soon</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {checkups.filter(c => {
                    const nextRun = new Date(c.nextRun);
                    const now = new Date();
                    return c.isActive && nextRun < now;
                  }).length}
                </div>
                <div className="text-sm text-muted-foreground">Overdue</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
