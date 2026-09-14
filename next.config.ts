import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "registry.localhost",
    "*.registry.localhost",
    "registry.local",
    "*.registry.local",
  ],
};

export default nextConfig;
