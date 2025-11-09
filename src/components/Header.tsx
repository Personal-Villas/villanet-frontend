import { useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, User, Home, MessageCircle, Download, UserCircle } from 'lucide-react';
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
  showAuthButton?: boolean;
  onAuthClick?: () => void;
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
  showAuthButton = false, 
  onAuthClick, 
}: HeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/properties'); 
  };

  return (
    <>
      <header className="border-b border-neutral-200 sticky top-0 bg-white z-50 shadow-sm">
        <div className="max-w-[1600px] mx-auto pl-4 pr-[max(env(safe-area-inset-right),1rem)] sm:px-6 lg:px-12 py-3 sm:py-4">
          <div className="grid grid-cols-[auto,1fr,auto] items-center gap-2 sm:gap-4">
            
            {/* Logo - Se oculta en mobile cuando showNavbarSearch es true */}
            <div
              className={`flex items-center shrink-0 transition-all duration-300 ${
                showNavbarSearch
                  ? 'opacity-0 scale-95 w-0 overflow-hidden sm:opacity-100 sm:scale-100 sm:w-auto sm:overflow-visible'
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

            {/* SearchBar - En mobile ocupa todo el ancho cuando showNavbarSearch es true */}
            <div
              className={`min-w-0 transition-all duration-300 ${
                showNavbarSearch 
                  ? 'opacity-100 scale-100 flex justify-center col-span-2 sm:col-span-1' 
                  : 'opacity-0 scale-95 pointer-events-none hidden sm:flex justify-center'
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

            {/* Acciones Desktop - Se ocultan en mobile cuando showNavbarSearch es true */}
            <div className={`items-center gap-2 sm:gap-2 shrink-0 justify-end ${
              showNavbarSearch ? 'hidden sm:flex' : 'flex'
            }`}>
              
              {/* BOTÓN DE AUTH CUANDO NO HAY USUARIO */}
              {showAuthButton && !user && (
                <button
                  onClick={onAuthClick}
                  className="px-4 py-2 rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 transition font-medium flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm">Join for free</span>
                </button>
              )}

              {/* INFO DEL USUARIO CUANDO ESTÁ LOGUEADO */}
              {user && (
                <>
                  <span className="text-xs sm:text-sm text-neutral-600 hidden lg:block truncate max-w-[150px]">
                    {user?.full_name || user?.email}
                  </span>

                  {user?.role === 'admin' && (
                    <button
                      onClick={() => navigate('/admin')}
                      className="p-2 sm:px-4 sm:py-2 rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 transition font-medium flex items-center gap-2"
                      title="Dashboard"
                    >
                      <LayoutDashboard className="w-5 h-5" />
                      <span className="hidden sm:inline text-sm">Dashboard</span>
                    </button>
                  )}

                  <button
                    onClick={handleLogout}
                    className="text-neutral-600 hover:text-neutral-900 transition p-2 rounded-lg hover:bg-neutral-50"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ========== BOTTOM NAVIGATION - Solo Mobile ========== */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 z-50">
        <div className="grid grid-cols-4 h-16">
          
          <button
            onClick={() => navigate('/properties')}
            className="flex flex-col items-center justify-center gap-1 text-neutral-900 hover:bg-neutral-50 transition active:scale-95"
          >
            <Home className="w-5 h-5" />
            <span className="text-xs font-medium">Explore</span>
          </button>

          <button
            onClick={() => console.log('Concierge')}
            className="flex flex-col items-center justify-center gap-1 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition active:scale-95"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-xs font-medium">Concierge</span>
          </button>

          <button
            onClick={() => window.open('https://your-app-link.com', '_blank')}
            className="flex flex-col items-center justify-center gap-1 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition active:scale-95"
          >
            <Download className="w-5 h-5" />
            <span className="text-xs font-medium">Get the app</span>
          </button>

          {user ? (
            <button
              onClick={() => navigate('/profile')}
              className="flex flex-col items-center justify-center gap-1 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition active:scale-95"
            >
              <UserCircle className="w-5 h-5" />
              <span className="text-xs font-medium">Profile</span>
            </button>
          ) : (
            <button
              onClick={onAuthClick}
              className="flex flex-col items-center justify-center gap-1 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition active:scale-95"
            >
              <UserCircle className="w-5 h-5" />
              <span className="text-xs font-medium">Sign in</span>
            </button>
          )}
        </div>
      </nav>
    </>
  );
}