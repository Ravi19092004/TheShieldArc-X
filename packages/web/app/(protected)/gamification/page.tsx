import { Navigation } from '@/components/Navigation';
import { GamificationDashboard } from '@/components/GamificationDashboard';

export default function GamificationPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation isAuthenticated={true} />
      <div className="container mx-auto px-4 py-8">
        <GamificationDashboard />
      </div>
    </div>
  );
}
