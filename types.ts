
export interface AppConfig {
  textModel: string;
  imageModel: string;
  baseUrl?: string;
  // 注意：API Key 由平台通过 process.env.API_KEY 提供，本应用通过 aistudio 接口引导用户选择
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

export enum ActiveModule {
  CONTENT_IMAGE = 'CONTENT_IMAGE',
  PRODUCT_COPY = 'PRODUCT_COPY'
}
