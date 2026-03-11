// auth.ts
import NextAuth from "next-auth"; // Session from next-auth
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import authConfig from "./auth.config";
import { getUserById } from "./data/user";
import { UserRole } from "@prisma/client"; // Import User and UserRole

export const {
    handlers: { GET, POST },
    auth,
    signIn,
    signOut,
} = NextAuth({
    pages: {
        signIn: "/auth/login",
        error: "/auth/error",
    },
    events: {
        async linkAccount({ user }) {
            await db.user.update({
                where: { id: user.id },
                data: {
                    emailVerified: new Date(),
                },
            });
        },
    },
    callbacks: {
        async signIn({ user, account }) {
            // Allow OAuth providers to sign in without email verification.
            // The adapter will create the user.
            if (account?.provider !== "credentials") return true;
 
            // For the "credentials" provider, we need to check the user manually.
            const existingUser = await getUserById(user.id!);
 
            // Prevent sign in if user does not exist or email is not verified for credentials provider
            if (!existingUser || !existingUser.emailVerified) {
                return false;
            }
 
            // Check for terms acceptance for ALL providers
            if (!existingUser.termsAccepted) {
                return "/terms";
            }
 
            // Check for 2FA
            if (existingUser.twoFactorEnabled) {
                // TODO: Implement 2FA token logic
                return "/auth/two-factor";
            }

            // TODO: Update lastLoginIp and lastLoginDevice

            // All checks pass
            return true;
        },
        async session({ token, session }) {
            if (token.sub && session.user) {
                session.user.id = token.sub;
            }
            if (token.role && session.user) {
                session.user.role = token.role as UserRole;
            }
            if (token.twoFactorEnabled !== undefined && session.user) {
                session.user.twoFactorEnabled = token.twoFactorEnabled as boolean | undefined;
            }
            if (token.termsAccepted !== undefined && session.user) {
                session.user.termsAccepted = token.termsAccepted as boolean | undefined;
            }
            if (token.lastLoginIp !== undefined && session.user) {
                session.user.lastLoginIp = token.lastLoginIp as string | null;
            }
            if (token.lastLoginDevice !== undefined && session.user) {
                session.user.lastLoginDevice = token.lastLoginDevice as string | null;
            }
            return session;
        },
        async jwt({ token }) {
            if (token.sub) {
                const existingUser = await getUserById(token.sub);
                if (existingUser) {
                    token.role = existingUser.role as UserRole;
                    token.twoFactorEnabled = existingUser.twoFactorEnabled;
                    token.termsAccepted = existingUser.termsAccepted;
                    token.lastLoginIp = existingUser.lastLoginIp;
                    token.lastLoginDevice = existingUser.lastLoginDevice as string | null;
                }
            }
            return token;
        },
    },
    adapter: PrismaAdapter(db),
    session: { strategy: "jwt" },
    ...authConfig,
});