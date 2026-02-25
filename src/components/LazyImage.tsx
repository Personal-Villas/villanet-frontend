/**
 * Componente de imagen con:
 *  - Lazy loading nativo (fuera del viewport)
 *  - Eager loading para imágenes above-the-fold (priority=true)
 *  - Técnica blur-up: placeholder borroso → imagen real con fade
 *  - Reserva de espacio via aspectRatio → cero layout shift (CLS)
 *  - Manejo de error con fallback visual
 */
import { useState, useRef, useEffect } from 'react';
import { toCdnUrl, buildBlurPlaceholder } from '../services/imageUtils';

interface LazyImageProps {
  src: string;
  alt: string;
  /** URL de un thumbnail pre-generado en S3 (p.ej. "imagen_thumb.jpg"). 
   *  Si no se pasa, se usa un placeholder SVG gris. */
  lowResSrc?: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  /** Relación de aspecto del contenedor. Default "4/3". Evita CLS. */
  aspectRatio?: string;
  /** true para imágenes above-the-fold (primeras 4 cards de la grilla).
   *  Activa loading="eager" + fetchPriority="high" para acelerar el LCP. */
  priority?: boolean;
  onLoad?: () => void;
}

export default function LazyImage({
  src,
  alt,
  lowResSrc,
  className = '',
  width,
  height,
  aspectRatio = '4/3',
  priority = false,
  onLoad,
}: LazyImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // URL definitiva: pasada por CDN si está configurado
  const finalSrc = toCdnUrl(src);

  // Placeholder: thumbnail explícito > SVG gris genérico
  const placeholder = lowResSrc ? toCdnUrl(lowResSrc) : buildBlurPlaceholder(src);

  // Si la imagen ya estaba cacheada (navegación back/forward), marcarla inmediatamente
  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      setLoaded(true);
    }
  }, []);

  const handleLoad = () => {
    setLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setError(true);
    setLoaded(true); // ocultar placeholder aunque falle
  };

  return (
    /*
     * El contenedor con aspectRatio reserva el espacio ANTES de que cargue la
     * imagen, eliminando el layout shift (CLS = 0 para estas imágenes).
     */
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        aspectRatio,
        width: width ?? '100%',
        height: height ?? 'auto',
        backgroundColor: '#e8e8e8',
        contain: 'layout',
      }}
    >
      {/* ── Placeholder borroso (blur-up technique) ────────────────────────── */}
      {!error && (
        <img
          src={placeholder}
          alt=""
          aria-hidden="true"
          decoding="sync"
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 pointer-events-none"
          style={{
            filter: 'blur(12px) brightness(0.95)',
            transform: 'scale(1.08)', // oculta artefactos de borde del blur
            opacity: loaded ? 0 : 1,
          }}
        />
      )}

      {/* ── Imagen principal ─────────────────────────────────────────────── */}
      {!error && (
        <img
          ref={imgRef}
          src={finalSrc}
          alt={alt}
          width={width}
          height={height}
          /**
           * priority=true  (primeras 4 cards, above-the-fold):
           *   loading="eager"  → el browser la descarga de inmediato
           *   fetchPriority="high" → sube al tope de la cola de red
           *   decoding="sync"  → no bloquea otros elementos mientras decodifica
           *
           * priority=false (resto de cards):
           *   loading="lazy"   → el browser la descarga solo cuando se acerca al viewport
           *   fetchPriority="auto"
           *   decoding="async" → decodifica en background sin bloquear el hilo principal
           */
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          // @ts-ignore — fetchPriority es válido en navegadores modernos
          fetchpriority={priority ? 'high' : 'auto'}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-out ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}

      {/* ── Estado de error ──────────────────────────────────────────────── */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-400 text-xs gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7 opacity-40"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span>Image not available</span>
        </div>
      )}
    </div>
  );
}