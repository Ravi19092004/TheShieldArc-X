import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all users except current user for messaging
    const users = await db.user.findMany({
      where: {
        id: { not: session.user.id }
      },
      select: {
        id: true,
        name: true,
        email: true
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
