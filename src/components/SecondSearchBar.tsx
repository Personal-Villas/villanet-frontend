import { useMemo, useState } from "react";
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
} from "lucide-react";
import CartButton from "./CartButton"; // Importamos el componente separado

/**
 * Badge real del CRUD.
 */
export type CrudBadge = {
  id: string;
  name: string;
  slug: string;
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
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  return `${formatDate(checkIn)} – ${formatDate(checkOut)}`;
};

// Lista de destinos por región (actualizada según el HTML de referencia)
const CARIBBEAN_DESTINATIONS = [
  'St. Barts',
  'Turks & Caicos', 
  'Anguilla', 
  'St. Martin',
  'Barbados', 
  'Jamaica', 
  'British Virgin Islands', 
  'US Virgin Islands', 
  'Casa de Campo', 
  'Punta Cana'
];

const MEXICO_DESTINATIONS = [
  'Punta Mita', 
  'Puerto Vallarta', 
  'Los Cabos', 
  'Riviera Maya'
];

// Agrupa destinos por región con coincidencia flexible
const groupDestinationsByRegion = (destinations: string[]): {caribbean: string[], mexico: string[]} => {
  // Función para normalizar strings para comparación
  const normalizeString = (str: string): string => {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };
  
  const normalizedDestinations = destinations.map(dest => ({
    original: dest,
    normalized: normalizeString(dest)
  }));
  
  // Crear arrays para resultados
  const caribbeanResults: Set<string> = new Set();
  const mexicoResults: Set<string> = new Set();
  
  // Primero buscar coincidencias exactas o parciales
  CARIBBEAN_DESTINATIONS.forEach(refDest => {
    const normalizedRef = normalizeString(refDest);
    
    normalizedDestinations.forEach(({ normalized }) => {
      if (
        normalized.includes(normalizedRef) || 
        normalizedRef.includes(normalized) ||
        normalized.split(' ').some(word => normalizedRef.includes(word)) ||
        normalizedRef.split(' ').some(word => normalized.includes(word))
      ) {
        caribbeanResults.add(refDest); // Usar el nombre del HTML de referencia
      }
    });
  });
  
  MEXICO_DESTINATIONS.forEach(refDest => {
    const normalizedRef = normalizeString(refDest);
    
    normalizedDestinations.forEach(({ normalized }) => {
      if (
        normalized.includes(normalizedRef) || 
        normalizedRef.includes(normalized) ||
        normalized.split(' ').some(word => normalizedRef.includes(word)) ||
        normalizedRef.split(' ').some(word => normalized.includes(word))
      ) {
        mexicoResults.add(refDest); // Usar el nombre del HTML de referencia
      }
    });
  });
  
  // Convertir Sets a Arrays y ordenar según el orden de referencia
  const caribbean = Array.from(caribbeanResults).sort((a, b) => 
    CARIBBEAN_DESTINATIONS.indexOf(a) - CARIBBEAN_DESTINATIONS.indexOf(b)
  );
  
  const mexico = Array.from(mexicoResults).sort((a, b) => 
    MEXICO_DESTINATIONS.indexOf(a) - MEXICO_DESTINATIONS.indexOf(b)
  );
  
  return { caribbean, mexico };
};

