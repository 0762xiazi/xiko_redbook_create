import OpenAI from "openai";
import { AppConfig, GeneratedSlide, ProductCopyResult } from "../types";

// 创建 DeepSeek OpenAI 实例
const getDeepSeekClient = (config: AppConfig) => {
  const options: any = { 
    apiKey: config.apiKey || process.env.API_KEY,
    baseURL: 'https://api.deepseek.com', // DeepSeek API base URL
    dangerouslyAllowBrowser: true // 允许在浏览器环境中运行
  };
  return new OpenAI(options);
};

const handleApiError = async (error: any) => {
  console.error("DeepSeek API Error:", error);
  throw error;
};

export const analyzeAndGenerateSlides = async (
  refImageBase64: string | null,
  text: string,
  config: AppConfig
): Promise<GeneratedSlide[]> => {
  try {
    const client = getDeepSeekClient(config);
    const prompt = `
      Analyze the provided reference image (if any) for style, layout, typography, and color palette. 
      Then, create a series of 3-5 high-quality Xiaohongshu-style content slides based on this text: "${text}".
      
      The response MUST be a JSON array of objects. Each object represents a slide and has:
      - title: A short description of the slide.
      - html: The HTML structure of the slide (use inline Tailwind classes where possible or simple divs).
      - css: Any extra CSS needed (wrap it in a single string).
      
      Style Guide:
      - Modern, clean, aesthetically pleasing.
      - Use bold headings, emojis, and clear call-to-actions.
      - Layout should be portrait (ideal for mobile).
      - For text elements with background colors, use inline-flex with items-center and justify-center to ensure horizontal and vertical centering.
      - Example for highlighted text: <span class="inline-flex items-center justify-center bg-red-500 text-white px-2 py-1 rounded">Important Text</span>
    `;

    const response = await client.chat.completions.create({
      model: config.textModel,
      messages: [
        { role: "system", content: "You are a professional Xiaohongshu content creator and web designer." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Empty response from DeepSeek API");
    }

    return JSON.parse(content);
  } catch (error) {
    return handleApiError(error);
  }
};

export const generateProductCopy = async (
  productInfo: string,
  productImages: string[],
  config: AppConfig
): Promise<ProductCopyResult> => {
  try {
    const client = getDeepSeekClient(config);
    const prompt = `
      Generate a high-conversion Xiaohongshu (Red) product recommendation ("Zhongcao") post for: "${productInfo}".
      The post should include:
      1. productName: A short 2-4 word product name.
      2. title: A catchy, emoji-rich viral title.
      3. content: Engaging body text with personal tone and emojis.
      4. sellingPoints: A list of 4-6 key selling point tags.
      5. tags: 8-10 relevant hashtags starting with #.
      6. suggestedImages: 5 high-quality visual descriptions for AI image generation.
      
      Response MUST be JSON.
    `;

    const response = await client.chat.completions.create({
      model: config.textModel,
      messages: [
        { role: "system", content: "You are a professional Xiaohongshu content creator specializing in product recommendations." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Empty response from DeepSeek API");
    }

    return JSON.parse(content);
  } catch (error) {
    return handleApiError(error);
  }
};

export const generateAIBase64Image = async (prompt: string, config: AppConfig): Promise<string> => {
  try {
    // DeepSeek API doesn't support image generation directly yet,
    // so we'll use a placeholder implementation
    console.warn("DeepSeek image generation not supported yet");
    return "";
  } catch (error) {
    return handleApiError(error);
  }
};