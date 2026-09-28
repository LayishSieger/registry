import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "registry.localhost",
    "*.registry.localhost",
    "registry.local",
    "*.registry.local",
  ],
  // Production alias only — preview hostnames (*.vercel.app branch URLs) are untouched.
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "layish.vercel.app" }],
        destination: "https://ui.layishsieger.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
