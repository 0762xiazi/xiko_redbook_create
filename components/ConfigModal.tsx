
import React, { useState } from 'react';
import { AppConfig } from '../types';
import { X, ExternalLink, Key, Globe, Cpu } from 'lucide-react';

interface ConfigModalProps {
  config: AppConfig;
  setConfig: (config: AppConfig) => void;
  onClose: () => void;
}

const ConfigModal: React.FC<ConfigModalProps> = ({ config, setConfig, onClose }) => {
  const [localConfig, setLocalConfig] = useState<AppConfig>({ ...config });
  const [useCustomText, setUseCustomText] = useState(!['gemini-3-flash-preview', 'gemini-3-pro-preview'].includes(config.textModel));
  const [useCustomImage, setUseCustomImage] = useState(!['gemini-2.5-flash-image', 'gemini-3-pro-image-preview'].includes(config.imageModel));

  const handleSave = () => {
    setConfig(localConfig);
    onClose();
  };

  const openKeySelector = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio) {
      await aistudio.openSelectKey();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-bold text-xl text-gray-800">系统配置</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* API Key Section */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-gray-800 font-bold">
              <Key className="w-4 h-4 text-red-500" />
              <span>凭据管理</span>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-3">
              <p className="text-xs text-gray-500 leading-relaxed">
                为了安全起见，API Key 将通过平台加密通道管理。点击下方按钮选择您的付费项目 Key。
              </p>
              <button 
                onClick={openKeySelector}
                className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-100 active:scale-95 transition-all shadow-sm"
              >
                <Key className="w-4 h-4" />
                配置/更换 API Key
              </button>
              <a 
                href="https://ai.google.dev/gemini-api/docs/billing" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1 text-[10px] font-bold text-blue-500 hover:underline"
              >
                查看账单说明 <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </section>

          {/* Proxy Section */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-gray-800 font-bold">
              <Globe className="w-4 h-4 text-blue-500" />
              <span>网络与代理</span>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase px-1">API Base URL (可选)</label>
              <input 
                type="text"
                placeholder="https://generativelanguage.googleapis.com"
                value={localConfig.baseUrl || ''}
                onChange={(e) => setLocalConfig({ ...localConfig, baseUrl: e.target.value })}
                className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder-gray-300 text-gray-800"
              />
              <p className="text-[9px] text-gray-400 px-1 italic">若使用代理，请输入完整的 API 地址前缀</p>
            </div>
          </section>
          
          {/* Models Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-gray-800 font-bold">
              <Cpu className="w-4 h-4 text-purple-500" />
              <span>模型定义</span>
            </div>
            
            {/* Text Model */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">文本/分析模型</label>
                <button 
                  onClick={() => setUseCustomText(!useCustomText)}
                  className="text-[10px] font-bold text-blue-500 hover:underline"
                >
                  {useCustomText ? '切换至预设' : '手动输入'}
                </button>
              </div>
              {useCustomText ? (
                <input 
                  type="text"
                  value={localConfig.textModel}
                  onChange={(e) => setLocalConfig({ ...localConfig, textModel: e.target.value })}
                  placeholder="输入模型名称，如 gemini-3-pro-preview"
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-purple-100 outline-none text-gray-800"
                />
              ) : (
                <select 
                  value={localConfig.textModel}
                  onChange={(e) => setLocalConfig({ ...localConfig, textModel: e.target.value })}
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-purple-100 outline-none appearance-none text-gray-800 font-medium"
                >
                  <option value="gemini-3-flash-preview">Gemini 3 Flash (快)</option>
                  <option value="gemini-3-pro-preview">Gemini 3 Pro (强)</option>
                </select>
              )}
            </div>

            {/* Image Model */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">图片生成模型</label>
                <button 
                  onClick={() => setUseCustomImage(!useCustomImage)}
                  className="text-[10px] font-bold text-blue-500 hover:underline"
                >
                  {useCustomImage ? '切换至预设' : '手动输入'}
                </button>
              </div>
              {useCustomImage ? (
                <input 
                  type="text"
                  value={localConfig.imageModel}
                  onChange={(e) => setLocalConfig({ ...localConfig, imageModel: e.target.value })}
                  placeholder="输入模型名称，如 gemini-3-pro-image-preview"
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-pink-100 outline-none text-gray-800"
                />
              ) : (
                <select 
                  value={localConfig.imageModel}
                  onChange={(e) => setLocalConfig({ ...localConfig, imageModel: e.target.value })}
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-pink-100 outline-none appearance-none text-gray-800 font-medium"
                >
                  <option value="gemini-2.5-flash-image">Gemini 2.5 Flash Image</option>
                  <option value="gemini-3-pro-image-preview">Gemini 3 Pro Image (需Key)</option>
                </select>
              )}
            </div>
          </section>
        </div>

        <div className="p-5 bg-gray-50 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 bg-white border border-gray-200 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
          >
            取消
          </button>
          <button 
            onClick={handleSave}
            className="flex-1 py-3 xhs-bg-red text-white rounded-2xl font-bold hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-red-100"
          >
            保存并应用
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfigModal;
