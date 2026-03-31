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
            - 核心风格：模仿老牌《大众健康》杂志封面，强调权威感与易读性。
            - 背景：使用接近纸张颜色 (#F4F1EA)，增加淡淡的灰色细边框 (border) 模拟纸张边缘感。
            - 布局逻辑：采用“左右分割”或“上下叠层”布局，内容尽量居中显示。
            - 标题设计：
              * 第一级：左上角使用深蓝色 (#1A365D) 超大加粗字体（建议 48px+）。
              * 标题下方：紧跟黑色的、具有冲击力的醒目文字，确保长辈一眼就能看清。
            - 副标题：使用深绿色 (#2D5A27) 背景色块，文字反白，增加“专家建议”的视觉权重。
            - 替代配图方案（由于无法生图，请执行以下逻辑）：
              * 使用 Emoji 组合模拟：在右侧区域使用巨大的心脏 Emoji (❤️/🫀) 或 放大镜 (🔍)，配合 CSS 动画（如简单的呼吸感）吸引注意。
              * 视觉引导：利用 CSS 绘制简单的箭头 (SVG 或 Border 技巧)，从嘴唇文字指向标题中的心脏关键词。
              * 警告色块：在原本插画的位置，改用一个带圆角的浅红色背景框 (#FFF5F5)，内部用超大字号显示核心警示词。
            - 正文排版：
              * 字体：优先使用衬线体（宋体/SimSun），字号不小于 22px，确保阅读不费力。
              * 交互感：关键数字（如 24小时、1次）使用亮橙色 (#E67E22) 加粗标注。
            - 底部栏：底部放置一个横跨全屏的浅灰色 (#F8F9FA) 边框栏，标明“牛知远感悟人生 | 2026/03”。
            - 尺寸约束：严格适配 600x800 静态容器，严禁出现滚动条，所有元素需通过 Flexbox 或 Grid 自动缩放。
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
      Generate 4-6 slides. 

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

    const response = await client.chat.completions.create({
      model: config.textModel,
      messages: [
        { 
          role: "system", 
          content: "You are a senior UI/UX engineer and Xiaohongshu expert. You always output valid, minified JSON objects without markdown blocks." 
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    const rawContent = response.choices[0].message.content || "{}";
    
    // 增加多重解析容错逻辑
    try {
      const parsed = JSON.parse(rawContent);
      const rawSlides = parsed.slides || [];
            // 容错处理：如果模型返回的是字符串数组，自动包装成对象格式
      return rawSlides.map((s: any) => {
        if (typeof s === 'string') {
          return {
            title: "自动生成标题",
            html: s,
            css: ""
          };
        }
        return s;
      });
    } catch (parseError) {
      console.warn("Standard JSON parse failed, attempting cleanup...");
      const cleanedContent = rawContent
        .replace(/^[^{]*/, '') // 移除前导杂质
        .replace(/[^}]*$/, ''); // 移除尾部杂质
      return JSON.parse(cleanedContent).slides;
    }
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

export const generateArticle = async (
  title: string,
  targetAudience: string,
  config: AppConfig
): Promise<string> => {
  try {
    const client = getDeepSeekClient(config);
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

    const response = await client.chat.completions.create({
      model: config.textModel,
      messages: [
        { role: "system", content: "You are a professional content writer specializing in creating engaging articles for various audiences." },
        { role: "user", content: prompt }
      ]
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Empty response from DeepSeek API");
    }

    return content;
  } catch (error) {
    return handleApiError(error);
  }
};