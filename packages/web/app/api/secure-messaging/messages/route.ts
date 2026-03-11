//packages/web/app/api/secure-messaging/messages/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Get messages between current user and selected user
    const messages = await db.message.findMany({
      where: {
        OR: [
          { senderId: session.user.id, receiverId: userId },
          { senderId: userId, receiverId: session.user.id }
        ]
      },
      include: {
        sender: {
          select: { name: true, email: true }
        }
      },
      orderBy: { timestamp: 'asc' }
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
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
    const { receiverId, content, iv } = body;

    if (!receiverId || !content || !iv) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify receiver exists
    const receiver = await db.user.findUnique({
      where: { id: receiverId },
      select: { id: true }
    });

    if (!receiver) {
      return NextResponse.json({ error: 'Receiver not found' }, { status: 404 });
    }

    // Create the message
    const message = await db.message.create({
      data: {
        senderId: session.user.id,
        receiverId,
        content,
        iv,
        timestamp: new Date(),
        isRead: false
      },
      include: {
        sender: {
          select: { name: true, email: true }
        }
      }
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
