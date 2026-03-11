"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Shield, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const TermsPage = () => {
  const router = useRouter();
  const [isAccepted, setIsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  useEffect(() => {
    // Check if user is logged in and terms acceptance status in parallel
    const checkAuthAndTerms = async () => {
      try {
        // Fetch both session and terms status in parallel
        const [sessionResponse, termsResponse] = await Promise.all([
          fetch('/api/auth/session'),
          fetch('/api/user/accept-terms')
        ]);

        const session = await sessionResponse.json();
        const termsData = await termsResponse.json();

        if (!session?.user) {
          router.push('/login');
          return;
        }

        if (termsData.termsAccepted) {
          // Terms already accepted, redirect to dashboard immediately
          router.push('/dashboard');
          return;
        }

        // Terms not accepted, show the terms page
        setShowTerms(true);
      } catch (error) {
        console.error('Error checking auth/terms:', error);
        router.push('/login');
      }
    };

    checkAuthAndTerms();
  }, [router]);

  const handleAccept = async () => {
    if (!isAccepted) {
      toast.error('Please accept the terms and conditions to continue.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/user/accept-terms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success('Terms accepted successfully!');
        router.push('/dashboard');
      } else {
        toast.error('Failed to accept terms. Please try again.');
      }
    } catch (error) {
      console.error('Error accepting terms:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render anything until we know whether to show terms or redirect
  if (!showTerms) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center"> 
          <Image
            src="/avatars/DataShield.Ai-removebg-preview.png"
            alt="DataShield.Ai Logo"
            width={250}
            height={60}
            className="h-auto w-64 animate-pulse"
          />
          <p className="text-muted-foreground mt-2">Securing your session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12 font-sans">
      <div className="w-full max-w-4xl animate-fade-in">
        <div className="text-center mb-4">
          <Link href="/" className="inline-flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity" suppressHydrationWarning>
            <Shield className="w-10 h-10 text-primary" />
            <span className="text-2xl font-bold bg-gradient-cyber bg-clip-text text-transparent">
              DataShield.Ai
            </span>
          </Link>
        </div>

        <Card className="bg-card border-border shadow-glow-cyan">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold mb-2">Terms & Conditions</CardTitle>
            <CardDescription className="text-lg">
              Please read and accept our terms and conditions to continue using DataShield.Ai
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="bg-muted/50 p-6 rounded-lg max-h-96 overflow-y-auto text-sm leading-relaxed">
              <h3 className="font-semibold text-lg mb-4">1. Acceptance of Terms</h3>
              <p className="mb-4">
                By accessing and using DataShield.Ai, you accept and agree to be bound by the terms and provision of this agreement.
              </p>

              <h3 className="font-semibold text-lg mb-4">2. Service Description</h3>
              <p className="mb-4">
                DataShield.Ai is designed to help users identify potentially unsafe or phishing websites by analyzing links using a trained AI model. It provides real-time safety classifications such as &quot;Safe&quot; or &quot;Phishing.&quot;
              </p>

              <h3 className="font-semibold text-lg mb-4">3. User Responsibility</h3>
              <ul className="list-disc list-inside mb-4 space-y-2">
                <li>The Extension is a support tool and does not guarantee 100% accuracy.</li>
                <li>Users should always exercise caution when visiting websites.</li>
                <li>You agree not to misuse or attempt to reverse-engineer this Extension.</li>
              </ul>

              <h3 className="font-semibold text-lg mb-4">4. Data Collection</h3>
              <ul className="list-disc list-inside mb-4 space-y-2">
                <li>The Extension or website may store and analyze your browsing history and visited links to improve phishing detection.</li>
                <li>Personal information (e.g., passwords, payment details, names) is <strong>&quot;not collected&quot;</strong>.</li>
                <li>Data is used solely for security classification and not sold or shared with third parties.</li>
              </ul>

              <h3 className="font-semibold text-lg mb-4">5. Limitations of Liability</h3>
              <p className="mb-4">
                The Extension is provided &quot;as is&quot; without warranties of any kind. We are not liable for losses, damages, or security breaches caused by unsafe websites or inaccurate classifications.
              </p>

              <h3 className="font-semibold text-lg mb-4">6. Intellectual Property</h3>
              <p className="mb-4">
                The Extension&apos;s code, design, and AI models are owned by the developers. You may not copy, modify, or distribute the Extension without permission.
              </p>

              <h3 className="font-semibold text-lg mb-4">7. Updates</h3>
              <p className="mb-4">
                We may update the Extension or these Terms at any time. Continued use of the Extension means you accept any updates.
              </p>

              <h3 className="font-semibold text-lg mb-4">8. Termination</h3>
              <p className="mb-4">
                We reserve the right to suspend or block access if you violate these Terms or misuse the Extension.
              </p>

              <h3 className="font-semibold text-lg mb-4">9. Governing Law</h3>
              <p className="mb-4">
                These Terms shall be governed by the laws of India.
              </p>

              <h3 className="font-semibold text-lg mb-4">10. Contact</h3>
              <p className="mb-4">
                If you have questions, contact us at: <br />
                📧 <a href="mailto:rgharabidi@gmail.com" className="text-primary hover:underline">rgharabidi@gmail.com</a>
              </p>
            </div>

            <div className="flex items-center space-x-2 p-4 bg-muted/30 rounded-lg">
              <Checkbox
                id="accept-terms"
                checked={isAccepted}
                onCheckedChange={(checked) => setIsAccepted(checked === true)}
              />
              <label
                htmlFor="accept-terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I have read and agree to the Terms & Conditions
              </label>
            </div>

            <div className="flex gap-4 justify-center">
              <Button
                variant="outline"
                onClick={() => router.push('/login')}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAccept}
                disabled={!isAccepted || isLoading}
                className="min-w-32"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Accepting...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Accept & Continue
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsPage;
