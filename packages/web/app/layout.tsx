import type { Metadata } from "next";
import { Geist, Geist_Mono, Orbitron } from "next/font/google";
import { AuthProvider } from "@/components/auth/auth-provider";
import { ChatbotProvider } from "@/components/ChatbotProvider";
import { VoiceCommandInterface } from "@/components/VoiceCommandInterface";
import "./globals.css";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "700", "900"], // Weights used on the page
});

export const metadata: Metadata = {
  title: "DataShield.AI",
  description: "Browse Safely with AI Protection",
  icons: {
    icon: "/avatars/ShieldLogo.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true} data-qb-installed="true">
      {/* The background image has been moved to globals.css for better performance and separation of concerns. */}
      <body className={`${geistSans.variable} ${geistMono.variable} ${orbitron.variable} font-sans antialiased bg-cyber`}>
        <AuthProvider>
          {children}
          <ChatbotProvider />
          <VoiceCommandInterface />
        </AuthProvider>
      </body>
    </html>
  );
}
// removed accidental local `dynamic` stub that shadowed the `next/dynamic` import
