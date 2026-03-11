import { NextResponse } from "next/server";
import { auth } from "@/auth";
import jwt from "jsonwebtoken";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ loggedIn: false });
    }

    // Generate a token for the extension
    const token = jwt.sign(
      {
        userId: session.user.id,
        email: session.user.email,
        name: session.user.name,
      },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "7d" }
    );

    return NextResponse.json({
      loggedIn: true,
      token,
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
      },
    });
  } catch (error) {
    console.error("Extension session check error:", error);
    return NextResponse.json({ loggedIn: false }, { status: 500 });
  }
}
