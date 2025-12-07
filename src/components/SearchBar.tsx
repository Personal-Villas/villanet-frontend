import { useMemo, useState } from "react";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
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
  Search,
  SlidersHorizontal,
} from "lucide-react";

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

type PropertiesHeaderProps = {
  itemsCount: number;
  location: string;
  sortBy: string;
  setSortBy: (sort: string) => void;

  query: string;
  setQuery: (value: string) => void;

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
};

// Mapea slugs/icon strings de tu CRUD a íconos lucide (basado en el HTML)
const ICON_MAP: Record<string, any> = {
  // Chef badges
  chef: ChefHat,
  "chef-hat": ChefHat,
  "chef-included": ChefHat,
  
  // Cook badges
  cook: UtensilsCrossed,
  "cook-included": UtensilsCrossed,
  
  // Beach/Water badges
  beach: Waves,
  waves: Waves,
  beachfront: Waves,
  "true-beach-front": Waves,
  "walk-to-the-beach": Footprints,
  
  // Ocean badges
  "ocean-front": Ship,
  "ocean-view": Eye,
  
  // Security/Gated
  verified: Shield,
  shield: Shield,
  "gated-enclave": Shield,
  gated: Shield,
  
  // Resort/Hotel
  resort: Hotel,
  "resort-villa": Hotel,
  hotel: Hotel,
  
  // Golf
  golf: Flag,
  "golf-villa": Flag,
  "golf-cart-included": Car,
  
  // Amenities
  gym: Dumbbell,
  "private-gym": Dumbbell,
  cinema: Film,
  "private-cinema": Film,
  pickleball: CircleDot,
  tennis: CircleDot,
  
  // Pool
  "heated-pool": Waves,
  pool: Waves,
  
  // Default
  default: Shield,
};

