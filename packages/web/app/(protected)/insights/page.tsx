import { Navigation } from '@/components/Navigation';
import { PersonalizedInsights } from '@/components/PersonalizedInsights';

export default function InsightsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation isAuthenticated={true} />
      <div className="container mx-auto px-4 py-8">
        <PersonalizedInsights />
      </div>
    </div>
  );
}
