import { useState, useEffect } from "react";
import { MapPin, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface IPLocationInfoProps {
  showTitle?: boolean;
}

const IPLocationInfo = ({ showTitle = false }: IPLocationInfoProps) => {
  const [ipInfo, setIpInfo] = useState<{
    ip: string;
    city: string;
    country: string;
    region: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIPInfo = async () => {
      try {
        // Try multiple IP geolocation services for better reliability
        const services = [
          "https://ipapi.co/json/",
          "https://api.ip.sb/geoip",
          "http://ip-api.com/json/"
        ];

        let data = null;
        for (const service of services) {
          try {
            const response = await fetch(service);
            if (response.ok) {
              data = await response.json();
              break;
            }
          } catch {
            continue;
          }
        }

        if (data) {
          setIpInfo({
            ip: data.ip || data.query || "Unknown",
            city: data.city || "Unknown",
            country: data.country_name || data.country || "Unknown",
            region: data.region || data.regionName || "Unknown",
          });
        } else {
          throw new Error("All services failed");
        }
      } catch (error) {
        console.error("Failed to fetch IP info:", error);
        setIpInfo({
          ip: "Unknown",
          city: "Unknown",
          country: "Unknown",
          region: "Unknown",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchIPInfo();
  }, []);

  if (loading) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        {showTitle && (
          <CardHeader>
            <CardTitle className="text-lg">Location Information</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      {showTitle && (
        <CardHeader>
          <CardTitle className="text-lg">Location Information</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-muted-foreground" />
            <span>IP: {ipInfo?.ip}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span>
              {ipInfo?.city}, {ipInfo?.region}, {ipInfo?.country}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IPLocationInfo;
