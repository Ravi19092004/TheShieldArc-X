"use client";

import { useEffect, useState, ReactNode } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Globe, MapPin, Wifi, ShieldCheck, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SessionInfo {
  ip?: string;
  city?: string;
  district?: string;
  region?: string;
  country_name?: string;
  org?: string;
  timezone?: string;
}

interface SessionInfoCardProps {
  title?: string;
  value?: number;
  icon?: ReactNode;
}

export default function SessionInfoCard({ title, value, icon }: SessionInfoCardProps) {
  const [info, setInfo] = useState<SessionInfo | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchSessionInfo = async () => {
        console.log("Starting session info fetch, browser:", navigator.userAgent);

        // Always try to get real IP and ISP from external APIs first
        let realIp = 'Unknown';
        let realIsp = 'Unknown ISP';
        let realTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        try {
          // Get real public IP
          const ipRes = await fetch('https://api.ipify.org?format=json');
          const ipData = await ipRes.json();
          realIp = ipData.ip;
          console.log("Real IP detected:", realIp);

          // Get ISP and timezone for the real IP
          const ispApis = [
            `https://ipapi.co/json/`,
            `https://ip-api.com/json/${realIp}`,
            `https://api.ip.sb/geoip`,
            `https://ipinfo.io/json?token=`, // Note: Requires token, but works without for basic info
            `https://api.ipgeolocation.io/ipgeo?apiKey=`, // Note: Requires API key, but has free tier
            `https://api.ip2location.io/?key=demo&ip=${realIp}` // Demo key for basic functionality
          ];

          for (const api of ispApis) {
            try {
              const ispRes = await fetch(api);
              if (ispRes.ok) {
                const ispData = await ispRes.json();
                realIsp = ispData.org || ispData.isp || 'Unknown ISP';
                realTimezone = ispData.timezone || realTimezone;
                console.log("ISP and timezone from API:", realIsp, realTimezone);
                if (realIsp !== 'Unknown ISP') break;
              }
            } catch {
              continue;
            }
          }
        } catch (ipErr) {
          console.log("External IP detection failed:", ipErr);
        }

        // Get IP-based location first for consistency across browsers
        console.log("Getting IP-based location for consistency...");
        let ipLocationData = null;
        try {
          const ipLocationApis = [
            `https://ipapi.co/json/`,
            `https://ip-api.com/json/${realIp}`,
            `https://api.ip.sb/geoip`,
            `https://ipinfo.io/json?token=`,
            `https://api.ipgeolocation.io/ipgeo?apiKey=`,
            `https://api.ip2location.io/?key=demo&ip=${realIp}`
          ];

          for (const api of ipLocationApis) {
            try {
              const locationRes = await fetch(api);
              if (locationRes.ok) {
                const locationData = await locationRes.json();
                console.log("IP-based location data:", locationData);
                ipLocationData = locationData;
                break; // Use first successful API response
              }
            } catch {
              continue;
            }
          }
        } catch (ipLocationErr) {
          console.log("IP-based location failed:", ipLocationErr);
        }

        // Now try browser geolocation to enhance accuracy if available and accurate
        if (navigator.geolocation && ipLocationData) {
          console.log("Browser geolocation available, checking if it can improve accuracy...");
          try {
            const permission = await navigator.permissions.query({ name: 'geolocation' });
            console.log("Geolocation permission state:", permission.state);

            if (permission.state === 'granted' || permission.state === 'prompt') {
              console.log("Attempting browser geolocation for accuracy enhancement...");
              const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                  enableHighAccuracy: true,
                  timeout: 15000,
                  maximumAge: 300000 // Allow cached location up to 5 minutes
                });
              });

              const { latitude, longitude, accuracy } = position.coords;
              console.log("Browser geolocation successful:", { latitude, longitude, accuracy });

              // Only use browser geolocation if it's significantly more accurate (within 10km)
              if (accuracy < 10000) { // 10km radius
                // Use reverse geocoding to get precise location
                const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
                if (geoRes.ok) {
                  const geoData = await geoRes.json();
                  console.log("Reverse geocoding successful:", geoData);

                  // Use browser location only if it's in the same country/region as IP location
                  const ipCountry = ipLocationData.country_name || ipLocationData.country;
                  const geoCountry = geoData.countryName;
                  const ipRegion = ipLocationData.region || ipLocationData.regionName;
                  const geoRegion = geoData.principalSubdivision;

                  if (ipCountry === geoCountry && ipRegion === geoRegion) {
                    setInfo({
                      ip: realIp,
                      city: geoData.city || geoData.locality || ipLocationData.city || 'Unknown',
                      district: geoData.localityInfo?.administrative?.[2]?.name || geoData.localityInfo?.administrative?.[1]?.name,
                      region: geoData.principalSubdivision || ipLocationData.region || ipLocationData.regionName,
                      country_name: geoData.countryName || ipLocationData.country_name || ipLocationData.country,
                      org: realIsp,
                      timezone: geoData.timeZone?.name || ipLocationData.timezone || realTimezone
                    });
                    console.log("✅ Enhanced with accurate browser geolocation");
                    return;
                  } else {
                    console.log("Browser location doesn't match IP location, using IP location");
                  }
                }
              } else {
                console.log("Browser geolocation accuracy too low:", accuracy, "meters");
              }
            }
          } catch (geoErr) {
            console.log("Browser geolocation failed or not accurate enough:", geoErr instanceof Error ? geoErr.message : geoErr);
          }
        }

        // Use IP-based location as primary source
        if (ipLocationData) {
          setInfo({
            ip: realIp,
            city: ipLocationData.city || 'Unknown',
            region: ipLocationData.region || ipLocationData.regionName || 'Unknown',
            country_name: ipLocationData.country_name || ipLocationData.country || 'Unknown',
            org: realIsp,
            timezone: ipLocationData.timezone || realTimezone
          });
          console.log("✅ Set info from IP-based location (primary source)");
          return;
        }

        // Final fallback
        console.log("All location methods failed, using basic info");
        setInfo({
          ip: realIp,
          city: "Location detection failed",
          region: "Please enable location services",
          country_name: "",
          org: realIsp,
          timezone: realTimezone
        });
      };

      useEffect(() => {
        fetchSessionInfo();
  }, [title]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchSessionInfo();
    setIsRefreshing(false);
  };

  if (title) {
    // Render as stats card
    return (
      <Card className="bg-card border-border animate-scale-in hover:scale-105 hover:shadow-lg hover:border-primary/50 transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            {icon}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
        </CardContent>
      </Card>
    );
  }

  // Render as session info card
  return (
    <Card className="bg-card border-border animate-scale-in hover:scale-105 hover:shadow-lg hover:border-primary/50 transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Globe className="w-5 h-5 text-primary" />
          Session Information
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 text-sm">
        {info ? (
          <>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Location</span>
              <span className="font-medium">
                {info.city}{info.district ? `, ${info.district}` : ''}, {info.region}, {info.country_name}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">IP Address</span>
              <span className="font-medium">{info.ip}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">ISP</span>
              <span className="font-medium">{info.org}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Timezone</span>
              <span className="font-medium">{info.timezone}</span>
            </div>
          </>
        ) : (
          <p className="text-muted-foreground text-sm">Fetching session data...</p>
        )}

        <hr className="my-2 opacity-30" />

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-safe" /> IP tracking active
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-8 px-2"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <p className="text-sm font-medium flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" /> Location monitoring
          </p>
          <p className="text-sm font-medium flex items-center gap-2">
            <Wifi className="w-4 h-4 text-warning" /> Session protection
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
