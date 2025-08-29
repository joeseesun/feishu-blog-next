import { NextRequest, NextResponse } from 'next/server';

interface FeishuConfig {
  appId: string;
  appSecret: string;
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
    this.tokenExpiry = Date.now() + (data.expire - 60) * 1000;

    return this.accessToken;
  }

  async downloadFile(fileId: string): Promise<Response> {
    const accessToken = await this.getAccessToken();
    
    const response = await fetch(
      `https://open.feishu.cn/open-apis/drive/v1/medias/${fileId}/download`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }

    return response;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params;
    
    if (!fileId) {
      return NextResponse.json({ error: 'File ID is required' }, { status: 400 });
    }

    // Get configuration
    const config: FeishuConfig = {
      appId: process.env.FEISHU_APP_ID || '',
      appSecret: process.env.FEISHU_APP_SECRET || ''
    };

    if (!config.appId || !config.appSecret) {
      return NextResponse.json(
        { error: 'Missing Feishu configuration' },
        { status: 500 }
      );
    }

    const api = new FeishuAPI(config);
    const fileResponse = await api.downloadFile(fileId);

    // Get the image data
    const imageBuffer = await fileResponse.arrayBuffer();
    const contentType = fileResponse.headers.get('content-type') || 'image/jpeg';

    // Create response with proper headers
    const response = new NextResponse(imageBuffer);
    response.headers.set('Content-Type', contentType);
    response.headers.set('Cache-Control', 'public, max-age=86400, s-maxage=86400'); // Cache for 1 day
    response.headers.set('Content-Length', imageBuffer.byteLength.toString());

    return response;
  } catch (error) {
    console.error('Image proxy error:', error);
    
    // Return a placeholder or error image
    return NextResponse.json(
      { 
        error: 'Failed to load image', 
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}