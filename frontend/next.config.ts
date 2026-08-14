import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Prevent OOM issues during container build on VPS
  experimental: {
    cpus: 1,
    workerThreads: false,
  },
};

export default nextConfig;
