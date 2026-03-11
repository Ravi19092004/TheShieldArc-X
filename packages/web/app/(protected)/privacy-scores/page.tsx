import { Navigation } from '@/components/Navigation';
import { SitePrivacyScore } from '@/components/SitePrivacyScore';

export default function PrivacyScoresPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation isAuthenticated={true} />
      <div className="container mx-auto px-4 py-8">
        <SitePrivacyScore />
      </div>
    </div>
  );
}
