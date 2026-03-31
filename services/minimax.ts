import { AppConfig } from '../types';

const handleApiError = async (error: any) => {
  console.error("Minimax API Error:", error);
  throw error;
};

// 创建Minimax API客户端配置
const getMinimaxConfig = (config: AppConfig) => {
  return {
    apiKey: config.apiKey || import.meta.env.VITE_API_KEY || '',
    baseURL: 'https://api.minimaxi.com/v1'
  };
};

export const generateAIBase64Image = async (prompt: string, config: AppConfig): Promise<string> => {
  try {
    const minimaxConfig = getMinimaxConfig(config);
    
    if (!minimaxConfig.apiKey) {
      throw new Error('Minimax API Key is required');
    }
    
    // 调用Minimax图像生成API
    const response = await fetch(`${minimaxConfig.baseURL}/image_generation`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${minimaxConfig.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "image-01",
        prompt: prompt,
        aspect_ratio: "16:9",
        response_format: "url",
        n: 3,
        prompt_optimizer: true
      })
    });
    
    if (!response.ok) {
      throw new Error(`Minimax API request failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // 检查响应结构并返回第一个图像的URL
    if (data.data && data.data.length > 0) {
      const imageUrl = data.data[0].url;
      
      // 将URL转换为base64
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch generated image: ${imageResponse.status}`);
      }
      
      const blob = await imageResponse.blob();
      const reader = new FileReader();
      
      return new Promise((resolve, reject) => {
        reader.onloadend = () => {
          const base64data = reader.result as string;
          resolve(base64data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } else {
      throw new Error('No images generated');
    }
  } catch (error) {
    return handleApiError(error);
  }
};
