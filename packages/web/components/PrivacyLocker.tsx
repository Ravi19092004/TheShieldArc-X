//packages/web/components/PrivacyLocker.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Lock, Unlock, Plus, Trash2, Shield, Key, X } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useSession } from 'next-auth/react';

interface EncryptedItem {
  id: string;
  title: string;
  type: string;
  encryptedContent: string;
  iv: string;
  createdAt: string;
  updatedAt: string;
}

export const PrivacyLocker: React.FC = () => {
  const { data: session } = useSession();
  const [items, setItems] = useState<EncryptedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<EncryptedItem | null>(null);
  const [decryptedContent, setDecryptedContent] = useState<string>('');
  const [showDecrypted, setShowDecrypted] = useState(false);

  // Form state for adding new items
  const [newItem, setNewItem] = useState({
    title: '',
    type: 'note' as 'password' | 'note' | 'document' | 'key',
    content: '',
    password: ''
  });

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/privacy-locker');
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      }
    } catch (error) {
      console.error('Failed to fetch privacy locker items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchItems();
    }
  }, [session]);

  const generateKey = async (password: string): Promise<CryptoKey> => {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: encoder.encode('DataShield.Ai-Salt'),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  };

  const encryptData = async (data: string, password: string): Promise<{ encrypted: string; iv: string }> => {
    const key = await generateKey(password);
    const encoder = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoder.encode(data)
    );

    return {
      encrypted: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
      iv: btoa(String.fromCharCode(...iv))
    };
  };

  const decryptData = async (encryptedData: string, iv: string, password: string): Promise<string> => {
    try {
      const key = await generateKey(password);
      const encrypted = new Uint8Array(atob(encryptedData).split('').map(c => c.charCodeAt(0)));
      const ivBytes = new Uint8Array(atob(iv).split('').map(c => c.charCodeAt(0)));

      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: ivBytes },
        key,
        encrypted
      );

      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
    } catch {
      throw new Error('Failed to decrypt data. Please check your password.');
    }
  };

  const addItem = async () => {
    if (!newItem.title.trim() || !newItem.content.trim() || !newItem.password.trim()) {
      alert('Please fill in all fields');
      return;
    }
    try {
      const { encrypted: encryptedContent, iv } = await encryptData(newItem.content, newItem.password);

      const response = await fetch('/api/privacy-locker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newItem.title,
          type: newItem.type,
          encryptedContent,
          iv
        }),
      });

      if (response.ok) {
        setNewItem({ title: '', type: 'note', content: '', password: '' });
        setShowAddForm(false);
        await fetchItems();
      }
    } catch (error) {
      console.error('Failed to add item:', error);
      alert('Failed to encrypt and save item');
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const response = await fetch(`/api/privacy-locker?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchItems();
        if (selectedItem?.id === id) {
          setSelectedItem(null);
          setDecryptedContent('');
          setShowDecrypted(false);
        }
      }
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const viewItem = async (item: EncryptedItem) => {
    const password = prompt('Enter your password to decrypt this item:');
    if (!password) return;

    try {
      const decrypted = await decryptData(item.encryptedContent, item.iv, password);
      setSelectedItem(item);
      setDecryptedContent(decrypted);
      setShowDecrypted(true);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Decryption failed');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'password': return <Key className="w-4 h-4" />;
      case 'note': return <Shield className="w-4 h-4" />;
      case 'document': return <Lock className="w-4 h-4" />;
      case 'key': return <Key className="w-4 h-4" />;
      default: return <Lock className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'password': return 'bg-blue-50 border-blue-200';
      case 'note': return 'bg-green-50 border-green-200';
      case 'document': return 'bg-purple-50 border-purple-200';
      case 'key': return 'bg-orange-50 border-orange-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="text-center">
            <LoadingSpinner size={64} className="mb-4" />
            <p className="text-muted-foreground">Unlocking your secure locker...</p>
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
                Privacy Locker
              </CardTitle>
              <CardDescription>
                Securely store sensitive information with client-side encryption
              </CardDescription>
            </div>
            <Button onClick={() => setShowAddForm(!showAddForm)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Add Item Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Item</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  placeholder="Item title"
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <select
                  id="type"
                  value={newItem.type}
                  onChange={(e) => setNewItem({ ...newItem, type: e.target.value as 'password' | 'note' | 'document' | 'key' })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="note">Note</option>
                  <option value="password">Password</option>
                  <option value="document">Document</option>
                  <option value="key">Encryption Key</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="password">Encryption Password</Label>
              <Input
                id="password"
                type="password"
                value={newItem.password}
                onChange={(e) => setNewItem({ ...newItem, password: e.target.value })}
                placeholder="Enter a strong password"
              />
            </div>
            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={newItem.content}
                onChange={(e) => setNewItem({ ...newItem, content: e.target.value })}
                placeholder="Enter the content to encrypt"
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={addItem}>Encrypt & Save</Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Items List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <Card key={item.id} className={`border-l-4 ${getTypeColor(item.type)}`}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  {getTypeIcon(item.type)}
                  <Badge variant="outline" className="text-xs">
                    {item.type}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteItem(item.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <h3 className="font-medium mb-2">{item.title}</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Created {new Date(item.createdAt).toLocaleDateString('en-IN')}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => viewItem(item)}
                className="w-full"
              >
                <Unlock className="w-4 h-4 mr-2" />
                Decrypt & View
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {items.length === 0 && !showAddForm && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <Lock className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No items in your privacy locker yet.</p>
              <p className="text-sm">Add your first encrypted item to get started.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Decrypted Content Modal */}
      {selectedItem && showDecrypted && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getTypeIcon(selectedItem.type)}
                  <CardTitle>{selectedItem.title}</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedItem(null);
                    setDecryptedContent('');
                    setShowDecrypted(false);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              <div className="bg-gray-50 p-4 rounded-md">
                <pre className="whitespace-pre-wrap text-sm">{decryptedContent}</pre>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
