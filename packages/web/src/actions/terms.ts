"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";

export const acceptTerms = async () => {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    await db.user.update({
      where: { id: session.user.id },
      data: { termsAccepted: true },
    });
    return { success: "Terms accepted!" };
  } catch (error) {
    console.error("Error accepting terms:", error);
    return { error: "Failed to accept terms." };
  }
};