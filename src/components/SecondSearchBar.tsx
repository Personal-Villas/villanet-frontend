import { useMemo, useState, useEffect, useRef } from "react";
import {
  Calendar,
  Shield,
  Waves,
  Eye,
  ChefHat,
  UtensilsCrossed,
  Users,
  X,
  Ship,
  Footprints,
  Hotel,
  Flag,
  Dumbbell,
  Film,
  CircleDot,
  Car,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  //Search,
} from "lucide-react";
import CartButton from "./CartButton";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

/**
 * Badge real del CRUD.
 */
export type CrudBadge = {
  id: string;
  name: string;
  slug?: string | null;
  icon?: string | null;
  sort_order?: number | null;
  is_quick?: boolean | null;
};

type PropertiesHeaderCompactProps = {
  itemsCount: number;
  location: string;
  sortBy: string;
  setSortBy: (sort: string) => void;

  query: string;
  //setQuery: (value: string) => void; // Comentado como en el original

  destinations: string[];
  selectedDestination: string;
  onSelectDestination: (destination: string) => void;

  badges: CrudBadge[];
  selectedBadges: string[];
  onBadgeToggle: (badgeSlug: string) => void;

  checkIn: string;
  setCheckIn: (date: string) => void;
  checkOut: string;
  setCheckOut: (date: string) => void;

  bedrooms: string[];
  setBedrooms: (value: string[]) => void;

  guests?: number;
  setGuests?: (value: number) => void;

  onClearAllFilters?: () => void;
  cartCount?: number;
  onCartClick?: () => void;
};

// Mapea slugs/icon strings de tu CRUD a íconos lucide
const ICON_MAP: Record<string, React.ComponentType<any>> = {
  chef: ChefHat,
  "chef-hat": ChefHat,
  "chef-included": ChefHat,
  cook: UtensilsCrossed,
  "cook-included": UtensilsCrossed,
  beach: Waves,
  waves: Waves,
  beachfront: Waves,
  "true-beach-front": Waves,
  "walk-to-the-beach": Footprints,
  "ocean-front": Ship,
  "ocean-view": Eye,
  verified: Shield,
  shield: Shield,
  "gated-enclave": Shield,
  gated: Shield,
  resort: Hotel,
  "resort-villa": Hotel,
  hotel: Hotel,
  golf: Flag,
  "golf-villa": Flag,
  "golf-cart-included": Car,
  gym: Dumbbell,
  "private-gym": Dumbbell,
  cinema: Film,
  "private-cinema": Film,
  pickleball: CircleDot,
  tennis: CircleDot,
  "heated-pool": Waves,
  pool: Waves,
  default: Shield,
};

// Formatea el texto de fechas
const formatDates = (checkIn: string, checkOut: string): string => {
  if (!checkIn && !checkOut) return "Add dates";
  if (checkIn && !checkOut) return "Select checkout";

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return `${formatDate(checkIn)} – ${formatDate(checkOut)}`;
};

// Lista de destinos por región
const CARIBBEAN_DESTINATIONS = [
  "St. Barts",
  "Turks & Caicos",
  "Anguilla",
  "St. Martin",
  "Barbados",
  "Jamaica",
  "British Virgin Islands",
  "US Virgin Islands",
  "Casa de Campo",
  "Punta Cana",
];

const MEXICO_DESTINATIONS = ["Punta Mita", "Puerto Vallarta", "Los Cabos", "Riviera Maya"];

