/**
 * useCurrency.ts
 * Hook centralizado para visualización de precios en múltiples monedas.
 *
 * v2 — Tasas dinámicas:
 * - Carga rates desde GET /api/currency/rates (backend cachea 60 min)
 * - Mientras carga (o si el fetch falla), usa los rates hardcodeados como fallback
 * - rateNote muestra la fecha real de actualización del rate
 * - Si el backend devuelve stale:true, se indica en el rateNote
 * - API pública del hook (format, convert, toUSD, etc.) no cambia
 *
 * Persiste la preferencia de moneda en localStorage.
 * Se sincroniza con el perfil del advisor (preferred_currency).
 */

import { useState, useEffect, useCallback } from 'react';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type SupportedCurrency = 'USD' | 'EUR' | 'CAD';

export interface CurrencyOption {
  code: SupportedCurrency;
  symbol: string;
  label: string;
  flag: string;
}

export interface CurrencyState {
  currency: SupportedCurrency;
  setCurrency: (c: SupportedCurrency) => void;
  convert: (amountUSD: number) => number;
  format: (amountUSD: number | null | undefined) => string;
  formatCompact: (amountUSD: number | null | undefined) => string;
  rateLabel: string;     // ej: "1 USD = 0.92 EUR"
  rateNote: string;      // nota referencial para mostrar en UI
  options: CurrencyOption[];
  isUSD: boolean;
  ratesLoading: boolean; // true mientras se hace el fetch inicial
}

// ─── Configuración de monedas ─────────────────────────────────────────────────

export const CURRENCY_OPTIONS: CurrencyOption[] = [
  { code: 'USD', symbol: 'US$',  label: 'USD – US Dollar',       flag: '🇺🇸' },
  { code: 'EUR', symbol: '€',    label: 'EUR – Euro',            flag: '🇪🇺' },
  { code: 'CAD', symbol: 'CA$',  label: 'CAD – Canadian Dollar', flag: '🇨🇦' },
];

/**
 * Tasas de emergencia hardcodeadas.
 * Usadas como fallback mientras el fetch al backend no completó,
 * o si el endpoint no está disponible.
 * Fecha de referencia: April 2026.
 */
const FALLBACK_RATES: Record<SupportedCurrency, number> = {
  USD: 1.00,
  EUR: 0.8677,
  CAD: 1.3922,
};

const LS_KEY = 'villanet_preferred_currency';

// ─── Fetch de rates desde el backend ─────────────────────────────────────────

interface RatesResponse {
  rates: Record<SupportedCurrency, number>;
  lastUpdated: string;
  stale?: boolean;
}

/**
 * Módulo-nivel de state para los rates dinámicos.
 * Compartido entre todas las instancias del hook para evitar fetches duplicados.
 */
let _rates: Record<SupportedCurrency, number> = { ...FALLBACK_RATES };
let _lastUpdated: string | null = null;
let _stale = false;
let _fetchPromise: Promise<void> | null = null;

/** Listeners para notificar a todas las instancias del hook cuando llegan los rates */
const _listeners = new Set<() => void>();

function notifyListeners() {
  _listeners.forEach(fn => fn());
}

