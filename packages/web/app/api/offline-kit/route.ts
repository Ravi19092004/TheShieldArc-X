import { NextResponse } from 'next/server';
import { auth } from '@/auth';

const EMERGENCY_GUIDES = [
  {
    id: 'password-emergency',
    title: 'Password Emergency Guide',
    url: '/downloads/password-emergency-guide.pdf',
    description: 'Steps to take when your password is compromised'
  },
  {
    id: 'phishing-response',
    title: 'Phishing Attack Response',
    url: '/downloads/phishing-response-guide.pdf',
    description: 'What to do if you suspect a phishing attack'
  },
  {
    id: 'data-breach-recovery',
    title: 'Data Breach Recovery',
    url: '/downloads/data-breach-recovery-guide.pdf',
    description: 'Steps to recover from a data breach'
  },
  {
    id: 'offline-security',
    title: 'Offline Security Practices',
    url: '/downloads/offline-security-guide.pdf',
    description: 'Security measures when internet is unavailable'
  }
];

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(EMERGENCY_GUIDES);
  } catch (error) {
    console.error('Error fetching offline kit:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
