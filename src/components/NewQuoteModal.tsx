import { useEffect, useState, useCallback } from 'react';
import { useQuotePreload, type PreloadFilters } from '../context/QuotePreloadContext';
import ReactDOM from 'react-dom';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { X, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';

// ── Types ─────────────────────────────────────────────────────────────────────
interface QuoteData {
  budget: number;
  budgetFlexible: boolean; // show options up to 20% above budget
  adults: number;
  children: number;
  infants: number;
  destinations: string[]; // multi-select: array of destination codes
  checkIn: string;
  checkOut: string;
  bedrooms: number | null;
}

const INITIAL: QuoteData = {
  budget: 15000,
  budgetFlexible: false,
  adults: 2,
  children: 0,
  infants: 0,
  destinations: [],
  checkIn: '',
  checkOut: '',
  bedrooms: null,
};

// ── Destinations data ─────────────────────────────────────────────────────────
const CARIBBEAN: { code: string; name: string }[] = [
  { code: 'STBARTS',  name: 'St. Barthélemy (St. Barts)' },
  { code: 'TC',       name: 'Turks & Caicos' },
  { code: 'MF',       name: 'St. Martin / St. Maarten' },
  { code: 'BB',       name: 'Barbados' },
  { code: 'JM',       name: 'Jamaica' },
  { code: 'VG',       name: 'British Virgin Islands' },
  { code: 'DO-CDC',   name: 'Casa de Campo, Dominican Republic' },
  { code: 'DO-PC',    name: 'Punta Cana, Dominican Republic' },
  { code: 'DO-CC',    name: 'Cap Cana, Dominican Republic' },
  { code: 'KY',       name: 'Cayman Islands' },
  { code: 'BS',       name: 'Bahamas' },
  { code: 'AI',       name: 'Anguilla' },
];

const MEXICO: { code: string; name: string }[] = [
  { code: 'MX-PTM',  name: 'Punta Mita, Mexico' },
  { code: 'MX-PVR',  name: 'Puerto Vallarta, Mexico' },
  { code: 'MX-RMY',  name: 'Riviera Maya, Mexico' },
  { code: 'MX-ZIH',  name: 'Zihuatanejo, Mexico' },
];

const CENTRAL_AMERICA: { code: string; name: string }[] = [
  { code: 'CR',      name: 'Costa Rica' },
];

const EUROPE: { code: string; name: string }[] = [
  { code: 'GR',      name: 'Greece' },
];

// Código → nombre para el API / Properties
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
  'CR':      'Costa Rica',
  'GR':      'Greece',
};

const BEDROOM_OPTIONS = [3, 4, 5, 6, 7, 8, 9];

// ── Budget helpers ────────────────────────────────────────────────────────────
const formatBudget = (n: number) =>
  n >= 100000 ? '$100,000+' : `$${n.toLocaleString()}`;

const BUDGET_MIN = 3000;
const BUDGET_MAX = 100000;

function budgetToSlider(value: number): number {
  const minLog = Math.log(BUDGET_MIN);
  const maxLog = Math.log(BUDGET_MAX);
  return ((Math.log(Math.min(value, BUDGET_MAX)) - minLog) / (maxLog - minLog)) * 100;
}

function sliderToBudget(pct: number): number {
  const minLog = Math.log(BUDGET_MIN);
  const maxLog = Math.log(BUDGET_MAX);
  const raw = Math.exp(minLog + (pct / 100) * (maxLog - minLog));
  if (raw < 5000)  return Math.round(raw / 500) * 500;
  if (raw < 20000) return Math.round(raw / 1000) * 1000;
  if (raw < 50000) return Math.round(raw / 2500) * 2500;
  return Math.round(raw / 5000) * 5000;
}

