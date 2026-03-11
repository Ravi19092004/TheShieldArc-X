import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { command } = body;

    if (!command) {
      return NextResponse.json({ error: 'Command is required' }, { status: 400 });
    }

    // Process voice command and return appropriate response
    const response = await processVoiceCommand(command);

    return NextResponse.json({ response, command });
  } catch (error) {
    console.error('Error processing voice command:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function processVoiceCommand(command: string): Promise<string> {
  const cmd = command.toLowerCase().trim();

  if (cmd.includes('scan website') || cmd.includes('scan site')) {
    return 'Initiating website security scan...';
  }

  if (cmd.includes('check privacy') || cmd.includes('privacy score')) {
    return 'Analyzing website privacy practices...';
  }

  if (cmd.includes('show threats') || cmd.includes('threat feed')) {
    return 'Opening threat intelligence feed...';
  }

  if (cmd.includes('view dashboard') || cmd.includes('open dashboard')) {
    return 'Navigating to main dashboard...';
  }

  if (cmd.includes('open locker') || cmd.includes('privacy locker')) {
    return 'Opening privacy locker...';
  }

  if (cmd.includes('check achievements') || cmd.includes('show achievements')) {
    return 'Displaying your achievements...';
  }

  if (cmd.includes('start scan')) {
    return 'Starting comprehensive security scan...';
  }

  if (cmd.includes('stop scan')) {
    return 'Stopping current security scan...';
  }

  if (cmd.includes('help')) {
    return 'Available commands include: scan website, check privacy, show threats, view dashboard, open locker, check achievements, start scan, stop scan, incident response, report incident, parental controls, block website, unblock website, security devices, connect device, disconnect device, scheduled checkups, schedule checkup, run checkup, emergency kit, download kit, scan history, clear history, secure messaging, send message, system monitoring, check system, phishing trends, pricing, blog, statistics, update profile, go back, refresh page, and help.';
  }

  return 'Command not recognized. Say "help" to see available commands.';
}
