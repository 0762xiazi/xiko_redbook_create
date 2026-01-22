
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ConfigModal from './components/ConfigModal';
import LoginModal from './components/LoginModal';
import ModuleContentImage from './components/ModuleContentImage';
import ModuleProductCopy from './components/ModuleProductCopy';
import ModuleWechatArticle from './components/ModuleWechatArticle'; // 导入微信公众号推文组件
import { ActiveModule, AppConfig } from './types';
import { Image as ImageIcon, MessageSquare, FileText } from 'lucide-react'; // 导入文件文本图标

const STORAGE_KEY = 'xhs_creator_config_v2';
const AUTH_KEY = 'xhs_creator_auth';

interface User {
  id: string;
  email: string;
  name?: string;
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveModule>(ActiveModule.CONTENT_IMAGE);
  const [showConfig, setShowConfig] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  
  // 从本地缓存加载配置
  const [config, setConfig] = useState<AppConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse config from localStorage', e);
      }
    }
    return {
      textModel: 'gemini-3-flash-preview',
      imageModel: 'gemini-2.5-flash-image',
      baseUrl: ''
    };
  });

  // 从本地存储加载认证信息
  useEffect(() => {
    const savedAuth = localStorage.getItem(AUTH_KEY);
    if (savedAuth) {
      try {
        const authData = JSON.parse(savedAuth);
        setUser(authData.user);
        setToken(authData.token);
      } catch (e) {
        console.error('Failed to parse auth data from localStorage', e);
        localStorage.removeItem(AUTH_KEY);
      }
    }
  }, []);

  // 当配置改变时同步到本地缓存
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }, [config]);

  // 当认证信息改变时同步到本地缓存
  useEffect(() => {
    if (user && token) {
      localStorage.setItem(AUTH_KEY, JSON.stringify({ user, token }));
    } else {
      localStorage.removeItem(AUTH_KEY);
    }
  }, [user, token]);

  // 获取用户API Key
  const fetchUserApiKey = async () => {
    if (!token) return;
    
    try {
      const response = await fetch('/api/api-keys/gemini', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.apiKey) {
          setConfig(prev => ({ ...prev, apiKey: data.apiKey }));
        }
      }
    } catch (error) {
      console.error('获取API Key失败:', error);
    }
  };

  const handleLogin = async (loggedInUser: User, authToken: string) => {
    setUser(loggedInUser);
    setToken(authToken);
    
    // 登录成功后获取用户API Key
    await fetchUserApiKey();
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
  };

  // 保存API Key到后端
  const handleSaveApiKey = async (apiKey: string) => {
    if (!token) return;
    
    try {
      const response = await fetch('/api/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          service: 'gemini',
          api_key: apiKey
        })
      });
      
      if (!response.ok) {
        throw new Error('保存API Key失败');
      }
    } catch (error) {
      console.error('保存API Key失败:', error);
      alert('保存API Key失败，请稍后重试');
    }
  };

  return (
    <div className="min-h-[800px] pb-24 bg-[#f9f9f9]">
      <Header 
        onOpenSettings={() => setShowConfig(true)} 
        user={user}
        onLogout={handleLogout}
        onLogin={() => setShowLogin(true)}
      />

      <main className="max-w-4xl mx-auto px-4 py-6">
        {user && token ? (
          <>
            {/* 内容生成模块 */}
            <div hidden={activeTab !== ActiveModule.CONTENT_IMAGE}>
              <ModuleContentImage config={config} user={user} token={token} />
            </div>
            
            {/* 种草助手模块 */}
            <div hidden={activeTab !== ActiveModule.PRODUCT_COPY}>
              <ModuleProductCopy config={config} user={user} token={token} />
            </div>
            
            {/* 微信公众号推文模块 */}
            <div hidden={activeTab !== ActiveModule.WECHAT_ARTICLE}>
              <ModuleWechatArticle config={config} user={user} token={token} />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">请先登录</h2>
            <p className="text-gray-600 mb-8">登录后即可使用所有功能</p>
            <button
              onClick={() => setShowLogin(true)}
              className="bg-[#ff2442] text-white font-bold py-3 px-8 rounded-lg hover:bg-[#ff0022] transition-colors"
            >
              立即登录
            </button>
          </div>
        )}
      </main>

      {/* Persistent Navigation (Mobile Style) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-100 px-6 py-4 flex items-center justify-around z-40 shadow-2xl">
        <button 
          onClick={() => setActiveTab(ActiveModule.CONTENT_IMAGE)}
          className={`flex flex-col items-center gap-1.5 transition-all ${
            activeTab === ActiveModule.CONTENT_IMAGE ? 'xhs-red scale-110' : 'text-gray-400'
          }`}
        >
          <ImageIcon className={`w-6 h-6 ${activeTab === ActiveModule.CONTENT_IMAGE ? 'fill-current' : ''}`} />
          <span className="text-[10px] font-bold">内容生成</span>
        </button>
        
        <div className="w-px h-6 bg-gray-100" />
        
        <button 
          onClick={() => setActiveTab(ActiveModule.PRODUCT_COPY)}
          className={`flex flex-col items-center gap-1.5 transition-all ${
            activeTab === ActiveModule.PRODUCT_COPY ? 'xhs-red scale-110' : 'text-gray-400'
          }`}
        >
          <MessageSquare className={`w-6 h-6 ${activeTab === ActiveModule.PRODUCT_COPY ? 'fill-current' : ''}`} />
          <span className="text-[10px] font-bold">种草助手</span>
        </button>
        
        <div className="w-px h-6 bg-gray-100" />
        
        <button 
          onClick={() => setActiveTab(ActiveModule.WECHAT_ARTICLE)}
          className={`flex flex-col items-center gap-1.5 transition-all ${
            activeTab === ActiveModule.WECHAT_ARTICLE ? 'xhs-red scale-110' : 'text-gray-400'
          }`}
        >
          <FileText className={`w-6 h-6 ${activeTab === ActiveModule.WECHAT_ARTICLE ? 'fill-current' : ''}`} />
          <span className="text-[10px] font-bold">公众号推文</span>
        </button>
      </nav>

      {showConfig && (
        <ConfigModal 
          config={config} 
          setConfig={setConfig} 
          onClose={() => setShowConfig(false)} 
          user={user}
          onSaveApiKey={handleSaveApiKey}
        />
      )}

      <LoginModal 
        isOpen={showLogin} 
        onClose={() => setShowLogin(false)} 
        onLogin={handleLogin} 
      />
    </div>
  );
};

export default App;
