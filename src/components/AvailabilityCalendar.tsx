import { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

type Day = {
  date: string;
  status: string | null;
  allotment: number | null;
  price: number | null;
  cta: boolean | null;
  ctd: boolean | null;
  minStay: number | null;
};

function WeekHeader() {
  const labels = ['Su','Mo','Tu','We','Th','Fr','Sa'];
  return (
    <tr className="flex w-full">
      {labels.map(l => (
        <th key={l} scope="col" className="text-gray-600 rounded-md w-full font-normal text-[0.8rem]">
          {l}
        </th>
      ))}
    </tr>
  );
}

function MonthGrid({ ym, days }: { ym: string; days: Day[] }) {
  const [Y, M] = ym.split('-').map(Number);
  const first = new Date(Y, M - 1, 1);
  const startWeekday = first.getDay();
  const numDays = new Date(Y, M, 0).getDate();
  const prevMonthDays = new Date(Y, M - 1, 0).getDate();

  const byDay = new Map<number, Day>();
  for (const d of days) {
    const dayNum = Number(d.date.slice(8, 10));
    byDay.set(dayNum, d);
  }

  const rows = [];
  let cells = [];
  
  // Previous month days
  for (let i = startWeekday - 1; i >= 0; i--) {
    cells.push(
      <td key={`prev-${i}`} className="relative p-0 text-center text-sm focus-within:relative focus-within:z-20 w-full">
        <button 
          className="rdp-button_reset rdp-button h-9 w-full p-0 font-normal hover:bg-gray-50 rounded-md border border-gray-200 text-gray-400 opacity-50"
          type="button"
          tabIndex={-1}
        >
          {prevMonthDays - i}
        </button>
      </td>
    );
  }

  // Current month days
  for (let day = 1; day <= numDays; day++) {
    const info = byDay.get(day);
    const available = info
      ? (info.allotment != null ? info.allotment > 0 : info.status === 'available')
      : true;
    
    const isBlocked = available === false;
    const baseClasses = "rdp-button_reset rdp-button h-9 w-full p-0 font-normal hover:bg-gray-50 rounded-md border border-gray-200";
    const blockedClasses = isBlocked ? "bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300 line-through" : "";
    
    cells.push(
      <td key={day} className="relative p-0 text-center text-sm focus-within:relative focus-within:z-20 w-full">
        <button 
          className={`${baseClasses} ${blockedClasses}`}
          type="button"
          tabIndex={day === 1 ? 0 : -1}
        >
          {day}
        </button>
      </td>
    );

    if (cells.length === 7) {
      rows.push(<tr key={`week-${rows.length}`} className="flex w-full mt-2">{cells}</tr>);
      cells = [];
    }
  }

  // Next month days to complete the last week
  if (cells.length > 0) {
    const remainingDays = 7 - cells.length;
    for (let i = 1; i <= remainingDays; i++) {
      cells.push(
        <td key={`next-${i}`} className="relative p-0 text-center text-sm focus-within:relative focus-within:z-20 w-full">
          <button 
            className="rdp-button_reset rdp-button h-9 w-full p-0 font-normal hover:bg-gray-50 rounded-md border border-gray-200 text-gray-400 opacity-50"
            type="button"
            tabIndex={-1}
          >
            {i}
          </button>
        </td>
      );
    }
    rows.push(<tr key={`week-${rows.length}`} className="flex w-full mt-2">{cells}</tr>);
  }

  return (
    <div className="bg-white rounded-lg p-4 border border-[#E9E9E9]">
      <div className="rdp p-3 pointer-events-auto w-full">
        <div className="w-full">
          <div className="w-full rdp-caption_start rdp-caption_end">
            <div className="flex justify-center pt-1 relative items-center mb-4">
              <div className="text-base font-semibold text-gray-900">
                {first.toLocaleString('en-US', { month:'long', year:'numeric' })}
              </div>
            </div>
            <table className="w-full border-collapse">
              <thead className="rdp-head">
                <WeekHeader />
              </thead>
              <tbody className="rdp-tbody">
                {rows}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

interface AvailabilityCalendarProps {
  days: Day[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  start: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export default function AvailabilityCalendar({ days, loading, error, onRetry, start, onPrevMonth, onNextMonth }: AvailabilityCalendarProps) {

  const [mobileIndex, setMobileIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const months = useMemo(() => {
    const map = new Map<string, Day[]>();
    for (const d of days) {
      const key = d.date.slice(0,7);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(d);
    }
    return Array.from(map.entries()).sort(([a],[b]) => a < b ? -1 : 1);
  }, [days]);


  const visibleMonths = useMemo(() => {
    const result = [];
    const currentYm = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`;
    
    const currentIndex = months.findIndex(([ym]) => ym === currentYm);
    
    if (currentIndex >= 0) {
      // Siempre mostrar exactamente 2 meses
      for (let i = 0; i < 2 && currentIndex + i < months.length; i++) {
        result.push(months[currentIndex + i]);
      }
    }
    
    // Si no hay suficientes meses, completar con meses vacíos para mantener el layout
    while (result.length < 2) {
      result.push([`empty-${result.length}`, []]);
    }
    
    return result;
  }, [months, start]); 

  const allMonthsForMobile = useMemo(() => {
    return months;
  }, [months]);

  const handleMobilePrev = () => {
    if (mobileIndex > 0) {
      setMobileIndex(prev => prev - 1);
    }
  };

  const handleMobileNext = () => {
    if (mobileIndex < allMonthsForMobile.length - 1) {
      setMobileIndex(prev => prev + 1);
    }
  };

  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollWidth = container.scrollWidth / allMonthsForMobile.length;
      container.scrollTo({
        left: scrollWidth * mobileIndex,
        behavior: 'smooth'
      });
    }
  }, [mobileIndex, allMonthsForMobile.length]);

  return (
    <>
      {error && (
        <div className="mb-4 p-3 lg:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div>
              <h3 className="text-yellow-800 font-medium text-sm lg:text-base">Availability Unavailable</h3>
              <p className="text-yellow-600 text-xs lg:text-sm mt-1">{error}</p>
            </div>
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition text-xs lg:text-sm font-medium"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
          <p className="text-neutral-600">Loading availability...</p>
        </div>
      )}

      {!loading && days.length === 0 && !error && (
        <div className="p-8 text-center text-neutral-600">
          <Calendar className="w-12 h-12 mx-auto mb-2 text-neutral-400" />
          <p>No availability data for this period</p>
        </div>
      )}

      {!loading && days.length > 0 && (
        <>
          {/* Desktop View */}
          <div className="hidden md:block">
            <div className="relative">
              <div className="flex items-center justify-between mb-6 max-w-5xl mx-auto">
                <button 
                  onClick={onPrevMonth} // ✅ Usando la función del padre
                  className="p-2 rounded-lg hover:bg-gray-200 transition-colors text-gray-600 hover:text-gray-900"
                  aria-label="Previous months"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button 
                  onClick={onNextMonth} // ✅ Usando la función del padre
                  className="p-2 rounded-lg hover:bg-gray-200 transition-colors text-gray-600 hover:text-gray-900"
                  aria-label="Next months"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
              
              {/* Calendarios centrados y con buen espacio */}
              <div className="flex justify-center">
                <div className="grid grid-cols-2 gap-8 w-full max-w-4xl mx-auto">
                  {visibleMonths.map(([ym, arr]) => (
                    (ym as string).startsWith('empty-') ? (
                      <div key={ym as string} className="bg-white rounded-lg p-4 border border-[#E9E9E9] opacity-0">
                        {/* Mes vacío para mantener el layout */}
                      </div>
                    ) : (
                      <MonthGrid key={ym as string} ym={ym as string} days={arr as Day[]} />
                    )
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile View */}
          <div className="block md:hidden">
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <button 
                  onClick={handleMobilePrev}
                  disabled={mobileIndex === 0}
                  className="p-2 rounded-lg hover:bg-gray-200 transition-colors text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <span className="text-sm font-medium text-gray-700">
                  {mobileIndex + 1} / {allMonthsForMobile.length}
                </span>
                <button 
                  onClick={handleMobileNext}
                  disabled={mobileIndex === allMonthsForMobile.length - 1}
                  className="p-2 rounded-lg hover:bg-gray-200 transition-colors text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Next month"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
              <div className="overflow-hidden" ref={scrollContainerRef}>
                <div className="flex transition-transform duration-300" style={{ transform: `translateX(-${mobileIndex * 100}%)` }}>
                  {allMonthsForMobile.map(([ym, arr]) => (
                    <div key={ym} className="flex-[0_0_100%] min-w-0 px-2">
                      <MonthGrid ym={ym} days={arr} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 mt-8">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-white border border-gray-200 rounded"></div>
              <span className="text-xs text-gray-600">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-300 rounded"></div>
              <span className="text-xs text-gray-600">Blocked</span>
            </div>
          </div>
        </>
      )}
    </>
  );
}