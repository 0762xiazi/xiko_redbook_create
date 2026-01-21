
import React, { useState, useRef } from 'react';
import { 
  Upload, Trash2, Send, Download, Loader2, 
  CheckCircle2, Type as TypeIcon, Sliders, 
  Layers, Palette, ChevronRight, X, ZoomIn
} from 'lucide-react';
import { AppConfig, GeneratedSlide, SlideStyle, EditorSettings, EditorContent } from '../types';
import { fileToBase64, captureElement, downloadAsZip,captureElementAsImage } from '../utils';
import { analyzeAndGenerateSlides } from '../services';

const STYLES: SlideStyle[] = [
  { id: 'shockwave', name: '冲击波', emoji: '⚡', bg: 'bg-yellow-50', color: 'text-yellow-600' },
  { id: 'diffuse', name: '弥散光', emoji: '🌈', bg: 'bg-indigo-50', color: 'text-indigo-600' },
  { id: 'sticker', name: '贴纸风', emoji: '🍭', bg: 'bg-pink-50', color: 'text-pink-600' },
  { id: 'journal', name: '手账感', emoji: '📝', bg: 'bg-orange-50', color: 'text-orange-600' },
  { id: 'cinema', name: '电影感', emoji: '🎬', bg: 'bg-zinc-800', color: 'text-white' },
  { id: 'tech', name: '科技蓝', emoji: '🔵', bg: 'bg-blue-50', color: 'text-blue-600' },
  { id: 'minimal', name: '极简白', emoji: '⚪', bg: 'bg-white', color: 'text-gray-400' },
  { id: 'memo', name: '备忘录', emoji: '🟡', bg: 'bg-amber-50', color: 'text-amber-600' },
  { id: 'geek', name: '极客黑', emoji: '🟢', bg: 'bg-slate-900', color: 'text-green-500' },
];

interface ModuleContentImageProps {
  config: AppConfig;
  token: string | null;
}

