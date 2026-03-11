import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import puppeteer from "puppeteer";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }



  try {
    const userId = session.user.id;

    const scans = await db.scan.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    let htmlContent = `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 40px;
              color: #333;
              background-color: #f8f9fa;
              line-height: 1.6;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              padding: 25px;
              background-color: #007bff;
              color: white;
              border-radius: 10px;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: bold;
            }
            .header p {
              margin: 5px 0;
              font-size: 16px;
            }
            .table-container {
              background-color: white;
              border-radius: 10px;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
              overflow: hidden;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 0;
              table-layout: fixed;
            }
            th {
              background-color: #007bff;
              color: white;
              padding: 15px 8px;
              text-align: left;
              font-weight: bold;
              font-size: 14px;
              width: 14.28%;
            }
            td {
              padding: 12px 8px;
              border-bottom: 1px solid #ddd;
              font-size: 12px;
              word-wrap: break-word;
            }
            tr:nth-child(even) {
              background-color: #f2f2f2;
            }
            .status-safe {
              color: #28a745;
              font-weight: bold;
              background-color: #d4edda;
              padding: 2px 6px;
              border-radius: 4px;
            }
            .status-unsafe {
              color: #dc3545;
              font-weight: bold;
              background-color: #f8d7da;
              padding: 2px 6px;
              border-radius: 4px;
            }
            .status-error {
              color: #856404;
              font-weight: bold;
              background-color: #fff3cd;
              padding: 2px 6px;
              border-radius: 4px;
            }
            .percentage {
              font-weight: bold;
              color: #007bff;
            }
            .url {
              max-width: 300px;
              word-break: break-all;
              color: #007bff;
            }
            td:nth-child(6), td:nth-child(7) {
              padding: 12px 8px;
            }
            .explanation {
              margin-top: 20px;
              padding: 15px;
              background-color: #e9ecef;
              border-radius: 5px;
              font-size: 14px;
            }
            .explanation h3 {
              margin-top: 0;
              color: #495057;
            }
            .explanation ul {
              margin: 10px 0;
              padding-left: 20px;
            }
            .explanation li {
              margin-bottom: 5px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>DataShield.Ai - Scan History Report</h1>
            <p>Generated on: ${new Date().toLocaleString()}</p>
            <p>User: ${session.user.name || session.user.email}</p>
          </div>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>URL</th>
                  <th>Status</th>
                  <th>Safe %</th>
                  <th>Unsafe %</th>
                  <th>IP Address</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>
    `;

    scans.forEach((scan) => {
      const statusClass = scan.status === 'Safe' ? 'status-safe' : scan.status === 'Unsafe' ? 'status-unsafe' : 'status-error';
      htmlContent += `
        <tr>
          <td>${scan.createdAt.toLocaleString()}</td>
          <td class="url">${scan.url}</td>
          <td class="${statusClass}">${scan.status}</td>
          <td class="percentage">${scan.safe_percentage.toFixed(2)}%</td>
          <td class="percentage">${scan.unsafe_percentage.toFixed(2)}%</td>
          <td>${scan.ip_address || "N/A"}</td>
          <td>${scan.location || "N/A"}</td>
        </tr>
      `;
    });

    htmlContent += `
              </tbody>
            </table>
          </div>
          <div class="explanation">
            <h3>What do these results mean?</h3>
            <ul>
              <li><strong>Safe:</strong> The website is considered safe and secure</li>
              <li><strong>Unsafe:</strong> The website may contain harmful content or security risks</li>
              <li><strong>Error:</strong> There was an issue scanning this website</li>
              <li><strong>Safe %:</strong> Percentage of safe elements found on the website</li>
              <li><strong>Unsafe %:</strong> Percentage of unsafe elements found on the website</li>
            </ul>
            <p><em>This report was generated by DataShield.Ai security scanner. For more information, visit our website.</em></p>
          </div>
        </body>
      </html>
    `;

    const filename = "scan-history-report.pdf";

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setContent(htmlContent);
    const buffer = await page.pdf({
      format: 'A4',
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      },
      printBackground: true
    });
    await browser.close();

    const response = new NextResponse(Buffer.from(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
    return response;
  } catch (error) {
    console.error("[EXPORT_REPORT_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
