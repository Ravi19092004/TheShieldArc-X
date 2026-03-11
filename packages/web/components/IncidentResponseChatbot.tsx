"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { MessageSquare, Send, Bot, User, AlertTriangle, Shield, CheckCircle } from 'lucide-react';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  actions?: string[];
  steps?: string[];
  completedSteps?: boolean[];
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

interface IncidentScenario {
  id: string;
  title: string;
  description: string;
  steps: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
}

const INCIDENT_SCENARIOS: IncidentScenario[] = [
  {
    id: 'phishing',
    title: 'Phishing Attack',
    description: 'Responding to a suspected phishing email or website',
    priority: 'high',
    steps: [
      'Do not click any links or download attachments',
      'Report the incident to your IT security team',
      'Change passwords for affected accounts',
      'Enable two-factor authentication',
      'Monitor accounts for suspicious activity',
      'Scan your device for malware'
    ]
  },
  {
    id: 'malware',
    title: 'Malware Infection',
    description: 'Detected malware on your system',
    priority: 'critical',
    steps: [
      'Disconnect from the network immediately',
      'Run a full antivirus scan',
      'Quarantine infected files',
      'Change all passwords',
      'Update all software and security patches',
      'Monitor system for unusual behavior',
      'Consider professional help if needed'
    ]
  },
  {
    id: 'data-breach',
    title: 'Data Breach',
    description: 'Suspected unauthorized access to sensitive data',
    priority: 'critical',
    steps: [
      'Contain the breach by securing affected systems',
      'Assess the scope and impact of the breach',
      'Notify affected individuals and authorities',
      'Preserve evidence for investigation',
      'Review and update security measures',
      'Implement additional monitoring',
      'Communicate transparently with stakeholders'
    ]
  },
  {
    id: 'ransomware',
    title: 'Ransomware Attack',
    description: 'Files encrypted by ransomware',
    priority: 'critical',
    steps: [
      'Isolate affected systems from the network',
      'Do not pay the ransom',
      'Report to law enforcement (FBI, local authorities)',
      'Restore from clean backups',
      'Scan for and remove malware',
      'Update security measures',
      'Review backup and recovery procedures'
    ]
  },
  {
    id: 'credential-theft',
    title: 'Credential Theft',
    description: 'Stolen usernames and passwords',
    priority: 'high',
    steps: [
      'Change all compromised passwords immediately',
      'Enable two-factor authentication everywhere',
      'Review account activity logs',
      'Notify service providers',
      'Monitor for unauthorized access',
      'Use a password manager',
      'Consider credit monitoring services'
    ]
  }
];

