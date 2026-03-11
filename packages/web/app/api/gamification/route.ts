//packages/web/app/api/gamification/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get user achievements
    const achievements = await db.achievement.findMany({
      where: { userId },
      orderBy: { earnedAt: 'desc' },
    });

    // Calculate total points
    const totalPoints = achievements.reduce((sum, ach) => sum + ach.points, 0);

    // Get user rank based on total points
    const allUsersPoints = await db.achievement.groupBy({
      by: ['userId'],
      _sum: { points: true },
      orderBy: { _sum: { points: 'desc' } },
    });

    const userRank = allUsersPoints.findIndex((u) => u.userId === userId) + 1;
    const totalUsers = allUsersPoints.length;

    // Get next milestone
    const milestones = [100, 500, 1000, 2500, 5000];
    const nextMilestone = milestones.find(m => m > totalPoints) || totalPoints + 1000;

    return NextResponse.json({
      achievements,
      totalPoints,
      rank: userRank,
      totalUsers,
      nextMilestone,
    });
  } catch (error) {
    console.error('Error fetching gamification data:', error);
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
    const { type, title, description, points } = body;

    // Award achievement
    const achievement = await db.achievement.create({
      data: {
        userId: session.user.id,
        type,
        title,
        description,
        points: points || 0,
      },
    });

    return NextResponse.json(achievement);
  } catch (error) {
    console.error('Error creating achievement:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
