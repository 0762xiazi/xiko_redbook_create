
declare const html2canvas: any;
declare const JSZip: any;
declare const saveAs: any;
import { toPng } from 'html-to-image'

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export const captureElementAsImage = async (element: HTMLElement, scale: number = 3): Promise<string> => {
  // 定义基础尺寸（3:4比例，适合小红书）
  const baseWidth = 600;
  const baseHeight = 800;
  // 定义你想要的“导出高清尺寸”（小红书尺寸）
  const targetWidth = 1242;
  const targetHeight = 1656;
  const ratio = targetWidth / baseWidth;
  
  // 保存元素的原始样式
  const originalWidth = element.style.width;
  const originalHeight = element.style.height;
  const originalOverflow = element.style.overflow;
  const originalVisibility = element.style.visibility;
  const originalOpacity = element.style.opacity;
  
  // 确保元素在截图时是可见的，并且内容不被裁剪
  element.style.visibility = 'visible';
  element.style.opacity = '1';
  element.style.overflow = 'visible';
  
  try {
    // 确保元素在截图前已经渲染完成
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // 尝试使用html-to-image的toPng方法，提高分辨率
    const canvas = await toPng(element, { 
      quality: 1.0, // 确保最高质量
      skipAutoScale: false, // 启用自动缩放
      skipFonts: false, // 保留字体渲染
      pixelRatio: ratio, // 设置像素比例
      cacheBust: true, // 添加随机参数到URL，避免缓存问题
      backgroundColor: element.style.backgroundColor || '#ffffff', // 使用元素的背景色
      width: baseWidth, // 设置基础宽度
      height: baseHeight, // 设置基础高度
      // 只设置输出宽高，确保最终生成的 Canvas 是高清尺寸
      canvasWidth: targetWidth,
      canvasHeight: targetHeight,
      // 确保内容不被裁剪
      style: {
        visibility: 'visible',
        opacity: '1',
        overflow: 'visible',
        transform: 'scale(1)',
        transformOrigin: 'top left',
      }
    })
    return canvas;
  } catch (error) {
    console.error('html-to-image failed, falling back to html2canvas:', error);
    
    // 回退到使用html2canvas，同样设置高分辨率
    const clone = element.cloneNode(true) as HTMLElement;
    
    // 设置克隆元素的样式
    clone.style.position = 'absolute';
    clone.style.left = '-9999px';
    clone.style.top = '-9999px';
    clone.style.zIndex = '9999';
    clone.style.width = `${baseWidth}px`;
    clone.style.height = `${baseHeight}px`;
    clone.style.overflow = 'visible'; // 确保内容不被裁剪
    clone.style.backgroundColor = element.style.backgroundColor || '#ffffff';
    
    // 应用样式修复
    const fixStylesForHtml2Canvas = (el: HTMLElement) => {
      const itemsCenterElements = el.querySelectorAll('.items-center');
      itemsCenterElements.forEach((element) => {
        (element as HTMLElement).style.verticalAlign = 'middle';
        (element as HTMLElement).style.position = 'relative';
        (element as HTMLElement).style.top = '8px';
      });
    };
    
    fixStylesForHtml2Canvas(clone);
    
    // 添加到DOM
    document.body.appendChild(clone);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const computedStyle = window.getComputedStyle(clone);
      const bgColor = computedStyle.backgroundColor === 'rgba(0, 0, 0, 0)' ? '#ffffff' : computedStyle.backgroundColor;
      
      // 使用html2canvas并设置高缩放比例
      const canvas = await html2canvas(clone, {
        useCORS: true,
        scale: scale, // 提高缩放比例，生成高分辨率图片
        logging: false,
        backgroundColor: bgColor,
        width: baseWidth,
        height: baseHeight,
        windowWidth: baseWidth,
        windowHeight: baseHeight,
        allowTaint: true,
        useForeignObject: true,
        letterRendering: true,
        shadowBlur: 0,
        preserveDrawingBuffer: true,
        scrollX: 0,
        scrollY: 0
      });
      
      return canvas.toDataURL('image/png');
    } finally {
      document.body.removeChild(clone);
    }
  } finally {
    // 恢复元素的原始样式
    element.style.width = originalWidth;
    element.style.height = originalHeight;
    element.style.overflow = originalOverflow;
    element.style.visibility = originalVisibility;
    element.style.opacity = originalOpacity;
  }
};

