import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'open.feishu.cn',
        port: '',
        pathname: '/open-apis/drive/v1/medias/**',
      },
      {
        protocol: 'https',
        hostname: '*.feishu.cn',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.larkoffice.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
