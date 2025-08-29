'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import PostCard from '@/components/PostCard';
import Modal from '@/components/Modal';
import { Post } from '@/types/post';
import { Heart, MessageCircle, Github, Search } from 'lucide-react';

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

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [isWeChatModalOpen, setIsWeChatModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const postsPerPage = config?.features.postsPerPage || 20;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch config and posts in parallel
        const [configResponse, postsResponse] = await Promise.all([
          fetch('/api/config'),
          fetch('/api/posts')
        ]);
        
        if (!configResponse.ok) {
          console.error('Failed to load config, using defaults');
        } else {
          const configData = await configResponse.json();
          setConfig(configData);
        }
        
        if (!postsResponse.ok) {
          const errorData = await postsResponse.json();
          throw new Error(errorData.message || 'Failed to fetch posts');
        }
        
        const postsData = await postsResponse.json();
        setPosts(postsData.posts);
        setFilteredPosts(postsData.posts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Initialize search from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, []);

  // Search functionality
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPosts(posts);
      setCurrentPage(1);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = posts.filter((post) => {
      // Search in title
      if (post.title.toLowerCase().includes(query)) return true;
      
      // Search in excerpt (summary)
      if (post.excerpt.toLowerCase().includes(query)) return true;
      
      // Search in content
      if (post.content.toLowerCase().includes(query)) return true;
      
      // Search in keywords
      if (post.keywords.some(keyword => keyword.toLowerCase().includes(query))) return true;
      
      // Search in quality
      if (post.quality && post.quality.toLowerCase().includes(query)) return true;
      
      return false;
    });
    
    setFilteredPosts(filtered);
    setCurrentPage(1);
  }, [searchQuery, posts]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            配置错误
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded-lg transition-colors"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <Image src={config?.site.logo || '/icon.png'} alt="Logo" width={32} height={32} className="w-8 h-8" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {config?.site.name || '博客'}
              </h1>
            </Link>
            
            {/* Search Bar */}
            {config?.features.showSearch && (
              <div className="flex-1 max-w-md mx-8">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="搜索标题、内容、标签..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 pl-10 pr-4 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>
            )}
            
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
      <main className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-gray-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">正在加载博客文章...</p>
            </div>
          </div>
        ) : filteredPosts.length === 0 && posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              暂无文章
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              你的飞书表格中还没有内容，使用收集插件添加一些内容吧！
            </p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              未找到相关文章
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              尝试其他关键词或者清空搜索框查看所有文章
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(() => {
                const startIndex = (currentPage - 1) * postsPerPage;
                const endIndex = startIndex + postsPerPage;
                return filteredPosts.slice(startIndex, endIndex).map((post) => (
                  <PostCard key={post.id} post={post} searchQuery={searchQuery} />
                ));
              })()}
            </div>
            
            {/* Pagination */}
            {filteredPosts.length > postsPerPage && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  上一页
                </button>
                
                <div className="flex items-center gap-2">
                  {(() => {
                    const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
                    const pages = [];
                    for (let i = 1; i <= totalPages; i++) {
                      if (i === currentPage) {
                        pages.push(
                          <button
                            key={i}
                            className="w-8 h-8 text-sm bg-gray-800 text-white rounded-lg"
                          >
                            {i}
                          </button>
                        );
                      } else {
                        pages.push(
                          <button
                            key={i}
                            onClick={() => setCurrentPage(i)}
                            className="w-8 h-8 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            {i}
                          </button>
                        );
                      }
                    }
                    return pages;
                  })()}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredPosts.length / postsPerPage)))}
                  disabled={currentPage === Math.ceil(filteredPosts.length / postsPerPage)}
                  className="px-4 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  下一页
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Link href="/" className="hover:opacity-80 transition-opacity">
                <Image src={config?.site.logo || '/icon.png'} alt="Logo" width={24} height={24} className="w-6 h-6" />
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