export const IncidentResponseChatbot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Hello! I\'m your Incident Response Assistant. I can help you respond to security incidents. What type of security issue are you experiencing?',
      timestamp: new Date(),
      actions: ['Phishing Attack', 'Malware Infection', 'Data Breach', 'Ransomware', 'Credential Theft', 'Other Issue']
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentScenario, setCurrentScenario] = useState<IncidentScenario | null>(null);
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    addMessage(userMessage);
    setInput('');
    setIsTyping(true);

    // Simulate bot response delay
    setTimeout(() => {
      handleBotResponse(input);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000);
  };

  const handleBotResponse = (userInput: string) => {
    const input = userInput.toLowerCase();

    // Check for specific incident types
    const scenario = INCIDENT_SCENARIOS.find(s =>
      input.includes(s.id) || input.includes(s.title.toLowerCase())
    );

    if (scenario) {
      setCurrentScenario(scenario);
      setCompletedSteps(new Array(scenario.steps.length).fill(false));

      const response: ChatMessage = {
        id: Date.now().toString(),
        type: 'bot',
        content: `I understand you're dealing with a ${scenario.title}. This is classified as a ${scenario.priority} priority incident. Here's your response plan:`,
        timestamp: new Date(),
        actions: ['Show Detailed Steps', 'Report Incident', 'Get Emergency Contacts']
      };
      addMessage(response);

      // Add detailed steps with checkboxes
      setTimeout(() => {
        const stepsMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: `**Response Steps for ${scenario.title}:**`,
          timestamp: new Date(),
          steps: scenario.steps,
          completedSteps: new Array(scenario.steps.length).fill(false),
          priority: scenario.priority
        };
        addMessage(stepsMessage);
      }, 500);
    } else if (input.includes('help') || input.includes('what')) {
      const helpMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'bot',
        content: 'I can help you respond to various security incidents. Common scenarios include:\n\n• Phishing attacks\n• Malware infections\n• Data breaches\n• Ransomware\n• Credential theft\n\nJust describe your situation, and I\'ll provide step-by-step guidance.',
        timestamp: new Date(),
        actions: ['Start Incident Response', 'Emergency Contacts', 'Prevention Tips']
      };
      addMessage(helpMessage);
    } else if (input.includes('emergency') || input.includes('contact')) {
      const contactsMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'bot',
        content: '🚨 **Emergency Contacts:**\n\n**Cybersecurity Incidents:**\n• FBI Internet Crime Complaint Center: ic3.gov\n• Local Law Enforcement\n• Cybersecurity & Infrastructure Security Agency (CISA)\n\n**Financial Fraud:**\n• Your Bank Fraud Department\n• Federal Trade Commission: ftc.gov/complaint\n\n**Identity Theft:**\n• IdentityTheft.gov\n• Credit Reporting Agencies\n\n**Technical Support:**\n• Your IT Security Team\n• Antivirus Software Provider',
        timestamp: new Date()
      };
      addMessage(contactsMessage);
    } else {
      const genericResponse: ChatMessage = {
        id: Date.now().toString(),
        type: 'bot',
        content: 'I\'m here to help with security incidents. Could you provide more details about what happened? For example:\n\n• Did you receive a suspicious email?\n• Is your computer behaving strangely?\n• Did you notice unauthorized account activity?\n\nOr you can choose from common incident types above.',
        timestamp: new Date(),
        actions: ['Phishing Attack', 'Malware Infection', 'Data Breach', 'Ransomware', 'Credential Theft']
      };
      addMessage(genericResponse);
    }
  };

  const handleActionClick = (action: string) => {
    setInput(action);
    handleSendMessage();
  };

  const handleStepToggle = (stepIndex: number) => {
    if (!currentScenario) return;

    const newCompletedSteps = [...completedSteps];
    newCompletedSteps[stepIndex] = !newCompletedSteps[stepIndex];
    setCompletedSteps(newCompletedSteps);

    // Update the message with the new completed steps
    setMessages(prevMessages =>
      prevMessages.map(msg =>
        msg.steps ? { ...msg, completedSteps: newCompletedSteps } : msg
      )
    );
  };

  const getProgressPercentage = () => {
    if (!currentScenario || completedSteps.length === 0) return 0;
    const completed = completedSteps.filter(Boolean).length;
    return Math.round((completed / currentScenario.steps.length) * 100);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <Shield className="w-4 h-4" />;
      case 'low': return <CheckCircle className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex h-[600px] gap-4">
      {/* Incident Scenarios Sidebar */}
      <Card className="w-1/3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Incident Types
          </CardTitle>
          <CardDescription>
            Common security incidents and their priorities
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {INCIDENT_SCENARIOS.map((scenario) => (
              <div
                key={scenario.id}
                className="p-3 border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => handleActionClick(scenario.title)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-sm">{scenario.title}</h4>
                  <Badge className={getPriorityColor(scenario.priority)}>
                    {getPriorityIcon(scenario.priority)}
                    <span className="ml-1 capitalize">{scenario.priority}</span>
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{scenario.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card className="flex-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Incident Response Assistant
          </CardTitle>
          <CardDescription>
            Get immediate guidance for security incidents
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col h-[500px]">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>
                      {message.type === 'bot' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </AvatarFallback> 
                  </Avatar>
                  <div className={`rounded-lg p-3 ${
                    message.type === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-800 text-gray-100'
                  }`}>
                    <p className="text-sm whitespace-pre-line text-gray-100">{message.content}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                    {message.actions && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {message.actions.map((action, index) => (
                          <Button
                            key={index}
                            size="sm"
                            variant="outline"
                            onClick={() => handleActionClick(action)}
                            className="text-xs h-7"
                          >
                            {action}
                          </Button>
                        ))}
                      </div>
                    )}
                    {message.steps && message.completedSteps && (
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Progress</span>
                          <span className="text-sm text-muted-foreground">
                            {message.completedSteps.filter(Boolean).length}/{message.steps.length} completed
                          </span>
                        </div>
                        <Progress value={getProgressPercentage()} className="h-2" />
                        <div className="space-y-2 mt-3">
                          {message.steps.map((step, index) => (
                            <div key={index} className="flex items-start gap-3">
                              <Checkbox
                                checked={message.completedSteps?.[index] ?? false}
                                onCheckedChange={() => handleStepToggle(index)}
                                className="mt-0.5"
                              />
                              <span className={`text-sm ${message.completedSteps?.[index] ? 'line-through text-muted-foreground' : ''}`}>
                                {step}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="flex gap-3 max-w-[80%]">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>
                      <Bot className="w-4 h-4" />
                      </AvatarFallback> 
                  </Avatar>
                  <div className="bg-gray-100 rounded-lg p-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Describe your security incident..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} disabled={!input.trim() || isTyping}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
