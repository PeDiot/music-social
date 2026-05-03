import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Deezer uses several CDN subdomains: cdn-images, cdns-images, e-cdns-images, etc.
      { protocol: "https", hostname: "**.dzcdn.net" },
      { protocol: "https", hostname: "api.deezer.com" },
    ],
  },
};

export default nextConfig;
