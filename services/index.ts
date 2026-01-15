import { AppConfig, GeneratedSlide, ImageGenerationRequest, ProductCopyResult } from '../types';
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
  request: ImageGenerationRequest,
  config: AppConfig
): Promise<string> => {
  // 根据imageModel判断使用哪个服务
  if (config.imageModel?.startsWith('deepseek-')) {
    return await deepseekGenerateAIBase64Image(request, config);
  } else {
    // 默认使用Gemini服务
    return await geminiGenerateAIBase64Image(request, config);
  }
};