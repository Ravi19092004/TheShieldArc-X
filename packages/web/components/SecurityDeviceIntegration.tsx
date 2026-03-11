//packages/web/components/SecurityDeviceIntegration.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
/**
 * Fallback lightweight Dialog components to avoid a missing module error.
 * These are minimal wrappers used only in this file; replace with real shared components
 * when a dialog component library or shared ui component is available.
 */
const Dialog: React.FC<{ open?: boolean; onOpenChange?: (open: boolean) => void; children?: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};
const DialogTrigger: React.FC<React.PropsWithChildren<{ asChild?: boolean }>> = ({ children }) => {
  return <>{children}</>;
};
const DialogContent: React.FC<React.PropsWithChildren<Record<string, unknown>>> = ({ children }) => {
  return <div className="dialog-content">{children}</div>;
};
const DialogHeader: React.FC<React.PropsWithChildren<Record<string, unknown>>> = ({ children }) => {
  return <div className="dialog-header">{children}</div>;
};
const DialogTitle: React.FC<React.PropsWithChildren<Record<string, unknown>>> = ({ children }) => {
  return <h3 className="dialog-title">{children}</h3>;
};
const DialogDescription: React.FC<React.PropsWithChildren<Record<string, unknown>>> = ({ children }) => {
  return <p className="dialog-description">{children}</p>;
};
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Shield, Key, Smartphone, Usb, Plus, Trash2, RefreshCw } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface SecurityDevice {
  id: string;
  name: string;
  type: 'yubikey' | 'totp' | 'hardware-token';
  deviceId: string;
  isActive: boolean;
  lastUsedAt?: string;
  createdAt: string;
}

