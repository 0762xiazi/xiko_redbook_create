import { AppConfig, GeneratedSlide, ProductCopyResult } from "../types";

// 创建Minimax API客户端配置
const getMinimaxConfig = (config: AppConfig) => {
  return {
    apiKey: config.apiKey || import.meta.env.VITE_API_KEY || '',
    baseURL: 'https://api.minimaxi.com/v1'
  };
};

const handleApiError = async (error: any) => {
  console.error("Minimax API Error:", error);
  throw error;
};

// 自定义API调用函数
const callMinimaxAPI = async (endpoint: string, payload: any, config: AppConfig) => {
  const minimaxConfig = getMinimaxConfig(config);
  
  if (!minimaxConfig.apiKey) {
    throw new Error('Minimax API Key is required');
  }
  
  const response = await fetch(`${minimaxConfig.baseURL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${minimaxConfig.apiKey}`,
      'Content-Type': 'application/json'
      // 只包含必要的头，避免添加CORS不允许的头
    },
    body: JSON.stringify(payload)
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Minimax API request failed with status: ${response.status}, message: ${errorData.error?.message || 'Unknown error'}`);
  }
  
  return await response.json();
};

export const analyzeAndGenerateSlides = async (
  refImageBase64: string | null,
  text: string,
  config: AppConfig
): Promise<GeneratedSlide[]> => {
  try {
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
    `;
    
    // 检查文本中是否包含风格信息
    if (text.includes('Style: ')) {
      const styleMatch = text.match(/Style: ([\w-]+)/);
      if (styleMatch && styleMatch[1]) {
        const styleId = styleMatch[1];
        
        // 根据风格ID生成相应的样式指南
        if (styleId === 'classic-newspaper') {
          styleGuide = `
            Style Guide:
            - 模仿90年代经典报纸健康专栏的科普图文设计
            - 背景：使用本地文件 e:/workspace/AI about/xiaohongshu-ai-creator/bg_svg/paper_bg.svg 作为背景，这是一个微微泛黄的粗糙宣纸纹理背景
            - 布局：顶部是粗重的双横线作为页眉边框，中间有醒目的标题块，下方内容采用双栏排版
            - 标题（第一级）：最顶部是一个正红色的实心标题矩形块，里面反白显示粗黑体字："健康头条"。下方是黑色超大字号、加粗、稍扁平的黑体字
            - 副标题（第二级）：使用稍小的宋体加粗字体，前面带有一个写实的医学显微镜图标
            - 正文（第三级）：使用清晰易读的中宋体，增加行距，分为两段，分别放在两栏中
            - 底部栏：一个深蓝色的横条，左侧是带体积感的医生真实头像图标及文字，右侧是带投影的日历图标及日期
            - 界面适配：所有内容必须适配在600*800的界面中，不能超出界面范围，不支持滚动
            - 布局调整：根据600*800的尺寸合理调整字体大小、间距和布局，确保所有内容都能在一个屏幕内完整显示
          `;
        } else if (styleId === 'health-warning') {
          styleGuide = `
            Style Guide:
            - 具有极大视觉冲击力的健康警示特刊头条设计
            - 背景：采用纯黄色的高对比度背景，外圈有厚实的黑色边框
            - 布局：核心内容被一个巨大的红色斜角矩形框（警示牌形状）框住
            - 标题（第一级）：巨大的、稍有立体感的斜向文字，使用了黑底白字和红底白字的组合
            - 副标题（第二级）：在一个黑色对话框内，使用鲜明的黄色警示图标
            - 正文（第三级）：在中央的白底色块中，使用大号的黑体字，关键短语加粗并改变为红色或黄色背景突显
            - 底部栏：底部有一个深灰色的横条，模仿报纸的版权和日期栏，字体粗而清晰
            - 界面适配：所有内容必须适配在600*800的界面中，不能超出界面范围，不支持滚动
            - 布局调整：根据600*800的尺寸合理调整字体大小、间距和布局，确保所有内容都能在一个屏幕内完整显示
          `;
        } else if (styleId === 'magazine-cover') {
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
        }
      }
    }
    
    const prompt = `
      Analyze the provided reference image (if any) for style, layout, typography, and color palette. 
      Then, create a series of 3-5 high-quality Xiaohongshu-style content slides based on this text: "${text}".
      
      The response MUST be a JSON array of objects. Each object represents a slide and has:
      - title: A short description of the slide.
      - html: The HTML structure of the slide (use inline Tailwind classes where possible or simple divs).
      - css: Any extra CSS needed (wrap it in a single string).
      
      ${styleGuide}
    `;

    const payload = {
      model: "MiniMax-M2.7",
      max_tokens: 4000,
      system: "You are a professional Xiaohongshu content creator and web designer.",
      messages: [
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": prompt
            }
          ]
        }
      ]
    };

    const message = await callMinimaxAPI('/chat/completions', payload, config);

    if (!message.choices || message.choices.length === 0) {
      throw new Error("Empty response from Minimax API");
    }

    const content = message.choices[0].message?.content;
    if (!content) {
      throw new Error("Empty content from Minimax API");
    }

    return content;
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

    const payload = {
      model: "MiniMax-M2.7",
      max_tokens: 4000,
      system: "You are a professional Xiaohongshu content creator specializing in product recommendations.",
      messages: [
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": prompt
            }
          ]
        }
      ]
    };

    const message = await callMinimaxAPI('/chat/completions', payload, config);

    if (!message.choices || message.choices.length === 0) {
      throw new Error("Empty response from Minimax API");
    }

    const content = message.choices[0].message?.content;
    if (!content) {
      throw new Error("Empty content from Minimax API");
    }

    return content;
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

    const payload = {
      model: "MiniMax-M2.7",
      max_tokens: 4000,
      system: "You are a professional content writer specializing in creating engaging articles for various audiences.",
      messages: [
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": prompt
            }
          ]
        }
      ]
    };

    const message = await callMinimaxAPI('/chat/completions', payload, config);

    if (!message.choices || message.choices.length === 0) {
      throw new Error("Empty response from Minimax API");
    }

    const content = message.choices[0].message?.content;
    if (!content) {
      throw new Error("Empty content from Minimax API");
    }

    return content;
  } catch (error) {
    return handleApiError(error);
  }
};
