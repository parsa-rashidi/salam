import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // The prototype is previewed through a proxy host (https://{port}-{sandbox}.e2b.app).
  // Allow any origin for the dev server so HMR / assets work behind the proxy.
  allowedDevOrigins: ["*"],
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
