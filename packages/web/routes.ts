// routes.ts
export const DEFAULT_LOGIN_REDIRECT = "/terms"; // Changed to /terms for terms acceptance flow
export const apiAuthPrefix = "/api/auth";
export const authRoutes = ["/auth/login", "/auth/register","/auth/error"];
export const publicRoutes = [ "/", "/auth/new-verification", "/terms-and-conditions"];

export const apiScanHistoryPrefix = "/api/scan-history";