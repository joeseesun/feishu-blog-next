'use client';

import { useState } from 'react';

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
}

export default function SafeImage({ src, alt, className }: SafeImageProps) {
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleImageError = () => {
    console.log('Image failed to load:', src);
    setImageError(true);
    setLoading(false);
  };

  const handleImageLoad = () => {
    console.log('Image loaded successfully:', src);
    setLoading(false);
  };

  if (imageError) {
    // 显示占位符
    return (
      <div className={`${className} bg-gray-200 dark:bg-gray-700 flex items-center justify-center`}>
        <div className="text-center text-gray-500 dark:text-gray-400">
          <div className="text-4xl mb-2">🖼️</div>
          <p className="text-sm">图片加载失败</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {loading && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center z-10">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm">加载中...</p>
          </div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300`}
        onError={handleImageError}
        onLoad={handleImageLoad}
        loading="lazy"
      />
    </div>
  );
}