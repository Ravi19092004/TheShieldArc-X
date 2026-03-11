import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Fetch real scan history from database
    const scanHistory = await db.scan.findMany({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(scanHistory, { status: 200 });
  } catch (error) {
    console.error("Error fetching scan history:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
