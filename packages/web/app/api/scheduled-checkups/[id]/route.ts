import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const body = await request.json();
    const { isActive } = body;

    const checkup = await db.scheduledCheckup.update({
      where: {
        id: id,
        userId: session.user.id, // Ensure user owns the checkup
      },
      data: { isActive },
    });

    // Return in the format expected by the component
    const transformedCheckup = {
      id: checkup.id,
      name: checkup.name,
      type: 'security-scan',
      frequency: checkup.frequency as 'daily' | 'weekly' | 'monthly',
      nextRun: checkup.nextRunAt.toISOString(),
      lastRun: checkup.lastRunAt?.toISOString(),
      isActive: checkup.isActive,
      settings: {
        scanDepth: 'quick',
        includeSystem: true,
        notifyOnFailure: true
      }
    };

    return NextResponse.json(transformedCheckup);
  } catch (error) {
    console.error('Error updating scheduled checkup:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await db.scheduledCheckup.delete({
      where: {
        id: id,
        userId: session.user.id, // Ensure user owns the checkup
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting scheduled checkup:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
