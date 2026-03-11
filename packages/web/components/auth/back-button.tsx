"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface BackButtonProps {
    href: string;
    label: string;
}
export const BackButton = ({ href, label }: BackButtonProps) => {
    return (
        <Button variant="link" className="w-full font-normal text-neon/80 hover:text-neon" size="sm" asChild>
            <Link href= {href}>{label}</Link>
        </Button>
    );
};