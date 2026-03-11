// /app/api/get-scan/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    // Optional: get URL filter from query
    const { searchParams } = new URL(request.url);
    const urlFilter = searchParams.get("url");

    if (!urlFilter) {
      return NextResponse.json({ found: false }, { status: 400 });
    }

    // Try to authenticate user, but allow unauthenticated access for extension
    const session = await auth();
    const userId = session?.user?.id;

    // Fetch the most recent scan for this URL (for any user if unauthenticated, or for the user if authenticated)
    const scan = await db.scan.findFirst({
      where: {
        url: urlFilter,
        ...(userId ? { userId } : {}), // If authenticated, filter by user; otherwise, get any recent scan
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!scan) {
      return NextResponse.json({ found: false }, { status: 200 });
    }

    // Transform for extension compatibility
    const transformedScan = {
      found: true,
      ...scan,
      trustScore:
        scan.status === "Safe"
          ? scan.safe_percentage ?? 85
          : scan.unsafe_percentage
          ? 100 - scan.unsafe_percentage
          : 25,
      colorCode:
        scan.status === "Safe"
          ? "green"
          : scan.status === "Unsafe"
          ? "red"
          : "yellow",
    };

    return NextResponse.json(transformedScan, { status: 200 });
  } catch (error) {
    console.error("Error fetching scan:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
