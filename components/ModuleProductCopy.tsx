
import React, { useState } from 'react';
import { 
  Upload, Copy, Check, Download, Loader2, Sparkles, 
  Trash2, Wand2, ShoppingCart, Tag, AlignLeft, Image as ImageIcon,
  Zap, Package, X, ZoomIn
} from 'lucide-react';
import { AppConfig, ProductCopyResult } from '../types';
import { fileToBase64, copyToClipboard, downloadAsZip } from '../utils';
import { generateProductCopy, generateAIBase64Image } from '../services';

interface ModuleProductCopyProps {
  config: AppConfig;
}

const ModuleProductCopy: React.FC<ModuleProductCopyProps> = ({ config }) => {
  const [productInfo, setProductInfo] = useState('可乐\n(英文: Cola)，是指有甜味、含咖啡因但不含乙醇的碳酸饮料。味包括有香草、肉桂、柠檬香味等。');
  const [productImages, setProductImages] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<ProductCopyResult | null>(null);
  const [aiImages, setAiImages] = useState<string[]>([]);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [imgCount, setImgCount] = useState(5);
  const [showTags, setShowTags] = useState(true);
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<string | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files: File[] = Array.from(e.target.files || []);
    const newImages = [...productImages];
    for (const file of files) {
      if (newImages.length >= 5) break;
      const base64 = await fileToBase64(file);
      newImages.push(base64);
    }
    setProductImages(newImages);
  };

  const handleGenerate = async () => {
    if (!productInfo.trim()) return;
    setIsGenerating(true);
    setResult(null);
    setAiImages([]);
    try {
      const copyResult = await generateProductCopy(productInfo, productImages, config);
      setResult(copyResult);
      
      setIsGeneratingImages(true);
      const newAiImages = [];
      const prompts = copyResult.suggestedImages.slice(0, imgCount);
      for (const prompt of prompts) {
        const img = await generateAIBase64Image(prompt + ", Xiaohongshu aesthetic, high quality, soft lighting", config);
        if (img) newAiImages.push(img);
      }
      setAiImages(newAiImages);
    } catch (error) {
      console.error(error);
      alert('生成失败');
    } finally {
      setIsGenerating(false);
      setIsGeneratingImages(false);
    }
  };

  const handleCopy = async (section: string, text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    }
  };

  const handleDownload = async () => {
    const allImages = [
      ...productImages.map((data, i) => ({ name: `product-${i + 1}.png`, data })), 
      ...aiImages.map((data, i) => ({ name: `ai-suggested-${i + 1}.png`, data }))
    ];
    await downloadAsZip(allImages, 'xhs-product-package');
  };

  const TAG_COLORS = [
    'bg-orange-50 text-orange-500',
    'bg-yellow-50 text-yellow-600',
    'bg-red-50 text-red-500',
    'bg-amber-50 text-amber-600',
    'bg-blue-50 text-blue-500',
    'bg-emerald-50 text-emerald-600',
  ];

  return (
    <div className="flex flex-col md:flex-row gap-6 items-start pb-20">
      {/* Left Column: Input & Controls */}
      <div className="w-full md:w-[380px] space-y-4 md:sticky md:top-20">
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4 border border-gray-100">
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
            <textarea 
              value={productInfo}
              onChange={(e) => setProductInfo(e.target.value)}
              placeholder="输入产品名称、卖点或一段介绍..."
              className="w-full bg-transparent text-sm text-gray-700 outline-none resize-none min-h-[120px]"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase">2. 上传参考图 ({productImages.length}/5)</span>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <div className="flex flex-wrap gap-2">
                {productImages.map((img, idx) => (
                  <div 
                    key={idx} 
                    className="w-16 h-16 rounded-lg overflow-hidden relative group border border-gray-200 cursor-pointer"
                    onClick={() => setSelectedPreviewImage(img)}
                  >
                    <img src={img} className="w-full h-full object-cover" />
                    <button 
                      onClick={(e) => { e.stopPropagation(); setProductImages(prev => prev.filter((_, i) => i !== idx)); }}
                      className="absolute top-0 right-0 p-1 bg-black/50 text-white rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {productImages.length < 5 && (
                  <label className="w-16 h-16 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-white hover:border-red-200 transition-all">
                    <Upload className="w-4 h-4 text-gray-300" />
                    <input type="file" multiple className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                )}
              </div>
              <button 
                onClick={() => setProductImages([])}
                className="mt-3 text-[10px] font-bold text-red-400 hover:text-red-500 flex items-center gap-1 px-1"
              >
                <Trash2 className="w-3 h-3" /> 清空所有
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between px-1">
             <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-gray-500">生成张数</span>
                <div className="flex items-center bg-gray-100 rounded-lg px-2 py-1">
                  <button onClick={() => setImgCount(Math.max(1, imgCount-1))} className="w-5 h-5 flex items-center justify-center text-gray-400">-</button>
                  <span className="w-6 text-center text-xs font-bold">{imgCount}</span>
                  <button onClick={() => setImgCount(Math.min(5, imgCount+1))} className="w-5 h-5 flex items-center justify-center text-gray-400">+</button>
                </div>
             </div>
             <div className="flex items-center gap-2">
                <Tag className="w-3 h-3 text-gray-400" />
                <span className="text-[10px] font-bold text-gray-500">卖点标注</span>
                <button 
                  onClick={() => setShowTags(!showTags)}
                  className={`w-8 h-4 rounded-full transition-colors relative ${showTags ? 'bg-red-500' : 'bg-gray-200'}`}
                >
                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${showTags ? 'left-4.5' : 'left-0.5'}`} />
                </button>
             </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={isGenerating || !productInfo.trim()}
            className="w-full xhs-bg-red text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition-all shadow-lg shadow-red-100"
          >
            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
            {isGenerating ? '正在生成...' : '一键生成种草笔记'}
          </button>
        </div>

        {aiImages.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-800 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-purple-500" />
                生成配图 ({aiImages.length})
              </h3>
              <button onClick={handleDownload} className="text-[10px] font-bold text-blue-500 flex items-center gap-1">
                <Package className="w-3.5 h-3.5" /> 打包图片
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {aiImages.map((img, idx) => (
                <div 
                  key={idx} 
                  className="aspect-[3/4] rounded-xl overflow-hidden shadow-sm relative group cursor-zoom-in"
                  onClick={() => setSelectedPreviewImage(img)}
                >
                  <img src={img} className="w-full h-full object-cover" />
                  <span className={`absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold text-white rounded-md shadow-sm ${idx === 2 ? 'bg-blue-500' : 'bg-red-400'}`}>
                    {idx === 2 ? '招图' : '种草'}
                  </span>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <ZoomIn className="w-8 h-8 text-white drop-shadow-md" />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 text-center">*点击图片预览，或悬浮单独下载</p>
          </div>
        )}
      </div>

      {/* Right Column: Generated Results */}
      <div className="flex-1 space-y-4 min-w-0">
        {!result && !isGenerating ? (
          <div className="h-[600px] flex flex-col items-center justify-center bg-white rounded-3xl border-2 border-dashed border-gray-100 text-gray-300">
            <Sparkles className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-sm font-medium">生成的结果将在这里显示</p>
          </div>
        ) : isGenerating ? (
          <div className="h-[600px] flex flex-col items-center justify-center bg-white rounded-3xl border border-gray-100">
             <div className="xhs-bg-red p-4 rounded-full mb-6 animate-pulse">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
             </div>
             <p className="font-bold text-gray-800">AI 正在疯狂创作中...</p>
             <p className="text-xs text-gray-400 mt-2">预计需要 15-30 秒，请稍等片刻</p>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-4">
            {/* Header */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-50 space-y-1 relative">
               <span className="bg-red-50 text-red-400 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">Product</span>
               <h2 className="text-3xl font-black text-gray-900">{result?.productName}</h2>
               <button 
                 onClick={() => handleCopy('header', result?.productName || '')}
                 className="absolute top-6 right-6 p-2 text-gray-300 hover:text-gray-600 transition-colors"
               >
                 {copiedSection === 'header' ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
               </button>
            </div>

            {/* Viral Title */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50 space-y-3 relative group">
              <div className="flex items-center gap-2 text-red-500 mb-1">
                <AlignLeft className="w-4 h-4" />
                <span className="text-xs font-bold">爆款标题</span>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="font-bold text-gray-800 text-base leading-relaxed">
                  {result?.title}
                </p>
              </div>
              <button 
                 onClick={() => handleCopy('title', result?.title || '')}
                 className="absolute top-5 right-5 p-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400"
               >
                 {copiedSection === 'title' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Selling Points */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50 space-y-4">
              <div className="flex items-center gap-2 text-gray-800">
                <ShoppingCart className="w-4 h-4" />
                <span className="text-xs font-bold">卖点提炼</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {result?.sellingPoints.map((point, idx) => (
                  <div 
                    key={idx} 
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm ${TAG_COLORS[idx % TAG_COLORS.length]}`}
                  >
                    <Sparkles className="w-3 h-3 opacity-60" />
                    {point}
                  </div>
                ))}
              </div>
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50 space-y-3 relative group">
              <div className="flex items-center gap-2 text-gray-800 mb-1">
                <AlignLeft className="w-4 h-4" />
                <span className="text-xs font-bold">正文内容</span>
              </div>
              <div className="bg-white rounded-xl p-1 border-l-4 border-red-100 pl-4">
                <p className="text-gray-700 text-sm whitespace-pre-wrap leading-loose">
                  {result?.content}
                </p>
              </div>
              <button 
                 onClick={() => handleCopy('content', result?.content || '')}
                 className="absolute top-5 right-5 p-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400"
               >
                 {copiedSection === 'content' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50 space-y-3">
              <div className="flex items-center gap-2 text-gray-800">
                <Tag className="w-4 h-4" />
                <span className="text-xs font-bold">推荐标签</span>
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-2">
                {result?.tags.map((tag, idx) => (
                  <span key={idx} className="text-blue-500 text-sm font-medium hover:underline cursor-pointer">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Full Screen Image Modal */}
      {selectedPreviewImage && (
        <div 
          className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setSelectedPreviewImage(null)}
        >
          <button 
            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-[70]"
            onClick={(e) => { e.stopPropagation(); setSelectedPreviewImage(null); }}
          >
            <X className="w-6 h-6" />
          </button>
          <img 
            src={selectedPreviewImage} 
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl scale-animation" 
            alt="Preview"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default ModuleProductCopy;
