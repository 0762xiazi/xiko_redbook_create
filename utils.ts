
declare const html2canvas: any;
declare const JSZip: any;
declare const saveAs: any;

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export const captureElement = async (element: HTMLElement): Promise<string> => {
  const canvas = await html2canvas(element, {
    useCORS: true,
    scale: 2,
    logging: false,
    backgroundColor: null,
  });
  return canvas.toDataURL('image/png');
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
