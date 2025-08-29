export interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  url?: string;
  screenshot?: string;
  createdTime: string;
  slug: string;
  readTime: number;
  // 新增字段
  status: number;
  keywords: string[];
  isAd: boolean;
  quality?: string;
  description?: string;
  summary?: string;
  oneSentence?: string;
  unconventional?: string;
  xiaohongshu?: string;
  articleScan?: string;
}