async function loadRates() {
  if (_fetchPromise) return _fetchPromise;

  _fetchPromise = (async () => {
    try {
      const res = await fetch('/api/currency/rates');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: RatesResponse = await res.json();

      // Validar que vengan todas las monedas soportadas
      const valid = (['USD', 'EUR', 'CAD'] as SupportedCurrency[]).every(
        c => typeof data.rates?.[c] === 'number'
      );
      if (!valid) throw new Error('Incomplete rates in response');

      _rates = data.rates;
      _lastUpdated = data.lastUpdated;
      _stale = data.stale ?? false;
    } catch (err) {
      // Silently fall back to hardcoded rates
      console.warn('[useCurrency] Using fallback rates:', err);
      _rates = { ...FALLBACK_RATES };
      _lastUpdated = null;
      _stale = true;
    } finally {
      _fetchPromise = null;
      notifyListeners();
    }
  })();

  return _fetchPromise;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCurrency(initialCurrency?: SupportedCurrency): CurrencyState {
  // Estado local de moneda seleccionada
  const [currency, setCurrencyState] = useState<SupportedCurrency>(() => {
    if (initialCurrency) return initialCurrency;
    const stored = localStorage.getItem(LS_KEY) as SupportedCurrency | null;
    if (stored && Object.keys(FALLBACK_RATES).includes(stored)) return stored;
    return 'USD';
  });

  // Estado de carga: true hasta que el primer fetch resuelva
  const [ratesLoading, setRatesLoading] = useState(() => _lastUpdated === null);

  // Estado de versión para forzar re-render cuando llegan los rates
  const [, setRatesVersion] = useState(0);

  // Lanzar fetch al montar (singleton: si ya está en curso, no duplica)
  useEffect(() => {
    if (_lastUpdated !== null) {
      setRatesLoading(false);
      return;
    }

    const handleUpdate = () => {
      setRatesLoading(false);
      setRatesVersion(v => v + 1);
    };

    _listeners.add(handleUpdate);
    loadRates();

    return () => {
      _listeners.delete(handleUpdate);
    };
  }, []);

  // Sincronizar si cambia initialCurrency desde el perfil del advisor
  useEffect(() => {
    if (initialCurrency && initialCurrency !== currency) {
      setCurrencyState(initialCurrency);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCurrency]);

  const setCurrency = useCallback((c: SupportedCurrency) => {
    setCurrencyState(c);
    localStorage.setItem(LS_KEY, c);
  }, []);

  const convert = useCallback(
    (amountUSD: number): number => {
      const rate = _rates[currency];
      return Math.round(amountUSD * rate);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currency, ratesLoading]
  );

  const format = useCallback(
    (amountUSD: number | null | undefined): string => {
      if (amountUSD == null || isNaN(amountUSD)) return 'Contact for pricing';
      const converted = amountUSD * _rates[currency];
      const intlFormatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(converted);
      // Intl para USD devuelve "$X,XXX" — reemplazar "$" por "US$"
      return intlFormatted.replace(/^\$/, 'US$');
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currency, ratesLoading]
  );

  const formatCompact = useCallback(
    (amountUSD: number | null | undefined): string => {
      if (amountUSD == null || isNaN(amountUSD)) return '—';
      const converted = amountUSD * _rates[currency];
      const option = CURRENCY_OPTIONS.find(o => o.code === currency)!;
      if (converted >= 1000) {
        return `${option.symbol}${(converted / 1000).toFixed(1)}k`;
      }
      return `${option.symbol}${Math.round(converted)}`;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currency, ratesLoading]
  );

  // rateLabel y rateNote usan la fecha real de actualización
  const rate = _rates[currency];
  const rateLabel = currency === 'USD' ? '' : `1 USD = ${rate.toFixed(4)} ${currency}`;

  let rateNote = '';
  if (currency !== 'USD') {
    if (_lastUpdated) {
      const dateStr = new Date(_lastUpdated).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      const staleWarning = _stale ? ' · rate may be outdated' : '';
      rateNote = `* Indicative exchange rate (${rateLabel}, as of ${dateStr}${staleWarning}). Actual billing always in USD.`;
    } else {
      // Todavía cargando o fetch fallido — usar nota genérica sin fecha
      rateNote = `* Indicative exchange rate (${rateLabel}). Actual billing always in USD.`;
    }
  }

  return {
    currency,
    setCurrency,
    convert,
    format,
    formatCompact,
    rateLabel,
    rateNote,
    options: CURRENCY_OPTIONS,
    isUSD: currency === 'USD',
    ratesLoading,
  };
}

/**
 * Convierte un valor en la moneda del usuario a USD.
 * Útil para filtros de precio (min/max) → USD antes de enviar a la API.
 * API pública sin cambios respecto a v1.
 */
export function toUSD(amount: number, fromCurrency: SupportedCurrency): number {
  const rate = _rates[fromCurrency];
  return Math.round(amount / rate);
}