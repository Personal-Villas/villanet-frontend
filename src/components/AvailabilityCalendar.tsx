import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Moon } from 'lucide-react';


const addDays = (d: Date, n: number) => { 
  const x = new Date(d); 
  x.setDate(x.getDate() + n); 
  return x; 
};

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
  const labels = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  return (
    <>
      {labels.map(l => (
        <div key={l} className="text-xs font-semibold text-gray-700 text-center py-2.5 bg-white border-r border-b border-gray-200 last:border-r-0">
          {l}
        </div>
      ))}
    </>
  );
}

function MonthGrid({ ym, days }: { ym: string; days: Day[] }) {
  const [Y, M] = ym.split('-').map(Number);
  const first = new Date(Y, M - 1, 1);
  const startWeekday = first.getDay();
  const numDays = new Date(Y, M, 0).getDate();

  const byDay = new Map<number, Day>();
  for (const d of days) {
    const dayNum = Number(d.date.slice(8, 10));
    byDay.set(dayNum, d);
  }

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(<div key={`pad-${i}`} className="p-2" />);
  for (let day = 1; day <= numDays; day++) {
    const info = byDay.get(day);
    const available = info
      ? (info.allotment != null ? info.allotment > 0 : info.status === 'available')
      : null;
    
    const bgColor = 
      available === true  ? 'bg-white hover:bg-gray-50' :
      available === false ? 'bg-gray-100' :
                            'bg-white hover:bg-gray-50';
    
    const priceColor = available === false ? 'text-gray-400' : 'text-gray-900';
    const dayColor = available === false ? 'text-gray-400' : 'text-gray-600';
    
    cells.push(
      <div 
        key={day} 
        className={`p-2 border-r border-b border-gray-200 transition-colors ${bgColor} ${available === false ? 'cursor-not-allowed' : 'cursor-pointer'} min-h-[90px] flex flex-col`}
      >
        <div className={`text-xs mb-2 font-medium ${dayColor} text-right`}>
          {String(day).padStart(2,'0')}
        </div>
        <div className={`lg:text-sm text-[10px] underline decoration-gray-300 underline-offset-4 font-semibold mb-2 ${priceColor} text-center`}>
          ${Number.isFinite(info?.price as any) ? `${(info!.price as number).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : ''}
        </div>
        <div className="mt-auto flex items-center justify-center gap-2">
          {info?.allotment != null && (
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <span>{info.allotment}</span>
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            </div>
          )}
          {info?.minStay != null && info.minStay > 1 && (
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <span>{info.minStay}</span>
              <Moon className="w-3.5 h-3.5" />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="text-base font-bold p-4 bg-white border-b border-gray-200 text-gray-900">
        {first.toLocaleString('en-US', { month:'long', year:'numeric' })}
      </div>
      <div className="grid grid-cols-7">
        <WeekHeader />
        {cells}
      </div>
    </div>
  );
}

interface AvailabilityCalendarProps {
  days: Day[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

export default function AvailabilityCalendar({ days, loading, error, onRetry }: AvailabilityCalendarProps) {
  const [start, setStart] = useState(() => {
    const s = new Date();
    s.setDate(1);
    return s;
  });
  

  const months = useMemo(() => {
    const map = new Map<string, Day[]>();
    for (const d of days) {
      const key = d.date.slice(0,7);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(d);
    }
    return Array.from(map.entries()).sort(([a],[b]) => a < b ? -1 : 1);
  }, [days]);

  const prevMonth = () => setStart(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setStart(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  return (
    <div className="bg-white p-4 lg:p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 lg:mb-6 gap-3">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg lg:text-xl font-semibold">Availability Calendar</h2>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={prevMonth} 
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors bg-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-xs lg:text-sm text-gray-700 min-w-[160px] lg:min-w-[200px] text-center font-medium">
            {start.toLocaleString(undefined, { month:'short', year:'numeric' })} – {addDays(new Date(start), 45).toLocaleString(undefined, { month:'short', year:'numeric' })}
          </span>
          <button 
            onClick={nextMonth} 
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors bg-white"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4 text-xs lg:text-sm">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-white border-2 border-gray-300"></div>
          <span className="text-gray-600">Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-gray-200 border-2 border-gray-300"></div>
          <span className="text-gray-600">Unavailable</span>
        </div>
      </div>

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
        <div className="grid lg:grid-cols-2 gap-4 lg:gap-6">
          {months.slice(0, 2).map(([ym, arr]) => (
            <MonthGrid key={ym} ym={ym} days={arr} />
          ))}
        </div>
      )}
    </div>
  );
}