// Agrupa destinos por región con coincidencia flexible
const groupDestinationsByRegion = (
  destinations: string[]
): { caribbean: string[]; mexico: string[] } => {
  const normalizeString = (str: string): string => {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  };

  const normalizedDestinations = destinations.map((dest) => ({
    original: dest,
    normalized: normalizeString(dest),
  }));

  const caribbeanResults: Set<string> = new Set();
  const mexicoResults: Set<string> = new Set();

  CARIBBEAN_DESTINATIONS.forEach((refDest) => {
    const normalizedRef = normalizeString(refDest);

    normalizedDestinations.forEach(({ normalized }) => {
      if (
        normalized.includes(normalizedRef) ||
        normalizedRef.includes(normalized) ||
        normalized.split(" ").some((word) => normalizedRef.includes(word)) ||
        normalizedRef.split(" ").some((word) => normalized.includes(word))
      ) {
        caribbeanResults.add(refDest);
      }
    });
  });

  MEXICO_DESTINATIONS.forEach((refDest) => {
    const normalizedRef = normalizeString(refDest);

    normalizedDestinations.forEach(({ normalized }) => {
      if (
        normalized.includes(normalizedRef) ||
        normalizedRef.includes(normalized) ||
        normalized.split(" ").some((word) => normalizedRef.includes(word)) ||
        normalizedRef.split(" ").some((word) => normalized.includes(word))
      ) {
        mexicoResults.add(refDest);
      }
    });
  });

  const caribbean = Array.from(caribbeanResults).sort(
    (a, b) => CARIBBEAN_DESTINATIONS.indexOf(a) - CARIBBEAN_DESTINATIONS.indexOf(b)
  );

  const mexico = Array.from(mexicoResults).sort(
    (a, b) => MEXICO_DESTINATIONS.indexOf(a) - MEXICO_DESTINATIONS.indexOf(b)
  );

  return { caribbean, mexico };
};

const deriveInitialBedroomsCount = (bedrooms: string[]): number => {
  if (!bedrooms || bedrooms.length === 0) return 0;
  if (bedrooms.includes("5+")) return 5;
  const numeric = bedrooms
    .map((v) => parseInt(v, 10))
    .filter((n) => !Number.isNaN(n));
  if (numeric.length === 0) return 0;
  return numeric[0];
};

