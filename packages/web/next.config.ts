import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'osx-temperature-sensor': false,
    };
    return config;
  },
  serverExternalPackages: ['osx-temperature-sensor'],
};

export default nextConfig;
