/**
 * QuotePreloadContext
 *
 * Mientras el usuario completa el wizard "New Quote", este context dispara
 * fetches en background al endpoint /public/listings con los filtros que ya
 * tiene disponibles. Cuando Properties monta (o el wizard cierra), lee el
 * resultado precargado y lo usa como "primera página" evitando el spinner largo.
 *
 * Flujo:
 *  NewQuoteModal  →  triggerPreload(filters)  →  fetch /public/listings
 *  Properties     →  consumePreload()          →  usa results como estado inicial
 */

import {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { publicApi } from '../api/api';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface PreloadFilters {
  destination?: string;
  guests?: number;
  checkIn?: string;
  checkOut?: string;
  bedrooms?: number | null;
  maxPrice?: number;
}

export interface PreloadResult {
  results: any[];
  total: number;
  filters: PreloadFilters;
  fetchedAt: number;
}

interface QuotePreloadContextValue {
  /** Dispara (o re-dispara con debounce) un fetch en background */
  triggerPreload: (filters: PreloadFilters) => void;
  /** Consume y limpia el preload. Devuelve null si no hay resultado fresco. */
  consumePreload: (filters: PreloadFilters) => PreloadResult | null;
  /** true mientras hay un fetch en curso */
  isPreloading: boolean;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const DEBOUNCE_MS = 600;       // esperar 600ms sin cambios antes de fetchear
const MAX_AGE_MS  = 60_000;    // resultado válido por 60 segundos
const PRELOAD_LIMIT = 12;      // solo necesitamos la primera página

// ── Context ───────────────────────────────────────────────────────────────────

const QuotePreloadContext = createContext<QuotePreloadContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

export function QuotePreloadProvider({ children }: { children: ReactNode }) {
  const [isPreloading, setIsPreloading] = useState(false);
  const preloadRef   = useRef<PreloadResult | null>(null);
  const debounceRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const triggerPreload = useCallback((filters: PreloadFilters) => {
    // Cancelar debounce anterior
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      // Cancelar fetch anterior si sigue corriendo
      controllerRef.current?.abort();
      controllerRef.current = new AbortController();

      try {
        setIsPreloading(true);

        const qs = new URLSearchParams();
        qs.set('limit', String(PRELOAD_LIMIT));
        qs.set('sort', 'rank');

        if (filters.destination) qs.set('destination', filters.destination);
        if (filters.guests && filters.guests > 0) qs.set('guests', String(filters.guests));
        if (filters.checkIn)  qs.set('checkIn', filters.checkIn);
        if (filters.checkOut) qs.set('checkOut', filters.checkOut);
        if (filters.maxPrice && filters.maxPrice < 100_000) {
          qs.set('maxPrice', String(filters.maxPrice));
        }
        if (filters.bedrooms) qs.set('bedrooms', String(filters.bedrooms));

        const endpoint = `/public/listings?${qs.toString()}`;

        console.log(`🔮 [Preload] Fetching: ${endpoint}`);

        // Usar publicApi igual que Properties — respeta el baseURL y proxy configurados
        const data = await publicApi<{ results: any[]; total: number }>(
          endpoint,
          { signal: controllerRef.current.signal }
        );

        preloadRef.current = {
          results: data.results || [],
          total:   data.total   || 0,
          filters,
          fetchedAt: Date.now(),
        };

        console.log(`✅ [Preload] Got ${preloadRef.current.results.length} results`);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          // No romper la UI — solo loguear
          console.warn('⚠️ [Preload] Failed (non-blocking):', err.message);
        }
      } finally {
        setIsPreloading(false);
      }
    }, DEBOUNCE_MS);
  }, []);

  /**
   * Devuelve el preload si:
   *  - existe
   *  - tiene menos de MAX_AGE_MS de antigüedad
   *  - los filtros clave coinciden con los que se usaron para precargarlo
   * Después de consumir, limpia el cache para no reusar en navegaciones posteriores.
   */
  const consumePreload = useCallback((filters: PreloadFilters): PreloadResult | null => {
    const cached = preloadRef.current;
    if (!cached) return null;

    const isStale = Date.now() - cached.fetchedAt > MAX_AGE_MS;
    if (isStale) {
      preloadRef.current = null;
      return null;
    }

    // Verificar coincidencia en los filtros estructurales clave (destination y bedrooms).
    // Fechas y precio no se validan estrictamente porque el preload puede completarse
    // antes de que el usuario termine de ingresar esos datos (race condition normal).
    // En el peor caso mostramos resultados levemente desactualizados por ~1 segundo
    // hasta que Properties dispara su propio fetch con los filtros exactos.
    const sameDestination = cached.filters.destination === filters.destination;
    const sameBedrooms    = cached.filters.bedrooms    === filters.bedrooms;

    // Si el destino no coincide, el preload es completamente irrelevante → descartar
    if (!sameDestination) {
      console.log('🔮 [Preload] Destination mismatch — discarding preload');
      preloadRef.current = null;
      return null;
    }

    // Si bedrooms no coincide, los resultados pueden ser incorrectos → descartar
    if (!sameBedrooms) {
      console.log('🔮 [Preload] Bedrooms mismatch — discarding preload');
      preloadRef.current = null;
      return null;
    }

    // Fechas y precio: aceptamos aproximación — Properties hará el fetch exacto de inmediato
    console.log('🔮 [Preload] Accepting preload (dates/price may differ slightly — Properties will refetch)');

    // Consumir y limpiar
    preloadRef.current = null;
    console.log(`🚀 [Preload] Consumed ${cached.results.length} results — skipping spinner`);
    return cached;
  }, []);

  return (
    <QuotePreloadContext.Provider value={{ triggerPreload, consumePreload, isPreloading }}>
      {children}
    </QuotePreloadContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useQuotePreload() {
  const ctx = useContext(QuotePreloadContext);
  if (!ctx) throw new Error('useQuotePreload must be used within QuotePreloadProvider');
  return ctx;
}