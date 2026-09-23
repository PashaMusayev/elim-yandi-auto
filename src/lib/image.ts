/**
 * Telefondan çəkilmiş şəkli brauzerdə WebP-yə çevirir və kiçildir.
 * 12 MB-lıq kamera şəkli → ~200 KB əsas şəkil + ~30 KB thumbnail.
 */
export interface ProcessedImage {
  full: Blob;
  thumb: Blob;
  preview: string;
}

const FULL_MAX = 1600;
const THUMB_MAX = 560;

async function loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if ('createImageBitmap' in window) {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch {
      /* köhnə Safari — aşağıdakı yola keç */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function resize(src: ImageBitmap | HTMLImageElement, max: number, quality: number): Promise<Blob> {
  const w = 'naturalWidth' in src ? src.naturalWidth : src.width;
  const h = 'naturalHeight' in src ? src.naturalHeight : src.height;
  const scale = Math.min(1, max / Math.max(w, h));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) return Promise.reject(new Error('Canvas dəstəklənmir'));
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(src, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Şəkil çevrilmədi'))),
      'image/webp',
      quality,
    );
  });
}

export async function processImage(file: File): Promise<ProcessedImage> {
  const src = await loadBitmap(file);
  const [full, thumb] = await Promise.all([resize(src, FULL_MAX, 0.82), resize(src, THUMB_MAX, 0.75)]);
  if ('close' in src) src.close();
  return { full, thumb, preview: URL.createObjectURL(thumb) };
}