// Formatea el texto de fechas para el header
const formatDates = (checkIn: string, checkOut: string): string => {
  if (!checkIn && !checkOut) return "Add dates";
  if (checkIn && !checkOut) return "Select checkout";
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  return `${formatDate(checkIn)} – ${formatDate(checkOut)}`;
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

export default function PropertiesHeader({
  itemsCount,
  location,
  sortBy,
  setSortBy,
  query,
  setQuery,
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
}: PropertiesHeaderProps) {
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showBedroomsPicker, setShowBedroomsPicker] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [tempBedrooms, setTempBedrooms] = useState<number>(
    deriveInitialBedroomsCount(bedrooms)
  );

  const datesLabel = formatDates(checkIn, checkOut);

  /*const bedroomsLabel =
    bedrooms.length === 0
      ? "Bedrooms"
      : bedrooms.includes("5+")
      ? "5+ BR"
      : `${bedrooms.join(", ")} BR`;
*/
  const hasActiveFilters =
    query.trim().length > 0 ||
    !!selectedDestination ||
    !!checkIn ||
    !!checkOut ||
    bedrooms.length > 0 ||
    selectedBadges.length > 0 ||
    sortBy !== "rank";

  const { topBadges, extraBadges } = useMemo(() => {
    if (!badges || badges.length === 0) {
      return { topBadges: [] as CrudBadge[], extraBadges: [] as CrudBadge[] };
    }

    const sorted = [...badges].sort((a, b) => {
      const ao = a.sort_order ?? 9999;
      const bo = b.sort_order ?? 9999;
      return ao - bo;
    });

    const quick = sorted.filter((b) => b.is_quick);
    const rest = sorted.filter((b) => !b.is_quick);

    const top = quick.length > 0 ? quick.slice(0, 8) : sorted.slice(0, 8);

    const topIds = new Set(top.map((b) => b.id));
    const extra = sorted.filter((b) => !topIds.has(b.id));

    return { topBadges: top, extraBadges: rest.length ? extra : [] };
  }, [badges]);

  const resolveIcon = (badge: CrudBadge) => {
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

    const handleClick = () => {
      console.log("🎯 Badge clicked:", {
        slug: badge.slug,
        name: badge.name,
        id: badge.id,
        currentlySelected: selectedBadges,
      });
      onBadgeToggle(badge.slug);
    };

    return (
      <button
        key={badge.id}
        onClick={handleClick}
        role="button"
        aria-pressed={isSelected}
        aria-label={`Filter by ${badge.name}, ${
          isSelected ? "active" : "inactive"
        }`}
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

  const handleApplyBedrooms = () => {
    let next: string[] = [];

    if (tempBedrooms <= 0) {
      next = [];
    } else if (tempBedrooms >= 5) {
      next = ["5+"];
    } else {
      next = [String(tempBedrooms)];
    }

    console.log("✅ Applying bedrooms filter:", { tempBedrooms, next });
    setBedrooms(next);
    setShowBedroomsPicker(false);
  };

  const activeFiltersCount = 
    (query.trim().length > 0 ? 1 : 0) +
    (selectedDestination ? 1 : 0) +
    (checkIn || checkOut ? 1 : 0) +
    (bedrooms.length > 0 ? 1 : 0) +
    selectedBadges.length +
    (sortBy !== "rank" ? 1 : 0);

  return (
    <>
      {/* DESKTOP VERSION - sin cambios */}
      <div className="hidden md:block sticky top-16 z-40 bg-background border-b border-border">
        <div className="container mx-auto px-6 py-4 space-y-4">
          {/* Primera fila: Título + Info + Sort */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <h1 className="text-lg md:text-xl font-semibold text-foreground">
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
                onChange={(e) => {
                  console.log("🎯 Sort changed to:", e.target.value);
                  setSortBy(e.target.value);
                }}
                className="px-3 py-2 text-sm border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="rank">Sort: Villa Rank (High → Low)</option>
                <option value="price-low">Price (Low → High)</option>
                <option value="price-high">Price (High → Low)</option>
                <option value="bedrooms">Bedrooms (Most → Least)</option>
              </select>
            </div>
          </div>

          {/* Segunda fila: Search + Destinations */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search villas by name, location, or amenities..."
                  className="w-full pl-10 pr-4 py-2 text-sm border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            {/* Destinations Dropdown */}
            <div className="w-full md:w-auto">
              <select
                value={selectedDestination}
                onChange={(e) => onSelectDestination(e.target.value)}
                className="w-full md:w-auto px-3 py-2 text-sm border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">All Destinations</option>
                {destinations.map((dest) => (
                  <option key={dest} value={dest}>
                    {dest}
                  </option>
                ))}
              </select>
            </div>

            {hasActiveFilters && onClearAllFilters && (
              <button
                onClick={onClearAllFilters}
                className="px-3 py-2 text-sm border border-input rounded-md hover:bg-muted transition-colors font-medium whitespace-nowrap"
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Tercera fila: Filtros populares (badges) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Popular filters
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {topBadges.map(renderBadge)}
            </div>

            {/* Segunda fila de badges si hay más */}
            {extraBadges.length > 0 && showMoreFilters && (
              <div className="flex items-center gap-2 flex-wrap animate-in fade-in duration-300">
                {extraBadges.map(renderBadge)}
              </div>
            )}

            {/* Botón More Filters */}
            {extraBadges.length > 0 && (
              <button
                type="button"
                onClick={() => setShowMoreFilters((p) => !p)}
                aria-expanded={showMoreFilters}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-background text-foreground border-2 border-[hsl(0,0%,82%)] hover:border-[hsl(0,0%,64%)] transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <span>{showMoreFilters ? "- Less Filters" : "+ More Filters"}</span>
                {showMoreFilters ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE VERSION - optimizada y compacta */}
      <div className="md:hidden sticky top-16 z-40 bg-background border-b border-border">
        <div className="px-4 py-3 space-y-3">
          {/* Título compacto */}
          <div className="flex items-center justify-between">
            <h1 className="text-base font-semibold text-foreground">
              {itemsCount} Villas
            </h1>
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
          </div>

          {/* Search bar compacto */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search villas..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
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

      {/* Modal de filtros MOBILE - pantalla completa optimizada */}
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

            {/* Destination */}
            <div>
              <label className="block text-sm font-medium mb-2">Destination</label>
              <select
                value={selectedDestination}
                onChange={(e) => onSelectDestination(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">All Destinations</option>
                {destinations.map((dest) => (
                  <option key={dest} value={dest}>
                    {dest}
                  </option>
                ))}
              </select>
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
                {[...topBadges, ...extraBadges].map(renderBadge)}
              </div>
            </div>
          </div>

          {/* Footer fijo con botones */}
          <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 flex gap-3">
            {hasActiveFilters && onClearAllFilters && (
              <button
                onClick={() => {
                  onClearAllFilters();
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

      {/* Modal fechas DESKTOP */}
      {showDatePicker && (
        <div className="hidden md:flex fixed inset-0 bg-black/50 items-center justify-center z-[60]">
          <div className="bg-background p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Select dates</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Check-in
                </label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Check-out
                </label>
                <input
                  type="date"
                  value={checkOut}
                  min={checkIn || undefined}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDatePicker(false)}
                  className="px-4 py-2 text-sm border border-input rounded-md hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setShowDatePicker(false)}
                  className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal bedrooms DESKTOP */}
      {showBedroomsPicker && (
        <div className="hidden md:flex fixed inset-0 bg-black/50 items-center justify-center z-[60]">
          <div className="bg-background p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Number of bedrooms</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Bedrooms</span>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setTempBedrooms((prev) => Math.max(0, prev - 1))
                    }
                    className="w-8 h-8 rounded-full border border-input flex items-center justify-center hover:bg-muted transition-colors"
                  >
                    –
                  </button>

                  <span className="w-8 text-center">
                    {tempBedrooms === 0 ? "Any" : tempBedrooms >= 5 ? "5+" : tempBedrooms}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setTempBedrooms((prev) => Math.min(6, prev + 1))
                    }
                    className="w-8 h-8 rounded-full border border-input flex items-center justify-center hover:bg-muted transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                0 = Any · 1–4 = exact match · 5+ = villas with 5 or more bedrooms
              </p>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBedroomsPicker(false)}
                  className="px-4 py-2 text-sm border border-input rounded-md hover:bg-muted transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleApplyBedrooms}
                  className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}