// /app/api/save-scan/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";


interface ScanBody {
  url: string;
  redirectedUrl?: string;
  status: "Safe" | "Unsafe" | "Error";
  safe_percentage?: number | null;
  unsafe_percentage?: number | null;
  ip_address?: string;
  asn?: string;
  location?: string;
  country_code?: string | null;
}

export async function POST(request: Request) {
  try {
    // Try to authenticate user, but allow unauthenticated saves for extension
    const session = await auth();
    const userId = session?.user?.id;

    const body: ScanBody = await request.json();
    const { url, redirectedUrl, status, safe_percentage, unsafe_percentage, ip_address, asn, location, country_code } = body;

    if (!url || !status) {
      return new NextResponse("Missing required scan data", { status: 400 });
    }

    // If no user is authenticated, create a scan without userId (or use a default user if needed)
    // For now, we'll allow scans without userId for extension functionality
    const scanData: Prisma.ScanCreateInput = {
      url,
      redirectedUrl,
      status,
      safe_percentage: safe_percentage ?? 0,
      unsafe_percentage: unsafe_percentage ?? 0,
      ip_address,
      asn,
      location,
      country_code,
    };

    if (userId) {
      scanData.user = {
        connect: {
          id: userId
        }
      };
    }

    const newScan = await db.scan.create({
      data: scanData,
    });

    return NextResponse.json(newScan, { status: 201 });
  } catch (error) {
    console.error("Error saving scan:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
