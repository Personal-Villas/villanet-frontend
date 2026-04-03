/**
 * CurrencySelector.tsx
 * Selector de moneda compacto — usado en SecondSearchBar y AdvisorProfile.
 * Props:
 *   value       — moneda activa
 *   onChange    — callback al seleccionar
 *   compact     — modo pill pequeño (para la barra de filtros)
 *   className   — clases extra
 */

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { type SupportedCurrency, CURRENCY_OPTIONS } from '../hooks/useCurrency';

interface CurrencySelectorProps {
  value: SupportedCurrency;
  onChange: (currency: SupportedCurrency) => void;
  compact?: boolean;
  className?: string;
}

export function CurrencySelector({
  value,
  onChange,
  compact = false,
  className = '',
}: CurrencySelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Cerrar al hacer click afuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = CURRENCY_OPTIONS.find(o => o.code === value)!;

  if (compact) {
    return (
      <div ref={ref} className={`relative ${className}`}>
        <button
          type="button"
          onClick={() => setOpen(v => !v)}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold border border-input rounded-full bg-background text-foreground hover:bg-muted transition-colors select-none"
          aria-label="Select display currency"
        >
          <span>{selected.flag}</span>
          <span>{selected.code}</span>
          <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div className="absolute top-full mt-1 right-0 z-50 min-w-[160px] bg-background border border-input rounded-lg shadow-lg overflow-hidden">
            {CURRENCY_OPTIONS.map(opt => (
              <button
                key={opt.code}
                type="button"
                onClick={() => { onChange(opt.code); setOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-muted transition-colors ${
                  opt.code === value ? 'bg-muted font-semibold' : ''
                }`}
              >
                <span>{opt.flag}</span>
                <span>{opt.code}</span>
                <span className="text-muted-foreground ml-auto">{opt.symbol}</span>
              </button>
            ))}
            <div className="px-3 py-2 border-t border-input">
              <p className="text-[10px] text-muted-foreground leading-tight">
                Indicative rates only.<br />Billing always in USD.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Modo full (para AdvisorProfile)
  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-sm border border-input rounded-lg bg-background text-foreground hover:bg-muted transition-colors"
      >
        <span className="flex items-center gap-2">
          <span>{selected.flag}</span>
          <span>{selected.label}</span>
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full mt-1 left-0 right-0 z-50 bg-background border border-input rounded-lg shadow-lg overflow-hidden">
          {CURRENCY_OPTIONS.map(opt => (
            <button
              key={opt.code}
              type="button"
              onClick={() => { onChange(opt.code); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-muted transition-colors ${
                opt.code === value ? 'bg-muted font-semibold' : ''
              }`}
            >
              <span className="text-base">{opt.flag}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}