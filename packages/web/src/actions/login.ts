// src/actions/login.ts
"use server";

import bcrypt from "bcryptjs";
import { LoginSchema } from "../schemas";
import * as z from "zod";
import { getUserByEmail } from "@/data/user";

export const login = async (values: z.infer<typeof LoginSchema>) => {
    const validatedFields = LoginSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Invalid fields!" };
    }

    const { email, password } = validatedFields.data;

    try {
        const user = await getUserByEmail(email);
        if (!user || !user.password) {
            return { error: "Invalid credentials!" };
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return { error: "Invalid credentials!" };
        }

        return {
            success: "Login successful!",
            termsAccepted: user.termsAccepted || false
        };
    } catch (error) {
        console.error("Login error:", error);
        // In case of a database error or other unexpected issues
        return { error: "Something went wrong!" };
    }
};
