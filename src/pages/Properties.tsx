import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bed, Bath, AlertCircle, Clock, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { api } from '../api/api';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import FiltersPanel from '../components/FiltersPanel';
import AuthModal from '../components/AuthModal';
import Footer from '../components/Footer';

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

  const handleAuthSuccess = useCallback((user: any) => {
    console.log('✅ Auth success, user received:', user);
    closeAuthModal();
    setRetryCount(prev => prev + 1);
    setOffset(0);
    setItems([]);
    setHasMore(true);
    
    console.log('🔄 Forcing Properties re-render after login');
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

      {/* ✅ Footer reutilizable */}
      <Footer />

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