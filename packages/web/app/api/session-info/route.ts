import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user data including terms acceptance
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        termsAccepted: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get client IP from headers
    const headersList = await headers();
    const forwarded = headersList.get('x-forwarded-for');
    const realIp = headersList.get('x-real-ip');
    const clientIp = forwarded?.split(',')[0] || realIp || '127.0.0.1';

    // For server-side API, we can make external API calls
    const response = await fetch(`https://ip-api.com/json/${clientIp}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; SessionInfo/1.0)'
      }
    });

    let locationData = {
      ip: clientIp,
      city: "Unknown",
      region: "Unknown",
      country_name: "Unknown",
      org: "Unknown ISP",
      timezone: "UTC"
    };

    if (response.ok) {
      const data = await response.json();
      // Map to consistent interface
      locationData = {
        ip: data.query,
        city: data.city,
        region: data.regionName,
        country_name: data.country,
        org: data.isp,
        timezone: data.timezone
      };
    }

    return NextResponse.json({
      ...locationData,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        termsAccepted: user.termsAccepted,
      },
      termsAccepted: user.termsAccepted,
    });
  } catch (error) {
    console.error("[SESSION_INFO_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch session info" },
      { status: 500 }
    );
  }
}
