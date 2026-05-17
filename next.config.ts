import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@stella-ds/react"],
};

export default nextConfig;

if (
  process.env.NODE_ENV === "development"
  && process.env.ENABLE_CLOUDFLARE_NEXT_DEV === "1"
) {
  initOpenNextCloudflareForDev();
}
