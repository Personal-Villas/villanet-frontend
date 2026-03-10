import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
import { ListingCardSkeleton } from '../ui/ListingCardSkeleton';
import { PropertyCard } from '../components/PropertyCard';
import { PaginationControls } from '../components/PaginationControls';
import { SearchLoader } from '../components/SearchLoader';
import ExpansionButton from '../components/ExpansionButton';
import ExpansionModal from '../components/ExpansionModal';
import { initPerformanceMetrics } from '../services/imageUtils';
import { normalizePropertyName } from '../utils/normalizePropertyName';
import { NewQuoteModal } from '../components/NewQuoteModal';


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
  guesty_booking_domain?: string | null;
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
  // Nuevos campos para paginación con availability
  cursor?: number;
  nextCursor?: number;
  requested?: number;
  returned?: number;
  partial?: boolean;
  exhausted?: boolean;
  totalScanned?: number;
  totalAvailable?: number;
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

// 🔥 UX progressive loading
type UxPhase = 'idle' | 'loader' | 'skeleton' | 'results';
const MIN_LOADER_MS = 1200; // Loader visible mínimo 1.2s

export default function Properties() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Navigate back to quote wizard
  const handleEditQuote = useCallback(() => {
    navigate('/properties?quoteFlow=true');
  }, [navigate]);

  // ── Auto-open NewQuoteModal al entrar en /properties ─────────────────────
  // Solo corre al montar. Pone quoteFlow=true para abrir el modal, salvo que:
  // - ya haya quoteFlow en la URL (true o false — false lo manda PropertyDetail)
  // - venga fromQuote=true (wizard completado, los filtros se aplican aparte)
  useEffect(() => {
    const quoteFlow = searchParams.get('quoteFlow');
    const isFromQuote = searchParams.get('fromQuote') === 'true';

    if (!isFromQuote && quoteFlow === null) {
      const next = new URLSearchParams(searchParams);
      next.set('quoteFlow', 'true');
      setSearchParams(next, { replace: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Aplicar filtros cuando viene fromQuote=true ───────────────────────────
  // El wizard navega a /properties?fromQuote=true&destination=...&checkIn=...
  // Este efecto lee esos params, los aplica a los filtros y limpia la URL.
  useEffect(() => {
    if (searchParams.get('fromQuote') !== 'true') return;

    const destination = searchParams.get('destination') || '';
    // Support both single `destination` (legacy) and multi `destinations` (wizard multi-select)
    const destinationsParam = searchParams.get('destinations') || '';
    const resolvedDestination = destinationsParam || destination;
    const bedroomsParam = searchParams.get('bedrooms');
    const guestsParam = searchParams.get('guests');
    const checkIn = searchParams.get('checkIn') || '';
    const checkOut = searchParams.get('checkOut') || '';
    const maxPrice = searchParams.get('maxPrice') || '';

    const quoteFilters = {
      query: '',
      selectedDestination: resolvedDestination,
      bedrooms: bedroomsParam ? bedroomsParam.split(',').filter(Boolean) : [] as string[],
      bathrooms: [] as string[],
      minPrice: '',
      maxPrice,
      checkIn,
      checkOut,
      selectedBadges: [] as string[],
      guests: guestsParam ? parseInt(guestsParam, 10) : 0,
      sortBy: 'rank' as const,
    };

    filterChangedRef.current = true;
    setFilters(quoteFilters);
    setAppliedFilters(quoteFilters);
    setCurrentPage(1);
    setAvailabilityCursor(0);
    setItems([]);
    setAvailabilitySession(null);
    setPage1Filled(false);
    setAutoFillDone(false);

    // Limpiar params del wizard de la URL
    const cleanParams = new URLSearchParams(searchParams);
    ['fromQuote', 'destination', 'destinations', 'bedrooms', 'guests',
     'checkIn', 'checkOut', 'maxPrice', 'flexibleRange'].forEach(k => cleanParams.delete(k));
    setSearchParams(cleanParams, { replace: true });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);


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

  // 🔥 NUEVO: Estado para cursor de availability
  const [availabilityCursor, setAvailabilityCursor] = useState(0);

  // Estado para availability session
  const [availabilitySession, setAvailabilitySession] = useState<string | null>(null);

  // 🔥 NUEVO: Estado para auto-fetch incremental
  const [autoFillTick, setAutoFillTick] = useState(0);
  const [page1Filled, setPage1Filled] = useState(false);
  const [autoFillDone, setAutoFillDone] = useState(false);

  // Ref para rastrear session de forma estable (no dispara re-renders)
  const availabilitySessionRef = useRef<string | null>(null);

  // 🔥 UX progressive loading states
  const [uxPhase, setUxPhase] = useState<UxPhase>('idle');
  const [progress, setProgress] = useState(0);
  const searchStartRef = useRef<number>(0);
  const uxPhaseRef = useRef<UxPhase>('idle'); // ref para leer uxPhase sin dependencia reactiva

  // 🔥 "slots" para render fijo (12 cards siempre). null = skeleton
  const [slots, setSlots] = useState<(Listing | null)[]>(
    Array.from({ length: ITEMS_PER_PAGE }, () => null)
  );

  //Estado para ExpansionModal
  const [showExpansionModal, setShowExpansionModal] = useState(false);

  // helper: arranca loader intencional + progreso simulado
  const uxCleanupRef = useRef<null | (() => void)>(null);
  // Señal para mostrar skeletons inmediatamente al cambiar filtros
  const filterChangedRef = useRef<boolean>(false);

  // paddingTop dinámico para el grid: solo la altura del panel absoluto + gap
  // El sticky bar (80px) ya ocupa espacio en el flujo del documento.
  const [panelHeight, setPanelHeight] = useState(291); // offsetHeight medido en dev
  useEffect(() => {
    let ro: ResizeObserver | null = null;
    const attach = () => {
      const panel = document.querySelector<HTMLElement>(
        '.sticky.top-16 > div[class*="absolute"]'
      );
      if (!panel) return false;
      ro = new ResizeObserver(() => {
        const isVisible = !panel.classList.contains('opacity-0');
        setPanelHeight(isVisible ? panel.scrollHeight : 0);
      });
      ro.observe(panel);
      const isVisible = !panel.classList.contains('opacity-0');
      setPanelHeight(isVisible ? panel.scrollHeight : 0);
      return true;
    };
    if (!attach()) {
      const t = setTimeout(attach, 300);
      return () => clearTimeout(t);
    }
    return () => ro?.disconnect();
  }, []);

  const startSearchUx = useCallback(() => {
    uxCleanupRef.current?.(); // limpia timers previos

    searchStartRef.current = Date.now();
    uxPhaseRef.current = 'loader';
    setUxPhase('loader');
    setProgress(10);

    const t1 = window.setTimeout(() => setProgress(30), 220);
    const t2 = window.setTimeout(() => setProgress(60), 520);
    const t3 = window.setTimeout(() => setProgress(90), 1100);

    uxCleanupRef.current = () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, []);

  useEffect(() => {
    return () => {
      uxCleanupRef.current?.();
    };
  }, []);

  // 🆕 Guardar TODOS los filtros en localStorage
  useEffect(() => {
    const filters = {
      query: appliedFilters.query,
      checkIn: appliedFilters.checkIn,
      checkOut: appliedFilters.checkOut,
      guests: appliedFilters.guests,
      bedrooms: appliedFilters.bedrooms,
      bathrooms: appliedFilters.bathrooms,
      minPrice: appliedFilters.minPrice,
      maxPrice: appliedFilters.maxPrice,
      destination: appliedFilters.selectedDestination,
      badges: appliedFilters.selectedBadges,
      sort: appliedFilters.sortBy,
    };

    const hasActiveFilters = Object.values(filters).some(
      value => value !== '' && value !== null && value !== undefined && value !== 0 &&
        (Array.isArray(value) ? value.length > 0 : true)
    );

    if (hasActiveFilters) {
      console.log('💾 Guardando filtros en localStorage:', filters); // ← AGREGAR
      localStorage.setItem('searchFilters', JSON.stringify(filters));
    }
  }, [appliedFilters]);

  // 🆕 Guardar y restaurar posición de scroll
  useEffect(() => {
    // Función para guardar scroll constantemente
    const handleScroll = () => {
      if (isRestoringScroll) return;

      localStorage.setItem('propertiesScrollPosition', window.scrollY.toString());
    };

    // Verificar si venimos de property detail
    const restoreScrollPosition = localStorage.getItem('restoreScrollPosition');
    const fromPropertyDetail = localStorage.getItem('fromPropertyDetail');

    // Restaurar scroll si venimos de property detail Y hay items cargados
    if (fromPropertyDetail === 'true' && restoreScrollPosition && items.length > 0) {
      setIsRestoringScroll(true);

      setTimeout(() => {
        window.scrollTo({
          top: parseInt(restoreScrollPosition),
          behavior: 'smooth'
        });

        // Limpiar flags después de restaurar
        localStorage.removeItem('fromPropertyDetail');
        localStorage.removeItem('restoreScrollPosition');

        // Ocultar indicador después de completar scroll
        setTimeout(() => setIsRestoringScroll(false), 500);
      }, 100);
    }

    // Escuchar scroll para guardar posición constantemente
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [items.length]); // Solo re-ejecutar cuando cambien los items


  // Sincronizar ref con state
  useEffect(() => {
    availabilitySessionRef.current = availabilitySession;
  }, [availabilitySession]);

  // Métricas LCP CLS
  useEffect(() => {
  const cleanup = initPerformanceMetrics({
    debug: import.meta.env.DEV,  // logs en consola solo en desarrollo
  });
  return cleanup;
}, []);

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
  const [isRestoringScroll, setIsRestoringScroll] = useState(false);
  const debouncedQuery = useDebounce(filters.query, 600);
  const [badges, setBadges] = useState<CrudBadge[]>([]);

  const hasAvailabilityFilter = Boolean(appliedFilters.checkIn && appliedFilters.checkOut);

  const {
    isInCart,
    toggleItem,
    openCart,
    cartCount,
    isCartModalOpen,
    closeCartModal,
    setQuoteDates,
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
    filterChangedRef.current = true;
    startSearchUx();

    setAppliedFilters(filters);
    setCurrentPage(1);
    setAvailabilityCursor(0);
    setItems([]);
    setAvailabilitySession(null);

    // Persistir fechas en CartContext para que estén disponibles desde PropertyDetail
    setQuoteDates(filters.checkIn, filters.checkOut);

    setPage1Filled(false);
    setAutoFillDone(false);

    setSlots(Array.from({ length: ITEMS_PER_PAGE }, () => null));
  }, [filters, startSearchUx, setQuoteDates]);

  const handleClearAllFilters = useCallback(() => {
    filterChangedRef.current = true;
    startSearchUx();

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

    setAvailabilityCursor(0);
    setItems([]);
    setAvailabilitySession(null);
    setPage1Filled(false);
    setAutoFillDone(false);
    setQuoteDates('', '');

    setSlots(Array.from({ length: ITEMS_PER_PAGE }, () => null));
  }, [startSearchUx, setQuoteDates]);

  const applyFiltersImmediately = useCallback((newFilters: typeof filters) => {
    console.log('🔵 [UX] applyFiltersImmediately → destination:', newFilters.selectedDestination, '| badges:', newFilters.selectedBadges);
    filterChangedRef.current = true;
    setFilters(newFilters);
    startSearchUx();
    setAppliedFilters(newFilters);
    setCurrentPage(1);
    setAvailabilityCursor(0);
    setItems([]);
    setAvailabilitySession(null);
    setPage1Filled(false);
    setAutoFillDone(false);
    setSlots(Array.from({ length: ITEMS_PER_PAGE }, () => null));
  }, [startSearchUx]);

  const handleBadgeToggle = useCallback((badgeId: string) => {
    const newBadges = filters.selectedBadges.includes(badgeId)
      ? filters.selectedBadges.filter(id => id !== badgeId)
      : [...filters.selectedBadges, badgeId];

    applyFiltersImmediately({
      ...filters,
      selectedBadges: newBadges
    });
  }, [filters, applyFiltersImmediately]);

  const handleDestinationChange = useCallback((destination: string) => {
    // SecondSearchBar now passes the full updated CSV string (e.g. "Jamaica,St. Barts")
    // We just apply it directly — toggle logic is handled inside SecondSearchBar
    applyFiltersImmediately({
      ...filters,
      selectedDestination: destination
    });
  }, [filters, applyFiltersImmediately]);

  const handleSortChange = useCallback((sort: string) => {
    console.log("🧪 handleSortChange received:", sort);
    const newFilters = {
      ...filters,
      sortBy: sort as 'rank' | 'price_low' | 'price_high' | 'bedrooms'
    };
    console.log("🧪 newFilters.sortBy:", newFilters.sortBy);

    applyFiltersImmediately(newFilters);
  }, [filters, applyFiltersImmediately]);

  const DEFAULT_FILTERS = {
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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const badgeParam = params.get('badge');
    if (!badgeParam) return;

    const next = { ...DEFAULT_FILTERS, selectedBadges: [badgeParam] };

    startSearchUx();
    setFilters(next);
    setAppliedFilters(next);

    setCurrentPage(1);
    setRetryCount(0);
    setAvailabilityCursor(0);
    setItems([]);
    setAvailabilitySession(null);
    setPage1Filled(false);
    setAutoFillDone(false);
    setSlots(Array.from({ length: ITEMS_PER_PAGE }, () => null));

    window.history.replaceState({}, '', '/properties');
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // Leer parámetros de la URL al montar el componente
    const params = new URLSearchParams(window.location.search);

    // Si no hay parámetros, no hacer nada (ya tiene defaults)
    if (params.toString() === '') return;

    console.log('📥 Restaurando filtros desde URL:', params.toString());

    const urlFilters: typeof filters = { ...filters };
    let hasUrlFilters = false;

    // Query
    if (params.get('q')) {
      urlFilters.query = params.get('q') || '';
      hasUrlFilters = true;
    }

    // Destination
    if (params.get('destination')) {
      urlFilters.selectedDestination = params.get('destination') || '';
      hasUrlFilters = true;
    }

    // Bedrooms (puede ser "3,4,5")
    if (params.get('bedrooms')) {
      urlFilters.bedrooms = params.get('bedrooms')!.split(',').filter(Boolean);
      hasUrlFilters = true;
    }

    // Bathrooms
    if (params.get('bathrooms')) {
      urlFilters.bathrooms = params.get('bathrooms')!.split(',').filter(Boolean);
      hasUrlFilters = true;
    }

    // Price
    if (params.get('minPrice')) {
      urlFilters.minPrice = params.get('minPrice') || '';
      hasUrlFilters = true;
    }
    if (params.get('maxPrice')) {
      urlFilters.maxPrice = params.get('maxPrice') || '';
      hasUrlFilters = true;
    }

    // Dates
    if (params.get('checkIn')) {
      urlFilters.checkIn = params.get('checkIn') || '';
      hasUrlFilters = true;
    }
    if (params.get('checkOut')) {
      urlFilters.checkOut = params.get('checkOut') || '';
      hasUrlFilters = true;
    }

    // Guests
    if (params.get('guests')) {
      const guestsNum = parseInt(params.get('guests') || '0');
      if (!isNaN(guestsNum)) {
        urlFilters.guests = guestsNum;
        hasUrlFilters = true;
      }
    }

    // Badges (puede ser "chef-included,heated-pool")
    if (params.get('badges')) {
      urlFilters.selectedBadges = params.get('badges')!.split(',').filter(Boolean);
      hasUrlFilters = true;
    }

    // Sort
    if (params.get('sort')) {
      const sortValue = params.get('sort');
      if (sortValue === 'rank' || sortValue === 'price_low' || sortValue === 'price_high' || sortValue === 'bedrooms') {
        urlFilters.sortBy = sortValue;
        hasUrlFilters = true;
      }
    }

    // Si encontramos filtros en la URL, aplicarlos
    if (hasUrlFilters) {
      console.log('✅ Aplicando filtros desde URL:', urlFilters);
      setFilters(urlFilters);
      setAppliedFilters(urlFilters);

      // Limpiar URL después de leer (opcional)
      // window.history.replaceState({}, '', '/properties');
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ← Solo ejecutar UNA VEZ al montar

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

  // 🔥 Autofill: solo para completar la page 1 hasta 12 y cortar
  useEffect(() => {
    if (!hasAvailabilityFilter) return;
    if (loading) return;

    // ✅ SOLO page 1
    if (currentPage !== 1) return;

    // ✅ si ya se completó, nunca más
    if (page1Filled || autoFillDone) return;

    // ✅ si ya tenemos 12, cortar y marcar
    if (items.length >= ITEMS_PER_PAGE) {
      setPage1Filled(true);
      setAutoFillDone(true);
      return;
    }

    // ✅ esperar a tener session del primer fetch
    if (!availabilitySessionRef.current) return;

    // ✅ si hubo error, no insistir
    if (error) return;

    const t = setTimeout(() => {
      setAutoFillTick(x => x + 1);
    }, 350);

    return () => clearTimeout(t);
  }, [
    hasAvailabilityFilter,
    loading,
    items.length,
    error,
    currentPage,
    page1Filled,
    autoFillDone,
  ]);

  useEffect(() => {
    // Cuando cambia la página, resetear slots
    if (!loading && items.length > 0 && items.length < ITEMS_PER_PAGE) {
      // Si hay menos de 12 items, ajustar slots al número exacto
      setSlots(items.map(item => item));
    } else {
      // Caso normal: 12 slots (pueden ser null o items)
      setSlots(Array.from({ length: ITEMS_PER_PAGE }, () => null));
    }
  }, [currentPage]);

// 🔥 Reemplazo progresivo: slots → cards reales
// IMPORTANTE: uxPhase NO está en las dependencias — se lee via uxPhaseRef
// para evitar el ciclo: startSearchUx→'loader'→efecto corre→setea 'results'→loader desaparece
useEffect(() => {
  const phase = uxPhaseRef.current;

  // Si el loader está activo, no interferir — el fetch tiene el control
  // El fetch transicionará a 'results' cuando lleguen datos
  if (phase === 'loader' || phase === 'skeleton') return;

  // Sin items
  if (!items.length) {
    if (!loading && phase !== 'idle') {
      uxPhaseRef.current = 'results';
      setUxPhase('results');
      setProgress(100);
      setSlots([]);
    }
    return;
  }

  // Hay items → mostrar
  uxPhaseRef.current = 'results';
  setUxPhase('results');
  setProgress(100);

  const finalSlotCount = Math.min(items.length, ITEMS_PER_PAGE);
  const slotsNeeded = loading ? ITEMS_PER_PAGE : finalSlotCount;

  setSlots(prev => {
    if (prev.length === slotsNeeded) return prev;
    return Array.from({ length: slotsNeeded }, (_, i) => prev[i] ?? null);
  });

  const timers: number[] = [];
  for (let i = 0; i < finalSlotCount; i++) {
    timers.push(
      window.setTimeout(() => {
        setSlots(prev => {
          if (prev[i] != null) return prev;
          const next = [...prev];
          next[i] = items[i];
          return next;
        });
      }, i * 65)
    );
  }

  return () => timers.forEach(t => window.clearTimeout(t));
}, [items, loading]); // ← uxPhase NO está aquí, se lee via uxPhaseRef

  // ✅ Fetch principal - se ejecuta cuando cambian filtros O página
  useEffect(() => {
    if (authLoading) return;

    const controller = new AbortController();
    let phaseTimer: number | null = null;

    // 🔥 Usar ref en vez del state directamente
    const sessionToUse = availabilitySessionRef.current;

    // Capturar ANTES del async — si el efecto se re-ejecuta, el valor ya está fijo
    const isNewSearch = filterChangedRef.current || items.length === 0;
    console.log('🟡 [Fetch] useEffect run → filterChangedRef:', filterChangedRef.current, '| items.length:', items.length, '| isNewSearch:', isNewSearch, '| cursor:', availabilityCursor, '| dest:', appliedFilters.selectedDestination);
    if (isNewSearch) filterChangedRef.current = false; // consumir antes del async

    (async () => {

      setLoading(true);
      setError(null);

      // Activar loader en búsquedas nuevas (filtro cambiado), no en autoFill continuations
      if (isNewSearch) {
        uxCleanupRef.current?.();
        searchStartRef.current = Date.now();
        uxPhaseRef.current = 'loader';
        setUxPhase('loader');
        setProgress(10);

        const t1 = window.setTimeout(() => setProgress(30), 220);
        const t2 = window.setTimeout(() => setProgress(60), 520);
        const t3 = window.setTimeout(() => setProgress(90), 1100);

        uxCleanupRef.current = () => {
          window.clearTimeout(t1);
          window.clearTimeout(t2);
          window.clearTimeout(t3);
        };
      }

      const elapsed = Date.now() - searchStartRef.current;
      const wait = Math.max(0, MIN_LOADER_MS - elapsed);

      phaseTimer = window.setTimeout(() => {
        if (uxPhaseRef.current === 'loader') {
          uxPhaseRef.current = 'skeleton';
          setUxPhase('skeleton');
        }
      }, wait);

      try {
        const qs = new URLSearchParams();

        if (appliedFilters.query.trim().length >= 3) {
          qs.set('q', appliedFilters.query.trim());
        }

        // Support both single destination and comma-separated multi-destination
        if (appliedFilters.selectedDestination) {
          const dests = appliedFilters.selectedDestination.split('|').map(s => s.trim()).filter(Boolean);
          if (dests.length > 1) {
            qs.set('destinations', dests.join('|'));
          } else {
            qs.set('destination', appliedFilters.selectedDestination);
          }
        }

        // ✅ Bedrooms
        if (appliedFilters.bedrooms.length > 0) {
          qs.set('bedrooms', appliedFilters.bedrooms.join(','));
        }

        // ✅ Bathrooms - FALTABA APLICAR
        //if (appliedFilters.bathrooms.length > 0) {
          //qs.set('bathrooms', appliedFilters.bathrooms.join(','));
        //}

        // ✅ Price Range - CORREGIR VALIDACIÓN
        if (appliedFilters.minPrice && appliedFilters.minPrice.trim()) {
          const minVal = Number(appliedFilters.minPrice);
          if (!isNaN(minVal) && minVal > 0) {
            qs.set('minPrice', String(minVal));
          }
        }

        if (appliedFilters.maxPrice && appliedFilters.maxPrice.trim()) {
          const maxVal = Number(appliedFilters.maxPrice);
          if (!isNaN(maxVal) && maxVal > 0) {
            qs.set('maxPrice', String(maxVal));
          }
        }

        // Resto del código continúa igual...
        if (appliedFilters.selectedBadges.length) {
          qs.set('badges', appliedFilters.selectedBadges.join(','));
        }

        if (appliedFilters.sortBy) {
          qs.set('sort', appliedFilters.sortBy);
        }

        if (appliedFilters.guests && appliedFilters.guests > 0) {
          qs.set('guests', String(appliedFilters.guests));
        }

        // Agregar console.log para debug
        console.log('🔍 Query params being sent:', {
          bedrooms: appliedFilters.bedrooms,
          bathrooms: appliedFilters.bathrooms,
          minPrice: appliedFilters.minPrice,
          maxPrice: appliedFilters.maxPrice,
          queryString: qs.toString()
        });

        qs.set('limit', String(ITEMS_PER_PAGE));

        // 🔥 CORRECCIÓN IMPORTANTE: Usar cursor real en modo availability
        if (hasAvailabilityFilter) {
          // Usar el cursor real (no calcular basado en página)
          const pageCursor = (currentPage - 1) * ITEMS_PER_PAGE;

          // ✅ si estamos rellenando página 1 con autofill, usamos availabilityCursor real
          const cursorToUse =
            hasAvailabilityFilter && currentPage === 1 && availabilityCursor > 0
              ? availabilityCursor
              : pageCursor;

          qs.set('cursor', String(cursorToUse));


          if (appliedFilters.checkIn) qs.set('checkIn', appliedFilters.checkIn);
          if (appliedFilters.checkOut) qs.set('checkOut', appliedFilters.checkOut);

          if (sessionToUse) {
            qs.set('availabilitySession', sessionToUse);
          }
        } else {
          // Modo normal: usar page param
          qs.set('page', String(currentPage));
        }

        const endpoint = user ? '/listings' : '/public/listings';
        const apiToUse = user ? api : publicApi;

        console.log(`📡 Fetching from: ${endpoint}?${qs.toString()}`);

        const data = await apiToUse<ListingsResponse>(`${endpoint}?${qs.toString()}`, {
          signal: controller.signal
        });

        if (!controller.signal.aborted) {
          const normalized: Listing[] = (data.results || []).map((item: any) => {
            const images = Array.isArray(item.images_json) ? item.images_json : [];
            const first = images[0];

            const priceUSD =
              item.priceUSD == null || item.priceUSD === ''
                ? null
                : Number(item.priceUSD);

            const rawName = item.name || '';
            const cleanedName = normalizePropertyName(rawName);
            
            return {
              ...item,
              name: cleanedName,   
              priceUSD: Number.isFinite(priceUSD as any) ? priceUSD : null,
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
          console.log(
            "priceUSD first 6:",
            normalized.slice(0, 6).map(x => x.priceUSD)
          );
          const pageCursor = (currentPage - 1) * ITEMS_PER_PAGE;

          const cursorToUse =
            hasAvailabilityFilter && currentPage === 1 && availabilityCursor > 0
              ? availabilityCursor
              : pageCursor;

          // estamos trayendo "chunks extra" solo para completar page 1
          const isAutoFillChunk =
            hasAvailabilityFilter &&
            currentPage === 1 &&
            cursorToUse > 0;

          setItems(prev => {
            if (!isAutoFillChunk) return normalized;

            // ✅ append pero CAP a 12
            const merged = [...prev, ...normalized];
            const capped = merged.slice(0, ITEMS_PER_PAGE);

            // ✅ cuando llegó a 12, marcamos y frenamos autofill
            if (capped.length >= ITEMS_PER_PAGE) {
              setPage1Filled(true);
              setAutoFillDone(true);
            }

            return capped;
          });


          // ✅ CORRECCIÓN: Manejar diferente paginación según el modo
          if (hasAvailabilityFilter && data.availabilityApplied) {
            // Modo availability: usar lógica basada en cursor
            if (data.totalAvailable !== undefined) {
              setTotal(data.totalAvailable);
              const calculatedPages = Math.ceil(data.totalAvailable / ITEMS_PER_PAGE);
              setTotalPages(calculatedPages || 1);
            } else {
              // Estimación basada en returned y exhausted
              const hasMoreData = !data.exhausted || (data.returned === ITEMS_PER_PAGE);
              setTotalPages(currentPage + (hasMoreData ? 1 : 0));
              setTotal(data.returned || normalized.length);
            }

            // 🔥 ACTUALIZAR CURSOR SI HAY MÁS DATOS
            if (typeof data.nextCursor === 'number') {
              // si llegó data y todavía no estamos completos, avanzá cursor
              if (hasAvailabilityFilter && currentPage === 1 && !data.exhausted) {
                setAvailabilityCursor(data.nextCursor);
              }
            }

            // Guardar session
            if (data.availabilitySession && !sessionToUse) {
              setAvailabilitySession(data.availabilitySession);
            }

            if (hasAvailabilityFilter && currentPage === 1) {
              const nothingElse = (data.returned === 0) || data.exhausted === true;
              if (nothingElse) setAutoFillDone(true);
            }

          } else {
            // Modo normal
            setTotal(data.total || 0);
            setTotalPages(data.totalPages || Math.ceil((data.total || 0) / ITEMS_PER_PAGE));
          }

          setRetryCount(0);

          // Transicionar explícitamente loader/skeleton → results cuando llegan datos
          if (['loader','skeleton','idle'].includes(uxPhaseRef.current)) {
            uxPhaseRef.current = 'results';
            setUxPhase('results');
          }
          setProgress(100);

          console.log(`✅ Page ${currentPage} loaded: ${normalized.length} items, total items: ${items.length + normalized.length}`);
          console.log(`📊 Availability mode: ${hasAvailabilityFilter}, session: ${data.availabilitySession?.slice(0, 12)}...`);
          console.log(`📝 Partial: ${data.partial}, HasMore: ${data.hasMore}, NextCursor: ${data.nextCursor}`);
        }
      } catch (err: any) {
        if (!controller.signal.aborted) {
          if (!user && err instanceof Error && err.message?.includes('401')) {
            console.log('Expected 401 for public endpoint - ignoring');
            setItems([]);
            setTotal(0);
            setTotalPages(1);
          } else {
            const errorMsg = err.message || 'Unknown error';
            setError(
              errorMsg.includes('429') || errorMsg.includes('503')
                ? 'Too many requests. Waiting 60 seconds...'
                : errorMsg.includes('401')
                  ? 'Session expired. Please log in.'
                  : errorMsg.includes('expired') || errorMsg.includes('filters changed')
                    ? 'Search session expired. Please refresh your search.'
                    : 'Server error. Please try again.'
            );

            if (errorMsg.includes('429') || errorMsg.includes('503')) {
              setTimeout(() => {
                setError(null);
                setRetryCount(prev => prev + 1);
              }, 60000);
            }

            if (errorMsg.includes('expired') || errorMsg.includes('filters changed')) {
              // Resetear availability session
              setAvailabilitySession(null);
              setCurrentPage(1);
              setAvailabilityCursor(0);
              setPage1Filled(false);
              setAutoFillDone(false);
            }

            if (!errorMsg.includes('429') && !errorMsg.includes('503') && !errorMsg.includes('401')) {
              setRetryCount(prev => prev + 1);
            }
          }
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
        setLoading(false);
        setProgress(100);

      }
    })();

    return () => {
      if (phaseTimer) window.clearTimeout(phaseTimer);
      controller.abort();
    };
  }, [
    authLoading,
    user,
    appliedFilters,
    currentPage,
    retryCount,
    hasAvailabilityFilter,
    availabilityCursor,
    autoFillTick,
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

  const goToDetail = useCallback((property: Listing) => {
    if (!user) {
      openAuthModal();
      return;
    }
    navigate(`/property/${property.id}`);
  }, [navigate, user, openAuthModal]);

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

  // Mostrar 12 skeletons mientras no haya items reales:
  // - durante 'loader' siempre
  // Skeletons durante carga inicial (idle), loader, skeleton, y gap de React batching
  const EMPTY_SLOTS = Array.from({ length: 12 }, (): null => null);
  // Durante loader/skeleton: siempre skeletons (cubre items viejos en memoria)
  const showSkeletons = uxPhase === 'loader' || uxPhase === 'skeleton' || (uxPhase === 'idle' && items.length === 0);
  // slots se usa para el revelado progresivo; si todos son null aún, usar EMPTY_SLOTS
  const slotsAreEmpty = slots.length > 0 && slots.every(s => s === null);
  const renderList = (showSkeletons || slotsAreEmpty) ? EMPTY_SLOTS : slots;

  const showNextButton = hasAvailabilityFilter
    ? items.length === ITEMS_PER_PAGE || currentPage < totalPages
    : currentPage < totalPages;

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
          //bathrooms={filters.bathrooms}
          //setBathrooms={(bathrooms) => setFilters(prev => ({ ...prev, bathrooms }))}
          minPrice={filters.minPrice}
          setMinPrice={(minPrice) => setFilters(prev => ({ ...prev, minPrice }))}
          maxPrice={filters.maxPrice}
          setMaxPrice={(maxPrice) => setFilters(prev => ({ ...prev, maxPrice }))}
          onClearAllFilters={handleClearAllFilters}
          destinations={DESTINATIONS}
          selectedDestination={filters.selectedDestination}
          onSelectDestination={handleDestinationChange}
          cartCount={cartCount}
          onCartClick={openCart}
          guests={filters.guests}
          setGuests={(guests) => setFilters(prev => ({ ...prev, guests }))}
          onApplyFilters={handleApplyFilters}
          onEditQuote={handleEditQuote}
        />

        <main className="w-full px-4 md:px-8">
          {/* Shimmer styles */}
          <style>{`
            @keyframes shimmer {
              0%   { transform: translateX(-100%); }
              100% { transform: translateX(100%); }
            }
            @media (prefers-reduced-motion: reduce) {
              .skeleton-shimmer::after { animation: none !important; }
            }
            .skeleton-shimmer {
              position: relative;
              overflow: hidden;
              background-color: #e8e8e8 !important;
            }
            .skeleton-shimmer::after {
              content: '';
              position: absolute;
              inset: 0;
              background: linear-gradient(
                90deg,
                transparent 0%,
                rgba(255,255,255,0.6) 50%,
                transparent 100%
              );
              animation: shimmer 1.5s ease-in-out infinite;
            }
          `}</style>

          {/* SearchLoader como overlay encima del grid — no oculta el skeleton */}
          {uxPhase === 'loader' && (<SearchLoader progress={progress} />)}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" style={{ paddingTop: panelHeight + 32 }}>
            {renderList.map((item, idx) => {
              if (!item) {
                return <ListingCardSkeleton key={`sk-${idx}`} />;
              }


              return (
                <PropertyCard
                  key={`${item.id}-${idx}`}
                  item={item}
                  cardIndex={idx}
                  currentIndex={imageIndices[item.id] || 0}
                  onImagePrev={handlePrevImage}
                  onImageNext={handleNextImage}
                  onGoToDetail={goToDetail}
                  onToggleCart={toggleItem}
                  onOpenMessage={openMessageModalFor}
                  isInCart={isInCart(item.id)}
                  formatMoney={formatMoney}
                  formatRank={formatRank}
                />
              );
            })}
          </div>

          {/* Empty state — búsqueda terminó sin resultados, solo ExpansionButton */}
          {uxPhase === 'results' && items.length === 0 && (
            <div className="flex flex-col items-center justify-center" style={{ paddingTop: panelHeight + 32 }}>
              <ExpansionButton
                resultsCount={0}
                onClick={() => setShowExpansionModal(true)}
              />
            </div>
          )}

          {/* Botón de expansión y paginación — solo cuando hay resultados reales */}
          {uxPhase === 'results' && items.length > 0 && <>
            <ExpansionButton
              resultsCount={total}
              onClick={() => {
                setShowExpansionModal(true);

                // Tracking GTM
                if (window.dataLayer) {
                  window.dataLayer.push({
                    event: 'expansion_button_clicked',
                    results_count: total,
                    location: appliedFilters.selectedDestination || appliedFilters.query,
                  });
                }
              }}
            />

            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              hasAvailabilityFilter={hasAvailabilityFilter}
              showNextButton={showNextButton}
              onPageChange={(newPage: number) => {
                filterChangedRef.current = true;
                startSearchUx();
                setItems([]);
                setSlots(Array.from({ length: ITEMS_PER_PAGE }, () => null));
                setCurrentPage(newPage);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </>}
        </main>

        <CartSidebar />
        <CartModal isOpen={isCartModalOpen} onClose={closeCartModal} defaultCheckIn={appliedFilters.checkIn}
          defaultCheckOut={appliedFilters.checkOut}
          defaultGuests={appliedFilters.guests} />

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

        {showExpansionModal && (
          <ExpansionModal
            isOpen={showExpansionModal}
            onClose={() => setShowExpansionModal(false)}
            currentFilters={appliedFilters}
            currentResultsCount={total}
          />
        )}

        <NewQuoteModal onBrowseAll={handleClearAllFilters} />
      </div>
    </>
  );
}