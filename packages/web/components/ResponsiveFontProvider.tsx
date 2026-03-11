"use client";

import { useResponsiveFont } from "@/lib/useResponsiveFont";

export function ResponsiveFontProvider({ children }: { children: React.ReactNode }) {
  // Initialize the responsive font hook to set up the CSS custom property
  useResponsiveFont();

  return <>{children}</>;
}
