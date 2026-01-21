import React, { useState } from 'react';
import { Eye, X, Send, Loader2, FileText, CheckCircle2, Copy, Image, Download } from 'lucide-react';
import { generateWechatArticle } from '../services/dify';
import { AppConfig } from '../types';

interface WechatArticleResult {
  title: string;
  coverImage: string;
  htmlContent: string;
  tags: string[];
}

interface ModuleWechatArticleProps {
  config: AppConfig;
  user: any;
  token: string | null;
}

const ModuleWechatArticle: React.FC<ModuleWechatArticleProps> = ({ config, user, token }) => {
  const [topic, setTopic] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>(config.apiKey || '');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [result, setResult] = useState<WechatArticleResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);

  // 保存生成结果到后端
  const saveGenerationResult = async (articleResult: WechatArticleResult) => {
    if (!token) return;
    
    try {
      const generationData = {
        title: articleResult.title,
        type: 'wechat-article',
        data: {
          topic: topic,
          articleResult: articleResult
        },
        createdAt: new Date().toISOString()
      };
      
      const response = await fetch('/api/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(generationData)
      });
      
      if (!response.ok) {
        throw new Error('保存生成结果失败');
      }
      
      console.log('生成结果已保存到后端');
    } catch (error) {
      console.error('保存生成结果失败:', error);
      // 保存失败不影响用户体验，仅记录日志
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('请输入推文主题');
      return;
    }

    if (!apiKey.trim()) {
      setError('请输入Dify API Key');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      // 创建包含用户输入API Key的配置对象
      const updatedConfig = {
        ...config,
        difyApiKey: apiKey
      };
      
      const articleResult = await generateWechatArticle(topic, updatedConfig);
      setResult(articleResult);
      
      // 保存生成结果到后端
      if (token) {
        await saveGenerationResult(articleResult);
      }
    } catch (err: any) {
      setError(err.message || '生成推文失败');
      console.error('生成推文错误:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadCover = () => {
    if (result?.coverImage) {
      const link = document.createElement('a');
      link.href = result.coverImage;
      link.download = `wechat-article-cover-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // 使用现代Clipboard API复制文本
  const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    textArea.style.pointerEvents = 'none';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      alert(successful ? 'HTML内容已复制到剪贴板' : '复制失败，请手动复制');
    } catch (err) {
      console.error('复制失败:', err);
      alert('复制失败，请手动复制');
    } finally {
      document.body.removeChild(textArea);
    }
  };

  const handleCopyHtml = () => {
    if (result?.htmlContent) {
      // 使用Clipboard API或降级方案
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(result.htmlContent)
          .then(() => alert('HTML内容已复制到剪贴板'))
          .catch(err => {
            console.error('复制失败:', err);
            // 降级到传统方法
            fallbackCopyTextToClipboard(result.htmlContent);
          });
      } else {
        // 浏览器不支持Clipboard API时使用传统方法
        fallbackCopyTextToClipboard(result.htmlContent);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* 标题 */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">微信公众号推文生成</h1>
        <p className="text-gray-600">输入推文主题，一键生成完整公众号推文内容</p>
      </div>

      {/* 输入区域 */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-8">
        {/* Dify API Key配置 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Dify API Key</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="请输入您的Dify API Key，例如：app-xxxxxxxxxxxxxxxxxxxxxxxx"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">推文主题</label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="请输入您想要生成的推文主题，例如：'2026年最新健康饮食指南'"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent h-24 resize-none"
          />
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <Loader2 className="animate-spin mr-2" size={20} />
              正在生成...
            </>
          ) : (
            <>
              <Send className="mr-2" size={20} />
              生成推文
            </>
          )}
        </button>
      </div>

      {/* 结果展示区域 */}
      {result && (
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
              <FileText className="mr-2" size={24} />
              生成结果
            </h2>
            <div className="flex items-center text-sm text-gray-600">
              <CheckCircle2 className="text-green-500 mr-1" size={16} />
              生成成功
            </div>
          </div>

          {/* 文章标题 */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-1">文章标题</h3>
            <div className="bg-gray-50 p-3 rounded-lg">
              {result.title}
            </div>
          </div>

          {/* 封面图片 */}
          {result.coverImage && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2 flex items-center">
                <Image className="mr-2" size={20} />
                封面图片
                <button
                  onClick={handleDownloadCover}
                  className="ml-2 text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded flex items-center"
                >
                  <Download size={14} className="mr-1" />
                  下载
                </button>
              </h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <img
                  src={result.coverImage}
                  alt="文章封面"
                  className="w-full h-auto"
                  style={{ maxHeight: '300px', objectFit: 'cover' }}
                />
              </div>
            </div>
          )}

          {/* HTML内容 */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2 flex items-center">
              <Copy className="mr-2" size={20} />
              HTML内容
              <button
                onClick={handleCopyHtml}
                className="ml-2 text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded flex items-center"
              >
                <Copy size={14} className="mr-1" />
                复制
              </button>
              <button
                onClick={() => setIsPreviewOpen(true)}
                className="ml-2 text-sm bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded flex items-center"
              >
                <Eye size={14} className="mr-1" />
                预览
              </button>
            </h3>
            <div className="bg-gray-50 p-3 rounded-lg overflow-auto">
              <pre className="whitespace-pre-wrap break-words font-mono text-sm">{result.htmlContent}</pre>
            </div>
          </div>
        </div>
      )}

      {/* HTML预览模态框 */}
      {isPreviewOpen && result && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-xl font-semibold">HTML预览</h3>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-4 overflow-auto flex-grow">
              <div dangerouslySetInnerHTML={{ __html: result.htmlContent }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModuleWechatArticle;