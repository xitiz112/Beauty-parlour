import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets a production build run alongside `next dev` without sharing .next (e.g. NEXT_DIST_DIR=.next-verify).
  distDir: process.env.NEXT_DIST_DIR || ".next",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
    ],
  },
};

export default nextConfig;
