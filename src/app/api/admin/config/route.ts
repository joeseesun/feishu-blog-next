import { NextRequest, NextResponse } from 'next/server';
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

function writeConfig(config: SiteConfig): void {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
  } catch (error) {
    console.error('Error writing config file:', error);
    throw new Error('Failed to save configuration');
  }
}

export async function GET() {
  try {
    const config = readConfig();
    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to read configuration' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Allow saving even if feishu fields are empty (for initial setup)
    const { feishu } = body;

    // Sanitize and create config object
    const config: SiteConfig = {
      feishu: {
        appId: feishu?.appId?.trim() || '',
        appSecret: feishu?.appSecret?.trim() || '',
        appToken: feishu?.appToken?.trim() || '',
        tableId: feishu?.tableId?.trim() || ''
      },
      site: {
        name: body.site?.name?.trim() || DEFAULT_CONFIG.site.name,
        description: body.site?.description?.trim() || DEFAULT_CONFIG.site.description,
        author: body.site?.author?.trim() || DEFAULT_CONFIG.site.author,
        logo: body.site?.logo?.trim() || DEFAULT_CONFIG.site.logo,
        favicon: body.site?.favicon?.trim() || DEFAULT_CONFIG.site.favicon,
        domain: body.site?.domain?.trim() || DEFAULT_CONFIG.site.domain
      },
      social: {
        twitter: body.social?.twitter?.trim() || DEFAULT_CONFIG.social.twitter,
        github: body.social?.github?.trim() || DEFAULT_CONFIG.social.github,
        email: body.social?.email?.trim() || DEFAULT_CONFIG.social.email,
        weibo: body.social?.weibo?.trim() || DEFAULT_CONFIG.social.weibo
      },
      qrCodes: {
        donation: body.qrCodes?.donation?.trim() || DEFAULT_CONFIG.qrCodes.donation,
        wechat: body.qrCodes?.wechat?.trim() || DEFAULT_CONFIG.qrCodes.wechat
      },
      features: {
        postsPerPage: body.features?.postsPerPage || DEFAULT_CONFIG.features.postsPerPage,
        showDonation: body.features?.showDonation !== undefined ? body.features.showDonation : DEFAULT_CONFIG.features.showDonation,
        showWechat: body.features?.showWechat !== undefined ? body.features.showWechat : DEFAULT_CONFIG.features.showWechat,
        showSearch: body.features?.showSearch !== undefined ? body.features.showSearch : DEFAULT_CONFIG.features.showSearch,
        showRelatedPosts: body.features?.showRelatedPosts !== undefined ? body.features.showRelatedPosts : DEFAULT_CONFIG.features.showRelatedPosts
      },
      seo: {
        title: body.seo?.title?.trim() || DEFAULT_CONFIG.seo.title,
        description: body.seo?.description?.trim() || DEFAULT_CONFIG.seo.description,
        keywords: body.seo?.keywords?.trim() || DEFAULT_CONFIG.seo.keywords
      }
    };

    writeConfig(config);
    
    return NextResponse.json({ message: 'Configuration saved successfully' });
  } catch (error) {
    console.error('Error saving configuration:', error);
    return NextResponse.json(
      { error: 'Failed to save configuration' },
      { status: 500 }
    );
  }
}