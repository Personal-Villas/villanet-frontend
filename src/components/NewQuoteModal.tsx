import { useEffect, useState, useCallback } from 'react';
import { useQuotePreload, type PreloadFilters } from '../context/QuotePreloadContext';
import ReactDOM from 'react-dom';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { X, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
interface QuoteData {
  budget: number;
  adults: number;
  children: number;
  infants: number;
  destinations: string[];
  datesFlexible: boolean;
  checkIn: string;
  checkOut: string;
  flexibleRange: string;
  bedrooms: number | null;
}

const INITIAL: QuoteData = {
  budget: 15000,
  adults: 2,
  children: 0,
  infants: 0,
  destinations: [],
  datesFlexible: false,
  checkIn: '',
  checkOut: '',
  flexibleRange: '',
  bedrooms: null,
};

// ── Destinations data ─────────────────────────────────────────────────────────
// Cada destino tiene: code (único, para lógica), label (2-3 chars para el chip), name (display)
const CARIBBEAN: { code: string; label: string; name: string }[] = [
  { code: 'AI',    label: 'AI',  name: 'Anguilla' },
  { code: 'BS',    label: 'BS',  name: 'Bahamas' },
  { code: 'BB',    label: 'BB',  name: 'Barbados' },
  { code: 'VG',    label: 'VG',  name: 'British Virgin Islands' },
  { code: 'DO-CC', label: 'DO',  name: 'Cap Cana, Dominican Republic' },
  { code: 'DO-CDC',label: 'DO',  name: 'Casa de Campo, Dominican Republic' },
  { code: 'KY',    label: 'KY',  name: 'Cayman Islands' },
  { code: 'JM',    label: 'JM',  name: 'Jamaica' },
  { code: 'DO-PC', label: 'DO',  name: 'Punta Cana, Dominican Republic' },
  { code: 'STBARTS',label: 'FR', name: 'St. Barts' },
  { code: 'MF',    label: 'MF',  name: 'St. Martin / St. Maarten' },
  { code: 'TC',    label: 'TC',  name: 'Turks & Caicos' },
];

const CARIBBEAN_SOON: { code: string; label: string; name: string }[] = [
  { code: 'AG',   label: 'AG', name: 'Antigua' },
  { code: 'DM',   label: 'DM', name: 'Dominica' },
  { code: 'GD',   label: 'GD', name: 'Grenada' },
  { code: 'NEVIS',label: 'KN', name: 'Nevis' },
  { code: 'PR',   label: 'PR', name: 'Puerto Rico' },
  { code: 'KITTS',label: 'KN', name: 'St. Kitts' },
  { code: 'LC',   label: 'LC', name: 'St. Lucia' },
];

const MEXICO: { code: string; label: string; name: string }[] = [
  { code: 'MX-PVR', label: 'MX', name: 'Puerto Vallarta' },
  { code: 'MX-PTM', label: 'MX', name: 'Punta Mita' },
  { code: 'MX-RMY', label: 'MX', name: 'Riviera Maya' },
  { code: 'MX-ZIH', label: 'MX', name: 'Zihuatanejo' },
];

const MEXICO_SOON: { code: string; label: string; name: string }[] = [
  { code: 'MX-CAB', label: 'MX', name: 'Los Cabos' },
  { code: 'MX-MZT', label: 'MX', name: 'Mazatlán' },
  { code: 'MX-HUA', label: 'MX', name: 'Huatulco' },
  { code: 'MX-IXT', label: 'MX', name: 'Ixtapa' },
];

const CENTRAL_AMERICA_SOON: { code: string; label: string; name: string }[] = [
  { code: 'BZ', label: 'BZ', name: 'Belize' },
  { code: 'CR', label: 'CR', name: 'Costa Rica' },
  { code: 'HN', label: 'HN', name: 'Honduras (Roatan)' },
  { code: 'PA', label: 'PA', name: 'Panama' },
];

const EUROPE_SOON: { code: string; label: string; name: string }[] = [
  { code: 'EU-HR', label: 'HR', name: 'Croatia' },
  { code: 'EU-GB', label: 'GB', name: 'England' },
  { code: 'EU-FR', label: 'FR', name: 'France' },
  { code: 'EU-GR', label: 'GR', name: 'Greece' },
  { code: 'EU-IT', label: 'IT', name: 'Italy' },
  { code: 'EU-PT', label: 'PT', name: 'Portugal' },
  { code: 'EU-SCT',label: 'GB', name: 'Scotland' },
  { code: 'EU-ES', label: 'ES', name: 'Spain' },
  { code: 'EU-CH', label: 'CH', name: 'Switzerland' },
];

const BEDROOM_OPTIONS = [3, 4, 5, 6, 7, 8, '9+'];

// ── Helpers ───────────────────────────────────────────────────────────────────
/**
 * Convierte texto de mes flexible a un rango de fechas concreto { checkIn, checkOut }.
 * Soporta: "April 2026", "Apr 2026", "April - May 2026", "April to May 2026".
 * Devuelve null si no puede parsear.
 */
function parseFlexibleRange(range: string): { checkIn: string; checkOut: string } | null {
  const trimmed = range.trim();
  if (!trimmed) return null;

  const MONTHS: Record<string, number> = {
    january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
    july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
    jan: 1, feb: 2, mar: 3, apr: 4, jun: 6, jul: 7, aug: 8,
    sep: 9, sept: 9, oct: 10, nov: 11, dec: 12,
  };

  const pad = (n: number) => String(n).padStart(2, '0');
  const lastDay = (year: number, month: number) => new Date(year, month, 0).getDate();

  // Rango: "April - May 2026" o "April to May 2026"
  const rangeMatch = trimmed.match(/^([a-z]+)\s*(?:-|to)\s*([a-z]+)\s+(\d{4})$/i);
  if (rangeMatch) {
    const m1 = MONTHS[rangeMatch[1].toLowerCase()];
    const m2 = MONTHS[rangeMatch[2].toLowerCase()];
    const year = parseInt(rangeMatch[3]);
    if (m1 && m2 && year) {
      return {
        checkIn: `${year}-${pad(m1)}-01`,
        checkOut: `${year}-${pad(m2)}-${pad(lastDay(year, m2))}`,
      };
    }
  }

  // Mes simple: "April 2026"
  const singleMatch = trimmed.match(/^([a-z]+)\s+(\d{4})$/i);
  if (singleMatch) {
    const m = MONTHS[singleMatch[1].toLowerCase()];
    const year = parseInt(singleMatch[2]);
    if (m && year) {
      return {
        checkIn: `${year}-${pad(m)}-01`,
        checkOut: `${year}-${pad(m)}-${pad(lastDay(year, m))}`,
      };
    }
  }

  return null;
}

const formatBudget = (n: number) =>
  n >= 100000
    ? '$100,000+'
    : `$${n.toLocaleString()}`;

const BUDGET_MIN = 1000;
const BUDGET_MAX = 100000;

function budgetToSlider(value: number): number {
  // Logarithmic scale
  const minLog = Math.log(BUDGET_MIN);
  const maxLog = Math.log(BUDGET_MAX);
  return ((Math.log(Math.min(value, BUDGET_MAX)) - minLog) / (maxLog - minLog)) * 100;
}

function sliderToBudget(pct: number): number {
  const minLog = Math.log(BUDGET_MIN);
  const maxLog = Math.log(BUDGET_MAX);
  const raw = Math.exp(minLog + (pct / 100) * (maxLog - minLog));
  // Snap to nice increments
  if (raw < 5000) return Math.round(raw / 500) * 500;
  if (raw < 20000) return Math.round(raw / 1000) * 1000;
  if (raw < 50000) return Math.round(raw / 2500) * 2500;
  return Math.round(raw / 5000) * 5000;
}

// ── Progress bar ──────────────────────────────────────────────────────────────
function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex gap-1 w-full">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="h-0.5 flex-1 rounded-full transition-all duration-300"
          style={{ background: i < step ? '#111' : '#e5e5e5' }}
        />
      ))}
    </div>
  );
}

