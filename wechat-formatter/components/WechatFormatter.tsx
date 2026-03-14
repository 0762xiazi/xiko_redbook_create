'use client';

import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import MarkdownRenderer from './MarkdownRenderer';
import { themes, Theme } from '../lib/themes';
import { convertFeishuHtmlToMarkdown, isFeishuHtml } from '../lib/feishu-converter';
import { Smartphone, Monitor, Copy, Check, Palette, FileText } from 'lucide-react';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

type ViewMode = 'mobile' | 'desktop';

export default function WechatFormatter() {
  const [markdown, setMarkdown] = useState('# 欢迎使用公众号排版工具\n\n在这里输入 Markdown 内容，或者从飞书粘贴 HTML 内容。\n\n## 功能特点\n\n- 支持从飞书粘贴 HTML 自动转 Markdown\n- 6 套精美主题可切换\n- 手机/电脑预览模式\n- 一键复制到公众号\n\n```javascript\nconsole.log("Hello, WeChat!");\n```');
  const [selectedTheme, setSelectedTheme] = useState(themes[0]);
  const [viewMode, setViewMode] = useState<ViewMode>('mobile');
  const [copied, setCopied] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const handlePaste = async (e: React.ClipboardEvent) => {
    const htmlData = e.clipboardData.getData('text/html');
    
    if (htmlData && isFeishuHtml(htmlData)) {
      e.preventDefault();
      try {
        const convertedMarkdown = convertFeishuHtmlToMarkdown(htmlData);
        setMarkdown(prev => prev + '\n\n' + convertedMarkdown);
      } catch (error) {
        console.error('转换失败:', error);
      }
    }
  };

  const copyToWechat = async () => {
    if (!previewRef.current) return;

    try {
      const htmlContent = previewRef.current.innerHTML;
      
      const clipboardItem = new ClipboardItem({
        'text/html': new Blob([htmlContent], { type: 'text/html' }),
        'text/plain': new Blob([markdown], { type: 'text/plain' }),
      });

      await navigator.clipboard.write([clipboardItem]);
      
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('复制失败:', error);
      alert('复制失败，请手动复制');
    }
  };

  const previewWidth = viewMode === 'mobile' ? '375px' : '100%';

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100" onPaste={handlePaste}>
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-500" />
            <h1 className="text-xl font-bold">公众号排版工具</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setShowThemeSelector(!showThemeSelector)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Palette className="w-4 h-4" />
                <span>{selectedTheme.name}</span>
              </button>
              
              {showThemeSelector && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden z-50">
                  {themes.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => {
                        setSelectedTheme(theme);
                        setShowThemeSelector(false);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors flex items-center gap-3"
                    >
                      <div
                        className="w-6 h-6 rounded-full border-2 border-gray-600"
                        style={{ backgroundColor: theme.color }}
                      />
                      <span>{theme.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={copyToWechat}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-medium"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? '已复制' : '复制到公众号'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Markdown 编辑器</h2>
              <span className="text-sm text-gray-400">支持从飞书粘贴 HTML</span>
            </div>
            
            <div className="flex-1 min-h-[600px] bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
              <MDEditor
                value={markdown}
                onChange={(value) => setMarkdown(value || '')}
                height={600}
                preview="edit"
                hideToolbar={false}
                visibleDragBar={false}
                textareaProps={{
                  placeholder: '在此输入 Markdown 内容，或从飞书粘贴 HTML...',
                }}
                data-color-mode="dark"
              />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">预览</h2>
              <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('mobile')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${
                    viewMode === 'mobile' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  手机
                </button>
                <button
                  onClick={() => setViewMode('desktop')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${
                    viewMode === 'desktop' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <Monitor className="w-4 h-4" />
                  电脑
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-[600px] bg-gray-900 rounded-xl border border-gray-800 p-6 overflow-auto">
              <div
                ref={previewRef}
                className="mx-auto transition-all duration-300"
                style={{
                  width: previewWidth,
                  maxWidth: '100%',
                  backgroundColor: selectedTheme.bgColor,
                  padding: '20px',
                  borderRadius: '8px',
                  minHeight: '500px',
                }}
              >
                <MarkdownRenderer markdown={markdown} theme={selectedTheme} />
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-800 bg-gray-900/50 mt-8">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-400 text-sm">
          <p>支持飞书图片域名白名单：*.feishu.cn, *.feishu.com</p>
        </div>
      </footer>
    </div>
  );
}
