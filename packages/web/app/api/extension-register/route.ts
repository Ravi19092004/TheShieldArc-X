import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { db } from "@/lib/db";
import { RegisterSchema } from "@/src/schemas";
import { getUserByEmail } from "@/data/user";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationCode } from "@/lib/mail";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, terms } = body;

    const validatedFields = RegisterSchema.safeParse({ email, password, name, terms });

    if (!validatedFields.success) {
      return NextResponse.json({ error: "Invalid fields" }, { status: 400 });
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        termsAccepted: terms,
      },
    });

    const verificationToken = await generateVerificationToken(email);
    await sendVerificationCode(verificationToken.email, verificationToken.token);

    return NextResponse.json({
      success: true,
      message: "Registration successful. Please check your email for verification.",
    });
  } catch (error) {
    console.error("Extension register error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
