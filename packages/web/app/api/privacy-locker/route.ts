//packages/web/app/api/privacy-locker/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';


export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const items = await db.privacyLockerItem.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching privacy locker items:', error);
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
    const { title, type, encryptedContent, iv } = body;

    if (!title || !type || !encryptedContent || !iv) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newItem = await db.privacyLockerItem.create({
      data: {
        userId: session.user.id,
        title,
        type,
        encryptedContent,
        iv,
      },
    });

    return NextResponse.json(newItem);
  } catch (error) {
    console.error('Error creating privacy locker item:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Item ID required' }, { status: 400 });
    }

    await db.privacyLockerItem.delete({
      where: {
        id: id,
        userId: session.user.id, // Ensure user can only delete their own items
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting privacy locker item:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