export const SecurityDeviceIntegration: React.FC = () => {
  const { data: session } = useSession();
  const [devices, setDevices] = useState<SecurityDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newDevice, setNewDevice] = useState({
    name: '',
    type: 'yubikey' as 'yubikey' | 'totp' | 'hardware-token',
    secret: ''
  });

  useEffect(() => {
    if (session?.user?.id) {
      fetchDevices();
    }
  }, [session]);

  const fetchDevices = async () => {
    try {
      const response = await fetch('/api/security-devices');
      if (response.ok) {
        const data = await response.json();
        setDevices(data);
      }
    } catch (error) {
      console.error('Failed to fetch devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const registerDevice = async () => {
    if (!newDevice.name.trim()) {
      alert('Please enter a device name');
      return;
    }

    try {
      const response = await fetch('/api/security-devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDevice),
      });

      if (response.ok) {
        setShowAddDialog(false);
        setNewDevice({ name: '', type: 'yubikey', secret: '' });
        await fetchDevices();
      } else {
        alert('Failed to register device');
      }
    } catch (error) {
      console.error('Failed to register device:', error);
      alert('Error registering device');
    }
  };

  const removeDevice = async (deviceId: string) => {
    if (!confirm('Are you sure you want to remove this device?')) return;

    try {
      const response = await fetch(`/api/security-devices/${deviceId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchDevices();
      } else {
        alert('Failed to remove device');
      }
    } catch (error) {
      console.error('Failed to remove device:', error);
      alert('Error removing device');
    }
  };

  const testDevice = async (device: SecurityDevice) => {
    try {
      const response = await fetch(`/api/security-devices/${device.id}/test`, {
        method: 'POST',
      });

      if (response.ok) {
        alert('Device test successful!');
        await fetchDevices(); // Refresh to update lastUsedAt
      } else {
        alert('Device test failed');
      }
    } catch (error) {
      console.error('Failed to test device:', error);
      alert('Error testing device');
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'yubikey': return <Usb className="w-5 h-5" />;
      case 'totp': return <Smartphone className="w-5 h-5" />;
      case 'hardware-token': return <Key className="w-5 h-5" />;
      default: return <Shield className="w-5 h-5" />;
    }
  };

  const getDeviceTypeLabel = (type: string) => {
    switch (type) {
      case 'yubikey': return 'YubiKey';
      case 'totp': return 'TOTP Authenticator';
      case 'hardware-token': return 'Hardware Token';
      default: return type;
    }
  };

  const generateTOTPSecret = () => {
    // Generate a random 32-character base32 secret
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewDevice(prev => ({ ...prev, secret }));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <LoadingSpinner size={64} className="mb-4" />
            <p className="text-muted-foreground">Initializing security device protocols...</p>
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
                <Shield className="w-5 h-5 text-green-500" />
                Security Device Integration
              </CardTitle>
              <CardDescription>
                Manage hardware security keys, TOTP authenticators, and other security devices
              </CardDescription>
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Device
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Security Device</DialogTitle>
                  <DialogDescription>
                    Register a new hardware security device for enhanced authentication.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="device-name">Device Name</Label>
                    <Input
                      id="device-name"
                      placeholder="My YubiKey"
                      value={newDevice.name}
                      onChange={(e) => setNewDevice(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="device-type">Device Type</Label>
                    <select
                      id="device-type"
                      value={newDevice.type}
                      onChange={(e) =>
                        setNewDevice(prev => ({ ...prev, type: e.target.value as 'yubikey' | 'totp' | 'hardware-token' }))
                      }
                      className="w-full p-2 border rounded-md bg-background"
                    >
                      <option value="yubikey">YubiKey</option>
                      <option value="totp">TOTP Authenticator</option>
                      <option value="hardware-token">Hardware Token</option>
                    </select>
                  </div>

                  {newDevice.type === 'totp' && (
                    <div>
                      <Label htmlFor="totp-secret">TOTP Secret (Base32)</Label>
                      <div className="flex gap-2">
                        <Input
                          id="totp-secret"
                          placeholder="JBSWY3DPEHPK3PXP"
                          value={newDevice.secret}
                          onChange={(e) => setNewDevice(prev => ({ ...prev, secret: e.target.value }))}
                        />
                        <Button type="button" variant="outline" onClick={generateTOTPSecret}>
                          Generate
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        This secret will be used to generate time-based one-time passwords.
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={registerDevice}>
                      Register Device
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Device List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {devices.map((device) => (
          <Card key={device.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getDeviceIcon(device.type)}
                  <Badge variant={device.isActive ? "default" : "secondary"}>
                    {device.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeDevice(device.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <CardTitle className="text-lg">{device.name}</CardTitle>
              <CardDescription>{getDeviceTypeLabel(device.type)}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">
                  <span className="text-muted-foreground">Device ID:</span>
                  <code className="ml-1 text-xs bg-gray-100 px-1 py-0.5 rounded">
                    {device.deviceId}
                  </code>
                </div>

                {device.lastUsedAt && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Last used:</span>
                    <span className="ml-1">{new Date(device.lastUsedAt).toLocaleDateString('en-IN')}</span>
                  </div>
                )}

                <div className="text-sm">
                  <span className="text-muted-foreground">Added:</span>
                  <span className="ml-1">{new Date(device.createdAt).toLocaleDateString('en-IN')}</span>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => testDevice(device)}
                    className="flex-1"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Test
                  </Button>
                  <Button
                    size="sm"
                    variant={device.isActive ? "secondary" : "default"}
                    onClick={() => {/* Toggle active status */}}
                    className="flex-1"
                  >
                    {device.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {devices.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No security devices registered yet.</p>
              <p className="text-sm">Add a YubiKey, TOTP authenticator, or hardware token for enhanced security.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Setup Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Usb className="w-4 h-4" />
              YubiKey Setup
            </h4>
            <ol className="text-sm text-muted-foreground space-y-1 ml-6">
              <li>1. Insert your YubiKey into a USB port</li>
              <li>2. Click &quot;Add Device&quot; and select &quot;YubiKey&quot;</li>
              <li>3. Follow the browser prompts to register the key</li>
              <li>4. Test the device to ensure it&apos;s working</li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              TOTP Authenticator Setup
            </h4>
            <ol className="text-sm text-muted-foreground space-y-1 ml-6">
              <li>1. Install an authenticator app (Google Authenticator, Authy, etc.)</li>
              <li>2. Click &quot;Add Device&quot; and select &quot;TOTP Authenticator&quot;</li>
              <li>3. Use the generated secret or scan the QR code in your app</li>
              <li>4. Test by generating a code and verifying it works</li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Key className="w-4 h-4" />
              Hardware Token Setup
            </h4>
            <ol className="text-sm text-muted-foreground space-y-1 ml-6">
              <li>1. Ensure your hardware token is compatible</li>
              <li>2. Click &quot;Add Device&quot; and select &quot;Hardware Token&quot;</li>
              <li>3. Follow device-specific setup instructions</li>
              <li>4. Test the integration thoroughly</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
