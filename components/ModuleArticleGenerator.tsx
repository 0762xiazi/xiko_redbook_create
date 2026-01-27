import React, { useState } from 'react';
import { Loader2, Send, ArrowRight, FileText, Users } from 'lucide-react';
import { AppConfig } from '../types';
import { generateArticle } from '../services';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface ModuleArticleGeneratorProps {
  config: AppConfig;
  user: User;
  token: string | null;
  onGenerateComplete: (title: string, content: string) => void;
}

const ModuleArticleGenerator: React.FC<ModuleArticleGeneratorProps> = ({ config, user, token, onGenerateComplete }) => {
  const [title, setTitle] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [generatedArticle, setGeneratedArticle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateArticle = async () => {
    if (!title.trim() || !targetAudience.trim()) {
      setError('请输入标题和面向用户群体');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const article = await generateArticle(title, targetAudience, config);
      setGeneratedArticle(article);
    } catch (error) {
      console.error('生成文章失败:', error);
      setError('生成文章失败，请稍后重试');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGoToContentGeneration = () => {
    if (generatedArticle) {
      onGenerateComplete(title, generatedArticle);
    }
  };

  return (
    <div className="space-y-6 pb-20 min-h-[800px]">
      {/* 模块标题 */}
      <section className="space-y-3">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FileText className="w-6 h-6 text-red-400" />
          文章生成器
        </h2>
        <p className="text-sm text-gray-500">
          输入标题和面向用户群体，自动生成一篇完整的文章
        </p>
      </section>

      {/* 输入区域 */}
      <section className="space-y-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-400 px-1 uppercase">文章标题</label>
          <input 
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="请输入文章标题"
            className="w-full p-4 bg-white border border-gray-100 rounded-xl text-gray-900 font-bold text-lg placeholder-gray-200 focus:ring-2 focus:ring-blue-100 outline-none shadow-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-400 px-1 uppercase flex items-center gap-1">
            <Users className="w-3 h-3" />
            面向用户群体
          </label>
          <input 
            type="text"
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            placeholder="例如：年轻职场人、学生、宝妈等"
            className="w-full p-4 bg-white border border-gray-100 rounded-xl text-gray-800 text-base placeholder-gray-200 focus:ring-2 focus:ring-blue-100 outline-none shadow-sm"
          />
        </div>

        {error && (
          <div className="bg-red-50 text-red-400 text-sm p-3 rounded-xl">
            {error}
          </div>
        )}
      </section>

      {/* 生成按钮 */}
      <button 
        onClick={handleGenerateArticle}
        disabled={isGenerating || !title.trim() || !targetAudience.trim()}
        className="w-full bg-[#ff2442] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] transition-all shadow-lg shadow-red-100 text-base"
      >
        {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        {isGenerating ? '正在生成文章...' : '生成文章'}
      </button>

      {/* 生成结果 */}
      {generatedArticle && (
        <section className="bg-white rounded-2xl p-5 shadow-sm space-y-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-800">生成结果</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 px-1 uppercase">生成的标题</label>
              <input 
                type="text"
                value={title}
                readOnly
                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-gray-900 font-bold text-base focus:ring-2 focus:ring-blue-100 outline-none shadow-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 px-1 uppercase">生成的文章内容</label>
              <textarea 
                value={generatedArticle}
                readOnly
                className="w-full p-4 bg-white border border-gray-100 rounded-xl text-gray-800 text-sm leading-relaxed placeholder-gray-200 focus:ring-2 focus:ring-blue-100 outline-none min-h-[300px] shadow-sm resize-none"
              />
            </div>

            <button 
              onClick={handleGoToContentGeneration}
              className="w-full bg-blue-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-lg shadow-blue-100 text-base"
            >
              <ArrowRight className="w-5 h-5" />
              去生成图文
            </button>
          </div>
        </section>
      )}
    </div>
  );
};

export default ModuleArticleGenerator;