import { Navigation } from '@/components/Navigation';
import { SecurityDeviceIntegration } from '@/components/SecurityDeviceIntegration';

export default function SecurityDevicesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation isAuthenticated={true} />
      <div className="container mx-auto px-4 py-8">
        <SecurityDeviceIntegration />
      </div>
    </div>
  );
}
