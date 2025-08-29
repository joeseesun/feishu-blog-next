import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const CONFIG_FILE = path.join(process.cwd(), 'feishu-config.json');

interface SiteConfig {
  // 飞书配置
  feishu: {
    appId: string;
    appSecret: string;
    appToken: string;
    tableId: string;
  };
  // 网站基本信息
  site: {
    name: string;
    description: string;
    author: string;
    logo: string;
    favicon: string;
    domain: string;
  };
  // 社交媒体
  social: {
    twitter: string;
    github: string;
    email: string;
    weibo: string;
  };
  // 二维码图片
  qrCodes: {
    donation: string;
    wechat: string;
  };
  // 功能配置
  features: {
    postsPerPage: number;
    showDonation: boolean;
    showWechat: boolean;
    showSearch: boolean;
    showRelatedPosts: boolean;
  };
  // SEO配置
  seo: {
    title: string;
    description: string;
    keywords: string;
  };
}

// Default configuration
const DEFAULT_CONFIG: SiteConfig = {
  feishu: {
    appId: process.env.FEISHU_APP_ID || '',
    appSecret: process.env.FEISHU_APP_SECRET || '',
    appToken: process.env.FEISHU_APP_TOKEN || '',
    tableId: process.env.FEISHU_TABLE_ID || ''
  },
  site: {
    name: '乔木飞书收藏',
    description: '基于飞书多维表格的动态博客系统',
    author: '向阳乔木',
    logo: '/icon.png',
    favicon: '/favicon.ico',
    domain: ''
  },
  social: {
    twitter: 'https://x.com/vista8',
    github: 'https://github.com/joeseesun/',
    email: '',
    weibo: ''
  },
  qrCodes: {
    donation: 'https://newimg.t5t6.com/1751870053373-97dc7339-5191-4dde-b891-bf4fb4fe8118.png',
    wechat: 'https://newimg.t5t6.com/1751870053371-c2bf9308-2e52-4a15-81b4-6c7490b551cf.jpg'
  },
  features: {
    postsPerPage: 20,
    showDonation: true,
    showWechat: true,
    showSearch: true,
    showRelatedPosts: true
  },
  seo: {
    title: '乔木飞书收藏',
    description: '基于飞书多维表格的动态博客系统',
    keywords: '博客,飞书,多维表格,内容管理'
  }
};

function readConfig(): SiteConfig {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, 'utf8');
      const config = JSON.parse(data);
      // Deep merge with default config
      return {
        feishu: { ...DEFAULT_CONFIG.feishu, ...config.feishu },
        site: { ...DEFAULT_CONFIG.site, ...config.site },
        social: { ...DEFAULT_CONFIG.social, ...config.social },
        qrCodes: { ...DEFAULT_CONFIG.qrCodes, ...config.qrCodes },
        features: { ...DEFAULT_CONFIG.features, ...config.features },
        seo: { ...DEFAULT_CONFIG.seo, ...config.seo }
      };
    }
  } catch (error) {
    console.error('Error reading config file:', error);
  }
  return DEFAULT_CONFIG;
}

export async function GET() {
  try {
    const config = readConfig();
    // 不返回敏感信息给前端
    const publicConfig = {
      site: config.site,
      social: config.social,
      qrCodes: config.qrCodes,
      features: config.features,
      seo: config.seo
    };
    
    return NextResponse.json(publicConfig);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to read configuration' },
      { status: 500 }
    );
  }
}