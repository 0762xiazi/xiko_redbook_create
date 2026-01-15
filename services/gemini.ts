
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { AppConfig, GeneratedSlide, ProductCopyResult } from "../types";

// 创建 GoogleGenAI 实例，优先使用环境变量中的 API_KEY，支持传入自定义 baseUrl
export const getGeminiClient = (config: AppConfig) => {
  const options: any = { apiKey: config.apiKey || process.env.API_KEY };
  if (config.baseUrl) {
    options.baseUrl = config.baseUrl;
  }
  return new GoogleGenAI(options);
};

const handleApiError = async (error: any) => {
  if (error?.message?.includes("Requested entity was not found.") || error?.status === 404) {
    if (typeof window !== 'undefined' && (window as any).aistudio) {
      await (window as any).aistudio.openSelectKey();
    }
  }
  throw error;
};

export const analyzeAndGenerateSlides = async (
  refImageBase64: string | null,
  text: string,
  config: AppConfig
): Promise<GeneratedSlide[]> => {
  try {
    const ai = getGeminiClient(config);
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

    const parts: any[] = [{ text: prompt }];
    if (refImageBase64) {
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: refImageBase64.split(',')[1] || refImageBase64
        }
      });
    }

    const response = await ai.models.generateContent({
      model: config.textModel,
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              html: { type: Type.STRING },
              css: { type: Type.STRING }
            },
            required: ["title", "html", "css"]
          }
        }
      }
    });

    return JSON.parse(response.text || "[]");
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
    const ai = getGeminiClient(config);
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

    const parts: any[] = [{ text: prompt }];
    productImages.forEach(img => {
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: img.split(',')[1] || img
        }
      });
    });

    const response = await ai.models.generateContent({
      model: config.textModel,
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            productName: { type: Type.STRING },
            title: { type: Type.STRING },
            content: { type: Type.STRING },
            sellingPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestedImages: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["productName", "title", "content", "sellingPoints", "tags", "suggestedImages"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    return handleApiError(error);
  }
};

export const generateAIBase64Image = async (prompt: string, config: AppConfig): Promise<string> => {
  try {
    const ai = getGeminiClient(config);
    const response = await ai.models.generateContent({
      model: config.imageModel,
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: { aspectRatio: "3:4" }
      }
    });

    let base64 = "";
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          base64 = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }
    }
    return base64;
  } catch (error) {
    return handleApiError(error);
  }
};
