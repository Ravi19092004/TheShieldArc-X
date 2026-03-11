import { Navigation } from '@/components/Navigation';
import { IncidentResponseChatbot } from '@/components/IncidentResponseChatbot';

export default function IncidentResponsePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation isAuthenticated={true} />
      <div className="container mx-auto px-4 py-8">
        <IncidentResponseChatbot />
      </div>
    </div>
  );
}
