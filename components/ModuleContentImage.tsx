
import React, { useState, useRef } from 'react';
import { 
  Upload, Trash2, Send, Download, Loader2, 
  CheckCircle2, Type as TypeIcon, Sliders, 
  Layers, Palette, ChevronRight, X, ZoomIn
} from 'lucide-react';
import { AppConfig, GeneratedSlide, SlideStyle, EditorSettings, EditorContent } from '../types';
import { fileToBase64, captureElement, downloadAsZip } from '../utils';
import { analyzeAndGenerateSlides } from '../services/gemini';

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
}

const ModuleContentImage: React.FC<ModuleContentImageProps> = ({ config }) => {
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
    mainTitle: '最最重要的任务永远只有一个',
    dateStr: 'VOL.01 | 2025',
    author: '阿星',
    bodyText: '第82天 | 李笑来：最最重要的任务永远只有一个《把时间当作朋友》\n\n判断一件事是否真的重要，标准只有一个：是否对目标（无论是长期还是短期）的实现有益。',
  });

  const [bgImage, setBgImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [slides, setSlides] = useState<GeneratedSlide[]>([]);
  const [downloading, setDownloading] = useState(false);
  const [previewIdx, setPreviewIdx] = useState<number | null>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      setBgImage(base64);
    }
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const fullText = `Title: ${content.mainTitle}\nContext: ${content.dateStr}\nAuthor: ${content.author}\nBody: ${content.bodyText}\nStyle: ${settings.style}`;
      const result = await analyzeAndGenerateSlides(bgImage, fullText, config);
      setSlides(result);
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
      for (let i = 0; i < slides.length; i++) {
        const el = slideRefs.current[i];
        if (el) {
          const imgData = await captureElement(el);
          capturedImages.push({ name: `slide-${i + 1}.png`, data: imgData });
        }
      }
      await downloadAsZip(capturedImages, 'xhs-content-package');
    } catch (error) {
      console.error(error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
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
                      fontFamily: settings.fontFamily
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
          <button 
            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-[70]"
            onClick={(e) => { e.stopPropagation(); setPreviewIdx(null); }}
          >
            <X className="w-6 h-6" />
          </button>
          
          <div 
            className="w-full max-w-[450px] aspect-[3/4] bg-white rounded-2xl shadow-2xl overflow-hidden relative scale-animation"
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
              className="w-full h-full p-10 flex flex-col justify-center items-center text-center overflow-hidden relative z-10"
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
