# 飞书博客 (Feishu Blog)

基于飞书多维表格的 Next.js 动态博客系统

## 特性

- 🚀 基于 Next.js 15 和 React 19
- 📊 使用飞书多维表格作为 CMS
- 🎨 响应式设计，支持深色模式
- 🔍 全文搜索功能
- 📱 移动端优化
- ⚡ 服务端渲染，SEO 友好
- 🎯 完整的后台配置系统
- 🏷️ 标签和分类支持
- 📈 阅读时间估算
- 💫 现代化 UI 设计

## 部署到 Vercel

### 1. 环境变量配置

在 Vercel 项目设置中添加以下环境变量：

```bash
FEISHU_APP_ID=your_feishu_app_id
FEISHU_APP_SECRET=your_feishu_app_secret  
FEISHU_APP_TOKEN=your_feishu_app_token
FEISHU_TABLE_ID=your_feishu_table_id
```

### 2. 获取飞书应用凭据

1. 访问 [飞书开放平台](https://open.feishu.cn/)
2. 创建企业应用
3. 获取 App ID 和 App Secret
4. 创建多维表格并获取 App Token 和 Table ID

### 3. 一键部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/joeseesun/feishu-blog-next)

## 本地开发

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local

# 启动开发服务器
npm run dev
```

## 配置说明

系统支持两种配置方式：

1. **环境变量**: 在 `.env.local` 中配置飞书相关参数
2. **配置文件**: 通过后台管理 (`/admin`) 配置网站信息

访问 `/admin` 可以配置：
- 网站基本信息
- 社交媒体链接  
- 二维码展示
- 功能开关
- SEO 设置

## 技术栈

- **框架**: Next.js 15
- **UI**: React 19 + Tailwind CSS
- **图标**: Lucide React
- **Markdown**: ReactMarkdown + remark/rehype
- **日期**: date-fns
- **类型**: TypeScript

## 部署要求

- Node.js 18+
- 飞书开放平台应用
- 多维表格权限

## License

MIT
