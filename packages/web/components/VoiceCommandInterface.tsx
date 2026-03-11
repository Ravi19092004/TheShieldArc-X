//packages/web/components/VoiceCommandInterface.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Volume2, Settings, Play, Square, X } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface VoiceCommand {
  command: string;
  action: string;
  description: string;
  authRequired: boolean;
}

const AVAILABLE_COMMANDS: readonly VoiceCommand[] = [
  // Authentication
  { command: "open login page", action: "login", description: "Go to the login page", authRequired: false },
  { command: "open register page", action: "register", description: "Go to the registration page", authRequired: false },
  { command: "log out", action: "logout", description: "Log out of your account", authRequired: true },
  // Main Navigation
  { command: "go to dashboard", action: "dashboard", description: "Open the main dashboard", authRequired: true },
  { command: "go home", action: "home", description: "Go to the landing page", authRequired: false },
  { command: "update profile", action: "update_profile", description: "Open profile settings", authRequired: true },
  { command: "view pricing", action: "pricing", description: "See pricing plans", authRequired: true },
  { command: "view scan history", action: "scan_history", description: "Open your scan history", authRequired: true },

  // Security Tools
  { command: "open threat intelligence", action: "threat_intelligence", description: "View the threat intelligence feed", authRequired: true },
  { command: "open browser sandbox", action: "browser_sandbox", description: "Analyze a site in the sandbox", authRequired: true },
  { command: "open incident response", action: "incident_response", description: "Get help with a security incident", authRequired: true },
  { command: "open privacy locker", action: "privacy_locker", description: "Access your encrypted privacy locker", authRequired: true },
  { command: "open secure messaging", action: "secure_messaging", description: "Open end-to-end encrypted chat", authRequired: true },
  { command: "open emergency kit", action: "emergency_kit", description: "View the offline emergency kit", authRequired: true },
  { command: "open security devices", action: "security_devices", description: "Manage your hardware security keys", authRequired: true },
  { command: "open parental controls", action: "parental_controls", description: "Manage family protection settings", authRequired: true },
  { command: "view insights", action: "insights", description: "See your personalized security insights", authRequired: true },
  { command: "view achievements", action: "achievements", description: "Check your gamification achievements", authRequired: true },
  { command: "check privacy score", action: "privacy_score", description: "Analyze a site's privacy score", authRequired: true },
  { command: "open scheduled checkups", action: "scheduled_checkups", description: "Manage automated security scans", authRequired: true },

  // Core Actions
  { command: "scan website", action: "scan_website", description: "Scan the current website for threats", authRequired: true },
  { command: "start scan", action: "start_scan", description: "Initiate a security scan", authRequired: true },
  { command: "stop scan", action: "stop_scan", description: "Stop the current security scan", authRequired: true },
  { command: "block website", action: "block_website", description: "Block the current website for children", authRequired: true },
  { command: "unblock website", action: "unblock_website", description: "Unblock the current website", authRequired: true },
  { command: "report incident", action: "report_incident", description: "Report a new security incident", authRequired: true },
  { command: "clear history", action: "clear_history", description: "Clear your scan history", authRequired: true },
  { command: "download kit", action: "download_kit", description: "Download the offline emergency kit", authRequired: true },

  // Landing Page Sections
  { command: "go to features", action: "scroll_features", description: "Scroll to the features section", authRequired: false },
  { command: "go to how it works", action: "scroll_how_it_works", description: "Scroll to the how it works section", authRequired: false },
  { command: "go to statistics", action: "scroll_statistics", description: "Scroll to the statistics section", authRequired: false },
  { command: "go to pricing", action: "scroll_pricing", description: "Scroll to the pricing section", authRequired: false },
  { command: "go to demo", action: "scroll_demo", description: "Scroll to the video demo section", authRequired: false },
  { command: "go to testimonials", action: "scroll_testimonials", description: "Scroll to the testimonials section", authRequired: false },
  { command: "go to team", action: "scroll_team", description: "Scroll to the team section", authRequired: false },
  { command: "go to faq", action: "scroll_faq", description: "Scroll to the FAQ section", authRequired: false },
  { command: "go to contact", action: "scroll_contact", description: "Scroll to the contact section", authRequired: false },
  { command: "go to blog", action: "scroll_blog", description: "Scroll to the blog section", authRequired: false },
  { command: "go to installation", action: "scroll_installation", description: "Scroll to the installation guide", authRequired: false },

  // General Navigation & Help
  { command: "go back", action: "go_back", description: "Go back to previous page", authRequired: false },
  { command: "refresh page", action: "refresh_page", description: "Refresh current page", authRequired: false },
  { command: "help", action: "help", description: "Show available voice commands", authRequired: false }
];

