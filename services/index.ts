import { AppConfig, GeneratedSlide, ProductCopyResult } from '../types';
import { analyzeAndGenerateSlides as geminiAnalyzeAndGenerateSlides, generateProductCopy as geminiGenerateProductCopy, generateAIBase64Image as geminiGenerateAIBase64Image, generateArticle as geminiGenerateArticle } from './gemini';
import { analyzeAndGenerateSlides as deepseekAnalyzeAndGenerateSlides, generateProductCopy as deepseekGenerateProductCopy, generateAIBase64Image as deepseekGenerateAIBase64Image, generateArticle as deepseekGenerateArticle } from './deepseek';
import { generateAIBase64Image as minimaxGenerateAIBase64Image } from './minimax';
import { analyzeAndGenerateSlides as minimaxAnalyzeAndGenerateSlides, generateProductCopy as minimaxGenerateProductCopy, generateArticle as minimaxGenerateArticle } from './minimax-text';

// 根据配置选择对应的AI服务
export const analyzeAndGenerateSlides = async (
  image: string | null,
  text: string,
  config: AppConfig
): Promise<GeneratedSlide[]> => {
  // 根据textModel判断使用哪个服务
  if (config.textModel?.startsWith('deepseek-')) {
    return await deepseekAnalyzeAndGenerateSlides(image, text, config);
  } else if (config.textModel?.startsWith('minimax-')) {
    return await minimaxAnalyzeAndGenerateSlides(image, text, config);
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
  } else if (config.textModel?.startsWith('minimax-')) {
    return await minimaxGenerateProductCopy(productInfo, productImages, config);
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
  } else if (config.imageModel?.startsWith('minimax-')) {
    return await minimaxGenerateAIBase64Image(prompt, config);
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
  // 根据textModel判断使用哪个服务
  if (config.textModel?.startsWith('deepseek-')) {
    return await deepseekGenerateArticle(title, targetAudience, config);
  } else if (config.textModel?.startsWith('minimax-')) {
    return await minimaxGenerateArticle(title, targetAudience, config);
  } else {
    // 默认使用Gemini服务
    return await geminiGenerateArticle(title, targetAudience, config);
  }
};