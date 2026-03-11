"use client";

import { Shield, Zap, Lock, Chrome, Download, TrendingUp, Trophy, MessageSquare, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navigation } from "@/components/Navigation";
import { StatisticsDashboard } from "@/components/StatisticsDashboard";
import { TeamSection } from "@/components/TeamSection";
import { VideoDemo } from "@/components/VideoDemo";
import { Testimonials } from "@/components/Testimonials";
import { PricingPreview } from "@/components/PricingPreview";
import { FAQ } from "@/components/FAQ";
import { ContactInfo } from "@/components/ContactInfo";
import { BlogPreview } from "@/components/BlogPreview";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import Chatbot from "@/components/Chatbot";
import { useRouter } from "next/navigation";

const Landing = () => {
  const router = useRouter();

  const features = [
    {
      icon: Shield,
      title: "Real-Time Protection",
      description: "AI-powered phishing detection analyzes URLs instantly before you click.",
    },
    {
      icon: Zap,
      title: "Gamified Trust Scores",
      description: "Every site gets a 0-100 trust score with color-coded safety indicators.",
    },
    {
      icon: Lock,
      title: "Advanced ML Model",
      description: "Pre-trained XGBoost model with IP, ASN, and geolocation analysis.",
    },
    {
      icon: Chrome,
      title: "Browser Extension",
      description: "Seamless protection with hover analysis and automatic blocking.",
    },
    {
      icon: TrendingUp,
      title: "Threat Intelligence Feeds",
      description: "Live threat intelligence from RSS/MISP/PhishTank for proactive protection.",
    },
    {
      icon: Trophy,
      title: "Gamification System",
      description: "Earn points and achievements for safe browsing habits.",
    },
    {
      icon: MessageSquare,
      title: "Secure Messaging",
      description: "End-to-end encrypted messaging with Signal Protocol.",
    },
  ];



  return (
    <div className="min-h-screen bg-background">
      <Navigation isAuthenticated={false} />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.1),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.05),transparent_50%)]"></div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-cyan-500/10 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-20 w-24 h-24 bg-purple-500/10 rounded-full blur-xl animate-pulse delay-500"></div>
        <div className="absolute bottom-20 right-10 w-18 h-18 bg-green-500/10 rounded-full blur-xl animate-pulse delay-1500"></div>
        <div className="absolute top-60 left-1/4 w-12 h-12 bg-pink-500/10 rounded-full blur-lg animate-bounce delay-2000"></div>
        <div className="absolute bottom-40 right-1/3 w-14 h-14 bg-yellow-500/10 rounded-full blur-lg animate-spin delay-3000"></div>
        <div className="absolute top-80 right-1/4 w-10 h-10 bg-indigo-500/10 rounded-full blur-lg animate-ping delay-500"></div>
        <div className="absolute bottom-60 left-1/3 w-16 h-16 bg-teal-500/10 rounded-full blur-lg animate-pulse delay-2500"></div>

        <div className="container mx-auto px-4 sm:px-6 md:px-8 py-20 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/20 to-cyan-500/20 border border-primary/30 rounded-full px-4 sm:px-6 py-2 sm:py-3 mb-6 sm:mb-8 backdrop-blur-sm animate-fade-in transition-all duration-300 ease-in-out">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-primary animate-pulse" />
              <span className="text-xs sm:text-sm font-semibold text-primary">AI-Powered Phishing Detection</span>
            </div>

            {/* Main Heading */}
            <h1 className="font-black mb-6 sm:mb-8 text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl animate-fade-in delay-200 transition-all duration-300 ease-in-out">
              <span className="bg-gradient-to-r from-primary via-cyan-400 to-purple-500 bg-clip-text text-transparent animate-gradient-x">
                Browse Safely
              </span>
              <br />
              <span className="text-foreground/90">with AI Protection</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in delay-400 transition-all duration-300 ease-in-out">
              DataShield.Ai uses advanced machine learning to detect phishing attacks in real-time,
              protecting you from malicious websites before you even click.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mb-12 sm:mb-16 animate-fade-in delay-600">
              <Button
                variant="cyber"
                size="lg"
                className="px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold shadow-2xl hover:shadow-primary/25 transition-all duration-300 ease-in-out transform hover:scale-105 w-full sm:w-auto"
                onClick={() => router.push("/auth/register")}
              >
                <Download className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                Get Started Free
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold border-2 hover:bg-primary/10 transition-all duration-300 ease-in-out transform hover:scale-105 w-full sm:w-auto"
                onClick={() => router.push("/auth/login")}
              >
                Login to Dashboard
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto animate-fade-in delay-800">
              <Card className="bg-card/80 backdrop-blur-lg border-primary/20 shadow-2xl hover:shadow-primary/10 transition-all duration-500">
                <CardContent className="p-8 text-center">
                  <div className="text-4xl md:text-5xl font-black text-primary mb-3 bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
                    98%
                  </div>
                  <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Detection Rate
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/80 backdrop-blur-lg border-primary/20 shadow-2xl hover:shadow-primary/10 transition-all duration-500 delay-200">
                <CardContent className="p-8 text-center">
                  <div className="text-4xl md:text-5xl font-black text-primary mb-3 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                    1M+
                  </div>
                  <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Sites Analyzed
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/80 backdrop-blur-lg border-primary/20 shadow-2xl hover:shadow-primary/10 transition-all duration-500 delay-400">
                <CardContent className="p-8 text-center">
                  <div className="text-4xl md:text-5xl font-black text-primary mb-3 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                    50K+
                  </div>
                  <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Protected Users
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>


      </section>

      {/* Features Section */}
      <section id="features" className="relative py-32 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-background to-card/20"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Advanced AI Technology</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Powerful Security Features
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Comprehensive protection powered by cutting-edge AI technology and machine learning
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="group bg-card/80 backdrop-blur-lg border-primary/10 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 animate-fade-in"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <CardHeader className="pb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-cyan-500/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative py-32 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-card/20 to-background"></div>
        <div className="absolute top-1/2 left-0 w-72 h-72 bg-gradient-to-r from-primary/10 to-cyan-500/10 rounded-full blur-3xl transform -translate-y-1/2"></div>
        <div className="absolute top-1/2 right-0 w-72 h-72 bg-gradient-to-l from-purple-500/10 to-pink-500/10 rounded-full blur-3xl transform -translate-y-1/2"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
                <Lock className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">AI-Powered Analysis</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                How Our AI Model Works
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Advanced machine learning ensures maximum protection through intelligent analysis
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
              <Card className="group bg-card/80 backdrop-blur-lg border-primary/10 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-4 animate-fade-in">
                <CardHeader className="text-center pb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary to-cyan-500 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <span className="text-3xl font-black text-white">1</span>
                  </div>
                  <CardTitle className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">
                    URL Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    Our XGBoost model analyzes URL patterns, domain age, SSL certificates, and suspicious patterns to detect potential threats
                  </p>
                </CardContent>
              </Card>

              <Card className="group bg-card/80 backdrop-blur-lg border-primary/10 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-4 animate-fade-in delay-200">
                <CardHeader className="text-center pb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <span className="text-3xl font-black text-white">2</span>
                  </div>
                  <CardTitle className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">
                    Feature Enrichment
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    We gather comprehensive data including IP addresses, ASN information, geographic location, and domain reputation for thorough analysis
                  </p>
                </CardContent>
              </Card>

              <Card className="group bg-card/80 backdrop-blur-lg border-primary/10 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-4 animate-fade-in delay-400">
                <CardHeader className="text-center pb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <span className="text-3xl font-black text-white">3</span>
                  </div>
                  <CardTitle className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">
                    Trust Score Generation
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    Generate a gamified 0-100 trust score with intuitive color-coded safety indicators and detailed security insights
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Connection Lines (Visual Enhancement) */}
            <div className="hidden lg:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <div className="flex items-center justify-between w-full max-w-4xl">
                <div className="w-32 h-0.5 bg-gradient-to-r from-primary/50 to-cyan-500/50"></div>
                <div className="w-32 h-0.5 bg-gradient-to-r from-cyan-500/50 to-purple-500/50"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Dashboard */}
      <StatisticsDashboard />

      {/* Team Section */}
      <TeamSection />

      {/* Video Demo */}
      <VideoDemo />

      {/* Testimonials */}
      <Testimonials />

      {/* Pricing Preview */}
      <PricingPreview />

      {/* Installation Guide */}
      <section id="installation" className="relative py-32 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-card/20 to-background"></div>
        <div className="absolute top-1/2 left-0 w-72 h-72 bg-gradient-to-r from-primary/10 to-cyan-500/10 rounded-full blur-3xl transform -translate-y-1/2"></div>
        <div className="absolute top-1/2 right-0 w-72 h-72 bg-gradient-to-l from-purple-500/10 to-pink-500/10 rounded-full blur-3xl transform -translate-y-1/2"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
                <Chrome className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Easy Setup</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Get Started in Minutes
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Install our browser extension and start protecting yourself from phishing attacks immediately
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
              <Card className="group bg-card/80 backdrop-blur-lg border-primary/10 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-4 animate-fade-in">
                <CardHeader className="text-center pb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary to-cyan-500 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <span className="text-3xl font-black text-white">1</span>
                  </div>
                  <CardTitle className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">
                    Download Extension
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    Download our browser extension from the Chrome Web Store or Firefox Add-ons
                  </p>
                </CardContent>
              </Card>

              <Card className="group bg-card/80 backdrop-blur-lg border-primary/10 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-4 animate-fade-in delay-200">
                <CardHeader className="text-center pb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <span className="text-3xl font-black text-white">2</span>
                  </div>
                  <CardTitle className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">
                    Install & Enable
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    Follow the installation prompts and enable the extension in your browser
                  </p>
                </CardContent>
              </Card>

              <Card className="group bg-card/80 backdrop-blur-lg border-primary/10 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-4 animate-fade-in delay-400">
                <CardHeader className="text-center pb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <span className="text-3xl font-black text-white">3</span>
                  </div>
                  <CardTitle className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">
                    Start Browsing Safely
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    Browse the web with confidence knowing every URL is analyzed for threats
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <NewsletterSignup />

      {/* FAQ */}
      <FAQ />

      {/* Contact Info */}
      <ContactInfo />

      {/* Blog Preview */}
      <BlogPreview />

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-gradient-cyber text-foreground border-0 shadow-glow-purple">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Browse Safely?</h2>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands of users protecting themselves from phishing attacks with AI-powered detection
            </p>
            <Button
              variant="secondary"
              size="lg"
              className="bg-background text-foreground hover:bg-background/90"
              onClick={() => router.push("/auth/register")}
            >
              Start Protecting Yourself Today
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Chatbot */}
      <Chatbot />

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 DataShield.Ai. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default function Home() {
  return <Landing />;
}
