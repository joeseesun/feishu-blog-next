'use client';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNow, format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { useEffect, useState } from 'react';
import { Post } from '@/types/post';

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export default function PostPage({ params }: PostPageProps) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const resolvedParams = await params;
        const response = await fetch('/api/posts');
        
        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }
        
        const data = await response.json();
        const foundPost = data.posts.find((p: Post) => p.slug === resolvedParams.slug);
        
        if (!foundPost) {
          setError('Post not found');
          return;
        }
        
        setPost(foundPost);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [params]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">正在加载文章...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    notFound();
  }

  // 安全地处理时间格式
  const getTimeInfo = () => {
    try {
      const date = new Date(post.createdTime);
      if (isNaN(date.getTime())) {
        return {
          relativeTime: '最近',
          readableDate: '未知日期'
        };
      }
      return {
        relativeTime: formatDistanceToNow(date, { addSuffix: true }),
        readableDate: format(date, 'yyyy年MM月dd日')
      };
    } catch {
      return {
        relativeTime: '最近',
        readableDate: '未知日期'
      };
    }
  };
  
  const { relativeTime, readableDate } = getTimeInfo();

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/posts/${post.slug}`;
    
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert('链接已复制到剪贴板');
      }).catch(() => {
        // 如果复制失败，显示链接
        prompt('复制以下链接:', shareUrl);
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            ‹ 返回文章列表
          </Link>
        </div>
      </nav>

      {/* Article */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <article className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          {/* Article Header */}
          <header className="p-8 pb-6 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4 leading-tight">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <time className="flex items-center gap-1">
                📅 {readableDate} ({relativeTime})
              </time>
              
              <span className="flex items-center gap-1">
                📖 {post.readTime} 分钟阅读
              </span>
              
              {post.url && (
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-500 hover:text-blue-600 transition-colors"
                >
                  📎 查看原文
                </a>
              )}
            </div>
          </header>

          {/* Article Content */}
          <div className="p-8">
            <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 dark:prose-strong:text-gray-100 prose-code:text-pink-600 dark:prose-code:text-pink-400 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800 prose-blockquote:border-l-blue-500 prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-300">
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
                      className="rounded-lg shadow-sm"
                      loading="lazy"
                      {...props}
                    />
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
              
              <button
                onClick={handleShare}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                🔗 分享文章
              </button>
            </div>
          </footer>
        </article>
      </main>
    </div>
  );
}