// ── Counter ───────────────────────────────────────────────────────────────────
function Counter({
  label,
  sublabel,
  value,
  onDec,
  onInc,
  min = 0,
}: {
  label: string;
  sublabel?: string;
  value: number;
  onDec: () => void;
  onInc: () => void;
  min?: number;
}) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-neutral-100 last:border-0">
      <div>
        <p className="text-base font-medium text-neutral-900">{label}</p>
        {sublabel && <p className="text-sm text-neutral-400 mt-0.5">{sublabel}</p>}
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={onDec}
          disabled={value <= min}
          className="w-9 h-9 rounded-full border border-neutral-200 flex items-center justify-center text-lg text-neutral-700 hover:border-neutral-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          –
        </button>
        <span className="w-8 text-center text-xl font-semibold text-neutral-900">{value}</span>
        <button
          onClick={onInc}
          className="w-9 h-9 rounded-full border border-neutral-200 flex items-center justify-center text-lg text-neutral-700 hover:border-neutral-400 transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );
}

// ── Main Modal ────────────────────────────────────────────────────────────────
export function NewQuoteModal() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const isOpen = searchParams.get('quoteFlow') === 'true';
  const { triggerPreload } = useQuotePreload();

  // -1 = intro screen, 0-4 = steps 1-5
  const [screen, setScreen] = useState<-1 | 0 | 1 | 2 | 3 | 4>(-1);
  const [data, setData] = useState<QuoteData>(INITIAL);

  const TOTAL_STEPS = 5;

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      // Reset on close
      setScreen(-1);
      setData(INITIAL);
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const close = useCallback(() => {
    const next = new URLSearchParams(searchParams);
    next.delete('quoteFlow');
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  // ESC to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [close]);

  // Preload en background cada vez que el usuario avanza un step
  // Solo disparar a partir del step 1 (cuando ya hay algo útil que filtrar)
  useEffect(() => {
    if (!isOpen || screen < 0) return;

    const DEST_CODE_TO_NAME_PRELOAD: Record<string, string> = {
      'AI': 'Anguilla', 'BS': 'Bahamas', 'BB': 'Barbados',
      'VG': 'British Virgin Islands', 'DO-CC': 'Cap Cana, Dominican Republic',
      'DO-CDC': 'Casa de Campo, Dominican Republic', 'DO-PC': 'Punta Cana, Dominican Republic',
      'KY': 'Cayman Islands', 'JM': 'Jamaica', 'STBARTS': 'St. Barts',
      'MF': 'St. Martin / St. Maarten', 'TC': 'Turks & Caicos',
      'MX-PVR': 'Puerto Vallarta, Mexico', 'MX-PTM': 'Punta Mita, Mexico',
      'MX-RMY': 'Riviera Maya, Mexico', 'MX-ZIH': 'Zihuatanejo, Mexico',
    };

    const preloadFilters: PreloadFilters = {};

    // Budget
    if (data.budget < 100_000) preloadFilters.maxPrice = data.budget;

    // Guests (desde step 2)
    if (screen >= 1) {
      const total = data.adults + data.children + data.infants;
      if (total > 0) preloadFilters.guests = total;
    }

    // Destination (desde step 3)
    if (screen >= 2 && data.destinations.length > 0 && !data.destinations.includes('OPEN')) {
      const mapped = DEST_CODE_TO_NAME_PRELOAD[data.destinations[0]];
      if (mapped) preloadFilters.destination = mapped;
    }

    // Dates (desde step 4)
    if (screen >= 3) {
      if (data.datesFlexible && data.flexibleRange) {
        const parsed = parseFlexibleRange(data.flexibleRange);
        if (parsed) {
          preloadFilters.checkIn  = parsed.checkIn;
          preloadFilters.checkOut = parsed.checkOut;
        }
      } else if (data.checkIn && data.checkOut) {
        preloadFilters.checkIn  = data.checkIn;
        preloadFilters.checkOut = data.checkOut;
      }
    }

    // Bedrooms (step 5)
    if (screen >= 4 && data.bedrooms) {
      preloadFilters.bedrooms = data.bedrooms;
    }

    triggerPreload(preloadFilters);
  }, [isOpen, screen, data, triggerPreload]);

  const goNext = () => {
    if (screen === -1) setScreen(0);
    else if (screen < 4) setScreen((s) => (s + 1) as any);
    else handleFinish();
  };

  const goBack = () => {
    if (screen === 0) setScreen(-1);
    else if (screen > 0) setScreen((s) => (s - 1) as any);
  };

  const handleFinish = () => {
    const DEST_CODE_TO_NAME: Record<string, string> = {
      'AI':      'Anguilla',
      'BS':      'Bahamas',
      'BB':      'Barbados',
      'VG':      'British Virgin Islands',
      'DO-CC':   'Cap Cana, Dominican Republic',
      'DO-CDC':  'Casa de Campo, Dominican Republic',
      'DO-PC':   'Punta Cana, Dominican Republic',
      'KY':      'Cayman Islands',
      'JM':      'Jamaica',
      'STBARTS': 'St. Barts',
      'MF':      'St. Martin / St. Maarten',
      'TC':      'Turks & Caicos',
      'MX-PVR':  'Puerto Vallarta, Mexico',
      'MX-PTM':  'Punta Mita, Mexico',
      'MX-RMY':  'Riviera Maya, Mexico',
      'MX-ZIH':  'Zihuatanejo, Mexico',
    };

    const params = new URLSearchParams();

    // Budget → maxPrice (ignorar si está en el tope de $100k+)
    if (data.budget && data.budget < 100000) {
      params.set('maxPrice', String(data.budget));
    }

    // Bedrooms
    if (data.bedrooms) {
      params.set('bedrooms', String(data.bedrooms));
    }

    // Destinations: mapear códigos a nombres que entiende Properties
    // Si es "Open to Suggestions" no se aplica filtro de destino → se muestran todas las propiedades
    if (data.destinations.length && !data.destinations.includes('OPEN')) {
      const mappedNames = data.destinations
        .map(code => DEST_CODE_TO_NAME[code])
        .filter(Boolean);
      if (mappedNames.length >= 1) {
        params.set('destination', mappedNames[0]);
      }
    }

    // Fechas: si son flexibles convertir el texto a rango concreto YYYY-MM-DD
    if (data.datesFlexible && data.flexibleRange) {
      const parsed = parseFlexibleRange(data.flexibleRange);
      if (parsed) {
        params.set('checkIn', parsed.checkIn);
        params.set('checkOut', parsed.checkOut);
        params.set('flexibleRange', data.flexibleRange);
      }
    } else {
      if (data.checkIn) params.set('checkIn', data.checkIn);
      if (data.checkOut) params.set('checkOut', data.checkOut);
    }

    // Guests
    const totalGuests = data.adults + data.children + data.infants;
    if (totalGuests > 0) params.set('guests', String(totalGuests));

    // Flag para que Properties aplique estos filtros reactivamente
    params.set('fromQuote', 'true');

    navigate(`/properties?${params.toString()}`);
  };

  const canContinue = () => {
    if (screen === 2) return data.destinations.length > 0;
    if (screen === 3 && !data.datesFlexible) return !!(data.checkIn && data.checkOut);
    return true;
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[100]" style={{ fontFamily: 'inherit' }}>
      {/* Full-screen white overlay */}
      <div className="absolute inset-0 bg-white flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 md:px-10 py-4 border-b border-neutral-100">
          <span className="text-sm font-medium text-neutral-500">
            {screen === -1 ? 'New Quote' : `Step ${screen + 1} of ${TOTAL_STEPS}`}
          </span>
          <button
            onClick={close}
            className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            Save & Exit <X size={15} />
          </button>
        </div>

        {/* Progress bar (only during steps) */}
        {screen >= 0 && (
          <div className="px-6 md:px-10 pt-3">
            <ProgressBar step={screen + 1} total={TOTAL_STEPS} />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto flex flex-col items-center px-6 md:px-10 py-12">
          <div className="w-full max-w-lg">

            {/* ── INTRO ─────────────────────────────────────────────────── */}
            {screen === -1 && (
              <div className="flex flex-col items-center justify-center min-h-[55vh] text-center">
                <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-3">New Quote</h1>
                <p className="text-neutral-400 mb-10">We'll ask a few quick questions to allocate the right villas.</p>
                <button
                  onClick={goNext}
                  className="bg-neutral-900 text-white font-semibold text-sm px-10 py-3.5 rounded-xl hover:bg-neutral-700 transition-colors tracking-wide uppercase"
                >
                  START
                </button>
                <button
                  onClick={close}
                  className="mt-4 text-sm text-neutral-400 hover:text-neutral-700 transition-colors underline underline-offset-2"
                >
                  Browse All Villas
                </button>
              </div>
            )}

            {/* ── STEP 1: Budget ─────────────────────────────────────────── */}
            {screen === 0 && (
              <div className="flex flex-col justify-center min-h-[55vh]">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-2xl md:text-3xl font-bold text-neutral-900">
                    What is your client's total stay budget?
                  </h2>
                  <button className="w-6 h-6 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-400 text-xs hover:border-neutral-400 flex-shrink-0">?</button>
                </div>
                <p className="text-neutral-400 text-sm mb-10">Total stay amount, not nightly rate.</p>

                <div className="text-center mb-8">
                  <span className="text-5xl font-bold text-neutral-900">{formatBudget(data.budget)}</span>
                </div>

                {/* Slider */}
                <div className="mb-6">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={0.1}
                    value={budgetToSlider(data.budget)}
                    onChange={e => setData(d => ({ ...d, budget: sliderToBudget(Number(e.target.value)) }))}
                    className="w-full accent-neutral-900"
                    style={{ height: 4 }}
                  />
                  <div className="flex justify-between text-xs text-neutral-400 mt-2">
                    <span>$1,000</span>
                    <span>$100,000+</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm text-neutral-500 whitespace-nowrap">Or enter amount:</span>
                  <input
                    type="number"
                    value={data.budget}
                    min={BUDGET_MIN}
                    max={BUDGET_MAX}
                    onChange={e => {
                      const v = Math.min(BUDGET_MAX, Math.max(BUDGET_MIN, Number(e.target.value)));
                      setData(d => ({ ...d, budget: v }));
                    }}
                    className="flex-1 px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900"
                  />
                </div>
              </div>
            )}

            {/* ── STEP 2: Guests ─────────────────────────────────────────── */}
            {screen === 1 && (
              <div className="flex flex-col justify-center min-h-[55vh]">
                <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-10">How many guests?</h2>

                <div className="border border-neutral-100 rounded-2xl px-6 divide-y divide-neutral-100">
                  <Counter
                    label="Adults"
                    sublabel="Ages 13+"
                    value={data.adults}
                    min={1}
                    onDec={() => setData(d => ({ ...d, adults: Math.max(1, d.adults - 1) }))}
                    onInc={() => setData(d => ({ ...d, adults: d.adults + 1 }))}
                  />
                  <Counter
                    label="Children"
                    sublabel="Ages 3–12"
                    value={data.children}
                    onDec={() => setData(d => ({ ...d, children: Math.max(0, d.children - 1) }))}
                    onInc={() => setData(d => ({ ...d, children: d.children + 1 }))}
                  />
                  <Counter
                    label="Infants"
                    sublabel="Under 2"
                    value={data.infants}
                    onDec={() => setData(d => ({ ...d, infants: Math.max(0, d.infants - 1) }))}
                    onInc={() => setData(d => ({ ...d, infants: d.infants + 1 }))}
                  />
                </div>

                <div className="mt-4 px-2 py-3 bg-neutral-50 rounded-xl text-center">
                  <span className="text-sm text-neutral-600">
                    Total guests: <strong className="text-neutral-900">{data.adults + data.children + data.infants}</strong>
                  </span>
                </div>
              </div>
            )}

            {/* ── STEP 3: Destinations ───────────────────────────────────── */}
            {screen === 2 && (
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-2">Where are they considering?</h2>
                <p className="text-neutral-400 text-sm mb-8">Select a destination.</p>

                <div className="space-y-6">

                  {/* ── Caribbean ── */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-neutral-900 mb-3">Caribbean</p>
                    <div className="grid grid-cols-2 gap-2">
                      {CARIBBEAN.map(dest => {
                        const selected = data.destinations.includes(dest.code);
                        return (
                          <button
                            key={dest.code}
                            onClick={() => setData(d => ({ ...d, destinations: selected ? [] : [dest.code] }))}
                            className={`flex items-center gap-2 px-4 py-3 border rounded-xl text-sm text-left transition-all ${
                              selected
                                ? 'border-neutral-900 bg-neutral-900 text-white font-medium'
                                : 'border-neutral-200 text-neutral-700 hover:border-neutral-400'
                            }`}
                          >
                            <span className="text-xs font-bold opacity-50 w-6 flex-shrink-0">{dest.label}</span>
                            <span>{dest.name}</span>
                          </button>
                        );
                      })}
                      {CARIBBEAN_SOON.map(dest => (
                        <button key={dest.code} disabled className="flex items-center gap-2 px-4 py-3 border border-neutral-100 rounded-xl text-sm text-left opacity-40 cursor-not-allowed">
                          <span className="text-xs font-bold opacity-50 w-6 flex-shrink-0">{dest.label}</span>
                          <div>
                            <span className="block text-neutral-500">{dest.name}</span>
                            <span className="block text-[10px] text-neutral-400">Coming soon</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ── Mexico ── */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-neutral-900 mb-3">Mexico</p>
                    <div className="grid grid-cols-2 gap-2">
                      {MEXICO.map(dest => {
                        const selected = data.destinations.includes(dest.code);
                        return (
                          <button
                            key={dest.code}
                            onClick={() => setData(d => ({ ...d, destinations: selected ? [] : [dest.code] }))}
                            className={`flex items-center gap-2 px-4 py-3 border rounded-xl text-sm text-left transition-all ${
                              selected
                                ? 'border-neutral-900 bg-neutral-900 text-white font-medium'
                                : 'border-neutral-200 text-neutral-700 hover:border-neutral-400'
                            }`}
                          >
                            <span className="text-xs font-bold opacity-50 w-6 flex-shrink-0">MX</span>
                            <span>{dest.name}</span>
                          </button>
                        );
                      })}
                      {MEXICO_SOON.map(dest => (
                        <button key={dest.code} disabled className="flex items-center gap-2 px-4 py-3 border border-neutral-100 rounded-xl text-sm text-left opacity-40 cursor-not-allowed">
                          <span className="text-xs font-bold opacity-50 w-6 flex-shrink-0">MX</span>
                          <div>
                            <span className="block text-neutral-500">{dest.name}</span>
                            <span className="block text-[10px] text-neutral-400">Coming soon</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ── Central America ── */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-neutral-900 mb-3">Central America</p>
                    <div className="grid grid-cols-2 gap-2">
                      {CENTRAL_AMERICA_SOON.map(dest => (
                        <button key={dest.code} disabled className="flex items-center gap-2 px-4 py-3 border border-neutral-100 rounded-xl text-sm text-left opacity-40 cursor-not-allowed">
                          <span className="text-xs font-bold opacity-50 w-6 flex-shrink-0">{dest.label}</span>
                          <div>
                            <span className="block text-neutral-500">{dest.name}</span>
                            <span className="block text-[10px] text-neutral-400">Coming soon</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ── Europe ── */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-neutral-900 mb-3">Europe</p>
                    <div className="grid grid-cols-2 gap-2">
                      {EUROPE_SOON.map(dest => (
                        <button key={dest.code} disabled className="flex items-center gap-2 px-4 py-3 border border-neutral-100 rounded-xl text-sm text-left opacity-40 cursor-not-allowed">
                          <span className="text-xs font-bold opacity-50 w-6 flex-shrink-0">{dest.label}</span>
                          <div>
                            <span className="block text-neutral-500">{dest.name}</span>
                            <span className="block text-[10px] text-neutral-400">Coming soon</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ── South America ── */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-neutral-900 mb-1">South America</p>
                    <p className="text-xs text-neutral-400 mb-3 italic">Limited offerings</p>
                    <p className="text-xs text-neutral-400 mb-3">Contact us for options in this region.</p>
                  </div>

                  {/* ── Open to Suggestions ── */}
                  <button
                    onClick={() => setData(d => ({
                      ...d,
                      destinations: d.destinations.includes('OPEN') ? [] : ['OPEN'],
                    }))}
                    className={`w-full flex items-center gap-3 px-4 py-4 border-2 rounded-xl text-sm text-left transition-all ${
                      data.destinations.includes('OPEN')
                        ? 'border-neutral-900 bg-neutral-900 text-white font-medium'
                        : 'border-neutral-200 text-neutral-700 hover:border-neutral-400'
                    }`}
                  >
                    <span className="text-xl">🌐</span>
                    <span className="font-medium">Open to Suggestions</span>
                  </button>

                </div>
              </div>
            )}

            {/* ── STEP 4: Dates ──────────────────────────────────────────── */}
            {screen === 3 && (
              <div className="flex flex-col justify-center min-h-[55vh]">
                <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-8">What are the travel dates?</h2>

                {/* Flexible toggle */}
                <div className="flex items-center gap-3 mb-8">
                  <button
                    onClick={() => setData(d => ({ ...d, datesFlexible: !d.datesFlexible }))}
                    className={`relative w-11 h-6 rounded-full transition-colors ${data.datesFlexible ? 'bg-neutral-900' : 'bg-neutral-200'}`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${data.datesFlexible ? 'translate-x-5' : 'translate-x-0'}`}
                    />
                  </button>
                  <span className="text-sm text-neutral-600">Dates are flexible</span>
                </div>

                {data.datesFlexible ? (
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Preferred month or range</label>
                    <input
                      type="text"
                      value={data.flexibleRange}
                      onChange={e => setData(d => ({ ...d, flexibleRange: e.target.value }))}
                      placeholder="e.g. April 2026 or April - May 2026"
                      className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none transition-colors ${
                        data.flexibleRange
                          ? parseFlexibleRange(data.flexibleRange)
                            ? 'border-green-500 focus:border-green-500'
                            : 'border-red-300 focus:border-red-400'
                          : 'border-neutral-900'
                      }`}
                    />
                    {data.flexibleRange && (() => {
                      const parsed = parseFlexibleRange(data.flexibleRange);
                      if (parsed) {
                        const fmt = (d: string) =>
                          new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                        return (
                          <p className="mt-2 text-xs text-green-600 font-medium">
                            ✓ Will search {fmt(parsed.checkIn)} – {fmt(parsed.checkOut)}
                          </p>
                        );
                      }
                      return (
                        <p className="mt-2 text-xs text-neutral-400">
                          Try "April 2026" or "April - May 2026"
                        </p>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">Check-in</label>
                      <input
                        type="date"
                        value={data.checkIn}
                        onChange={e => setData(d => ({ ...d, checkIn: e.target.value }))}
                        placeholder="Select date"
                        className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-neutral-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">Check-out</label>
                      <input
                        type="date"
                        value={data.checkOut}
                        min={data.checkIn || undefined}
                        onChange={e => setData(d => ({ ...d, checkOut: e.target.value }))}
                        placeholder="Select date"
                        className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-neutral-900"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── STEP 5: Bedrooms ───────────────────────────────────────── */}
            {screen === 4 && (
              <div className="flex flex-col justify-center min-h-[55vh]">
                <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-8">Minimum bedrooms required?</h2>

                <div className="flex flex-wrap gap-3">
                  {BEDROOM_OPTIONS.map(opt => {
                    const val = opt === '9+' ? 9 : opt as number;
                    const selected = data.bedrooms === val;
                    return (
                      <button
                        key={opt}
                        onClick={() => setData(d => ({ ...d, bedrooms: selected ? null : val }))}
                        className={`w-16 h-16 rounded-2xl border-2 text-lg font-semibold transition-all ${
                          selected
                            ? 'border-neutral-900 bg-neutral-900 text-white'
                            : 'border-neutral-200 text-neutral-700 hover:border-neutral-400'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Footer nav */}
        <div className="border-t border-neutral-100 px-6 md:px-10 py-4">
          <div className="max-w-lg mx-auto flex items-center justify-between">
            {screen !== -1 ? (
              <button
                onClick={goBack}
                className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
              >
                <ChevronLeft size={16} /> Back
              </button>
            ) : <div />}

            {screen !== -1 && (
              <button
                onClick={goNext}
                disabled={!canContinue()}
                className={`flex items-center gap-2 font-semibold text-sm px-8 py-3 rounded-xl transition-all uppercase tracking-wide ${
                  canContinue()
                    ? 'bg-neutral-900 text-white hover:bg-neutral-700'
                    : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                }`}
              >
                {screen === 4 ? (
                  <>Generate Quote <ArrowRight size={15} /></>
                ) : (
                  <>Continue <ChevronRight size={15} /></>
                )}
              </button>
            )}
          </div>

          {/* Progress bar bottom */}
          {screen >= 0 && (
            <div className="max-w-lg mx-auto mt-3">
              <ProgressBar step={screen + 1} total={TOTAL_STEPS} />
            </div>
          )}
        </div>

      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
}