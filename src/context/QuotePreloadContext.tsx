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
  destinations?: string[]; // múltiples destinos
  guests?: number;
  checkIn?: string;
  checkOut?: string;
  bedrooms?: number | null;
  maxPrice?: number;       // legacy — precio por noche estático (sin fechas)
  maxTotalBudget?: number; // budget total de estadía incluyendo fees
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

const DEBOUNCE_MS = 600;
const MAX_AGE_MS  = 60_000;
const PRELOAD_LIMIT = 12;

// ── Context ───────────────────────────────────────────────────────────────────

const QuotePreloadContext = createContext<QuotePreloadContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

export function QuotePreloadProvider({ children }: { children: ReactNode }) {
  const [isPreloading, setIsPreloading] = useState(false);
  const preloadRef    = useRef<PreloadResult | null>(null);
  const debounceRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const triggerPreload = useCallback((filters: PreloadFilters) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      controllerRef.current?.abort();
      controllerRef.current = new AbortController();

      try {
        setIsPreloading(true);

        const qs = new URLSearchParams();
        qs.set('limit', String(PRELOAD_LIMIT));
        qs.set('sort', 'rank');

        // Dates
        if (filters.checkIn)  qs.set('checkIn',  filters.checkIn);
        if (filters.checkOut) qs.set('checkOut', filters.checkOut);

        // Budget
        if (filters.maxTotalBudget && filters.maxTotalBudget < 1_000_000) {
          qs.set('maxTotalBudget', String(filters.maxTotalBudget));
        } else if (filters.maxPrice && filters.maxPrice < 100_000) {
          // legacy fallback — sin fechas
          qs.set('maxPrice', String(filters.maxPrice));
        }

        // Guests
        if (filters.guests && filters.guests > 0) {
          qs.set('guests', String(filters.guests));
        }

        // Bedrooms
        if (filters.bedrooms) {
          qs.set('bedrooms', String(filters.bedrooms));
        }

        // Destinations: prefer the array form if present, fallback to single
        if (filters.destinations && filters.destinations.length > 0) {
          if (filters.destinations.length === 1) {
            qs.set('destination', filters.destinations[0]);
          } else {
            qs.set('destinations', filters.destinations.join(','));
            qs.set('destination', filters.destinations[0]); // compat
          }
        } else if (filters.destination) {
          qs.set('destination', filters.destination);
        }

        const endpoint = `/public/listings?${qs.toString()}`;
        console.log(`🔮 [Preload] Fetching: ${endpoint}`);

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
          console.warn('⚠️ [Preload] Failed (non-blocking):', err.message);
        }
      } finally {
        setIsPreloading(false);
      }
    }, DEBOUNCE_MS);
  }, []);

  const consumePreload = useCallback((filters: PreloadFilters): PreloadResult | null => {
    const cached = preloadRef.current;
    if (!cached) {
      console.log('🔮 [Preload] No cached result available');
      return null;
    }

    const isStale = Date.now() - cached.fetchedAt > MAX_AGE_MS;
    if (isStale) {
      console.log('🔮 [Preload] Cache stale — discarding');
      preloadRef.current = null;
      return null;
    }

    // ── Bedrooms: strict match ──────────────────────────────────────────────
    // Convert both to comparable numbers (null/undefined = "any")
    const cachedBed   = cached.filters.bedrooms ?? null;
    const requestedBed = filters.bedrooms ?? null;
    if (cachedBed !== requestedBed) {
      console.log(`🔮 [Preload] Bedrooms mismatch (cached: ${cachedBed}, requested: ${requestedBed}) — discarding`);
      preloadRef.current = null;
      return null;
    }

    // ── Destinations: strict match (order-independent) ─────────────────────
    const toDestArray = (f: PreloadFilters) =>
      (f.destinations && f.destinations.length > 0)
        ? [...f.destinations].sort()
        : f.destination
          ? [f.destination]
          : [];

    const cachedDests    = toDestArray(cached.filters).join(',');
    const requestedDests = toDestArray(filters).join(',');

    if (cachedDests !== requestedDests) {
      console.log(`🔮 [Preload] Destinations mismatch (cached: "${cachedDests}", requested: "${requestedDests}") — discarding`);
      preloadRef.current = null;
      return null;
    }

    // ── Dates and price: loose — accept if preload had them or if none requested ──
    // We intentionally don't reject here: Properties will re-fetch in background
    // with exact filters and update results. The preload just removes the blank
    // initial state / spinner.

    console.log(`🚀 [Preload] Consuming ${cached.results.length} cached results — skipping spinner`);
    preloadRef.current = null;
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