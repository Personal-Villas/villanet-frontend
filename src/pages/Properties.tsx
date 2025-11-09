import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bed, Bath, AlertCircle, Clock, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { api } from '../api/api';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import FiltersPanel from '../components/FiltersPanel';
import AuthModal from '../components/AuthModal';

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

// Hook de debounce MEJORADO
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

const ITEMS_PER_PAGE = 24;
const PLACEHOLDER = 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80&auto=format&fit=crop';

export default function Properties() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  // Scroll state para mostrar/ocultar el search en navbar
  const [showNavbarSearch, setShowNavbarSearch] = useState(false);
  const heroSearchRef = useRef<HTMLDivElement>(null);
  
  // Filters
  const [query, setQuery] = useState('');
  const [bedrooms, setBedrooms] = useState<string[]>([]);
  const [bathrooms, setBathrooms] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);

  // Pagination state
  const [items, setItems] = useState<Listing[]>([]);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Auth modal state
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Availability session state
  const [availabilitySession, setAvailabilitySession] = useState<string | null>(null);
  const [availabilityCursor, setAvailabilityCursor] = useState<number | null>(null);

  // Pagination mode
  const [paginationMode, setPaginationMode] = useState<'infinite' | 'pagination'>('infinite');

  // Image carousel states
  const [imageIndices, setImageIndices] = useState<{ [key: string]: number }>({});

  // Usar debouncedQuery en lugar de deb
  const debouncedQuery = useDebounce(query, 600);
  
  // Infinite scroll observer
  const observerTarget = useRef<HTMLDivElement>(null);

  // Detect when to switch to traditional pagination
  const hasAvailabilityFilter = Boolean(checkIn && checkOut && user); // Solo usuarios autenticados pueden usar disponibilidad

  // --- Modal handlers centralizados ---
  const openAuthModal = useCallback(() => {
    setShowAuthModal(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setShowAuthModal(false);
  }, []);

  const handleAuthSuccess = useCallback(() => {
    closeAuthModal();
    // Recargar propiedades después del login exitoso
    setOffset(0);
    setItems([]);
    setHasMore(true);
  }, [closeAuthModal]);

  // Detectar scroll para mostrar search en navbar
  useEffect(() => {
    const handleScroll = () => {
      if (heroSearchRef.current) {
        const rect = heroSearchRef.current.getBoundingClientRect();
        // Cuando el hero search sale del viewport, mostrar el del navbar
        setShowNavbarSearch(rect.bottom < 0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (hasAvailabilityFilter && items.length > 0 && items.length >= 48) {
      setPaginationMode('pagination');
    } else if (!hasAvailabilityFilter) {
      setPaginationMode('infinite');
    }
  }, [items.length, hasAvailabilityFilter]);

  // Reset pagination when filters change
  useEffect(() => {
    setOffset(0);
    setItems([]);
    setHasMore(true);
    setError(null);
    setAvailabilitySession(null);
    setAvailabilityCursor(null);
    setPaginationMode('infinite');
  }, [debouncedQuery, bedrooms, bathrooms, minPrice, maxPrice, checkIn, checkOut, selectedBadges]);

  // Fetch listings - usar debouncedQuery
  useEffect(() => {
    if (authLoading) return; // SOLO verificar authLoading, no user

    const controller = new AbortController();

    (async () => {
      setLoading(true);
      setError(null);
      
      try {
        const qs = new URLSearchParams();
        if (debouncedQuery.trim().length >= 3) qs.set('q', debouncedQuery.trim());
        if (bedrooms.length) qs.set('bedrooms', bedrooms.join(','));
        if (bathrooms.length) qs.set('bathrooms', bathrooms.join(','));
        if (minPrice) qs.set('minPrice', String(Number(minPrice) || ''));
        if (maxPrice) qs.set('maxPrice', String(Number(maxPrice) || ''));
        if (checkIn) qs.set('checkIn', checkIn);
        if (checkOut) qs.set('checkOut', checkOut);
        if (selectedBadges.length) qs.set('badges', selectedBadges.join(',')); 
        qs.set('limit', String(ITEMS_PER_PAGE));
        
        if (availabilitySession && availabilityCursor !== null) {
          qs.set('availabilitySession', availabilitySession);
          qs.set('availabilityCursor', String(availabilityCursor));
          qs.set('offset', '0');
        } else {
          qs.set('offset', String(offset));
        }

        // ✅ USAR ENDPOINT PÚBLICO SI NO HAY USUARIO
        const endpoint = user ? '/listings' : '/public/listings';
        
        const data = await api<ListingsResponse>(`${endpoint}?${qs.toString()}`, { 
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

          if (availabilitySession && availabilityCursor !== null) {
            setItems(prev => [...prev, ...normalized]);
          } else {
            setItems(prev => offset === 0 ? normalized : [...prev, ...normalized]);
          }

          setTotal(data.total);
          setHasMore(data.hasMore);
          
          if (data.availabilitySession) {
            setAvailabilitySession(data.availabilitySession);
          }
          if (data.availabilityCursor !== undefined) {
            setAvailabilityCursor(data.availabilityCursor);
          }
          
          if (!data.hasMore && data.availabilitySession) {
            setAvailabilitySession(null);
            setAvailabilityCursor(null);
          }
          
          setRetryCount(0);
        }
      } catch (err: any) {
        if (!controller.signal.aborted) {
          // Manejar errores específicos para endpoint público
          if (!user && err instanceof Error && err.message?.includes('401')) {
            console.log('Expected 401 for public endpoint - ignoring');
            // Mostrar propiedades vacías para usuarios no autenticados
            setItems([]);
            setTotal(0);
            setHasMore(false);
          } else {
            setError(
              err.message?.includes('429') || err.message?.includes('503')
                ? 'Too many requests. Waiting 60 seconds...'
                : err.message?.includes('401')
                ? 'Session expired. Please log in.'
                : 'Server error. Please try again.'
            );
            
            if (err.message?.includes('429') || err.message?.includes('503')) {
              setHasMore(false);
              setAvailabilitySession(null);
              setAvailabilityCursor(null);
              
              setTimeout(() => {
                setError(null);
                setHasMore(true);
                setRetryCount(prev => prev + 1);
              }, 60000);
            }
            
            if (!err.message?.includes('429') && !err.message?.includes('503') && !err.message?.includes('401')) {
              setRetryCount(prev => prev + 1);
            }
          }
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [
    debouncedQuery,
    bedrooms,
    bathrooms,
    minPrice,
    maxPrice,
    checkIn,
    checkOut,
    selectedBadges,
    offset,
    user, // ← MANTENER user como dependencia
    authLoading,
    retryCount,
    availabilitySession,
    availabilityCursor
  ]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!observerTarget.current || loading || !hasMore || paginationMode !== 'infinite') return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          if (availabilitySession && availabilityCursor !== null) {
            setAvailabilityCursor(prev => (prev || 0) + ITEMS_PER_PAGE);
          } else {
            setOffset(prev => prev + ITEMS_PER_PAGE);
          }
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [loading, hasMore, availabilitySession, availabilityCursor, paginationMode]);

  // Image navigation handlers
  const handlePrevImage = useCallback((e: React.MouseEvent, listingId: string, totalImages: number) => {
    e.stopPropagation();
    setImageIndices(prev => ({
      ...prev,
      [listingId]: ((prev[listingId] || 0) - 1 + totalImages) % totalImages
    }));
  }, []);

  const handleNextImage = useCallback((e: React.MouseEvent, listingId: string, totalImages: number) => {
    e.stopPropagation();
    setImageIndices(prev => ({
      ...prev,
      [listingId]: ((prev[listingId] || 0) + 1) % totalImages
    }));
  }, []);

  // Pagination Controls Component
  const PaginationControls = () => {
    if (paginationMode !== 'pagination' || !hasAvailabilityFilter) return null;
    
    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
    const currentPage = Math.floor(offset / ITEMS_PER_PAGE) + 1;
    
    const handlePrevious = () => {
      const newOffset = Math.max(0, offset - ITEMS_PER_PAGE);
      setOffset(newOffset);
      setItems([]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    const handleNext = () => {
      const newOffset = offset + ITEMS_PER_PAGE;
      setOffset(newOffset);
      setItems([]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    return (
      <div className="flex justify-center items-center gap-4 py-8">
        <button
          onClick={handlePrevious}
          disabled={offset === 0}
          className="px-6 py-3 border border-neutral-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 transition-colors font-manrope font-medium text-neutral-700"
        >
          Previous
        </button>
        
        <span className="text-sm text-neutral-600 font-manrope">
          Page {currentPage} of {totalPages}
        </span>
        
        <button
          onClick={handleNext}
          disabled={!hasMore}
          className="px-6 py-3 border border-neutral-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 transition-colors font-manrope font-medium text-neutral-700"
        >
          Next
        </button>
      </div>
    );
  };

  const toggleOption = useCallback((value: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => prev.includes(value) ? prev.filter(x => x !== value) : [...prev, value]);
  }, []);

  const clearAllFilters = useCallback(() => {
    setQuery('');
    setBedrooms([]);
    setBathrooms([]);
    setMinPrice('');
    setMaxPrice('');
    setCheckIn('');
    setCheckOut('');
    setSelectedBadges([]);
    setError(null);
    setAvailabilitySession(null);
    setAvailabilityCursor(null);
    setPaginationMode('infinite');
  }, []);

  const goToDetail = useCallback((property: Listing) => {
    // Si no hay usuario, mostrar modal de auth
    if (!user) {
      openAuthModal();
      return;
    }
    
    // Si hay usuario, navegar normalmente
    navigate(`/property/${property.id}`);
  }, [navigate, user, openAuthModal]);

  const formatMoney = (n: number | null | undefined) =>
    n == null ? '—' : `$${n.toLocaleString()}`;

  const handleBadgeToggle = useCallback((badgeId: string) => {
    setSelectedBadges(prev => 
      prev.includes(badgeId)
        ? prev.filter(id => id !== badgeId)
        : [...prev, badgeId]
    );
  }, []);

  const handleRetry = useCallback(() => {
    setError(null);
    setLoading(true);
    setRetryCount(prev => prev + 1);
    setAvailabilitySession(null);
    setAvailabilityCursor(null);
  }, []);

  const activeFiltersCount = 
  bedrooms.length + 
  bathrooms.length + 
  (minPrice ? 1 : 0) + 
  (maxPrice ? 1 : 0) + 
  (checkIn ? 1 : 0) + 
  (checkOut ? 1 : 0) +
  selectedBadges.length; 

  const today = new Date().toISOString().split('T')[0];
  const minCheckOut = checkIn || today;

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-900 mx-auto"></div>
          <p className="mt-4 text-neutral-600 font-sans">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header
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
        showNavbarSearch={showNavbarSearch}
        showAuthButton={!user}
        onAuthClick={openAuthModal}
      />

      <HeroSection
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
        heroSearchRef={heroSearchRef}
        selectedBadges={selectedBadges}      
        onBadgeToggle={handleBadgeToggle}  
      />

      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-8">
        <FiltersPanel
          showFilters={showFilters}
          bedrooms={bedrooms}
          setBedrooms={setBedrooms}
          bathrooms={bathrooms}
          setBathrooms={setBathrooms}
          minPrice={minPrice}
          setMinPrice={setMinPrice}
          maxPrice={maxPrice}
          setMaxPrice={setMaxPrice}
          activeFiltersCount={activeFiltersCount}
          clearAllFilters={clearAllFilters}
          toggleOption={toggleOption}
        />

        {/* Error Messages */}
        {error && (
          <div className={`mb-6 p-6 rounded-2xl border ${
            error.includes('Too many requests') 
              ? 'bg-yellow-50 border-yellow-200' 
              : error.includes('Session expired')
              ? 'bg-red-50 border-red-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start gap-4">
              <div className={`mt-0.5 ${
                error.includes('Too many requests') ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {error.includes('Too many requests') ? <Clock className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
              </div>
              <div className="flex-1">
                <p className={`font-semibold ${
                  error.includes('Too many requests') ? 'text-yellow-800' : 'text-red-800'
                }`}>
                  {error}
                </p>
                {error.includes('Too many requests') && (
                  <div className="mt-3">
                    <div className="w-full bg-yellow-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-600 h-2 rounded-full transition-all duration-1000 ease-linear"
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
                    className={`mt-4 px-6 py-3 rounded-lg font-medium ${
                      error.includes('Session expired')
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-neutral-900 text-white hover:bg-neutral-800'
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
          <div className="flex justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-neutral-900 mx-auto"></div>
              <p className="mt-4 text-neutral-600">Finding your perfect getaway...</p>
            </div>
          </div>
        )}

        {/* Properties Grid - Wander Style with Carousel */}
        {!loading || offset > 0 || availabilitySession ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item, idx) => {
              const images = item.images_json.length > 0 ? item.images_json : [item.heroImage || PLACEHOLDER];
              const currentIndex = imageIndices[item.id] || 0;
              const currentImage = images[currentIndex];
              
              return (
                <article
                  key={`${item.id}-${idx}`}
                  className="group cursor-pointer"
                  onClick={() => goToDetail(item)}
                >
                  {/* Image Carousel */}
                  <div className="relative aspect-square rounded-2xl overflow-hidden mb-3">
                    <img
                      src={currentImage}
                      alt={item.name}
                      loading="lazy"
                      onError={(ev) => {
                        const img = ev.target as HTMLImageElement;
                        if (img.src !== PLACEHOLDER) img.src = PLACEHOLDER;
                      }}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Favorite Button */}
                    <button 
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-3 right-3 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Heart className="w-4 h-4 text-neutral-700" />
                    </button>
                    
                    {/* Navigation Arrows */}
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={(e) => handlePrevImage(e, item.id, images.length)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                        >
                          <ChevronLeft className="w-5 h-5 text-neutral-700" />
                        </button>
                        <button
                          onClick={(e) => handleNextImage(e, item.id, images.length)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                        >
                          <ChevronRight className="w-5 h-5 text-neutral-700" />
                        </button>
                        
                        {/* Dots Indicator */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                          {images.map((_, dotIdx) => (
                            <div
                              key={dotIdx}
                              className={`w-1.5 h-1.5 rounded-full transition-all ${
                                dotIdx === currentIndex ? 'bg-white w-3' : 'bg-white/50'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Property Info */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-neutral-900 font-semibold text-base truncate">
                          {item.name}
                        </h3>
                        <p className="text-sm text-neutral-500 truncate">
                          {(() => {
                            const location = item.location || 'Location not specified';
                            const parts = location.split(',').map(p => p.trim());
                            
                            if (parts.length >= 3) {
                              const cityIndex = parts.findIndex(p => !/^\d+$/.test(p.split(' ')[0]));
                              if (cityIndex >= 0 && cityIndex < parts.length - 1) {
                                return `${parts[cityIndex]}, ${parts[parts.length - 1]}`;
                              }
                            }
                            
                            return parts.slice(0, 2).join(', ');
                          })()}
                        </p>
                      </div>
                      <div className="text-right whitespace-nowrap">
                        <span className="text-neutral-900 font-semibold">
                          {formatMoney(item.priceUSD)}
                        </span>
                        <span className="text-sm text-neutral-500"> /night</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm text-neutral-600">
                        {user ? 'Next avail. Nov 6 - Nov 7' : 'Sign in to view availability'}
                      </p>
                      
                      <div className="flex items-center gap-1 text-sm text-neutral-600 whitespace-nowrap">
                        <Bed className="w-4 h-4" />
                        <span>{item.bedrooms ?? '—'}</span>
                        
                        <Bath className="w-4 h-4 ml-2" />
                        <span>{item.bathrooms ?? '—'}</span>
                        
                        <span className="ml-2">★ 5</span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : null}

        {/* Pagination Controls */}
        <PaginationControls />

        {/* Loading indicator for infinite scroll */}
        {loading && (offset > 0 || availabilitySession) && paginationMode === 'infinite' && (
          <div className="flex justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-900 mx-auto"></div>
              <p className="mt-3 text-neutral-600">
                {availabilitySession ? 'Loading more available properties...' : 'Discovering more properties...'}
              </p>
            </div>
          </div>
        )}

        {/* Infinite scroll trigger (only in infinite mode) */}
        {paginationMode === 'infinite' && <div ref={observerTarget} className="h-10" />}

        {/* No results */}
        {!loading && items.length === 0 && !error && (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-neutral-400" />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-3">
                {user ? 'No properties found' : 'Explore Amazing Properties'}
              </h3>
              <p className="text-neutral-500 mb-6">
                {!user 
                  ? 'Sign in to view all property details and book your stay'
                  : debouncedQuery || activeFiltersCount > 0 
                    ? "Try adjusting your search criteria or filters" 
                    : "No properties available at the moment"
                }
              </p>
              {!user && (
                <button 
                  onClick={openAuthModal} 
                  className="bg-neutral-900 text-white px-8 py-4 rounded-full hover:bg-neutral-800 transition font-medium"
                >
                  Sign In to View Properties
                </button>
              )}
              {activeFiltersCount > 0 && user && (
                <button 
                  onClick={clearAllFilters} 
                  className="bg-neutral-900 text-white px-8 py-4 rounded-full hover:bg-neutral-800 transition font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* End message (only in infinite mode) */}
        {!loading && items.length > 0 && !hasMore && paginationMode === 'infinite' && (
          <div className="text-center py-12">
            <p className="text-neutral-500">
              You've discovered all {items.length} properties
            </p>
          </div>
        )}
      </div>

      {/* Footer - Wander Style */}
      <footer className="border-t border-neutral-200 mt-16 bg-neutral-50">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-bold text-neutral-900 mb-4">About</h4>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li><a href="#" className="hover:text-neutral-900 transition">How it works</a></li>
                <li><a href="#" className="hover:text-neutral-900 transition">Newsroom</a></li>
                <li><a href="#" className="hover:text-neutral-900 transition">Investors</a></li>
                <li><a href="#" className="hover:text-neutral-900 transition">Careers</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-neutral-900 mb-4">Community</h4>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li><a href="#" className="hover:text-neutral-900 transition">Diversity & Belonging</a></li>
                <li><a href="#" className="hover:text-neutral-900 transition">Accessibility</a></li>
                <li><a href="#" className="hover:text-neutral-900 transition">Referrals</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-neutral-900 mb-4">Host</h4>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li><a href="#" className="hover:text-neutral-900 transition">List your property</a></li>
                <li><a href="#" className="hover:text-neutral-900 transition">Host resources</a></li>
                <li><a href="#" className="hover:text-neutral-900 transition">Community forum</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-neutral-900 mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li><a href="#" className="hover:text-neutral-900 transition">Help Center</a></li>
                <li><a href="#" className="hover:text-neutral-900 transition">Safety information</a></li>
                <li><a href="#" className="hover:text-neutral-900 transition">Cancellation options</a></li>
                <li><a href="#" className="hover:text-neutral-900 transition">Contact us</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-neutral-200 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-neutral-600">
              © 2025 Villanet, Inc. All rights reserved.
            </div>
            
            <div className="flex items-center gap-6 text-sm text-neutral-600">
              <a href="#" className="hover:text-neutral-900 transition">Privacy</a>
              <a href="#" className="hover:text-neutral-900 transition">Terms</a>
              <a href="#" className="hover:text-neutral-900 transition">Sitemap</a>
            </div>
            
            <div className="flex items-center gap-4">
              <a href="#" className="text-neutral-600 hover:text-neutral-900 transition">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" className="text-neutral-600 hover:text-neutral-900 transition">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a href="#" className="text-neutral-600 hover:text-neutral-900 transition">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal 
          onClose={closeAuthModal}
          onSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
}