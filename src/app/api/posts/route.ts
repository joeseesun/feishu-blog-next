import { NextRequest, NextResponse } from 'next/server';

interface FeishuConfig {
  appId: string;
  appSecret: string;
  appToken: string;
  tableId: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  url?: string;
  screenshot?: string;
  createdTime: string;
  slug: string;
  readTime: number;
}

class FeishuAPI {
  private config: FeishuConfig;
  private accessToken: string = '';
  private tokenExpiry: number = 0;

  constructor(config: FeishuConfig) {
    this.config = config;
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const response = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        app_id: this.config.appId,
        app_secret: this.config.appSecret
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to get access token: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.code !== 0) {
      throw new Error(`Feishu API error: ${data.msg}`);
    }

    this.accessToken = data.tenant_access_token;
    this.tokenExpiry = Date.now() + (data.expire - 60) * 1000; // Refresh 1 minute early

    return this.accessToken;
  }

  async fetchPosts(): Promise<{ posts: Post[]; total: number }> {
    const accessToken = await this.getAccessToken();
    
    const response = await fetch(
      `https://open.feishu.cn/open-apis/bitable/v1/apps/${this.config.appToken}/tables/${this.config.tableId}/records?page_size=100`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.code !== 0) {
      throw new Error(`Feishu API error: ${data.msg}`);
    }

    const posts: Post[] = data.data.items
      .filter((item: any) => {
        // 基本字段检查
        if (!item.fields?.Title || !item.fields?.Content) return false;
        
        // 状态过滤：只显示已发布的内容（状态为1）
        const status = item.fields['状态'] || 1;
        if (status !== 1) return false;
        
        // 广告过滤：不显示广告内容
        const isAd = item.fields['是广告吗'] || '';
        if (isAd === '是' || isAd === 'yes') return false;
        
        return true;
      })
      .map((item: any) => {
        const title = item.fields['新标题'] || item.fields.Title;
        const content = item.fields.Content || '';
        const url = item.fields.URL || '';
        
        // 处理截图附件，提取文件ID并生成代理URL
        let screenshot = '';
        if (item.fields.Screenshot?.[0]?.url) {
          const originalUrl = item.fields.Screenshot[0].url;
          // 从飞书URL中提取文件ID: /open-apis/drive/v1/medias/{fileId}/download
          const match = originalUrl.match(/\/medias\/([^\/]+)\/download/);
          if (match) {
            const fileId = match[1];
            screenshot = `/api/image/${fileId}`;
          } else {
            screenshot = originalUrl; // 如果无法提取ID，使用原URL作为备用
          }
        }
        
        const status = item.fields['状态'] || 1; // 默认为已发布
        const description = item.fields.Description || '';
        const summary = item.fields['摘要总结'] || '';
        const oneSentence = item.fields['一句话总结'] || '';
        const keywords = item.fields['关键词'] || '';
        const readingTime = item.fields['阅读时长'] || '';
        const isAd = item.fields['是广告吗'] || '';
        const quality = item.fields['质量判断'] || '';
        const collectDate = item.fields['收藏日期'] || '';
        
        // 优先使用AI生成的摘要，然后是描述，最后从内容生成
        let excerpt = '';
        if (oneSentence) {
          excerpt = oneSentence;
        } else if (summary) {
          excerpt = summary.length > 200 ? summary.slice(0, 200) + '...' : summary;
        } else if (description) {
          excerpt = description.length > 200 ? description.slice(0, 200) + '...' : description;
        } else {
          const plainText = content.replace(/[#*`\[\]()]/g, '').replace(/\s+/g, ' ').trim();
          excerpt = plainText.length > 200 ? plainText.slice(0, 200) + '...' : plainText;
        }
        
        // Generate slug
        const slug = title
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '');
        
        // 优先使用AI预估的阅读时长，否则计算
        let readTime = 1;
        if (readingTime) {
          const match = readingTime.match(/(\d+)/);
          readTime = match ? parseInt(match[1]) : 1;
        } else {
          const plainText = content.replace(/[#*`\[\]()]/g, '').replace(/\s+/g, ' ').trim();
          const words = plainText.split(' ').length;
          readTime = Math.max(1, Math.ceil(words / 200));
        }

        return {
          id: item.record_id,
          title,
          content,
          excerpt,
          url,
          screenshot,
          createdTime: collectDate || item.created_time || new Date().toISOString(),
          slug: slug || item.record_id,
          readTime,
          // 新增字段
          status,
          keywords: keywords ? keywords.split(',').map((k: string) => k.trim()) : [],
          isAd: isAd === '是' || isAd === 'yes',
          quality,
          description,
          summary,
          oneSentence
        };
      })
      .sort((a: Post, b: Post) => new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime());

    return {
      posts,
      total: posts.length
    };
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get configuration from environment variables
    const config: FeishuConfig = {
      appId: process.env.FEISHU_APP_ID || '',
      appSecret: process.env.FEISHU_APP_SECRET || '',
      appToken: process.env.FEISHU_APP_TOKEN || '',
      tableId: process.env.FEISHU_TABLE_ID || ''
    };

    // Validate configuration
    const requiredFields = Object.entries(config);
    const missingFields = requiredFields.filter(([_, value]) => !value).map(([key]) => key);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          error: 'Missing configuration', 
          missingFields,
          message: 'Please set the required environment variables in your Vercel dashboard or .env.local file'
        },
        { status: 500 }
      );
    }

    const api = new FeishuAPI(config);
    const result = await api.fetchPosts();

    // Add cache headers
    const response = NextResponse.json(result);
    response.headers.set('Cache-Control', 's-maxage=300, stale-while-revalidate');
    
    return response;
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch posts', 
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}