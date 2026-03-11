"use server";

import { db } from "@/lib/db";
import { signIn } from "@/auth";
import { sendTwoFactorCode } from "@/lib/mail";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";

export const verifyTwoFactor = async (code: string, userId?: string): Promise<{ error?: string }> => {
    if (!userId) {
        return { error: "Unauthorized" };
    }

    const existingConfirmation = await db.twoFactorConfirmation.findUnique({
        where: { userId },
    });

    if (!existingConfirmation || !existingConfirmation.code) {
        return { error: "No 2FA code found" };
    }

    if (existingConfirmation.code !== code) {
        return { error: "Invalid code" };
    }

    if (existingConfirmation.expiresAt && new Date() > existingConfirmation.expiresAt) {
        return { error: "Code expired" };
    }

    // Delete the confirmation
    await db.twoFactorConfirmation.delete({
        where: { userId },
    });

    // Sign in the user
    await signIn("credentials", {
        userId,
        from2FA: "true",
        redirectTo: DEFAULT_LOGIN_REDIRECT,
    });
    return { error: "Unexpected error occurred" };
};

export const resendTwoFactor = async (userId?: string) => {
    if (!userId) {
        return { error: "Unauthorized" };
    }

    const user = await db.user.findUnique({
        where: { id: userId },
    });

    if (!user || !user.email) {
        return { error: "User not found" };
    }

    // Generate new code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await db.twoFactorConfirmation.upsert({
        where: { userId },
        update: { code, expiresAt },
        create: { userId, code, expiresAt },
    });

    // Send email
    await sendTwoFactorCode(user.email, code);

    return { success: "Code sent to your email" };
};
