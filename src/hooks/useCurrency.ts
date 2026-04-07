/**
 * useCurrency.ts
 * Hook centralizado para visualización de precios en múltiples monedas.
 *
 * - Tasas hardcodeadas con fecha de referencia (v1 — indicativo)
 * - Persiste la preferencia en localStorage
 * - Se sincroniza con el perfil del advisor (preferred_currency)
 * - En v2: conectar a una API de tasas (ej. exchangerate-api.com)
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
  rateNote: string;      // nota de tipo referencial para mostrar en UI
  options: CurrencyOption[];
  isUSD: boolean;
}

// ─── Configuración de monedas ─────────────────────────────────────────────────

export const CURRENCY_OPTIONS: CurrencyOption[] = [
  { code: 'USD', symbol: 'US$',  label: 'USD – US Dollar',       flag: '🇺🇸' },
  { code: 'EUR', symbol: '€',  label: 'EUR – Euro',            flag: '🇪🇺' },
  { code: 'CAD', symbol: 'CA$', label: 'CAD – Canadian Dollar', flag: '🇨🇦' },
];

/**
 * Tasas de conversión indicativas (1 USD = X moneda).
 * Actualizadas manualmente. Mostrar siempre con nota referencial.
 * Fecha de referencia: April 3, 2026 (fuente: x-rates.com / exchange-rates.org).
 */
const RATES: Record<SupportedCurrency, number> = {
  USD: 1.00,
  EUR: 0.8677,
  CAD: 1.3922,
};

const RATE_DATE = 'Apr 2026'; // Para mostrar en la nota referencial

const LS_KEY = 'villanet_preferred_currency';

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCurrency(initialCurrency?: SupportedCurrency): CurrencyState {
  const [currency, setCurrencyState] = useState<SupportedCurrency>(() => {
    if (initialCurrency) return initialCurrency;
    const stored = localStorage.getItem(LS_KEY) as SupportedCurrency | null;
    if (stored && Object.keys(RATES).includes(stored)) return stored;
    return 'USD';
  });

  // Cuando cambia initialCurrency (ej: al cargar el perfil del advisor), sincronizar
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
      const rate = RATES[currency];
      return Math.round(amountUSD * rate);
    },
    [currency]
  );

  const format = useCallback(
    (amountUSD: number | null | undefined): string => {
      if (amountUSD == null || isNaN(amountUSD)) return 'Contact for pricing';
      const converted = amountUSD * RATES[currency];
      // Intl formatea el número con separadores; luego reemplazamos el símbolo
      // nativo ("$") por "US$" para distinguir del CAD$ y otras monedas dolarizadas
      const intlFormatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(converted);
      // Intl para USD devuelve "$X,XXX" — reemplazar "$" por "US$"
      // Para CAD devuelve "CA$X,XXX" y para EUR "€X,XXX" — ya coinciden
      return intlFormatted.replace(/^\$/, 'US$');
    },
    [currency]
  );

  // Versión compacta para chips/badges (ej: "$4.5k")
  const formatCompact = useCallback(
    (amountUSD: number | null | undefined): string => {
      if (amountUSD == null || isNaN(amountUSD)) return '—';
      const converted = amountUSD * RATES[currency];
      const option = CURRENCY_OPTIONS.find(o => o.code === currency)!;
      if (converted >= 1000) {
        return `${option.symbol}${(converted / 1000).toFixed(1)}k`;
      }
      return `${option.symbol}${Math.round(converted)}`;
    },
    [currency]
  );

  const rate = RATES[currency];
  const rateLabel = currency === 'USD'
    ? ''
    : `1 USD = ${rate.toFixed(2)} ${currency}`;

  const rateNote = currency === 'USD'
    ? ''
    : `* Indicative exchange rate (${rateLabel}, ${RATE_DATE}). Actual billing always in USD.`;

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
  };
}

/**
 * Convierte un valor en USD a la moneda destino para enviar al backend.
 * Útil para convertir filtros de precio (min/max) que el usuario escribe
 * en su moneda local → USD antes de enviar a la API.
 */
export function toUSD(amount: number, fromCurrency: SupportedCurrency): number {
  const rate = RATES[fromCurrency];
  return Math.round(amount / rate);
}