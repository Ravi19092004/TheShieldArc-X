import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt();

export async function POST(request: NextRequest) {
  try {
    const { title, markdownContent } = await request.json();

    if (!title || !markdownContent) {
      return NextResponse.json({ error: 'Missing title or content' }, { status: 400 });
    }

    // Convert markdown to HTML
    const htmlContent = md.render(markdownContent);

    // Create a full HTML document for Puppeteer with basic styling
    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"; margin: 2cm; line-height: 1.6; color: #333; }
          h1, h2, h3, h4, h5, h6 { color: #222; margin-top: 1em; margin-bottom: 0.5em; }
          h1 { font-size: 2em; }
          h2 { font-size: 1.5em; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
          ul, ol { margin-left: 20px; padding-left: 0; }
          li { margin-bottom: 0.5em; }
          strong { font-weight: bold; }
          em { font-style: italic; }
          pre { background-color: #f6f8fa; padding: 10px; border-radius: 4px; overflow-x: auto; font-family: monospace; }
          code { background-color: #f6f8fa; padding: 2px 4px; border-radius: 3px; font-family: monospace; }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
      </html>
    `;

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'], // Recommended for Docker/CI environments
    });
    const page = await browser.newPage();

    await page.setContent(fullHtml, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
    });

    await browser.close();

    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${title.replace(/\s+/g, '_')}.pdf"` },
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}