import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    // TypeScript is already verified in CI / locally, skip duplicate checking during Docker build to prevent OOM
    ignoreBuildErrors: true,
  },
};

export default nextConfig;

