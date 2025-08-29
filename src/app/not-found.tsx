import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-6xl mb-4">😕</div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          文章未找到
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
          抱歉，您查找的文章不存在或已被删除。
        </p>
        <Link
          href="/"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors inline-flex items-center gap-2"
        >
          ← 返回首页
        </Link>
      </div>
    </div>
  );
}