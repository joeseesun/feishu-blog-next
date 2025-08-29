import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import fs from 'fs';
import path from 'path';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 动态获取配置生成metadata
function getMetadata(): Metadata {
  try {
    const configFile = path.join(process.cwd(), 'feishu-config.json');
    if (fs.existsSync(configFile)) {
      const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
      return {
        title: config.seo?.title || '博客',
        description: config.seo?.description || '基于飞书多维表格的动态博客系统',
        keywords: config.seo?.keywords || '博客,飞书,多维表格,内容管理',
        authors: [{ name: config.site?.author || '作者' }],
        icons: {
          icon: config.site?.favicon || '/favicon.ico'
        },
        openGraph: {
          title: config.seo?.title || '博客',
          description: config.seo?.description || '基于飞书多维表格的动态博客系统',
          url: config.site?.domain || '',
          siteName: config.site?.name || '博客',
          images: [{
            url: config.site?.logo || '/icon.png',
            width: 512,
            height: 512,
            alt: config.site?.name || '博客'
          }],
          locale: 'zh_CN',
          type: 'website'
        },
        twitter: {
          card: 'summary_large_image',
          title: config.seo?.title || '博客',
          description: config.seo?.description || '基于飞书多维表格的动态博客系统',
          images: [config.site?.logo || '/icon.png']
        }
      };
    }
  } catch (error) {
    console.error('Failed to load config for metadata:', error);
  }
  
  // 默认配置
  return {
    title: "乔木飞书收藏",
    description: "基于飞书多维表格的动态博客系统",
  };
}

export const metadata: Metadata = getMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=LXGW+WenKai:wght@300;400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
