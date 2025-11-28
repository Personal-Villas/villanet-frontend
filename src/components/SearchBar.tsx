import { useMemo, useState } from "react";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Shield,
  Waves,
  Eye,
  ChefHat,
  UtensilsCrossed,
  Star,
  DollarSign,
  MapPin,
  Bed,
  type LucideIcon,
} from "lucide-react";

/**
 * Badge real del CRUD.
 * Ajustá/extendé si tu API trae más campos.
 */
export type CrudBadge = {
  id: string;
  name: string;         // ej "Chef Included"
  slug: string;         // ej "chef" - ✅ AHORA OBLIGATORIO
  icon?: string | null; // ej "chef-hat" / "waves" / etc
  sort_order?: number | null;
  is_quick?: boolean | null; // si no existe, no pasa nada
};

type PropertiesHeaderProps = {
  itemsCount: number;
  location: string;
  sortBy: string;
  setSortBy: (sort: string) => void;

  // 🔍 Búsqueda por texto / destino
  query: string;
  setQuery: (value: string) => void;

  // badges reales
  badges: CrudBadge[];
  selectedBadges: string[]; // ✅ contiene SLUGS, no IDs
  onBadgeToggle: (badgeSlug: string) => void; // ✅ recibe SLUG

  checkIn: string;
  setCheckIn: (date: string) => void;
  checkOut: string;
  setCheckOut: (date: string) => void;

  // 🔢 Filtro por bedrooms (array que usa el backend)
  bedrooms: string[];
  setBedrooms: (value: string[]) => void;

  // ✅ NUEVO: Botón clear all filters
  onClearAllFilters?: () => void;
};

// Mapea slugs/icon strings de tu CRUD a íconos lucide
const ICON_MAP: Record<string, LucideIcon> = {
  chef: ChefHat,
  "chef-hat": ChefHat,
  cook: UtensilsCrossed,
  "cook-included": UtensilsCrossed,
  beach: Waves,
  waves: Waves,
  beachfront: Waves,
  "true-beach-front": Waves,
  ocean: Eye,
  "ocean-view": Eye,
  "ocean-front": Waves,
  verified: Shield,
  shield: Shield,
  star: Star,
  price: DollarSign,
  location: MapPin,
  default: Sparkles,
};

// Formatea el texto de fechas para el header
const formatDates = (checkIn: string, checkOut: string): string => {
  if (!checkIn && !checkOut) return "Add dates";
  if (checkIn && !checkOut) return "Select checkout";
  return `${checkIn} – ${checkOut}`;
};

