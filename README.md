# Feishu Blog - Next.js 版本

基于 Next.js 的飞书多维表格博客系统，支持 Vercel 一键部署。

## 功能特性

- 🚀 **Vercel 部署**: 支持一键部署到 Vercel 平台
- 📝 **飞书集成**: 直接从飞书多维表格读取文章数据
- 🎨 **Markdown 支持**: 完整的 Markdown 渲染和语法高亮
- 📱 **响应式设计**: 适配桌面端和移动端
- ⚡ **静态生成**: 利用 Next.js ISR 实现高性能
- 🎯 **SEO 优化**: 自动生成 meta 标签和 sitemap
- 🌙 **深色模式**: 支持系统主题切换

## 快速部署到 Vercel

### 1. 点击部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/feishu-blog-next)

### 2. 配置环境变量

在 Vercel 项目设置中添加以下环境变量：

```env
FEISHU_APP_ID=cli_your_app_id_here
FEISHU_APP_SECRET=your_app_secret_here
FEISHU_APP_TOKEN=your_app_token_here
FEISHU_TABLE_ID=your_table_id_here
```

### 3. 完成！

部署完成后，你的博客将在几分钟内上线。

## 本地开发

### 环境要求

- Node.js 18.18+ 
- npm 或 yarn

### 安装步骤

1. 克隆项目：
```bash
git clone https://github.com/your-username/feishu-blog-next.git
cd feishu-blog-next
```

2. 安装依赖：
```bash
npm install
```

3. 配置环境变量：
```bash
cp .env.example .env.local
```

编辑 `.env.local` 填入你的飞书配置。

4. 启动开发服务器：
```bash
npm run dev
```

5. 打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 环境变量配置

### 必需变量

| 变量名 | 描述 | 获取方式 |
|--------|------|----------|
| `FEISHU_APP_ID` | 飞书应用 ID | [飞书开放平台](https://open.feishu.cn/app) |
| `FEISHU_APP_SECRET` | 飞书应用密钥 | 飞书开放平台 |
| `FEISHU_APP_TOKEN` | 多维表格 App Token | 从表格 URL 提取 |
| `FEISHU_TABLE_ID` | 表格 ID | 从表格 URL 提取 |

### 可选变量

| 变量名 | 描述 | 默认值 |
|--------|------|--------|
| `NEXT_PUBLIC_BLOG_TITLE` | 博客标题 | "飞书博客" |
| `NEXT_PUBLIC_BLOG_DESCRIPTION` | 博客描述 | "基于飞书多维表格的动态博客系统" |
| `NEXT_PUBLIC_BLOG_AUTHOR` | 博客作者 | "Blog Author" |

### 如何获取飞书配置

1. **创建飞书应用**：
   - 访问 [飞书开放平台](https://open.feishu.cn/app)
   - 创建应用，获取 App ID 和 App Secret

2. **配置应用权限**：
   - 添加 `bitable:record` 权限
   - 发布应用版本

3. **获取表格信息**：
   - 表格 URL 格式：`https://xxx.feishu.cn/base/APP_TOKEN?table=TABLE_ID`
   - 从中提取 `APP_TOKEN` 和 `TABLE_ID`

## 数据表格要求

你的飞书多维表格需要包含以下字段：

| 字段名 | 类型 | 必需 | 描述 |
|--------|------|------|------|
| `Title` | 单行文本 | ✅ | 文章标题 |
| `Content` | 多行文本 | ✅ | 文章内容（Markdown 格式）|
| `URL` | URL | ❌ | 原文链接 |
| `Screenshot` | 附件 | ❌ | 文章配图 |

## 技术栈

- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **Markdown**: react-markdown + remark-gfm
- **部署**: Vercel
- **API**: Feishu Open API

## 项目结构

```
src/
├── app/
│   ├── api/posts/route.ts       # 飞书 API 路由
│   ├── posts/[slug]/page.tsx    # 文章详情页
│   ├── page.tsx                 # 首页
│   ├── layout.tsx               # 全局布局
│   └── not-found.tsx            # 404 页面
├── components/
│   └── PostCard.tsx             # 文章卡片组件
└── types/
    └── post.ts                  # 类型定义
```

## API 路由

### GET /api/posts

返回所有文章列表。

**响应格式**：
```json
{
  "posts": [
    {
      "id": "string",
      "title": "string",
      "content": "string",
      "excerpt": "string",
      "url": "string",
      "screenshot": "string",
      "createdTime": "string",
      "slug": "string",
      "readTime": number
    }
  ],
  "total": number
}
```

## 性能优化

- **ISR**: 使用增量静态再生成，5分钟更新一次
- **图片优化**: 使用 Next.js Image 组件
- **缓存**: API 响应缓存 5 分钟
- **静态生成**: 文章页面静态预生成

## 常见问题

### Q: 配置后看不到文章？
A: 检查飞书应用权限和表格字段名是否正确。

### Q: 部署后 API 调用失败？
A: 确认环境变量已在 Vercel 中正确设置。

### Q: 图片不显示？
A: 检查飞书表格中的 Screenshot 字段是否有附件。

### Q: Markdown 渲染异常？
A: 确认 Content 字段内容是有效的 Markdown 格式。

## 开发命令

```bash
# 开发
npm run dev

# 构建
npm run build

# 启动生产服务器
npm run start

# 代码检查
npm run lint
```

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License