export const captureElement = async (element: HTMLElement): Promise<string> => {
  // Create a clone of the element for capturing
  const clone = element.cloneNode(true) as HTMLElement;
  
  // Get the original element's dimensions
  const originalRect = element.getBoundingClientRect();
  
  // Set the clone to have exact 3:4 aspect ratio with good resolution
  const targetWidth = 600; // 3:4 ratio, width 900px
  const targetHeight = 800; // 3:4 ratio, height 1200px
  const scale = targetWidth / originalRect.width;
  
  // Set clone styles for proper rendering
  clone.style.position = 'absolute';
  clone.style.left = '-9999px';
  clone.style.top = '-9999px';
  clone.style.zIndex = '9999';
  clone.style.width = `${targetWidth}px`;
  clone.style.height = `${targetHeight}px`;
  clone.style.overflow = 'hidden';
  
  // Minimal fix for vertical centering in html2canvas
  // Only applies necessary changes to avoid breaking existing layouts
  const fixStylesForHtml2Canvas = (el: HTMLElement) => {
      // 找到所有带有items-center类的元素
      const itemsCenterElements = el.querySelectorAll('.items-center');
      
      // 为每个元素添加负margin-top来调整垂直位置
      itemsCenterElements.forEach((element) => {
        // (element as HTMLElement).style.marginTop = '-5px';
        // (element as HTMLElement).style.lineHeight = '1'; 
        // (element as HTMLElement).style.paddingTop = '-5px';
        (element as HTMLElement).style.verticalAlign = 'middle';
        (element as HTMLElement).style.position = 'relative';
        (element as HTMLElement).style.top = '8px';
      });
    // Only fix specific elements that have vertical centering issues
    // without modifying the entire layout structure
  };
  
  // Apply style fixes to ensure proper vertical alignment
  fixStylesForHtml2Canvas(clone);
  
  // Add the clone to the DOM
  document.body.appendChild(clone);
  
  try {
    // Ensure the clone has been rendered
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Get the actual background color from the element, fallback to white
    const computedStyle = window.getComputedStyle(clone);
    const bgColor = computedStyle.backgroundColor === 'rgba(0, 0, 0, 0)' ? '#ffffff' : computedStyle.backgroundColor;
    
    // Capture the clone with html2canvas with optimal settings
    const canvas = await html2canvas(clone, {
      useCORS: true,
      scale: 2, // High resolution
      logging: false,
      backgroundColor: bgColor,
      width: targetWidth,
      height: targetHeight,
      windowWidth: targetWidth,
      windowHeight: targetHeight,
      x: 0,
      y: 0,
      // Add more options for better rendering
      allowTaint: true,
      useForeignObject: true,
      // Preserve original font rendering
      letterRendering: true,
      // Avoid text shadow issues
      shadowBlur: 0,
      // Improve flexbox support
      preserveDrawingBuffer: true,
      // Ensure proper CSS property handling
      ignoreElements: (element) => {
        // Ignore elements that might interfere with rendering
        return false;
      }
    });
    
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Image capture failed:', error);
    // Fallback to a simple image if capture fails
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z/C/HgAGgwJ/lK3Q6wAAAABJRU5ErkJggg==';
  } finally {
    // Remove the clone from the DOM
    document.body.removeChild(clone);
  }
};

export const downloadAsZip = async (images: { name: string; data: string }[], zipName: string) => {
  const zip = new JSZip();
  images.forEach(img => {
    const base64Data = img.data.split(',')[1];
    zip.file(img.name, base64Data, { base64: true });
  });
  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, `${zipName}.zip`);
};

export const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy: ', err);
    return false;
  }
};
