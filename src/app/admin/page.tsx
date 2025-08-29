'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, MessageCircle, Github, ArrowLeft, Save, Eye, EyeOff } from 'lucide-react';
import Modal from '@/components/Modal';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [config, setConfig] = useState({
    feishu: {
      appId: '',
      appSecret: '',
      appToken: '',
      tableId: ''
    },
    site: {
      name: '',
      description: '',
      author: '',
      logo: '',
      favicon: '',
      domain: ''
    },
    social: {
      twitter: '',
      github: '',
      email: '',
      weibo: ''
    },
    qrCodes: {
      donation: '',
      wechat: ''
    },
    features: {
      postsPerPage: 20,
      showDonation: true,
      showWechat: true,
      showSearch: true,
      showRelatedPosts: true
    },
    seo: {
      title: '',
      description: '',
      keywords: ''
    }
  });
  const [originalConfig, setOriginalConfig] = useState(config);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [isWeChatModalOpen, setIsWeChatModalOpen] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    appSecret: false
  });
  const [secretMask, setSecretMask] = useState('');

  useEffect(() => {
    // Check if already authenticated
    const authStatus = sessionStorage.getItem('adminAuthenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
      loadConfig();
    }
  }, []);

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/admin/config');
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
        setOriginalConfig(data);
        // 如果有Secret，显示遮罩
        if (data.feishu?.appSecret) {
          setSecretMask('••••••••••••••••');
        }
      }
    } catch (error) {
      console.error('Failed to load config:', error);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '42') {
      setIsAuthenticated(true);
      sessionStorage.setItem('adminAuthenticated', 'true');
      loadConfig();
      setPassword('');
    } else {
      setMessage('密码错误');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        setMessage('配置保存成功！');
        setOriginalConfig(config);
      } else {
        const error = await response.json();
        setMessage(`保存失败: ${error.message}`);
      }
    } catch (error) {
      setMessage('保存失败，请重试');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('adminAuthenticated');
    setConfig({
      feishu: { appId: '', appSecret: '', appToken: '', tableId: '' },
      site: { name: '', description: '', author: '', logo: '', favicon: '', domain: '' },
      social: { twitter: '', github: '', email: '', weibo: '' },
      qrCodes: { donation: '', wechat: '' },
      features: { postsPerPage: 20, showDonation: true, showWechat: true, showSearch: true, showRelatedPosts: true },
      seo: { title: '', description: '', keywords: '' }
    });
    setOriginalConfig({
      feishu: { appId: '', appSecret: '', appToken: '', tableId: '' },
      site: { name: '', description: '', author: '', logo: '', favicon: '', domain: '' },
      social: { twitter: '', github: '', email: '', weibo: '' },
      qrCodes: { donation: '', wechat: '' },
      features: { postsPerPage: 20, showDonation: true, showWechat: true, showSearch: true, showRelatedPosts: true },
      seo: { title: '', description: '', keywords: '' }
    });
  };

  const parseTableUrl = (url: string) => {
    try {
      // Extract appToken from URL like: https://xiangyangqiaomu.feishu.cn/base/{appToken}?table={tableId}
      const match = url.match(/\/base\/([^?]+)\?table=([^&]+)/);
      if (match) {
        return {
          appToken: match[1],
          tableId: match[2]
        };
      }
      return null;
    } catch {
      return null;
    }
  };

  const handleTableUrlChange = (url: string) => {
    const parsed = parseTableUrl(url);
    if (parsed) {
      setConfig({
        ...config,
        feishu: {
          ...config.feishu,
          appToken: parsed.appToken,
          tableId: parsed.tableId
        }
      });
    }
  };

  const hasUnsavedChanges = JSON.stringify(config) !== JSON.stringify(originalConfig);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <Image src={config.site?.logo || '/icon.png'} alt="Logo" width={32} height={32} className="w-8 h-8" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {config.site?.name || '乔木飞书收藏'}
                </h1>
              </Link>
              
              <div className="flex items-center gap-4 flex-1 max-w-md mx-8">
                <Link
                  href="/"
                  className="flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors p-2"
                  title="返回首页"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              </div>
              
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsDonationModalOpen(true)}
                  className="flex items-center gap-1 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 text-sm transition-colors"
                >
                  <Heart className="w-4 h-4" /> 打赏
                </button>
                <button
                  onClick={() => setIsWeChatModalOpen(true)}
                  className="flex items-center gap-1 text-gray-500 hover:text-green-500 dark:text-gray-400 dark:hover:text-green-400 text-sm transition-colors"
                >
                  <MessageCircle className="w-4 h-4" /> 公众号
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Login Form */}
        <main className="max-w-md mx-auto px-4 py-16">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
              管理员登录
            </h2>
            
            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  请输入管理员密码
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="输入密码..."
                  autoFocus
                />
              </div>
              
              {message && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg text-sm">
                  {message}
                </div>
              )}
              
              <button
                type="submit"
                className="w-full bg-gray-800 hover:bg-gray-900 text-white py-2 px-4 rounded-lg transition-colors"
              >
                登录
              </button>
            </form>
          </div>
        </main>

        {/* Modals */}
        <Modal
          isOpen={isDonationModalOpen}
          onClose={() => setIsDonationModalOpen(false)}
          title="打赏二维码"
        >
          <div className="text-center">
            <img
              src="https://newimg.t5t6.com/1751870053373-97dc7339-5191-4dde-b891-bf4fb4fe8118.png"
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
              src="https://newimg.t5t6.com/1751870053371-c2bf9308-2e52-4a15-81b4-6c7490b551cf.jpg"
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <Image src="/icon.png" alt="Logo" width={32} height={32} className="w-8 h-8" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                管理后台
              </h1>
            </Link>
            
            <div className="flex items-center gap-4">
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 text-sm transition-colors"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            飞书配置管理
          </h2>
          
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.includes('成功') 
                ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
            }`}>
              {message}
            </div>
          )}

          <div className="space-y-8">
            {/* 飞书配置部分 */}
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                飞书 API 配置
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    App ID
                  </label>
                  <input
                    type="text"
                    value={config.feishu.appId}
                    onChange={(e) => setConfig({ ...config, feishu: { ...config.feishu, appId: e.target.value } })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="cli_xxxxxxxxxx"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    App Secret
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.appSecret ? 'text' : 'password'}
                      value={showPasswords.appSecret ? config.feishu.appSecret : (config.feishu.appSecret ? secretMask : '')}
                      onChange={(e) => {
                        setConfig({ ...config, feishu: { ...config.feishu, appSecret: e.target.value } });
                        if (secretMask) setSecretMask('');
                      }}
                      onFocus={() => {
                        if (secretMask) {
                          setSecretMask('');
                          setShowPasswords({ ...showPasswords, appSecret: true });
                        }
                      }}
                      className="w-full px-4 py-2 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="App Secret"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, appSecret: !showPasswords.appSecret })}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.appSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    多维表格 URL
                  </label>
                  <input
                    type="url"
                    onChange={(e) => handleTableUrlChange(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="https://xiangyangqiaomu.feishu.cn/base/{appToken}?table={tableId}"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    粘贴完整的多维表格地址，系统会自动解析 App Token 和 Table ID
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      App Token
                    </label>
                    <input
                      type="text"
                      value={config.feishu.appToken}
                      onChange={(e) => setConfig({ ...config, feishu: { ...config.feishu, appToken: e.target.value } })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="自动从 URL 解析"
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Table ID
                    </label>
                    <input
                      type="text"
                      value={config.feishu.tableId}
                      onChange={(e) => setConfig({ ...config, feishu: { ...config.feishu, tableId: e.target.value } })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="自动从 URL 解析"
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 网站基本信息 */}
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                网站基本信息
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      网站名称
                    </label>
                    <input
                      type="text"
                      value={config.site.name}
                      onChange={(e) => setConfig({ ...config, site: { ...config.site, name: e.target.value } })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="我的博客"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      作者名称
                    </label>
                    <input
                      type="text"
                      value={config.site.author}
                      onChange={(e) => setConfig({ ...config, site: { ...config.site, author: e.target.value } })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="张三"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    网站描述
                  </label>
                  <textarea
                    value={config.site.description}
                    onChange={(e) => setConfig({ ...config, site: { ...config.site, description: e.target.value } })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="基于飞书多维表格的动态博客系统"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      网站Logo
                    </label>
                    <input
                      type="text"
                      value={config.site.logo}
                      onChange={(e) => setConfig({ ...config, site: { ...config.site, logo: e.target.value } })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="/icon.png"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      网站图标
                    </label>
                    <input
                      type="text"
                      value={config.site.favicon}
                      onChange={(e) => setConfig({ ...config, site: { ...config.site, favicon: e.target.value } })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="/favicon.ico"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      网站域名
                    </label>
                    <input
                      type="text"
                      value={config.site.domain}
                      onChange={(e) => setConfig({ ...config, site: { ...config.site, domain: e.target.value } })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 社交媒体配置 */}
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                社交媒体链接
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Twitter/X
                    </label>
                    <input
                      type="url"
                      value={config.social.twitter}
                      onChange={(e) => setConfig({ ...config, social: { ...config.social, twitter: e.target.value } })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="https://x.com/username"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      GitHub
                    </label>
                    <input
                      type="url"
                      value={config.social.github}
                      onChange={(e) => setConfig({ ...config, social: { ...config.social, github: e.target.value } })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="https://github.com/username"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      邮箱
                    </label>
                    <input
                      type="email"
                      value={config.social.email}
                      onChange={(e) => setConfig({ ...config, social: { ...config.social, email: e.target.value } })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      微博
                    </label>
                    <input
                      type="url"
                      value={config.social.weibo}
                      onChange={(e) => setConfig({ ...config, social: { ...config.social, weibo: e.target.value } })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="https://weibo.com/username"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 二维码配置 */}
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                二维码图片
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      打赏二维码
                    </label>
                    <input
                      type="url"
                      value={config.qrCodes.donation}
                      onChange={(e) => setConfig({ ...config, qrCodes: { ...config.qrCodes, donation: e.target.value } })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="https://example.com/donation-qr.png"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      微信公众号二维码
                    </label>
                    <input
                      type="url"
                      value={config.qrCodes.wechat}
                      onChange={(e) => setConfig({ ...config, qrCodes: { ...config.qrCodes, wechat: e.target.value } })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="https://example.com/wechat-qr.jpg"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 功能配置 */}
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                功能开关
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    每页文章数量
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={config.features.postsPerPage}
                    onChange={(e) => setConfig({ ...config, features: { ...config.features, postsPerPage: parseInt(e.target.value) || 20 } })}
                    className="w-32 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="20"
                  />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.features.showDonation}
                      onChange={(e) => setConfig({ ...config, features: { ...config.features, showDonation: e.target.checked } })}
                      className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">显示打赏</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.features.showWechat}
                      onChange={(e) => setConfig({ ...config, features: { ...config.features, showWechat: e.target.checked } })}
                      className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">显示公众号</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.features.showSearch}
                      onChange={(e) => setConfig({ ...config, features: { ...config.features, showSearch: e.target.checked } })}
                      className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">显示搜索</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.features.showRelatedPosts}
                      onChange={(e) => setConfig({ ...config, features: { ...config.features, showRelatedPosts: e.target.checked } })}
                      className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">显示相关文章</span>
                  </label>
                </div>
              </div>
            </div>

            {/* SEO配置 */}
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                SEO设置
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    SEO标题
                  </label>
                  <input
                    type="text"
                    value={config.seo.title}
                    onChange={(e) => setConfig({ ...config, seo: { ...config.seo, title: e.target.value } })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="我的博客 - 分享技术与生活"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    SEO描述
                  </label>
                  <textarea
                    value={config.seo.description}
                    onChange={(e) => setConfig({ ...config, seo: { ...config.seo, description: e.target.value } })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="基于飞书多维表格的动态博客系统，记录技术学习和生活感悟"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    SEO关键词
                  </label>
                  <input
                    type="text"
                    value={config.seo.keywords}
                    onChange={(e) => setConfig({ ...config, seo: { ...config.seo, keywords: e.target.value } })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="博客,飞书,多维表格,技术,生活"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    多个关键词请用英文逗号分隔
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-6">
              <button
                onClick={handleSave}
                disabled={loading || !hasUnsavedChanges}
                className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                {loading ? '保存中...' : '保存配置'}
              </button>
              
              {hasUnsavedChanges && (
                <span className="text-orange-600 dark:text-orange-400 text-sm">
                  有未保存的更改
                </span>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}