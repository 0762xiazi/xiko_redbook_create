import { AppConfig, WechatArticleResult } from '../types';

// 创建Dify API客户端配置
const getDifyConfig = (config: AppConfig) => {
  return {
    apiKey: config.difyApiKey || import.meta.env.VITE_DIFY_API_KEY || '',
    baseURL: 'https://api.dify.ai/v1'
  };
};

const handleApiError = async (error: any) => {
  console.error("Dify API Error:", error);
  throw error;
};

// 轮询获取工作流执行状态
const pollWorkflowStatus = async (
  workflowRunId: string,
  config: AppConfig,
  maxRetries: number = 20,
  intervalMs: number = 15000
): Promise<any> => {
  const difyConfig = getDifyConfig(config);
  
  for (let retry = 0; retry < maxRetries; retry++) {
    try {
      const response = await fetch(`${difyConfig.baseURL}/workflows/run/${workflowRunId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${difyConfig.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Dify API request failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // 如果工作流已完成
      if (data.status === 'succeeded') {
        return data;
      }
      
      // 如果工作流失败
      if (data.status === 'failed') {
        throw new Error(`Workflow execution failed: ${data.error || 'Unknown error'}`);
      }
      
      // 等待一段时间后继续轮询
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    } catch (error) {
      return handleApiError(error);
    }
  }
  
  throw new Error('Workflow execution timeout');
};

export const generateWechatArticle = async (
  topic: string,
  config: AppConfig
): Promise<WechatArticleResult> => {
  try {
    const difyConfig = getDifyConfig(config);
    
    if (!difyConfig.apiKey) {
      throw new Error('Dify API Key is required');
    }
    
    // 1. 启动工作流（流式响应模式）
    const response = await fetch(`${difyConfig.baseURL}/workflows/run`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${difyConfig.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs : { 
          user_input: topic // 根据API错误信息，需要使用user_input作为参数名
        },
        response_mode: 'streaming', // 使用流式响应模式
        user: 'xhs-creator-user' // 用户标识
      })
    });
    
    if (!response.ok) {
      throw new Error(`Dify API request failed with status: ${response.status}`);
    }
    
    // 2. 处理SSE流式响应
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    
    // 用于存储最终结果
    let finalResult: any = null;
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // 剩下半行留给下次
      
      for (const line of lines) {
        if (!line.startsWith('data:')) continue;
        
        const dataStr = line.replace(/^data:\s*/, '').trim();
        if (!dataStr || dataStr === '[DONE]') continue;
        
        try {
          const data = JSON.parse(dataStr);
          console.log('SSE data:', data);
          
          // 检查是否是最终结果
          if (data.event === 'workflow_finished') {
            finalResult = data.data.outputs;
          } else if (data.event === 'workflow_execution_failed') {
            throw new Error(`Workflow execution failed: ${data.data?.error || 'Unknown error'}`);
          }
        } catch (e) {
          console.warn('JSON parse failed:', dataStr);
        }
      }
    }
    
    if (!finalResult) {
      throw new Error('No workflow result received from streaming response');
    }
    
    // 处理工作流结果
    // 1. 提取HTML代码（从```html开始到```结束）
    const extractHtmlCode = (content: string): string => {
      const htmlRegex = /```html\n([\s\S]*?)\n```/;
      const match = content.match(htmlRegex);
      return match ? match[1] : content;
    };
    
    // 2. 获取封面图片URL（从数组中获取第一个元素的remote_url）
    const getCoverImageUrl = (coverImageArray: any[]): string => {
      if (Array.isArray(coverImageArray) && coverImageArray.length > 0) {
        return coverImageArray[0].remote_url || '';
      }
      return '';
    };
    
    const result: WechatArticleResult = {
      title: finalResult?.article_info || '微信公众号推文',
      coverImage: getCoverImageUrl(finalResult?.banner_src || []),
      htmlContent: extractHtmlCode(finalResult?.code || ''),
      tags: finalResult?.tags || []
    };
    
    return result;
  } catch (error) {
    return handleApiError(error);
  }
};