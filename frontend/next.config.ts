import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/**',
      },
    ],
  },
  // Allow network IP for HMR
  allowedDevOrigins: ['192.168.0.103'],
};

export default nextConfig;
