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
      },
      {
        protocol: 'https',
        hostname: 'newimg.t5t6.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.githubusercontent.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
  eslint: {
    // 在生产构建时忽略 ESLint 错误
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
