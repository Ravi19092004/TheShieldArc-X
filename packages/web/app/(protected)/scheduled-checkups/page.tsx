import { Navigation } from '@/components/Navigation';
import { ScheduledCheckups } from '@/components/ScheduledCheckups';

export default function ScheduledCheckupsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation isAuthenticated={true} />
      <div className="container mx-auto px-4 py-8">
        <ScheduledCheckups />
      </div>
    </div>
  );
}
