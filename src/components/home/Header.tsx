import React from "react";
import { Menu, User, LogOut } from "lucide-react";
import { useAuth } from "../../auth/useAuth"; 
interface HeaderProps {
  onAuthClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onAuthClick }) => {
  const { user, loading, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      // Opcional: recargar la página o redirigir
      window.location.reload();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Mostrar loading state si está cargando
  if (loading) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#E5E5E5]">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <svg
                width="28"
                height="28"
                viewBox="0 0 28 28"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="8" cy="8" r="3" stroke="#111111" strokeWidth="1.5" />
                <circle cx="20" cy="8" r="3" stroke="#111111" strokeWidth="1.5" />
                <circle cx="14" cy="20" r="3" stroke="#111111" strokeWidth="1.5" />
                <path
                  d="M10.5 9.5L14 17L17.5 9.5"
                  stroke="#111111"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-[#111111] font-bold text-xl tracking-[0.02em] leading-[1]">
                villanet
              </span>
            </div>
            <div className="text-sm text-gray-500">Loading...</div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#E5E5E5]">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="8" cy="8" r="3" stroke="#111111" strokeWidth="1.5" />
              <circle cx="20" cy="8" r="3" stroke="#111111" strokeWidth="1.5" />
              <circle cx="14" cy="20" r="3" stroke="#111111" strokeWidth="1.5" />
              <path
                d="M10.5 9.5L14 17L17.5 9.5"
                stroke="#111111"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-[#111111] font-bold text-xl tracking-[0.02em] leading-[1]">
              villanet
            </span>
          </div>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#advisors"
              className="text-sm text-gray-900 font-bold hover:text-gray-600 transition-colors"
            >
              Advisors
            </a>
            <a
              href="#pms"
              className="text-sm text-gray-900 font-bold hover:text-gray-600 transition-colors"
            >
              Property Managers
            </a>
            <a
              href="/about"
              className="text-sm text-gray-900 font-bold hover:text-gray-600 transition-colors"
            >
              About
            </a>
            
            {/* Estado de autenticación */}
            {user ? (
              <div className="flex items-center gap-4">
                {/* Menú de usuario */}
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <User className="w-4 h-4" />
                  <span className="font-medium">{user.full_name || user.email}</span>
                </div>
                
                {/* Botón de logout */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors border-0 bg-transparent cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <>
                {/* Login Button */}
                <button
                  onClick={onAuthClick}
                  className="text-sm text-gray-900 font-bold hover:text-gray-600 transition-colors border-0 bg-transparent cursor-pointer"
                >
                  Login
                </button>
                
                {/* Join Network Button */}
                <button
                  onClick={onAuthClick}
                  className="inline-flex items-center justify-center gap-2 h-9 rounded-md bg-gray-900 text-white font-bold border-0 hover:bg-gray-700 text-sm px-4 cursor-pointer"
                >
                  Join Network
                </button>
              </>
            )}
          </nav>

          {/* Botón mobile */}
          <button
            className="md:hidden p-2 hover:bg-gray-100 rounded-md transition-colors"
            type="button"
          >
            <Menu className="w-6 h-6 text-gray-900" />
          </button>
        </div>
      </div>
    </header>
  );
};