export const VoiceCommandInterface: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastCommand, setLastCommand] = useState<string>('');
  const [showCommands, setShowCommands] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const { data: session } = useSession();

  const isSupported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      return true;
    }
    return false;
  };

  const executeCommand = useCallback(async (command: VoiceCommand) => {
    switch (command.action) {
      // Authentication
      case 'login':
        speakResponse("Opening login page.");
        window.location.href = '/auth/login';
        break;
      case 'register':
        speakResponse("Opening registration page.");
        window.location.href = '/auth/register';
        break;
      case 'logout':
        speakResponse("Logging you out.");
        // This assumes you have a sign-out mechanism, often via a link click or function call
        // If you use next-auth, you might need to import and call signOut()
        // For now, we can simulate a click on a logout button if one exists.
        (document.querySelector('[data-testid="logout-button"]') as HTMLElement)?.click();
        break;
      // Main Navigation
      case 'dashboard':
        speakResponse("Opening main dashboard.");
        window.location.href = '/dashboard';
        break;
      case 'home':
        speakResponse("Going to the home page.");
        window.location.href = '/';
        break;
      case 'update_profile':
        speakResponse("Opening profile settings.");
        window.location.href = '/dashboard?view=profile';
        break;
      case 'pricing':
        speakResponse("Showing pricing plans.");
        window.location.href = '/dashboard?view=pricing';
        break;
      case 'scan_history':
        speakResponse("Opening scan history.");
        window.location.href = '/dashboard?view=history';
        break;

      // Security Tools
      case 'threat_intelligence':
        speakResponse("Opening threat intelligence feed.");
        window.location.href = '/threat-feeds';
        break;
      case 'browser_sandbox':
        speakResponse("Opening browser sandbox.");
        window.location.href = '/browser-sandbox';
        break;
      case 'incident_response':
        speakResponse("Opening incident response assistant.");
        window.location.href = '/incident-response';
        break;
      case 'privacy_locker':
        speakResponse("Opening privacy locker.");
        window.location.href = '/privacy-locker';
        break;
      case 'scan_website':
        speakResponse("Scanning current website for security threats.");
        if (chrome?.runtime?.sendMessage) {
          chrome.runtime.sendMessage({ type: 'VOICE_SCAN_WEBSITE' });
        }
        break;

      case 'achievements':
        speakResponse("Showing your achievements.");
        window.location.href = '/gamification';
        break;

      case 'start_scan':
        speakResponse("Starting security scan.");
        if (chrome?.runtime?.sendMessage) {
          chrome.runtime.sendMessage({ type: 'VOICE_START_SCAN' });
        }
        break;

      case 'stop_scan':
        speakResponse("Stopping security scan.");
        if (chrome?.runtime?.sendMessage) {
          chrome.runtime.sendMessage({ type: 'VOICE_STOP_SCAN' });
        }
        break;

      case 'report_incident':
        speakResponse("Opening incident reporting form.");
        if (chrome?.runtime?.sendMessage) {
          chrome.runtime.sendMessage({ type: 'VOICE_REPORT_INCIDENT' });
        }
        break;

      case 'parental_controls':
        speakResponse("Opening parental control dashboard.");
        window.location.href = '/parental-controls';
        break;

      case 'block_website':
        speakResponse("Blocking current website for children.");
        if (chrome?.runtime?.sendMessage) {
          chrome.runtime.sendMessage({ type: 'VOICE_BLOCK_WEBSITE' });
        }
        break;

      case 'unblock_website':
        speakResponse("Unblocking current website.");
        if (chrome?.runtime?.sendMessage) {
          chrome.runtime.sendMessage({ type: 'VOICE_UNBLOCK_WEBSITE' });
        }
        break;

      case 'security_devices':
        speakResponse("Opening security device integration.");
        window.location.href = '/security-devices';
        break;

      case 'connect_device':
        speakResponse("Initiating device connection.");
        if (chrome?.runtime?.sendMessage) {
          chrome.runtime.sendMessage({ type: 'VOICE_CONNECT_DEVICE' });
        }
        break;

      case 'disconnect_device':
        speakResponse("Disconnecting security device.");
        if (chrome?.runtime?.sendMessage) {
          chrome.runtime.sendMessage({ type: 'VOICE_DISCONNECT_DEVICE' });
        }
        break;

      case 'scheduled_checkups':
        speakResponse("Opening scheduled checkups.");
        window.location.href = '/scheduled-checkups';
        break;

      case 'schedule_checkup':
        speakResponse("Opening checkup scheduler.");
        window.location.href = '/scheduled-checkups/new';
        break;

      case 'run_checkup':
        speakResponse("Running scheduled checkup.");
        if (chrome?.runtime?.sendMessage) {
          chrome.runtime.sendMessage({ type: 'VOICE_RUN_CHECKUP' });
        }
        break;

      case 'emergency_kit':
        speakResponse("Opening offline emergency kit.");
        window.location.href = '/offline-kit';
        break;

      case 'download_kit':
        speakResponse("Downloading offline emergency kit.");
        window.location.href = '/api/offline-kit/download-pdf';
        break;

      case 'clear_history':
        speakResponse("Clearing scan history.");
        if (chrome?.runtime?.sendMessage) {
          chrome.runtime.sendMessage({ type: 'VOICE_CLEAR_HISTORY' });
        }
        break;

      case 'secure_messaging':
        speakResponse("Opening secure messaging.");
        window.location.href = '/secure-messaging';
        break;

      case 'send_message':
        speakResponse("Opening message composer.");
        window.location.href = '/secure-messaging/compose';
        break;

      case 'insights':
        speakResponse("Opening personalized insights.");
        window.location.href = '/insights';
        break;

      case 'privacy_score':
        speakResponse("Opening site privacy score analysis.");
        window.location.href = '/privacy-score';
        break;

      // Landing Page Sections
      case 'scroll_features':
        if (scrollToSection('features')) speakResponse("Scrolling to features.");
        else speakResponse("Could not find the features section on this page.");
        break;
      case 'scroll_how_it_works':
        if (scrollToSection('how-it-works')) speakResponse("Scrolling to how it works.");
        else speakResponse("Could not find the how it works section on this page.");
        break;
      case 'scroll_statistics':
        if (scrollToSection('statistics')) speakResponse("Scrolling to statistics.");
        else speakResponse("Could not find the statistics section on this page.");
        break;
      case 'scroll_pricing':
        if (scrollToSection('pricing')) speakResponse("Scrolling to pricing.");
        else speakResponse("Could not find the pricing section on this page.");
        break;
      case 'scroll_demo':
        if (scrollToSection('demo')) speakResponse("Scrolling to the demo.");
        else speakResponse("Could not find the demo section on this page.");
        break;
      case 'scroll_testimonials':
        if (scrollToSection('testimonials')) speakResponse("Scrolling to testimonials.");
        else speakResponse("Could not find the testimonials section on this page.");
        break;
      case 'scroll_team':
        if (scrollToSection('team')) speakResponse("Scrolling to the team section.");
        else speakResponse("Could not find the team section on this page.");
        break;
      case 'scroll_faq':
        if (scrollToSection('faq')) speakResponse("Scrolling to the FAQ.");
        else speakResponse("Could not find the FAQ section on this page.");
        break;
      case 'scroll_contact':
        if (scrollToSection('contact')) speakResponse("Scrolling to contact information.");
        else speakResponse("Could not find the contact section on this page.");
        break;
      case 'scroll_blog':
        if (scrollToSection('blog')) speakResponse("Scrolling to the blog.");
        else speakResponse("Could not find the blog section on this page.");
        break;
      case 'scroll_installation':
        if (scrollToSection('installation')) speakResponse("Scrolling to the installation guide.");
        else speakResponse("Could not find the installation guide on this page.");
        break;

      // General Navigation & Help
      case 'go_back':
        speakResponse("Going back to previous page.");
        window.history.back();
        break;

      case 'refresh_page':
        speakResponse("Refreshing current page.");
        window.location.reload();
        break;

      case 'help':
        const helpText = "Here are some things you can say: " + AVAILABLE_COMMANDS.slice(0, 5).map(cmd => cmd.command).join(', ');
        speakResponse(helpText);
        setShowCommands(true);
        break;

      default:
        speakResponse("Command executed successfully.");
    }
  }, []);

  const processCommand = useCallback(async (command: string) => {
    setIsProcessing(true);
    setLastCommand(command);

    try {
      // Find the best matching command
      let matchedCommand: VoiceCommand | null = null;
      let highestMatchScore = 0;

      for (const cmd of AVAILABLE_COMMANDS) {
        const keywords = cmd.command.toLowerCase().split(' ');
        const score = keywords.reduce((acc, keyword) => command.includes(keyword) ? acc + 1 : acc, 0);
        
        if (score > 0 && score === keywords.length && score > highestMatchScore) {
          highestMatchScore = score;
          matchedCommand = cmd;
        }
      }

      if (matchedCommand) {
        if (matchedCommand.authRequired && !session) {
          speakResponse("This is a dashboard command. Please log in first to use it.");
          window.location.href = '/auth/login';
        } else {
          await executeCommand(matchedCommand);
        }
      } else {
        speakResponse("Sorry, I didn't understand that command. Say 'help' to see available commands.");
      }
    } catch (error) {
      console.error('Error processing command:', error);
      speakResponse("Sorry, there was an error processing your command.");
    } finally {
      setIsProcessing(false);
    }
  }, [executeCommand]);

  const initializeSpeechRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false; // Changed to false for better first-command recognition
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.maxAlternatives = 1;

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setTranscript('');
      };

      recognitionRef.current.onresult = (event) => {
        const result = event.results[0];
        if (result.isFinal) {
          const finalTranscript = result[0].transcript.trim();
          setTranscript(finalTranscript);
          if (finalTranscript) {
            processCommand(finalTranscript.toLowerCase());
          }
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }
  }, [processCommand]);

  useEffect(() => {
    setIsMounted(true);
    if (isSupported) {
      initializeSpeechRecognition();
    }
  }, [isSupported, initializeSpeechRecognition]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };



  const speakResponse = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;

      // Use a female voice if available
      const voices = speechSynthesis.getVoices();
      const femaleVoice = voices.find(voice =>
        voice.name.toLowerCase().includes('female') ||
        voice.name.toLowerCase().includes('samantha') ||
        voice.name.toLowerCase().includes('victoria')
      );
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }

      speechSynthesis.speak(utterance);
    }
  };

  const testVoice = () => {
    speakResponse("Voice command interface is working. Try saying 'scan website' or 'help' to see available commands.");
  };

  if (!isMounted || !isSupported) {
    return null; // Don't render anything if not supported
  }

  return (
    <div className={`fixed right-4 z-50 ${isOpen ? 'bottom-4' : 'bottom-20'}`}>
      {isOpen && (
        <div className="mb-4 w-96 max-h-[70vh] overflow-y-auto space-y-4">
          {/* Voice Control */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <div className="relative">
                      <Mic className="w-5 h-5 text-blue-500" />
                      {isListening && <span className="animate-ping absolute top-0 right-0 inline-flex h-2 w-2 rounded-full bg-red-500 opacity-75"></span>}
                    </div>
                    Voice Command {isListening && <span className="text-sm text-muted-foreground">(Listening...)</span>}
                  </CardTitle>
                  <CardDescription>
                    Hands-free security management
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={testVoice}>
                    <Volume2 className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => setShowCommands(!showCommands)}>
                    <Settings className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <Button
                    size="lg"
                    onClick={isListening ? stopListening : startListening}
                    disabled={isProcessing}
                    className={`w-20 h-20 rounded-full ${
                      isListening ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                  >
                    {isProcessing ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    ) : isListening ? (
                      <Square className="w-8 h-8" />
                    ) : (
                      <Mic className="w-8 h-8" />
                    )}
                  </Button>
                </div>

                <div>
                  <p className="text-md font-medium">
                    {isProcessing ? 'Processing...' : isListening ? 'Listening...' : 'Click to start'}
                  </p>
                  {transcript && (
                    <p className="text-sm text-muted-foreground mt-1">
                      &quot;{transcript}&quot;
                    </p>
                  )}
                </div>

                {lastCommand && (
                  <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-lg">
                    <p className="text-xs">
                      <strong>Last command:</strong> &quot;{lastCommand}&quot;
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Available Commands */}
          {showCommands && (
            <Card>
              <CardHeader>
                <CardTitle>Available Voice Commands</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                  {AVAILABLE_COMMANDS.map((cmd, index) => (
                    <div key={index} className="p-2 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">&quot;{cmd.command}&quot;</Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => processCommand(cmd.command)}
                          disabled={isProcessing}
                        >
                          <Play className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{cmd.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {!isOpen && (
        <div className="animate-pulse-slow">
          <Button
            type="button"
            onClick={() => setIsOpen(true)}
            className="rounded-full w-14 h-14 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 hover:from-blue-600 hover:via-purple-600 hover:to-cyan-600 shadow-lg transition-all duration-200 hover:scale-110 border-2 border-white/30"
            aria-label="Open voice command"
          ><Mic className="w-7 h-7 text-white" /></Button>
        </div>)}
    </div>
  );
};
