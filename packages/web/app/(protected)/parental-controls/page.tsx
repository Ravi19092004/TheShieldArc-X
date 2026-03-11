import { Navigation } from '@/components/Navigation';
import { ParentalControlDashboard } from '@/components/ParentalControlDashboard';

export default function ParentalControlsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation isAuthenticated={true} />
      <div className="container mx-auto px-4 py-8">
        <ParentalControlDashboard />
      </div>
    </div>
  );
}
