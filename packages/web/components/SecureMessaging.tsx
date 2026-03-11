"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Send, Lock, Users, Search } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  iv: string;
  timestamp: string;
  isRead: boolean;
  sender: {
    name: string;
    email: string;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
}

export const SecureMessaging: React.FC = () => {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (session?.user?.id) {
      fetchUsers();
    }
  }, [session]);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser.id);
    }
  }, [selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/secure-messaging/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchMessages = async (userId: string) => {
    try {
      const response = await fetch(`/api/secure-messaging/messages?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

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
        salt: encoder.encode('DataShield-SecureMessaging'),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  };

  const encryptMessage = async (content: string): Promise<{ encrypted: string; iv: string }> => {
    const password = prompt('Enter encryption password for this message:');
    if (!password) throw new Error('Password required for encryption');

    const key = await generateKey(password);
    const encoder = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoder.encode(content)
    );

    return {
      encrypted: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
      iv: btoa(String.fromCharCode(...iv))
    };
  };

  const decryptMessage = async (encryptedData: string, iv: string): Promise<string> => {
    const password = prompt('Enter password to decrypt this message:');
    if (!password) throw new Error('Password required for decryption');

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
      throw new Error('Failed to decrypt message. Please check your password.');
    }
  };
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;
    setLoading(true);
    try {
      const { encrypted, iv } = await encryptMessage(newMessage);

      const response = await fetch('/api/secure-messaging/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: selectedUser.id,
          content: encrypted,
          iv
        }),
      });

      if (response.ok) {
        setNewMessage('');
        await fetchMessages(selectedUser.id);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      alert(error instanceof Error ? error.message : 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const viewDecryptedMessage = async (message: Message) => {
    try {
      const decrypted = await decryptMessage(message.content, message.iv);
      alert(`Decrypted message: ${decrypted}`);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to decrypt message');
    }
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="flex h-[600px] gap-4">
      {/* Users List */}
      <Card className="w-1/3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Contacts
          </CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-1 max-h-[500px] overflow-y-auto">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className={`p-3 cursor-pointer hover:bg-gray-50 border-l-4 ${
                  selectedUser?.id === user.id ? 'border-blue-500 bg-blue-50' : 'border-transparent'
                }`}
                onClick={() => setSelectedUser(user)}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs">
                      {getInitials(user.name || user.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{user.name || 'Unknown'}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Messages */}
      <Card className="flex-1">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                {selectedUser ? `Chat with ${selectedUser.name || selectedUser.email}` : 'Select a contact'}
              </CardTitle>
              <CardDescription className="flex items-center gap-1">
                <Lock className="w-4 h-4" />
                End-to-end encrypted messaging
              </CardDescription>
            </div>
            {selectedUser && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Encrypted
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex flex-col h-[500px]">
          {/* Messages List */}
          <div className="flex-1 overflow-y-auto space-y-3 mb-4">
            {selectedUser ? (
              messages.length > 0 ? (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === session?.user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-lg cursor-pointer ${
                        message.senderId === session?.user?.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100'
                      }`}
                      onClick={() => viewDecryptedMessage(message)}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Lock className="w-3 h-3" />
                        <span className="text-xs opacity-75">Encrypted Message</span>
                      </div>
                      <p className="text-sm">[Click to decrypt]</p>
                      <p className="text-xs opacity-75 mt-1">
                        {new Date(message.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No messages yet. Start the conversation!</p>
                </div>
              )
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select a contact to start messaging</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          {selectedUser && (
            <div className="flex gap-2">
              <Textarea
                placeholder="Type your encrypted message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                className="flex-1"
                rows={2}
              />
              <Button
                onClick={sendMessage}
                disabled={loading || !newMessage.trim()}
                className="self-end"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
