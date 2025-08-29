import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import fs from 'fs';
import path from 'path';
import PostContent from './PostContent';

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  screenshot?: string;
  url?: string;
  keywords: string[];
  quality?: string;
  readTime: number;
  createdTime: string;
  status: number;
  isAd: boolean;
  description?: string;
  summary?: string;
  oneSentence?: string;
  unconventional?: string;
  xiaohongshu?: string;
  articleScan?: string;
}

interface SiteConfig {
  site: {
    name: string;
    description: string;
    author: string;
    logo: string;
    favicon: string;
    domain: string;
  };
  social: {
    twitter: string;
    github: string;
    email: string;
    weibo: string;
  };
  qrCodes: {
    donation: string;
    wechat: string;
  };
  features: {
    postsPerPage: number;
    showDonation: boolean;
    showWechat: boolean;
    showSearch: boolean;
    showRelatedPosts: boolean;
  };
  seo: {
    title: string;
    description: string;
    keywords: string;
  };
}

async function getConfig(): Promise<SiteConfig> {
  try {
    const configPath = path.join(process.cwd(), 'feishu-config.json');
    const configFile = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(configFile);
  } catch (error) {
    // Return default config if file doesn't exist
    return {
      site: {
        name: '博客',
        description: '基于飞书多维表格的动态博客系统',
        author: '作者',
        logo: '/icon.png',
        favicon: '/favicon.ico',
        domain: ''
      },
      social: {
        twitter: '',
        github: '',
        email: '',
        weibo: ''
      },
      qrCodes: {
        donation: '',
        wechat: ''
      },
      features: {
        postsPerPage: 20,
        showDonation: false,
        showWechat: false,
        showSearch: true,
        showRelatedPosts: true
      },
      seo: {
        title: '博客',
        description: '基于飞书多维表格的动态博客系统',
        keywords: '博客,飞书,多维表格,内容管理'
      }
    };
  }
}

async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    // This would normally be an API call, but since we're in a server component,
    // we need to make an internal fetch or read from the data source directly
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3002'}/api/posts`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch posts');
    }
    
    const data = await response.json();
    return data.posts.find((post: Post) => post.slug === slug) || null;
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const [post, config] = await Promise.all([
    getPostBySlug(resolvedParams.slug),
    getConfig()
  ]);

  if (!post) {
    return {
      title: '文章未找到',
      description: '抱歉，您查找的文章不存在或已被删除。'
    };
  }

  const siteName = config.site.name;
  const siteUrl = config.site.domain || 'http://localhost:3002';
  const postUrl = `${siteUrl}/posts/${post.slug}`;

  return {
    metadataBase: new URL(siteUrl),
    title: `${post.title} - ${siteName}`,
    description: post.excerpt,
    keywords: [...post.keywords, ...config.seo.keywords.split(',')].join(', '),
    authors: [{ name: config.site.author }],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: postUrl,
      siteName: siteName,
      type: 'article',
      images: post.screenshot ? [
        {
          url: post.screenshot,
          width: 1200,
          height: 630,
          alt: post.title,
        }
      ] : undefined,
      publishedTime: post.createdTime,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: post.screenshot ? [post.screenshot] : undefined,
      creator: config.social.twitter ? `@${config.social.twitter.split('/').pop()}` : undefined,
    },
    alternates: {
      canonical: postUrl,
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const resolvedParams = await params;
  const [post, config] = await Promise.all([
    getPostBySlug(resolvedParams.slug),
    getConfig()
  ]);

  if (!post) {
    notFound();
  }

  return <PostContent post={post} config={config} />;
}