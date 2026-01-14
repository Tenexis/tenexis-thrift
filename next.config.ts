import type { NextConfig } from "next";

// Enable calling `getCloudflareContext()` in `next dev`.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // 1. Google Images (for User Profiles)
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
      },
      // 2. Your API / DevTunnels (for Product Images)
      {
        protocol: "https",
        hostname: "**.devtunnels.ms", // Matches any devtunnel subdomain
      },
      // 3. Localhost (if you run backend locally without tunnel)
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
      }
    ],
  },

  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "thrift.tenexis.in",
        "tenexis-thrift.tenexis.workers.dev",
        "hdtr68dq-3000.inc1.devtunnels.ms",
      ],
    },
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
    ];
  },
};

export default nextConfig;