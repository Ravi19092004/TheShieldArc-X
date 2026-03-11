//packages/web/app/api/scheduled-checkups/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const checkups = await db.scheduledCheckup.findMany({
      where: { userId: session.user.id },
      orderBy: { nextRunAt: 'asc' },
    });

    return NextResponse.json(checkups);
  } catch (error) {
    console.error('Error fetching scheduled checkups:', error);
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
    const { name, description, frequency } = body;

    // Calculate next run time
    const now = new Date();
    const nextRunAt = new Date(now);

    switch (frequency) {
      case 'daily':
        nextRunAt.setDate(now.getDate() + 1);
        break;
      case 'weekly':
        nextRunAt.setDate(now.getDate() + 7);
        break;
      case 'monthly':
        nextRunAt.setMonth(now.getMonth() + 1);
        break;
      default:
        nextRunAt.setDate(now.getDate() + 7); // Default to weekly
    }

    const checkup = await db.scheduledCheckup.create({
      data: {
        userId: session.user.id,
        name,
        description,
        frequency,
        nextRunAt,
      },
    });

    return NextResponse.json(checkup);
  } catch (error) {
    console.error('Error creating scheduled checkup:', error);
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
    const { id, isActive } = body;

    const checkup = await db.scheduledCheckup.update({
      where: {
        id,
        userId: session.user.id, // Ensure user owns the checkup
      },
      data: { isActive },
    });

    return NextResponse.json(checkup);
  } catch (error) {
    console.error('Error updating scheduled checkup:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
