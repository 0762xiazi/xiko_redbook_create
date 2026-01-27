
export interface AppConfig {
  textModel: string;
  imageModel: string;
  baseUrl?: string;
  apiKey?: string;
  difyApiKey?: string;
  // 支持直接配置API Key，优先级高于环境变量
}

export interface GeneratedSlide {
  html: string;
  css: string;
  title: string;
}

export interface SlideStyle {
  id: string;
  name: string;
  bg: string;
  color: string;
  emoji: string;
}

export interface EditorSettings {
  style: string;
  fontFamily: string;
  titleSize: number;
  contentSize: number;
  bgColor: string;
  textColor: string;
  overlayOpacity: number;
}

export interface EditorContent {
  mainTitle: string;
  dateStr: string;
  author: string;
  bodyText: string;
}

export interface ProductCopyResult {
  productName: string;
  title: string;
  content: string;
  sellingPoints: string[];
  tags: string[];
  suggestedImages: string[];
}

// 微信公众号推文结果接口
export interface WechatArticleResult {
  title: string;
  coverImage: string;
  htmlContent: string;
  tags: string[];
}

export enum ActiveModule {
  CONTENT_IMAGE = 'CONTENT_IMAGE',
  PRODUCT_COPY = 'PRODUCT_COPY',
  WECHAT_ARTICLE = 'WECHAT_ARTICLE', // 新增微信公众号推文模块
  ARTICLE_GENERATOR = 'ARTICLE_GENERATOR' // 新增文章生成模块
}
