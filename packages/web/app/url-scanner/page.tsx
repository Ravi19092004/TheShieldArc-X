'use client';

import { Navigation } from '@/components/Navigation';
import { URLScanner } from '@/components/URLScanner';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function URLScannerPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      <Navigation isAuthenticated={true} />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors duration-300 group animate-in fade-in slide-in-from-left-4 duration-500"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform duration-300" />
              <span className="font-medium">Back to Dashboard</span>
            </button>
          </div>
          <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent animate-pulse">
              URL Scanner
            </h1>
            <p className="text-muted-foreground text-lg animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
              Scan URLs for potential phishing threats using our advanced AI-powered detection system
            </p>
          </div>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-600">
            <URLScanner />
          </div>
        </div>
      </div>
    </div>
  );
}