// Inicializa el número temporal de bedrooms a partir del array actual
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
  badges,
  selectedBadges,
  onBadgeToggle,
  checkIn,
  setCheckIn,
  checkOut,
  setCheckOut,
  bedrooms,
  setBedrooms,
  onClearAllFilters, // ✅ NUEVO
}: PropertiesHeaderProps) {
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showBedroomsPicker, setShowBedroomsPicker] = useState(false);

  // estado temporal para el modal de bedrooms
  const [tempBedrooms, setTempBedrooms] = useState<number>(
    deriveInitialBedroomsCount(bedrooms)
  );

  const datesLabel = formatDates(checkIn, checkOut);

  const bedroomsLabel =
    bedrooms.length === 0
      ? "Bedrooms"
      : bedrooms.includes("5+")
      ? "5+ BR"
      : `${bedrooms.join(", ")} BR`;

  // ✅ NUEVO: Calcular si hay filtros activos
  const hasActiveFilters =
    query.trim().length > 0 ||
    !!checkIn ||
    !!checkOut ||
    bedrooms.length > 0 ||
    selectedBadges.length > 0 ||
    sortBy !== "rank";

  // Debug: ver qué badges y selecciones estamos recibiendo
  console.log("🔍 PropertiesHeader Debug:", {
    badgesCount: badges.length,
    badges: badges.map((b) => ({ id: b.id, slug: b.slug, name: b.name })),
    selectedBadges,
    selectedBadgesCount: selectedBadges.length,
    bedrooms,
    hasActiveFilters, // ✅ NUEVO: debug
  });

  // ---- split badges: top row vs extra row ----
  const { topBadges, extraBadges } = useMemo(() => {
    if (!badges || badges.length === 0) {
      return { topBadges: [] as CrudBadge[], extraBadges: [] as CrudBadge[] };
    }

    // Orden fuerte por sort_order si existe
    const sorted = [...badges].sort((a, b) => {
      const ao = a.sort_order ?? 9999;
      const bo = b.sort_order ?? 9999;
      return ao - bo;
    });

    // Si usás is_quick en tu CRUD, lo aprovechamos:
    const quick = sorted.filter((b) => b.is_quick);
    const rest = sorted.filter((b) => !b.is_quick);

    // Si no hay quick definidos, tomamos primeros 4
    const top = quick.length > 0 ? quick.slice(0, 4) : sorted.slice(0, 4);

    // Extra = todo lo que no esté en top
    const topIds = new Set(top.map((b) => b.id));
    const extra = sorted.filter((b) => !topIds.has(b.id));

    return { topBadges: top, extraBadges: rest.length ? extra : [] };
  }, [badges]);

  const resolveIcon = (badge: CrudBadge): LucideIcon => {
    const key = (badge.icon || badge.slug || badge.name || "default")
      .toString()
      .toLowerCase()
      .replace(/\s+/g, "-");

    return ICON_MAP[key] || ICON_MAP.default;
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
        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 active:scale-95 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border-2 ${
          isSelected
            ? "bg-neutral-200 text-neutral-900 border-neutral-400" // ✅ CORREGIDO: gris seleccionado
            : "bg-background text-foreground border-[hsl(0,0%,82%)] hover:border-[hsl(0,0%,64%)]"
        }`}
      >
        <Icon className="h-3.5 w-3.5" />
        <span>{badge.name}</span>
      </button>
    );
  };

  const handleApplyBedrooms = () => {
    let next: string[] = [];

    if (tempBedrooms <= 0) {
      next = [];
    } else if (tempBedrooms >= 5) {
      next = ["5+"]; // 👈 usa la lógica que ya maneja tu backend
    } else {
      next = [String(tempBedrooms)];
    }

    console.log("✅ Applying bedrooms filter:", { tempBedrooms, next });
    setBedrooms(next);
    setShowBedroomsPicker(false);
  };

  return (
    <div className="sticky top-16 z-40 bg-background border-b border-border">
      <div className="container mx-auto px-6 py-4 space-y-4">
        {/* Línea de título + fechas + bedrooms */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <h1 className="text-lg md:text-xl font-semibold text-foreground">
                {itemsCount} Villas in {location}
              </h1>

              <span className="text-muted-foreground">•</span>

              {/* Selector de fechas */}
              <button
                type="button"
                onClick={() => setShowDatePicker(true)}
                className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Calendar className="w-4 h-4" />
                <span>{datesLabel}</span>
              </button>

              <span className="text-muted-foreground">•</span>

              {/* Selector de bedrooms */}
              <button
                type="button"
                onClick={() => setShowBedroomsPicker(true)}
                className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Bed className="w-4 h-4" />
                <span>{bedroomsLabel}</span>
              </button>
            </div>

            {/* 🔍 Input de destino / lugar */}
            <div className="flex items-center gap-2 max-w-md px-3 py-2 rounded-lg border border-input bg-background">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by destination, city or villa name…"
                className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* ✅ CORREGIDO: Sort + Clear all filters */}
          <div className="flex items-center gap-3">
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

            {/* ✅ NUEVO: Botón Clear all filters */}
            {onClearAllFilters && hasActiveFilters && (
              <button
                type="button"
                onClick={onClearAllFilters}
                className="px-3 py-1.5 rounded-full border border-[hsl(0,0%,82%)] text-xs md:text-sm text-muted-foreground hover:border-[hsl(0,0%,64%)] hover:text-foreground transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>

        {/* Filtros rápidos */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
            <div className="flex items-center gap-2 flex-nowrap md:flex-wrap">
              {topBadges.map(renderBadge)}

              {/* More Filters */}
              {extraBadges.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowMoreFilters((p) => !p)}
                  aria-expanded={showMoreFilters}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium bg-background text-foreground border-2 border-[hsl(0,0%,82%)] hover:border-[hsl(0,0%,64%)] transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <span>+ More Filters</span>
                  {showMoreFilters ? (
                    <ChevronUp className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                </button>
              )}
            </div>
          </div>

          {showMoreFilters && extraBadges.length > 0 && (
            <div className="flex gap-2 flex-wrap animate-in fade-in duration-300">
              {extraBadges.map(renderBadge)}
            </div>
          )}
        </div>
      </div>

      {/* Modal fechas */}
      {showDatePicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
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

      {/* Modal bedrooms */}
      {showBedroomsPicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
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
    </div>
  );
}