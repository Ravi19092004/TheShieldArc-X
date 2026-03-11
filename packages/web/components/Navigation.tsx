"use client";

import React, { useState } from 'react';
import { LogOut, Shield, User, FileText, Home, CreditCard, AlertTriangle, TrendingUp, Lock, MessageSquare, Mic, Download, Key, ChevronDown, Menu, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoginButton } from '@/components/auth/login-button';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface NavigationProps {
  isAuthenticated: boolean;
  onNavigate?: (view: "dashboard" | "profile" | "history" | "pricing") => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  isAuthenticated,
  onNavigate,
}) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="border-b border-primary/20 bg-black/30 backdrop-blur-sm sticky top-0 z-50">
      <div className="flex h-12 sm:h-16 items-center justify-between px-[clamp(0.5rem, 2vw, 1.5rem)]">
        <div
          className="flex items-center gap-[clamp(0.5rem, 1vw, 1rem)] cursor-pointer"
          onClick={() => onNavigate?.("dashboard")}
        >
          <Image
            src="/avatars/DataShield.Ai-removebg-preview.png"
            alt="DataShield Logo"
            width={200}
            height={50}
            className="h-[clamp(30px, 5vw, 60px)] w-auto object-contain transition-all duration-300 ease-in-out"
          />
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-[clamp(0.5rem, 1vw, 2rem)]">
          {isAuthenticated ? (
            <>
              {/* Welcome Message and Profile Card */}
              <div className="flex items-center gap-[clamp(0.5rem, 1vw, 1rem)]">
                {session?.user?.image ? (
                  <div className="w-8 h-8 relative">
                    <Image
                      src={session.user.image}
                      alt="Profile"
                      fill
                      style={{ objectFit: 'cover' }}
                      className="rounded-full"
                    />
                  </div>
                ) : (
                  <User className="h-8 w-8 text-primary" />
                )}
                <div>
                  <p className="text-[clamp(0.8rem, 1vw + 0.5rem, 1.25rem)] font-medium text-white">
                    Welcome, {session?.user?.name || session?.user?.email}!
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-[clamp(0.5rem, 1vw, 2rem)]">
                <Button
                  variant="default"
                  onClick={() => router.push('/')}
                  className="px-[clamp(0.5rem, 1vw, 1.25rem)] py-[clamp(0.25rem, 0.5vw, 0.75rem)] text-[clamp(0.8rem, 1vw + 0.5rem, 1.25rem)] transition-all duration-300 ease-in-out"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Button>
                <Button
                  variant="default"
                  onClick={() => onNavigate?.("history")}
                  className="px-[clamp(0.5rem, 1vw, 1.25rem)] py-[clamp(0.25rem, 0.5vw, 0.75rem)] text-[clamp(0.8rem, 1vw + 0.5rem, 1.25rem)] transition-all duration-300 ease-in-out"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Scan History
                </Button>

                <Button
                  variant="default"
                  onClick={() => onNavigate?.("pricing")}
                  className="px-[clamp(0.5rem, 1vw, 1.25rem)] py-[clamp(0.25rem, 0.5vw, 0.75rem)] text-[clamp(0.8rem, 1vw + 0.5rem, 1.25rem)] transition-all duration-300 ease-in-out"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pricing
                </Button>

                <Button
                  variant="default"
                  onClick={() => router.push('/url-scanner')}
                  className="px-[clamp(0.5rem, 1vw, 1.25rem)] py-[clamp(0.25rem, 0.5vw, 0.75rem)] text-[clamp(0.8rem, 1vw + 0.5rem, 1.25rem)] transition-all duration-300 ease-in-out"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  URL Scanner
                </Button>

                {/* New Features Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="default"
                      className="px-[clamp(0.5rem, 1vw, 1.25rem)] py-[clamp(0.25rem, 0.5vw, 0.75rem)] text-[clamp(0.8rem, 1vw + 0.5rem, 1.25rem)] transition-all duration-300 ease-in-out"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Security Tools
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => router.push('/threat-feeds')}>
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Threat Intelligence
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/browser-sandbox')}>
                      <Shield className="h-4 w-4 mr-2" />
                      Browser Sandbox
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/incident-response')}>
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Incident Response
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/privacy-locker')}>
                      <Lock className="h-4 w-4 mr-2" />
                      Privacy Locker
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/secure-messaging')}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Secure Messaging
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/offline-kit')}>
                      <Download className="h-4 w-4 mr-2" />
                      Offline Emergency Kit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/security-devices')}>
                      <Key className="h-4 w-4 mr-2" />
                      Security Devices
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/parental-controls')}>
                      <User className="h-4 w-4 mr-2" />
                      Parental Controls
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/insights')}>
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Personalized Insights
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/gamification')}>
                      <Shield className="h-4 w-4 mr-2" />
                      Achievements
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onNavigate?.("profile")}>
                      <User className="h-4 w-4 mr-2" />
                      Update Profile
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Logout Button */}
                <Button
                  variant="destructive"
                  onClick={() => signOut({ callbackUrl: '/auth/login' })}
                  className="px-[clamp(0.5rem, 1vw, 1.25rem)] py-[clamp(0.25rem, 0.5vw, 0.75rem)] text-[clamp(0.8rem, 1vw + 0.5rem, 1.25rem)] transition-all duration-300 ease-in-out"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-[clamp(0.5rem, 1vw, 2rem)]">
              <Button
                variant="ghost"
                size="default"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-[clamp(0.5rem, 1vw, 1.25rem)] py-[clamp(0.25rem, 0.5vw, 0.75rem)] text-[clamp(0.8rem, 1vw + 0.5rem, 1.25rem)] text-primary hover:bg-primary/10 transition-all duration-300 ease-in-out"
              >
                Features
              </Button>
              <Button
                variant="ghost"
                size="default"
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-[clamp(0.5rem, 1vw, 1.25rem)] py-[clamp(0.25rem, 0.5vw, 0.75rem)] text-[clamp(0.8rem, 1vw + 0.5rem, 1.25rem)] text-primary hover:bg-primary/10 transition-all duration-300 ease-in-out"
              >
                How It Works
              </Button>
              <Button
                variant="ghost"
                size="default"
                onClick={() => document.getElementById('statistics')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-[clamp(0.5rem, 1vw, 1.25rem)] py-[clamp(0.25rem, 0.5vw, 0.75rem)] text-[clamp(0.8rem, 1vw + 0.5rem, 1.25rem)] text-primary hover:bg-primary/10 transition-all duration-300 ease-in-out"
              >
                Statistics
              </Button>
              <Button
                variant="ghost"
                size="default"
                onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-[clamp(0.5rem, 1vw, 1.25rem)] py-[clamp(0.25rem, 0.5vw, 0.75rem)] text-[clamp(0.8rem, 1vw + 0.5rem, 1.25rem)] text-primary hover:bg-primary/10 transition-all duration-300 ease-in-out"
              >
                Pricing
              </Button>
              <Button
                variant="ghost"
                size="default"
                onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-[clamp(0.5rem, 1vw, 1.25rem)] py-[clamp(0.25rem, 0.5vw, 0.75rem)] text-[clamp(0.8rem, 1vw + 0.5rem, 1.25rem)] text-primary hover:bg-primary/10 transition-all duration-300 ease-in-out"
              >
                Demo
              </Button>
              <Button
                variant="ghost"
                size="default"
                onClick={() => document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-[clamp(0.5rem, 1vw, 1.25rem)] py-[clamp(0.25rem, 0.5vw, 0.75rem)] text-[clamp(0.8rem, 1vw + 0.5rem, 1.25rem)] text-primary hover:bg-primary/10 transition-all duration-300 ease-in-out"
              >
                Testimonials
              </Button>
              <Button
                variant="ghost"
                size="default"
                onClick={() => document.getElementById('team')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-[clamp(0.5rem, 1vw, 1.25rem)] py-[clamp(0.25rem, 0.5vw, 0.75rem)] text-[clamp(0.8rem, 1vw + 0.5rem, 1.25rem)] text-primary hover:bg-primary/10 transition-all duration-300 ease-in-out"
              >
                Team
              </Button>
              <Button
                variant="ghost"
                size="default"
                onClick={() => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-[clamp(0.5rem, 1vw, 1.25rem)] py-[clamp(0.25rem, 0.5vw, 0.75rem)] text-[clamp(0.8rem, 1vw + 0.5rem, 1.25rem)] text-primary hover:bg-primary/10 transition-all duration-300 ease-in-out"
              >
                FAQ
              </Button>
              <Button
                variant="ghost"
                size="default"
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-[clamp(0.5rem, 1vw, 1.25rem)] py-[clamp(0.25rem, 0.5vw, 0.75rem)] text-[clamp(0.8rem, 1vw + 0.5rem, 1.25rem)] text-primary hover:bg-primary/10 transition-all duration-300 ease-in-out"
              >
                Contact
              </Button>
              <Button
                variant="ghost"
                size="default"
                onClick={() => document.getElementById('blog')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-[clamp(0.5rem, 1vw, 1.25rem)] py-[clamp(0.25rem, 0.5vw, 0.75rem)] text-[clamp(0.8rem, 1vw + 0.5rem, 1.25rem)] text-primary hover:bg-primary/10 transition-all duration-300 ease-in-out"
              >
                Blog
              </Button>
              <LoginButton>
                <Button
                  variant="default"
                  size="default"
                  className="px-[clamp(0.5rem, 1vw, 1.25rem)] py-[clamp(0.25rem, 0.5vw, 0.75rem)] text-[clamp(0.8rem, 1vw + 0.5rem, 1.25rem)] transition-all duration-300 ease-in-out"
                >
                  Login
                </Button>
              </LoginButton>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Menu */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-black/95 border-primary/20">
              <div className="flex flex-col space-y-4 mt-8">
                {isAuthenticated ? (
                  <>
                    {/* Mobile Authenticated Menu */}
                    <div className="flex items-center space-x-2 pb-4 border-b border-primary/20">
                      {session?.user?.image ? (
                        <div className="w-10 h-10 relative">
                          <Image
                            src={session.user.image}
                            alt="Profile"
                            fill
                            style={{ objectFit: 'cover' }}
                            className="rounded-full"
                          />
                        </div>
                      ) : (
                        <User className="h-10 w-10 text-primary" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-white">
                          Welcome, {session?.user?.name || session?.user?.email}!
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" onClick={() => { router.push('/'); setIsOpen(false); }} className="justify-start">
                      <Home className="h-4 w-4 mr-2" />
                      Home
                    </Button>
                    <Button variant="ghost" onClick={() => { onNavigate?.("history"); setIsOpen(false); }} className="justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      Scan History
                    </Button>

                    <Button variant="ghost" onClick={() => { onNavigate?.("pricing"); setIsOpen(false); }} className="justify-start">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pricing
                    </Button>
                    <Button variant="ghost" onClick={() => { router.push('/url-scanner'); setIsOpen(false); }} className="justify-start">
                      <Shield className="h-4 w-4 mr-2" />
                      URL Scanner
                    </Button>
                    <div className="border-t border-primary/20 pt-4">
                      <p className="text-sm font-medium text-primary mb-2">Security Tools</p>
                      <Button variant="ghost" onClick={() => { router.push('/threat-feeds'); setIsOpen(false); }} className="justify-start w-full">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Threat Intelligence
                      </Button>
                      <Button variant="ghost" onClick={() => { router.push('/browser-sandbox'); setIsOpen(false); }} className="justify-start w-full">
                        <Shield className="h-4 w-4 mr-2" />
                        Browser Sandbox
                      </Button>
                      <Button variant="ghost" onClick={() => { router.push('/incident-response'); setIsOpen(false); }} className="justify-start w-full">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Incident Response
                      </Button>
                      <Button variant="ghost" onClick={() => { router.push('/privacy-locker'); setIsOpen(false); }} className="justify-start w-full">
                        <Lock className="h-4 w-4 mr-2" />
                        Privacy Locker
                      </Button>
                      <Button variant="ghost" onClick={() => { router.push('/secure-messaging'); setIsOpen(false); }} className="justify-start w-full">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Secure Messaging
                      </Button>
                      <Button variant="ghost" onClick={() => { router.push('/voice-commands'); setIsOpen(false); }} className="justify-start w-full">
                        <Mic className="h-4 w-4 mr-2" />
                        Voice Commands
                      </Button>
                      <Button variant="ghost" onClick={() => { router.push('/offline-kit'); setIsOpen(false); }} className="justify-start w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Offline Emergency Kit
                      </Button>
                      <Button variant="ghost" onClick={() => { router.push('/security-devices'); setIsOpen(false); }} className="justify-start w-full">
                        <Key className="h-4 w-4 mr-2" />
                        Security Devices
                      </Button>
                      <Button variant="ghost" onClick={() => { router.push('/parental-controls'); setIsOpen(false); }} className="justify-start w-full">
                        <User className="h-4 w-4 mr-2" />
                        Parental Controls
                      </Button>
                      <Button variant="ghost" onClick={() => { router.push('/insights'); setIsOpen(false); }} className="justify-start w-full">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Personalized Insights
                      </Button>
                      <Button variant="ghost" onClick={() => { router.push('/gamification'); setIsOpen(false); }} className="justify-start w-full">
                        <Shield className="h-4 w-4 mr-2" />
                        Achievements
                      </Button>
                      <Button variant="ghost" onClick={() => { onNavigate?.("profile"); setIsOpen(false); }} className="justify-start w-full">
                        <User className="h-4 w-4 mr-2" />
                        Update Profile
                      </Button>
                    </div>
                    <Button variant="destructive" onClick={() => { signOut({ callbackUrl: '/auth/login' }); setIsOpen(false); }} className="justify-start">
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    {/* Mobile Unauthenticated Menu */}
                    <Button variant="ghost" onClick={() => { document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); setIsOpen(false); }} className="justify-start">
                      Features
                    </Button>
                    <Button variant="ghost" onClick={() => { document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }); setIsOpen(false); }} className="justify-start">
                      How It Works
                    </Button>
                    <Button variant="ghost" onClick={() => { document.getElementById('statistics')?.scrollIntoView({ behavior: 'smooth' }); setIsOpen(false); }} className="justify-start">
                      Statistics
                    </Button>
                    <Button variant="ghost" onClick={() => { document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }); setIsOpen(false); }} className="justify-start">
                      Pricing
                    </Button>
                    <Button variant="ghost" onClick={() => { document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' }); setIsOpen(false); }} className="justify-start">
                      Demo
                    </Button>
                    <Button variant="ghost" onClick={() => { document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' }); setIsOpen(false); }} className="justify-start">
                      Testimonials
                    </Button>
                    <Button variant="ghost" onClick={() => { document.getElementById('team')?.scrollIntoView({ behavior: 'smooth' }); setIsOpen(false); }} className="justify-start">
                      Team
                    </Button>
                    <Button variant="ghost" onClick={() => { document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' }); setIsOpen(false); }} className="justify-start">
                      FAQ
                    </Button>
                    <Button variant="ghost" onClick={() => { document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); setIsOpen(false); }} className="justify-start">
                      Contact
                    </Button>
                    <Button variant="ghost" onClick={() => { document.getElementById('blog')?.scrollIntoView({ behavior: 'smooth' }); setIsOpen(false); }} className="justify-start">
                      Blog
                    </Button>
                    <LoginButton>
                      <Button variant="default" onClick={() => setIsOpen(false)} className="w-full justify-start">
                        Login
                      </Button>
                    </LoginButton>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
