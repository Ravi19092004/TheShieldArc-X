import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const userId = session.user.id;

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { lastLoginIp: true, lastLoginDevice: true },
    });

    const totalScans = await db.scan.count({
      where: { userId },
    });

    const safeScans = await db.scan.count({
      where: { userId, status: "Safe" },
    });

    const unsafeScans = await db.scan.count({
      where: { userId, status: "Unsafe" },
    });

    const successRate = totalScans > 0 ? (safeScans / totalScans) * 100 : 0;

    // Simulate real-time data for threat monitoring, firewall status, and network traffic
    const threatMonitoringStatus = Math.random() > 0.1 ? "ACTIVE" : "INACTIVE";
    const firewallStatus = Math.random() > 0.05 ? "SECURED" : "WARNING";
    const networkTraffic = `${(Math.random() * 5).toFixed(1)}GB`; // Random value between 0.0GB and 5.0GB

    return NextResponse.json({
      totalScans,
      safeScans,
      unsafeScans,
      successRate,
      lastLoginIp: user?.lastLoginIp || null,
      lastLoginDevice: user?.lastLoginDevice || null,
      threatMonitoringStatus,
      firewallStatus,
      networkTraffic,
    });
  } catch (error) {
    console.error("[DASHBOARD_STATS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
