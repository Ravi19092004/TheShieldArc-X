//packages/web/app/api/insights/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rule-based insights based on user scan history
    const userScans = await db.scan.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const insights = [];

    // Analyze scan patterns
    const unsafeScans = userScans.filter(scan => scan.status === 'Unsafe');
    const totalScans = userScans.length;

    if (totalScans > 0) {
      const unsafePercentage = (unsafeScans.length / totalScans) * 100;

      if (unsafePercentage > 50) {
        insights.push({
          id: 'high-risk-behavior',
          type: 'security',
          title: 'High Risk Behavior Detected',
          description: 'You\'ve encountered many unsafe sites. Consider being more cautious with unknown links.',
          priority: 'high',
          actionable: true,
          createdAt: new Date().toISOString(),
        });
      }

      if (totalScans >= 10 && unsafePercentage < 10) {
        insights.push({
          id: 'safe-browsing-habits',
          type: 'behavior',
          title: 'Excellent Safe Browsing Habits',
          description: 'You\'re doing great at avoiding unsafe websites. Keep up the good work!',
          priority: 'low',
          actionable: false,
          createdAt: new Date().toISOString(),
        });
      }
    }

    // Check for achievements
    const achievements = await db.achievement.findMany({
      where: { userId: session.user.id },
    });

    if (achievements.length === 0 && totalScans >= 5) {
      insights.push({
        id: 'first-achievements',
        type: 'recommendation',
        title: 'Earn Your First Achievement',
        description: 'You\'ve completed several scans. Check out the gamification section to see your progress!',
        priority: 'medium',
        actionable: true,
        createdAt: new Date().toISOString(),
      });
    }

    // Default insights if none generated
    if (insights.length === 0) {
      insights.push(
        {
          id: 'enable-2fa',
          type: 'security',
          title: 'Enable Two-Factor Authentication',
          description: 'Add an extra layer of security to your account with 2FA.',
          priority: 'high',
          actionable: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'regular-scans',
          type: 'behavior',
          title: 'Regular Security Scans',
          description: 'Make it a habit to scan suspicious URLs before clicking.',
          priority: 'medium',
          actionable: true,
          createdAt: new Date().toISOString(),
        }
      );
    }

    return NextResponse.json(insights);
  } catch (error) {
    console.error('Error fetching insights:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
