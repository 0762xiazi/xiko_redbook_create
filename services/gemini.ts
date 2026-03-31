
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
    
    // 解析文本，提取风格信息
    let styleGuide = `
      Style Guide:
      - Modern, clean, aesthetically pleasing.
      - Use bold headings, emojis, and clear call-to-actions.
      - Layout should be portrait (ideal for mobile).
      - Height should be adaptive to content, ensuring the entire slide is visible without scrolling.
      - If min-height is used, it should be set to 800px to ensure sufficient vertical space.
      - For text elements with background colors, use inline-flex with items-center and justify-center to ensure horizontal and vertical centering.
      - Example for highlighted text: <span class="inline-flex items-center justify-center bg-red-500 text-white px-2 py-1 rounded">Important Text</span>
      - Portrait Layout: Fixed 600x800, no overflow, no scrolling.
    `;
    
    // 检查文本中是否包含风格信息
    console.log('Checking for style information in text:', text.includes('Style: '));
    if (text.includes('Style: ')) {
      console.log('Text contains style information');
      const styleMatch = text.match(/Style: ([\w-]+)/);
      console.log('Style match result:', styleMatch);
      if (styleMatch && styleMatch[1]) {
        const styleId = styleMatch[1];
        console.log('Extracted style ID:', styleId);
        
        // 根据风格ID生成相应的样式指南
        if (styleId === 'classic-newspaper') {
          console.log('Using classic-newspaper style guide');
          styleGuide += `
        Specific Style: 90s Classic Health Newspaper.
        - Colors: Background #F4F1EA, Accent #B22222 (Deep Red).
        - Large Fonts: Primary text must be at least 20px, headings 40px+.
        - Clear Hierarchy: Use bold lines and solid color blocks to separate sections
        - Layout: 2-column text body, bold double-line borders for header.
        - Typography: Use bold serif fonts for titles.
      `;
        } else if (styleId === 'health-warning') {
          console.log('Using health-warning style guide');
          styleGuide += `
        Specific Style: High-Impact Warning Special.
        - Colors: Bright yellow background (#FFD700), heavy black borders.
        - Large Fonts: Primary text must be at least 20px, headings 40px+.
        - Clear Hierarchy: Use bold lines and solid color blocks to separate sections
        - Elements: Large red caution boxes, heavy blocky text.
      `;
        } else if (styleId === 'magazine-cover') {
          console.log('Using magazine-cover style guide');
          styleGuide = `
            Style Guide:
            - 模仿老牌《大众健康》杂志封面的科普设计
            - 背景：纯白背景，具有干净的纸张质感
            - 布局：左侧是文字区，右侧是一个巨大的、具象的写实插画
            - 标题（第一级）：左上角是大字号、深蓝色的艺术字体标题，下方是黑色的、醒目的标题文字
            - 副标题（第二级）：标题下方，用醒目的深绿色加粗文字
            - 配图：右侧是一个写实的、具象的人体心脏和血管示意图，清晰展示心脏与循环系统的连接。旁边带有一个放大镜图标，聚焦在一个呈明显紫色的嘴唇特写上，并有箭头指向心脏
            - 正文（第三级）：在配图下方或左侧文字区，用清晰的宋体排列原正文，关键数字和短语用粗体标出
            - 底部栏：底部是干净的版权和日期
            - 界面适配：所有内容必须适配在600*800的界面中，不能超出界面范围，不支持滚动
            - 布局调整：根据600*800的尺寸合理调整字体大小、间距和布局，确保所有内容都能在一个屏幕内完整显示
          `;
        } else {
          console.log('Unknown style ID:', styleId);
        }
      } else {
        console.log('No style ID found in text');
      }
    } else {
      console.log('Text does not contain style information');
    }
    
    console.log('Final style guide:', styleGuide);
    
     const prompt = `
      Analyze the text: "${text}".
      Generate 3-5 slides. 

      STRICT OUTPUT FORMAT:
      You MUST return a JSON object with this EXACT structure:
      {
        "slides": [
          {
            "title": "Slide Title",
            "html": "<div class='...'>Slide Content</div>",
            "css": ""
          }
        ]
      }

      CRITICAL RULES:
      1. The "html" field MUST be a string containing the full Tailwind HTML.
      2. DO NOT return a simple string array. Each slide MUST be an object.
      3. Use single quotes (') for all HTML attributes (e.g., class='...') to avoid double-quote escape issues.
      4. Ensure all content fits in 600x800.
      
      ${styleGuide}
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

export const generateArticle = async (
  title: string,
  targetAudience: string,
  config: AppConfig
): Promise<string> => {
  try {
    const ai = getGeminiClient(config);
    const prompt = `
      Generate a comprehensive, engaging article based on the following title and target audience:
      
      Title: ${title}
      Target Audience: ${targetAudience}
      
      The article should:
      1. Be well-structured with clear headings and subheadings
      2. Be engaging and relevant to the target audience
      3. Include practical insights and actionable advice
      4. Have a natural, conversational tone
      5. Be comprehensive enough to provide real value
      6. Use appropriate formatting with headings (#, ##, etc.)
      7. Include emojis where appropriate to enhance readability
      
      The response should be the full article content as a single string, without any JSON formatting.
    `;

    const response = await ai.models.generateContent({
      model: config.textModel,
      contents: { parts: [{ text: prompt }] }
    });

    return response.text || "";
  } catch (error) {
    return handleApiError(error);
  }
};