const ModuleContentImage: React.FC<ModuleContentImageProps> = ({ config, token }) => {
  const [settings, setSettings] = useState<EditorSettings>({
    style: 'shockwave',
    fontFamily: 'sans-serif',
    titleSize: 64,
    contentSize: 20,
    bgColor: '#ffffff',
    textColor: '#000000',
    overlayOpacity: 50,
  });

  const [content, setContent] = useState<EditorContent>({
    mainTitle: '你以为是内耗，其实是身体在拉响警报',
    dateStr: '2026/01',
    author: '我不是西口子',
    bodyText: '早上八点，你坐在工位上，对着电脑屏幕，大脑却一片空白。昨晚没睡好，今天要交的报告还差一大半，下午还有个跨部门会议。你感到一阵熟悉的疲惫和烦躁，但更让你不安的是，你发现自己无法集中精力。你开始责备自己：“为什么别人都能高效完成，就我这么容易分心？” “是不是我能力不行？” 这种自我怀疑像藤蔓一样缠绕上来，让你更加动弹不得。\n\n\n# 那不是“懒惰”或“无能”，是“认知过载”\n\n我们太习惯给这种状态贴上“内耗”的标签了。仿佛所有的不适、停滞和低效，都是因为我们“想太多”、“不自律”。但我想告诉你，很多时候，这种所谓的“内耗”，并非性格缺陷，而是一种信号。\n\n你的大脑和身体，正在用疲惫、拖延和注意力涣散，对你发出最直接的警告：**负荷已满，需要暂停。**\n\n这不是软弱，而是一种原始的、本能的自我保护机制。当外界的要求（工作 deadline、人际压力、自我期待）持续超过你当下的心理资源时，你的系统就会自动进入一种“节能模式”。它通过降低你的行动意愿和认知效率，强行让你慢下来，以避免更彻底的崩溃。\n\n\n# 把警报声，翻译成可理解的语言\n\n所以，下一次当你感觉自己又陷入“内耗”的泥潭时，不妨先停下自我批判。试着把内心的嘈杂，翻译成更具体的问题：\n\n*   “我现在的疲惫，是因为这项任务本身让我感到恐惧或毫无意义吗？”\n*   “我的注意力无法集中，是不是因为同时有太多事情在争夺我的精力？”\n*   “这种烦躁感，是来自某个具体的人，还是某种我不愿面对的局面？”\n\n这个过程，本身就是一种整理。它不是要你立刻解决问题，而是让你看清，警报到底因何而响。当你识别出那个真正的压力源——可能是某个不合理的 deadline，一段消耗型的关系，或是一个模糊到让你无从下手的任务——你的焦虑就会从一团模糊的乌云，变成一些可以具体审视的轮廓。\n\n\n# 不是停止思考，而是转换频道\n\n我们无法，也不必完全消除这种保护机制。它的存在是合理的。我们能做的，是学会与它共处，甚至借助它的信号。\n\n这意味着，当你感到“内耗”来袭时，最重要的动作可能不是“逼自己更努力”，而是“允许自己换一种方式存在”。\n\n如果大脑拒绝处理复杂的A任务，或许可以转而处理一些机械的、不费神的B任务，比如整理文件、回复简单邮件。这不是逃避，而是给高速运转的认知系统一个缓冲带。或者，干脆离开工位五分钟，去接杯水，看看窗外。让大脑从“问题解决”模式，切换到简单的“感官接收”模式。\n\n这些微小的切换，是在告诉你的保护机制：“我接收到警报了，我正在调整，请给我一点时间。”\n\n\n# 与你的警报系统和平共处\n\n成长不是一场对自己无限苛责的战争。真正的韧性，来源于倾听并尊重自己内在的节律。那个让你感到“内耗”的部分，或许正是你最忠诚的守卫者，它笨拙地、用让你不适的方式，提醒你界限的存在。\n\n所以，今天若你又感到了那种熟悉的停滞与自我怀疑，请先别急着否定自己。你可以轻轻地对自己说：\n\n“好的，我知道了。你现在很累，需要慢一点。我们来看看，到底发生了什么。”\n\n这不是妥协，这是一种更深刻的清醒。当你学会解读身体的警报，而不是与它为敌，你便获得了一种更可持续的力量。那不是在压力下依然光鲜亮丽的力量，而是在觉察中，稳稳接住自己的能力。',
  });

  const [bgImage, setBgImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [slides, setSlides] = useState<GeneratedSlide[]>([]);
  const [previewIdx, setPreviewIdx] = useState<number | null>(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      setBgImage(base64);
    }
  };

  // Process slide HTML - keep it minimal to avoid affecting original styles
  const processSlideHTML = (html: string): string => {
    return html;
  };

  // 保存生成结果到后端
  const saveGenerationResult = async (slides: GeneratedSlide[]) => {
    if (!token) return;
    
    try {
      const generationData = {
        type: 'content-image',
        content: JSON.stringify({
          title: content.mainTitle,
          slides: slides,
          content: content,
          settings: settings,
          bgImage: bgImage
        }),
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
    setIsLoading(true);
    try {
      const fullText = `Title: ${content.mainTitle}
Context: ${content.dateStr}
Author: ${content.author}
Body: ${content.bodyText}
Style: ${settings.style}`;
      const result = await analyzeAndGenerateSlides(bgImage, fullText, config);
      
      // Set the slides directly without heavy processing to preserve original styles
      setSlides(result);
      
      // 保存生成结果到后端
      if (token) {
        await saveGenerationResult(result);
      }
    } catch (error) {
      console.error(error);
      alert('生成失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadAll = async () => {
    setDownloading(true);
    try {
      const capturedImages = [];
      
      // 为每个幻灯片创建独立的临时元素并直接截图
      for (let i = 0; i < slides.length; i++) {
        // 创建临时预览元素（放置在可见区域但避免干扰）
        const tempPreview = document.createElement('div');
        tempPreview.style.width = '450px';
        tempPreview.style.height = '600px';
        tempPreview.style.backgroundColor = settings.bgColor;
        tempPreview.style.position = 'fixed';
        tempPreview.style.top = '0';
        tempPreview.style.left = '0';
        tempPreview.style.zIndex = '9999'; // 确保在最上层
        tempPreview.style.overflow = 'hidden';
        // tempPreview.style.borderRadius = '1rem';
        tempPreview.style.transform = 'none';
        tempPreview.style.boxSizing = 'border-box';
        tempPreview.style.visibility = 'visible'; // 确保可见
        
        // 添加样式和内容
        const styleEl = document.createElement('style');
        styleEl.innerHTML = slides[i].css;
        tempPreview.appendChild(styleEl);
        
        if (bgImage && i === 0) {
          const bgContainer = document.createElement('div');
          bgContainer.style.position = 'absolute';
          bgContainer.style.inset = '0';
          bgContainer.style.zIndex = '0';
          
          const imgEl = document.createElement('img');
          imgEl.src = bgImage;
          imgEl.style.width = '100%';
          imgEl.style.height = '100%';
          imgEl.style.objectFit = 'cover';
          bgContainer.appendChild(imgEl);
          
          const overlay = document.createElement('div');
          overlay.style.position = 'absolute';
          overlay.style.inset = '0';
          overlay.style.backgroundColor = 'black';
          overlay.style.opacity = String(settings.overlayOpacity / 100);
          bgContainer.appendChild(overlay);
          
          tempPreview.appendChild(bgContainer);
        }
        
        const contentEl = document.createElement('div');
        contentEl.style.width = '100%';
        contentEl.style.height = '100%';
        contentEl.style.display = 'flex';
        contentEl.style.flexDirection = 'column';
        contentEl.style.justifyContent = 'center';
        contentEl.style.alignItems = 'center';
        contentEl.style.textAlign = 'center';
        contentEl.style.overflow = 'hidden';
        contentEl.style.position = 'relative';
        contentEl.style.zIndex = '10';
        contentEl.style.color = settings.textColor;
        contentEl.style.fontFamily = settings.fontFamily;
        contentEl.innerHTML = slides[i].html;
        tempPreview.appendChild(contentEl);
        
        // 将临时元素添加到文档中
        document.body.appendChild(tempPreview);
        
        // 等待元素渲染完成（增加等待时间）
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // 截图，传入缩放比例3以生成高分辨率图片
        const imgData = await captureElementAsImage(tempPreview, 3);
        capturedImages.push({ name: `slide-${i + 1}.png`, data: imgData });
        
        // 移除临时元素
        document.body.removeChild(tempPreview);
      }
        
      // 下载所有图片
      await downloadAsZip(capturedImages, 'xhs-content-package');
    } catch (error) {
      console.error('Error downloading images:', error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 min-h-[800px]">
      {/* Style Selection */}
      <section className="space-y-3">
        <h3 className="text-sm font-bold text-gray-500 flex items-center gap-2">
          🎨 风格选择
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {STYLES.map((s) => (
            <button
              key={s.id}
              onClick={() => setSettings({ ...settings, style: s.id })}
              className={`flex items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-bold transition-all border-2 ${
                settings.style === s.id 
                  ? 'border-blue-500 shadow-sm' 
                  : 'border-transparent'
              } ${s.bg} ${s.color}`}
            >
              <span>{s.emoji}</span>
              {s.name}
            </button>
          ))}
        </div>
      </section>

      {/* Appearance Fine-tuning */}
      <section className="bg-white rounded-2xl p-5 shadow-sm space-y-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-800">外观微调</h3>
          <Sliders className="w-4 h-4 text-gray-400" />
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">全局字体</label>
            <div className="relative">
              <select 
                value={settings.fontFamily}
                onChange={(e) => setSettings({...settings, fontFamily: e.target.value})}
                className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-sm font-medium appearance-none focus:ring-2 focus:ring-blue-100 outline-none"
              >
                <option value="sans-serif">思源黑体 (现代/通用)</option>
                <option value="serif">宋体 (优雅/复古)</option>
                <option value="cursive">手写体 (亲切/个性)</option>
              </select>
              <ChevronRight className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 rotate-90" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold text-gray-400">
                <span>封面字号</span>
                <span className="text-gray-800">{settings.titleSize}</span>
              </div>
              <input 
                type="range" min="32" max="120" 
                value={settings.titleSize}
                onChange={(e) => setSettings({...settings, titleSize: Number(e.target.value)})}
                className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600" 
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold text-gray-400">
                <span>正文字号</span>
                <span className="text-gray-800">{settings.contentSize}</span>
              </div>
              <input 
                type="range" min="12" max="32" 
                value={settings.contentSize}
                onChange={(e) => setSettings({...settings, contentSize: Number(e.target.value)})}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-slate-600" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-[10px] font-bold text-gray-400 block mb-1">背景色</label>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl border border-gray-100">
                <input 
                  type="color" value={settings.bgColor}
                  onChange={(e) => setSettings({...settings, bgColor: e.target.value})}
                  className="w-8 h-8 rounded-lg overflow-hidden border-none p-0 cursor-pointer"
                />
                <span className="text-[10px] text-gray-500 font-medium">自定义</span>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 block mb-1">文字色</label>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl border border-gray-100">
                <input 
                  type="color" value={settings.textColor}
                  onChange={(e) => setSettings({...settings, textColor: e.target.value})}
                  className="w-8 h-8 rounded-lg overflow-hidden border-none p-0 cursor-pointer"
                />
                <span className="text-[10px] text-gray-500 font-medium">自定义</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cover Image */}
      <section className="bg-white rounded-2xl p-5 shadow-sm space-y-4 border border-gray-100">
        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
          🖼️ 封面配图
        </h3>
        
        <div className="flex gap-2">
          <label className="flex-1 h-20 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 transition-colors overflow-hidden group">
            {bgImage ? (
              <img src={bgImage} className="w-full h-full object-cover" alt="Cover" />
            ) : (
              <>
                <Upload className="w-5 h-5 text-gray-300 group-hover:text-blue-400" />
                <span className="text-xs font-bold text-gray-400 group-hover:text-gray-600">上传图片</span>
              </>
            )}
            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
          </label>
          <button 
            onClick={() => setBgImage(null)}
            className="w-12 h-20 bg-red-50 text-red-400 flex items-center justify-center rounded-xl hover:bg-red-100 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
           <div className="flex justify-between text-[10px] font-bold text-gray-400">
            <span>遮罩浓度</span>
            <span className="text-gray-800">{settings.overlayOpacity}%</span>
          </div>
          <input 
            type="range" min="0" max="100" 
            value={settings.overlayOpacity}
            onChange={(e) => setSettings({...settings, overlayOpacity: Number(e.target.value)})}
            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-slate-800" 
          />
        </div>
      </section>

      {/* Main Inputs */}
      <section className="space-y-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-400 px-1 uppercase">主标题</label>
          <input 
            type="text"
            value={content.mainTitle}
            onChange={(e) => setContent({...content, mainTitle: e.target.value})}
            className="w-full p-4 bg-white border border-gray-100 rounded-xl text-gray-900 font-bold text-lg placeholder-gray-200 focus:ring-2 focus:ring-blue-100 outline-none shadow-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 px-1 uppercase">期数/日期</label>
            <input 
              type="text"
              value={content.dateStr}
              onChange={(e) => setContent({...content, dateStr: e.target.value})}
              className="w-full p-3 bg-white border border-gray-100 rounded-xl text-gray-800 font-medium text-sm focus:ring-2 focus:ring-blue-100 outline-none shadow-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 px-1 uppercase">标签/作者</label>
            <input 
              type="text"
              value={content.author}
              onChange={(e) => setContent({...content, author: e.target.value})}
              className="w-full p-3 bg-white border border-gray-100 rounded-xl text-gray-800 font-medium text-sm focus:ring-2 focus:ring-blue-100 outline-none shadow-sm"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-400 px-1 uppercase">正文内容</label>
          <textarea 
            value={content.bodyText}
            onChange={(e) => setContent({...content, bodyText: e.target.value})}
            className="w-full p-4 bg-white border border-gray-100 rounded-xl text-gray-800 text-sm leading-relaxed placeholder-gray-200 focus:ring-2 focus:ring-blue-100 outline-none min-h-[160px] shadow-sm resize-none"
          />
        </div>
      </section>

      <button 
        onClick={handleGenerate}
        disabled={isLoading || !content.mainTitle}
        className="w-full xhs-bg-red text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] transition-all shadow-lg shadow-red-100 text-base"
      >
        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        {isLoading ? '正在生成美图...' : '开始生成图文'}
      </button>

      {/* Preview Section */}
      {slides.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              生成结果
            </h2>
            <button 
              onClick={handleDownloadAll}
              disabled={downloading}
              className="text-xs font-bold text-blue-600 flex items-center gap-1.5 bg-blue-50 px-4 py-2 rounded-xl active:scale-95 transition-all"
            >
              {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              打包下载
            </button>
          </div>

          <div className="flex overflow-x-auto gap-4 pb-4 snap-x px-1">
            {slides.map((slide, idx) => (
              <div key={idx} className="snap-center flex-shrink-0 w-[300px]">
                <div 
                  onClick={() => setPreviewIdx(idx)}
                  ref={el => { slideRefs.current[idx] = el; }}
                  className="bg-white shadow-2xl rounded-2xl overflow-hidden aspect-[3/4] relative border border-gray-100 cursor-zoom-in group"
                  style={{ backgroundColor: settings.bgColor }}
                >
                  <style dangerouslySetInnerHTML={{ __html: slide.css }} />
                  {bgImage && idx === 0 && (
                    <div className="absolute inset-0 z-0">
                      <img src={bgImage} className="w-full h-full object-cover" alt="Slide Bg" />
                      <div 
                        className="absolute inset-0 bg-black" 
                        style={{ opacity: settings.overlayOpacity / 100 }}
                      />
                    </div>
                  )}
                  <div 
                    className="w-full h-full p-8 flex flex-col justify-center items-center text-center overflow-hidden relative z-10"
                    style={{ 
                      color: settings.textColor,
                      fontFamily: settings.fontFamily,
                      fontSize: 'clamp(12px, 3vw, 18px)', // 响应式字体大小
                      maxHeight: '100%'
                    }}
                    dangerouslySetInnerHTML={{ __html: slide.html }} 
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <ZoomIn className="w-10 h-10 text-white drop-shadow-lg" />
                  </div>
                </div>
                <p className="mt-3 text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest">{slide.title}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full Screen Slide Preview Modal */}
      {previewIdx !== null && (
        <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4" onClick={() => setPreviewIdx(null)}>
          <div className="absolute top-6 right-6 flex gap-2 z-[70]">
            <button 
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
              onClick={(e) => { e.stopPropagation(); setPreviewIdx(null); }}
            >
              <X className="w-6 h-6" />
            </button>
            <button 
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
              onClick={async (e) => {
                e.stopPropagation();
                const slideContainer = document.querySelector('.scale-animation');
                if (slideContainer) {
                  try {
                    setIsDownloading(true);
                    // 使用captureElementAsImage函数捕获整个幻灯片容器
                    // 这个函数已经使用固定基础尺寸（600×800px），适合小红书3:4比例
                    const imageData = await captureElementAsImage(slideContainer as HTMLElement);
                    const link = document.createElement('a');
                    link.download = `slide-${previewIdx + 1}.png`;
                    link.href = imageData;
                    link.click();
                  } catch (error) {
                    console.error('Failed to download slide:', error);
                  } finally {
                    setIsDownloading(false);
                  }
                }
              }}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              )}
            </button>
          </div>
          
          <div 
            className="w-full max-w-[600px] aspect-[3/4] bg-white rounded-2xl shadow-2xl overflow-hidden relative scale-animation"
            style={{ backgroundColor: settings.bgColor }}
            onClick={(e) => e.stopPropagation()}
          >
            <style dangerouslySetInnerHTML={{ __html: slides[previewIdx].css }} />
            {bgImage && previewIdx === 0 && (
              <div className="absolute inset-0 z-0">
                <img src={bgImage} className="w-full h-full object-cover" alt="Full Slide Bg" />
                <div 
                  className="absolute inset-0 bg-black" 
                  style={{ opacity: settings.overlayOpacity / 100 }}
                />
              </div>
            )}
            <div 
              className="w-full h-full flex flex-col justify-center items-center text-center overflow-hidden relative z-10 slide-content"
              style={{ 
                color: settings.textColor,
                fontFamily: settings.fontFamily
              }}
              dangerouslySetInnerHTML={{ __html: slides[previewIdx].html }} 
            />
          </div>
          
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4">
             <button 
               disabled={previewIdx === 0}
               onClick={(e) => { e.stopPropagation(); setPreviewIdx(previewIdx - 1); }}
               className="px-4 py-2 bg-white/10 text-white rounded-xl disabled:opacity-30"
             >
               上一张
             </button>
             <span className="text-white font-bold">{previewIdx + 1} / {slides.length}</span>
             <button 
               disabled={previewIdx === slides.length - 1}
               onClick={(e) => { e.stopPropagation(); setPreviewIdx(previewIdx + 1); }}
               className="px-4 py-2 bg-white/10 text-white rounded-xl disabled:opacity-30"
             >
               下一张
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModuleContentImage;
