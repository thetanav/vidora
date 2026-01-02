import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_R2_PUBLIC_URL: process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'https://pub-0d1c3c0b8f8f4d9b90c3c0b8f8f4d9b.r2.dev',
  },
};

export default nextConfig;
