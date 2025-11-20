import { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bed, Users, MapPin, DollarSign, Star, ShieldCheck, Sparkles, ChefHat, Calendar, Waves, Eye, ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { api } from '../api/api';
import AuthModal from '../components/AuthModal';
import VillaNetRankModal from '../components/VillaNetRankModal';
import SEO, { generateLocalBusinessSchema } from '../components/SEO';

type Listing = {
  id: string;
  name: string;
  bedrooms: number | null;
  bathrooms: number | null;
  priceUSD: number | null;
  location: string | null;
  heroImage: string | null;
  images_json: string[];
  rank?: number;
  propertyManager?: string;
  trustAccount?: boolean;
  dailyCleaning?: boolean;
  chefIncluded?: boolean;
  category?: string[];
  sleeps?: number;
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

// Hook de debounce
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

const ITEMS_PER_PAGE = 12;
const PLACEHOLDER = '/assets/hero-villa-Cl4d2Edi.jpg';

export default function Properties() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  // Filters
  const [query, setQuery] = useState('');
  const [bedrooms, setBedrooms] = useState<string[]>([]);
  const [bathrooms, setBathrooms] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('rank');

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
  
  // Villa Net Rank modal state - AGREGADO
  const [showRankModal, setShowRankModal] = useState(false);

  // Availability session state
  const [availabilitySession, setAvailabilitySession] = useState<string | null>(null);
  const [availabilityCursor, setAvailabilityCursor] = useState<number | null>(null);

  // Pagination mode
  const [paginationMode, setPaginationMode] = useState<'infinite' | 'pagination'>('infinite');

  // Image carousel states
  const [imageIndices, setImageIndices] = useState<{ [key: string]: number }>({});

  // Debounced query
  const debouncedQuery = useDebounce(query, 600);
  
  // Infinite scroll observer
  const observerTarget = useRef<HTMLDivElement>(null);

  // Quick filters
  const quickFilters = [
    { id: 'chef', label: 'Chef Included', icon: ChefHat },
    { id: 'beachfront', label: 'True Beach Front', icon: Waves },
    { id: 'ocean-view', label: 'Ocean View', icon: Eye },
    { id: 'heated-pool', label: 'Heated Pool', icon: Waves }
  ];

  // Check if availability filters are applied
  const hasAvailabilityFilter = checkIn || checkOut;

  // --- Modal handlers ---
  const openAuthModal = useCallback(() => {
    setShowAuthModal(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setShowAuthModal(false);
  }, []);

  // AGREGADO: Handlers para el modal de Villa Net Rank
  const openRankModal = useCallback(() => {
    setShowRankModal(true);
  }, []);

  const closeRankModal = useCallback(() => {
    setShowRankModal(false);
  }, []);

  const handleAuthSuccess = useCallback((user: any) => {
    console.log('✅ Auth success, user received:', user);
    closeAuthModal();
    
    // Disparar evento para actualizar el contexto
    window.dispatchEvent(new Event('authStateChange'));
    
    // Forzar re-render
    setRetryCount(prev => prev + 1);
    setOffset(0);
    setItems([]);
    setHasMore(true);
    
    console.log('🔄 Auth state updated, Properties should re-render');
  }, [closeAuthModal]);

  // Switch to pagination mode when availability filters are applied and many results
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
  }, [debouncedQuery, bedrooms, bathrooms, minPrice, maxPrice, checkIn, checkOut, selectedBadges, sortBy]);

  // Fetch listings (se mantiene igual)
  useEffect(() => {
    if (authLoading) return;

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
        if (sortBy) qs.set('sortBy', sortBy);
        qs.set('limit', String(ITEMS_PER_PAGE));
        
        if (availabilitySession && availabilityCursor !== null) {
          qs.set('availabilitySession', availabilitySession);
          qs.set('availabilityCursor', String(availabilityCursor));
          qs.set('offset', '0');
        } else {
          qs.set('offset', String(offset));
        }

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
              rank: item.rank || Math.random() * 0.5 + 9.2, // Mock rank if not provided
              sleeps: item.sleeps || (item.bedrooms || 1) * 2,
              propertyManager: item.propertyManager || 'Blue Sky Luxury Villas',
              trustAccount: item.trustAccount ?? true,
              dailyCleaning: item.dailyCleaning ?? true,
              chefIncluded: item.chefIncluded ?? true,
              category: item.category || ['Ultra Luxe', 'Beachfront']
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
          if (!user && err instanceof Error && err.message?.includes('401')) {
            console.log('Expected 401 for public endpoint - ignoring');
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
    sortBy,
    offset,
    user,
    authLoading,
    retryCount,
    availabilitySession,
    availabilityCursor
  ]);

  // Intersection Observer for infinite scroll (se mantiene igual)
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

  // Image navigation handlers (se mantiene igual)
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

  // Pagination Controls Component (se mantiene igual)
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
          className="px-6 py-3 border border-neutral-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 transition-colors font-medium text-neutral-700"
        >
          Previous
        </button>
        
        <span className="text-sm text-neutral-600">
          Page {currentPage} of {totalPages}
        </span>
        
        <button
          onClick={handleNext}
          disabled={!hasMore}
          className="px-6 py-3 border border-neutral-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 transition-colors font-medium text-neutral-700"
        >
          Next
        </button>
      </div>
    );
  };

  const clearAllFilters = useCallback(() => {
    setQuery('');
    setBedrooms([]);
    setBathrooms([]);
    setMinPrice('');
    setMaxPrice('');
    setCheckIn('');
    setCheckOut('');
    setSelectedBadges([]);
    setSortBy('rank');
    setError(null);
    setAvailabilitySession(null);
    setAvailabilityCursor(null);
    setPaginationMode('infinite');
  }, []);

  const goToDetail = useCallback((property: Listing) => {
    if (!user) {
      openAuthModal();
      return;
    }
    navigate(`/property/${property.id}`);
  }, [navigate, user, openAuthModal]);

  const formatMoney = (n: number | null | undefined) =>
    n == null ? '—' : `$${(n / 100).toLocaleString()}`;

  const handleBadgeToggle = useCallback((badgeId: string) => {
    setSelectedBadges(prev => 
      prev.includes(badgeId)
        ? prev.filter(id => id !== badgeId)
        : [...prev, badgeId]
    );
  }, []);

  /*const handleRetry = useCallback(() => {
    setError(null);
    setLoading(true);
    setRetryCount(prev => prev + 1);
    setAvailabilitySession(null);
    setAvailabilityCursor(null);
  }, []);
  */
  const activeFiltersCount = 
    bedrooms.length + 
    bathrooms.length + 
    (minPrice ? 1 : 0) + 
    (maxPrice ? 1 : 0) + 
    (checkIn ? 1 : 0) + 
    (checkOut ? 1 : 0) +
    selectedBadges.length; 

  // Mock data for header
  const searchParams = {
    location: "Punta Mita, Mexico",
    dates: "Dec 9 – Dec 16",
    guests: "8 Guests"
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-900 mx-auto"></div>
          <p className="mt-4 text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
<SEO
  title={`${items.length} Luxury Villas in Punta Mita, Mexico`}
  description={`Discover ${items.length} luxury villas in Punta Mita, Mexico. Private beachfront properties with premium amenities. Book your dream vacation today.`}
  canonical="/properties"
  image="/og-villas.jpg"
  h1="Luxury Villas in Punta Mita"
  schemaMarkup={generateLocalBusinessSchema({
    name: "VillaNet Luxury Villas",
    description: "Premium luxury villa rentals in Punta Mita, Mexico",
    url: "https://villanet.com",
    telephone: "+1-555-123-4567",
    address: {
      street: "Punta Mita Resort",
      city: "Punta Mita",
      state: "Nayarit",
      postalCode: "63734",
      country: "MX"
    },
    priceRange: "$$$$"
  })}
/>
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#E5E5E5]">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              {/* Logo */}
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="8" cy="8" r="3" stroke="#111111" strokeWidth="1.5"></circle>
                <circle cx="20" cy="8" r="3" stroke="#111111" strokeWidth="1.5"></circle>
                <circle cx="14" cy="20" r="3" stroke="#111111" strokeWidth="1.5"></circle>
                <path d="M10.5 9.5L14 17L17.5 9.5" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
              <Link to="/">
              <span className="text-[#111111] font-bold text-xl tracking-[0.02em] leading-[1.0]">villanet</span>
              </Link>
            </div>
            
            <nav className="hidden md:flex items-center gap-8">
              <a href="#advisors" className="text-sm text-gray-900 font-bold hover:text-gray-600 transition-colors">Advisors</a>
              <a href="#pms" className="text-sm text-gray-900 font-bold hover:text-gray-600 transition-colors">Property Managers</a>
              <a href="/about" className="text-sm text-gray-900 font-bold hover:text-gray-600 transition-colors">About</a>
              <a href="#cta" className="text-sm text-gray-900 font-bold hover:text-gray-600 transition-colors">Login</a>
              <button 
                onClick={openAuthModal}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 rounded-md bg-gray-900 text-white font-bold border-0 hover:bg-gray-700 text-sm px-4"
              >
                Join Network
              </button>
            </nav>
            
            <button className="md:hidden p-2 hover:bg-gray-100 rounded-md transition-colors" type="button">
              <Menu className="w-6 h-6 text-gray-900" />
            </button>
          </div>
        </div>
      </header>

      {/* Search Header */}
      <div className="sticky top-16 z-40 bg-background border-b border-border">
        <div className="container mx-auto px-6 py-4 space-y-4">
          {/* Search Parameters */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <h1 className="text-lg md:text-xl font-semibold text-foreground">
                {items.length} Villas in {searchParams.location}
              </h1>
              <span className="text-muted-foreground">•</span>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>{searchParams.dates}</span>
              </div>
              <span className="text-muted-foreground">•</span>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{searchParams.guests}</span>
              </div>
            </div>
            
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 text-sm border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="rank">Sort: Villa Rank (High → Low)</option>
                <option value="price-low">Price (Low → High)</option>
                <option value="price-high">Price (High → Low)</option>
                <option value="bedrooms">Bedrooms (Most → Least)</option>
              </select>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
              <div className="flex items-center gap-2 flex-nowrap md:flex-wrap">
                {quickFilters.map((filter) => {
                  const Icon = filter.icon;
                  const isActive = selectedBadges.includes(filter.id);
                  
                  return (
                    <button
                      key={filter.id}
                      onClick={() => handleBadgeToggle(filter.id)}
                      role="button"
                      aria-pressed={isActive}
                      aria-label={`Filter by ${filter.label}, ${isActive ? 'active' : 'inactive'}`}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 active:scale-95 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border-2 ${
                        isActive 
                          ? 'bg-primary text-primary-foreground border-primary' 
                          : 'bg-background text-foreground border-[hsl(0,0%,82%)] hover:border-[hsl(0,0%,64%)]'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{filter.label}</span>
                    </button>
                  );
                })}
                
                <button 
                  aria-expanded="false"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium bg-background text-foreground border-2 border-[hsl(0,0%,82%)] hover:border-[hsl(0,0%,64%)] transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <span>+ More Filters</span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="pt-16">
        <div className="container mx-auto px-6 py-8">
          {/* Properties Grid - New Design */}
          {!loading || offset > 0 || availabilitySession ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((item, idx) => {
                const images = item.images_json.length > 0 ? item.images_json : [item.heroImage || PLACEHOLDER];
                const currentIndex = imageIndices[item.id] || 0;
                //const currentImage = images[currentIndex];
                
                return (
                  <div
                    key={`${item.id}-${idx}`}
                    className="group border border-border rounded-lg overflow-hidden bg-card transition-all duration-200 hover:shadow-xl hover:-translate-y-1"
                  >
                    {/* Image Carousel */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                      <div className="relative w-full h-full" role="region" aria-roledescription="carousel">
                        <div className="overflow-hidden">
                          <div className="flex -ml-4 h-full" style={{ transform: `translate3d(${-currentIndex * 100}%, 0px, 0px)` }}>
                            {images.map((image, imgIdx) => (
                              <div
                                key={imgIdx}
                                role="group"
                                aria-roledescription="slide"
                                className="min-w-0 shrink-0 grow-0 basis-full pl-4 h-full"
                              >
                                <img
                                  src={image}
                                  alt={`${item.name} - Image ${imgIdx + 1}`}
                                  className="w-full h-full object-cover"
                                  loading={imgIdx === 0 ? 'eager' : 'lazy'}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Navigation Arrows */}
                        <button
                          disabled={currentIndex === 0}
                          onClick={(e) => handlePrevImage(e, item.id, images.length)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md border border-border transition-all duration-200 opacity-0 group-hover:opacity-100 sm:opacity-100 hover:bg-white hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
                          aria-label="Previous image"
                        >
                          <ChevronLeft className="w-4 h-4 text-foreground" />
                        </button>
                        
                        <button
                          onClick={(e) => handleNextImage(e, item.id, images.length)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md border border-border transition-all duration-200 opacity-0 group-hover:opacity-100 sm:opacity-100 hover:bg-white hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
                          aria-label="Next image"
                        >
                          <ChevronRight className="w-4 h-4 text-foreground" />
                        </button>
                        
                        {/* Image Counter */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs font-medium pointer-events-none">
                          {currentIndex + 1} / {images.length}
                        </div>
                      </div>
                      
                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex justify-between items-start gap-2 z-10">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/95 backdrop-blur-sm border border-border shadow-sm">
                          <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                          <span className="text-xs font-medium text-foreground">Verified 2025</span>
                        </div>
                        
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-background/95 backdrop-blur-sm border border-border shadow-sm">
                          <Star className="w-3.5 h-3.5 text-yellow-600 fill-yellow-600" />
                          <span className="text-xs font-semibold text-foreground">{item.rank?.toFixed(1)}</span>
                        </div>
                      </div>
                      
                      {/* Category Badges */}
                      <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5 z-10">
                        {item.category?.slice(0, 2).map((category, catIdx) => (
                          <span
                            key={catIdx}
                            className="px-2 py-1 text-xs font-medium bg-background/95 backdrop-blur-sm border border-border rounded text-foreground"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Property Info */}
                    <div className="p-4">
                      <a 
                        className="block mb-2 group/link" 
                        href={`/property/${item.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          goToDetail(item);
                        }}
                      >
                        <h3 className="text-lg font-semibold text-foreground group-hover/link:text-primary transition-colors mb-1">
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{item.location || 'Punta Mita, Riviera Nayarit'}</span>
                        </div>
                      </a>
                      
                      {/* Basic Info */}
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3 pb-3 border-b border-border">
                        <div className="flex items-center gap-1">
                          <Bed className="w-4 h-4" />
                          <span>{item.bedrooms ?? '—'} BR</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>Sleeps {item.sleeps}</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          <span>From {formatMoney(item.priceUSD)}/nt</span>
                        </div>
                      </div>

                      {/* Trust Metrics */}
                      <div className="grid grid-cols-2 gap-x-3 gap-y-2 mb-4 text-xs">
                        <div className="flex items-center gap-1.5">
                          <Star className="w-3.5 h-3.5 text-yellow-600 flex-shrink-0" />
                          <span className="text-muted-foreground truncate">
                            Rank: <span className="font-semibold text-foreground">{item.rank?.toFixed(1)}</span>
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                          <span className="text-muted-foreground truncate">{item.propertyManager}</span>
                        </div>
                        
                        <div className="flex items-center gap-1.5">
                          <DollarSign className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                          <span className="text-muted-foreground">Trust Acct</span>
                        </div>
                        
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                          <span className="text-muted-foreground">Daily Clean</span>
                        </div>
                        
                        {item.chefIncluded && (
                          <div className="flex items-center gap-1.5 col-span-2">
                            <ChefHat className="w-3.5 h-3.5 text-orange-600 flex-shrink-0" />
                            <span className="text-muted-foreground">Chef Included</span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => goToDetail(item)}
                          className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 rounded-md px-3 flex-1 bg-[#000000] text-white hover:bg-black/90"
                        >
                          View Villa
                        </button>
                        <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border bg-background hover:text-accent-foreground h-9 rounded-md px-3 border-border hover:bg-accent">
                          Message
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}

          {/* Loading States */}
          {loading && offset === 0 && !availabilitySession && (
            <div className="flex justify-center py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-neutral-900 mx-auto"></div>
                <p className="mt-4 text-neutral-600">Finding your perfect getaway...</p>
              </div>
            </div>
          )}

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

          {/* Infinite scroll trigger */}
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

          {/* End message */}
          {!loading && items.length > 0 && !hasMore && paginationMode === 'infinite' && (
            <div className="flex justify-center mt-8">
              <div className="text-sm text-muted-foreground">Showing {items.length} villas</div>
            </div>
          )}
        </div>
      </main>

      {/* Villa Rank Info Button - MODIFICADO para usar openRankModal */}
      <button 
        onClick={openRankModal} // AGREGADO: onClick handler
        className="fixed bottom-6 right-6 z-40 px-4 py-2.5 bg-white border border-[#E5E5E5] rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 text-gray-700 hover:text-gray-900 animate-fade-in md:bottom-6 md:right-6 max-md:bottom-20 max-md:right-4 max-md:px-3 max-md:py-2"
        aria-label="Learn about Villa Net Rank"
      >
        <Info className="h-4 w-4" />
        <span className="text-sm font-medium max-md:hidden">Villa Net Rank?</span>
        <span className="text-sm font-medium md:hidden">Villa Rank?</span>
      </button>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal 
          onClose={closeAuthModal}
          onSuccess={handleAuthSuccess}
        />
      )}

      {/* AGREGADO: Modal de Villa Net Rank */}
      {showRankModal && (
        <VillaNetRankModal 
          isOpen={showRankModal}
          onClose={closeRankModal}
        />
      )}
    </div>
    </>
  );
}

// Add missing ChevronDown and Info icons
const ChevronDown = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m6 9 6 6 6-6"></path>
  </svg>
);

const Info = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M12 16v-4"></path>
    <path d="M12 8h.01"></path>
  </svg>
);