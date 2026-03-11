import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Shield } from "lucide-react";
import { useState } from "react";

export const NewsletterSignup = () => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the email to your backend
    setIsSubscribed(true);
    setEmail("");
  };

  return (
    <section id="newsletter" className="container mx-auto px-4 py-20 bg-card/30">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-gradient-cyber text-foreground border-0 shadow-glow-purple">
          <CardContent className="p-8 md:p-12 text-center">
            <Shield className="w-16 h-16 text-primary mx-auto mb-6" />

            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Stay Ahead of Cyber Threats
            </h2>

            <p className="text-lg mb-8 opacity-90">
              Get weekly security insights, phishing trends, and exclusive tips
              delivered directly to your inbox. Join 50,000+ security-conscious users.
            </p>

            {!isSubscribed ? (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <div className="flex-1 relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-background/50 border-primary/20"
                    required
                  />
                </div>
                <Button type="submit" variant="secondary" className="bg-background text-foreground hover:bg-background/90">
                  Subscribe
                </Button>
              </form>
            ) : (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <p className="text-green-400 font-medium">
                  ✅ Thanks for subscribing! Check your email for confirmation.
                </p>
              </div>
            )}

            <p className="text-sm opacity-75 mt-4">
              No spam, unsubscribe at any time. We respect your privacy.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
