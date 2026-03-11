//packages/web/app/api/security-devices/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const devices = await db.securityDevice.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(devices);
  } catch (error) {
    console.error('Error fetching security devices:', error);
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
    const { name, type, secret } = body;

    if (!name || !type) {
      return NextResponse.json({ error: 'Name and type are required' }, { status: 400 });
    }

    // Generate a unique device ID
    const deviceId = `dev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // For TOTP, we need to store the secret encrypted
    let encryptedSecret = null;
    if (type === 'totp' && secret) {
      // In a real implementation, you'd encrypt this properly
      encryptedSecret = Buffer.from(secret).toString('base64');
    }

    const device = await db.securityDevice.create({
      data: {
        userId: session.user.id,
        name,
        type,
        deviceId,
        secret: encryptedSecret,
        isActive: true
      }
    });

    return NextResponse.json(device);
  } catch (error) {
    console.error('Error creating security device:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
