import { Navigation } from '@/components/Navigation';
import { VoiceCommandInterface } from '@/components/VoiceCommandInterface';

export default function VoiceCommandsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation isAuthenticated={true} />
      <div className="container mx-auto px-4 py-8">
        <VoiceCommandInterface />
      </div>
    </div>
  );
}
