import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Bed, Bath, MapPin, SlidersHorizontal, LogOut, Calendar, AlertCircle, Clock } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { api } from '../api/api';

type Listing = {
  id: string;
  name: string;
  bedrooms: number | null;
  bathrooms: number | null;
  priceUSD: number | null;
  location: string | null;
  heroImage: string | null;
  images_json: string[];
};

type ListingsResponse = {
  results: Listing[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
  availabilityApplied?: boolean;
  availabilitySession?: string;
  availabilityCursor?: number;
};

function useDebounce<T>(v: T, ms: number) {
  const [d, set] = useState(v);
  useEffect(() => {
    const t = setTimeout(() => set(v), ms);
    return () => clearTimeout(t);
  }, [v, ms]);
  return d;
}

const ITEMS_PER_PAGE = 24;
const PLACEHOLDER = 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80&auto=format&fit=crop';

export default function Properties() {
  const { user, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();
  
  // Filters
  const [query, setQuery] = useState('');
  const [bedrooms, setBedrooms] = useState<string[]>([]);
  const [bathrooms, setBathrooms] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Pagination state
  const [items, setItems] = useState<Listing[]>([]);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // 🆕 Estado para manejar la sesión de disponibilidad
  const [availabilitySession, setAvailabilitySession] = useState<string | null>(null);
  const [availabilityCursor, setAvailabilityCursor] = useState<number | null>(null);

  // 🆕 Estado para el modo de paginación híbrida
  const [paginationMode, setPaginationMode] = useState<'infinite' | 'pagination'>('infinite');

  const deb = useDebounce(query, 600);
  
  // Infinite scroll observer
  const observerTarget = useRef<HTMLDivElement>(null);

  // 🆕 Detectar cuándo cambiar a paginación tradicional
  const hasAvailabilityFilter = Boolean(checkIn && checkOut);

  useEffect(() => {
    if (hasAvailabilityFilter && items.length > 0 && items.length >= 48) {
      setPaginationMode('pagination');
    } else if (!hasAvailabilityFilter) {
      setPaginationMode('infinite');
    }
  }, [items.length, hasAvailabilityFilter]);

  // Reset pagination cuando cambian filtros
  useEffect(() => {
    setOffset(0);
    setItems([]);
    setHasMore(true);
    setError(null);
    // 🆕 Resetear sesión de disponibilidad cuando cambian filtros
    setAvailabilitySession(null);
    setAvailabilityCursor(null);
    // 🆕 Resetear modo de paginación
    setPaginationMode('infinite');
  }, [deb, bedrooms, bathrooms, minPrice, maxPrice, checkIn, checkOut]);

  // Fetch listings
  useEffect(() => {
    if (authLoading || !user) return;

    const controller = new AbortController();

    (async () => {
      setLoading(true);
      setError(null);
      
      try {
        const qs = new URLSearchParams();
        if (deb.trim().length >= 3) qs.set('q', deb.trim());
        if (bedrooms.length) qs.set('bedrooms', bedrooms.join(','));
        if (bathrooms.length) qs.set('bathrooms', bathrooms.join(','));
        if (minPrice) qs.set('minPrice', String(Number(minPrice) || ''));
        if (maxPrice) qs.set('maxPrice', String(Number(maxPrice) || ''));
        if (checkIn) qs.set('checkIn', checkIn);
        if (checkOut) qs.set('checkOut', checkOut);
        qs.set('limit', String(ITEMS_PER_PAGE));
        
        // 🆕 Estrategia mejorada: usar cursor de disponibilidad si existe
        if (availabilitySession && availabilityCursor !== null) {
          qs.set('availabilitySession', availabilitySession);
          qs.set('availabilityCursor', String(availabilityCursor));
          // 🆕 Con disponibilidad, no usamos offset tradicional
          qs.set('offset', '0');
        } else {
          // Estrategia tradicional
          qs.set('offset', String(offset));
        }

        const data = await api<ListingsResponse>(`/listings?${qs.toString()}`, { 
          signal: controller.signal 
        });

        if (!controller.signal.aborted) {
          const normalized: Listing[] = (data.results || []).map((item) => {
            const images = Array.isArray(item.images_json) ? item.images_json : [];
            const first = images[0];
            return {
              ...item,
              id: item.id || `temp-${Math.random().toString(36).slice(2)}`,
              images_json: images,
              heroImage: (typeof first === 'string' && first) || item.heroImage || PLACEHOLDER,
            };
          });

          // 🆕 Manejo mejorado del estado según la estrategia
          if (availabilitySession && availabilityCursor !== null) {
            // Estrategia de disponibilidad: acumular resultados
            setItems(prev => [...prev, ...normalized]);
          } else {
            // Estrategia tradicional: resetear o acumular según offset
            setItems(prev => offset === 0 ? normalized : [...prev, ...normalized]);
          }

          setTotal(data.total);
          setHasMore(data.hasMore);
          
          // 🆕 Actualizar sesión y cursor de disponibilidad
          if (data.availabilitySession) {
            setAvailabilitySession(data.availabilitySession);
          }
          if (data.availabilityCursor !== undefined) {
            setAvailabilityCursor(data.availabilityCursor);
          }
          
          // 🆕 Resetear sesión si no hay más resultados
          if (!data.hasMore && data.availabilitySession) {
            setAvailabilitySession(null);
            setAvailabilityCursor(null);
          }
          
          setRetryCount(0); // Reset retry count on successful request
        }
      } catch (err: any) {
        if (!controller.signal.aborted) {
          setError(
            err.message?.includes('429') || err.message?.includes('503')
              ? 'Too many requests. Waiting 60 seconds...'
              : err.message?.includes('401')
              ? 'Session expired. Please log in.'
              : 'Server error. Please try again.'
          );
          
          // Si es 429, esperar antes de permitir más requests
          if (err.message?.includes('429') || err.message?.includes('503')) {
            setHasMore(false);
            // 🆕 Resetear sesión de disponibilidad en caso de error
            setAvailabilitySession(null);
            setAvailabilityCursor(null);
            
            setTimeout(() => {
              setError(null);
              setHasMore(true);
              setRetryCount(prev => prev + 1);
            }, 60000); // Esperar 1 minuto
          }
          
          // Para otros errores, incrementar contador de reintentos
          if (!err.message?.includes('429') && !err.message?.includes('503') && !err.message?.includes('401')) {
            setRetryCount(prev => prev + 1);
          }
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [
    deb, bedrooms, bathrooms, minPrice, maxPrice, checkIn, checkOut, 
    offset, user, authLoading, retryCount,
    availabilitySession, availabilityCursor // 🆕 Dependencias nuevas
  ]);

  // Intersection Observer para infinite scroll (solo en modo infinite)
  useEffect(() => {
    if (!observerTarget.current || loading || !hasMore || paginationMode !== 'infinite') return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          // 🆕 Estrategia mejorada: usar cursor de disponibilidad si existe
          if (availabilitySession && availabilityCursor !== null) {
            // Con disponibilidad, incrementamos el cursor en lugar del offset
            setAvailabilityCursor(prev => (prev || 0) + ITEMS_PER_PAGE);
          } else {
            // Estrategia tradicional
            setOffset(prev => prev + ITEMS_PER_PAGE);
          }
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [loading, hasMore, availabilitySession, availabilityCursor, paginationMode]);

  // 🆕 Componente de controles de paginación tradicional
  const PaginationControls = () => {
    if (paginationMode !== 'pagination' || !hasAvailabilityFilter) return null;
    
    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
    const currentPage = Math.floor(offset / ITEMS_PER_PAGE) + 1;
    
    const handlePrevious = () => {
      const newOffset = Math.max(0, offset - ITEMS_PER_PAGE);
      setOffset(newOffset);
      setItems([]); // Reset items para forzar recarga
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    const handleNext = () => {
      const newOffset = offset + ITEMS_PER_PAGE;
      setOffset(newOffset);
      setItems([]); // Reset items para forzar recarga
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    return (
      <div className="flex justify-center items-center gap-4 py-8">
        <button
          onClick={handlePrevious}
          disabled={offset === 0}
          className="px-4 py-2 border border-neutral-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 transition-colors"
        >
          Previous
        </button>
        
        <span className="text-sm text-neutral-600">
          Page {currentPage} of {totalPages}
        </span>
        
        <button
          onClick={handleNext}
          disabled={!hasMore}
          className="px-4 py-2 border border-neutral-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 transition-colors"
        >
          Next
        </button>
      </div>
    );
  };

  const toggleOption = useCallback((value: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => prev.includes(value) ? prev.filter(x => x !== value) : [...prev, value]);
  }, []);

  const handleLogout = useCallback(async () => {
    await logout();
    navigate('/login');
  }, [logout, navigate]);

  const clearAllFilters = useCallback(() => {
    setQuery('');
    setBedrooms([]);
    setBathrooms([]);
    setMinPrice('');
    setMaxPrice('');
    setCheckIn('');
    setCheckOut('');
    setError(null);
    // 🆕 Resetear sesión de disponibilidad al limpiar filtros
    setAvailabilitySession(null);
    setAvailabilityCursor(null);
    // 🆕 Resetear modo de paginación
    setPaginationMode('infinite');
  }, []);

  const goToDetail = useCallback((property: Listing) => {
    navigate(`/property/${property.id}`);
  }, [navigate]);

  const formatMoney = (n: number | null | undefined) =>
    n == null ? '—' : `$${n.toLocaleString()}`;

  // Función para reintentar manualmente
  const handleRetry = useCallback(() => {
    setError(null);
    setLoading(true);
    setRetryCount(prev => prev + 1);
    // 🆕 Resetear sesión de disponibilidad al reintentar
    setAvailabilitySession(null);
    setAvailabilityCursor(null);
  }, []);

  const activeFiltersCount = bedrooms.length + bathrooms.length + (minPrice ? 1 : 0) + (maxPrice ? 1 : 0) + (checkIn ? 1 : 0) + (checkOut ? 1 : 0);

  // Validación de fechas
  const today = new Date().toISOString().split('T')[0];
  const minCheckOut = checkIn || today;

  // Auth guards
  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Authentication Required</h2>
          <p className="text-neutral-600 mb-4">Please log in to view properties</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-neutral-200 sticky top-0 bg-white z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-neutral-900">
              Properties
              {total > 0 && <span className="text-base text-neutral-500 ml-2">({total.toLocaleString()})</span>}
            </h1>
            <div className="flex items-center gap-3">
              <span className="text-sm text-neutral-600 hidden sm:block">{user.full_name}</span>
              {user.role === 'admin' && (
                <button
                  onClick={() => navigate('/admin/users')}
                  className="text-sm px-3 py-2 rounded-lg bg-neutral-400 text-white hover:bg-neutral-500 transition"
                >
                  Dashboard
                </button>
              )}
              <button onClick={handleLogout} className="text-orange-500 hover:text-orange-600" title="Logout">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              className="w-full pl-12 pr-24 py-3.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by name or location (3+ chars)"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-16 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-neutral-700 hover:text-orange-500"
            >
              <SlidersHorizontal className="w-5 h-5" />
              {activeFiltersCount > 0 && (
                <span className="bg-orange-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mb-6 p-6 border border-neutral-200 rounded-lg bg-neutral-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-neutral-900">Filters</h3>
              {activeFiltersCount > 0 && (
                <button onClick={clearAllFilters} className="text-sm text-orange-500 hover:text-orange-600 font-medium">
                  Clear all
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Availability Dates */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Availability
                </label>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <input
                      type="date"
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      value={checkIn}
                      onChange={e => setCheckIn(e.target.value)}
                      min={today}
                      placeholder="Check-in"
                    />
                  </div>
                  <span className="text-neutral-400 self-center">→</span>
                  <div className="flex-1">
                    <input
                      type="date"
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      value={checkOut}
                      onChange={e => setCheckOut(e.target.value)}
                      min={minCheckOut}
                      disabled={!checkIn}
                      placeholder="Check-out"
                    />
                  </div>
                </div>
                {checkIn && !checkOut && (
                  <p className="text-xs text-neutral-500 mt-2">Select check-out date</p>
                )}
              </div>

              {/* Bedrooms */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-3">Bedrooms</label>
                <div className="flex flex-wrap gap-2">
                  {['2', '3', '4', '5', '6+'].map(opt => (
                    <button
                      key={opt}
                      onClick={() => toggleOption(opt, setBedrooms)}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${
                        bedrooms.includes(opt)
                          ? 'bg-neutral-900 text-white border-neutral-900'
                          : 'bg-white text-neutral-700 border-neutral-300 hover:border-neutral-400'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bathrooms */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-3">Bathrooms</label>
                <div className="flex flex-wrap gap-2">
                  {['2', '3', '4', '5+'].map(opt => (
                    <button
                      key={opt}
                      onClick={() => toggleOption(opt, setBathrooms)}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${
                        bathrooms.includes(opt)
                          ? 'bg-neutral-900 text-white border-neutral-900'
                          : 'bg-white text-neutral-700 border-neutral-300 hover:border-neutral-400'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-3">Price Range (USD)</label>
                <div className="flex gap-3">
                  <input
                    className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    inputMode="numeric"
                    value={minPrice}
                    onChange={e => setMinPrice(e.target.value)}
                    placeholder="Min"
                  />
                  <span className="text-neutral-400 self-center">—</span>
                  <input
                    className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    inputMode="numeric"
                    value={maxPrice}
                    onChange={e => setMaxPrice(e.target.value)}
                    placeholder="Max"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Messages */}
        {error && (
          <div className={`mb-6 p-4 rounded-lg border ${
            error.includes('Too many requests') 
              ? 'bg-yellow-50 border-yellow-200' 
              : error.includes('Session expired')
              ? 'bg-red-50 border-red-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 ${
                error.includes('Too many requests') ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {error.includes('Too many requests') ? <Clock className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                <p className={`font-medium ${
                  error.includes('Too many requests') ? 'text-yellow-800' : 'text-red-800'
                }`}>
                  {error}
                </p>
                {error.includes('Too many requests') && (
                  <div className="mt-2">
                    <div className="w-full bg-yellow-200 rounded-full h-1.5">
                      <div 
                        className="bg-yellow-600 h-1.5 rounded-full transition-all duration-1000 ease-linear"
                        style={{ width: '100%' }}
                      />
                    </div>
                    <p className="text-sm text-yellow-700 mt-2">
                      We'll automatically retry in 60 seconds...
                    </p>
                  </div>
                )}
                {error.includes('Server error') && retryCount > 0 && (
                  <p className="text-sm text-red-700 mt-1">
                    Attempt {retryCount} of 3
                  </p>
                )}
                {(error.includes('Server error') || error.includes('Session expired')) && (
                  <button
                    onClick={error.includes('Session expired') ? () => navigate('/login') : handleRetry}
                    className={`mt-3 px-4 py-2 rounded-lg text-sm font-medium ${
                      error.includes('Session expired')
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-orange-500 text-white hover:bg-orange-600'
                    } transition`}
                  >
                    {error.includes('Session expired') ? 'Log In Again' : 'Try Again'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Loading indicator for initial load */}
        {loading && offset === 0 && !availabilitySession && (
          <div className="flex justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
              <p className="mt-4 text-neutral-600">Loading properties...</p>
            </div>
          </div>
        )}

        {/* Grid */}
        {!loading || offset > 0 || availabilitySession ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item, idx) => (
              <article
                key={`${item.id}-${idx}`}
                className="group bg-white rounded-lg border border-neutral-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                onClick={() => goToDetail(item)}
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                  <img
                    src={item.heroImage || PLACEHOLDER}
                    alt={item.name}
                    loading="lazy"
                    onError={(ev) => {
                      const img = ev.target as HTMLImageElement;
                      if (img.src !== PLACEHOLDER) img.src = PLACEHOLDER;
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-medium text-neutral-900 mb-1 group-hover:text-orange-500 transition">
                    {item.name}
                  </h3>
                  
                  <div className="flex items-center gap-1 text-sm text-neutral-600 mb-3">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{item.location || '—'}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-neutral-600">
                      <span className="flex items-center gap-1.5">
                        <Bed className="w-4 h-4" />
                        {item.bedrooms ?? '—'}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Bath className="w-4 h-4" />
                        {item.bathrooms ?? '—'}
                      </span>
                    </div>
                    <span className="text-lg font-semibold text-neutral-900">
                      {formatMoney(item.priceUSD)}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : null}

        {/* 🆕 Controles de paginación tradicional */}
        <PaginationControls />

        {/* Loading indicator para infinite scroll */}
        {loading && (offset > 0 || availabilitySession) && paginationMode === 'infinite' && (
          <div className="flex justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
              <p className="mt-2 text-sm text-neutral-600">
                {availabilitySession ? 'Loading more available properties...' : 'Loading more properties...'}
              </p>
            </div>
          </div>
        )}

        {/* Infinite scroll trigger (solo en modo infinite) */}
        {paginationMode === 'infinite' && <div ref={observerTarget} className="h-10" />}

        {/* No results */}
        {!loading && items.length === 0 && !error && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-neutral-400" />
              </div>
              <h3 className="text-lg font-medium text-neutral-900 mb-2">No properties found</h3>
              <p className="text-neutral-500 mb-4">
                {deb || activeFiltersCount > 0 
                  ? "Try adjusting your search criteria or filters" 
                  : "No properties available at the moment"}
              </p>
              {activeFiltersCount > 0 && (
                <button 
                  onClick={clearAllFilters} 
                  className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* End message (solo en modo infinite) */}
        {!loading && items.length > 0 && !hasMore && paginationMode === 'infinite' && (
          <p className="text-center py-8 text-neutral-500">
            You've reached the end • {items.length} of {total} properties
          </p>
        )}
      </div>
    </div>
  );
}