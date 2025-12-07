import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bed, MapPin, DollarSign, Star, ShieldCheck, Sparkles, ChefHat, ChevronLeft, ChevronRight, Bath } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { api, publicApi } from '../api/api'; 
import AuthModal from '../components/AuthModal';
import VillaNetRankModal from '../components/VillaNetRankModal';
import SEO, { generateLocalBusinessSchema } from '../components/SEO';
import { UnifiedHeader } from "../components/Header";
import PropertiesHeader, { type CrudBadge } from '../components/SearchBar';

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
  category?: string[];
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

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LdrJh0sAAAAAPy3DKaQXrWS_YLJeEtRCN4E4wNj';

// Lista de destinos predefinidos
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

// Info icon component
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
  
  // 🔥 NUEVO: Estado para el destino seleccionado
  const [selectedDestination, setSelectedDestination] = useState('');
  
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

  // Message modal
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageListing, setMessageListing] = useState<Listing | null>(null);
  const [messageText, setMessageText] = useState('');
  const [messageLoading, setMessageLoading] = useState(false);
  const [messageError, setMessageError] = useState<string | null>(null);
  const [messageSuccess, setMessageSuccess] = useState(false);

  // Auth modal state
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Villa Net Rank modal state
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

  // Badges state from API
  const [badges, setBadges] = useState<CrudBadge[]>([]);
  const [loadingBadges, setLoadingBadges] = useState(true);

  // Check if availability filters are applied
  const hasAvailabilityFilter = checkIn || checkOut;

  // Calcular currentLocationLabel dinámicamente
  const currentLocationLabel = debouncedQuery.trim() || selectedDestination || 'Top Villa Destinations';

  // Modal handlers
  const openAuthModal = useCallback(() => {
    setShowAuthModal(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setShowAuthModal(false);
  }, []);

  // Handlers para el modal de Villa Net Rank
  const openRankModal = useCallback(() => {
    setShowRankModal(true);
  }, []);

  const closeRankModal = useCallback(() => {
    setShowRankModal(false);
  }, []);

  // Handlers para el modal de mensajes - SIN necesidad de login
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
    
    // Disparar evento para actualizar el contexto
    window.dispatchEvent(new Event('authStateChange'));
    
    // Forzar re-render
    setRetryCount(prev => prev + 1);
    setOffset(0);
    setItems([]);
    setHasMore(true);
    
    console.log('🔄 Auth state updated, Properties should re-render');
  }, [closeAuthModal]);

  // Handler para cambio de sort que resetea antes de cambiar
  const handleSortChange = useCallback((newSort: string) => {
    setSortBy(newSort);
  }, []);
  
  // Fetch badges from API
  useEffect(() => {
    const fetchBadges = async () => {
      try {
        setLoadingBadges(true);
        const data = await api<{ badges: CrudBadge[] }>('/badges');
        // Transformar los badges para incluir is_quick basado en algún criterio
        const transformedBadges = data.badges.map((badge, index) => ({
          ...badge,
          is_quick: index < 4
        }));
        setBadges(transformedBadges);
      } catch (error) {
        console.error('Error fetching badges:', error);
        // Fallback a badges básicos si la API falla
        setBadges([
          { id: 'chef', name: 'Chef Included', slug: 'chef', icon: 'chef-hat', is_quick: true },
          { id: 'beachfront', name: 'True Beach Front', slug: 'beachfront', icon: 'waves', is_quick: true },
          { id: 'ocean-view', name: 'Ocean View', slug: 'ocean-view', icon: 'eye', is_quick: true },
          { id: 'heated-pool', name: 'Heated Pool', slug: 'heated-pool', icon: 'waves', is_quick: true }
        ]);
      } finally {
        setLoadingBadges(false);
      }
    };

    fetchBadges();
  }, []);

  // Cargar script de Google reCAPTCHA v3
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

  // Switch to pagination mode when availability filters are applied and many results
  useEffect(() => {
    if (hasAvailabilityFilter && items.length > 0 && items.length >= 48) {
      setPaginationMode('pagination');
    } else if (!hasAvailabilityFilter) {
      setPaginationMode('infinite');
    }
  }, [items.length, hasAvailabilityFilter]);

  useEffect(() => {
    // Resetea solo cuando cambia un filtro real
    setOffset(0);
    setItems([]);
    setHasMore(true);
    setError(null);
    setAvailabilitySession(null);
    setAvailabilityCursor(null);
    setPaginationMode('infinite');
  }, [
    debouncedQuery,
    selectedDestination, // 🔥 Añadido: reset cuando cambia el destino
    bedrooms,
    bathrooms,
    minPrice,
    maxPrice,
    checkIn,
    checkOut,
    selectedBadges,
    sortBy
  ]);

  // Fetch listings
  useEffect(() => {
    if (authLoading) return;

    const controller = new AbortController();

    (async () => {
      setLoading(true);
      setError(null);
      
      try {
        const qs = new URLSearchParams();
        if (debouncedQuery.trim().length >= 3) qs.set('q', debouncedQuery.trim());
        if (selectedDestination) qs.set('destination', selectedDestination); // 🔥 NUEVO: Añadir destination
        if (bedrooms.length) qs.set('bedrooms', bedrooms.join(','));
        if (bathrooms.length) qs.set('bathrooms', bathrooms.join(','));
        if (minPrice) qs.set('minPrice', String(Number(minPrice) || ''));
        if (maxPrice) qs.set('maxPrice', String(Number(maxPrice) || ''));
        if (checkIn) qs.set('checkIn', checkIn);
        if (checkOut) qs.set('checkOut', checkOut);
        if (selectedBadges.length) qs.set('badges', selectedBadges.join(',')); 
        if (sortBy) qs.set('sort', sortBy);
        qs.set('limit', String(ITEMS_PER_PAGE));
        
        if (availabilitySession && availabilityCursor !== null) {
          qs.set('availabilitySession', availabilitySession);
          qs.set('availabilityCursor', String(availabilityCursor));
          qs.set('offset', '0');
        } else {
          qs.set('offset', String(offset));
        }

        // 🔥 CAMBIO: Usar publicApi cuando el usuario no está autenticado
        const endpoint = user ? '/listings' : '/public/listings';
        const apiToUse = user ? api : publicApi;
        
        const data = await apiToUse<ListingsResponse>(`${endpoint}?${qs.toString()}`, { 
          signal: controller.signal 
        });

        if (!controller.signal.aborted) {
          const normalized: Listing[] = (data.results || []).map((item: any) => {
            console.log('Rank data:', item.rank, typeof item.rank);
            
            const images = Array.isArray(item.images_json) ? item.images_json : [];
            const first = images[0];
            
            return {
              ...item,
              id: item.id || `temp-${Math.random().toString(36).slice(2)}`,
              images_json: images,
              heroImage: (typeof first === 'string' && first) || item.heroImage || PLACEHOLDER,
              // Rank: usar el que viene de VillaNet; si no, fallback
              rank: item.rank,
        
              // 🔹 Property manager: primero VillaNet, luego cualquier otro, luego default
              propertyManager:
                item.villaNetPropertyManagerName ||
                item.propertyManager ||
                'Blue Sky Luxury Villas',
        
              trustAccount: item.trustAccount ?? true,
              dailyCleaning: item.dailyCleaning ?? true,
              
              // 🔥 Usar los nuevos campos VillaNet para chefIncluded
              chefIncluded: item.villanetChefIncluded ?? item.chefIncluded ?? true,
              
              // 🔥 Mapear los demás campos booleanos de VillaNet
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
    selectedDestination, // 🔥 Añadido: dependencia del destino
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

  // Función helper segura para formatMoney
  const formatMoney = (n: number | null | undefined) => {
    if (n == null) return '—';
    const amount = Number(n);
    return isNaN(amount) ? '—' : `$${(amount / 100).toLocaleString()}`;
  };

  // Función helper segura para ranks
  const formatRank = (rank: number | string | null | undefined) => {
    if (rank == null) return "—";
    return rank.toString(); 
  };

  // 🔥 NUEVO: Función para limpiar todos los filtros incluyendo destination
  const clearAllFilters = useCallback(() => {
    setQuery('');
    setSelectedDestination(''); // 🔥 Limpiar destination también
    setBedrooms([]);
    setBathrooms([]);
    setMinPrice('');
    setMaxPrice('');
    setCheckIn('');
    setCheckOut('');
    setSelectedBadges([]);
    setSortBy('rank');
    setOffset(0);
    setError(null);
    setAvailabilitySession(null);
    setAvailabilityCursor(null);
    setPaginationMode('infinite');
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

  const goToDetail = useCallback((property: Listing) => {
    if (!user) {
      openAuthModal();
      return;
    }
    navigate(`/property/${property.id}`);
  }, [navigate, user, openAuthModal]);

  const handleBadgeToggle = useCallback((badgeId: string) => {
    setSelectedBadges(prev => 
      prev.includes(badgeId)
        ? prev.filter(id => id !== badgeId)
        : [...prev, badgeId]
    );
  }, []);

  // Calcular filtros activos
  const activeFiltersCount = 
    bedrooms.length + 
    bathrooms.length + 
    (minPrice ? 1 : 0) + 
    (maxPrice ? 1 : 0) + 
    (checkIn ? 1 : 0) + 
    (checkOut ? 1 : 0) +
    selectedBadges.length +
    (selectedDestination ? 1 : 0) + // 🔥 Añadir destination a la cuenta
    (query ? 1 : 0);

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
      {/* SEO dinámico que ya no fuerza Punta Mita */}
      <SEO
        title={
          debouncedQuery.trim() || selectedDestination
            ? `${items.length} Luxury Villas in ${currentLocationLabel}`
            : `${items.length} Luxury Villas for Travel Advisors`
        }
        description={
          debouncedQuery.trim() || selectedDestination
            ? `Discover ${items.length} luxury villas in ${currentLocationLabel}. Private villas with premium amenities.`
            : `Discover vetted luxury villas with trusted property managers. Filter by dates, destination, and more.`
        }
        canonical="/properties"
        image="/og-villas.jpg"
        h1={
          debouncedQuery.trim() || selectedDestination
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
          priceRange: "$$$$"
        })}
      />
      
      <div className="min-h-screen bg-background">
        {/* Header */}
        <UnifiedHeader 
          mode="simple"
          onAuthClick={openAuthModal} 
        />

        {/* 🔹 CAMBIO: Pasar total en lugar de items.length y añadir props de destination */}
        <PropertiesHeader
          itemsCount={total}
          location={debouncedQuery.trim() || selectedDestination || 'All Locations'}
          query={query}
          setQuery={setQuery}
          sortBy={sortBy}
          setSortBy={handleSortChange}
          badges={badges}
          selectedBadges={selectedBadges}
          onBadgeToggle={handleBadgeToggle}
          checkIn={checkIn}
          setCheckIn={setCheckIn}
          checkOut={checkOut}
          setCheckOut={setCheckOut}
          bedrooms={bedrooms}
          setBedrooms={setBedrooms}
          onClearAllFilters={clearAllFilters}
          // 🔥 NUEVO: Props para el selector de destino
          destinations={DESTINATIONS}
          selectedDestination={selectedDestination}
          onSelectDestination={setSelectedDestination}
        />

        {/* Main Content */}
        <main className="pt-16">
          <div className="container mx-auto px-6 py-8">
            {/* Properties Grid */}
            {!loading || offset > 0 || availabilitySession ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {items.map((item, idx) => {
                  const images = item.images_json.length > 0 ? item.images_json : [item.heroImage || PLACEHOLDER];
                  const currentIndex = imageIndices[item.id] || 0;
                  
                  // 🔹 NUEVO: Normalizar ubicación mostrada
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
                            <span className="text-xs font-semibold text-foreground">
                              {formatRank(item.rank)}
                            </span>
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
                          {/* 🔹 CAMBIO: Usar displayLocation normalizada */}
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{displayLocation}</span>
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
                            <Bath className="w-4 h-4" />
                            <span>{item.bathrooms ?? '—'} BA</span>
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
                              Rank: <span className="font-semibold text-foreground">
                                {formatRank(item.rank)}
                              </span>
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

            {/* 🔹 CAMBIO: End message que muestra "X of Y villas" */}
            {!loading && items.length > 0 && !hasMore && paginationMode === 'infinite' && (
              <div className="flex justify-center mt-8">
                <div className="text-sm text-muted-foreground">
                  Showing {items.length} of {total} villas
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Villa Rank Info Button */}
        <button 
          onClick={openRankModal}
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

        {/* Modal de Villa Net Rank */}
        {showRankModal && (
          <VillaNetRankModal 
            isOpen={showRankModal}
            onClose={closeRankModal}
          />
        )}

        {/* Message Modal */}
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