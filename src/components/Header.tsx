import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  LayoutDashboard, 
  User, 
  Home, 
  MessageCircle, 
  Download, 
  UserCircle,
  Menu,
  X
} from 'lucide-react';
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

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

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
              
              {/* BOTÓN DE AUTH + MENÚ CUANDO NO HAY USUARIO */}
              {showAuthButton && !user && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={onAuthClick}
                    className="px-4 py-2 rounded-full text-neutral-900 border border-neutral-200 hover:text-neutral-800 transition flex items-center gap-2"
                  >
                    <span className="text-sm">Join for free</span>
                  </button>

                  {/* Menú tipo Wander - SOLO DESKTOP */}
                  <div 
                    ref={menuRef}
                    className="relative hidden sm:block"
                  >
                    <button
                      type="button"
                      onClick={() => setMenuOpen(o => !o)}
                      className="w-10 h-10 rounded-full border border-neutral-200 flex items-center justify-center hover:bg-neutral-50 transition"
                    >
                      {menuOpen ? (
                        <X className="w-4 h-4" />
                      ) : (
                        <Menu className="w-4 h-4" />
                      )}
                    </button>

                    {menuOpen && (
                      <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-neutral-200 p-3">
                        <div className="px-3 pb-3">
                          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                            Unlock access and rewards
                          </p>
                          <button
                            onClick={onAuthClick}
                            className="mt-2 w-full rounded-full bg-neutral-900 text-white text-sm font-medium py-2.5 hover:bg-neutral-800 transition"
                          >
                            Log in or sign up
                          </button>
                        </div>

                        <div className="border-t border-neutral-200 my-2" />

                        <div className="flex flex-col gap-1 px-3 pb-2 text-sm text-neutral-800">
                          <button className="flex items-center justify-between py-1 hover:text-neutral-900">
                            <span>Download mobile app</span>
                          </button>
                          <button className="flex items-center justify-between py-1 hover:text-neutral-900">
                            <span>List on Villanet</span>
                          </button>
                          <button className="flex items-center justify-between py-1 hover:text-neutral-900">
                            <span>Help Center</span>
                          </button>
                        </div>

                        <div className="border-t border-neutral-200 my-2" />

                        <div className="px-3 pb-1">
                          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
                            <span>Theme</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button className="w-7 h-7 rounded-full border border-neutral-200 text-xs">
                              ☾
                            </button>
                            <button className="w-7 h-7 rounded-full border border-neutral-900 text-xs">
                              ●
                            </button>
                            <button className="w-7 h-7 rounded-full border border-neutral-200 text-xs">
                              🖥
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
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
