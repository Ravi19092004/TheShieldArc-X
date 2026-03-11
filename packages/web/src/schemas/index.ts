// src/schemas/index.ts
import * as z from "zod";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;

export const LoginSchema = z.object({
    email: z.string().email({ message: "Email is required" }),
    password: z.string().min(1, { message: "Password is required" }),
});

export const RegisterSchema = z.object({
    email: z.string().email({ message: "Email is required" }),
    password: z.string().refine(
        (val) => passwordRegex.test(val),
        {
            message:
                "Password must be at least 12 characters and include uppercase and lowercase letters, numbers, and symbols,Not a word or phrase,Not a name, birthday, or pet's name.",
        }
    ),
    name: z.string().min(1, { message: "Name is required" }),
    terms: z.boolean().refine((val) => val === true, {
        message: "You must accept the terms and conditions",
    }),
});

export const SettingsSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    email: z.string().email({ message: "Email is required" }),
    password: z.string().refine(
        (val) => passwordRegex.test(val),
        {
            message:
                "Password must be at least 12 characters and include uppercase and lowercase letters, numbers, and symbols,Not a word or phrase,Not a name, birthday, or pet's name.",
        }
    ).optional().or(z.literal("")),
});