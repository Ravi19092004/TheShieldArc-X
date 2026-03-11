//packages/web/app/api/privacy-scores/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

// Common tracker domains to check for
const TRACKER_DOMAINS = [
  'google-analytics.com',
  'googletagmanager.com',
  'facebook.com',
  'facebook.net',
  'twitter.com',
  'linkedin.com',
  'pinterest.com',
  'instagram.com',
  'youtube.com',
  'doubleclick.net',
  'googlesyndication.com',
  'amazon-adsystem.com',
  'hotjar.com',
  'mixpanel.com',
  'segment.com',
  'chartbeat.com',
  'quantserve.com',
  'scorecardresearch.com',
  'crazyegg.com',
  'mouseflow.com'
];



export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get recent privacy scores (last 20)
    const scores = await db.privacyScore.findMany({
      orderBy: { lastScannedAt: 'desc' },
      take: 20
    });

    return NextResponse.json(scores);
  } catch (error) {
    console.error('Error fetching privacy scores:', error);
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
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Extract domain from URL
    let domain: string;
    try {
      const urlObj = new URL(url);
      domain = urlObj.hostname.replace(/^www\./, '');
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    // Check if we have a recent scan (within last hour)
    const existingScan = await db.privacyScore.findUnique({
      where: { url }
    });

    if (existingScan && (Date.now() - existingScan.lastScannedAt.getTime()) < 3600000) {
      return NextResponse.json(existingScan);
    }

    // Perform privacy analysis
    const privacyData = await analyzePrivacy(url, domain);

    // Save or update the privacy score
    const score = await db.privacyScore.upsert({
      where: { url },
      update: {
        score: privacyData.score,
        trackers: privacyData.trackers,
        cookies: privacyData.cookies,
        lastScannedAt: new Date(),
        nextScanAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Next scan in 24 hours
      },
      create: {
        url,
        domain,
        score: privacyData.score,
        trackers: privacyData.trackers,
        cookies: privacyData.cookies,
        lastScannedAt: new Date(),
        nextScanAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    });

    return NextResponse.json(score);
  } catch (error) {
    console.error('Error analyzing privacy:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function analyzePrivacy(url: string, domain: string) {
  let score = 100;
  const trackers: string[] = [];
  const cookies: string[] = [];

  try {
    // Basic analysis - in a real implementation, you'd fetch the page and analyze it
    // For now, we'll simulate analysis based on domain patterns

    // Check for known tracker domains
    for (const trackerDomain of TRACKER_DOMAINS) {
      if (domain.includes(trackerDomain) || url.includes(trackerDomain)) {
        trackers.push(trackerDomain);
        score -= 5; // Deduct points for each tracker
      }
    }

    // Simulate cookie analysis based on domain
    if (domain.includes('google') || domain.includes('facebook') || domain.includes('amazon')) {
      cookies.push('marketing', 'analytics', 'third-party');
      score -= 15;
    } else if (domain.includes('news') || domain.includes('blog')) {
      cookies.push('analytics', 'functional');
      score -= 10;
    } else {
      cookies.push('essential');
      score -= 5;
    }

    // Additional privacy checks
    if (url.startsWith('http://')) {
      score -= 20; // HTTP instead of HTTPS
    }

    if (domain.split('.').length > 2) {
      score -= 5; // Subdomain might indicate tracking
    }

    // Ensure score doesn't go below 0
    score = Math.max(0, score);

  } catch (error) {
    console.error('Error in privacy analysis:', error);
    score = 0;
  }

  return {
    score,
    trackers,
    cookies
  };
}
