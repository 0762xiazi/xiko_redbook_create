import { AppConfig, GeneratedSlide, ProductCopyResult } from '../types';
import { analyzeAndGenerateSlides as geminiAnalyzeAndGenerateSlides, generateProductCopy as geminiGenerateProductCopy, generateAIBase64Image as geminiGenerateAIBase64Image } from './gemini';
import { analyzeAndGenerateSlides as deepseekAnalyzeAndGenerateSlides, generateProductCopy as deepseekGenerateProductCopy, generateAIBase64Image as deepseekGenerateAIBase64Image } from './deepseek';

// 根据配置选择对应的AI服务
export const analyzeAndGenerateSlides = async (
  image: string | null,
  text: string,
  config: AppConfig
): Promise<GeneratedSlide[]> => {
  // 根据textModel判断使用哪个服务
  if (config.textModel?.startsWith('deepseek-')) {
    return await deepseekAnalyzeAndGenerateSlides(image, text, config);
  } else {
    // 默认使用Gemini服务
    return await geminiAnalyzeAndGenerateSlides(image, text, config);
  }
};

export const generateProductCopy = async (
  productInfo: string,
  productImages: string[],
  config: AppConfig
): Promise<ProductCopyResult> => {
  // 根据textModel判断使用哪个服务
  if (config.textModel?.startsWith('deepseek-')) {
    return await deepseekGenerateProductCopy(productInfo, productImages, config);
  } else {
    // 默认使用Gemini服务
    return await geminiGenerateProductCopy(productInfo, productImages, config);
  }
};

export const generateAIBase64Image = async (
  prompt: string,
  config: AppConfig
): Promise<string> => {
  // 根据imageModel判断使用哪个服务
  if (config.imageModel?.startsWith('deepseek-')) {
    return await deepseekGenerateAIBase64Image(prompt, config);
  } else {
    // 默认使用Gemini服务
    return await geminiGenerateAIBase64Image(prompt, config);
  }
};

export const generateArticle = async (
  title: string,
  targetAudience: string,
  config: AppConfig
): Promise<string> => {
  // 导入对应的服务函数
  const { generateArticle: geminiGenerateArticle } = await import('./gemini');
  const { generateArticle: deepseekGenerateArticle } = await import('./deepseek');
  
  // 根据textModel判断使用哪个服务
  if (config.textModel?.startsWith('deepseek-')) {
    return await deepseekGenerateArticle(title, targetAudience, config);
  } else {
    // 默认使用Gemini服务
    return await geminiGenerateArticle(title, targetAudience, config);
  }
};