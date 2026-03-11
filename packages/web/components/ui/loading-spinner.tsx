import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  className?: string;
  size?: number;
}

export function LoadingSpinner({ className, size = 50 }: LoadingSpinnerProps) {
  return (
    <div className={cn("flex items-center justify-center", className)} aria-label="Loading">
      <Loader2 className="animate-spin text-cyan-400 shadow-glow-cyan" size={size} />
    </div>
  );
}