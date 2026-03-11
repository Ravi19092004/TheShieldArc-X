// app/api/offline-kit/download-pdf/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import puppeteer from 'puppeteer';

// Add this line to force Node.js runtime
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, htmlContent } = await request.json();

    if (!title || !htmlContent) {
      return NextResponse.json({ error: 'Title and htmlContent are required' }, { status: 400 });
    }

    // CSS styles for the PDF
    const css = `
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
          Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        line-height: 1.6;
        color: #333;
        padding: 2rem;
        max-width: none;
      }
      h1, h2, h3 {
        color: #111;
        margin-top: 1.5em;
        margin-bottom: 0.5em;
      }
      h1 {
        font-size: 2em;
        border-bottom: 2px solid #eee;
        padding-bottom: 0.3em;
      }
      h2 {
        font-size: 1.5em;
        border-bottom: 1px solid #eee;
        padding-bottom: 0.2em;
      }
      h3 {
        font-size: 1.25em;
      }
      p {
        margin-bottom: 1em;
      }
      ul {
        margin-bottom: 1em;
        padding-left: 2em;
      }
      li {
        margin-bottom: 0.5em;
      }
      code {
        background-color: #f4f4f4;
        padding: 0.2em 0.4em;
        border-radius: 3px;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: 0.9em;
      }
      pre {
        background-color: #f4f4f4;
        padding: 1em;
        border-radius: 3px;
        overflow-x: auto;
        margin-bottom: 1em;
      }
      pre code {
        background-color: transparent;
        padding: 0;
        border-radius: 0;
      }
    `;

    // Create complete HTML
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>${css}</style>
        </head>
        <body>
          ${htmlContent}
        </body>
      </html>
    `;

    // Launch Puppeteer and generate PDF
    const browser = await puppeteer.launch({
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '1cm',
        right: '1cm',
        bottom: '1cm',
        left: '1cm'
      }
    });

    await browser.close();

    // Return PDF as blob
    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
