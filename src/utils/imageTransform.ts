// src/utils/imageTransform.ts
//
// Transforma URLs de Cloudinary/Guesty on-the-fly insertando parámetros
// de redimensionado y conversión a WebP directamente en la URL.
//
// Uso:
//   import { cloudinaryTransform } from '../utils/imageTransform';
//   cloudinaryTransform(url, 'card')   // listado /properties
//   cloudinaryTransform(url, 'hero')   // card #1 imagen #1 (LCP)
//   cloudinaryTransform(url, 'full')   // modal / galería de detalle
//   cloudinaryTransform(url, 'thumb')  // miniaturas / previews

export type ImageSize = 'thumb' | 'card' | 'hero' | 'full';

const CLOUDINARY_PARAMS: Record<ImageSize, string> = {
  thumb : 'w_400,h_300,c_fill,f_webp,q_70',    // ~15 KB  — miniaturas / previews
  card  : 'w_800,h_600,c_fill,f_webp,q_80',    // ~60–120 KB — listado /properties
  hero  : 'w_1200,h_800,c_fill,f_webp,q_85',   // ~150 KB — card #1 imagen #1 (LCP)
  full  : 'w_1920,h_1280,c_fit,f_webp,q_90',   // modal / galería de detalle
};

/**
 * Transforma una URL de Cloudinary/Guesty insertando parámetros on-the-fly.
 * Si la URL no es de Cloudinary (no contiene `/image/upload/`), la devuelve sin modificar.
 *
 * ANTES: https://assets.guesty.com/image/upload/v1734492354/production/.../foto.jpg
 * DESPUÉS: https://assets.guesty.com/image/upload/w_800,h_600,c_fill,f_webp,q_80/v1734492354/.../foto.jpg
 *
 * @param url   URL original de la imagen
 * @param size  Preset de tamaño (default: 'card')
 * @returns     URL transformada o la original si no es Cloudinary
 */
export function cloudinaryTransform(url: string, size: ImageSize = 'card'): string {
  if (!url) return url;
  if (!url.includes('/image/upload/')) return url;

  return url.replace('/image/upload/', `/image/upload/${CLOUDINARY_PARAMS[size]}/`);
}