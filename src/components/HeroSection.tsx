import { SearchBar } from './SearchBar';

interface HeroSectionProps {
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
  heroSearchRef: React.RefObject<HTMLDivElement>;
}

export default function HeroSection({
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
  heroSearchRef
}: HeroSectionProps) {
  return (
    <div className="bg-gradient-to-b from-neutral-50 to-white border-b border-neutral-200">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-12 text-center">
        <h2 className="text-5xl md:text-6xl font-serif font-bold text-neutral-900 mb-4">
          Find your happy place.
        </h2>
        <p className="text-neutral-600 text-lg mb-8 max-w-2xl mx-auto">
          Never book a bad vacation home again. Every Villanet comes with hotel-grade amenities, 
          inspiring views, pristine cleaning and 24/7 concierge service.
        </p>
        <div ref={heroSearchRef} className="flex justify-center">
          <SearchBar
            query={query}
            setQuery={setQuery}
            checkIn={checkIn}
            setCheckIn={setCheckIn}
            checkOut={checkOut}
            setCheckOut={setCheckOut}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            activeFiltersCount={activeFiltersCount}
            today={today}
            minCheckOut={minCheckOut}
          />
        </div>
      </div>
    </div>
  );
}