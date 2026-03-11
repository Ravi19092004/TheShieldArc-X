import { Navigation } from '@/components/Navigation';
import { OfflineEmergencyKit } from '@/components/OfflineEmergencyKit';

export default function OfflineKitPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation isAuthenticated={true} />
      <div className="container mx-auto px-4 py-8">
        <OfflineEmergencyKit />
      </div>
    </div>
  );
}
