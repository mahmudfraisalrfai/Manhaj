import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ⚠️ يتجاوز أخطاء ESLint
  },
  typescript: {
    ignoreBuildErrors: true, // ⚠️ يتجاوز أخطاء TypeScript
  },
};

export default nextConfig;
