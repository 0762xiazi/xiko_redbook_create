
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ConfigModal from './components/ConfigModal';
import ModuleContentImage from './components/ModuleContentImage';
import ModuleProductCopy from './components/ModuleProductCopy';
import { ActiveModule, AppConfig } from './types';
import { Image as ImageIcon, MessageSquare } from 'lucide-react';

const STORAGE_KEY = 'xhs_creator_config_v2';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveModule>(ActiveModule.CONTENT_IMAGE);
  const [showConfig, setShowConfig] = useState(false);
  
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

  // 当配置改变时同步到本地缓存
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }, [config]);

  return (
    <div className="min-h-screen pb-24 bg-[#f9f9f9]">
      <Header onOpenSettings={() => setShowConfig(true)} />

      <main className="max-w-4xl mx-auto px-4 py-6">
        {activeTab === ActiveModule.CONTENT_IMAGE ? (
          <ModuleContentImage config={config} />
        ) : (
          <ModuleProductCopy config={config} />
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
      </nav>

      {showConfig && (
        <ConfigModal 
          config={config} 
          setConfig={setConfig} 
          onClose={() => setShowConfig(false)} 
        />
      )}
    </div>
  );
};

export default App;
