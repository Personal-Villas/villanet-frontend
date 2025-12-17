import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bed, MapPin, DollarSign, Star, ChevronLeft, ChevronRight, Bath, ShieldCheck, X } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { api, publicApi } from '../api/api'; 
import AuthModal from '../components/AuthModal';
import VillaNetRankModal from '../components/VillaNetRankModal';
import SEO, { generateLocalBusinessSchema } from '../components/SEO';
import { UnifiedHeader } from "../components/Header";
import PropertiesHeaderCompact, { type CrudBadge } from '../components/SecondSearchBar';
import { useCart } from '../context/CartContext';
import CartSidebar from '../components/CartSidebar';
import CartModal from '../components/CartModal';
import { ListingGridSkeleton } from '../ui/ListingGridSkeleton';

type Listing = {
  id: string;
  name: string;
  bedrooms: number | null;
  bathrooms: number | null;
  priceUSD: number | null;
  location: string | null;
  villaNetDestinationTag?: string | null;
  villaNetCity?: string | null;
  villaNetPropertyManagerName?: string | null;
  villaNetCommissionRate?: number | null;
  heroImage: string | null;
  images_json: string[];
  rank?: number | null;
  propertyManager?: string;
  trustAccount?: boolean;
  dailyCleaning?: boolean;
  chefIncluded?: boolean;

  villanetChefIncluded?: boolean;
  villanetHeatedPool?: boolean;
  villanetOceanView?: boolean;
  villanetTrueBeachFront?: boolean;
  villanetGolfCartIncluded?: boolean;
  villanetTennis?: boolean;
  villanetPickleball?: boolean;
  villanetPrivateGym?: boolean;
  villanetPrivateCinema?: boolean;
  villanetCookIncluded?: boolean;
  villanetWaiterButlerIncluded?: boolean;
  villanetOceanFront?: boolean;
  villanetWalkToBeach?: boolean;
  villanetAccessible?: boolean;
  villanetGatedCommunity?: boolean;
  villanetGolfVilla?: boolean;
  villanetResortVilla?: boolean;
  villanetResortCollectionName?: string;
};

type ListingsResponse = {
  results: Listing[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
  availabilityApplied?: boolean;
  availabilitySession?: string;
  currentPage?: number;
  totalPages?: number;
};

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
const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LdrJh0sAAAAAPy3DKaQXrWS_YLJeEtRCN4E4wNj';

const DESTINATIONS = [
  "Cayman Islands",
  "Puerto Vallarta, Mexico",
  "Casa de Campo, Dominican Republic",
  "St. Martin / St. Maarten",
  "Bahamas",
  "Turks & Caicos",
  "Cap Cana, Dominican Republic",
  "St. Barts",
  "Riviera Maya, Mexico",
  "Punta Cana, Dominican Republic",
  "British Virgin Islands",
  "Jamaica",
  "Anguilla",
  "Punta Mita, Mexico",
  "Barbados"
];

const Info = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M12 16v-4"></path>
    <path d="M12 8h.01"></path>
  </svg>
);

