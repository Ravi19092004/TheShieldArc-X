import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  return (
    <SessionProvider session={session}>
      <div className="min-h-screen">
        <main className="p-6">
          {children}
        </main>
      </div>
    </SessionProvider>
  );
}
