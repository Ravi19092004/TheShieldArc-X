import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Path to the extension zip file (assuming it's in the public folder)
    const filePath = path.join(process.cwd(), 'public', 'extension.zip');

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Extension file not found' }, { status: 404 });
    }

    // Read the file
    const fileBuffer = fs.readFileSync(filePath);

    // Return the file with appropriate headers
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="extension.zip"',
      },
    });
  } catch (error) {
    console.error('Error downloading extension:', error);
    return NextResponse.json({ error: 'Failed to download extension' }, { status: 500 });
  }
}
