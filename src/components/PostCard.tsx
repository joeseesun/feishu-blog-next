import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Post } from '@/types/post';
import HighlightedText from './HighlightedText';

interface PostCardProps {
  post: Post;
  searchQuery?: string;
}

export default function PostCard({ post, searchQuery = '' }: PostCardProps) {
  // 格式化为中文日期
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

  return (
    <Link href={`/posts/${post.slug}`} className="group">
      <article className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 group-hover:border-gray-900 dark:group-hover:border-gray-100 group-hover:-translate-y-1 h-full flex flex-col">
        {post.screenshot && (
          <div className="aspect-video overflow-hidden bg-gray-200 dark:bg-gray-700">
            <img
              src={post.screenshot}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
        
        <div className="p-6 flex flex-col flex-1">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 line-clamp-2 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">
            <HighlightedText text={post.title} highlight={searchQuery} />
          </h2>
          
          <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-3 leading-relaxed">
            <HighlightedText text={post.excerpt} highlight={searchQuery} />
          </p>

          {/* 关键词标签 - 固定高度区域 */}
          <div className="mb-3 min-h-[2rem]">
            {post.keywords && post.keywords.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {post.keywords.slice(0, 4).map((keyword, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
                  >
                    <HighlightedText text={keyword} highlight={searchQuery} />
                  </span>
                ))}
                {post.keywords.length > 4 && (
                  <span className="px-2 py-1 text-xs text-gray-500">
                    +{post.keywords.length - 4}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* 质量评价 - 固定高度区域 */}
          <div className="mb-3 min-h-[1.5rem]">
            {post.quality && (
              <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                ⭐ {post.quality}
              </span>
            )}
          </div>
          
          {/* 底部信息 - 推到底部 */}
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-500 mt-auto">
            <div className="flex items-center gap-3">
              <time className="flex items-center gap-1">
                📅 {chineseDate}
              </time>
              
              <span className="flex items-center gap-1">
                📖 {post.readTime} 分钟
              </span>
            </div>
            
            {post.url && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.open(post.url, '_blank', 'noopener,noreferrer');
                }}
                className="flex items-center gap-1 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                🔗 原文
              </button>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}