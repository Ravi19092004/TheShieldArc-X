import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";

export async function GET(request: Request) {
  try {
    // Check for Authorization header (for extension requests)
    const authHeader = request.headers.get('authorization');
    let userId: string | null = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Extension request with token - validate JWT
      const token = authHeader.substring(7);
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as jwt.JwtPayload;
        userId = decoded.userId;
        console.log('JWT validated for user:', userId);
      } catch (error) {
        console.error('JWT validation failed:', error);
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }
    } else {
      // Web request with session
      const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      userId = session.user.id;
      console.log('Session validated for user:', userId);
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's terms acceptance status
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, termsAccepted: true },
    });

    if (!user) {
      console.error('User not found in database:', userId);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      termsAccepted: user.termsAccepted,
    });
  } catch (error) {
    console.error("[ACCEPT_TERMS_GET]", error);
    return NextResponse.json(
      { error: "Failed to check terms status" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Check for Authorization header (for extension requests)
    const authHeader = request.headers.get('authorization');
    let userId: string | null = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Extension request with token - validate JWT
      const token = authHeader.substring(7);
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as jwt.JwtPayload;
        userId = decoded.userId;
        console.log('JWT validated for user:', userId);
      } catch (error) {
        console.error('JWT validation failed:', error);
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }
    } else {
      // Web request with session
      const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      userId = session.user.id;
      console.log('Session validated for user:', userId);
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // First check if user exists
    const existingUser = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, termsAccepted: true },
    });

    if (!existingUser) {
      console.error('User not found in database:', userId);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user's terms acceptance
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { termsAccepted: true },
      select: {
        id: true,
        email: true,
        name: true,
        termsAccepted: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("[ACCEPT_TERMS_POST]", error);
    return NextResponse.json(
      { error: "Failed to accept terms" },
      { status: 500 }
    );
  }
}
