import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.feishu.cn',
      },
      {
        protocol: 'https',
        hostname: '*.feishu.com',
      },
      {
        protocol: 'http',
        hostname: '*.feishu.cn',
      },
      {
        protocol: 'http',
        hostname: '*.feishu.com',
      },
    ],
  },
};

export default nextConfig;
