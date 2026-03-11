"use server";

import * as z from "zod";
import { db } from "@/lib/db";
import { SettingsSchema } from "@/src/schemas";
import { auth } from "@/auth";
import { getUserById } from "@/data/user";

import bcrypt from "bcryptjs";

export const updateSettings = async (values: z.infer<typeof SettingsSchema>) => {
    const session = await auth();
    if (!session?.user) {
        return { error: "Not authenticated" };
    }

    const user = await getUserById(session.user.id);
    if (!user) {
        return { error: "User not found" };
    }

    const validatedFields = SettingsSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Invalid fields!" };
    }

    const { name, email, password } = validatedFields.data;

    if (email && email !== user.email) {
        const existingUser = await db.user.findUnique({
            where: { email },
        });

        if (existingUser && existingUser.id !== user.id) {
            return { error: "Email already in use!" };
        }
    }

    const updateData: { name?: string; email?: string; password?: string } = {};

    if (name) {
        updateData.name = name;
    }
    if (email) {
        updateData.email = email;
    }
    if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        updateData.password = hashedPassword;
    }

    await db.user.update({
        where: { id: user.id },
        data: updateData,
    });

    return { success: "Settings updated!" };
};