export default function Properties() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  // Estados para filtros
  const [filters, setFilters] = useState({
    query: '',
    selectedDestination: '',
    bedrooms: [] as string[],
    bathrooms: [] as string[],
    minPrice: '',
    maxPrice: '',
    checkIn: '',
    checkOut: '',
    selectedBadges: [] as string[],
    guests: 0,
    sortBy: 'rank' as 'rank' | 'price_low' | 'price_high' | 'bedrooms',
  });

  const [appliedFilters, setAppliedFilters] = useState(filters);

  // Estados de paginación
  const [items, setItems] = useState<Listing[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Estado para availability session
  const [availabilitySession, setAvailabilitySession] = useState<string | null>(null);
  
  // 🔥 FIX: useRef para rastrear session de forma estable (no dispara re-renders)
  const availabilitySessionRef = useRef<string | null>(null);
  
  // Sincronizar ref con state
  useEffect(() => {
    availabilitySessionRef.current = availabilitySession;
  }, [availabilitySession]);

  // Message modal
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageListing, setMessageListing] = useState<Listing | null>(null);
  const [messageText, setMessageText] = useState('');
  const [messageLoading, setMessageLoading] = useState(false);
  const [messageError, setMessageError] = useState<string | null>(null);
  const [messageSuccess, setMessageSuccess] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showRankModal, setShowRankModal] = useState(false);
  const [imageIndices, setImageIndices] = useState<{ [key: string]: number }>({});
  const debouncedQuery = useDebounce(filters.query, 600);
  const [badges, setBadges] = useState<CrudBadge[]>([]);
  
  //const hasAvailabilityFilter = Boolean(appliedFilters.checkIn && appliedFilters.checkOut);

  const { 
    isInCart, 
    toggleItem, 
    openCart, 
    cartCount,
    isCartModalOpen,
    closeCartModal
  } = useCart();

  const currentLocationLabel = debouncedQuery.trim() || appliedFilters.selectedDestination || 'Top Villa Destinations';

  const openAuthModal = useCallback(() => {
    setShowAuthModal(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setShowAuthModal(false);
  }, []);

  const openRankModal = useCallback(() => {
    setShowRankModal(true);
  }, []);

  const closeRankModal = useCallback(() => {
    setShowRankModal(false);
  }, []);

  const openMessageModalFor = useCallback((listing: Listing) => {
    setMessageListing(listing);
    setMessageText('');
    setMessageError(null);
    setMessageSuccess(false);
    setShowMessageModal(true);
  }, []);

  const closeMessageModal = useCallback(() => {
    setShowMessageModal(false);
    setMessageListing(null);
    setMessageText('');
    setMessageError(null);
    setMessageSuccess(false);
  }, []);

  const handleMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageListing) return;

    if (!messageText.trim()) {
      setMessageError('Please write your question about this villa.');
      return;
    }

    if (!RECAPTCHA_SITE_KEY) {
      setMessageError('reCAPTCHA is not configured. Please contact support.');
      return;
    }

    try {
      setMessageLoading(true);
      setMessageError(null);

      const grecaptcha = (window as any).grecaptcha;
      if (!grecaptcha) {
        throw new Error('reCAPTCHA is not loaded yet. Please try again in a moment.');
      }

      const recaptchaToken = await grecaptcha.execute(RECAPTCHA_SITE_KEY, {
        action: 'property_message',
      });

      const payload = {
        listingId: messageListing.id,
        message: messageText.trim(),
        recaptchaToken,
      };

      await api('/public/property-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      setMessageSuccess(true);
      setMessageText('');
    } catch (err: any) {
      console.error(err);
      setMessageError(err?.message || 'Error sending your message. Please try again.');
    } finally {
      setMessageLoading(false);
    }
  };

  const handleAuthSuccess = useCallback((user: any) => {
    console.log('✅ Auth success, user received:', user);
    closeAuthModal();
    
    window.dispatchEvent(new Event('authStateChange'));
    
    setRetryCount(prev => prev + 1);
    setCurrentPage(1);
    setItems([]);
    
    console.log('🔄 Auth state updated, Properties should re-render');
  }, [closeAuthModal]);

  const handleApplyFilters = useCallback(() => {
    setAppliedFilters(filters);
  }, [filters]);

  const handleClearAllFilters = useCallback(() => {
    const resetFilters = {
      query: '',
      selectedDestination: '',
      bedrooms: [] as string[],
      bathrooms: [] as string[],
      minPrice: '',
      maxPrice: '',
      checkIn: '',
      checkOut: '',
      selectedBadges: [] as string[],
      guests: 0,
      sortBy: 'rank' as const,
    };
    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
    setCurrentPage(1);
    setError(null);
    setAvailabilitySession(null);
  }, []);

  const handleBadgeToggle = useCallback((badgeId: string) => {
    setFilters(prev => ({
      ...prev,
      selectedBadges: prev.selectedBadges.includes(badgeId)
        ? prev.selectedBadges.filter(id => id !== badgeId)
        : [...prev.selectedBadges, badgeId]
    }));
    
    setAppliedFilters(prev => ({
      ...prev,
      selectedBadges: prev.selectedBadges.includes(badgeId)
        ? prev.selectedBadges.filter(id => id !== badgeId)
        : [...prev.selectedBadges, badgeId]
    }));
  }, []);

  const handleDestinationChange = useCallback((destination: string) => {
    setFilters(prev => ({
      ...prev,
      selectedDestination: destination === prev.selectedDestination ? '' : destination
    }));
    
    setAppliedFilters(prev => ({
      ...prev,
      selectedDestination: destination === prev.selectedDestination ? '' : destination
    }));
  }, []);

  const handleSortChange = useCallback((sort: string) => {
    setFilters(prev => ({
      ...prev,
      sortBy: sort as 'rank' | 'price_low' | 'price_high' | 'bedrooms'
    }));
    
    setAppliedFilters(prev => ({
      ...prev,
      sortBy: sort as 'rank' | 'price_low' | 'price_high' | 'bedrooms'
    }));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const badgeParam = params.get('badge');
    
    if (badgeParam) {
      setFilters(prev => ({
        ...prev,
        selectedBadges: [badgeParam]
      }));
      window.history.replaceState({}, '', '/properties');
    }
  }, []);
  
  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const data = await api<{ badges: CrudBadge[] }>('/badges');
        const transformedBadges = data.badges.map((badge, index) => ({
          ...badge,
          is_quick: index < 4
        }));
        setBadges(transformedBadges);
      } catch (error) {
        console.error('Error fetching badges:', error);
        setBadges([
          { id: 'chef-included', name: 'Chef Included', slug: 'chef-included', icon: 'chef-hat', is_quick: true },
          { id: 'true-beach-front', name: 'True Beach Front', slug: 'true-beach-front', icon: 'waves', is_quick: true },
          { id: 'ocean-view', name: 'Ocean View', slug: 'ocean-view', icon: 'eye', is_quick: true },
          { id: 'heated-pool', name: 'Heated Pool', slug: 'heated-pool', icon: 'waves', is_quick: true }
        ]);
      }
    };

    fetchBadges();
  }, []);

  useEffect(() => {
    if (!RECAPTCHA_SITE_KEY) return;

    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src^="https://www.google.com/recaptcha/api.js?render="]`
    );
    if (existingScript) return;

    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // ✅ Resetear a página 1 cuando cambian los filtros
  useEffect(() => {
    console.log('🔄 Filters changed, resetting to page 1');
    setCurrentPage(1);
    setError(null);
    setAvailabilitySession(null);
  }, [
    appliedFilters.query,
    appliedFilters.selectedDestination, 
    appliedFilters.bedrooms,
    appliedFilters.bathrooms,
    appliedFilters.minPrice,
    appliedFilters.maxPrice,
    appliedFilters.checkIn,
    appliedFilters.checkOut,
    appliedFilters.selectedBadges,
    appliedFilters.sortBy,
    appliedFilters.guests,
  ]);

  // ✅ Fetch principal - se ejecuta cuando cambian filtros O página
  useEffect(() => {
    if (authLoading) return;

    const controller = new AbortController();
    
    // 🔥 FIX: Usar ref en vez del state directamente
    const sessionToUse = availabilitySessionRef.current;

    (async () => {
      console.log(`🚀 Fetching page ${currentPage}...`);
      setLoading(true);
      setError(null);
      
      try {
        const qs = new URLSearchParams();
        
        if (appliedFilters.query.trim().length >= 3) qs.set('q', appliedFilters.query.trim());
        if (appliedFilters.selectedDestination) qs.set('destination', appliedFilters.selectedDestination);
        if (appliedFilters.bedrooms.length) qs.set('bedrooms', appliedFilters.bedrooms.join(','));
        if (appliedFilters.bathrooms.length) qs.set('bathrooms', appliedFilters.bathrooms.join(','));
        if (appliedFilters.minPrice) qs.set('minPrice', String(Number(appliedFilters.minPrice) || ''));
        if (appliedFilters.maxPrice) qs.set('maxPrice', String(Number(appliedFilters.maxPrice) || ''));
        if (appliedFilters.selectedBadges.length) qs.set('badges', appliedFilters.selectedBadges.join(',')); 
        if (appliedFilters.sortBy) qs.set('sort', appliedFilters.sortBy);
        if (appliedFilters.guests && appliedFilters.guests > 0) {
          qs.set('guests', String(appliedFilters.guests));
        }
        
        qs.set('limit', String(ITEMS_PER_PAGE));
        qs.set('page', String(currentPage));
        
        // ✅ Availability: incluir session solo si existe Y estamos en página > 1
        if (appliedFilters.checkIn && appliedFilters.checkOut) {
          qs.set('checkIn', appliedFilters.checkIn);
          qs.set('checkOut', appliedFilters.checkOut);
          
          if (sessionToUse && currentPage > 1) {
            qs.set('availabilitySession', sessionToUse);
          }
        }

        const endpoint = user ? '/listings' : '/public/listings';
        const apiToUse = user ? api : publicApi;
        
        const data = await apiToUse<ListingsResponse>(`${endpoint}?${qs.toString()}`, { 
          signal: controller.signal 
        });

        if (!controller.signal.aborted) {
          const normalized: Listing[] = (data.results || []).map((item: any) => {
            const images = Array.isArray(item.images_json) ? item.images_json : [];
            const first = images[0];
            
            return {
              ...item,
              id: item.id || `temp-${Math.random().toString(36).slice(2)}`,
              images_json: images,
              heroImage: (typeof first === 'string' && first) || item.heroImage || PLACEHOLDER,
              rank: item.rank,
              propertyManager: item.villaNetPropertyManagerName || item.propertyManager || 'Blue Sky Luxury Villas',
              trustAccount: item.trustAccount ?? true,
              dailyCleaning: item.dailyCleaning ?? true,
              chefIncluded: item.villanetChefIncluded ?? item.chefIncluded ?? true,
              villanetChefIncluded: item.villanetChefIncluded ?? false,
              villanetHeatedPool: item.villanetHeatedPool ?? false,
              villanetOceanView: item.villanetOceanView ?? false,
              villanetTrueBeachFront: item.villanetTrueBeachFront ?? false,
              villanetGolfCartIncluded: item.villanetGolfCartIncluded ?? false,
              villanetTennis: item.villanetTennis ?? false,
              villanetPickleball: item.villanetPickleball ?? false,
              villanetPrivateGym: item.villanetPrivateGym ?? false,
              villanetPrivateCinema: item.villanetPrivateCinema ?? false,
              villanetCookIncluded: item.villanetCookIncluded ?? false,
              villanetWaiterButlerIncluded: item.villanetWaiterButlerIncluded ?? false,
              villanetOceanFront: item.villanetOceanFront ?? false,
              villanetWalkToBeach: item.villanetWalkToBeach ?? false,
              villanetAccessible: item.villanetAccessible ?? false,
              villanetGatedCommunity: item.villanetGatedCommunity ?? false,
              villanetGolfVilla: item.villanetGolfVilla ?? false,
              villanetResortVilla: item.villanetResortVilla ?? false,
              villanetResortCollectionName: item.villanetResortCollectionName ?? null,
            };
          });

          setItems(normalized);
          setTotal(data.total);
          setTotalPages(data.totalPages || Math.ceil(data.total / ITEMS_PER_PAGE));
          
          // ✅ Guardar session solo si es página 1 Y tiene availability Y no teníamos session antes
          if (data.availabilitySession && currentPage === 1 && !sessionToUse) {
            setAvailabilitySession(data.availabilitySession);
          }
          
          setRetryCount(0);
          
          console.log(`✅ Page ${currentPage} loaded: ${normalized.length} items, ${data.totalPages} total pages`);
        }
      } catch (err: any) {
        if (!controller.signal.aborted) {
          if (!user && err instanceof Error && err.message?.includes('401')) {
            console.log('Expected 401 for public endpoint - ignoring');
            setItems([]);
            setTotal(0);
            setTotalPages(1);
          } else {
            setError(
              err.message?.includes('429') || err.message?.includes('503')
                ? 'Too many requests. Waiting 60 seconds...'
                : err.message?.includes('401')
                ? 'Session expired. Please log in.'
                : err.message?.includes('expired')
                ? 'Search session expired. Please refresh your search.'
                : 'Server error. Please try again.'
            );
            
            if (err.message?.includes('429') || err.message?.includes('503')) {
              setTimeout(() => {
                setError(null);
                setRetryCount(prev => prev + 1);
              }, 60000);
            }
            
            if (err.message?.includes('expired')) {
              // Resetear availability session
              setAvailabilitySession(null);
              setCurrentPage(1);
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
    authLoading,
    user,
    appliedFilters,
    currentPage,
    retryCount,
    // ❌ NO incluir availabilitySession aquí - causa loop infinito
  ]);

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

  const formatMoney = (n: number | null | undefined) => {
    if (n == null) return '—';
    const amount = Number(n);
    if (isNaN(amount)) return '—';
  
    return `${amount.toLocaleString(undefined, {
      maximumFractionDigits: 0,
    })}`;
  };

  const formatRank = (rank: number | string | null | undefined) => {
    if (rank == null) return "—";
    return rank.toString(); 
  };

  // ✅ Componente de paginación mejorado
  const PaginationControls = () => {
    if (totalPages <= 1) return null;
    
    const handlePrevious = () => {
      if (currentPage > 1) {
        setCurrentPage(currentPage - 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    
    const handleNext = () => {
      if (currentPage < totalPages) {
        setCurrentPage(currentPage + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    
    return (
      <div className="flex justify-center items-center gap-4 py-8">
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className="px-6 py-3 border border-neutral-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 transition-colors font-medium text-neutral-700 flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>
        
        <span className="text-sm text-neutral-600">
          Page {currentPage} of {totalPages}
        </span>
        
        <button
          onClick={handleNext}
          disabled={currentPage >= totalPages}
          className="px-6 py-3 border border-neutral-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 transition-colors font-medium text-neutral-700 flex items-center gap-2"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  };

  const goToDetail = useCallback((property: Listing) => {
    if (!user) {
      openAuthModal();
      return;
    }
    navigate(`/property/${property.id}`);
  }, [navigate, user, openAuthModal]);

  const activeFiltersCount = useMemo(() => {
    return (
      appliedFilters.bedrooms.length + 
      appliedFilters.bathrooms.length + 
      (appliedFilters.minPrice ? 1 : 0) + 
      (appliedFilters.maxPrice ? 1 : 0) + 
      (appliedFilters.checkIn ? 1 : 0) + 
      (appliedFilters.checkOut ? 1 : 0) +
      appliedFilters.selectedBadges.length +
      (appliedFilters.selectedDestination ? 1 : 0) +
      (appliedFilters.query ? 1 : 0)
    );
  }, [appliedFilters]);

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
        title={
          debouncedQuery.trim() || appliedFilters.selectedDestination
            ? `${total} Luxury Villas in ${currentLocationLabel}`
            : `${total} Luxury Villas for Travel Advisors`
        }
        description={
          debouncedQuery.trim() || appliedFilters.selectedDestination
            ? `Discover ${total} luxury villas in ${currentLocationLabel}. Private villas with premium amenities.`
            : `Discover vetted luxury villas with trusted property managers. Filter by dates, destination, and more.`
        }
        canonical="/properties"
        image="/og-villas.jpg"
        h1={
          debouncedQuery.trim() || appliedFilters.selectedDestination
            ? `Luxury Villas in ${currentLocationLabel}`
            : 'Explore Luxury Villas'
        }
        schemaMarkup={generateLocalBusinessSchema({
          name: "VillaNet – Trusted Villa Network",
          description: "Network of vetted luxury villas and professional property managers worldwide.",
          url: "https://villanet.com",
          telephone: "+1-555-123-4567",
          address: {
            street: "",
            city: "",
            state: "",
            postalCode: "",
            country: "US"
          },
          priceRange: "$$"
        })}
      />
      
      <div className="min-h-screen bg-background">
        <UnifiedHeader 
          mode="simple"
          onAuthClick={openAuthModal} 
        />

        <PropertiesHeaderCompact
          itemsCount={total}
          location={debouncedQuery.trim() || appliedFilters.selectedDestination || 'All Locations'}
          query={filters.query}
          setQuery={(query) => setFilters(prev => ({ ...prev, query }))}
          sortBy={filters.sortBy}
          setSortBy={handleSortChange}
          badges={badges}
          selectedBadges={filters.selectedBadges}
          onBadgeToggle={handleBadgeToggle}
          checkIn={filters.checkIn}
          setCheckIn={(checkIn) => setFilters(prev => ({ ...prev, checkIn }))}
          checkOut={filters.checkOut}
          setCheckOut={(checkOut) => setFilters(prev => ({ ...prev, checkOut }))}
          bedrooms={filters.bedrooms}
          setBedrooms={(bedrooms) => setFilters(prev => ({ ...prev, bedrooms }))}
          onClearAllFilters={handleClearAllFilters}
          destinations={DESTINATIONS}
          selectedDestination={filters.selectedDestination}
          onSelectDestination={handleDestinationChange}
          cartCount={cartCount}
          onCartClick={openCart}
          guests={filters.guests}        
          setGuests={(guests) => setFilters(prev => ({ ...prev, guests }))}
          onApplyFilters={handleApplyFilters}
        />

        <main className="pt-16">
          {loading ? (
            <div className="container mx-auto px-6 py-8">
              <ListingGridSkeleton count={12} />
            </div>
          ) : error ? (
            <div className="container mx-auto px-6 py-20">
              <div className="max-w-md mx-auto text-center">
                <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <X className="w-10 h-10 text-red-600" />
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-3">
                  {error.includes('expired') ? 'Search expired' : 'Something went wrong'}
                </h3>
                <p className="text-neutral-500 mb-6">{error}</p>
                <button 
                  onClick={() => {
                    setError(null);
                    setCurrentPage(1);
                    setAvailabilitySession(null);
                    setRetryCount(prev => prev + 1);
                  }}
                  className="bg-neutral-900 text-white px-8 py-4 rounded-full hover:bg-neutral-800 transition font-medium"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : (
            <div className="container mx-auto px-6 py-8">
              {items.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {items.map((item, idx) => {
                      const images = item.images_json.length > 0 ? item.images_json : [item.heroImage || PLACEHOLDER];
                      const currentIndex = imageIndices[item.id] || 0;
                      
                      const displayLocation =
                        item.villaNetDestinationTag ||
                        item.villaNetCity ||
                        item.location ||
                        'Location not specified';
                      
                      return (
                        <div
                          key={`${item.id}-${idx}`}
                          className="group border border-border rounded-lg overflow-hidden bg-card transition-all duration-200 hover:shadow-xl hover:-translate-y-1"
                        >
                          {/* Image Carousel */}
                          <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                            <div className="relative w-full h-full" role="region" aria-roledescription="carousel">
                              <div className="relative w-full h-full overflow-hidden">
                                <div 
                                  className="flex h-full transition-transform duration-300 ease-out" 
                                  style={{ transform: `translateX(${-currentIndex * 100}%)` }}
                                >
                                  {images.map((image, imgIdx) => (
                                    <div
                                      key={imgIdx}
                                      role="group"
                                      aria-roledescription="slide"
                                      className="w-full h-full flex-shrink-0"
                                      style={{ minWidth: '100%' }}
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
                                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md border border-border transition-all duration-200 opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:bg-white hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
                                aria-label="Previous image"
                              >
                                <ChevronLeft className="w-4 h-4 text-foreground" />
                              </button>

                              <button
                                onClick={(e) => handleNextImage(e, item.id, images.length)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md border border-border transition-all duration-200 opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:bg-white hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
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
                                <span className="text-xs font-semibold text-foreground">
                                  {formatRank(item.rank)}
                                </span>
                              </div>
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
                                <span>{displayLocation}</span>
                              </div>
                            </a>
                            
                            {/* Basic Info */}
                            <div className="flex items-center md:flex-nowrap flex-wrap gap-2 md:gap-3 text-xs md:text-sm text-muted-foreground mb-3 pb-3 border-b border-border">
                              <div className="flex items-center gap-1 whitespace-nowrap">
                                <Bed className="w-4 h-4" />
                                <span>{item.bedrooms ?? '—'} BR</span>
                              </div>

                              <span className="hidden md:inline">•</span>

                              <div className="flex items-center gap-1 whitespace-nowrap">
                                <Bath className="w-4 h-4" />
                                <span>{item.bathrooms ?? '—'} BA</span>
                              </div>

                              <span className="hidden md:inline">•</span>

                              <div className="flex items-center gap-1 whitespace-nowrap">
                                <DollarSign className="w-4 h-4" />
                                <span>From {formatMoney(item.priceUSD)}/nt</span>
                              </div>
                            </div>

                            {/* Trust Metrics */}
                            <div className="mb-4 text-xs space-y-2">
                              <div className="flex items-center gap-1.5">
                                <ShieldCheck className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                                <span className="text-muted-foreground truncate">
                                  {item.propertyManager}
                                </span>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                              <button
                                onClick={() => goToDetail(item)}
                                className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 rounded-md px-3 flex-1 bg-[#000000] text-white hover:bg-black/90"
                              >
                                View Villa
                              </button>

                              <button
                                onClick={() => toggleItem(item)}
                                className={`inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 rounded-md px-3 border ${
                                  isInCart(item.id)
                                    ? "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700"
                                    : "bg-background text-foreground border-border hover:bg-accent"
                                }`}
                              >
                                {isInCart(item.id) ? "Remove from cart" : "Add to cart"}
                              </button>

                              <button
                                onClick={() => openMessageModalFor(item)}
                                className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border bg-background hover:text-accent-foreground h-9 rounded-md px-3 border-border hover:bg-accent"
                              >
                                Message
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination Controls */}
                  <PaginationControls />
                </>
              ) : (
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
                        onClick={handleClearAllFilters} 
                        className="bg-neutral-900 text-white px-8 py-4 rounded-full hover:bg-neutral-800 transition font-medium"
                      >
                        Clear all filters
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        <CartSidebar />
        <CartModal isOpen={isCartModalOpen} onClose={closeCartModal} />

        <button 
          onClick={openRankModal}
          className={`fixed bottom-6 z-40 px-4 py-2.5 bg-white border border-[#E5E5E5] rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 text-gray-700 hover:text-gray-900 animate-fade-in ${cartCount > 0 ? 'right-20' : 'right-20'}`}
          aria-label="Learn about Villa Net Rank"
        >
          <Info className="h-4 w-4" />
          <span className="text-sm font-medium max-md:hidden">Villa Net Rank?</span>
          <span className="text-sm font-medium md:hidden">Villa Rank?</span>
        </button>

        {showAuthModal && (
          <AuthModal 
            onClose={closeAuthModal}
            onSuccess={handleAuthSuccess}
          />
        )}

        {showRankModal && (
          <VillaNetRankModal 
            isOpen={showRankModal}
            onClose={closeRankModal}
          />
        )}

        {showMessageModal && messageListing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border border-neutral-200 p-6 relative">
              <button
                onClick={closeMessageModal}
                className="absolute right-4 top-4 text-neutral-500 hover:text-neutral-800 text-xl leading-none"
                aria-label="Close message modal"
              >
                ×
              </button>

              <h2 className="text-lg font-semibold text-neutral-900 mb-1">
                Ask about this villa
              </h2>
              <p className="text-sm text-neutral-600 mb-4">
                Your message will be sent to the team of{' '}
                <span className="font-medium">{messageListing.name}</span>.
              </p>

              <form onSubmit={handleMessageSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-800 mb-2">
                    Your question*
                  </label>
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    rows={4}
                    maxLength={1000}
                    className="w-full resize-none rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900"
                    placeholder="E.g. Is the pool heated? Are pets allowed? Can you confirm the exact beach access?"
                  />
                  <div className="mt-1 text-xs text-neutral-400 text-right">
                    {messageText.length}/1000
                  </div>
                </div>

                {messageError && (
                  <p className="text-xs text-red-600">
                    {messageError}
                  </p>
                )}

                {messageSuccess && (
                  <p className="text-xs text-green-600">
                    Your message was sent successfully. Our team will contact you soon.
                  </p>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={closeMessageModal}
                    className="px-4 py-2 text-sm font-medium text-neutral-700 border border-neutral-300 rounded-lg hover:bg-neutral-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={messageLoading}
                    className="px-4 py-2 text-sm font-medium rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 disabled:opacity-60"
                  >
                    {messageLoading ? 'Sending...' : 'Send message'}
                  </button>
                </div>

                <p className="text-[10px] text-neutral-400 mt-1">
                  Protected by reCAPTCHA. Spam and automated messages are blocked.
                </p>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}