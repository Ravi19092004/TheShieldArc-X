import { Navigation } from '@/components/Navigation';
import { PrivacyLocker } from '@/components/PrivacyLocker';

export default function PrivacyLockerPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation isAuthenticated={true} />
      <div className="container mx-auto px-4 py-8">
        <PrivacyLocker />
      </div>
    </div>
  );
}
