//packages/web/app/api/parental-controls/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

const DEFAULT_TIME_LIMITS = {
  enabled: false,
  dailyLimit: 120, // 2 hours
  allowedHours: { start: '08:00', end: '20:00' },
};

// Content filtering categories
const CONTENT_CATEGORIES = {
  adult: ['porn', 'sex', 'adult', 'xxx', 'nude', 'erotic'],
  violence: ['violence', 'gore', 'murder', 'kill', 'death', 'blood'],
  gambling: ['casino', 'gambling', 'bet', 'poker', 'lottery'],
  social: ['facebook', 'twitter', 'instagram', 'tiktok', 'snapchat', 'youtube'],
  gaming: ['game', 'gaming', 'minecraft', 'fortnite', 'roblox']
};

// Function to check if URL should be blocked based on content filtering
function shouldBlockContent(url: string, contentFiltering: boolean, blocklist: string[]): boolean {
  if (!contentFiltering) return false;

  const urlLower = url.toLowerCase();

  // Check custom blocklist
  for (const blocked of blocklist) {
    if (urlLower.includes(blocked.toLowerCase())) {
      return true;
    }
  }

  // Check content categories
  for (const keywords of Object.values(CONTENT_CATEGORIES)) {
    for (const keyword of keywords) {
      if (urlLower.includes(keyword)) {
        return true;
      }
    }
  }

  return false;
}

// Function to check time restrictions
function isWithinAllowedTime(timeLimits: { enabled: boolean; allowedHours: { start: string; end: string } }): boolean {
  if (!timeLimits?.enabled) return true;

  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes(); // minutes since midnight

  const [startHour, startMin] = timeLimits.allowedHours.start.split(':').map(Number);
  const [endHour, endMin] = timeLimits.allowedHours.end.split(':').map(Number);

  const startTime = startHour * 60 + startMin;
  const endTime = endHour * 60 + endMin;

  return currentTime >= startTime && currentTime <= endTime;
}

// Function to check daily time limit (simplified - would need session tracking)
function hasExceededDailyLimit(userId: string, timeLimits: { enabled: boolean; dailyLimit: number }): boolean {
  if (!timeLimits?.enabled) return false;

  // In a real implementation, this would track user session time
  // For now, return false (not exceeded)
  return false;
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const parentalControl = await db.parentalControl.findUnique({
      where: { userId: session.user.id },
    });

    if (!parentalControl) {
      // Return default settings
      return NextResponse.json({
        // id will be generated on first save, so it's not present for a new control
        // The frontend expects an 'id' field, so we might need to adjust the frontend interface
        // or provide a placeholder if it's strictly needed before saving.
        // For now, we'll omit it as it's not part of the initial creation.
        userId: session.user.id,
        enabled: false,
        blocklist: [],
        timeLimits: DEFAULT_TIME_LIMITS,
        safeBrowsing: false,
        contentFiltering: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    // Ensure timeLimits is always an object, even if it was null in the DB
    if (parentalControl.timeLimits === null) {
      parentalControl.timeLimits = DEFAULT_TIME_LIMITS;
    }
    return NextResponse.json(parentalControl);
  } catch (error) {
    console.error('Error fetching parental controls:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { enabled, blocklist, timeLimits, safeBrowsing, contentFiltering } = body;

    // Ensure timeLimits is always a valid object before saving
    // Merge with defaults to ensure all properties exist, even if not provided in the request body
    const timeLimitsToSave = {
      ...DEFAULT_TIME_LIMITS,
      ...(timeLimits || {}), // Use provided timeLimits, or empty object if null/undefined
    };

    const updatedControl = await db.parentalControl.upsert({
      where: { userId: session.user.id },
      update: {
        enabled,
        blocklist,
        timeLimits: timeLimitsToSave,
        safeBrowsing,
        contentFiltering,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        enabled,
        blocklist,
        timeLimits: timeLimitsToSave,
        safeBrowsing,
        contentFiltering,
      },
    });

    return NextResponse.json(updatedControl);
  } catch (error) {
    console.error('Error updating parental controls:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// New endpoint to check if a URL should be blocked
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

    const parentalControl = await db.parentalControl.findUnique({
      where: { userId: session.user.id },
    });

    if (!parentalControl || !parentalControl.enabled) {
      return NextResponse.json({ blocked: false, reason: null });
    }

    // Check time restrictions
    const withinTime = isWithinAllowedTime(parentalControl.timeLimits as { enabled: boolean; allowedHours: { start: string; end: string } });
    if (!withinTime) {
      return NextResponse.json({
        blocked: true,
        reason: 'Time restrictions active',
        allowedHours: (parentalControl.timeLimits as { enabled: boolean; allowedHours: { start: string; end: string } })?.allowedHours
      });
    }

    // Check daily time limit
    const exceededLimit = hasExceededDailyLimit(session.user.id, parentalControl.timeLimits as { enabled: boolean; dailyLimit: number });
    if (exceededLimit) {
      return NextResponse.json({
        blocked: true,
        reason: 'Daily time limit exceeded',
        dailyLimit: (parentalControl.timeLimits as { enabled: boolean; dailyLimit: number })?.dailyLimit
      });
    }

    // Check content filtering
    const shouldBlock = shouldBlockContent(url, parentalControl.contentFiltering, parentalControl.blocklist);
    if (shouldBlock) {
      return NextResponse.json({
        blocked: true,
        reason: 'Content filtering active',
        categories: Object.keys(CONTENT_CATEGORIES)
      });
    }

    return NextResponse.json({ blocked: false, reason: null });
  } catch (error) {
    console.error('Error checking URL:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
