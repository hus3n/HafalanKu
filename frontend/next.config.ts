import type { NextConfig } from "next";

const isVercel = Boolean(process.env.VERCEL);

const nextConfig: NextConfig = {
  transpilePackages: ["shared"],
  // Vercel uses its native serverless output; Docker/Coolify uses standalone output
  ...(isVercel ? {} : { output: "standalone" }),
  // Prevent OOM issues during container build on VPS
  experimental: {
    cpus: 1,
    workerThreads: false,
  },
};

export default nextConfig;
