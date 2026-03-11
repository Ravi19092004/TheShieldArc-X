//packages/web/app/api/threat-feeds/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

// Mock threat intelligence data sources
const THREAT_SOURCES = [
  {
    name: 'Phishing Database',
    url: 'https://phishtank.com/api_info.php',
    category: 'phishing'
  },
  {
    name: 'Malware Information Sharing Platform',
    url: 'https://www.misp-project.org/',
    category: 'malware'
  },
  {
    name: 'Open Threat Exchange',
    url: 'https://otx.alienvault.com/',
    category: 'general'
  },
  {
    name: 'VirusTotal Intelligence',
    url: 'https://www.virustotal.com/gui/intelligence-overview',
    category: 'malware'
  }
];

// Function to fetch real threat data (simplified for demo)
async function fetchThreatData() {
  // In production, this would integrate with real threat intelligence APIs
  const mockThreats = [
    {
      source: 'PhishTank',
      title: 'New phishing campaign targeting banking users',
      url: 'https://example-phishing-site.com',
      description: 'Massive phishing campaign using fake bank login pages',
      severity: 'high',
      category: 'phishing',
      publishedAt: new Date(Date.now() - 3600000), // 1 hour ago
      isActive: true
    },
    {
      source: 'AlienVault OTX',
      title: 'Malware distribution via compromised WordPress sites',
      url: 'https://compromised-wordpress.com/malware.exe',
      description: 'Drive-by download attacks through vulnerable WordPress installations',
      severity: 'critical',
      category: 'malware',
      publishedAt: new Date(Date.now() - 7200000), // 2 hours ago
      isActive: true
    },
    {
      source: 'MISP',
      title: 'Ransomware attack indicators',
      url: 'https://ransomware-c2.example.com',
      description: 'Command and control server for new ransomware variant',
      severity: 'critical',
      category: 'ransomware',
      publishedAt: new Date(Date.now() - 10800000), // 3 hours ago
      isActive: true
    },
    {
      source: 'VirusTotal',
      title: 'Zero-day vulnerability in popular browser extension',
      url: 'https://chrome-extension-vuln.com',
      description: 'Critical vulnerability allowing remote code execution',
      severity: 'high',
      category: 'vulnerability',
      publishedAt: new Date(Date.now() - 14400000), // 4 hours ago
      isActive: true
    },
    {
      source: 'CERT-EU',
      title: 'Supply chain attack affecting multiple organizations',
      url: 'https://supply-chain-attack.example.com',
      description: 'Compromised third-party library affecting thousands of websites',
      severity: 'high',
      category: 'supply-chain',
      publishedAt: new Date(Date.now() - 18000000), // 5 hours ago
      isActive: true
    }
  ];

  return mockThreats;
}

// Function to populate database with threat feeds
async function populateThreatFeeds() {
  try {
    const threats = await fetchThreatData();

    for (const threat of threats) {
      // Check if threat already exists
      const existing = await db.threatFeed.findFirst({
        where: { url: threat.url }
      });

      if (!existing) {
        await db.threatFeed.create({
          data: {
            source: threat.source,
            title: threat.title,
            url: threat.url,
            description: threat.description,
            severity: threat.severity,
            category: threat.category,
            publishedAt: threat.publishedAt,
            isActive: threat.isActive
          }
        });
      }
    }
  } catch (error) {
    console.error('Error populating threat feeds:', error);
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Populate threat feeds if database is empty
    const existingCount = await db.threatFeed.count();
    if (existingCount === 0) {
      await populateThreatFeeds();
    }

    // Fetch threat feeds from database
    const threatFeeds = await db.threatFeed.findMany({
      where: { isActive: true },
      orderBy: { publishedAt: 'desc' },
      take: 50,
    });

    // Add metadata about data sources
    const response = {
      feeds: threatFeeds,
      sources: THREAT_SOURCES,
      lastUpdated: new Date().toISOString(),
      totalActive: threatFeeds.length
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching threat feeds:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { url, title, description, severity, category } = body;

    // Create threat report from user
    const threatReport = await db.threatReport.create({
      data: {
        userId: session.user.id,
        url,
        title,
        description,
        severity: severity || 'medium',
        category: category || 'phishing',
      },
    });

    return NextResponse.json(threatReport);
  } catch (error) {
    console.error('Error creating threat report:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
