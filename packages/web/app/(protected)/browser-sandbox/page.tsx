import { Navigation } from '@/components/Navigation';
import { BrowserSandbox } from '@/components/BrowserSandbox';

export default function BrowserSandboxPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation isAuthenticated={true} />
      <div className="container mx-auto px-4 py-8">
        <BrowserSandbox />
      </div>
    </div>
  );
}
