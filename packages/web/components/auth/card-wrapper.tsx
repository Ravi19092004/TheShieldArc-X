"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Header } from "@/components/auth/header";
import { Social } from "@/components/auth/social";
import { BackButton } from "@/components/auth/back-button";

interface CardWrapperProps {
    children: React.ReactNode;
    headerLabel: string;
    backButtonLabel: string;
    backButtonHref: string;
    showSocial?: boolean;
}

export const CardWrapper = ({ children, headerLabel, backButtonLabel, backButtonHref, showSocial }: CardWrapperProps) => {
    return (
        <Card className="w-[400px] bg-black/80 text-gray-200 border border-neon/50 shadow-lg shadow-neon/20">
            <CardHeader>
                <Header label={headerLabel} />
            </CardHeader>
            <CardContent>{children}</CardContent>
            <CardFooter className="flex flex-col items-center"> 
                {showSocial && (
                    <div className="flex gap-2"> 
                        <Social />
                    </div>
                )}
                <div className="mt-2"> 
                    <BackButton label={backButtonLabel} href={backButtonHref} />
                </div>
            </CardFooter>
        </Card>
    );
}