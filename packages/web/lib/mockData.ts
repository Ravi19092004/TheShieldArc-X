export interface ScanResult {
  id: string;
  url: string;
  trustScore: number;
  status: string;
  colorCode: string;
  timestamp: Date;
  details: {
    ip: string;
    asn: string;
    location: string;
    sourceUrl: string;
    finalUrl: string;
  };
}

export const mockDashboardStats = {
  totalScans: 1234,
  phishingDetected: 56,
  safeSites: 1178,
  safePercentage: 95.5,
};

export const mockRecentScans: ScanResult[] = [
  {
    id: "1",
    url: "https://example.com",
    trustScore: 85,
    status: "Safe",
    colorCode: "green",
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    details: {
      ip: "192.168.1.1",
      asn: "AS12345 Mock Provider",
      location: "Unknown",
      sourceUrl: "https://example.com",
      finalUrl: "https://example.com",
    },
  },
  {
    id: "2",
    url: "https://suspicious-site.com",
    trustScore: 25,
    status: "Suspicious",
    colorCode: "yellow",
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    details: {
      ip: "10.0.0.1",
      asn: "AS67890 Suspicious ASN",
      location: "Unknown",
      sourceUrl: "https://suspicious-site.com",
      finalUrl: "https://suspicious-site.com",
    },
  },
  {
    id: "3",
    url: "https://phishing-site.com",
    trustScore: 10,
    status: "Unsafe",
    colorCode: "red",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    details: {
      ip: "172.16.0.1",
      asn: "AS11111 Phishing ASN",
      location: "Unknown",
      sourceUrl: "https://phishing-site.com",
      finalUrl: "https://phishing-site.com",
    },
  },
  {
    id: "4",
    url: "https://safe-site.org",
    trustScore: 92,
    status: "Safe",
    colorCode: "green",
    timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
    details: {
      ip: "203.0.113.1",
      asn: "AS22222 Safe Provider",
      location: "Unknown",
      sourceUrl: "https://safe-site.org",
      finalUrl: "https://safe-site.org",
    },
  },
  {
    id: "5",
    url: "https://another-safe.com",
    trustScore: 88,
    status: "Safe",
    colorCode: "green",
    timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    details: {
      ip: "198.51.100.1",
      asn: "AS33333 Another Safe",
      location: "Unknown",
      sourceUrl: "https://another-safe.com",
      finalUrl: "https://another-safe.com",
    },
  },
];
