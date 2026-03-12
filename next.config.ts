import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${process.env.BACKEND_API_URL || "http://localhost:8080"}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