export default function PropertiesHeaderCompact({
  itemsCount,
  location,
  sortBy,
  setSortBy,
  query,
  //setQuery,
  destinations,
  selectedDestination,
  onSelectDestination,
  badges,
  selectedBadges,
  onBadgeToggle,
  checkIn,
  setCheckIn,
  checkOut,
  setCheckOut,
  bedrooms,
  setBedrooms,
  guests = 8,
  setGuests,
  onClearAllFilters,
  cartCount,
  onCartClick,
}: PropertiesHeaderCompactProps) {
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showAllBadges, setShowAllBadges] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGuestSelector, setShowGuestSelector] = useState(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const guestSelectorRef = useRef<HTMLDivElement>(null);

  // Estado local para el modal mobile
  const [localGuestsForModal, setLocalGuestsForModal] = useState(guests && guests > 0 ? guests : 1);

  const guestsLabel = guests && guests > 0 ? `${guests} Guests` : 'Guests';


  const datesLabel = formatDates(checkIn, checkOut);

  const { caribbean, mexico } = useMemo(
    () => groupDestinationsByRegion(destinations),
    [destinations]
  );

  // Helper para formatear fecha a YYYY-MM-DD
  const formatISO = (date: Date) => date.toISOString().split("T")[0];

  // Handler para manejar la selección de rangos
  const handleRangeSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (!range) {
      setCheckIn("");
      setCheckOut("");
      return;
    }

    const { from, to } = range;

    // Primera selección: solo from
    if (from && !to) {
      setCheckIn(formatISO(from));
      setCheckOut("");
      return;
    }

    if (from && to) {
      let fromDate = from;
      let toDate = to;

      // Si el usuario eligió el mismo día para check-in y check-out,
      // forzamos una noche (checkOut = from + 1 día)
      if (toDate <= fromDate) {
        toDate = new Date(fromDate);
        toDate.setDate(toDate.getDate() + 1);
      }

      setCheckIn(formatISO(fromDate));
      setCheckOut(formatISO(toDate));
    }
  };

  

  // Detectar scroll para comprimir barra en desktop - con throttling y buffer
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      lastScrollY = window.scrollY;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          // Aumentar el threshold a 100 y agregar buffer de 20px para evitar flickering
          const shouldCollapse = lastScrollY > 100;
          
          // Solo actualizar si hay un cambio real
          if (shouldCollapse !== isCollapsed) {
            setIsCollapsed(shouldCollapse);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    // Throttle manual para scroll
    const throttledScroll = () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      scrollTimeoutRef.current = setTimeout(handleScroll, 50);
    };

    window.addEventListener("scroll", throttledScroll, { passive: true });
    
    return () => {
      window.removeEventListener("scroll", throttledScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [isCollapsed]);

  // Resetear guests locales cuando se abre el modal
  useEffect(() => {
    if (showMobileFilters) {
      setLocalGuestsForModal(guests && guests > 0 ? guests : 1);
    }
  }, [showMobileFilters, guests]);

  // Cerrar date picker y guest selector al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
      if (guestSelectorRef.current && !guestSelectorRef.current.contains(event.target as Node)) {
        setShowGuestSelector(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const { quickBadges, restBadges, visibleBadges, hiddenBadgesCount } = useMemo(() => {
    if (!badges || badges.length === 0) {
      return { 
        quickBadges: [] as CrudBadge[], 
        restBadges: [] as CrudBadge[],
        visibleBadges: [] as CrudBadge[],
        hiddenBadgesCount: 0
      };
    }

    const sorted = [...badges].sort((a, b) => {
      const ao = a.sort_order ?? 9999;
      const bo = b.sort_order ?? 9999;
      return ao - bo;
    });

    const quick = sorted.filter((b) => b.is_quick);
    const rest = sorted.filter((b) => !b.is_quick);

    // Para desktop: mostrar primeros 4-6 badges + botón "More"
    const desktopMaxVisible = 6;
    const allBadges = [...quick, ...rest];
    const visibleBadges = showAllBadges ? allBadges : allBadges.slice(0, desktopMaxVisible);
    const hiddenBadgesCount = allBadges.length - visibleBadges.length;

    return { 
      quickBadges: quick, 
      restBadges: rest,
      visibleBadges,
      hiddenBadgesCount
    };
  }, [badges, showAllBadges]);

  const resolveIcon = (badge: CrudBadge): React.ComponentType<any> => {
    const normalizeKey = (str: string) =>
      str.toString().toLowerCase().replace(/\s+/g, "-");
  
    const iconKey = normalizeKey(badge.icon || "");
    const slugKey = normalizeKey(badge.slug || badge.id || "");
    const nameKey = normalizeKey(badge.name || "");
  
    return (
      ICON_MAP[iconKey] ||
      ICON_MAP[slugKey] ||
      ICON_MAP[nameKey] ||
      ICON_MAP.default
    );
  };

  const renderBadge = (badge: CrudBadge) => {
    const Icon = resolveIcon(badge);
    const isSelected = selectedBadges.includes(badge.id);

    return (
      <button
        key={badge.id}
        onClick={() => onBadgeToggle(badge.id)}
        role="button"
        aria-pressed={isSelected}
        aria-label={`Filter by ${badge.name}, ${isSelected ? "active" : "inactive"}`}
        className={`inline-flex items-center rounded-full font-medium transition-all duration-200 active:scale-95 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 px-2.5 py-1 text-xs gap-1 ${
          isSelected
            ? "bg-[hsl(0,0%,6.7%)] text-white border-2 border-[hsl(0,0%,6.7%)] hover:bg-[hsl(0,0%,15%)]"
            : "bg-background text-foreground border-2 border-[hsl(0,0%,82%)] hover:border-[hsl(0,0%,64%)]"
        }`}
      >
        <Icon className="h-3 w-3" />
        <span>{badge.name}</span>
        {isSelected && <X className="h-2.5 w-2.5 ml-0.5" />}
      </button>
    );
  };

  const renderDestinationButton = (dest: string) => {
    const isSelected = selectedDestination === dest;

    return (
      <button
        key={dest}
        onClick={() => onSelectDestination(dest === selectedDestination ? "" : dest)}
        role="button"
        aria-pressed={isSelected}
        aria-label={`Filter by ${dest}, ${isSelected ? "active" : "inactive"}`}
        className={`inline-flex items-center rounded-full font-medium transition-all duration-200 active:scale-95 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 px-2.5 py-1 text-xs gap-1 ${
          isSelected
            ? "bg-[hsl(0,0%,6.7%)] text-white border-2 border-[hsl(0,0%,6.7%)] hover:bg-[hsl(0,0%,15%)]"
            : "bg-background text-foreground border-2 border-[hsl(0,0%,82%)] hover:border-[hsl(0,0%,64%)]"
        }`}
      >
        <span>{dest}</span>
        {isSelected && <X className="h-2.5 w-2.5 ml-0.5" />}
      </button>
    );
  };

  const hasActiveFilters =
    query?.trim().length > 0 ||
    !!selectedDestination ||
    !!checkIn ||
    !!checkOut ||
    bedrooms.length > 0 ||
    selectedBadges.length > 0 ||
    sortBy !== "rank";

  const activeFiltersCount =
    (query?.trim().length > 0 ? 1 : 0) +
    (selectedDestination ? 1 : 0) +
    (checkIn || checkOut ? 1 : 0) +
    (bedrooms.length > 0 ? 1 : 0) +
    selectedBadges.length +
    (sortBy !== "rank" ? 1 : 0);

  // Date Picker para desktop
  const DatePickerDesktop = () => (
    <div
      ref={datePickerRef}
      className="absolute top-full left-0 mt-2 z-50 bg-background border border-border rounded-xl shadow-2xl p-4 w-[600px]"
    >
      <DayPicker
        required
        mode="range"
        selected={{
          from: checkIn ? new Date(checkIn) : undefined,
          to: checkOut ? new Date(checkOut) : undefined,
        }}
        onSelect={handleRangeSelect}
        numberOfMonths={2}
        className="[&_.rdp]:m-0 [&_.rdp-month]:!w-full"
        classNames={{
          months: "flex gap-4",
          month: "space-y-4",
          caption: "flex justify-center pt-1 relative items-center",
          caption_label: "text-sm font-medium",
          nav: "flex items-center",
          nav_button: "h-6 w-6 bg-transparent p-0 opacity-50 hover:opacity-100",
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          table: "w-full border-collapse space-y-1",
          head_row: "flex",
          head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
          row: "flex w-full mt-2",
          cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
          day: "h-8 w-8 p-0 font-normal aria-selected:opacity-100",
          day_selected:
            "bg-[hsl(0,0%,6.7%)] text-white hover:bg-[hsl(0,0%,15%)] focus:bg-[hsl(0,0%,15%)]",
          day_today: "bg-accent text-accent-foreground",
          day_outside: "text-muted-foreground opacity-50",
          day_disabled: "text-muted-foreground opacity-50",
          day_range_middle:
            "aria-selected:bg-accent aria-selected:text-accent-foreground",
          day_hidden: "invisible",
        }}
      />
      <div className="flex justify-end pt-3 border-t border-border mt-4">
        <button
          onClick={() => setShowDatePicker(false)}
          className="px-4 py-2 text-sm bg-[hsl(0,0%,6.7%)] text-white rounded-lg hover:bg-[hsl(0,0%,15%)] transition-colors font-medium"
        >
          Apply Dates
        </button>
      </div>
    </div>
  );

  // Guest Selector para desktop
  const GuestSelectorDesktop = () => {
    const currentGuests = guests && guests > 0 ? guests : 1;
  
    return (
      <div
        ref={guestSelectorRef}
        className="absolute top-full left-0 mt-2 z-50 bg-background border border-border rounded-xl shadow-2xl p-5 w-64"
      >
        <h3 className="font-medium text-sm mb-4">Number of guests</h3>
        <div className="flex items-center justify-between p-3 border border-input rounded-lg">
          <span className="text-sm">Guests</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setGuests && setGuests(Math.max(1, currentGuests - 1))}
              className="w-8 h-8 rounded-full border border-input flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentGuests <= 1}
            >
              –
            </button>
            <span className="w-8 text-center font-semibold">{currentGuests}</span>
            <button
              type="button"
              onClick={() => setGuests && setGuests(currentGuests + 1)}
              className="w-8 h-8 rounded-full border border-input flex items-center justify-center hover:bg-muted transition-colors"
            >
              +
            </button>
          </div>
        </div>
        {/* ... */}
      </div>
    );
  };
  

  return (
    <>
      {/* DESKTOP VERSION */}
      <div className="hidden md:block sticky top-16 z-40 bg-background border-b border-border transition-all duration-300 ease-in-out">
        <div
          className={`container mx-auto px-6 space-y-4 transition-all ${
            isCollapsed ? "py-2" : "py-4"
          }`}
        >
          {/* Primera fila: Título + Info + Sort + Cart */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm flex-wrap">
              <h1 className="text-xl font-semibold text-foreground">
                {itemsCount} Villas in {location}
              </h1>
              <span className="text-muted-foreground">•</span>

              {/* FECHAS CLICKABLES → abre dropdown con calendario */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowDatePicker(!showDatePicker);
                    setShowGuestSelector(false);
                  }}
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  <span>{datesLabel}</span>
                </button>
                {showDatePicker && <DatePickerDesktop />}
              </div>

              <span className="text-muted-foreground">•</span>

              {/* GUESTS CLICKABLES → abre dropdown con selector */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowGuestSelector(!showGuestSelector);
                    setShowDatePicker(false);
                  }}
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Users className="w-4 h-4" />
                  <span>{guestsLabel}</span>
                </button>
                {showGuestSelector && <GuestSelectorDesktop />}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 text-sm border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="rank">Sort: Villa Rank (High → Low)</option>
                <option value="price_low">Price (Low → High)</option>
                <option value="price_high">Price (High → Low)</option>
                <option value="bedrooms">Bedrooms (Most → Least)</option>
              </select>

              <CartButton
                count={cartCount}
                onClick={onCartClick}
                variant="default"
                showLabel={true}
              />
            </div>
          </div>

          {/* Bloque grande de filtros solo cuando NO está colapsado */}
          {!isCollapsed && (
            <>
              {/* Segunda fila: Include location(s) for your search */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Include location(s) for your search
                  </p>
                  {hasActiveFilters && onClearAllFilters && (
                    <button
                      onClick={onClearAllFilters}
                      className="px-3 py-1 text-sm border border-input rounded-md hover:bg-muted transition-colors font-medium whitespace-nowrap"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>

                {/* Caribbean */}
                {caribbean.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-xs text-muted-foreground font-medium">
                      Caribbean
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {caribbean.map(renderDestinationButton)}
                    </div>
                  </div>
                )}

                {/* Mexico */}
                {mexico.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-xs text-muted-foreground font-medium">
                      Mexico
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {mexico.map(renderDestinationButton)}
                    </div>
                  </div>
                )}
              </div>

              {/* Tercera fila: Popular filters */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Popular filters
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {visibleBadges.map(renderBadge)}
                  
                  {hiddenBadgesCount > 0 && (
                    <button
                      onClick={() => setShowAllBadges(!showAllBadges)}
                      className="inline-flex items-center rounded-full font-medium transition-all duration-200 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 px-3 py-1 text-xs gap-1 border-2 border-[hsl(0,0%,82%)] hover:border-[hsl(0,0%,64%)] bg-background text-foreground"
                    >
                      {showAllBadges ? (
                        <>
                          <ChevronUp className="h-3 w-3" />
                          <span>Show Less</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3 w-3" />
                          <span>More ({hiddenBadgesCount})</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* MOBILE VERSION */}
      <div className="md:hidden sticky top-16 z-40 bg-background border-b border-border">
        <div className="px-4 py-3 space-y-3">
          {/* Título compacto */}
          <div className="flex items-center justify-between">
            <h1 className="text-base font-semibold text-foreground">
              {itemsCount} Villas
            </h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowMobileFilters(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm border border-input rounded-lg hover:bg-muted transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="bg-[hsl(0,0%,6.7%)] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
              <CartButton
                count={cartCount}
                onClick={onCartClick}
                variant="icon-only"
                showLabel={false}
                className="border border-input rounded-lg"
              />
            </div>
          </div>

          {/* Filtros en línea para mobile */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4">
            {/* Dates button */}
            <div className="relative flex-shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowDatePicker(!showDatePicker);
                  setShowGuestSelector(false);
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-input rounded-lg hover:bg-muted transition-colors whitespace-nowrap"
              >
                <Calendar className="w-4 h-4" />
                <span>{datesLabel}</span>
              </button>
              {showDatePicker && (
                <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-background rounded-xl shadow-2xl w-full max-w-sm border border-border overflow-hidden">
                    <div className="bg-background border-b border-border px-5 py-4 flex items-center justify-between">
                      <h2 className="text-lg font-semibold">Select Dates</h2>
                      <button
                        onClick={() => setShowDatePicker(false)}
                        className="p-1.5 hover:bg-muted rounded-full transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-4">
                      <DayPicker
                        required
                        mode="range"
                        selected={{
                          from: checkIn ? new Date(checkIn) : undefined,
                          to: checkOut ? new Date(checkOut) : undefined,
                        }}
                        onSelect={handleRangeSelect}
                        numberOfMonths={1}
                        className="[&_.rdp]:m-0"
                      />
                    </div>
                    <div className="bg-muted/30 border-t border-border p-4">
                      <button
                        onClick={() => setShowDatePicker(false)}
                        className="w-full px-4 py-2.5 text-sm bg-[hsl(0,0%,6.7%)] text-white rounded-lg hover:bg-[hsl(0,0%,15%)] transition-colors font-medium"
                      >
                        Apply Dates
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Guests button */}
            <div className="relative flex-shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowGuestSelector(!showGuestSelector);
                  setShowDatePicker(false);
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-input rounded-lg hover:bg-muted transition-colors whitespace-nowrap"
              >
                <Users className="w-4 h-4" />
                <span>{guestsLabel}</span>
              </button>
              {showGuestSelector && (
                <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-background rounded-xl shadow-2xl w-full max-w-sm border border-border overflow-hidden">
                    <div className="bg-background border-b border-border px-5 py-4 flex items-center justify-between">
                      <h2 className="text-lg font-semibold">Select Guests</h2>
                      <button
                        onClick={() => setShowGuestSelector(false)}
                        className="p-1.5 hover:bg-muted rounded-full transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center justify-between p-5 border border-input rounded-lg">
                        <div>
                          <h3 className="font-medium text-sm">Number of guests</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">Select total guests</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setGuests && setGuests(Math.max(1, guests - 1))}
                            className="w-9 h-9 rounded-full border border-input flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium"
                            disabled={guests <= 1}
                          >
                            –
                          </button>
                          <span className="w-10 text-center text-lg font-semibold">{guests}</span>
                          <button
                            type="button"
                            onClick={() => setGuests && setGuests(guests + 1)}
                            className="w-9 h-9 rounded-full border border-input flex items-center justify-center hover:bg-muted transition-colors text-lg font-medium"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="bg-muted/30 border-t border-border p-4">
                      <button
                        onClick={() => setShowGuestSelector(false)}
                        className="w-full px-4 py-2.5 text-sm bg-[hsl(0,0%,6.7%)] text-white rounded-lg hover:bg-[hsl(0,0%,15%)] transition-colors font-medium"
                      >
                        Apply Guests
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Badges seleccionados como chips horizontales */}
          {selectedBadges.length > 0 && (
            <div
              className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {selectedBadges.map((slug) => {
                const badge = badges.find((b: CrudBadge) => b.id === slug);
                if (!badge) return null;
                const Icon = resolveIcon(badge);
                return (
                  <button
                    key={badge.id}
                    onClick={() => onBadgeToggle(badge.id)}
                    className="flex-shrink-0 inline-flex items-center rounded-full bg-[hsl(0,0%,6.7%)] text-white px-2.5 py-1 text-xs gap-1.5 font-medium"
                  >
                    <Icon className="h-3 w-3" />
                    <span>{badge.name}</span>
                    <X className="h-3 w-3" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal de todos los filtros (solo para botón "Filters" en mobile) */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-[200] bg-background overflow-y-auto">
          <div className="sticky top-0 bg-background border-b border-border px-4 py-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Filters</h2>
            <button
              onClick={() => setShowMobileFilters(false)}
              className="p-2 hover:bg-muted rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 space-y-6 pb-24 max-w-2xl mx-auto">
            {/* Sort */}
            <div>
              <label className="block text-sm font-medium mb-2">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="rank">Villa Rank (High → Low)</option>
                <option value="price_low">Price (Low → High)</option>
                <option value="price_high">Price (High → Low)</option>
                <option value="bedrooms">Bedrooms (Most → Least)</option>
              </select>
            </div>

            {/* Locations */}
            <div>
              <label className="block text-sm font-medium mb-3">Locations</label>

              {caribbean.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-muted-foreground font-medium mb-2">
                    Caribbean
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {caribbean.map((dest) => renderDestinationButton(dest))}
                  </div>
                </div>
              )}

              {mexico.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-2">
                    Mexico
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {mexico.map((dest) => renderDestinationButton(dest))}
                  </div>
                </div>
              )}
            </div>

            {/* Dates */}
            <div>
              <label className="block text-sm font-medium mb-2">Dates</label>
              <div className="space-y-2">
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  placeholder="Check-in"
                  className="w-full px-3 py-2.5 text-sm border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <input
                  type="date"
                  value={checkOut}
                  min={checkIn || undefined}
                  onChange={(e) => setCheckOut(e.target.value)}
                  placeholder="Check-out"
                  className="w-full px-3 py-2.5 text-sm border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            {/* Bedrooms */}
            <div>
              <label className="block text-sm font-medium mb-2">Bedrooms</label>
              <div className="flex items-center justify-between p-4 border border-input rounded-lg">
                <span className="text-sm">Number of bedrooms</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const current = deriveInitialBedroomsCount(bedrooms);
                      const newVal = Math.max(0, current - 1);
                      if (newVal === 0) setBedrooms([]);
                      else if (newVal >= 5) setBedrooms(["5+"]);
                      else setBedrooms([String(newVal)]);
                    }}
                    className="w-8 h-8 rounded-full border border-input flex items-center justify-center hover:bg-muted transition-colors"
                  >
                    –
                  </button>
                  <span className="w-8 text-center font-medium">
                    {bedrooms.length === 0
                      ? "Any"
                      : bedrooms.includes("5+")
                      ? "5+"
                      : bedrooms[0]}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const current = deriveInitialBedroomsCount(bedrooms);
                      const newVal = Math.min(6, current + 1);
                      if (newVal >= 5) setBedrooms(["5+"]);
                      else setBedrooms([String(newVal)]);
                    }}
                    className="w-8 h-8 rounded-full border border-input flex items-center justify-center hover:bg-muted transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Guests */}
            {setGuests && (
              <div>
                <label className="block text-sm font-medium mb-2">Guests</label>
                <div className="flex items-center justify-between p-4 border border-input rounded-lg">
                  <span className="text-sm">Number of guests</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setLocalGuestsForModal(Math.max(1, localGuestsForModal - 1))}
                      className="w-8 h-8 rounded-full border border-input flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={localGuestsForModal <= 1}
                    >
                      –
                    </button>
                    <span className="w-8 text-center font-medium">{localGuestsForModal}</span>
                    <button
                      type="button"
                      onClick={() => setLocalGuestsForModal(localGuestsForModal + 1)}
                      className="w-8 h-8 rounded-full border border-input flex items-center justify-center hover:bg-muted transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Amenities/Badges */}
            <div>
              <label className="block text-sm font-medium mb-3">Amenities</label>
              <div className="flex flex-wrap gap-2">
                {[...quickBadges, ...restBadges].map(renderBadge)}
              </div>
            </div>
          </div>

          {/* Footer fijo con botones */}
          <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 z-10">
            <div className="flex gap-3">
              {hasActiveFilters && onClearAllFilters && (
                <button
                  onClick={() => {
                    onClearAllFilters?.();
                    setShowMobileFilters(false);
                  }}
                  className="flex-1 px-4 py-3 text-sm border border-input rounded-lg hover:bg-muted transition-colors font-medium"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={() => {
                  // Aplicar los cambios de guests al salir del modal
                  if (setGuests) {
                    setGuests(localGuestsForModal);
                  }
                  setShowMobileFilters(false);
                }}
                className="flex-1 px-4 py-3 text-sm bg-[hsl(0,0%,6.7%)] text-white rounded-lg hover:bg-[hsl(0,0%,15%)] transition-colors font-medium"
              >
                Show {itemsCount} Villas
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}