"use client";

import { Button } from "@/components/ui/button";
import { LoginButton } from "@/components/auth/login-button";
import Image from "next/image";

export const MainHeader = () => {
  return (
    <header className="border-b border-primary/20 bg-black/30 backdrop-blur-sm sticky top-0 z-50">
      <div className="flex h-12 sm:h-16 items-center justify-between px-[clamp(0.5rem, 2vw, 1.5rem)]">
        <div className="flex items-center gap-[clamp(0.5rem, 1vw, 1rem)]">
          <Image
            src="/avatars/DataShield.Ai-removebg-preview.png"
            alt="DataShield Logo"
            width={200}
            height={50}
            className="h-[clamp(30px, 5vw, 60px)] w-auto object-contain transition-all duration-300 ease-in-out"
          />
          <p className="text-[clamp(0.8rem, 1vw + 0.5rem, 1.25rem)] text-muted-foreground hidden sm:block">
            Your Guardian Against Digital Threats
          </p>
        </div>

        <div className="flex items-center gap-[clamp(0.5rem, 1vw, 2rem)]">
          <LoginButton>
            <Button
              variant="neon"
              size="lg"
              className="h-[clamp(2rem, 2.5vw, 2.5rem)] px-[clamp(0.75rem, 2vw, 2rem)] text-[clamp(0.8rem, 1vw + 0.5rem, 1.25rem)] cyber-button transition-all duration-300 ease-in-out"
            >
              Login / Signup
            </Button>
          </LoginButton>
        </div>
      </div>
    </header>
  );
};
