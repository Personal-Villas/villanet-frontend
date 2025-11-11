import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const fmt = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const da = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${da}`;
};

interface DateRangeCalendarProps {
  checkInDate: string;
  checkOutDate: string;
  onCheckInSelect: (date: string) => void;
  onCheckOutSelect: (date: string) => void;
  unavailableDates: Set<string>;
}

export default function DateRangeCalendar({
  checkInDate,
  checkOutDate,
  onCheckInSelect,
  onCheckOutSelect,
  unavailableDates
}: DateRangeCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startWeekday = firstDay.getDay();
  const numDays = lastDay.getDate();

  const prevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const checkIfRangeHasUnavailable = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    let current = new Date(startDate);
    
    current.setDate(current.getDate() + 1);
    
    while (current < endDate) {
      const dateStr = fmt(current);
      if (unavailableDates.has(dateStr)) {
        return true;
      }
      current.setDate(current.getDate() + 1);
    }
    return false;
  };

  const handleDateClick = (day: number) => {
    const dateStr = fmt(new Date(year, month, day));
    const minDate = new Date().toISOString().split('T')[0];
    
    if (unavailableDates.has(dateStr)) {
      alert('This date is not available. Please select an available date.');
      return;
    }

    if (dateStr < minDate) {
      return;
    }

    if (!checkInDate || (checkInDate && checkOutDate)) {
      onCheckInSelect(dateStr);
      onCheckOutSelect('');
    } else if (checkInDate && !checkOutDate) {
      if (dateStr <= checkInDate) {
        onCheckInSelect(dateStr);
        onCheckOutSelect('');
      } else {
        const hasUnavailableInRange = checkIfRangeHasUnavailable(checkInDate, dateStr);
        if (hasUnavailableInRange) {
          alert('There are unavailable dates in this range. Please select a different range.');
          return;
        }
        onCheckOutSelect(dateStr);
      }
    }
  };

  const isInRange = (dateStr: string) => {
    if (!checkInDate || !checkOutDate) return false;
    return dateStr > checkInDate && dateStr < checkOutDate;
  };

  const cells = [];
  
  for (let i = 0; i < startWeekday; i++) {
    cells.push(<div key={`empty-${i}`} className="p-2" />);
  }

  const minDate = new Date().toISOString().split('T')[0];

  for (let day = 1; day <= numDays; day++) {
    const dateStr = fmt(new Date(year, month, day));
    const isAvailable = !unavailableDates.has(dateStr);
    const isCheckIn = checkInDate === dateStr;
    const isCheckOut = checkOutDate === dateStr;
    const isInRangeDate = isInRange(dateStr);
    const isBeforeMin = dateStr < minDate;
    const isDisabled = !isAvailable || isBeforeMin;

    let bgColor = 'bg-white hover:bg-orange-50';
    let textColor = 'text-gray-900';
    let extraClasses = '';

    if (isDisabled) {
      bgColor = 'bg-gray-100';
      textColor = 'text-gray-400';
      extraClasses = 'cursor-not-allowed';
    } else if (isCheckIn) {
      bgColor = 'bg-orange-500';
      textColor = 'text-white font-semibold';
      extraClasses = 'ring-2 ring-orange-300';
    } else if (isCheckOut) {
      bgColor = 'bg-orange-500';
      textColor = 'text-white font-semibold';
      extraClasses = 'ring-2 ring-orange-300';
    } else if (isInRangeDate) {
      bgColor = 'bg-orange-100';
      textColor = 'text-orange-900';
    }

    cells.push(
      <button
        key={day}
        type="button"
        onClick={() => !isDisabled && handleDateClick(day)}
        disabled={isDisabled}
        className={`
          p-2 text-sm rounded-lg transition-all cursor-pointer
          ${bgColor} ${textColor} ${extraClasses}
          ${!isDisabled ? 'hover:scale-105' : ''}
        `}
      >
        {day}
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-neutral-700">
        Select Check-in and Check-out Dates
      </label>
      
      <div className="border rounded-lg p-3 bg-white">
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={prevMonth}
            className="p-1 hover:bg-gray-100 rounded transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="font-semibold text-sm">
            {currentMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
          </div>
          
          <button
            type="button"
            onClick={nextMonth}
            className="p-1 hover:bg-gray-100 rounded transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
            <div key={day} className="text-xs font-medium text-gray-600 text-center p-1">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells}
        </div>

        <div className="flex items-center gap-3 mt-3 pt-3 border-t text-xs flex-wrap">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-white border border-gray-300"></div>
            <span className="text-gray-600">Available</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-gray-100"></div>
            <span className="text-gray-600">Unavailable</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-orange-500"></div>
            <span className="text-gray-600">Selected</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-orange-100"></div>
            <span className="text-gray-600">In Range</span>
          </div>
        </div>

        <div className="mt-3 space-y-2">
          {checkInDate && (
            <div className="text-sm bg-orange-50 rounded p-2">
              <span className="text-gray-600">Check-in:</span>{' '}
              <strong className="text-orange-700">
                {new Date(checkInDate + 'T00:00:00').toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </strong>
            </div>
          )}
          {checkOutDate && (
            <div className="text-sm bg-orange-50 rounded p-2">
              <span className="text-gray-600">Check-out:</span>{' '}
              <strong className="text-orange-700">
                {new Date(checkOutDate + 'T00:00:00').toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </strong>
            </div>
          )}
          {checkInDate && checkOutDate && (
            <div className="text-sm bg-blue-50 rounded p-2 text-center">
              <strong className="text-blue-700">
                {Math.ceil((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24))} nights
              </strong>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}