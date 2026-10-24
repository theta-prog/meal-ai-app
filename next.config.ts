import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep the TypeScript 5 compiler API for build checks and config loading.
  experimental: { useTypeScriptCli: false },
  transpilePackages: ["@stella-ds/react"],
};

export default nextConfig;

if (
  process.env.NODE_ENV === "development"
  && process.env.ENABLE_CLOUDFLARE_NEXT_DEV === "1"
) {
  initOpenNextCloudflareForDev();
}
