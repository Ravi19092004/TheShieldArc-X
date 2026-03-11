"use client";

// packages/web/app/auth/login/page.tsx
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Shield, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import SocialLoginButtons from "@/components/SocialLoginButtons";
import IPLocationInfo from "@/components/IPLocationInfo";
import { authService } from "@/lib/auth";
import { signIn } from "next-auth/react";

const LoginContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const provider = searchParams.get("provider");
    if (provider === "google") {
      // Mark this as extension flow for terms checking
      sessionStorage.setItem('extensionFlow', 'true');
      // Auto-trigger Google sign-in for extension flow - go to terms first
      signIn("google", { callbackUrl: "/terms" });
    } else if (provider === "github") {
      // Mark this as extension flow for terms checking
      sessionStorage.setItem('extensionFlow', 'true');
      // Auto-trigger GitHub sign-in for extension flow - go to terms first
      signIn("github", { callbackUrl: "/terms" });
    } else {
      // Clear extension flow flag for direct web logins
      sessionStorage.removeItem('extensionFlow');
    }
  }, [searchParams]);

  // Check if we're in extension flow and auto-redirect if already logged in
  useEffect(() => {
    const checkSession = async () => {
      const provider = searchParams.get("provider");
      if (provider) {
        // We're in extension flow, check if user is already authenticated
        const response = await fetch('/api/auth/session');
        const session = await response.json();

        if (session?.user) {
          // User is already logged in, check terms acceptance first
          const termsResponse = await fetch('/api/user/accept-terms');
          const termsData = await termsResponse.json();

          if (termsData.termsAccepted) {
            router.push('/dashboard');
          } else {
            router.push('/terms');
          }
        }
      }
    };

    checkSession();
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await authService.login({ email, password });
      toast.success("Login successful!");

      if (result.termsAccepted) {
        // Terms already accepted, redirect to dashboard
        router.push('/dashboard');
      } else {
        // Terms not accepted, redirect to terms page
        router.push('/terms');
      }
    } catch {
      toast.error("Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-6xl animate-fade-in">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6 hover:opacity-80 transition-opacity" suppressHydrationWarning>
            <Shield className="w-10 h-10 text-primary" />
            <span className="text-2xl font-bold bg-gradient-cyber bg-clip-text text-transparent">
              DataShield.Ai
            </span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-card border-border shadow-glow-cyan">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
              <CardDescription className="text-center">
                Enter your credentials to access your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" variant="cyber" className="w-full" disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </form>

              <SocialLoginButtons mode="login" />

              <div className="mt-6 text-center text-sm">
                <span className="text-muted-foreground">Don&apos;t have an account? </span>
                <Link href="/register" className="text-primary hover:underline font-medium" suppressHydrationWarning>
                  Sign up
                </Link>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <IPLocationInfo showTitle={true} />

            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Real-time Security</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span>IP tracking active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    <span>Location monitoring</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                    <span>Session protection</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

const Login = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
};

export default Login;
