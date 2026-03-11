// src/actions/register.ts
"use server";

import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { RegisterSchema } from "../schemas";
import * as z from "zod";
import { getUserByEmail } from "@/data/user";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationCode } from "@/lib/mail"; 

export const register = async (values: z.infer<typeof RegisterSchema>) => {
    const validatedFields = RegisterSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Invalid fields!" };
    }

    const { email, password, name } = validatedFields.data;
    const hashedPassword = await bcrypt.hash(password, 12);

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
        return { error: "User already exists!" };
    }

    await db.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
        },
    });

    const verificationToken = await generateVerificationToken(email);
    await sendVerificationCode(verificationToken.email, verificationToken.token);

    return { success: "Confirmation email sent!" };
};