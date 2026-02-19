/**
 * imageUtils.ts — src/services/imageUtils.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Utilidades de optimización de imágenes para AWS S3.
 *
 * Arquitectura actual:  S3 → (opcional CloudFront CDN) → browser
 * Sin transformaciones server-side por ahora; el código está preparado para
 * agregar imgproxy o Lambda@Edge en el futuro sin cambiar los componentes.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── Config ───────────────────────────────────────────────────────────────────

/**
 * Opcional: si tenés un CloudFront delante de S3, configurá la variable
 * para que las URLs se sirvan desde el CDN (más rápido, cache de borde).
 *
 *   VITE_CDN_BASE_URL=https://d1234abcd.cloudfront.net
 *
 * Si no está configurada, las URLs originales de S3 se usan sin cambios.
 */
const CDN_BASE: string = (import.meta as any).env?.VITE_CDN_BASE_URL?.replace(/\/$/, '') ?? '';

// ─── URL helpers ──────────────────────────────────────────────────────────────

/**
 * Si hay un CDN configurado, reemplaza el origen de S3 por el de CloudFront.
 * Así el browser descarga desde el edge más cercano sin cambiar nada más.
 *
 * Ejemplo:
 *   https://my-bucket.s3.amazonaws.com/imgs/villa.jpg
 *   → https://d1234abcd.cloudfront.net/imgs/villa.jpg
 */
export function toCdnUrl(src: string): string {
  if (!src) return '';
  if (!CDN_BASE) return src;

  // Reemplaza el host de S3 (varias formas posibles) por el CDN
  return src
    .replace(/https?:\/\/[^/]+\.s3[^/]*\.amazonaws\.com/, CDN_BASE)
    .replace(/https?:\/\/s3[^/]*\.amazonaws\.com\/[^/]+/, CDN_BASE);
}

/**
 * Genera una URL de placeholder ultra-liviana.
 *
 * Con S3 puro no podemos redimensionar en el servidor, así que usamos un
 * SVG de 1×1 px como placeholder base. Cuando tengan imgproxy/CloudFront
 * Functions, reemplazar el cuerpo de esta función con la URL transformada.
 *
 * Si el llamador pasa un `lowResSrc` explícito (thumbnail pre-generado en S3),
 * esa URL tendrá prioridad sobre este placeholder genérico.
 */
export function buildBlurPlaceholder(_src: string): string {
  // TODO (futuro): cuando agreguen imgproxy, cambiar por:
  // return `${IMGPROXY_BASE}/rs:fill:20:15/q:30/${encodeURIComponent(toCdnUrl(_src))}`;
  return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 3"%3E%3Crect width="4" height="3" fill="%23e8e8e8"/%3E%3C/svg%3E';
}

/**
 * Decide si una imagen es la candidata al LCP dado su índice en la grilla.
 *
 * Criterio: las primeras 4 imágenes son visibles above-the-fold en desktop
 * (grilla de 4 columnas), las primeras 2 en mobile (1 columna).
 * Dar `priority` a las 4 primeras cubre ambos casos sin sobre-cargar.
 *
 * @param cardIndex  índice 0-based de la card en la página actual
 */
export function isAboveFold(cardIndex: number): boolean {
  return cardIndex < 4;
}

// ─── Performance metrics ─────────────────────────────────────────────────────

/**
 * Observa el LCP (Largest Contentful Paint).
 * Meta: < 2500 ms (Good según Core Web Vitals).
 *
 * Uso en Properties.tsx:
 *   useEffect(() => initPerformanceMetrics({ debug: true }), []);
 */
function observeLCP(onReport: (ms: number) => void): () => void {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return () => {};

  let lcpValue = 0;
  let observer: PerformanceObserver;

  try {
    observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const last = entries[entries.length - 1] as PerformanceEntry & { startTime: number };
      lcpValue = last.startTime;
    });
    observer.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch {
    return () => {};
  }

  const report = () => {
    if (lcpValue > 0) onReport(Math.round(lcpValue));
    observer.disconnect();
  };
  window.addEventListener('visibilitychange', report, { once: true });
  window.addEventListener('beforeunload', report, { once: true });

  return () => {
    observer.disconnect();
    window.removeEventListener('visibilitychange', report);
    window.removeEventListener('beforeunload', report);
  };
}

/**
 * Observa el CLS (Cumulative Layout Shift).
 * Meta: < 0.1 (Good según Core Web Vitals).
 */
function observeCLS(onReport: (score: number) => void): () => void {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return () => {};

  let clsValue = 0;
  let observer: PerformanceObserver;

  try {
    observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const shift = entry as PerformanceEntry & { hadRecentInput: boolean; value: number };
        if (!shift.hadRecentInput) clsValue += shift.value;
      }
    });
    observer.observe({ type: 'layout-shift', buffered: true });
  } catch {
    return () => {};
  }

  const report = () => {
    onReport(parseFloat(clsValue.toFixed(4)));
    observer.disconnect();
  };
  window.addEventListener('visibilitychange', report, { once: true });
  window.addEventListener('beforeunload', report, { once: true });

  return () => {
    observer.disconnect();
    window.removeEventListener('visibilitychange', report);
    window.removeEventListener('beforeunload', report);
  };
}

/**
 * Inicializa LCP + CLS en una sola llamada.
 * Retorna una función de cleanup para usar en el return del useEffect.
 *
 * @example
 * // En Properties.tsx:
 * useEffect(() => initPerformanceMetrics({ debug: import.meta.env.DEV }), []);
 */
export function initPerformanceMetrics(opts: {
  onLCP?: (ms: number) => void;
  onCLS?: (score: number) => void;
  /** true → imprime en consola. Activar solo en desarrollo. */
  debug?: boolean;
} = {}): () => void {
  const { onLCP, onCLS, debug = false } = opts;

  const cleanLCP = observeLCP((ms) => {
    if (debug) {
      const rating = ms < 2500 ? '✅ Good' : ms < 4000 ? '⚠️ Needs improvement' : '❌ Poor';
      console.info(`[Perf] LCP: ${ms}ms — ${rating}`);
    }
    onLCP?.(ms);
    // Enviar a GTM si está disponible
    (window as any).dataLayer?.push({ event: 'web_vital_lcp', value: ms });
  });

  const cleanCLS = observeCLS((score) => {
    if (debug) {
      const rating = score < 0.1 ? '✅ Good' : score < 0.25 ? '⚠️ Needs improvement' : '❌ Poor';
      console.info(`[Perf] CLS: ${score} — ${rating}`);
    }
    onCLS?.(score);
    (window as any).dataLayer?.push({ event: 'web_vital_cls', value: score });
  });

  return () => {
    cleanLCP();
    cleanCLS();
  };
}