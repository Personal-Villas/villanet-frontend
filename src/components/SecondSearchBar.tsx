import { useMemo, useState, useEffect, useRef } from "react";
import {
  //Bath,
  Calendar,
  DollarSign,
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
  Bed,
  Flag,
  Dumbbell,
  Film,
  CircleDot,
  Car,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import CartButton from "./CartButton";
import { CurrencySelector } from "./CurrencySelector";
import { type SupportedCurrency } from "../hooks/useCurrency";

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
  onApplyFilters?: (overrides?: Record<string, unknown>) => void;
  query: string;
  setQuery?: (value: string) => void;

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

  //bathrooms: string[];
  //setBathrooms: (value: string[]) => void;

  // ✅ AGREGADOS: Price range
  minPrice: string;
  setMinPrice: (value: string) => void;

  maxPrice: string;
  setMaxPrice: (value: string) => void;

  // Budget total (modo quote) — tiene prioridad sobre maxPrice cuando isQuoteMode=true
  maxTotalBudget?: string;
  setMaxTotalBudget?: (value: string) => void;
  isQuoteMode?: boolean; // true cuando el usuario llegó desde el wizard con un quote activo

  guests?: number;
  setGuests?: (value: number) => void;

  onClearAllFilters?: () => void;
  onEditQuote?: () => void;
  cartCount?: number;
  onCartClick?: () => void;

  //Currency display
  currency?: SupportedCurrency;
  onCurrencyChange?: (c: SupportedCurrency) => void;
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

const formatDates = (checkIn: string, checkOut: string): string => {
  if (!checkIn && !checkOut) return "Add dates";
  if (checkIn && !checkOut) return "Select checkout";

  const formatDate = (dateStr: string) => {
    const date = parseISODateLocal(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return `${formatDate(checkIn)} – ${formatDate(checkOut)}`;
};

// Helper para formatear fecha a YYYY-MM-DD en hora local
const toISODateLocal = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

// Lista de destinos por región
const CARIBBEAN_DESTINATIONS = [
  "St. Barts",
  "Turks & Caicos",
  "St. Martin / St. Maarten",
  "Barbados",
  "Jamaica",
  "British Virgin Islands",
  "Casa de Campo, Dominican Republic",
  "Punta Cana, Dominican Republic",
  "Cap Cana, Dominican Republic",
  "Cayman Islands",
  "Bahamas",
  "Anguilla",
];

const MEXICO_DESTINATIONS = ["Punta Mita, Mexico", "Puerto Vallarta, Mexico", "Riviera Maya, Mexico", "Zihuatanejo, Mexico"];

const CENTRAL_AMERICA_DESTINATIONS = ["Costa Rica"];

const EUROPE_DESTINATIONS = ["Greece"];

const parseISODateLocal = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};

// Agrupa destinos por región (sin falsos positivos por palabras sueltas como "punta")
const groupDestinationsByRegion = (
  destinations: string[]
): { caribbean: string[]; mexico: string[]; centralAmerica: string[]; europe: string[] } => {
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
  const centralAmericaResults: Set<string> = new Set();
  const europeResults: Set<string> = new Set();

  // Para ordenar bien aunque el destino venga como "Punta Mita, Mexico"
  const caribbeanOrder = new Map(
    CARIBBEAN_DESTINATIONS.map((d, i) => [normalizeString(d), i] as const)
  );
  const mexicoOrder = new Map(
    MEXICO_DESTINATIONS.map((d, i) => [normalizeString(d), i] as const)
  );
  const centralAmericaOrder = new Map(
    CENTRAL_AMERICA_DESTINATIONS.map((d, i) => [normalizeString(d), i] as const)
  );
  const europeOrder = new Map(
    EUROPE_DESTINATIONS.map((d, i) => [normalizeString(d), i] as const)
  );

  // 1) Regla por país/región (si el texto trae el país, esto es lo más fiable)
  for (const { original, normalized } of normalizedDestinations) {
    if (/\bmexico\b/.test(normalized)) {
      mexicoResults.add(original);
      continue;
    }
    if (/\bcosta rica\b/.test(normalized)) {
      centralAmericaResults.add(original);
      continue;
    }
    if (/\bgreece\b/.test(normalized)) {
      europeResults.add(original);
      continue;
    }
    // sumá acá países del Caribe si te llegan así en el string:
    if (
      /\bdominican republic\b/.test(normalized) ||
      /\bturks\b/.test(normalized) ||
      /\bcaicos\b/.test(normalized) ||
      /\bbarbados\b/.test(normalized) ||
      /\bjamaica\b/.test(normalized) ||
      /\bbritish virgin islands\b/.test(normalized) ||
      /\bst barts\b/.test(normalized) ||
      /\bst martin\b/.test(normalized) ||
      /\banguilla\b/.test(normalized) ||
      /\bcayman\b/.test(normalized) ||
      /\bbahamas\b/.test(normalized)
    ) {
      caribbeanResults.add(original);
      continue;
    }
  }

  // 2) Match por frase completa (NO por palabras sueltas)
  const allSets = [caribbeanResults, mexicoResults, centralAmericaResults, europeResults];

  const matchByRefList = (
    refList: string[],
    results: Set<string>
  ) => {
    refList.forEach((refDest) => {
      const normalizedRef = normalizeString(refDest);

      normalizedDestinations.forEach(({ original, normalized }) => {
        // si ya lo clasificó en otro grupo, no lo pises
        if (allSets.some(s => s !== results && s.has(original))) return;

        // Match seguro: "punta mita mexico" incluye "punta mita"
        // o caso al revés si viene corto
        if (normalized.includes(normalizedRef) || normalizedRef.includes(normalized)) {
          results.add(original);
        }
      });
    });
  };

  matchByRefList(CARIBBEAN_DESTINATIONS, caribbeanResults);
  matchByRefList(MEXICO_DESTINATIONS, mexicoResults);
  matchByRefList(CENTRAL_AMERICA_DESTINATIONS, centralAmericaResults);
  matchByRefList(EUROPE_DESTINATIONS, europeResults);

  // 3) Orden: primero según lista base si matchea, sino alfabético
  const sortWithOrder = (orderMap: Map<string, number>) => (a: string, b: string) => {
    const na = normalizeString(a);
    const nb = normalizeString(b);

    // buscamos si contiene alguna key del orderMap (por ejemplo "punta mita")
    const aKey = Array.from(orderMap.keys()).find((k) => na.includes(k)) ?? null;
    const bKey = Array.from(orderMap.keys()).find((k) => nb.includes(k)) ?? null;

    const ao = aKey ? orderMap.get(aKey)! : 9999;
    const bo = bKey ? orderMap.get(bKey)! : 9999;

    if (ao !== bo) return ao - bo;
    return a.localeCompare(b);
  };

  const caribbean    = Array.from(caribbeanResults).sort(sortWithOrder(caribbeanOrder));
  const mexico       = Array.from(mexicoResults).sort(sortWithOrder(mexicoOrder));
  const centralAmerica = Array.from(centralAmericaResults).sort(sortWithOrder(centralAmericaOrder));
  const europe       = Array.from(europeResults).sort(sortWithOrder(europeOrder));

  return { caribbean, mexico, centralAmerica, europe };
};

// ✅ Helper para bedrooms
const deriveInitialBedroomsCount = (bedrooms: string[]): number => {
  if (!bedrooms || bedrooms.length === 0) return 0;
  if (bedrooms.includes("12+")) return 12;
  const numeric = bedrooms
    .map((v) => parseInt(v, 10))
    .filter((n) => !Number.isNaN(n));
  if (numeric.length === 0) return 0;
  return numeric[0];
};

// ✅ Helper para bathrooms
/*const deriveInitialBathroomsCount = (bathrooms: string[]): number => {
  if (!bathrooms || bathrooms.length === 0) return 0;
  if (bathrooms.includes("12+")) return 12;
  const numeric = bathrooms
    .map((v) => parseInt(v, 10))
    .filter((n) => !Number.isNaN(n));
  if (numeric.length === 0) return 0;
  return numeric[0];
};*/

// ESTILOS GUESTY PERSONALIZADOS - EXACTOS
const guestyCalendarStyles = `
  .guesty-calendar {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  }
  
  .guesty-calendar * {
    box-sizing: border-box;
  }
  
  .guesty-calendar button {
    margin: 0; padding: 0; border: none; background: none;
    cursor: pointer; font-family: inherit;
  }
  
  .guesty-calendar table {
    border-collapse: collapse;
    border-spacing: 0;
    width: 100%;
  }
  
  .guesty-months { display: flex; gap: 2rem; }
  .guesty-month { flex: 1; min-width: 280px; }
  
  .guesty-caption {
    display: flex; justify-content: center; align-items: center;
    position: relative; margin-bottom: 1rem; padding: 0.5rem 0;
  }
  
  .guesty-caption-label { font-size: 0.875rem; font-weight: 600; color: hsl(0, 0%, 9%); }
  
  .guesty-nav { position: absolute; right: 0; display: flex; gap: 0.25rem; }
  
  .guesty-nav-button {
    width: 2rem; height: 2rem; display: flex; align-items: center;
    justify-content: center; border-radius: 0.375rem;
    border: 1px solid hsl(0, 0%, 89.8%); transition: all 0.15s;
  }
  
  .guesty-nav-button:hover { background-color: hsl(0, 0%, 96.1%); }
  
  .guesty-table { width: 100%; table-layout: fixed; }
  
  .guesty-head-row { display: table-row; }
  
  .guesty-head-cell {
    text-align: center; font-size: 0.75rem;
    font-weight: 500; color: hsl(0, 0%, 45.1%); 
    padding: 0.5rem 0;
    width: 14.285%;
  }
  
  .guesty-tbody { display: table-row-group; }
  
  .guesty-row { 
    display: table-row;
    height: 2.5rem;
  }

  /* CONTENEDOR DE LA CELDA */
  .guesty-cell {
    display: table-cell;
    position: relative;
    text-align: center;
    vertical-align: middle;
    padding: 0;
  }
  
  /* LA BARRA DE COLOR (Pseudo-elemento común) */
  .guesty-cell-range-middle::before,
  .guesty-cell-range-start::before,
  .guesty-cell-range-end::before {
    content: '';
    position: absolute;
    top: 50%;
    height: 2.2rem;
    transform: translateY(-50%);
    background-color: hsl(0, 0%, 6.7%);
    z-index: 0;
    pointer-events: none;
  }

  /* BARRA INTERMEDIA: Ocupa todo el ancho */
  .guesty-cell-range-middle::before {
    left: 0;
    right: 0;
  }
  
  /* DÍA DE INICIO (Check-in): La barra empieza con diagonal */
  .guesty-cell-range-start::before {
    left: 0;
    right: 0;
    clip-path: polygon(0.8rem 0%, 100% 0%, 100% 100%, 0% 100%);
  }
  
  /* DÍA FINAL (Check-out): La barra termina con diagonal */
  .guesty-cell-range-end::before {
    left: 0;
    right: 0;
    clip-path: polygon(0% 0%, 100% 0%, calc(100% - 0.8rem) 100%, 0% 100%);
  }
  
  /* EL BOTÓN DEL DÍA */
  .guesty-day {
    position: relative;
    z-index: 1;
    width: 2.2rem;
    height: 2.2rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 0.875rem;
    transition: all 0.15s;
    color: hsl(0, 0%, 9%);
    background-color: transparent;
  }
  
  /* Día seleccionado (Check-in / Check-out) - CON círculo */
  .guesty-day-selected {
    background-color: hsl(0, 0%, 6.7%);
    color: white;
    font-weight: 600;
    border-radius: 50%;
  }
  
  /* Día en el medio del rango (Solo texto blanco, SIN círculo) */
  .guesty-day-range-middle {
    background-color: transparent;
    color: white;
    border-radius: 0;
  }

  .guesty-day-today:not(.guesty-day-selected):not(.guesty-day-range-middle) {
    background-color: hsl(0, 0%, 96.1%);
    font-weight: 600;
    border-radius: 50%;
  }
  
  .guesty-day:hover:not(:disabled):not(.guesty-day-selected) {
    background-color: hsl(0, 0%, 96.1%);
    border-radius: 50%;
  }
  
  .guesty-day:disabled { 
    opacity: 0.3; 
    cursor: not-allowed; 
  }
  
  .guesty-day-outside { 
    color: hsl(0, 0%, 70%); 
  }
`;

// Componente personalizado de calendario estilo Guesty
const GuestyCalendar = ({
  selected,
  onSelect,
  numberOfMonths = 2
}: {
  selected: { from?: Date; to?: Date } | undefined;
  onSelect: (range: { from?: Date; to?: Date } | undefined) => void;
  numberOfMonths?: number;
}) => {

  // Fecha actual normalizada
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Mes mínimo permitido
  const minMonth = useMemo(() => {
    return new Date(today.getFullYear(), today.getMonth(), 1);
  }, [today]);

  // Mes actualmente visible
  const [currentMonth, setCurrentMonth] = useState<Date>(
    selected?.from
      ? new Date(selected.from.getFullYear(), selected.from.getMonth(), 1)
      : minMonth
  );

  // Mantener el mes del check-in visible
  useEffect(() => {
  if (selected?.from) {
    setCurrentMonth(
      new Date(selected.from.getFullYear(), selected.from.getMonth(), 1)
    );
  }
}, [selected?.from?.getTime()]); 

  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Generar datos del mes
  const getMonthData = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const weeks: (Date | null)[][] = [];
    let currentWeek: (Date | null)[] = [];

    // Días previos del mes anterior
    for (let i = 0; i < startingDayOfWeek; i++) {
      currentWeek.push(null);
    }

    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      currentWeek.push(new Date(year, month, day));
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    // Completar última semana
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }

    return { weeks, month, year };
  };

  // Helpers de fechas
  const isSameDay = (d1: Date, d2: Date) =>
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear();

  const isToday = (day: Date) => isSameDay(day, today);

  const isBeforeToday = (day: Date) => day < today;

  const isDayRangeStart = (day: Date) =>
    !!selected?.from && isSameDay(day, selected.from);

  const isDayRangeEnd = (day: Date) =>
    !!selected?.to && isSameDay(day, selected.to);

  const isDayRangeMiddle = (day: Date) =>
    !!selected?.from &&
    !!selected?.to &&
    day > selected.from &&
    day < selected.to;

  const MIN_NIGHTS = 2;

  // Calcula si un día sería un checkout válido (mínimo MIN_NIGHTS noches después del checkIn)
  const isValidCheckout = (day: Date): boolean => {
    if (!selected?.from || selected.to) return true;
    const minCheckout = new Date(selected.from);
    minCheckout.setDate(minCheckout.getDate() + MIN_NIGHTS);
    return day >= minCheckout;
  };

  // Click en día
  const handleDayClick = (day: Date) => {
    if (isBeforeToday(day)) return;

    setCurrentMonth(new Date(day.getFullYear(), day.getMonth(), 1));

    if (!selected?.from || selected.to) {
      // Seleccionando check-in
      onSelect({ from: day, to: undefined });
    } else if (day < selected.from) {
      // Click antes del check-in → nuevo check-in
      onSelect({ from: day, to: undefined });
    } else if (day.getTime() === selected.from.getTime()) {
      // Click en el mismo día → limpiar
      onSelect({ from: day, to: undefined });
    } else if (!isValidCheckout(day)) {
      // Checkout demasiado cercano → reubicar check-in al día clickeado
      onSelect({ from: day, to: undefined });
    } else {
      onSelect({ from: selected.from, to: day });
    }
  };

  // Navegación de meses
  const goToPreviousMonth = () => {
    const prevMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() - 1,
      1
    );

    if (prevMonth >= minMonth) {
      setCurrentMonth(prevMonth);
    }
  };

  const goToNextMonth = () => {
    setCurrentMonth(
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        1
      )
    );
  };

  const isPrevDisabled =
    currentMonth.getFullYear() === minMonth.getFullYear() &&
    currentMonth.getMonth() === minMonth.getMonth();

  // Render de meses
  const months = [];
  for (let i = 0; i < numberOfMonths; i++) {
    months.push(
      getMonthData(
        new Date(
          currentMonth.getFullYear(),
          currentMonth.getMonth() + i,
          1
        )
      )
    );
  }



  return (
    <>
      <style>{guestyCalendarStyles}</style>

      <div className="guesty-calendar">
        <div className="guesty-months">
          {months.map((monthData, monthIndex) => (
            <div key={monthIndex} className="guesty-month">
              <div className="guesty-caption">
                <div className="guesty-caption-label">
                  {new Date(monthData.year, monthData.month).toLocaleDateString(
                    'en-US',
                    { month: 'long', year: 'numeric' }
                  )}
                </div>

                {monthIndex === months.length - 1 && (
                  <div className="guesty-nav">
                    <button
                      type="button"
                      className="guesty-nav-button disabled:opacity-30"
                      onClick={goToPreviousMonth}
                      disabled={isPrevDisabled}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      className="guesty-nav-button"
                      onClick={goToNextMonth}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <table className="guesty-table">
                <thead>
                  <tr className="guesty-head-row">
                    {daysOfWeek.map(day => (
                      <th key={day} className="guesty-head-cell">{day}</th>
                    ))}
                  </tr>
                </thead>

                <tbody className="guesty-tbody">
                  {monthData.weeks.map((week, weekIndex) => (
                    <tr key={weekIndex} className="guesty-row">
                      {week.map((day, dayIndex) => {
                        if (!day) {
                          return <td key={dayIndex} className="guesty-cell" />;
                        }

                        // Deshabilitar días que no cumplen el mínimo de noches
                        const tooCloseForCheckout =
                          !!selected?.from &&
                          !selected.to &&
                          !isValidCheckout(day) &&
                          day > selected.from;

                        const isDisabled =
                          day.getMonth() !== monthData.month ||
                          isBeforeToday(day) ||
                          tooCloseForCheckout;

                        let cellClass = 'guesty-cell';
                        if (isDayRangeMiddle(day)) cellClass += ' guesty-cell-range-middle';
                        if (isDayRangeStart(day)) cellClass += ' guesty-cell-range-start';
                        if (isDayRangeEnd(day)) cellClass += ' guesty-cell-range-end';

                        let dayClass = 'guesty-day';
                        if (isDayRangeStart(day) || isDayRangeEnd(day)) dayClass += ' guesty-day-selected';
                        if (isDayRangeMiddle(day)) dayClass += ' guesty-day-range-middle';
                        if (isToday(day) && !isDayRangeStart(day)) dayClass += ' guesty-day-today';
                        if (isDisabled) dayClass += ' opacity-40 cursor-not-allowed';

                        return (
                          <td key={dayIndex} className={cellClass}>
                            <button
                              type="button"
                              className={dayClass}
                              disabled={isDisabled}
                              onClick={() => !isDisabled && handleDayClick(day)}
                            >
                              {day.getDate()}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default function PropertiesHeaderCompact({
  itemsCount,
  location,
  sortBy,
  setSortBy,
  onApplyFilters,
  query,
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
  //bathrooms,
  //setBathrooms,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  maxTotalBudget = '',
  setMaxTotalBudget,
  isQuoteMode = false,
  guests = 0,
  setGuests,
  onClearAllFilters,
  onEditQuote,
  cartCount,
  onCartClick,
  currency = 'USD',
  onCurrencyChange,
}: PropertiesHeaderCompactProps) {
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showAllBadges, setShowAllBadges] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGuestSelector, setShowGuestSelector] = useState(false);
  const [showBedroomsSelector, setShowBedroomsSelector] = useState(false);
  //const [showBathroomsSelector, setShowBathroomsSelector] = useState(false);
  const [showPriceSelector, setShowPriceSelector] = useState(false);

  const [uiError, setUiError] = useState<string | null>(null);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const guestSelectorRef = useRef<HTMLDivElement>(null);
  const bedroomsSelectorRef = useRef<HTMLDivElement>(null);
  //const bathroomsSelectorRef = useRef<HTMLDivElement>(null);
  const priceSelectorRef = useRef<HTMLDivElement>(null);

  const [localGuestsForModal, setLocalGuestsForModal] = useState(guests && guests > 0 ? guests : 1);
  const [localMinPrice, setLocalMinPrice] = useState(minPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);
  const [localMaxTotalBudget, setLocalMaxTotalBudget] = useState(maxTotalBudget);

  const guestsLabel = guests && guests > 0 ? `${guests} Guests` : 'Guests';
  const datesLabel = formatDates(checkIn, checkOut);

  const bedroomsLabel =
    bedrooms.length === 0 ? "Bedrooms" :
      bedrooms.includes("12+") ? "12+ Bedrooms" :
        `${bedrooms[0]} Bedrooms`;

  // ✅ Labels para bathrooms y price
  /*const bathroomsLabel =
    bathrooms.length === 0 ? "Bathrooms" :
      bathrooms.includes("12+") ? "12+ Bathrooms" :
        `${bathrooms[0]} Bathrooms`;
*/
  const priceLabel = isQuoteMode
    ? (!maxTotalBudget ? 'Budget' : `Up to $${Number(maxTotalBudget).toLocaleString()}`)
    : (!minPrice && !maxPrice ? "Price" :
      minPrice && !maxPrice ? `$${Number(minPrice).toLocaleString()}+` :
        !minPrice && maxPrice ? `Up to $${Number(maxPrice).toLocaleString()}` :
          `$${Number(minPrice).toLocaleString()} - $${Number(maxPrice).toLocaleString()}`);

  const { caribbean, mexico, centralAmerica, europe } = useMemo(
    () => groupDestinationsByRegion(destinations),
    [destinations]
  );

  const handleRangeSelect = (range: { from?: Date; to?: Date } | undefined) => {
    setUiError(null);

    if (!range) {
      setCheckIn("");
      setCheckOut("");
      return;
    }

    const { from, to } = range;

    if (from && !to) {
      setCheckIn(toISODateLocal(from));
      setCheckOut("");
      return;
    }

    if (from && to) {
      if (to.getTime() === from.getTime()) {
        setCheckIn(toISODateLocal(from));
        setCheckOut("");
        return;
      }

      if (to < from) {
        setCheckIn(toISODateLocal(to));
        setCheckOut(toISODateLocal(from));
        return;
      }

      setCheckIn(toISODateLocal(from));
      setCheckOut(toISODateLocal(to));
    }
  };

  useEffect(() => {
    if (checkIn && checkOut && parseISODateLocal(checkOut) <= parseISODateLocal(checkIn)) {
      setCheckOut("");
      setUiError("Check-out must be after check-in");
    } else {
      setUiError(null);
    }
  }, [checkIn, checkOut, setCheckOut]);

  const validateBeforeSearch = (): boolean => {
    if (checkIn && checkOut && parseISODateLocal(checkOut) <= parseISODateLocal(checkIn)) {
      setUiError("Check-out must be after check-in");
      return false;
    }
    setUiError(null);
    return true;
  };

  const handleApplyDates = () => {
    if (validateBeforeSearch()) {
      setShowDatePicker(false);
      onApplyFilters?.();
    }
  };

  const handleApplyGuests = () => {
    setShowGuestSelector(false);
    onApplyFilters?.();
  };

  const handleApplyBedrooms = () => {
    setShowBedroomsSelector(false);
    onApplyFilters?.();
  };

  // ✅ Handlers para los nuevos selectores
  /*const handleApplyBathrooms = () => {
    setShowBathroomsSelector(false);
    onApplyFilters?.();
  };*/

  const handleApplyPrice = () => {
    if (isQuoteMode) {
      setMaxTotalBudget?.(localMaxTotalBudget);
      onApplyFilters?.({ maxTotalBudget: localMaxTotalBudget });
    } else {
      setMinPrice(localMinPrice);
      setMaxPrice(localMaxPrice);
      onApplyFilters?.({ minPrice: localMinPrice, maxPrice: localMaxPrice });
    }
    setShowPriceSelector(false);
  };

  const handleApplyAllFilters = () => {
    if (!validateBeforeSearch()) {
      return;
    }

    const overrides: Record<string, unknown> = {};

    if (setGuests) {
      setGuests(localGuestsForModal);
      overrides.guests = localGuestsForModal;
    }

    if (isQuoteMode) {
      setMaxTotalBudget?.(localMaxTotalBudget);
      overrides.maxTotalBudget = localMaxTotalBudget;
    }

    setShowMobileFilters(false);
    onApplyFilters?.(overrides);
  };

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      lastScrollY = window.scrollY;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          const shouldCollapse = lastScrollY > 100;

          if (shouldCollapse !== isCollapsed) {
            setIsCollapsed(shouldCollapse);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

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

  useEffect(() => {
    if (showMobileFilters) {
      setLocalGuestsForModal(guests && guests > 0 ? guests : 1);
    }
  }, [showMobileFilters, guests]);

  // Sync local price state when popover opens or when parent resets prices (e.g. Clear All)
  useEffect(() => {
    if (showPriceSelector) {
      setLocalMinPrice(minPrice);
      setLocalMaxPrice(maxPrice);
      setLocalMaxTotalBudget(maxTotalBudget);
    }
  }, [showPriceSelector]);

  // Keep local price in sync when parent clears prices externally
  useEffect(() => {
    setLocalMinPrice(minPrice);
    setLocalMaxPrice(maxPrice);
  }, [minPrice, maxPrice]);

  useEffect(() => {
    setLocalMaxTotalBudget(maxTotalBudget);
  }, [maxTotalBudget]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!window.matchMedia("(min-width: 768px)").matches) return;

      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target as Node)
      ) {
        setShowDatePicker(false);
      }
      if (
        guestSelectorRef.current &&
        !guestSelectorRef.current.contains(event.target as Node)
      ) {
        setShowGuestSelector(false);
      }
      if (
        bedroomsSelectorRef.current &&
        !bedroomsSelectorRef.current.contains(event.target as Node)
      ) {
        setShowBedroomsSelector(false);
      }
      // ✅ Click fuera para nuevos selectores
      /*if (
        bathroomsSelectorRef.current &&
        !bathroomsSelectorRef.current.contains(event.target as Node)
      ) {
        setShowBathroomsSelector(false);
      }*/
      if (
        priceSelectorRef.current &&
        !priceSelectorRef.current.contains(event.target as Node)
      ) {
        setShowPriceSelector(false);
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
    const slugKey = normalizeKey(badge.slug || "");
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
    const key = badge.slug || badge.id;
    const isSelected = selectedBadges.includes(key);

    return (
      <button
        key={key}
        onClick={() => onBadgeToggle(key)}
        role="button"
        aria-pressed={isSelected}
        aria-label={`Filter by ${badge.name}, ${isSelected ? "active" : "inactive"}`}
        className={`inline-flex items-center rounded-full font-medium transition-all duration-200 active:scale-95 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 px-2.5 py-1 text-xs gap-1 ${isSelected
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
    // selectedDestination may be a CSV of multiple destinations (e.g. "Jamaica,St. Barts")
    const selectedList = selectedDestination
      ? selectedDestination.split('|').map(s => s.trim()).filter(Boolean)
      : [];
    const isSelected = selectedList.includes(dest);

    const handleClick = () => {
      let next: string[];
      if (isSelected) {
        next = selectedList.filter(d => d !== dest);
      } else {
        next = [...selectedList, dest];
      }
      // Pass back as pipe-separated string (empty string = no filter)
      onSelectDestination(next.join('|'));
    };

    return (
      <button
        key={dest}
        onClick={handleClick}
        role="button"
        aria-pressed={isSelected}
        aria-label={`Filter by ${dest}, ${isSelected ? "active" : "inactive"}`}
        className={`inline-flex items-center rounded-full font-medium transition-all duration-200 active:scale-95 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 px-2.5 py-1 text-xs gap-1 ${isSelected
          ? "bg-[hsl(0,0%,6.7%)] text-white border-2 border-[hsl(0,0%,6.7%)] hover:bg-[hsl(0,0%,15%)]"
          : "bg-background text-foreground border-2 border-[hsl(0,0%,82%)] hover:border-[hsl(0,0%,64%)]"
          }`}
      >
        <span>{dest}</span>
        {isSelected && <X className="h-2.5 w-2.5 ml-0.5" />}
      </button>
    );
  };

  const selectedDestinationList = selectedDestination
    ? selectedDestination.split('|').map(s => s.trim()).filter(Boolean)
    : [];

  const hasActiveFilters =
    query?.trim().length > 0 ||
    selectedDestinationList.length > 0 ||
    !!checkIn ||
    !!checkOut ||
    bedrooms.length > 0 ||
    //bathrooms.length > 0 ||
    !!minPrice ||
    !!maxPrice ||
    selectedBadges.length > 0 ||
    sortBy !== "rank";

  const activeFiltersCount =
    (query?.trim().length > 0 ? 1 : 0) +
    (selectedDestinationList.length > 0 ? 1 : 0) +
    (checkIn || checkOut ? 1 : 0) +
    (bedrooms.length > 0 ? 1 : 0) +
    //(bathrooms.length > 0 ? 1 : 0) +
    (minPrice || maxPrice ? 1 : 0) +
    selectedBadges.length +
    (sortBy !== "rank" ? 1 : 0);

  // Date Picker para desktop
  const DatePickerDesktop = () => (
    <div
      ref={datePickerRef}
      className="absolute top-full left-0 mt-2 z-50 bg-background border border-border rounded-xl shadow-2xl p-4 w-auto"
    >
      {uiError && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{uiError}</p>
        </div>
      )}

      <GuestyCalendar
        selected={{
          from: checkIn ? parseISODateLocal(checkIn) : undefined,
          to: checkOut ? parseISODateLocal(checkOut) : undefined,
        }}
        onSelect={handleRangeSelect}
        numberOfMonths={2}
      />

      <div className="flex justify-end pt-3 border-t border-border mt-4">
        {(checkIn || checkOut) && (
          <button
            type="button"
            onClick={() => handleRangeSelect(undefined)}
            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear Dates
          </button>
        )}
        <button
          onClick={handleApplyDates}
          className="px-4 py-2 text-sm bg-[hsl(0,0%,6.7%)] text-white rounded-lg hover:bg-[hsl(0,0%,15%)] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!!uiError}
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
              onClick={() => setGuests && setGuests(Math.max(0, currentGuests - 1))}
              className="w-8 h-8 rounded-full border border-input flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentGuests <= 0}
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
        <p className="text-xs text-muted-foreground mt-3 text-center">
          {currentGuests === 0
            ? "No guest limit"
            : currentGuests === 1
              ? "1 guest"
              : `${currentGuests} guests`
          }
        </p>
        <div className="flex justify-end pt-3 border-t border-border mt-4">
          <button
            onClick={handleApplyGuests}
            className="px-4 py-2 text-sm bg-[hsl(0,0%,6.7%)] text-white rounded-lg hover:bg-[hsl(0,0%,15%)] transition-colors font-medium"
          >
            Apply Guests
          </button>
        </div>
      </div>
    );
  };

  // Bedrooms Selector para desktop
  const BedroomsSelectorDesktop = () => {
    const current = deriveInitialBedroomsCount(bedrooms);
    return (
      <div
        ref={bedroomsSelectorRef}
        className="absolute top-full left-0 mt-2 z-50 bg-background border border-border rounded-xl shadow-2xl p-5 w-auto"
      >
        <h3 className="font-medium text-sm mb-4">Bedrooms required</h3>

        <div className="flex items-center justify-between p-3 border border-input rounded-lg">
          <span className="text-sm mr-2">Bedrooms</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                const newVal = Math.max(0, current - 1);
                if (newVal === 0) setBedrooms([]);
                else if (newVal >= 12) setBedrooms(["12+"]);
                else setBedrooms([String(newVal)]);
              }}
              className="w-8 h-8 rounded-full border border-input flex items-center justify-center hover:bg-muted transition-colors"
            >
              –
            </button>

            <span className="w-12 text-center font-semibold">
              {current === 0 ? "Any" : current >= 12 ? "12+" : current}
            </span>

            <button
              type="button"
              onClick={() => {
                const newVal = Math.min(13, current + 1);
                if (newVal >= 12) setBedrooms(["12+"]);
                else setBedrooms([String(newVal)]);
              }}
              className="w-8 h-8 rounded-full border border-input flex items-center justify-center hover:bg-muted transition-colors"
            >
              +
            </button>
          </div>
        </div>
        <div className="flex justify-end pt-3 border-t border-border mt-4">
          <button
            onClick={
              handleApplyBedrooms}
            className="px-4 py-2 text-sm bg-[hsl(0,0%,6.7%)] text-white rounded-lg hover:bg-[hsl(0,0%,15%)] transition-colors font-medium"
          >
            Apply Bedrooms
          </button>
        </div>
      </div>
    );
  };

  // ✅ Bathrooms Selector para desktop
  /* const BathroomsSelectorDesktop = () => {
     const current = deriveInitialBathroomsCount(bathrooms);
     return (
       <div
         ref={bathroomsSelectorRef}
         className="absolute top-full left-0 mt-2 z-50 bg-background border border-border rounded-xl shadow-2xl p-5 w-auto"
       >
         <h3 className="font-medium text-sm mb-4">Bathrooms required</h3>
         <div className="flex items-center justify-between p-3 border border-input rounded-lg">
           <span className="text-sm mr-2">Bathrooms</span>
           <div className="flex items-center gap-3">
             <button
               type="button"
               onClick={() => {
                 const newVal = Math.max(0, current - 1);
                 if (newVal === 0) setBathrooms([]);
                 else if (newVal >= 12) setBathrooms(["12+"]);
                 else setBathrooms([String(newVal)]);
               }}
               className="w-8 h-8 rounded-full border border-input flex items-center justify-center hover:bg-muted transition-colors"
             >
               –
             </button>
             <span className="w-12 text-center font-semibold">
               {current === 0 ? "Any" : current >= 12 ? "12+" : current}
             </span>
             <button
               type="button"
               onClick={() => {
                 const newVal = Math.min(13, current + 1);
                 if (newVal >= 12) setBathrooms(["12+"]);
                 else setBathrooms([String(newVal)]);
               }}
               className="w-8 h-8 rounded-full border border-input flex items-center justify-center hover:bg-muted transition-colors"
             >
               +
             </button>
           </div>
         </div>
         <div className="flex justify-end pt-3 border-t border-border mt-4">
           <button
             onClick={handleApplyBathrooms}
             className="px-4 py-2 text-sm bg-[hsl(0,0%,6.7%)] text-white rounded-lg hover:bg-[hsl(0,0%,15%)] transition-colors font-medium"
           >
             Apply Bathrooms
           </button>
         </div>
       </div>
     );
   };*/

  // ✅ Price Selector para desktop
  const PriceSelectorDesktop = (
    <div
      ref={priceSelectorRef}
      className="absolute top-full left-0 mt-2 z-50 bg-background border border-border rounded-xl shadow-2xl p-5 w-80"
    >
      {isQuoteMode ? (
        // Modo quote: solo max total budget
        <>
          <h3 className="font-medium text-sm mb-1">Total stay budget</h3>
          <p className="text-xs text-muted-foreground mb-4">Maximum total including all fees and taxes</p>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Max Budget</label>
            <input
              type="number"
              value={localMaxTotalBudget}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || parseFloat(value) >= 0) {
                  setLocalMaxTotalBudget(value);
                }
              }}
              placeholder="Any"
              className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              min="0"
              step="1000"
              autoFocus
            />
          </div>
          <div className="flex justify-between gap-2 pt-3 border-t border-border mt-4">
            <button
              onClick={() => setLocalMaxTotalBudget('')}
              className="px-3 py-2 text-sm border border-input rounded-lg hover:bg-muted transition-colors"
            >
              Clear
            </button>
            <button
              onClick={handleApplyPrice}
              className="px-4 py-2 text-sm bg-[hsl(0,0%,6.7%)] text-white rounded-lg hover:bg-[hsl(0,0%,15%)] transition-colors font-medium"
            >
              Apply Budget
            </button>
          </div>
        </>
      ) : (
        // Modo normal: rango min-max por noche
        <>
          <h3 className="font-medium text-sm mb-4">Price range (per night)</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Min Price</label>
              <input
                type="number"
                value={localMinPrice}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || parseFloat(value) >= 0) {
                    setLocalMinPrice(value);
                  }
                }}
                placeholder="$0"
                className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                min="0"
                step="100"
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Max Price</label>
              <input
                type="number"
                value={localMaxPrice}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || parseFloat(value) >= 0) {
                    setLocalMaxPrice(value);
                  }
                }}
                placeholder="Any"
                className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                min="0"
                step="100"
              />
            </div>
          </div>
          <div className="flex justify-between gap-2 pt-3 border-t border-border mt-4">
            <button
              onClick={() => {
                setLocalMinPrice('');
                setLocalMaxPrice('');
              }}
              className="px-3 py-2 text-sm border border-input rounded-lg hover:bg-muted transition-colors"
            >
              Clear
            </button>
            <button
              onClick={handleApplyPrice}
              className="px-4 py-2 text-sm bg-[hsl(0,0%,6.7%)] text-white rounded-lg hover:bg-[hsl(0,0%,15%)] transition-colors font-medium"
            >
              Apply Price
            </button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <>
      {/* DESKTOP */}
      <div className="hidden md:block sticky top-16 z-40 bg-background border-b border-border">
        <div className="h-[80px]">
          <div className="container mx-auto px-6 h-full flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm flex-wrap">
              <h1 className="text-xl font-semibold text-foreground flex items-baseline gap-1 min-w-0">
                <span className="whitespace-nowrap">{itemsCount} Villas in</span>
                <span className="truncate max-w-[260px]" title={location.replace(/\|/g, ', ')}>{location.replace(/\|/g, ', ')}</span>
              </h1>
              <span className="text-muted-foreground">•</span>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowDatePicker(!showDatePicker);
                    setShowGuestSelector(false);
                    setShowBedroomsSelector(false);
                    //setShowBathroomsSelector(false);
                    setShowPriceSelector(false);
                  }}
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  <span>{datesLabel}</span>
                </button>
                {showDatePicker && <DatePickerDesktop />}
              </div>

              <span className="text-muted-foreground">•</span>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowGuestSelector(!showGuestSelector);
                    setShowDatePicker(false);
                    setShowBedroomsSelector(false);
                    //setShowBathroomsSelector(false);
                    setShowPriceSelector(false);
                  }}
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Users className="w-4 h-4" />
                  <span>{guestsLabel}</span>
                </button>
                {showGuestSelector && <GuestSelectorDesktop />}
              </div>

              <span className="text-muted-foreground">•</span>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowBedroomsSelector(!showBedroomsSelector);
                    setShowGuestSelector(false);
                    setShowDatePicker(false);
                    //setShowBathroomsSelector(false);
                    setShowPriceSelector(false);
                  }}
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Bed className="w-4 h-4" />
                  <span>{bedroomsLabel}</span>
                </button>
                {showBedroomsSelector && <BedroomsSelectorDesktop />}
              </div>

              {
                <>
                  {/*
                  <span className="text-muted-foreground">•</span>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setShowBathroomsSelector(!showBathroomsSelector);
                        setShowGuestSelector(false);
                        setShowDatePicker(false);
                        setShowBedroomsSelector(false);
                        setShowPriceSelector(false);
                      }}
                      className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Bath className="w-4 h-4" />
                      <span>{bathroomsLabel}</span>
                    </button>
                    {showBathroomsSelector && <BathroomsSelectorDesktop />}
                  </div>

                  <span className="text-muted-foreground">•</span>
                  */}
                  <span className="text-muted-foreground">•</span>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPriceSelector(!showPriceSelector);
                        setShowGuestSelector(false);
                        setShowDatePicker(false);
                        setShowBedroomsSelector(false);
                        //setShowBathroomsSelector(false);
                      }}
                      className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <DollarSign className="w-4 h-4" />
                      <span>{priceLabel}</span>
                    </button>
                    {showPriceSelector && PriceSelectorDesktop}
                  </div>
                </>
              }
            </div>

            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                }}
                className="px-3 py-2 text-sm border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="rank">Sort: Villa Rank (High → Low)</option>
                <option value="price_low">Price (Low → High)</option>
                <option value="price_high">Price (High → Low)</option>
                <option value="bedrooms">Bedrooms (Most → Least)</option>
              </select>

              {onCurrencyChange && (
                <CurrencySelector
                  value={currency}
                  onChange={onCurrencyChange}
                  compact
                />
              )}

              <CartButton
                count={cartCount}
                onClick={onCartClick}
                variant="default"
                showLabel={true}
              />
            </div>
          </div>
        </div>

        <div
          className={`absolute top-full left-0 right-0 z-30 bg-background border-b border-border shadow-sm ${isCollapsed ? "pointer-events-none opacity-0" : "pointer-events-auto opacity-100"
            } transition-opacity duration-200`}
        >
          <div className="container mx-auto px-6 py-4 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Include location(s) for your search
                </p>

                <div className="flex items-center gap-2">
                  {onEditQuote && (
                    <button
                      onClick={onEditQuote}
                      className="px-3 py-1 text-sm border border-neutral-900 bg-neutral-900 text-white rounded-md hover:bg-neutral-700 transition-colors font-medium whitespace-nowrap"
                    >
                      ✎ Create New Quote
                    </button>
                  )}
                  {hasActiveFilters && onClearAllFilters && (
                    <button
                      onClick={() => {
                        setShowAllBadges(false);
                        setShowDatePicker(false);
                        setShowGuestSelector(false);
                        setShowBedroomsSelector(false);
                        //setShowBathroomsSelector(false);
                        setShowPriceSelector(false);
                        setUiError(null);
                        setLocalGuestsForModal(1);
                        onClearAllFilters?.();
                      }}
                      className="px-3 py-1 text-sm border border-input rounded-md hover:bg-muted transition-colors font-medium whitespace-nowrap"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>

              {caribbean.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs text-muted-foreground font-medium">Caribbean</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {caribbean.map(renderDestinationButton)}
                  </div>
                </div>
              )}

              {mexico.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs text-muted-foreground font-medium">Mexico</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {mexico.map(renderDestinationButton)}
                  </div>
                </div>
              )}

              {centralAmerica.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs text-muted-foreground font-medium">Central America</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {centralAmerica.map(renderDestinationButton)}
                  </div>
                </div>
              )}

              {europe.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs text-muted-foreground font-medium">Europe</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {europe.map(renderDestinationButton)}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Popular filters
              </p>

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
          </div>
        </div>
      </div>

      {/* MOBILE VERSION */}
      <div className="md:hidden sticky top-16 z-40 bg-background border-b border-border">
        <div className="px-4 py-3 space-y-3">
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

          <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4">
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
                      <GuestyCalendar
                        selected={{
                          from: checkIn ? parseISODateLocal(checkIn) : undefined,
                          to: checkOut ? parseISODateLocal(checkOut) : undefined,
                        }}
                        onSelect={handleRangeSelect}
                        numberOfMonths={1}
                      />
                    </div>
                    <div className="bg-muted/30 border-t border-border p-4">
                      <button
                        onClick={handleApplyDates}
                        className="w-full px-4 py-2.5 text-sm bg-[hsl(0,0%,6.7%)] text-white rounded-lg hover:bg-[hsl(0,0%,15%)] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!!uiError}
                      >
                        Apply Dates
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

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
                            onClick={() => setGuests && setGuests(Math.max(0, guests - 1))}
                            className="w-9 h-9 rounded-full border border-input flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium"
                            disabled={guests <= 0}
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
                      <p className="text-xs text-muted-foreground mt-3 text-center">
                        {guests === 0
                          ? "No guest limit"
                          : guests === 1
                            ? "1 guest"
                            : `${guests} guests`
                        }
                      </p>
                    </div>
                    <div className="bg-muted/30 border-t border-border p-4">
                      <button
                        onClick={handleApplyGuests}
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

          {selectedBadges.length > 0 && (
            <div
              className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {selectedBadges.map((badgeKey) => {
                // ✅ Buscar por slug primero, luego por id como fallback
                const badge = badges.find((b: CrudBadge) =>
                  (b.slug && b.slug === badgeKey) || b.id === badgeKey
                );
                if (!badge) return null;
                const Icon = resolveIcon(badge);
                const key = badge.slug || badge.id;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      onBadgeToggle(key);
                      onApplyFilters?.();
                    }}
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
            {uiError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{uiError}</p>
              </div>
            )}

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

              {centralAmerica.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-2">
                    Central America
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {centralAmerica.map((dest) => renderDestinationButton(dest))}
                  </div>
                </div>
              )}

              {europe.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-2">
                    Europe
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {europe.map((dest) => renderDestinationButton(dest))}
                  </div>
                </div>
              )}
            </div>

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
                      else if (newVal >= 12) setBedrooms(["12+"]);
                      else setBedrooms([String(newVal)]);
                    }}
                    className="w-8 h-8 rounded-full border border-input flex items-center justify-center hover:bg-muted transition-colors"
                  >
                    –
                  </button>
                  <span className="w-8 text-center font-medium">
                    {bedrooms.length === 0
                      ? "Any"
                      : bedrooms.includes("12+")
                        ? "12+"
                        : bedrooms[0]}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const current = deriveInitialBedroomsCount(bedrooms);
                      const newVal = Math.min(13, current + 1);
                      if (newVal >= 12) setBedrooms(["12+"]);
                      else setBedrooms([String(newVal)]);
                    }}
                    className="w-8 h-8 rounded-full border border-input flex items-center justify-center hover:bg-muted transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>


            {
              <>
                {/*
                <div>
                  <label className="block text-sm font-medium mb-2">Bathrooms</label>
                  <div className="flex items-center justify-between p-4 border border-input rounded-lg">
                    <span className="text-sm">Number of bathrooms</span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          const current = deriveInitialBathroomsCount(bathrooms);
                          const newVal = Math.max(0, current - 1);
                          if (newVal === 0) setBathrooms([]);
                          else if (newVal >= 12) setBathrooms(["12+"]);
                          else setBathrooms([String(newVal)]);
                        }}
                        className="w-8 h-8 rounded-full border border-input flex items-center justify-center hover:bg-muted transition-colors"
                      >
                        –
                      </button>
                      <span className="w-8 text-center font-medium">
                        {bathrooms.length === 0
                          ? "Any"
                          : bathrooms.includes("12+")
                            ? "12+"
                            : bathrooms[0]}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const current = deriveInitialBathroomsCount(bathrooms);
                          const newVal = Math.min(13, current + 1);
                          if (newVal >= 12) setBathrooms(["12+"]);
                          else setBathrooms([String(newVal)]);
                        }}
                        className="w-8 h-8 rounded-full border border-input flex items-center justify-center hover:bg-muted transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
                */}
                <div>
                  {isQuoteMode ? (
                    <>
                      <label className="block text-sm font-medium mb-1">Total Stay Budget</label>
                      <p className="text-xs text-muted-foreground mb-2">Maximum total including all fees and taxes</p>
                      <input
                        type="number"
                        value={localMaxTotalBudget}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '' || parseFloat(value) >= 0) {
                            setLocalMaxTotalBudget(value);
                          }
                        }}
                        placeholder="Max Budget ($)"
                        className="w-full px-3 py-2.5 text-sm border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        min="0"
                        step="1000"
                      />
                    </>
                  ) : (
                    <>
                      <label className="block text-sm font-medium mb-2">Price Range (per night)</label>
                      <div className="space-y-2">
                        <input
                          type="number"
                          value={minPrice}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '' || parseFloat(value) >= 0) {
                              setMinPrice(value);
                            }
                          }}
                          placeholder="Min Price ($)"
                          className="w-full px-3 py-2.5 text-sm border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          min="0"
                          step="100"
                        />
                        <input
                          type="number"
                          value={maxPrice}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '' || parseFloat(value) >= 0) {
                              setMaxPrice(value);
                            }
                          }}
                          placeholder="Max Price ($)"
                          className="w-full px-3 py-2.5 text-sm border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          min="0"
                          step="100"
                        />
                      </div>
                    </>
                  )}
                </div>
              </>
            }

            {setGuests && (
              <div>
                <label className="block text-sm font-medium mb-2">Guests</label>
                <div className="flex items-center justify-between p-4 border border-input rounded-lg">
                  <span className="text-sm">Number of guests</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setLocalGuestsForModal(Math.max(0, localGuestsForModal - 1))}
                      className="w-8 h-8 rounded-full border border-input flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={localGuestsForModal <= 0}
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

            {onCurrencyChange && (
              <div>
                <label className="block text-sm font-medium mb-2">Display Currency</label>
                <CurrencySelector
                  value={currency}
                  onChange={(c) => { onCurrencyChange(c); }}
                />
                {currency !== 'USD' && (
                  <p className="text-xs text-muted-foreground mt-1.5">
                    * Indicative rate only. Billing always in USD.
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-3">Amenities</label>
              <div className="flex flex-wrap gap-2">
                {[...quickBadges, ...restBadges].map(renderBadge)}
              </div>
            </div>
          </div>

          <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 z-10">
            <div className="flex gap-3">
              {hasActiveFilters && onClearAllFilters && (
                <button
                  onClick={() => {
                    onClearAllFilters?.();
                    setShowMobileFilters(false);
                    setUiError(null);
                  }}
                  className="flex-1 px-4 py-3 text-sm border border-input rounded-lg hover:bg-muted transition-colors font-medium"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={handleApplyAllFilters}
                className="flex-1 px-4 py-3 text-sm bg-[hsl(0,0%,6.7%)] text-white rounded-lg hover:bg-[hsl(0,0%,15%)] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!!uiError}
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