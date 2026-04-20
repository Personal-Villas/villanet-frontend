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
import AddToQuoteToast from '../components/AddToQuoteToast';
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
import { useCurrency, toUSD, type SupportedCurrency } from '../hooks/useCurrency';


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

const ITEMS_PER_PAGE_DEFAULT = 12;
const ITEMS_PER_PAGE_OPTIONS = [12, 24, 48, 96] as const;
// Batch size for infinite scroll — backend receives this as `limit` per request.
// NOT 999: we page the backend the same as classic mode, just load next page automatically.
const INFINITE_SCROLL_BATCH = 48;
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
  "Barbados",
  "Zihuatanejo, Mexico",
  "Costa Rica",
  "Greece"
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

  // ── Multi-currency display ──────────────────────────────────────────────
  // Read once at mount; advisor signup already writes this key via useAdvisorSignup.
  const savedCurrency = (localStorage.getItem('villanet_preferred_currency') as SupportedCurrency) || 'USD';
  const {
    currency,
    setCurrency,
    format: formatMoneyCurrency,
    rateNote,
    isUSD,
  } = useCurrency(savedCurrency);

  // Persist currency changes (from the filter panel) back to localStorage so
  // the selection survives page reloads and is picked up by AdvisorProfile.
  const handleCurrencyChange = useCallback((c: SupportedCurrency) => {
    setCurrency(c);
    localStorage.setItem('villanet_preferred_currency', c);
  }, [setCurrency]);

  // Navigate back to quote wizard
  const handleEditQuote = useCallback(() => {
    navigate('/properties?quoteFlow=true');
  }, [navigate]);

  // ── Auto-open NewQuoteModal ───────────────────────────────────────────────
  // El modal solo se abre cuando la URL contiene explícitamente quoteFlow=true.
  // No se inyecta quoteFlow=true automáticamente al montar la página,
  // para que usuarios que lleguen desde el logo o navegación normal
  // no vean el modal de cotización sin haberlo pedido. (CA2)

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
    const maxTotalBudget = searchParams.get('maxTotalBudget') || '';

    const quoteFilters = {
      query: '',
      selectedDestination: resolvedDestination,
      bedrooms: bedroomsParam ? bedroomsParam.split(',').filter(Boolean) : [] as string[],
      bathrooms: [] as string[],
      minPrice: '',
      maxPrice,
      maxTotalBudget,
      checkIn,
      checkOut,
      selectedBadges: [] as string[],
      guests: guestsParam ? parseInt(guestsParam, 10) : 0,
      sortBy: 'rank' as const,
    };

    filterChangedRef.current = true;
    setFilters(quoteFilters);
    setAppliedFilters(quoteFilters);
    if (maxTotalBudget) setIsQuoteMode(true);
    setCurrentPage(1);
    setAvailabilityCursor(0);
    setItems([]);
    setAvailabilitySession(null);
    setPage1Filled(false);
    setAutoFillDone(false);

    // Limpiar params del wizard de la URL
    const cleanParams = new URLSearchParams(searchParams);
    ['fromQuote', 'destination', 'destinations', 'bedrooms', 'guests',
      'checkIn', 'checkOut', 'maxPrice', 'maxTotalBudget', 'flexibleRange'].forEach(k => cleanParams.delete(k));
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
    maxTotalBudget: '',  // budget total de estadía (desde wizard)
    checkIn: '',
    checkOut: '',
    selectedBadges: [] as string[],
    guests: 0,
    sortBy: 'rank' as 'rank' | 'price_low' | 'price_high' | 'bedrooms',
  });

  const [appliedFilters, setAppliedFilters] = useState(filters);

  // isQuoteMode: true cuando el usuario llegó desde el wizard con un quote completado.
  // Se mantiene aunque el usuario borre el valor de maxTotalBudget en el input,
  // y solo se desactiva al hacer Clear All o navegar sin quote.
  const [isQuoteMode, setIsQuoteMode] = useState(false);

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

  // 🔥 "slots" para render fijo. null = skeleton
  const [slots, setSlots] = useState<(Listing | null)[]>(() => {
    // Match the initial slot count to the actual itemsPerPage so we never show
    // wrong-sized skeleton grids on first render.
    try {
      const stored = localStorage.getItem('villanet_items_per_page');
      if (stored !== null) {
        const parsed = parseInt(stored, 10);
        const count = parsed === 0 ? ITEMS_PER_PAGE_DEFAULT : (parsed || ITEMS_PER_PAGE_DEFAULT);
        return Array.from({ length: count }, () => null);
      }
    } catch { /* ignore */ }
    return Array.from({ length: ITEMS_PER_PAGE_DEFAULT }, () => null);
  });

  //Estado para ExpansionModal
  const [showExpansionModal, setShowExpansionModal] = useState(false);

  // helper: arranca loader intencional + progreso simulado
  const uxCleanupRef = useRef<null | (() => void)>(null);
  // Señal para mostrar skeletons inmediatamente al cambiar filtros
  const filterChangedRef = useRef<boolean>(false);

  // paddingTop dinámico para el grid: mide la altura del panel de filtros
  // expandido usando un ref real (sin selectores CSS frágiles).
  const [panelHeight, setPanelHeight] = useState(0);
  const filterPanelRef = useRef<HTMLDivElement | null>(null);
  const filterPanelRoRef = useRef<ResizeObserver | null>(null);

  const handlePanelRef = useCallback((el: HTMLDivElement | null) => {
    // Desconectar observer anterior si el elemento cambia
    filterPanelRoRef.current?.disconnect();
    filterPanelRef.current = el;

    if (!el) {
      setPanelHeight(0);
      return;
    }

    const measure = () => {
      // Si el panel está oculto (opacity-0 + pointer-events-none) su altura
      // visual es 0, aunque scrollHeight tenga contenido.
      const isHidden = el.classList.contains('opacity-0');
      setPanelHeight(isHidden ? 0 : el.scrollHeight);
    };

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    filterPanelRoRef.current = ro;

    // También observar cambios de clase (collapse toggle) con MutationObserver
    const mo = new MutationObserver(measure);
    mo.observe(el, { attributes: true, attributeFilter: ['class'] });

    measure(); // medición inicial

    // Guardamos el MutationObserver en el mismo cleanup
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => { ro.disconnect(); mo.disconnect(); };
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

  // Items per page: 0 = "All" (scroll infinito)
  const [itemsPerPage, setItemsPerPage] = useState<number>(() => {
    // Read persisted value immediately so the first fetch uses the correct limit,
    // avoiding the spurious limit=12 request when the user had "All" selected.
    try {
      const stored = localStorage.getItem('villanet_items_per_page');
      if (stored !== null) {
        const parsed = parseInt(stored, 10);
        if (ITEMS_PER_PAGE_OPTIONS.includes(parsed as typeof ITEMS_PER_PAGE_OPTIONS[number]) || parsed === 0) {
          return parsed;
        }
      }
    } catch { /* ignore */ }
    return ITEMS_PER_PAGE_DEFAULT;
  });

  // effectiveLimit: cuántos items muestra la grilla a la vez.
  // En modo All usamos INFINITE_SCROLL_BATCH — NO cambia el comportamiento del
  // backend, simplemente define el tamaño de lote por request de scroll infinito.
  const effectiveLimit = itemsPerPage === 0 ? INFINITE_SCROLL_BATCH : itemsPerPage;

  // ── Scroll infinito (modo "All") ────────────────────────────────────────────
  // isInfiniteMode se deriva del state, NO de un ref, para que el JSX y los
  // efectos que lo leen siempre vean el valor del render actual.
  const isInfiniteMode = itemsPerPage === 0;

  // infiniteScrollPage: página que debe pedir el fetch en modo infinito.
  // Cuando el sentinel entra en viewport, se incrementa → dispara el fetch.
  const [infiniteScrollPage, setInfiniteScrollPage] = useState(1);

  // Ref del sentinel div para el IntersectionObserver
  const infiniteScrollRef = useRef<HTMLDivElement | null>(null);

  // Tracks whether the backend has more pages to load in infinite mode.
  // Initialized to true so the first fetch always runs; set to false when
  // the backend signals no more results (hasMore: false or returned < limit).
  const [hasMorePages, setHasMorePages] = useState(true);

  // ── Scroll infinito: refs estables ──────────────────────────────────────────
  // El sentinel div vive dentro de {uxPhase==='results' && items.length>0}, por
  // lo que NO existe en el DOM cuando el componente monta. Un useEffect normal
  // con infiniteScrollRef.current === null nunca conecta el observer.
  //
  // Solución: callback ref en el sentinel. React llama al callback cada vez que
  // el nodo entra o sale del DOM, lo que nos permite conectar/desconectar el
  // IntersectionObserver en el momento exacto en que el div existe.
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Sincronizar refs con state (sin causar re-renders en el observer)
  useEffect(() => { loadingRef.current = loading; }, [loading]);
  useEffect(() => { hasMoreRef.current = hasMorePages; }, [hasMorePages]);

  // Cuando se sale del modo All (o se cambia de filtros), resetear infiniteScrollPage
  useEffect(() => {
    if (isInfiniteMode) {
      setInfiniteScrollPage(1);
      setHasMorePages(true);
      hasMoreRef.current = true;
    }
  }, [isInfiniteMode]);

  // Callback ref: se llama con el nodo cuando el sentinel monta, con null cuando desmonta.
  // Esto resuelve el problema raíz: el observer se conecta exactamente cuando el div existe.
  const sentinelCallbackRef = useCallback((node: HTMLDivElement | null) => {
    // Desconectar observer anterior si lo hay
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    // Guardar el nodo en infiniteScrollRef por si algún código lo necesita
    infiniteScrollRef.current = node;

    if (!node || !isInfiniteMode) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingRef.current && hasMoreRef.current) {
          setInfiniteScrollPage(prev => prev + 1);
        }
      },
      { rootMargin: '300px' }
    );

    observer.observe(node);
    observerRef.current = observer;
  // isInfiniteMode en deps: si cambia, el sentinel se desmonta/remonta y el
  // callback se vuelve a llamar automáticamente — no necesitamos reconectar manualmente.
  }, [isInfiniteMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // Efecto "post-fetch": cuando loading pasa true→false y el sentinel ya está en
  // viewport (el observer no re-dispara si el elemento nunca salió de la vista),
  // verificar si hay que cargar la siguiente página.
  useEffect(() => {
    if (loading) return;
    if (!isInfiniteMode || !hasMorePages) return;

    const sentinel = infiniteScrollRef.current;
    if (!sentinel) return;

    // Chequeo manual de visibilidad: getBoundingClientRect es síncrono y fiable
    const rect = sentinel.getBoundingClientRect();
    const isVisible = rect.top <= window.innerHeight + 300; // mismo margen que rootMargin

    if (isVisible) {
      const t = window.setTimeout(() => {
        if (!loadingRef.current && hasMoreRef.current) {
          setInfiniteScrollPage(prev => prev + 1);
        }
      }, 80);
      return () => window.clearTimeout(t);
    }
  }, [loading, isInfiniteMode, hasMorePages]);

  const handleItemsPerPageChange = useCallback((value: number) => {
    filterChangedRef.current = true;
    startSearchUx();
    setItemsPerPage(value);
    try { localStorage.setItem('villanet_items_per_page', String(value)); } catch { /* ignore */ }
    setCurrentPage(1);
    setItems([]);
    setAvailabilityCursor(0);
    setAvailabilitySession(null);
    setPage1Filled(false);
    setAutoFillDone(false);
    // Resetear siempre la página del scroll infinito al cambiar el selector
    setInfiniteScrollPage(1);
    setHasMorePages(true);
    const slotCount = value === 0 ? ITEMS_PER_PAGE_DEFAULT : value;
    setSlots(Array.from({ length: slotCount }, () => null));
  }, [startSearchUx]);

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
      maxTotalBudget: appliedFilters.maxTotalBudget,
      destination: appliedFilters.selectedDestination,
      badges: appliedFilters.selectedBadges,
      sort: appliedFilters.sortBy,
    };

    const hasActiveFilters = Object.values(filters).some(
      value => value !== '' && value !== null && value !== undefined && value !== 0 &&
        (Array.isArray(value) ? value.length > 0 : true)
    );

    if (hasActiveFilters) {
      console.log('💾 Guardando filtros en localStorage:', filters);
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

  const handleApplyFilters = useCallback((overrides?: Record<string, unknown>) => {
    filterChangedRef.current = true;
    startSearchUx();

    // Si vienen overrides (ej: maxTotalBudget desde SecondSearchBar), se aplican
    // directamente sin depender del setState previo — evita stale closure.
    setFilters(latestFilters => {
      const filtersToApply = overrides ? { ...latestFilters, ...overrides } : latestFilters;
      setAppliedFilters(filtersToApply);
      setQuoteDates(filtersToApply.checkIn, filtersToApply.checkOut);
      return filtersToApply;
    });

    setCurrentPage(1);
    setAvailabilityCursor(0);
    setItems([]);
    setAvailabilitySession(null);
    setPage1Filled(false);
    setAutoFillDone(false);
    setInfiniteScrollPage(1);
    setHasMorePages(true);
    setSlots(Array.from({ length: effectiveLimit }, () => null));
  }, [startSearchUx, setQuoteDates, effectiveLimit]);

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
      maxTotalBudget: '',
      checkIn: '',
      checkOut: '',
      selectedBadges: [] as string[],
      guests: 0,
      sortBy: 'rank' as const,
    };

    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
    setIsQuoteMode(false);
    setCurrentPage(1);
    setError(null);

    setAvailabilityCursor(0);
    setItems([]);
    setAvailabilitySession(null);
    setPage1Filled(false);
    setAutoFillDone(false);
    setInfiniteScrollPage(1);
    setHasMorePages(true);
    setQuoteDates('', '');

    setSlots(Array.from({ length: effectiveLimit }, () => null));
  }, [startSearchUx, setQuoteDates, effectiveLimit]);

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
    setInfiniteScrollPage(1);
    setHasMorePages(true);
    setSlots(Array.from({ length: effectiveLimit }, () => null));
  }, [startSearchUx, effectiveLimit]);

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
    maxTotalBudget: '',  // budget total de estadía (desde wizard)
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
    setInfiniteScrollPage(1);
    setSlots(Array.from({ length: effectiveLimit }, () => null));

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
    if (params.get('maxTotalBudget')) {
      urlFilters.maxTotalBudget = params.get('maxTotalBudget') || '';
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

  // 🔥 Autofill: solo para completar la page 1 hasta el límite y cortar
  useEffect(() => {
    if (!hasAvailabilityFilter) return;
    if (loading) return;

    // ✅ SOLO page 1
    if (currentPage !== 1) return;

    // ✅ si ya se completó, nunca más
    if (page1Filled || autoFillDone) return;

    // ✅ si ya tenemos suficientes, cortar y marcar
    if (items.length >= effectiveLimit) {
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
    effectiveLimit,
  ]);

  useEffect(() => {
    // Cuando cambia la página, resetear slots
    if (!loading && items.length > 0 && items.length < effectiveLimit) {
      // Si hay menos items que el límite, ajustar slots al número exacto
      setSlots(items.map(item => item));
    } else {
      // Caso normal: slots vacíos del tamaño del límite
      setSlots(Array.from({ length: effectiveLimit }, () => null));
    }
  }, [currentPage]); // eslint-disable-line react-hooks/exhaustive-deps

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

    // En modo scroll infinito: mostrar TODOS los items acumulados, sin capar a effectiveLimit.
    // effectiveLimit es el tamaño de LOTE por request (48), no el total a mostrar.
    // En modo clásico: respetar el límite de página.
    const isInfiniteScrollMode = itemsPerPage === 0;
    const finalSlotCount = isInfiniteScrollMode ? items.length : Math.min(items.length, effectiveLimit);
    const slotsNeeded = loading
      ? (isInfiniteScrollMode ? items.length : effectiveLimit)
      : finalSlotCount;

    // En modo infinito, solo animar los items NUEVOS del último lote.
    // Animar todos los items acumulados (ej: 1200) con timers de 65ms cada uno
    // bloquearía el render por minutos.
    const prevCount = (isInfiniteScrollMode && items.length > effectiveLimit)
      ? items.length - INFINITE_SCROLL_BATCH
      : 0;

    setSlots(prev => {
      // Si ya tenemos todos los slots rellenos y el tamaño coincide, no tocar
      if (prev.length === slotsNeeded && prev.every(s => s !== null)) return prev;
      // Preservar items ya renderizados (prevCount) y marcar los nuevos como null
      return Array.from({ length: slotsNeeded }, (_, i) =>
        i < prevCount ? items[i] : (prev[i] ?? null)
      );
    });

    const timers: number[] = [];
    for (let i = prevCount; i < finalSlotCount; i++) {
      const delay = (i - prevCount) * 30; // 30ms por item nuevo — más rápido que el modo clásico
      timers.push(
        window.setTimeout(() => {
          setSlots(prev => {
            if (prev[i] != null) return prev;
            const next = [...prev];
            next[i] = items[i];
            return next;
          });
        }, delay)
      );
    }

    return () => timers.forEach(t => window.clearTimeout(t));
  }, [items, loading, itemsPerPage, effectiveLimit]); // ← uxPhase NO está aquí, se lee via uxPhaseRef

  // ✅ Fetch principal - se ejecuta cuando cambian filtros O página
  useEffect(() => {
    if (authLoading) return;

    const controller = new AbortController();
    let phaseTimer: number | null = null;

    // 🔥 Capturar valores del closure al momento de ejecutar el efecto.
    // Esto es crítico: NO leer de refs que se sincronizan asincrónicamente
    // (como effectiveLimitRef) — usar los valores del render actual directamente.
    const sessionToUse = availabilitySessionRef.current;

    // FIX: Calcular limitToUse directamente desde itemsPerPage (valor del closure),
    // no desde effectiveLimitRef que puede estar stale en el primer render tras el cambio.
    const limitToUse = itemsPerPage === 0 ? INFINITE_SCROLL_BATCH : itemsPerPage;

    // FIX: Capturar isInfiniteMode del closure para evitar stale dentro del async.
    const isInfiniteScrollMode = itemsPerPage === 0;

    // Capturar ANTES del async — si el efecto se re-ejecuta, el valor ya está fijo
    const isNewSearch = filterChangedRef.current || items.length === 0;
    console.log('🟡 [Fetch] useEffect run → filterChangedRef:', filterChangedRef.current, '| items.length:', items.length, '| isNewSearch:', isNewSearch, '| cursor:', availabilityCursor, '| dest:', appliedFilters.selectedDestination, '| isInfiniteMode:', isInfiniteScrollMode, '| infiniteScrollPage:', infiniteScrollPage);
    if (isNewSearch) filterChangedRef.current = false; // consumir antes del async

    (async () => {

      setLoading(true);
      setError(null);

      // Activar loader en búsquedas nuevas (filtro cambiado), no en autoFill ni scroll infinito
      if (isNewSearch && infiniteScrollPage === 1) {
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

        // ✅ Price Range
        if (appliedFilters.minPrice && appliedFilters.minPrice.trim()) {
          const minVal = Number(appliedFilters.minPrice);
          if (!isNaN(minVal) && minVal > 0) {
            qs.set('minPrice', String(isUSD ? minVal : toUSD(minVal, currency)));
          }
        }

        if (appliedFilters.maxTotalBudget && appliedFilters.maxTotalBudget.trim()) {
          const totalVal = Number(appliedFilters.maxTotalBudget);
          if (!isNaN(totalVal) && totalVal > 0) {
            qs.set('maxTotalBudget', String(isUSD ? totalVal : toUSD(totalVal, currency)));
          }
        } else if (appliedFilters.maxPrice && appliedFilters.maxPrice.trim()) {
          const maxVal = Number(appliedFilters.maxPrice);
          if (!isNaN(maxVal) && maxVal > 0) {
            qs.set('maxPrice', String(isUSD ? maxVal : toUSD(maxVal, currency)));
          }
        }

        if (appliedFilters.selectedBadges.length) {
          qs.set('badges', appliedFilters.selectedBadges.join(','));
        }

        if (appliedFilters.sortBy) {
          qs.set('sort', appliedFilters.sortBy);
        }

        if (appliedFilters.guests && appliedFilters.guests > 0) {
          qs.set('guests', String(appliedFilters.guests));
        }

        console.log('🔍 Query params being sent:', {
          bedrooms: appliedFilters.bedrooms,
          bathrooms: appliedFilters.bathrooms,
          minPrice: appliedFilters.minPrice,
          maxPrice: appliedFilters.maxPrice,
          queryString: qs.toString()
        });

        // FIX: Usar limitToUse (capturado del closure) en lugar de effectiveLimitRef.current
        // que puede estar stale si el ref sync useEffect no corrió aún.
        qs.set('limit', String(limitToUse));

        // 🔥 CORRECCIÓN IMPORTANTE: Usar cursor real en modo availability
        if (hasAvailabilityFilter) {
          // Usar el cursor real (no calcular basado en página)
          const pageCursor = (currentPage - 1) * limitToUse;

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
          // Modo normal: usar page param.
          // En modo scroll infinito la página la maneja infiniteScrollPage (no currentPage).
          const pageToRequest = isInfiniteScrollMode ? infiniteScrollPage : currentPage;
          qs.set('page', String(pageToRequest));
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

          const pageCursor = (currentPage - 1) * limitToUse;

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
            // FIX: Modo scroll infinito — siempre acumular cuando no es la primera página.
            // isInfiniteScrollMode está capturado del closure, nunca stale.
            if (isInfiniteScrollMode && infiniteScrollPage > 1) {
              return [...prev, ...normalized];
            }

            if (!isAutoFillChunk) return normalized;

            // ✅ append pero CAP al límite activo
            const merged = [...prev, ...normalized];
            const capped = merged.slice(0, limitToUse);

            // ✅ cuando llegó al límite, marcamos y frenamos autofill
            if (capped.length >= limitToUse) {
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
              const calculatedPages = Math.ceil(data.totalAvailable / limitToUse);
              setTotalPages(calculatedPages || 1);
            } else {
              // Estimación basada en returned y exhausted
              const hasMoreData = !data.exhausted || (data.returned === limitToUse);
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
            setTotalPages(data.totalPages || Math.ceil((data.total || 0) / limitToUse));

            // FIX: Actualizar hasMorePages en modo scroll infinito.
            // El ciclo infinito ocurría porque nunca se frenaba el observer.
            // Frenamos cuando: el backend dice hasMore=false, o devolvió menos
            // ítems que el límite pedido (última página parcial).
            if (isInfiniteScrollMode) {
              const backendSaysNoMore = data.hasMore === false;
              const receivedLessThanRequested = normalized.length < limitToUse;
              if (backendSaysNoMore || receivedLessThanRequested) {
                setHasMorePages(false);
              }
            }
          }

          setRetryCount(0);

          // Transicionar explícitamente loader/skeleton → results cuando llegan datos
          if (['loader', 'skeleton', 'idle'].includes(uxPhaseRef.current)) {
            uxPhaseRef.current = 'results';
            setUxPhase('results');
          }
          setProgress(100);

          console.log(`✅ Page ${currentPage} loaded: ${normalized.length} items | infiniteScrollPage: ${infiniteScrollPage} | isInfiniteScrollMode: ${isInfiniteScrollMode}`);
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
        if (!controller.signal.aborted) {
          setLoading(false);
          setProgress(100);
          // FIX: Seguro anti-loader-colgado — si el fetch termina (éxito o error)
          // y la UX todavía está en loader/skeleton, forzar transición a results.
          if (uxPhaseRef.current === 'loader' || uxPhaseRef.current === 'skeleton') {
            uxPhaseRef.current = 'results';
            setUxPhase('results');
          }
        }
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
    itemsPerPage,        // dispara el fetch cuando cambia el selector (incluido → 0)
    infiniteScrollPage,  // dispara el fetch cuando el sentinel llega al viewport
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

  // formatMoney viene del hook useCurrency como `format`
  const formatMoney = formatMoneyCurrency;

  const formatRank = (rank: number | string | null | undefined) => {
    if (rank == null) return "—";
    return rank.toString();
  };

  // Número de noches según las fechas aplicadas (0 si no hay fechas).
  // Se parsea con hora fija en UTC para evitar desfase por timezone del browser.
  const nightCount = (() => {
    if (!appliedFilters.checkIn || !appliedFilters.checkOut) return 0;
    const toUtcMidnight = (ymd: string) => {
      const [y, m, d] = ymd.split('-').map(Number);
      return Date.UTC(y, m - 1, d);
    };
    const nights = Math.round(
      (toUtcMidnight(appliedFilters.checkOut) - toUtcMidnight(appliedFilters.checkIn))
      / (1000 * 60 * 60 * 24)
    );
    return nights > 0 ? nights : 0;
  })();

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

  // En modo scroll infinito, el sistema de slots/animación progresiva no aplica:
  // los items se acumulan de a lotes y el array de slots con timers causaría
  // skeletons intermitentes en cada página. Renderizamos items directamente.
  // En modo clásico mantenemos el revelado progresivo original.
  const isInfiniteScrollModeForRender = itemsPerPage === 0;
  const slotsAreEmpty = !isInfiniteScrollModeForRender && slots.length > 0 && slots.every(s => s === null);
  const renderList: (Listing | null)[] = showSkeletons
    ? EMPTY_SLOTS
    : isInfiniteScrollModeForRender
      ? items          // todos los items acumulados, sin animación
      : slotsAreEmpty
        ? EMPTY_SLOTS
        : slots;       // revelado progresivo para modo clásico

  const showNextButton = hasAvailabilityFilter
    ? items.length === effectiveLimit || currentPage < totalPages
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
          maxTotalBudget={filters.maxTotalBudget}
          setMaxTotalBudget={(maxTotalBudget) => setFilters(prev => ({ ...prev, maxTotalBudget }))}
          isQuoteMode={isQuoteMode}
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
          currency={currency}
          onCurrencyChange={handleCurrencyChange}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={handleItemsPerPageChange}
          onPanelRef={handlePanelRef}
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
                  nightCount={nightCount}
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

          {/* Botón de expansión, paginación y sentinel de scroll infinito */}
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

            {/* Paginación clásica — solo cuando NO es modo "All" */}
            {!isInfiniteMode && (
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                hasAvailabilityFilter={hasAvailabilityFilter}
                showNextButton={showNextButton}
                onPageChange={(newPage: number) => {
                  filterChangedRef.current = true;
                  startSearchUx();
                  setItems([]);
                  setSlots(Array.from({ length: effectiveLimit }, () => null));
                  setCurrentPage(newPage);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

            {/* Sentinel para scroll infinito — visible solo en modo "All" */}
            {isInfiniteMode && (
              <div ref={sentinelCallbackRef} className="h-16 flex items-center justify-center mt-4">
                {loading && (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-neutral-400" />
                )}
              </div>
            )}
          </>}
        </main>

        <CartSidebar />
        <AddToQuoteToast />
        {!isUSD && rateNote && (
          <p className="text-center text-xs text-muted-foreground mt-4 pb-2 px-4">
            {rateNote}
          </p>
        )}
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