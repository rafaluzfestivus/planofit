import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {},
  // Allows the app to work offline as a PWA
  // Service worker is manually registered via public/sw.js
  headers: async () => [
    {
      source: "/sw.js",
      headers: [
        { key: "Service-Worker-Allowed", value: "/" },
        { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
      ],
    },
  ],
};

export default nextConfig;
