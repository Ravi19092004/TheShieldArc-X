// components/auth/social.tsx
"use client";

import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react"; // Client-side signIn

export const Social = () => {
    const onClick = (provider: "google" | "github") => {
        signIn(provider, { callbackUrl: "/terms" });
    };

    return (
        <div className="flex items-center w-full gap-x-2">
            <Button
                size="lg"
                className="w-32 flex items-center justify-center py-3 px-4 bg-transparent border border-neon/50 hover:bg-neon/10"
                variant="outline"
                onClick={() => onClick("google")}
            >
                {/* Using a simple G as a placeholder for the Google icon */}
                <span className="font-bold text-lg">G</span>
            </Button>
            <Button
                size="lg"
                className="w-32 flex items-center justify-center py-3 px-4 bg-transparent border border-neon/50 hover:bg-neon/10 text-gray-200"
                variant="outline"
                onClick={() => onClick("github")}
            >
                <Github className="h-6 w-6" />
            </Button>
        </div>
    );
};