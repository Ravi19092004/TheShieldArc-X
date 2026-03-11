import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const userId = session.user.id;
  const { id } = await params;

  try {
    const scan = await db.scan.findUnique({
      where: { id },
    });

    if (!scan || scan.userId !== userId) {
      return new NextResponse('Not Found', { status: 404 });
    }

    await db.scan.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 }); // No Content
  } catch (error) {
    console.error('Error deleting scan history:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}