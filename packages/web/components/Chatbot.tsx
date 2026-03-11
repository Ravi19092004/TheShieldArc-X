"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, X } from "lucide-react";

const knowledgeBase = new Map<string[], string>([
    // Greetings and basic interaction
    [["hello", "hi", "hey"], "Hello! I'm the DataShield.Ai assistant. How can I help you today?"],
    [["bye", "goodbye"], "Goodbye! Feel free to ask if you have more questions later."],
    [["thanks", "thank you"], "You're welcome! Is there anything else I can help you with?"],

    // Core Project Information
    [["feature", "features", "capability", "capabilities"], "DataShield.Ai offers real-time protection against phishing, gamified trust scores (0-100) with color-coded indicators, advanced XGBoost ML model, IP/ASN/geolocation analysis, browser extension with hover analysis and automatic blocking, dashboard analytics, and API services."],
    [["price", "pricing", "cost", "plan", "plans"], "Free: $0 forever - basic detection, 100 scans/month, browser extension, email support. Pro: $9.99/month - advanced AI detection, unlimited scans, real-time alerts, priority support, export reports, team collaboration. Enterprise: Custom pricing - everything in Pro plus API access, custom integrations, dedicated support, SLA guarantee, advanced analytics."],
    [["how", "work", "works"], "1. URL Analysis: XGBoost model analyzes URL patterns, domain age, SSL certificates. 2. Feature Enrichment: Gathers IP address, ASN data, geographic location. 3. Trust Score: Generates 0-100 gamified score with color-coded safety indicators."],
    [["install", "installation", "setup", "download"], "1. Download the DataShield.Ai browser extension. 2. Pin it to your toolbar. 3. Create a free account or login. 4. Browse safely with real-time protection!"],
    [["detection", "accuracy", "accurate", "model", "xgboost"], "Our phishing detection is powered by an XGBoost Classifier model with ~95-98% accuracy on our test set. It analyzes TF-IDF vectorized URL features from a balanced dataset of phishing and legitimate URLs."],
    [["user", "users"], "Over 50,000 users worldwide are protected by DataShield.Ai, with real-time statistics showing 67K active users across 195 countries."],
    [["extension", "browser"], "The browser extension provides instant hover analysis showing trust scores, automatic blocking of malicious sites, and seamless integration with your browsing experience."],
    [["api", "endpoint", "endpoints"], "Our RESTful API, available on the Enterprise plan, provides endpoints for URL scanning (`/api/predict`), retrieving scan results (`/api/get-scan`), user management, and accessing dashboard statistics and scan history."],
    [["support", "help"], "Free: Email support. Pro: Priority support. Enterprise: Dedicated support team. Available Mon-Fri 9AM-6PM IST, with emergency response 24/7. Contact: support@datashield.ai"],
    [["team", "who"], "Led by Dr. Sarah Chen (Chief AI Officer, PhD in ML, former Google AI researcher), Marcus Rodriguez (Head of Security, 15+ years experience, former NSA analyst), and Dr. Emily Watson (Lead Data Scientist, PhD in Statistics, fraud prevention expert)."],
    [["contact", "email", "chat"], "Email: support@datashield.ai. Live chat available 24/7. Office: Mumbai, India. Business hours: Mon-Fri 9AM-6PM IST. Emergency support for urgent security issues."],
    [["blog", "post", "posts"], "Latest posts: 'The Rise of AI-Powered Phishing Detection', 'Understanding Trust Scores: What Your 0-100 Score Means', 'Top 10 Phishing Trends of 2024'. Stay informed about cybersecurity trends and DataShield.Ai developments."],
    [["demo", "video"], "Watch our video demo (coming soon) to see real-time phishing detection in action, including hover analysis, trust score generation, and automatic blocking."],
    [["testimonial", "testimonials", "review", "reviews"], "'DataShield.Ai has saved me from multiple phishing attempts. The real-time protection is incredible!' - Sarah Johnson. 'The AI model is impressive. It caught a sophisticated phishing site that other tools missed.' - Mike Chen. 'Easy to use and highly effective.' - Emily Davis."],
    [["faq", "question", "questions"], "How does it detect phishing? Uses XGBoost ML with IP/geolocation analysis. Is extension free? Yes, basic version free. Accuracy? 98% detection rate. Mobile support? Extension for desktop, mobile apps planned. Data collection? Only anonymized scan data. Support? Email for Free, priority for Pro, dedicated for Enterprise."],
    [["newsletter", "subscribe"], "Subscribe for weekly security insights, phishing trends, and exclusive tips. Join 50,000+ security-conscious users. No spam, unsubscribe anytime."],
    [["statistic", "statistics", "metric", "metrics"], "Real-time metrics: 2.3M sites scanned today (+12%), 847K phishing attempts blocked (+8%), 67K active users (+15%), protecting users in 195 countries (+3). Statistics update every 5 minutes."],

    // New Features from Components
    [["contact info", "contact information", "support contact"], "Contact us via email: support@datashield.ai, live chat available 24/7, office in Mumbai, India. Business hours: Mon-Fri 9AM-6PM IST. Emergency support for urgent security issues."],
    [["ip location", "ip address", "location info", "geolocation"], "View your IP address, city, country, and region information. We use geolocation APIs to provide accurate location data for enhanced security analysis."],
    [["newsletter", "subscribe", "subscription"], "Subscribe to our newsletter for weekly security insights, phishing trends, and exclusive tips. Join 50,000+ security-conscious users. No spam, unsubscribe anytime."],
    [["offline emergency kit", "emergency guide", "offline guide"], "Download emergency security guides for offline access: Password Emergency Guide, Phishing Attack Response, Data Breach Recovery, and Offline Security Practices. Available as PDFs for crisis situations."],
    [["parental control", "parental controls", "family protection"], "Manage parental controls with website blocklists, time limits (daily limits and allowed hours), safe browsing filters, and content filtering to protect your family online."],
    [["privacy locker", "encrypted storage", "secure storage"], "Store sensitive information securely with client-side AES-GCM encryption. Supports passwords, notes, documents, and keys. Each item is encrypted with your password and decrypted only in your browser."],
    [["scan history", "scan log", "history"], "View and manage your complete scan history with filtering, individual deletion, bulk deletion, and export capabilities. Track all URLs you've analyzed with their trust scores and timestamps."],
    [["secure messaging", "encrypted messaging", "private chat"], "Send end-to-end encrypted messages to other users. Messages are encrypted with AES-GCM using passwords, ensuring only intended recipients can decrypt and read them."],
    [["security device", "hardware security", "yubikey", "totp"], "Integrate hardware security devices like YubiKey, TOTP authenticators, and hardware tokens for enhanced authentication. Register, test, and manage your security devices."],
    [["site privacy score", "privacy analysis", "privacy check"], "Analyze website privacy practices with scores from 0-100. Detects trackers, cookies (essential, analytics, marketing), and data collection practices. Get detailed privacy ratings for any website."],
    [["voice command", "voice control", "hands-free"], "Control DataShield.Ai with voice commands like 'scan website', 'check privacy', 'show threats', 'view dashboard', 'open locker', 'check achievements', 'start scan', 'stop scan', and 'help'."],
  ]);

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);

  type Message = {
    text: string;
    sender: "user" | "bot";
  };

  const initialMessage: Message = {
    text: "Hi! I'm the DataShield.Ai assistant. Ask me anything about our AI-powered phishing detection!",
    sender: "bot",
  };

  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const defaultResponse = "I'm here to help with questions about DataShield.Ai. Try asking about features, pricing, how it works, installation, support, or any other aspect of our AI-powered phishing protection!";

  const getResponse = useCallback((query: string): string => {
    const lowerQuery = query.toLowerCase();
    let bestMatch = { score: 0, response: defaultResponse };

    for (const [keywords, response] of knowledgeBase.entries()) {
      let currentScore = 0;
      for (const keyword of keywords) {
        if (lowerQuery.includes(keyword)) {
          currentScore++;
        }
      }

      if (currentScore > bestMatch.score) {
        bestMatch = { score: currentScore, response };
      }
    }

    return bestMatch.response;
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = useCallback(() => {
    if (!input.trim()) return;

    const userMessage: Message = { text: input, sender: "user" };
    setMessages(prev => [...prev, userMessage]);

    const botResponseText = getResponse(input);
    const botResponse: Message = { text: botResponseText, sender: "bot" };

    setTimeout(() => {
      setMessages(prev => [...prev, botResponse]);
    }, 500);

    setInput("");
  }, [input, getResponse]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSend();
    }
  }, [handleSend]);

  return (
    <>
      {!isOpen && (
        <div className="fixed bottom-4 right-4 z-50 animate-pulse animation-delay-half">
          <Button
            type="button"
            onClick={() => setIsOpen(true)}
            className="rounded-full w-14 h-14 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 hover:from-blue-600 hover:via-purple-600 hover:to-cyan-600 shadow-lg transition-all duration-200 hover:scale-110 border-2 border-white/30"
            aria-label="Open chat"
          >
            <MessageCircle className="w-7 h-7 text-white" />
          </Button>
        </div>
      )}

      {isOpen && (
        <div className="fixed bottom-4 right-4 z-50 w-80 h-96">
          <Card className="w-full h-full flex flex-col bg-card border-primary/20 shadow-glow-cyan">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg">DataShield.Ai Assistant</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-4">
              <div className="flex-1 overflow-y-auto mb-4 space-y-2 max-h-64 pr-2">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded-lg max-w-[80%] ${
                      msg.sender === "user"
                        ? "bg-primary text-primary-foreground ml-auto"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about DataShield.Ai..."
                  className="flex-1"
                />
                <Button onClick={handleSend} size="sm">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default Chatbot;
