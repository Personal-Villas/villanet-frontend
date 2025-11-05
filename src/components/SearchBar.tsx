import { MapPin, Calendar, SlidersHorizontal, Search, Users } from 'lucide-react';
import { SearchInput } from './SearchInput';

interface SearchBarProps {
  query: string;
  setQuery: (query: string) => void;
  checkIn: string;
  setCheckIn: (date: string) => void;
  checkOut: string;
  setCheckOut: (date: string) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  activeFiltersCount: number;
  today: string;
  minCheckOut: string;
  compact?: boolean;
}

export function SearchBar({
  query,
  setQuery,
  checkIn,
  setCheckIn,
  checkOut,
  setCheckOut,
  showFilters,
  setShowFilters,
  activeFiltersCount,
  today,
  minCheckOut,
  compact = false
}: SearchBarProps) {
  return (
    <div className={`bg-white rounded-full shadow-lg border border-neutral-200 p-2 flex items-center gap-2 transition-all duration-300 ${
      compact ? 'max-w-2xl' : 'max-w-4xl'
    }`}>
      <div className="flex-1 flex items-center px-4">
        <MapPin className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-neutral-400 mr-3 flex-shrink-0`} />
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Wherever"
          className={`w-full ${compact ? 'py-2 text-sm' : 'py-3'} focus:outline-none text-neutral-700 placeholder-neutral-400`}
        />
      </div>
      
      {/* Dates - siempre visible pero más compacto en modo compact */}
      <div className={`hidden sm:flex items-center gap-2 border-l border-neutral-200 pl-3 pr-2 ${
        compact ? 'scale-90' : ''
      }`}>
        <Calendar className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-neutral-400 flex-shrink-0`} />
        <input
          type="date"
          className={`${compact ? 'py-2 text-xs' : 'py-3 text-sm'} focus:outline-none text-neutral-700 min-w-0 w-28`}
          value={checkIn}
          onChange={(e) => setCheckIn(e.target.value)}
          min={today}
        />
        <span className="text-neutral-400 text-xs">→</span>
        <input
          type="date"
          className={`${compact ? 'py-2 text-xs' : 'py-3 text-sm'} focus:outline-none text-neutral-700 min-w-0 w-28`}
          value={checkOut}
          onChange={(e) => setCheckOut(e.target.value)}
          min={minCheckOut}
          disabled={!checkIn}
        />
      </div>
      
      {/* Guests - solo visible en modo NO compact */}
      {!compact && (
        <div className="hidden md:flex items-center gap-2 border-l border-neutral-200 pl-4 pr-2">
          <Users className="w-5 h-5 text-neutral-400" />
          <span className="text-neutral-700 text-sm py-3">Whoever</span>
        </div>
      )}
      
      <button
        onClick={() => setShowFilters(!showFilters)}
        className={`flex items-center gap-2 px-3 ${compact ? 'py-2' : 'py-3'} text-neutral-700 hover:text-neutral-900 transition font-medium`}
      >
        <SlidersHorizontal className={`${compact ? 'w-4 h-4' : 'w-5 h-5'}`} />
        {activeFiltersCount > 0 && (
          <span className="bg-neutral-900 text-white text-xs font-medium px-2 py-1 rounded-full">
            {activeFiltersCount}
          </span>
        )}
      </button>
      
      <button className={`bg-neutral-900 text-white ${compact ? 'px-4 py-2' : 'px-6 py-3'} rounded-full hover:bg-neutral-800 transition font-medium flex items-center gap-2`}>
        <Search className={`${compact ? 'w-4 h-4' : 'w-5 h-5'}`} />
        {!compact && <span>Search</span>}
      </button>
    </div>
  );
}