// ── Date helpers ──────────────────────────────────────────────────────────────
function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// ── Calendar Component ────────────────────────────────────────────────────────
function Calendar({
  checkIn,
  checkOut,
  onSelect,
}: {
  checkIn: string;
  checkOut: string;
  onSelect: (date: string) => void;
}) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-based

  const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate());

  const MONTH_NAMES = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December',
  ];
  const DAY_HEADERS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const cells: (number | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-4 w-full max-w-[340px]">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
        >
          <ChevronLeft size={14} />
        </button>
        <span className="text-sm font-semibold text-neutral-900">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>
        <button
          onClick={nextMonth}
          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_HEADERS.map(d => (
          <div key={d} className="text-[11px] text-neutral-400 text-center font-medium py-1">{d}</div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((day, idx) => {
          if (!day) return <div key={idx} />;
          const dateStr = toDateStr(viewYear, viewMonth, day);
          const isPast = dateStr < todayStr;
          const isToday = dateStr === todayStr;
          const isStart = dateStr === checkIn;
          const isEnd = dateStr === checkOut;
          const inRange = checkIn && checkOut && dateStr > checkIn && dateStr < checkOut;

          let cellClass = 'relative h-8 w-full text-[13px] font-medium transition-colors ';
          if (isPast) {
            cellClass += 'text-neutral-300 cursor-not-allowed ';
          } else if (isStart || isEnd) {
            cellClass += 'bg-neutral-900 text-white rounded-full ';
          } else if (inRange) {
            cellClass += 'bg-neutral-100 text-neutral-800 rounded-none ';
          } else if (isToday) {
            cellClass += 'text-neutral-500 font-bold hover:bg-neutral-100 rounded-full cursor-pointer ';
          } else {
            cellClass += 'text-neutral-800 hover:bg-neutral-100 rounded-full cursor-pointer ';
          }

          return (
            <button
              key={idx}
              onClick={() => !isPast && onSelect(dateStr)}
              disabled={isPast}
              className={cellClass}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Progress bar ──────────────────────────────────────────────────────────────
function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="w-full h-1 bg-neutral-200 rounded-full overflow-hidden">
      <div
        className="h-full bg-neutral-900 transition-all duration-300 rounded-full"
        style={{ width: `${(step / total) * 100}%` }}
      />
    </div>
  );
}

// ── Counter ───────────────────────────────────────────────────────────────────
function Counter({
  label,
  sublabel,
  note,
  value,
  onDec,
  onInc,
  min = 0,
}: {
  label: string;
  sublabel?: string;
  note?: string;
  value: number;
  onDec: () => void;
  onInc: () => void;
  min?: number;
}) {
  return (
    <div className="flex items-start justify-between py-5 border-b border-neutral-100 last:border-0">
      <div>
        <p className="text-base font-medium text-neutral-900">{label}</p>
        {sublabel && <p className="text-sm text-neutral-400 mt-0.5">{sublabel}</p>}
        {note && <p className="text-xs text-neutral-400 mt-1 italic">{note}</p>}
      </div>
      <div className="flex items-center gap-4 mt-1">
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

// ── Toggle ────────────────────────────────────────────────────────────────────
function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 group"
      type="button"
    >
      <div className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-neutral-900' : 'bg-neutral-200'}`}>
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`}
        />
      </div>
      <span className="text-sm text-neutral-600 group-hover:text-neutral-900 transition-colors text-left">{label}</span>
    </button>
  );
}

// ── Main Modal ────────────────────────────────────────────────────────────────
export function NewQuoteModal({ onBrowseAll }: { onBrowseAll?: () => void } = {}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const isOpen = searchParams.get('quoteFlow') === 'true';
  const { triggerPreload } = useQuotePreload();

  // Step order:
  //   screen -1 = intro
  //   screen  0 = Step 1/5 Dates
  //   screen  1 = Step 2/5 Budget
  //   screen  2 = Step 3/5 Guests
  //   screen  3 = Step 4/5 Bedrooms
  //   screen  4 = Step 5/5 Destinations
  const [screen, setScreen] = useState<-1 | 0 | 1 | 2 | 3 | 4>(-1);
  const [data, setData] = useState<QuoteData>(INITIAL);

  // Loader shown after "Generate Quote" while Properties loads

  // Calendar state
  const [calendarTarget, setCalendarTarget] = useState<'checkIn' | 'checkOut'>('checkIn');
  const [showCalendar, setShowCalendar] = useState(false);

  const TOTAL_STEPS = 5;

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setScreen(-1);
      setData(INITIAL);
      setShowCalendar(false);
      setCalendarTarget('checkIn');
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

  // Background preload — fires whenever user advances a step
  useEffect(() => {
    if (!isOpen || screen < 0) return;

    const preloadFilters: PreloadFilters = {};

    // Dates available from step 0 onward
    if (data.checkIn && data.checkOut) {
      preloadFilters.checkIn  = data.checkIn;
      preloadFilters.checkOut = data.checkOut;
    }

    // Budget from step 1 — total stay budget (backend descuenta fees fijos y compara contra sum de noches)
    if (screen >= 1 && data.budget < 100_000) {
      const totalBudget = data.budgetFlexible
        ? Math.round(data.budget * 1.2)
        : data.budget;
      preloadFilters.maxTotalBudget = totalBudget;
    }

    // Guests from step 2 — infants do NOT count
    if (screen >= 2) {
      const total = data.adults + data.children;
      if (total > 0) preloadFilters.guests = total;
    }

    // Bedrooms from step 3
    if (screen >= 3 && data.bedrooms) {
      preloadFilters.bedrooms = data.bedrooms;
    }

    // Destinations from step 4 — multi-select
    if (screen >= 4 && data.destinations.length > 0) {
      const mapped = data.destinations
        .map(code => DEST_CODE_TO_NAME[code])
        .filter(Boolean);
      if (mapped.length > 0) preloadFilters.destination = mapped.join('|');
    }

    triggerPreload(preloadFilters);
  }, [isOpen, screen, data, triggerPreload]);

  const goNext = () => {
    if (screen === -1) { setScreen(0); return; }
    if (screen < 4) setScreen((s) => (s + 1) as any);
    else handleFinish();
  };

  const goBack = () => {
    if (screen === 0) setScreen(-1);
    else if (screen > 0) setScreen((s) => (s - 1) as any);
  };

  // Calendar selection logic
  const handleCalendarSelect = (dateStr: string) => {
    if (calendarTarget === 'checkIn') {
      if (data.checkOut && dateStr >= data.checkOut) {
        setData(d => ({ ...d, checkIn: dateStr, checkOut: '' }));
      } else {
        setData(d => ({ ...d, checkIn: dateStr }));
      }
      setCalendarTarget('checkOut');
    } else {
      if (dateStr <= data.checkIn) {
        // Clicked before checkIn → restart
        setData(d => ({ ...d, checkIn: dateStr, checkOut: '' }));
        setCalendarTarget('checkOut');
      } else {
        setData(d => ({ ...d, checkOut: dateStr }));
        setShowCalendar(false);
        setCalendarTarget('checkIn');
      }
    }
  };

  const handleFinish = () => {
    const params = new URLSearchParams();

    // Budget: total stay budget — backend descuenta fees fijos y filtra por sum de noches en listing_availability
    if (data.budget && data.budget < 100000) {
      const totalBudget = data.budgetFlexible
        ? Math.round(data.budget * 1.2)
        : data.budget;
      params.set('maxTotalBudget', String(totalBudget));
    }

    // Bedrooms
    if (data.bedrooms) params.set('bedrooms', String(data.bedrooms));

    // Destinations — multi-select, sent as comma-separated names
    if (data.destinations.length > 0) {
      const destNames = data.destinations
        .map(code => DEST_CODE_TO_NAME[code])
        .filter(Boolean);
      if (destNames.length > 0) params.set('destinations', destNames.join('|'));
    }

    // Dates
    if (data.checkIn)  params.set('checkIn',  data.checkIn);
    if (data.checkOut) params.set('checkOut', data.checkOut);

    // Guests — infants do NOT count toward occupancy
    const totalGuests = data.adults + data.children;
    if (totalGuests > 0) params.set('guests', String(totalGuests));

    params.set('fromQuote', 'true');

    // Navigate directly to Properties with quote params
    const url = `/properties?${params.toString()}`;
    navigate(url);
  };

  const canContinue = (): boolean => {
    if (screen === 0) return !!(data.checkIn && data.checkOut); // Dates required
    if (screen === 4) return data.destinations.length > 0;   // At least one dest required
    return true;
  };

  if (!isOpen) return null;


  const modalContent = (
    <div className="fixed inset-0 z-[100]" style={{ fontFamily: 'inherit' }}>
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center px-6 md:px-10 py-12">
          <div className="w-full max-w-lg">

            {/* ── INTRO ─────────────────────────────────────────────────── */}
            {screen === -1 && (
              <div className="flex flex-col items-center justify-center  text-center">
                <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-3">New Quote</h1>
                <p className="text-neutral-400 mb-10">We'll ask a few quick questions to allocate the right villas.</p>
                <button
                  onClick={goNext}
                  className="bg-neutral-900 text-white font-semibold text-sm px-10 py-3.5 rounded-xl hover:bg-neutral-700 transition-colors tracking-wide uppercase"
                >
                  START
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem('searchFilters');
                    onBrowseAll?.();
                    close();
                  }}
                  className="mt-4 text-sm text-neutral-400 hover:text-neutral-700 transition-colors underline underline-offset-2"
                >
                  Browse All Villas
                </button>
              </div>
            )}

            {/* ── STEP 1/5: Dates ───────────────────────────────────────── */}
            {screen === 0 && (
              <div className="flex flex-col justify-center ">
                <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-2">When are they traveling?</h2>
                <p className="text-neutral-400 text-sm mb-8">We use travel dates to calculate accurate total stay pricing.</p>

                {/* Date fields */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Check-in</label>
                    <button
                      onClick={() => { setCalendarTarget('checkIn'); setShowCalendar(true); }}
                      className={`w-full px-4 py-3 border rounded-xl text-sm text-left transition-colors ${
                        data.checkIn
                          ? 'border-neutral-900 text-neutral-900 font-medium'
                          : 'border-neutral-200 text-neutral-400'
                      }`}
                    >
                      {data.checkIn ? formatDateDisplay(data.checkIn) : 'Select date'}
                    </button>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Check-out</label>
                    <button
                      onClick={() => {
                        if (!data.checkIn) {
                          setCalendarTarget('checkIn');
                        } else {
                          setCalendarTarget('checkOut');
                        }
                        setShowCalendar(true);
                      }}
                      className={`w-full px-4 py-3 border rounded-xl text-sm text-left transition-colors ${
                        data.checkOut
                          ? 'border-neutral-900 text-neutral-900 font-medium'
                          : 'border-neutral-200 text-neutral-400'
                      }`}
                    >
                      {data.checkOut ? formatDateDisplay(data.checkOut) : 'Select date'}
                    </button>
                  </div>
                </div>

                {/* Calendar picker */}
                {showCalendar && (
                  <div>
                    <p className="text-xs text-neutral-500 mb-3">
                      {calendarTarget === 'checkIn' ? 'Select check-in date' : 'Select check-out date'}
                    </p>
                    <Calendar
                      checkIn={data.checkIn}
                      checkOut={data.checkOut}
                      onSelect={handleCalendarSelect}
                    />
                  </div>
                )}

                {/* Stay duration summary */}
                {data.checkIn && data.checkOut && (
                  <p className="mt-5 text-sm text-neutral-500">
                    {(() => {
                      const d1 = new Date(data.checkIn + 'T00:00:00');
                      const d2 = new Date(data.checkOut + 'T00:00:00');
                      const nights = Math.round((d2.getTime() - d1.getTime()) / 86400000);
                      return `${nights} night${nights !== 1 ? 's' : ''} · ${formatDateDisplay(data.checkIn)} – ${formatDateDisplay(data.checkOut)}`;
                    })()}
                  </p>
                )}
              </div>
            )}

            {/* ── STEP 2/5: Budget ──────────────────────────────────────── */}
            {screen === 1 && (
              <div className="flex flex-col justify-center ">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-2xl md:text-3xl font-bold text-neutral-900">
                    What is your client's total stay budget?
                  </h2>
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <button
                        className="w-6 h-6 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-400 text-xs hover:border-neutral-400 transition-colors flex-shrink-0"
                        aria-label="Budget information"
                      >?</button>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content
                        side="top"
                        align="center"
                        sideOffset={6}
                        className="z-[200] w-64 bg-white border border-neutral-200 rounded-lg shadow-md px-3 py-2"
                      >
                        <p className="text-xs text-neutral-700 text-left leading-relaxed">
                          Total budget for accommodations and staffing for their stay.
                        </p>
                        <Tooltip.Arrow className="fill-white" style={{ filter: 'drop-shadow(0 1px 1px rgb(0 0 0 / 0.1))' }} />
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                </div>
                <p className="text-neutral-400 text-sm mb-10">Total stay amount, not nightly rate.</p>

                <div className="text-center mb-8">
                  <span className="text-5xl font-bold text-neutral-900">{formatBudget(data.budget)}</span>
                </div>

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
                    <span>$3,000</span>
                    <span>$100,000+</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-6">
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

                <Toggle
                  checked={data.budgetFlexible}
                  onChange={v => setData(d => ({ ...d, budgetFlexible: v }))}
                  label="Show options up to 20% above budget"
                />
              </div>
            )}

            {/* ── STEP 3/5: Guests ──────────────────────────────────────── */}
            {screen === 2 && (
              <div className="flex flex-col justify-center ">
                <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-10">How many guests will be traveling?</h2>

                <div className="border border-neutral-100 rounded-2xl px-6 divide-y divide-neutral-100">
                  <Counter
                    label="Adults"
                    sublabel="Ages 13+"
                    note="We recommend one bedroom per couple for optimal comfort."
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

                <p className="text-xs text-neutral-400 text-center mt-3 italic">
                  Infants do not count toward occupancy limits.
                </p>

                <div className="mt-3 px-4 py-3 bg-neutral-50 rounded-xl text-center">
                  <span className="text-sm text-neutral-600">
                    Total occupancy:{' '}
                    <strong className="text-neutral-900">{data.adults + data.children} guests</strong>
                    {data.infants > 0 && (
                      <span className="text-neutral-400">
                        {' '}+ {data.infants} infant{data.infants > 1 ? 's' : ''}
                      </span>
                    )}
                  </span>
                </div>
              </div>
            )}

            {/* ── STEP 4/5: Bedrooms ────────────────────────────────────── */}
            {screen === 3 && (
              <div className="flex flex-col justify-center ">
                <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-8">Bedroom configuration required?</h2>

                <div className="flex flex-wrap gap-3">
                  {BEDROOM_OPTIONS.map(opt => {
                    const selected = data.bedrooms === opt;
                    const label = opt === 9 ? '9+' : `${opt}+`;
                    return (
                      <button
                        key={opt}
                        onClick={() => setData(d => ({ ...d, bedrooms: selected ? null : opt }))}
                        className={`w-16 h-16 rounded-2xl border-2 text-base font-semibold transition-all ${
                          selected
                            ? 'border-neutral-900 bg-neutral-900 text-white'
                            : 'border-neutral-200 text-neutral-700 hover:border-neutral-400'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── STEP 5/5: Destinations ────────────────────────────────── */}
            {screen === 4 && (
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-2">Where are they considering?</h2>
                <p className="text-neutral-400 text-sm mb-5">Select one or more destinations.</p>

                {/* Selected tags */}
                {data.destinations.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-5">
                    {data.destinations.map(code => {
                      const name = [...CARIBBEAN, ...MEXICO, ...CENTRAL_AMERICA, ...EUROPE].find(d => d.code === code)?.name || code;
                      return (
                        <span
                          key={code}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 text-white text-xs font-medium rounded-full"
                        >
                          {name}
                          <button
                            onClick={() => setData(d => ({
                              ...d,
                              destinations: d.destinations.filter(c => c !== code),
                            }))}
                            className="hover:text-neutral-300 transition-colors ml-0.5"
                            aria-label={`Remove ${name}`}
                          >
                            <X size={12} />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}

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
                            onClick={() => setData(d => ({
                              ...d,
                              destinations: selected
                                ? d.destinations.filter(c => c !== dest.code)
                                : [...d.destinations, dest.code],
                            }))}
                            className={`flex items-center px-4 py-3 border rounded-xl text-sm text-left transition-all ${
                              selected
                                ? 'border-neutral-900 bg-neutral-900 text-white font-medium'
                                : 'border-neutral-200 text-neutral-700 hover:border-neutral-400'
                            }`}
                          >
                            {dest.name}
                          </button>
                        );
                      })}
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
                            onClick={() => setData(d => ({
                              ...d,
                              destinations: selected
                                ? d.destinations.filter(c => c !== dest.code)
                                : [...d.destinations, dest.code],
                            }))}
                            className={`flex items-center px-4 py-3 border rounded-xl text-sm text-left transition-all ${
                              selected
                                ? 'border-neutral-900 bg-neutral-900 text-white font-medium'
                                : 'border-neutral-200 text-neutral-700 hover:border-neutral-400'
                            }`}
                          >
                            {dest.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* ── Central America ── */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-neutral-900 mb-3">Central America</p>
                    <div className="grid grid-cols-2 gap-2">
                      {CENTRAL_AMERICA.map(dest => {
                        const selected = data.destinations.includes(dest.code);
                        return (
                          <button
                            key={dest.code}
                            onClick={() => setData(d => ({
                              ...d,
                              destinations: selected
                                ? d.destinations.filter(c => c !== dest.code)
                                : [...d.destinations, dest.code],
                            }))}
                            className={`flex items-center px-4 py-3 border rounded-xl text-sm text-left transition-all ${
                              selected
                                ? 'border-neutral-900 bg-neutral-900 text-white font-medium'
                                : 'border-neutral-200 text-neutral-700 hover:border-neutral-400'
                            }`}
                          >
                            {dest.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* ── Europe ── */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-neutral-900 mb-3">Europe</p>
                    <div className="grid grid-cols-2 gap-2">
                      {EUROPE.map(dest => {
                        const selected = data.destinations.includes(dest.code);
                        return (
                          <button
                            key={dest.code}
                            onClick={() => setData(d => ({
                              ...d,
                              destinations: selected
                                ? d.destinations.filter(c => c !== dest.code)
                                : [...d.destinations, dest.code],
                            }))}
                            className={`flex items-center px-4 py-3 border rounded-xl text-sm text-left transition-all ${
                              selected
                                ? 'border-neutral-900 bg-neutral-900 text-white font-medium'
                                : 'border-neutral-200 text-neutral-700 hover:border-neutral-400'
                            }`}
                          >
                            {dest.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* ── Looking outside ── */}
                  <div className="pt-2 border-t border-neutral-100 text-center">
                    <p className="text-sm text-neutral-400">Looking outside these destinations?</p>
                    <p className="text-sm font-medium text-neutral-900 mt-0.5">→ Speak with our team</p>
                  </div>

                </div>

                {/* Selected summary count */}
                {data.destinations.length > 0 && (
                  <div className="mt-6 px-4 py-3 bg-neutral-50 rounded-xl flex items-center justify-between">
                    <p className="text-sm text-neutral-600">
                      <strong className="text-neutral-900">{data.destinations.length}</strong>{' '}
                      destination{data.destinations.length > 1 ? 's' : ''} selected
                    </p>
                    <button
                      onClick={() => setData(d => ({ ...d, destinations: [] }))}
                      className="text-xs text-neutral-400 hover:text-neutral-700 transition-colors"
                    >
                      Clear all
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* Footer nav */}
        <div className="border-t border-neutral-100">
          <div className="px-6 md:px-10 py-4">
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

          {screen >= 0 && (
            <div className="max-w-lg mx-auto pt-3">
              <ProgressBar step={screen + 1} total={TOTAL_STEPS} />
            </div>
          )}
          </div>
        </div>

      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
}