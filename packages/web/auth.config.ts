import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import FusionAuth from "@auth/core/providers/fusionauth";

const DEMO_EMAIL = "demo@example.com";
const DEMO_PASSWORD = "password";

const providers = [
  Google({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  }),
  GitHub({
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
  }),
  Credentials({
    async authorize(credentials, request) {
      // Check if the provided credentials match the demo credentials
      if (
        credentials.email === DEMO_EMAIL &&
        credentials.password === DEMO_PASSWORD
      ) {
        // If they match, return a mock user object.
        // This object will be stored in the session.
        return { id: "1", name: "Demo User", email: DEMO_EMAIL, role: "USER" };
      }
      // If they don't match, return null to indicate failed authentication.
      return null;
    },
  }),
];

if (process.env.FUSIONAUTH_ISSUER) {
  providers.push(
    FusionAuth({
      clientId: process.env.FUSIONAUTH_CLIENT_ID,
      clientSecret: process.env.FUSIONAUTH_CLIENT_SECRET,
      issuer: process.env.FUSIONAUTH_ISSUER,
      tenantId: process.env.FUSIONAUTH_TENANT_ID,
    })
  );
}

export default {
  providers,
} satisfies NextAuthConfig;
