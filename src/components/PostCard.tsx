import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Post } from '@/types/post';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  // 安全地处理时间格式
  const getRelativeTime = () => {
    try {
      const date = new Date(post.createdTime);
      if (isNaN(date.getTime())) {
        // 如果时间无效，返回默认值
        return '最近';
      }
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return '最近';
    }
  };
  
  const relativeTime = getRelativeTime();

  return (
    <Link href={`/posts/${post.slug}`} className="group">
      <article className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 group-hover:border-blue-300 dark:group-hover:border-blue-600 group-hover:-translate-y-1">
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
        
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {post.title}
          </h2>
          
          <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-3 leading-relaxed">
            {post.excerpt}
          </p>

          {/* 关键词标签 */}
          {post.keywords && post.keywords.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {post.keywords.slice(0, 3).map((keyword, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full"
                >
                  {keyword}
                </span>
              ))}
              {post.keywords.length > 3 && (
                <span className="px-2 py-1 text-xs text-gray-500">
                  +{post.keywords.length - 3}
                </span>
              )}
            </div>
          )}
          
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-500">
            <div className="flex items-center gap-3">
              <time className="flex items-center gap-1">
                📅 {relativeTime}
              </time>
              
              {post.quality && (
                <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                  ⭐ {post.quality}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                📖 {post.readTime} 分钟阅读
              </span>
              
              {post.url && (
                <span className="flex items-center gap-1 text-blue-500">
                  📎 原文链接
                </span>
              )}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}