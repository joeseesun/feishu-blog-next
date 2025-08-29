'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Post } from '@/types/post';
import Modal from '@/components/Modal';
import PostCard from '@/components/PostCard';
import { Heart, MessageCircle, Github, Search, ExternalLink, Copy, Check, ArrowLeft } from 'lucide-react';
import 'github-markdown-css/github-markdown-light.css';

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

interface PostContentProps {
  post: Post;
  config: SiteConfig;
}

export default function PostContent({ post, config }: PostContentProps) {
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [isWeChatModalOpen, setIsWeChatModalOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchRelatedPosts = async () => {
      try {
        const response = await fetch('/api/posts');
        if (!response.ok) return;
        
        const data = await response.json();
        setAllPosts(data.posts);
        
        // Find related posts based on keywords
        const related = data.posts
          .filter((p: Post) => p.id !== post.id)
          .filter((p: Post) => {
            // Posts with shared keywords
            return p.keywords.some(keyword => 
              post.keywords.includes(keyword)
            );
          })
          .slice(0, 4);
        
        // If not enough related posts, fill with recent posts
        if (related.length < 4) {
          const recentPosts = data.posts
            .filter((p: Post) => p.id !== post.id && !related.find(r => r.id === p.id))
            .slice(0, 4 - related.length);
          related.push(...recentPosts);
        }
        
        setRelatedPosts(related);
      } catch (error) {
        console.error('Error fetching related posts:', error);
      }
    };

    fetchRelatedPosts();
  }, [post]);

  // 格式化中文日期
  const getChineseDate = () => {
    try {
      const date = new Date(post.createdTime);
      if (isNaN(date.getTime())) {
        return '日期未知';
      }
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return '日期未知';
    }
  };
  
  const chineseDate = getChineseDate();

  const handleShare = async () => {
    const shareText = `${post.title} - ${window.location.origin}/posts/${post.slug}`;
    
    try {
      await navigator.clipboard.writeText(shareText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };
  
  const handleViewOriginal = () => {
    if (post.url) {
      window.open(post.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <img src={config?.site.logo || '/icon.png'} alt="Logo" className="w-8 h-8" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {config?.site.name || '博客'}
              </h1>
            </Link>
            
            {/* Back Button and Search Bar */}
            <div className="flex items-center gap-4 flex-1 max-w-md mx-8">
              <Link
                href="/"
                className="flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors p-2"
                title="返回文章列表"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              
              {config?.features.showSearch && (
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="搜索标题、内容、标签..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && searchQuery.trim()) {
                        window.location.href = `/?search=${encodeURIComponent(searchQuery)}`;
                      }
                    }}
                    className="w-full px-4 py-2 pl-10 pr-4 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              )}
            </div>
            
            {/* Social Icons */}
            <div className="flex items-center gap-4">
              {config?.features.showDonation && (
                <button
                  onClick={() => setIsDonationModalOpen(true)}
                  className="flex items-center gap-1 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 text-sm transition-colors"
                >
                  <Heart className="w-4 h-4" /> 打赏
                </button>
              )}
              {config?.features.showWechat && (
                <button
                  onClick={() => setIsWeChatModalOpen(true)}
                  className="flex items-center gap-1 text-gray-500 hover:text-green-500 dark:text-gray-400 dark:hover:text-green-400 text-sm transition-colors"
                >
                  <MessageCircle className="w-4 h-4" /> 公众号
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <article className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          {/* Article Screenshot */}
          {post.screenshot && (
            <div className="aspect-[21/9] overflow-hidden bg-gray-200 dark:bg-gray-700">
              <img
                src={post.screenshot}
                alt={post.title}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  console.error('Image failed to load:', post.screenshot);
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `
                      <div class="flex items-center justify-center h-full text-gray-500">
                        <div class="text-center">
                          <div class="text-4xl mb-2">🖼️</div>
                          <p class="text-sm">图片加载失败</p>
                        </div>
                      </div>
                    `;
                  }
                }}
                onLoad={() => console.log('Image loaded:', post.screenshot)}
              />
            </div>
          )}
          
          {/* Article Header */}
          <header className="p-8 pb-6 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4 leading-tight">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
              <time className="flex items-center gap-1">
                📅 {chineseDate}
              </time>
              
              <span className="flex items-center gap-1">
                📖 {post.readTime} 分钟阅读
              </span>
              
              {post.url && (
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  📎 查看原文
                </a>
              )}
            </div>

            {/* 关键词和质量评价 */}
            <div className="flex flex-wrap items-center gap-4">
              {post.keywords && post.keywords.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              )}
              
              {post.quality && (
                <span className="px-3 py-1 text-sm bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full">
                  ⭐ {post.quality}
                </span>
              )}
            </div>
          </header>

          {/* Article Content */}
          <div className="p-8">
            <div className="markdown-body bg-white dark:bg-gray-800" style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: 'inherit',
              fontFamily: '"LXGW WenKai", "LXGWWenKai", "霞鹜文楷", system-ui, -apple-system, sans-serif'
            }}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  // Custom component for external links
                  a: ({ href, children, ...props }) => (
                    <a
                      href={href}
                      target={href?.startsWith('http') ? '_blank' : undefined}
                      rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                      style={{ color: '#0969da', textDecoration: 'none' }}
                      {...props}
                    >
                      {children}
                    </a>
                  ),
                  // Custom component for images
                  img: ({ src, alt, ...props }) => (
                    <img
                      src={src}
                      alt={alt}
                      className="rounded-lg shadow-sm max-w-full"
                      loading="lazy"
                      {...props}
                    />
                  ),
                  // Custom styles for headings
                  h2: ({ children, ...props }) => (
                    <h2 style={{ 
                      color: '#1f2328',
                      borderBottom: '1px solid #d1d9e0',
                      paddingBottom: '8px',
                      marginBottom: '16px',
                      marginTop: '24px'
                    }} {...props}>
                      {children}
                    </h2>
                  ),
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>
          </div>

          {/* Article Footer */}
          <footer className="p-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <Link
                href="/"
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                ← 返回首页
              </Link>
              
              <div className="flex items-center gap-3">
                {post.url && (
                  <button
                    onClick={handleViewOriginal}
                    className="border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" /> 查看原文
                  </button>
                )}
                
                <button
                  onClick={handleShare}
                  className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 relative"
                >
                  {copySuccess ? (
                    <>
                      <Check className="w-4 h-4" /> 已复制
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" /> 分享文章
                    </>
                  )}
                </button>
              </div>
            </div>
          </footer>
        </article>
        
        {/* Related Articles */}
        {config?.features.showRelatedPosts && relatedPosts.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              相关文章
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedPosts.map((relatedPost) => (
                <PostCard key={relatedPost.id} post={relatedPost} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Link href="/" className="hover:opacity-80 transition-opacity">
                <img src={config?.site.logo || '/icon.png'} alt="Logo" className="w-6 h-6" />
              </Link>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                &copy; 2025{' '}
                <Link
                  href="/admin"
                  className="text-gray-600 hover:text-gray-700 transition-colors"
                >
                  {config?.site.author || '作者'}
                </Link>
              </p>
            </div>
            <div className="flex items-center gap-4">
              {config?.features.showDonation && (
                <button
                  onClick={() => setIsDonationModalOpen(true)}
                  className="flex items-center gap-1 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 text-sm transition-colors"
                >
                  <Heart className="w-4 h-4" /> 打赏
                </button>
              )}
              {config?.features.showWechat && (
                <button
                  onClick={() => setIsWeChatModalOpen(true)}
                  className="flex items-center gap-1 text-gray-500 hover:text-green-500 dark:text-gray-400 dark:hover:text-green-400 text-sm transition-colors"
                >
                  <MessageCircle className="w-4 h-4" /> 公众号
                </button>
              )}
              {config?.social.twitter && (
                <a
                  href={config.social.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm transition-colors"
                >
                  𝕏 {config.social.twitter.split('/').pop()}
                </a>
              )}
              {config?.social.github && (
                <a
                  href={config.social.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm transition-colors"
                >
                  <Github className="w-4 h-4" /> GitHub
                </a>
              )}
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <Modal
        isOpen={isDonationModalOpen}
        onClose={() => setIsDonationModalOpen(false)}
        title="打赏二维码"
      >
        <div className="text-center">
          <img
            src={config?.qrCodes.donation || 'https://newimg.t5t6.com/1751870053373-97dc7339-5191-4dde-b891-bf4fb4fe8118.png'}
            alt="打赏二维码"
            className="w-full max-w-xs mx-auto rounded-lg"
            loading="lazy"
          />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            感谢支持！
          </p>
        </div>
      </Modal>

      <Modal
        isOpen={isWeChatModalOpen}
        onClose={() => setIsWeChatModalOpen(false)}
        title="公众号二维码"
      >
        <div className="text-center">
          <img
            src={config?.qrCodes.wechat || 'https://newimg.t5t6.com/1751870053371-c2bf9308-2e52-4a15-81b4-6c7490b551cf.jpg'}
            alt="公众号二维码"
            className="w-full max-w-xs mx-auto rounded-lg"
            loading="lazy"
          />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            扫码关注公众号
          </p>
        </div>
      </Modal>
    </div>
  );
}