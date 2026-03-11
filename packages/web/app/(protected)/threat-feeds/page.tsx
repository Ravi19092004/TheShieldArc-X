import { Navigation } from '@/components/Navigation';
import { ThreatIntelligenceFeed } from '@/components/ThreatIntelligenceFeed';

export default function ThreatFeedsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation isAuthenticated={true} />
      <div className="container mx-auto px-4 py-8">
        <ThreatIntelligenceFeed />
      </div>
    </div>
  );
}
