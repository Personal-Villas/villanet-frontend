import React, { useState } from 'react';
import { Menu, User, LogOut, Search, SlidersHorizontal, X, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { useNavigate, Link } from 'react-router-dom';

interface UnifiedHeaderProps {
  onAuthClick?: () => void;
  mode?: 'simple' | 'search';
  query?: string;
  setQuery?: (query: string) => void;
  checkIn?: string;
  setCheckIn?: (date: string) => void;
  checkOut?: string;
  setCheckOut?: (date: string) => void;
  showFilters?: boolean;
  setShowFilters?: (show: boolean) => void;
  activeFiltersCount?: number;
  today?: string;
  minCheckOut?: string;
  showNavbarSearch?: boolean;
}

export const UnifiedHeader: React.FC<UnifiedHeaderProps> = ({
  onAuthClick,
  mode = 'simple',
  query = '',
  setQuery,
  checkIn = '',
  setCheckIn,
  checkOut = '',
  setCheckOut,
  showFilters = false,
  setShowFilters,
  activeFiltersCount = 0,
  today = '',
  minCheckOut = '',
  showNavbarSearch = false,
}) => {
  const { user, loading, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      setIsMobileMenuOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const handleAuthClick = () => {
    setIsMobileMenuOpen(false);
    onAuthClick?.();
  };

  const handleAdminClick = () => {
    setIsMobileMenuOpen(false);
    if (user?.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/dashboard/profile');
    }
  };

  if (loading) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#E5E5E5]">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Logo />
            <div className="text-sm text-gray-500">Loading...</div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#E5E5E5]">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16 gap-4">
            <Logo />

            {mode === 'search' && showNavbarSearch && (
              <SearchBar
                query={query}
                setQuery={setQuery}
                checkIn={checkIn}
                setCheckIn={setCheckIn}
                checkOut={checkOut}
                setCheckOut={setCheckOut}
                today={today}
                minCheckOut={minCheckOut}
              />
            )}

            <div className="flex items-center gap-4">
              {mode === 'search' && showNavbarSearch && (
                <button
                  onClick={() => setShowFilters?.(!showFilters)}
                  className="relative hidden md:flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-full hover:border-neutral-400 transition-colors"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span className="text-sm font-medium">Filters</span>
                  {activeFiltersCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-neutral-900 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>
              )}

              {!showNavbarSearch && (
                <nav className="hidden md:flex items-center gap-8">
                  <a href="/for-travel-advisors" className="text-sm text-gray-900 font-bold hover:text-gray-600 transition-colors">Advisors</a>
                  <a href="/for-property-managers" className="text-sm text-gray-900 font-bold hover:text-gray-600 transition-colors">Property Managers</a>
                  <a href="/about" className="text-sm text-gray-900 font-bold hover:text-gray-600 transition-colors">About</a>

                  {user ? (
                    <UserMenu user={user} onLogout={handleLogout} onAdminClick={handleAdminClick} />
                  ) : (
                    <>
                      <button
                        onClick={handleAuthClick}
                        className="text-sm text-gray-900 font-bold hover:text-gray-600 transition-colors bg-transparent border-0 cursor-pointer"
                      >
                        Login
                      </button>
                      <a
                        href="/advisor-signup"
                        className="inline-flex items-center justify-center h-9 rounded-md bg-gray-900 text-white font-bold border-0 hover:bg-gray-700 text-sm px-4"
                      >
                        Join Network
                      </a>
                    </>
                  )}
                </nav>
              )}

              {showNavbarSearch && (
                <div className="hidden md:flex items-center gap-4">
                  {user ? (
                    <UserMenu user={user} onLogout={handleLogout} onAdminClick={handleAdminClick} />
                  ) : (
                    <AuthButtons onAuthClick={handleAuthClick} />
                  )}
                </div>
              )}

              <button
                onClick={toggleMobileMenu}
                className="md:hidden p-2 hover:bg-gray-100 rounded-md transition-colors"
                type="button"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6 text-gray-900" /> : <Menu className="w-6 h-6 text-gray-900" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="absolute top-0 right-0 w-80 h-full bg-white shadow-xl">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-3 border-b border-gray-200">
                <span className="text-lg font-bold text-gray-900">Menu</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-gray-100 rounded-md transition-colors">
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <nav className="flex-1 p-6 space-y-4">
                <a href="/for-travel-advisors" className="block py-3 text-lg font-bold text-gray-900 hover:text-gray-600 transition-colors border-b border-gray-100" onClick={() => setIsMobileMenuOpen(false)}>Advisors</a>
                <a href="/for-property-managers" className="block py-3 text-lg font-bold text-gray-900 hover:text-gray-600 transition-colors border-b border-gray-100" onClick={() => setIsMobileMenuOpen(false)}>Property Managers</a>
                <a href="/about" className="block py-3 text-lg font-bold text-gray-900 hover:text-gray-600 transition-colors border-b border-gray-100" onClick={() => setIsMobileMenuOpen(false)}>About</a>

                {user?.role === 'admin' && (
                  <button
                    onClick={handleAdminClick}
                    className="w-full flex items-center gap-2 py-3 text-lg font-bold text-blue-600 hover:text-blue-800 transition-colors border-b border-gray-100"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    Admin Dashboard
                  </button>
                )}

                {mode === 'search' && (
                  <button
                    onClick={() => { setShowFilters?.(!showFilters); setIsMobileMenuOpen(false); }}
                    className="w-full flex items-center justify-between py-3 text-lg font-bold text-gray-900 hover:text-gray-600 transition-colors border-b border-gray-100"
                  >
                    <span>Filters</span>
                    {activeFiltersCount > 0 && (
                      <span className="bg-neutral-900 text-white text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center">
                        {activeFiltersCount}
                      </span>
                    )}
                  </button>
                )}
              </nav>

              <div className="p-6 border-t border-gray-200">
                {user ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt="Agency logo"
                          className="w-8 h-8 rounded-full object-cover border border-gray-200 shrink-0"
                        />
                      ) : (
                        <User className="w-5 h-5 text-gray-600 shrink-0" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{user.full_name || user.email}</p>
                        <p className="text-sm text-gray-500 uppercase text-xs font-bold">{user.role}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <button onClick={handleAuthClick} className="w-full py-3 px-4 text-center bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-700 transition-colors">
                      Login to Access
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ===== SUB-COMPONENTS =====

const Logo = () => (
  <a href="/" className="flex items-center gap-3">
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="3" stroke="#111111" strokeWidth="1.5" />
      <circle cx="20" cy="8" r="3" stroke="#111111" strokeWidth="1.5" />
      <circle cx="14" cy="20" r="3" stroke="#111111" strokeWidth="1.5" />
      <path d="M10.5 9.5L14 17L17.5 9.5" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    <span className="text-[#111111] font-bold text-xl tracking-[0.02em] leading-[1]">villanet</span>
  </a>
);

interface UserMenuProps {
  user: any;
  onLogout: () => void;
  onAdminClick: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ user, onLogout, onAdminClick }) => (
  <div className="flex items-center gap-4">
    {user?.role === 'admin' && (
      <button
        onClick={onAdminClick}
        className="flex items-center gap-2 px-3 py-1.5 bg-[#111111] text-white rounded-full hover:bg-gray-700 transition-colors"
      >
        <LayoutDashboard className="w-4 h-4" />
        <span className="text-xs font-bold uppercase tracking-wider">Dashboard</span>
      </button>
    )}
    <Link
      to={user?.role === 'ta' ? '/dashboard/profile' : '#'}
      className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
      title={user?.role === 'ta' ? 'My Profile' : undefined}
    >
      {user?.avatar_url ? (
        <img
          src={user.avatar_url}
          alt="Agency logo"
          className="w-7 h-7 rounded-full object-cover border border-gray-200"
        />
      ) : (
        <User className="w-4 h-4" />
      )}
      <span className="font-medium">{user.full_name || user.email}</span>
    </Link>
    <button
      onClick={onLogout}
      className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors border-0 bg-transparent cursor-pointer"
    >
      <LogOut className="w-4 h-4" />
      Logout
    </button>
  </div>
);

const SearchBar: React.FC<any> = ({ query, setQuery, checkIn, setCheckIn, checkOut, setCheckOut, today, minCheckOut }) => (
  <div className="hidden lg:flex items-center gap-2 flex-1 max-w-2xl mx-4">
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
      <input
        type="text"
        placeholder="Search destinations..."
        value={query}
        onChange={(e) => setQuery?.(e.target.value)}
        className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-full text-sm focus:outline-none focus:border-neutral-400"
      />
    </div>
    <input type="date" value={checkIn} onChange={(e) => setCheckIn?.(e.target.value)} min={today} className="px-4 py-2 border border-neutral-300 rounded-full text-sm focus:outline-none focus:border-neutral-400" />
    <input type="date" value={checkOut} onChange={(e) => setCheckOut?.(e.target.value)} min={minCheckOut} className="px-4 py-2 border border-neutral-300 rounded-full text-sm focus:outline-none focus:border-neutral-400" />
  </div>
);

const AuthButtons: React.FC<{ onAuthClick: () => void }> = ({ onAuthClick }) => (
  <div className="flex items-center gap-3">
    <button
      onClick={onAuthClick}
      className="inline-flex items-center justify-center h-9 rounded-md bg-gray-900 text-white font-bold border-0 hover:bg-gray-700 text-sm px-4 cursor-pointer"
    >
      Login to Access
    </button>
  </div>
);

export default UnifiedHeader;