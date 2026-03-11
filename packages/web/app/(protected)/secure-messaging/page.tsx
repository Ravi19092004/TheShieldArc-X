import { Navigation } from '@/components/Navigation';
import { SecureMessaging } from '@/components/SecureMessaging';

export default function SecureMessagingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation isAuthenticated={true} />
      <div className="container mx-auto px-4 py-8">
        <SecureMessaging />
      </div>
    </div>
  );
}
