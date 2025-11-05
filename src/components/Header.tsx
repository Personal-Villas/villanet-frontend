import { useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { SearchBar } from './SearchBar';

interface HeaderProps {
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
  showNavbarSearch?: boolean;
}

export default function Header({
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
  showNavbarSearch = false,
}: HeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="border-b border-neutral-200 sticky top-0 bg-white z-50 shadow-sm">
      {/* safe-area padding a la derecha para iOS notches */}
      <div className="max-w-[1600px] mx-auto pl-4 pr-[max(env(safe-area-inset-right),1rem)] sm:px-6 lg:px-12 py-3 sm:py-4">
        {/* GRID: [logo][centro][acciones] */}
        <div className="grid grid-cols-[auto,1fr,auto] items-center gap-2 sm:gap-4">
          
          {/* Logo (no shrink) */}
          <div
            className={`flex items-center shrink-0 transition-all duration-300 ${
              showNavbarSearch
                ? 'sm:opacity-100 sm:scale-100 opacity-0 scale-95 w-0 sm:w-auto overflow-hidden sm:overflow-visible'
                : 'opacity-100 scale-100'
            }`}
          >
            <h1
              className="text-lg sm:text-2xl font-bold text-neutral-900 tracking-tight cursor-pointer whitespace-nowrap"
              onClick={() => navigate('/properties')}
            >
              Villanet
            </h1>
          </div>

          {/* Centro: SearchBar (cuando está oculto, no ocupa ancho pero mantiene la columna) */}
          <div
            className={`min-w-0 flex justify-center transition-all duration-300 mx-2 ${
              showNavbarSearch ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
            }`}
          >
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
              compact
            />
          </div>

          {/* Acciones (no shrink, íconos tamaño fijo en mobile) */}
          <div className="flex items-center gap-2 sm:gap-2 shrink-0 justify-end">
            <span className="text-xs sm:text-sm text-neutral-600 hidden lg:block truncate max-w-[150px]">
              {user?.full_name}
            </span>

            {user?.role === 'admin' && (
              <button
                onClick={() => navigate('/admin')}
                className="p-2 sm:px-4 sm:py-2 rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 transition font-medium flex items-center gap-2"
                title="Dashboard"
              >
                {/* Fija 20px en mobile para que no se achique */}
                <LayoutDashboard className="w-5 h-5" />
                <span className="hidden sm:inline text-sm">Dashboard</span>
              </button>
            )}

            <button
              onClick={handleLogout}
              className="text-neutral-600 hover:text-neutral-900 transition p-2 rounded-lg hover:bg-neutral-50"
              title="Logout"
            >
              {/* Fija 20px en mobile para que no se achique */}
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
