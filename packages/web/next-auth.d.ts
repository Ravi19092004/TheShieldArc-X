import type { UserRole } from "@prisma/client";
import "next-auth";

declare module "next-auth" {
  /**
   * Returned by `auth`, `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    access_token: string;
    expires_in: number;
    id_token?: string;
    expires_at: number;
    refresh_token?: string;
    refresh_token_id?: string;
    error?: "RefreshTokenError";
    scope: string;
    token_type: string;
    userId: string;
    provider: string;
    type: string;
    providerAccountId: string;
    user: {
      role: UserRole;
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole;
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `auth`, when using JWT sessions */
  interface JWT {
    role?: UserRole;
  }
}

declare module "@auth/core/adapters" {
  interface AdapterUser {
    role: UserRole;
  }
}