// Inicializa el número temporal de bedrooms
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

  const datesLabel = formatDates(checkIn, checkOut);

  const { caribbean, mexico } = useMemo(
    () => groupDestinationsByRegion(destinations),
    [destinations]
  );

  // Separar badges en quick y rest
  const { quickBadges, restBadges } = useMemo(() => {
    if (!badges || badges.length === 0) {
      return { quickBadges: [] as CrudBadge[], restBadges: [] as CrudBadge[] };
    }

    const sorted = [...badges].sort((a, b) => {
      const ao = a.sort_order ?? 9999;
      const bo = b.sort_order ?? 9999;
      return ao - bo;
    });

    const quick = sorted.filter((b) => b.is_quick);
    const rest = sorted.filter((b) => !b.is_quick);

    return { quickBadges: quick, restBadges: rest };
  }, [badges]);

  const resolveIcon = (badge: CrudBadge): React.ComponentType<any> => {
    const normalizeKey = (str: string) => 
      str.toString().toLowerCase().replace(/\s+/g, "-");
    
    const iconKey = normalizeKey(badge.icon || "");
    const slugKey = normalizeKey(badge.slug || "");
    const nameKey = normalizeKey(badge.name || "");
    
    return ICON_MAP[iconKey] || ICON_MAP[slugKey] || ICON_MAP[nameKey] || ICON_MAP.default;
  };

  const renderBadge = (badge: CrudBadge) => {
    const Icon = resolveIcon(badge);
    const isSelected = selectedBadges.includes(badge.slug);

    return (
      <button
        key={badge.id}
        onClick={() => onBadgeToggle(badge.slug)}
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
        {isSelected && (
          <X className="h-2.5 w-2.5 ml-0.5" />
        )}
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
        {isSelected && (
          <X className="h-2.5 w-2.5 ml-0.5" />
        )}
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

  return (
    <>
      {/* DESKTOP VERSION */}
      <div className="hidden md:block sticky top-16 z-40 bg-background border-b border-border">
        <div className="container mx-auto px-6 py-4 space-y-4">
          {/* Primera fila: Título + Info + Sort + Cart */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm flex-wrap">
              <h1 className="text-xl font-semibold text-foreground">
                {itemsCount} Villas in {location}
              </h1>
              <span className="text-muted-foreground">•</span>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>{datesLabel}</span>
              </div>
              <span className="text-muted-foreground">•</span>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{guests} Guests</span>
              </div>
            </div>

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

                <CartButton
                count={cartCount}
                onClick={onCartClick}
                variant="default"
                showLabel={true}
              />
            </div>
          </div>

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
                <p className="text-xs text-muted-foreground font-medium">Caribbean</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {caribbean.map(renderDestinationButton)}
                </div>
              </div>
            )}

            {/* Mexico */}
            {mexico.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground font-medium">Mexico</p>
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
              {quickBadges.map(renderBadge)}
            </div>

            {/* Segunda fila de badges */}
            {restBadges.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                {restBadges.map(renderBadge)}
              </div>
            )}
          </div>
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

          {/* Info compacta */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>{datesLabel}</span>
            <span>•</span>
            <Users className="w-3 h-3" />
            <span>{guests} Guests</span>
          </div>

          {/* Badges seleccionados como chips horizontales scrolleables */}
          {selectedBadges.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {selectedBadges.map((slug) => {
                const badge = badges.find((b) => b.slug === slug);
                if (!badge) return null;
                const Icon = resolveIcon(badge);
                return (
                  <button
                    key={badge.id}
                    onClick={() => onBadgeToggle(badge.slug)}
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

      {/* Modal de filtros MOBILE */}
      {showMobileFilters && (
        <div className="md:hidden fixed inset-0 bg-background z-[100] overflow-y-auto">
          <div className="sticky top-0 bg-background border-b border-border px-4 py-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Filters</h2>
            <button
              onClick={() => setShowMobileFilters(false)}
              className="p-2 hover:bg-muted rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 space-y-6 pb-24">
            {/* Sort */}
            <div>
              <label className="block text-sm font-medium mb-2">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="rank">Villa Rank (High → Low)</option>
                <option value="price-low">Price (Low → High)</option>
                <option value="price-high">Price (High → Low)</option>
                <option value="bedrooms">Bedrooms (Most → Least)</option>
              </select>
            </div>

            {/* Locations */}
            <div>
              <label className="block text-sm font-medium mb-3">Locations</label>
              
              {caribbean.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-muted-foreground font-medium mb-2">Caribbean</p>
                  <div className="flex flex-wrap gap-2">
                    {caribbean.map((dest) => renderDestinationButton(dest))}
                  </div>
                </div>
              )}

              {mexico.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-2">Mexico</p>
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
                    {bedrooms.length === 0 ? "Any" : bedrooms.includes("5+") ? "5+" : bedrooms[0]}
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
                      onClick={() => setGuests(Math.max(1, guests - 1))}
                      className="w-8 h-8 rounded-full border border-input flex items-center justify-center hover:bg-muted transition-colors"
                    >
                      –
                    </button>
                    <span className="w-8 text-center font-medium">{guests}</span>
                    <button
                      type="button"
                      onClick={() => setGuests(guests + 1)}
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
          <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 flex gap-3">
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
              onClick={() => setShowMobileFilters(false)}
              className="flex-1 px-4 py-3 text-sm bg-[hsl(0,0%,6.7%)] text-white rounded-lg hover:bg-[hsl(0,0%,15%)] transition-colors font-medium"
            >
              Show {itemsCount} Villas
            </button>
          </div>
        </div>
      )}
    </>
  );
}