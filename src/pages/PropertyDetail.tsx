import { useAuth } from '../auth/useAuth';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import {
  MapPin,
  Bed,
  Bath,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Star,
  Shield,
  Check,
  Users,
  //Calendar,
  Sparkles,
  ChefHat,
  Waves,
  Wifi,
  //Headphones,
  Car,
  ShoppingCart,
  Dumbbell,
  Baby,
  PartyPopper,
  Plane,
  AirVent,
  Briefcase,
  Tv,
  Fan,
  TreePine,
  Utensils,
  Lock,
  Palmtree,
  Eye,
  Wind,
  Plus,
  Minus
} from 'lucide-react';
import { api } from '../api/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BookingModal from '../components/BookingModal';
import AvailabilityCalendar from '../components/AvailabilityCalendar';
import VillaNetRankModal from '../components/VillaNetRankModal';
import AccordeonBooking from '../components/AccordeonBooking';
//import CartButton from '../components/CartButton';
import CartModal from '../components/CartModal';
import CartSidebar from '../components/CartSidebar';
import { useCart } from '../context/CartContext';
import PropertyMap from '../components/PropertyMap';
import QuoteCalculator from '../components/QuoteCalculator';
import SEO, { generateProductSchema } from '../components/SEO';
import { trackEvent } from '../services/analytics';

type Listing = {
  listing_id: string;
  name: string;
  location_text: string | null;
  city: string | null;
  country: string | null;
  // Campos VillaNet del backend (snake_case)
  villanet_destination_tag?: string | null;
  villanet_city?: string | null;

  // Campo "bonito" que viene en algunos endpoints (por si las dudas)
  location?: string | null;

  bedrooms: number | null;
  bathrooms: number | null;
  price_usd: number | null;
  hero_image_url: string | null;
  images_json: string[];

  description?: string;
  lat?: number;
  lng?: number;
  amenities?: string[];

  // Nuevos campos internos PMC / VillaNet Rank
  villanet_rank?: number | null;
  villanet_commission_rate?: number | null;
  villanet_property_manager_name?: string | null;
  villanet_partner_reservation_email?: string | null;
  villanet_property_email?: string | null;
  max_guests?: number | null;
  villanet_standardized_housekeeping?: boolean | null;
  villanet_years_in_business?: number | null;
  villanet_chef_included?: boolean | null;
  villanet_heated_pool?: boolean | null;
  villanet_ocean_view?: boolean | null;
  villanet_true_beach_front?: boolean | null;
  villanet_golf_cart_included?: boolean | null;
  villanet_tennis?: boolean | null;
  villanet_pickleball?: boolean | null;
  villanet_private_gym?: boolean | null;
  villanet_private_cinema?: boolean | null;
  villanet_cook_included?: boolean | null;
  villanet_waiter_butler_included?: boolean | null;
  villanet_ocean_front?: boolean | null;
  villanet_walk_to_beach?: boolean | null;
  villanet_accessible?: boolean | null;
  villanet_gated_community?: boolean | null;
  villanet_golf_villa?: boolean | null;
  villanet_resort_villa?: boolean | null;
  villanet_resort_collection_name?: string | null;
};

type Day = {
  date: string;
  status: string | null;
  allotment: number | null;
  price: number | null;
  cta: boolean | null;
  ctd: boolean | null;
  minStay: number | null;
};

const fmt = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const da = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${da}`;
};

// Mapeo de amenities a iconos
const getAmenitiesWithIcons = (amenities: string[]) => {
  const amenityMap: Record<string, { icon: any; label: string }> = {
    'Air conditioning': { icon: AirVent, label: 'Air Conditioning' },
    'Beach': { icon: Palmtree, label: 'Beach Access' },
    'Beach access': { icon: Palmtree, label: 'Beach Access' },
    'Bed linens': { icon: Star, label: 'Premium Linens' },
    'Cable TV': { icon: Tv, label: 'Cable TV' },
    'Ceiling fan': { icon: Fan, label: 'Ceiling Fans' },
    'Desk': { icon: Briefcase, label: 'Work Desk' },
    'Enhanced cleaning practices': { icon: Sparkles, label: 'Enhanced Cleaning' },
    'Family/kid friendly': { icon: Users, label: 'Family Friendly' },
    'Garden or backyard': { icon: TreePine, label: 'Garden/Backyard' },
    'Golf - Optional': { icon: Briefcase, label: 'Golf Access' },
    'Hair dryer': { icon: Wind, label: 'Hair Dryer' },
    'Kitchen': { icon: Utensils, label: 'Full Kitchen' },
    'Near Ocean': { icon: Waves, label: 'Ocean View' },
    'Outdoor pool': { icon: Waves, label: 'Outdoor Pool' },
    'Private pool': { icon: Waves, label: 'Private Pool' },
    'Safe': { icon: Lock, label: 'In-Room Safe' },
    'Sea view': { icon: Eye, label: 'Sea View' },
    'Suitable for children (2-12 years)': { icon: Baby, label: 'Kid Friendly' },
    'Suitable for infants (under 2 years)': { icon: Baby, label: 'Infant Friendly' },
    'TV': { icon: Tv, label: 'Television' },
    'Water Sports': { icon: Waves, label: 'Water Sports' },
    'Wireless Internet': { icon: Wifi, label: 'High-Speed WiFi' }
  };

  return amenities
    .map(amenity => amenityMap[amenity] || { icon: Check, label: amenity })
    .filter((item, index, self) =>
      index === self.findIndex(t => t.label === item.label)
    );
};


// Función helper para formatear rank de forma segura
const formatVillaNetRank = (rank: any): string => {
  if (rank == null || rank === undefined || rank === '') return '9.7';

  try {
    const num = typeof rank === 'string' ? parseFloat(rank) : Number(rank);
    if (isNaN(num)) return '9.7';

    return num.toFixed(1);
  } catch (error) {
    console.warn('Error formatting VillaNet rank:', error, rank);
    return '9.7';
  }
};

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [days, setDays] = useState<Day[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showRankModal, setShowRankModal] = useState(false);
  const [showDesktopCTA, setShowDesktopCTA] = useState(false);
  const [query, setQuery] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const { user } = useAuth();

  // Usar el contexto del carrito
  const {
    isInCart,
    toggleItem,
    cartCount,
    openCart,
    isCartModalOpen,
    openCartModal,
    closeCartModal,
    quoteCheckIn,
    quoteCheckOut,
  } = useCart();

  const [start, setStart] = useState(() => {
    const s = new Date();
    s.setDate(1);
    return s;
  });

  const end = useMemo(() => {
    const e = new Date(start);
    e.setMonth(e.getMonth() + 2);
    e.setDate(0);
    return e;
  }, [start]);

  const images = useMemo(() => {
    if (!listing)
      return [
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80&auto=format&fit=crop'
      ];

    const imgs = listing.images_json || [];
    const hero = listing.hero_image_url;

    const uniqueImages = Array.from(
      new Set([...(hero ? [hero] : []), ...imgs])
    ).filter(img => img && img.trim() !== '');

    const sortedImages = uniqueImages.sort((a, b) => {
      if (a.includes('thumbnail') || a.includes('small')) return 1;
      if (b.includes('thumbnail') || b.includes('small')) return -1;
      return 0;
    });

    return sortedImages.length > 0
      ? sortedImages
      : [
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80&auto=format&fit=crop'
      ];
  }, [listing]);

  const unavailableDates = useMemo(() => {
    const unavailable = new Set<string>();

    for (const day of days) {
      const isAvailable =
        day.allotment != null ? day.allotment > 0 : day.status === 'available';

      if (!isAvailable) {
        unavailable.add(day.date);
      }
    }

    return unavailable;
  }, [days]);

  const openRankModal = () => {
    setShowRankModal(true);
  };

  const closeRankModal = () => {
    setShowRankModal(false);
  };

  // Navegación del calendario
  const prevMonth = () =>
    setStart(d => {
      const newDate = new Date(d);
      newDate.setMonth(newDate.getMonth() - 2);
      return newDate;
    });

  const nextMonth = () =>
    setStart(d => {
      const newDate = new Date(d);
      newDate.setMonth(newDate.getMonth() + 2);
      return newDate;
    });

  // Función para manejar agregar/quitar del carrito
  const handleToggleCart = () => {
    if (!listing) return;

    const isAdding = !isInCart(listing.listing_id);

    // --- NUEVO: Tracking del Carrito ---
    trackEvent(isAdding ? 'add_to_cart' : 'remove_from_cart', {
      property_id: listing.listing_id,
      property_name: listing.name
    });


    // Convertir el listing al formato que espera el carrito
    const cartListing = {
      id: listing.listing_id,
      name: listing.name,
      location: listing.location_text || listing.location || listing.villanet_destination_tag || listing.villanet_city || `${listing.city || ''}${listing.city && listing.country ? ', ' : ''}${listing.country || ''}`,
      villaNetDestinationTag: listing.villanet_destination_tag,
      villaNetCity: listing.villanet_city,
      bedrooms: listing.bedrooms,
      bathrooms: listing.bathrooms,
      priceUSD: listing.price_usd,
      heroImage: listing.hero_image_url || (listing.images_json && listing.images_json[0]) || null,
      images_json: listing.images_json || [],
    };


    toggleItem(cartListing);
  };

  //Función para "volver a propiedades"
  const handleBackToProperties = () => {
    const scrollPosition = localStorage.getItem('propertiesScrollPosition');
    localStorage.setItem('restoreScrollPosition', scrollPosition || '0');

    const savedFilters = localStorage.getItem('searchFilters');
    const params = new URLSearchParams();

    // quoteFlow=false evita que NewQuoteModal se abra al volver
    params.set('quoteFlow', 'false');

    if (savedFilters) {
      try {
        const filters = JSON.parse(savedFilters);
        if (filters.query?.trim())                              params.set('q', filters.query.trim());
        if (filters.destination)                                params.set('destination', filters.destination);
        if (filters.destinations)                               params.set('destinations', filters.destinations);
        if (filters.bedrooms?.length)                           params.set('bedrooms', filters.bedrooms.join(','));
        if (filters.bathrooms?.length)                          params.set('bathrooms', filters.bathrooms.join(','));
        if (filters.minPrice)                                   params.set('minPrice', filters.minPrice.toString());
        if (filters.maxPrice)                                   params.set('maxPrice', filters.maxPrice.toString());
        if (filters.checkIn)                                    params.set('checkIn', filters.checkIn);
        if (filters.checkOut)                                   params.set('checkOut', filters.checkOut);
        if (filters.guests > 0)                                 params.set('guests', filters.guests.toString());
        if (filters.badges?.length)                             params.set('badges', filters.badges.join(','));
        if (filters.sort)                                       params.set('sort', filters.sort);
      } catch (e) {
        console.error('Error parsing saved filters:', e);
      }
    }

    navigate(`/properties?${params.toString()}`);
  };

  useEffect(() => {
    if (!id) {
      setError('Invalid property ID');
      setLoading(false);
      return;
    }

    const fetchListing = async () => {
      setLoading(true);
      setError(null);

      try {
        // 🔥 IMPORTANTE: Incluir todos los campos VillaNet que necesitas
        const listingData = await api<Listing>(`/listings/${id}`);

        setListing({
          ...listingData,
          images_json: Array.isArray(listingData?.images_json)
            ? listingData.images_json
            : [],

          villanet_rank: listingData.villanet_rank,
          villanet_commission_rate: listingData.villanet_commission_rate,
          villanet_property_manager_name: listingData.villanet_property_manager_name,
          villanet_partner_reservation_email: listingData.villanet_partner_reservation_email,
          villanet_property_email: listingData.villanet_property_email,
          villanet_destination_tag: listingData.villanet_destination_tag,
          villanet_city: listingData.villanet_city,
          villanet_years_in_business: listingData.villanet_years_in_business,
          villanet_chef_included: listingData.villanet_chef_included,
          villanet_heated_pool: listingData.villanet_heated_pool,
          villanet_ocean_view: listingData.villanet_ocean_view,
          villanet_true_beach_front: listingData.villanet_true_beach_front,
          villanet_golf_cart_included: listingData.villanet_golf_cart_included,
          villanet_tennis: listingData.villanet_tennis,
          villanet_pickleball: listingData.villanet_pickleball,
          villanet_private_gym: listingData.villanet_private_gym,
          villanet_private_cinema: listingData.villanet_private_cinema,
          villanet_cook_included: listingData.villanet_cook_included,
          villanet_waiter_butler_included: listingData.villanet_waiter_butler_included,
          villanet_ocean_front: listingData.villanet_ocean_front,
          villanet_walk_to_beach: listingData.villanet_walk_to_beach,
          villanet_accessible: listingData.villanet_accessible,
          villanet_gated_community: listingData.villanet_gated_community,
          villanet_golf_villa: listingData.villanet_golf_villa,
          villanet_resort_villa: listingData.villanet_resort_villa,
          villanet_resort_collection_name: listingData.villanet_resort_collection_name,
          villanet_standardized_housekeeping: listingData.villanet_standardized_housekeeping,
        });
      } catch (err: any) {
        console.error('Error fetching property details:', err);
        setError(err?.message || 'Failed to load property details');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  useEffect(() => {
    if (!id || !listing) return;

    const fetchAvailability = async () => {
      setLoadingAvailability(true);
      setAvailabilityError(null);

      try {
        const from = fmt(start);
        const to = fmt(end);
        console.log('🔄 Fetching availability:', {
          listingId: id,
          from: from,
          to: to,
          startMonth: start.toISOString().slice(0, 7),
          endMonth: end.toISOString().slice(0, 7)
        });
        const availabilityData = await api<{ days: Day[] }>(
          `/availability/${id}?from=${from}&to=${to}`
        );
        setDays(availabilityData?.days || []);
      } catch (err: any) {
        console.error('Error fetching availability:', err);
        setAvailabilityError('Unable to load availability calendar');
        setDays([]);
      } finally {
        setLoadingAvailability(false);
      }
    };

    fetchAvailability();
  }, [id, listing, start, end]);

  const nextImage = () =>
    setCurrentImageIndex(prev => (prev + 1) % images.length);
  const prevImage = () =>
    setCurrentImageIndex(prev => (prev - 1 + images.length) % images.length);

  const activeFiltersCount = 0;
  const today = new Date().toISOString().split('T')[0];
  const minCheckOut = checkIn || today;

  useEffect(() => {
    const handleScroll = () => {
      const hero = document.getElementById('property-hero');

      // Fallback por si no encuentra el hero: umbral fijo
      if (!hero) {
        setShowDesktopCTA(window.scrollY > 400);
        return;
      }

      const rect = hero.getBoundingClientRect();
      const NAV_HEIGHT = 80;

      const passedHero = rect.bottom <= NAV_HEIGHT;
      setShowDesktopCTA(passedHero);
    };


    handleScroll();

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Leer filtros del buscador principal desde localStorage
    const savedFilters = localStorage.getItem('searchFilters');
    if (savedFilters) {
      try {
        const filters = JSON.parse(savedFilters);

        // Prellenar fechas y guests desde el buscador principal
        if (filters.checkIn) {
          setCheckIn(filters.checkIn);
        }
        if (filters.checkOut) {
          setCheckOut(filters.checkOut);
        }
        if (filters.guests && filters.guests > 0) {
          setGuests(filters.guests);
        }
      } catch (error) {
        console.error('Error parsing saved filters:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (listing) {
      trackEvent('view_property_detail', {
        property_id: listing.listing_id,
        property_name: listing.name,
        city: listing.city || listing.villanet_city,
        price: listing.price_usd,
        currency: 'USD'
      });
    }
  }, [listing]);

  useEffect(() => {
    // Marcar cuando el usuario abandona esta página
    return () => {
      localStorage.setItem('fromPropertyDetail', 'true');
    };
  }, []);

  const retryAvailability = () => {
    setAvailabilityError(null);
    setStart(prev => new Date(prev));
  };

  if (loading && !listing) {
    return (
      <div className="min-h-screen bg-white">
        <Header
          query={query}
          setQuery={setQuery}
          checkIn={checkIn}
          setCheckIn={setCheckIn}
          checkOut={checkOut}
          setCheckOut={setCheckOut}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          activeFiltersCount={activeFiltersCount}
          today={today}
          minCheckOut={minCheckOut}
          showNavbarSearch={false}
        />
        <div className="max-w-6xl mx-auto p-4 lg:p-6">
          <div className="animate-pulse space-y-6">
            <div className="aspect-[16/9] bg-neutral-200 rounded-2xl"></div>
            <div className="h-8 bg-neutral-200 rounded w-2/3"></div>
            <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !listing) {
    return (
      <div className="min-h-screen bg-white">
        <Header
          query={query}
          setQuery={setQuery}
          checkIn={checkIn}
          setCheckIn={setCheckIn}
          checkOut={checkOut}
          setCheckOut={setCheckOut}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          activeFiltersCount={activeFiltersCount}
          today={today}
          minCheckOut={minCheckOut}
          showNavbarSearch={false}
        />

        <div className="max-w-6xl mx-auto p-4 lg:p-6">
          <button
            onClick={() => navigate('/properties?quoteFlow=false')}
            className="flex items-center gap-2 text-orange-500 hover:text-orange-600 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Properties
          </button>

          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
            <p className="text-neutral-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-white">
        <Header
          query={query}
          setQuery={setQuery}
          checkIn={checkIn}
          setCheckIn={setCheckIn}
          checkOut={checkOut}
          setCheckOut={setCheckOut}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          activeFiltersCount={activeFiltersCount}
          today={today}
          minCheckOut={minCheckOut}
          showNavbarSearch={false}
        />
        <div className="max-w-6xl mx-auto p-4 lg:p-6">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">
              Property Not Found
            </h2>
            <button
              onClick={() => navigate('/properties?quoteFlow=false')}
              className="mt-4 bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition"
            >
              Back to Properties
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 🔹 Función para obtener la ubicación "bonita" priorizando VillaNet
  const getVillaNetLocation = () => {
    return (
      listing.location ||
      listing.villanet_destination_tag ||
      listing.villanet_city ||
      listing.location_text ||
      `${listing.city || ''}${listing.city && listing.country ? ', ' : ''
      }${listing.country || ''}`
    );
  };

  // Determinar si esta propiedad está en el carrito
  const isPropertyInCart = isInCart(listing.listing_id);

  return (
    <div className="min-h-screen bg-white max-md:overflow-x-hidden max-md:overflow-y-auto">
      {/* ✅ SEO DINÁMICO */}
      <SEO
        title={listing.name}
        description={`Book ${listing.name} in ${listing.location_text || listing.city}. Enjoy ${listing.bedrooms} bedrooms and premium amenities. Best rates guaranteed at VillaNet.`}
        image={listing.hero_image_url || images[0]}
        canonical={window.location.href}
        schemaMarkup={generateProductSchema({
          name: listing.name,
          description: listing.description || '',
          image: images,
          offers: {
            price: listing.price_usd || 0,
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock'
          }
        })}
      />
      <Header
        query={query}
        setQuery={setQuery}
        checkIn={checkIn}
        setCheckIn={setCheckIn}
        checkOut={checkOut}
        setCheckOut={setCheckOut}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        activeFiltersCount={activeFiltersCount}
        today={today}
        minCheckOut={minCheckOut}
        showNavbarSearch={false}
      />

      {/* 🆕 Back to Properties Button */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-[#E5E5E5] lg:mt-[55px]">
        <div className="container mx-auto max-w-6xl px-4 lg:px-6 py-3">
          <button
            onClick={handleBackToProperties}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-all duration-200 group"
            aria-label="Return to properties list"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="text-sm font-medium">Back to Properties</span>
            
            {/* Badge opcional mostrando filtros activos */}
            {(() => {
              const savedFilters = localStorage.getItem('searchFilters');
              if (savedFilters) {
                try {
                  const filters = JSON.parse(savedFilters);
                  const filterCount = Object.keys(filters).filter(
                    key => {
                      const value = filters[key];
                      if (key === 'query') return false; // No contar query
                      if (Array.isArray(value)) return value.length > 0;
                      return value !== '' && value !== null && value !== undefined;
                    }
                  ).length;
                  
                  if (filterCount > 0) {
                    return (
                      <span className="ml-2 inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-800">
                        {filterCount} {filterCount === 1 ? 'filter' : 'filters'} active
                      </span>
                    );
                  }
                } catch (error) {
                  // Silently fail
                }
              }
              return null;
            })()}
          </button>
        </div>
      </div>

      {/* Cart Sidebar */}
      <CartSidebar />

      {/* Cart Modal */}
      <CartModal isOpen={isCartModalOpen} onClose={closeCartModal} defaultCheckIn={quoteCheckIn} defaultCheckOut={quoteCheckOut} />

      {/* Botón flotante del carrito */}
      {cartCount > 0 && (
        <button
          onClick={openCart}
          className="fixed bottom-6 right-32 z-40 px-4 py-2.5 bg-white border border-[#E5E5E5] rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 text-gray-700 hover:text-gray-900 animate-fade-in"
          aria-label="View quote"
        >
          <ShoppingCart className="h-4 w-4" />
          <span className="text-sm font-medium">Quote ({cartCount})</span>
        </button>
      )}

      {/* Hero Gallery Section */}
      <section
        id="property-hero"
        className="relative w-full h-[60vh] md:h-[70vh]"
      >
        <div className="overflow-hidden h-full lg:mt-[55px]">
          <div
            className="flex h-full"
            style={{
              transform: `translate3d(-${currentImageIndex * 100}%, 0px, 0px)`
            }}
          >
            {images.map((image, index) => (
              <div key={index} className="flex-[0_0_100%] min-w-0">
                <img
                  src={image}
                  alt={`${listing.name} - View ${index + 1} of ${images.length}`}
                  className="w-full h-full object-cover"
                  onError={e => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80&auto=format&fit=crop';
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Verified Badge */}
        <div className="absolute top-5 left-5">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 text-white border border-white">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-medium">Villa Net Verified 2025</span>
          </div>
        </div>

        {/* Cart Button en Hero */}
        <div className="absolute top-5 right-5">
          <button
            onClick={handleToggleCart}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all ${isPropertyInCart
              ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
              : 'bg-white/90 backdrop-blur-sm text-gray-900 border-gray-200 hover:bg-white hover:shadow-lg'
              }`}
          >
            {isPropertyInCart ? (
              <>
                <Minus className="w-4 h-4" />
                <span>Remove from Quote</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Add to Quote</span>
              </>
            )}
          </button>
        </div>

        {/* Image Navigation */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full transition shadow-lg"
            >
              <ChevronLeft className="w-6 h-6 text-neutral-900" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full transition shadow-lg"
            >
              <ChevronRight className="w-6 h-6 text-neutral-900" />
            </button>

            {/* Image Counter */}
            <div className="absolute bottom-6 right-6">
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-black/70 text-white">
                {currentImageIndex + 1} / {images.length}
              </div>
            </div>

            {/* Dots Indicator */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${index === currentImageIndex
                      ? 'bg-white w-6'
                      : 'bg-white/50 hover:bg-white/75'
                    }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </section>

      <section className="py-4 px-6 border-b border-[#E5E5E5]">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-wrap justify-center gap-2">
            {/* Badge 1: VillaNet Rank - SIEMPRE */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white text-gray-900 border border-gray-900">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium">
                Villa Net Rank™ {formatVillaNetRank(listing.villanet_rank)}
              </span>
            </div>

            {/* Badge 2: Trusted Years - DINÁMICO si hay datos, estático si no */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white text-gray-900 border border-gray-900">
              <Star className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">
                {listing.villanet_years_in_business
                  ? `Trusted ${listing.villanet_years_in_business}+ Years`
                  : 'Trusted 10+ Years'
                }
              </span>
            </div>

            {/* Badge 3: Property Manager - MOSTRAR SOLO SI HAY DATOS */}
            {listing.villanet_property_manager_name ? (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white text-gray-900 border border-gray-900">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium truncate max-w-[180px]">
                  {listing.villanet_property_manager_name}
                </span>
              </div>
            ) : (
              // Fallback estático si no hay manager específico
              <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white text-gray-900 border border-gray-900">
                <Check className="w-4 h-4" />
                <span className="text-sm font-medium">Managed Locally</span>
              </div>
            )}

            {/* Badge 4: Premium Feature más destacada */}
            {(() => {
              const premiumFeatures = [];
              if (listing.villanet_true_beach_front) premiumFeatures.push('True Beachfront');
              if (listing.villanet_chef_included) premiumFeatures.push('Chef Included');
              if (listing.villanet_heated_pool) premiumFeatures.push('Heated Pool');
              if (listing.villanet_private_gym) premiumFeatures.push('Private Gym');

              if (premiumFeatures.length > 0) {
                return (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white text-gray-900 border border-gray-900">
                    <span className="text-sm font-medium">{premiumFeatures[0]}</span>
                  </div>
                );
              }

              // Fallback estático si no hay features premium
              return (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white text-gray-900 border border-gray-900">
                  <span className="text-sm font-medium">Platinum Collection</span>
                </div>
              );
            })()}
          </div>
        </div>
      </section>

      {/* Property Title Section */}
      <section className="py-6 px-6 text-center border-b border-[#E5E5E5]">
        <div className="container mx-auto max-w-4xl">
          <h1 className="font-bold text-3xl sm:text-4xl md:text-5xl text-gray-900 mb-3">
            {listing.name}
          </h1>
          <div className="flex items-start justify-center gap-1.5 text-gray-900">
            <MapPin className="w-4 h-4 md:w-5 md:h-5 mt-1 flex-shrink-0" />
            <p className="text-base md:text-lg">{getVillaNetLocation()}</p>
          </div>

          {/* Botón para agregar/quitar del carrito en desktop */}
          <div className="mt-4 hidden md:block">
            <button
              onClick={handleToggleCart}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all ${isPropertyInCart
                ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
                : 'bg-gray-900 text-white border-gray-900 hover:bg-gray-800'
                }`}
            >
              {isPropertyInCart ? (
                <>
                  <Minus className="w-4 h-4" />
                  <span>Remove from Quote</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Add to Quote</span>
                </>
              )}
            </button>
            {cartCount > 0 && (
              <button
                onClick={openCartModal}
                className="ml-3 inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium bg-white border border-gray-300 text-gray-900 hover:bg-gray-50"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>View Quote ({cartCount})</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Property Features */}
      <section className="py-8 px-6 border-b border-[#E5E5E5]">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-3 gap-4 md:flex md:justify-center md:items-center md:gap-8 text-center">
            {/* Bedrooms */}
            <div className="py-4">
              <Bed className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2 text-gray-900" />
              <p className="text-2xl font-bold">{listing.bedrooms ?? '—'}</p>
              <p className="text-xs sm:text-sm text-[#6B7280]">Bedrooms</p>
            </div>

            <div className="hidden md:block w-px h-12 bg-[#E5E5E5]"></div>

            {/* Bathrooms */}
            <div className="py-4">
              <Bath className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2 text-gray-900" />
              <p className="text-2xl font-bold">{listing.bathrooms ?? '—'}</p>
              <p className="text-xs sm:text-sm text-[#6B7280]">Bathrooms</p>
            </div>

            <div className="hidden md:block w-px h-12 bg-[#E5E5E5]"></div>

            {/* Sleeps */}
            <div className="py-4">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2 text-gray-900" />
              <p className="text-2xl font-bold">
                {listing.max_guests ??
                  (listing.bedrooms ? listing.bedrooms * 2 : '—')}
              </p>
              <p className="text-xs sm:text-sm text-[#6B7280]">Sleeps</p>
            </div>

            <div className="hidden md:block w-px h-12 bg-[#E5E5E5]"></div>

            {/* 🔥 STAFF & SERVICE - BASADO EN TUS DATOS REALES */}
            <div className="col-span-3 py-4 md:col-span-1 border-t md:border-t-0 border-[#E5E5E5] mt-2 md:mt-0 pt-6 md:pt-0">
              <p className="text-sm font-semibold text-gray-900 mb-1">
                Staff & Service
              </p>
              <div className="text-xs text-[#767676] mt-1 max-w-[200px] md:max-w-[160px] mx-auto leading-tight">
                {(() => {
                  const services = [];

                  // 1. HOUSEKEEPER - Usar villanet_standardized_housekeeping
                  if (listing.villanet_standardized_housekeeping === true) {
                    services.push('Daily Housekeeper');
                  } else {
                    // Por defecto asumir que sí hay (es estándar)
                    services.push('Daily Housekeeper');
                  }

                  // 2. CHEF/COOK - Usar villanet_chef_included o villanet_cook_included
                  if (listing.villanet_chef_included === true) {
                    services.push('Private Chef');
                  } else if (listing.villanet_cook_included === true) {
                    services.push('Cook Service');
                  } else {
                    services.push('Chef Available');
                  }

                  // 3. CONCIERGE/BUTLER - Usar villanet_waiter_butler_included
                  if (listing.villanet_waiter_butler_included === true) {
                    services.push('Butler Service');
                  } else {
                    services.push('Concierge');
                  }

                  return services.join(' · ');
                })()}
              </div>
            </div>
          </div>

          {/* Botón para agregar/quitar del carrito en mobile */}
          <div className="mt-6 md:hidden">
            <button
              onClick={handleToggleCart}
              className={`w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all ${isPropertyInCart
                ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
                : 'bg-gray-900 text-white border-gray-900 hover:bg-gray-800'
                }`}
            >
              {isPropertyInCart ? (
                <>
                  <Minus className="w-4 h-4" />
                  <span>Remove from Quote</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Add to Quote</span>
                </>
              )}
            </button>
            {cartCount > 0 && (
              <button
                onClick={openCartModal}
                className="w-full mt-3 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-medium bg-white border border-gray-300 text-gray-900 hover:bg-gray-50"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>View Quote ({cartCount})</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-8 md:py-12 px-6 border-b border-[#E5E5E5]">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">
            About This Villa
          </h2>
          <div className="text-[#6B7280]">
            {listing.description ? (
              <>
                <div
                  className={`transition-all duration-300 overflow-hidden ${isDescriptionExpanded ? '' : 'max-h-[200px] relative'
                    }`}
                >
                  {(() => {
                    const text = listing.description.trim();

                    // Dividir por líneas y procesar
                    const lines = text.split('\n');
                    const elements: Array<{
                      type: 'heading' | 'list' | 'paragraph';
                      content?: string;
                      items?: string[];
                      key: string;
                    }> = [];
                    let currentList: string[] = [];

                    lines.forEach((line, idx) => {
                      const trimmedLine = line.trim();

                      // Saltar líneas vacías
                      if (!trimmedLine) return;

                      // Detectar encabezados (líneas en mayúsculas completas)
                      if (/^[A-Z\s&/]{5,}$/.test(trimmedLine) && trimmedLine.length < 50) {
                        // Guardar lista anterior si existe
                        if (currentList.length > 0) {
                          elements.push({
                            type: 'list',
                            items: [...currentList],
                            key: `list-${elements.length}`
                          });
                          currentList = [];
                        }

                        elements.push({
                          type: 'heading',
                          content: trimmedLine,
                          key: `heading-${idx}`
                        });
                        return;
                      }

                      // Detectar items de lista (comienzan con texto seguido de ":")
                      if (trimmedLine.match(/^[A-Za-z0-9\s]+:/)) {
                        currentList.push(trimmedLine);
                        return;
                      }

                      // Si había una lista y viene texto normal, cerrar la lista
                      if (currentList.length > 0) {
                        elements.push({
                          type: 'list',
                          items: [...currentList],
                          key: `list-${elements.length}`
                        });
                        currentList = [];
                      }

                      // Texto normal
                      elements.push({
                        type: 'paragraph',
                        content: trimmedLine,
                        key: `p-${idx}`
                      });
                    });

                    // Agregar última lista si existe
                    if (currentList.length > 0) {
                      elements.push({
                        type: 'list',
                        items: currentList,
                        key: `list-final`
                      });
                    }

                    return (
                      <div className="space-y-6">
                        {elements.map((element) => {
                          switch (element.type) {
                            case 'heading':
                              return (
                                <h3
                                  key={element.key}
                                  className="text-base font-bold text-gray-900 uppercase tracking-wide mt-8 first:mt-0 mb-3"
                                >
                                  {element.content}
                                </h3>
                              );

                            case 'list':
                              return (
                                <ul key={element.key} className="space-y-2 ml-4">
                                  {element.items?.map((item, i) => (
                                    <li
                                      key={i}
                                      className="text-[15px] leading-relaxed flex"
                                    >
                                      <span className="mr-2 text-blue-600 flex-shrink-0">•</span>
                                      <span>{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              );

                            case 'paragraph':
                              // Detectar si es una línea especial (como PROMO!, contacto, etc)
                              const isSpecial = element.content?.includes('PROMO!') ||
                                element.content?.includes('Contact us') ||
                                element.content?.includes('**');

                              return (
                                <p
                                  key={element.key}
                                  className={`text-[15px] leading-relaxed ${isSpecial ? 'font-semibold text-gray-900' : ''
                                    }`}
                                >
                                  {element.content?.replace(/\*\*/g, '')}
                                </p>
                              );

                            default:
                              return null;
                          }
                        })}
                      </div>
                    );
                  })()}

                  {/* Gradiente fade cuando está colapsado */}
                  {!isDescriptionExpanded && (
                    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white via-white/95 to-transparent pointer-events-none" />
                  )}
                </div>

                {/* Botón "Read more" */}
                {listing.description.length > 600 && (
                  <button
                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                    className="text-blue-600 hover:text-blue-700 hover:underline text-sm font-semibold mt-4 inline-flex items-center gap-1 transition-colors"
                  >
                    {isDescriptionExpanded ? (
                      <>
                        Show less
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </>
                    ) : (
                      <>
                        Read more
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </>
                    )}
                  </button>
                )}
              </>
            ) : (
              <p className="text-center py-8 text-gray-500">No description available.</p>
            )}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-8 md:py-12 px-6 bg-accent/20">
        <div className="container mx-auto max-w-4xl text-center">
          <p className="text-sm uppercase tracking-wide text-[#6B7280] mb-2">
            Starting at
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2">
            ${listing.price_usd?.toLocaleString() ?? '—'}/night
          </h2>
          <p className="text-sm text-[#6B7280] mb-8">
            Rates vary by season & length of stay.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleToggleCart}
              className={`inline-flex items-center justify-center gap-2 h-14 px-8 rounded-xl font-bold uppercase tracking-wider shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] ${
                isPropertyInCart
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-gray-900 text-white hover:bg-gray-800'
              }`}
            >
              {isPropertyInCart ? (
                <>
                  <Minus className="w-5 h-5" />
                  REMOVE FROM QUOTE
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  ADD TO QUOTE
                </>
              )}
            </button>
            {cartCount > 0 && (
              <button
                onClick={openCartModal}
                className="inline-flex items-center justify-center gap-2 h-14 px-8 rounded-xl font-bold uppercase tracking-wider border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 shadow-sm hover:shadow-md transition-all"
              >
                <ShoppingCart className="w-5 h-5" />
                VIEW QUOTE ({cartCount})
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Quote Calculator */}
      <section className="py-8 md:py-12 px-6 border-b border-[#E5E5E5]">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-6 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">
              Calculate Your Quote
            </h2>
            <p className="text-sm text-gray-600">
              Get instant pricing with your advisor commission included
            </p>
          </div>

          <div className="max-w-xl mx-auto">
            <QuoteCalculator
              listingId={listing.listing_id}
              checkIn={checkIn}
              checkOut={checkOut}
              guests={guests || 2}
              defaultCommission={12}
            />
          </div>

          {/* Info adicional */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 max-w-2xl mx-auto">
              Prices are calculated in real-time based on availability and seasonality.
              Final pricing subject to confirmation upon booking.
            </p>
          </div>
        </div>
      </section>

      {/* Villa Net Verified Standard */}
      <section className="py-16 px-6 bg-white border-t border-b border-[#E6E6E6]">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 mb-4">
              <Check className="w-8 h-8 text-green-600" />
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Villa Net Verified Standard
              </h2>
            </div>
            <p className="text-[#6B7280] max-w-2xl mx-auto">
              Private villas are not hotels — the guest experience depends on
              the property manager. Villa Net verifies every manager and every
              villa before it goes live.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">
            {(() => {
              const verifiedFeatures = [];

              // 1. Manager verificado
              if (listing.villanet_property_manager_name) {
                verifiedFeatures.push(
                  `Professionally Managed by ${listing.villanet_property_manager_name}`
                );
              } else {
                verifiedFeatures.push('Professionally Managed by Verified Local Partner');
              }

              // 2. Trust accounting
              verifiedFeatures.push('Trust Accounting with Segregated Client Funds');

              // 3. Housekeeping estándar
              verifiedFeatures.push('Daily Housekeeping Included (Except Sundays)');

              // 4. Chef disponible
              if (listing.villanet_chef_included) {
                verifiedFeatures.push('Private Chef Included in Stay');
              } else {
                verifiedFeatures.push('Private Chef Available, Fully Vetted & Local');
              }

              // 5. Rank de VillaNet (CORREGIDO - usar formatVillaNetRank)
              if (listing.villanet_rank != null) {
                verifiedFeatures.push(
                  `Villa Net Quality Score: ${formatVillaNetRank(listing.villanet_rank)}`
                );
              } else {
                verifiedFeatures.push('Villa Net Quality Score: 9.7+');
              }

              // 6. Commission rate
              if (listing.villanet_commission_rate) {
                verifiedFeatures.push(
                  `Commission Rate: ${listing.villanet_commission_rate}% for Travel Advisors`
                );
              } else {
                verifiedFeatures.push('Commission Protected for Travel Advisors');
              }

              return verifiedFeatures.slice(0, 6).map((feature, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 bg-white p-5 rounded-lg border border-[#E6E6E6]"
                >
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700 font-normal">{feature}</p>
                </div>
              ));
            })()}
          </div>
        </div>
      </section>

      {/* Availability Calendar */}
      <section className="py-8 md:py-12 px-6 bg-[#FAFAFA] border-t border-b border-[#E5E5E5]">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              Availability Calendar
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Plan your stay with real-time availability
            </p>
          </div>
          <AvailabilityCalendar
            days={days}
            loading={loadingAvailability}
            error={availabilityError}
            onRetry={retryAvailability}
            start={start}
            onPrevMonth={prevMonth}
            onNextMonth={nextMonth}
          />
        </div>
      </section>

      {/* Amenities Section - DYNAMIC */}
      <section className="py-12 px-6 border-b border-[#E5E5E5]">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold mb-3 text-gray-900">
              Property Amenities
            </h3>
            <p className="text-sm text-gray-600">Included with Your Stay</p>
          </div>

          {(() => {
            const amenitiesWithIcons = getAmenitiesWithIcons(listing.amenities || []);
            const initialAmenitiesCount = 12;
            const displayAmenities = showAllAmenities
              ? amenitiesWithIcons
              : amenitiesWithIcons.slice(0, initialAmenitiesCount);
            const hasMoreAmenities = amenitiesWithIcons.length > initialAmenitiesCount;

            return (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
                  {displayAmenities.map((amenity, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center text-center gap-3 p-4 rounded-lg border border-gray-100 hover:border-gray-300 hover:shadow-sm transition-all"
                    >
                      <amenity.icon className="w-7 h-7 text-gray-700" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 leading-tight">
                          {amenity.label}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {hasMoreAmenities && (
                  <div className="text-center mt-8">
                    <button
                      onClick={() => setShowAllAmenities(!showAllAmenities)}
                      className="px-6 py-2.5 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {showAllAmenities ? 'View Less' : 'View More'}
                    </button>
                  </div>
                )}

                {amenitiesWithIcons.length === 0 && (
                  <p className="text-center text-gray-500 text-sm mt-8">
                    Amenity details available upon request
                  </p>
                )}
              </>
            );
          })()}
        </div>
      </section>

      {/* Concierge Services */}
      <section className="py-12 px-6 bg-white border-b border-[#E5E5E5]">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">
              Villa Net Concierge Services
            </h3>
            <p className="text-sm text-gray-600 max-w-2xl mx-auto mb-6">
              Your concierge will help plan, arrange, and confirm every detail
              before and during your stay.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
            {[
              {
                icon: Plane,
                title: 'Private Airport Transfers',
                description: 'Seamless arrival & departure planning.'
              },
              {
                icon: Car,
                title: 'Rental Vehicles Delivered to Your Villa',
                description: 'Skip the rental counter entirely.'
              },
              {
                icon: ShoppingCart,
                title: 'Grocery Pre-Stocking & Customized Menu Planning',
                description: 'Arrive to a fully prepared kitchen.'
              },
              {
                icon: ChefHat,
                title: 'Private Chef or Chef-On-Request',
                description:
                  'Local, professional, and destination-savvy chefs.'
              },
              {
                icon: Sparkles,
                title: 'Spa & Massage Treatments In-Villa',
                description: 'Therapists come directly to the villa.'
              },
              {
                icon: Dumbbell,
                title: 'Fitness, Yoga, & Personal Training',
                description: 'Sessions tailored to your group.'
              },
              {
                icon: Baby,
                title: 'Babysitting & Childcare Services',
                description:
                  'Vetted caretakers experienced with traveling families.'
              },
              {
                icon: PartyPopper,
                title: 'Celebration & Event Coordination',
                description:
                  'Support for birthdays, milestones, and special occasions.'
              }
            ].map((service, index) => (
              <div
                key={index}
                className="bg-white p-5 rounded-[10px] border border-[#ECECEC] shadow-sm flex gap-4 items-start"
              >
                <service.icon className="w-[22px] h-[22px] text-[#2A2A2A] flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-base font-medium text-gray-900 mb-1.5">
                    {service.title}
                  </h4>
                  <p className="text-sm text-[#6A6A6A] leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Location Section */}
      <section className="py-12 px-6 border-b border-border">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-foreground">
            Location
          </h2>
          <div className="flex items-start gap-2 text-muted-foreground mb-6">
            <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <p className="text-sm">Located in {getVillaNetLocation()}</p>
          </div>
          {listing.lat != null && listing.lng != null ? (
            <div className="w-full h-[400px] md:h-[500px] rounded-lg overflow-hidden border border-border relative">
              <PropertyMap lat={listing.lat} lng={listing.lng} name={listing.name} />

              {/* ✅ Botón overlay */}
              <a
                href={`https://www.google.com/maps?q=${listing.lat},${listing.lng}%20(${encodeURIComponent(listing.name)})`}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-4 right-4 z-20 inline-flex items-center gap-2 rounded-full bg-white/95 backdrop-blur px-4 py-2 text-sm font-medium text-gray-900 border border-gray-200 shadow hover:bg-white hover:shadow-md transition"
              >
                <MapPin className="w-4 h-4" />
                Open in Google Maps
              </a>
            </div>
          ) : (
            <div className="w-full h-[400px] md:h-[500px] rounded-lg overflow-hidden border border-border bg-gray-100 flex items-center justify-center">
              <p className="text-gray-500">Exact location not available.</p>
            </div>
          )}
        </div>
      </section>

      {/* Designed For Section */}
      <section className="py-12 px-6 border-t border-b border-[#E5E5E5]">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold mb-3 text-gray-900">
              Designed For
            </h3>
            <p className="text-sm text-gray-600 max-w-3xl mx-auto">
              This villa offers the space, privacy, and full-service support
              ideal for groups traveling together.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                icon: Users,
                title: 'Multi-Generation Family Gatherings',
                description: 'Plenty of bedrooms & shared living spaces.'
              },
              {
                icon: PartyPopper,
                title: 'Retreats, Birthdays & Special Occasions',
                description: 'Concierge coordination available.'
              },
              {
                icon: Briefcase,
                title: 'Longer Executive or Remote-Work Escapes',
                description: 'High-speed WiFi + quiet workspace areas.'
              },
              {
                icon: Shield,
                title: 'Groups Seeking Privacy, Space & Dedicated Staff',
                description: 'Full-service villa lifestyle.'
              }
            ].map((item, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center gap-4"
              >
                <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center">
                  <item.icon className="w-7 h-7 text-gray-900" />
                </div>
                <div>
                  <h4 className="text-base font-semibold text-gray-900 mb-2">
                    {item.title}
                  </h4>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guest Reviews Section */}
      <section className="py-12 px-6 border-t border-b border-[#E5E5E5] bg-[#FAFAFA]">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">
              Guest Reviews
            </h3>
            <p className="text-sm text-gray-600 max-w-3xl mx-auto mb-6">
              See what our guests say about their Villa Net experiences.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {[
              {
                rating: 5,
                text: 'Our family of 12 had an incredible week at this villa in St Barts. The property exceeded all expectations with its stunning views, impeccable cleanliness, and thoughtful amenities. The concierge team was responsive and helped us arrange everything from private chef dinners to boat excursions.',
                author: 'Sarah M.',
                location: 'Boston, MA',
                date: 'March 2025'
              },
              {
                rating: 5,
                text: 'The villa we booked in Barbados was exactly as described, and the staff went above and beyond to ensure our stay was perfect. Already planning our next trip!',
                author: 'Michael R.',
                location: 'London, UK',
                date: 'February 2025'
              }
            ].map((review, index) => (
              <div
                key={index}
                className="bg-white border border-[#E9E9E9] rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex gap-1 mb-3">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 text-[#FFB800] fill-[#FFB800]"
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed mb-4">
                  {review.text}
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {review.author}
                    </p>
                    <p className="text-xs text-gray-500">
                      {review.location}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500">{review.date}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center">
            <button className="border border-[#E9E9E9] rounded-lg px-6 py-3 text-[15px] font-medium text-gray-900 hover:bg-gray-50 hover:border-gray-400 transition-colors">
              Show More Reviews (8 more)
            </button>
          </div>
        </div>
      </section>

      {/* Villa Net Collections Section */}
      {/*      <section className="py-12 px-6 border-b border-[#E5E5E5]">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">
              Similar Villa Experiences
            </h3>
            <p className="text-sm text-gray-600 max-w-3xl mx-auto mb-6">
              Discover other villas with features like this one.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {(() => {
              // Mapear características de esta propiedad a colecciones
              const propertyFeatures = [
                { condition: listing.villanet_true_beach_front, badge: 'true-beach-front', name: 'Beachfront Villas' },
                { condition: listing.villanet_chef_included, badge: 'chef-included', name: 'Fully-Staffed Properties' },
                { condition: listing.villanet_ocean_view, badge: 'ocean-view', name: 'Ocean View' },
                { condition: listing.villanet_heated_pool, badge: 'heated-pool', name: 'Heated Pool' },
                { condition: listing.villanet_golf_villa, badge: 'golf-villa', name: 'Golf Course Villas' },
                { condition: listing.villanet_resort_villa, badge: 'resort-villa', name: 'Resort Communities' },
                { condition: listing.villanet_private_gym, badge: 'private-gym', name: 'Private Gym' },
                { condition: listing.villanet_gated_community, badge: 'gated-community', name: 'Gated Community' },
                { condition: listing.villanet_tennis, badge: 'tennis', name: 'Tennis' },
                { condition: listing.villanet_pickleball, badge: 'pickleball', name: 'Pickleball' },
                { condition: listing.villanet_private_cinema, badge: 'private-cinema', name: 'Private Cinema' },
              ];
              
              // Filtrar solo las características que SÍ tiene esta propiedad
              const availableFeatures = propertyFeatures.filter(f => f.condition);
              
              // Crear array de colecciones para mostrar
              const displayFeatures: Array<{badge?: string, filter?: string, name: string}> = [...availableFeatures];
              
              // Si tiene menos de 6 características, agregar algunas genéricas
              if (displayFeatures.length < 6) {
                const genericCollections = [
                  { badge: 'ocean-view', name: 'Ultra-Luxe Estates' },
                  { filter: 'sort=rank', name: 'Top Rated' },
                  { filter: `bedrooms=${listing.bedrooms || '4'}`, name: 'Family Villas' },
                ];
                
                genericCollections.forEach(collection => {
                  if (displayFeatures.length < 6 && !displayFeatures.some(f => f.name === collection.name)) {
                    displayFeatures.push(collection);
                  }
                });
              }
              
              // Limitar a 6
              return displayFeatures.slice(0, 6).map((feature, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (feature.badge) {
                      navigate(`/properties?badge=${feature.badge}`);
                    } else if (feature.filter) {
                      const params = new URLSearchParams(feature.filter);
                      navigate(`/properties?${params.toString()}`);
                    }
                  }}
                  className="block p-4 text-[15px] font-medium text-gray-900 text-center border border-[#E9E9E9] rounded-[10px] hover:border-gray-400 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  {feature.name}
                </button>
              ));
            })()}
          </div>
        </div>
      </section>
*/}
      {/* Booking & Stay Details Section */}
      <AccordeonBooking />

      {/* Botón Rank flotante */}
      <button
        onClick={openRankModal}
        className={`fixed bottom-6 z-40 px-4 py-2.5 bg-white border border-[#E5E5E5] rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 text-gray-700 hover:text-gray-900 animate-fade-in ${cartCount > 0 ? 'right-32' : 'right-6'}`}
        aria-label="Learn about Villa Net Rank"
      >
        <Sparkles className="h-4 w-4" />
        <span className="text-sm font-medium max-md:hidden">
          Villa Net Rank?
        </span>
        <span className="text-sm font-medium md:hidden">Villa Rank?</span>
      </button>

      {/* Desktop sticky CTA debajo del navbar */}
      <div
        className={`hidden md:block fixed left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E5E5E5] shadow-sm top-16 
     transition-all duration-300 ease-in-out 
     ${showDesktopCTA
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-y-4 pointer-events-none'
          }`}
      >
        <div className="container mx-auto px-6 py-4 md:max-w-4xl">
          <div className="flex gap-3 items-center">
            <div className="flex-1 flex gap-3">
              <button
                onClick={handleToggleCart}
                className={`inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 py-2 flex-1 h-14 px-8 !rounded-xl font-bold uppercase tracking-wider shadow-lg hover:shadow-xl transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.98] ${
                  isPropertyInCart
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700 border border-emerald-700'
                    : 'bg-gray-900 text-white hover:bg-gray-800 border border-gray-800'
                }`}
              >
                {isPropertyInCart ? (
                  <>
                    <Minus className="w-4 h-4" />
                    REMOVE FROM QUOTE
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    ADD TO QUOTE
                  </>
                )}
              </button>
            </div>

            {/* Botón del carrito en sticky CTA */}
            {cartCount > 0 && (
              <button
                onClick={openCartModal}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium bg-white border border-gray-300 text-gray-900 hover:bg-gray-50"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Quote ({cartCount})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <BookingModal
        isOpen={showBookingForm}
        onClose={() => setShowBookingForm(false)}
        listing={listing}
        unavailableDates={unavailableDates}
        user={user}
        prefilledCheckIn={checkIn}
        prefilledCheckOut={checkOut}
        prefilledGuests={guests}
      />
      <VillaNetRankModal isOpen={showRankModal} onClose={closeRankModal} />

      <div className="lg:hidden mb-[50px] bottom-0 left-0 right-0">
        <Footer />
      </div>

      <style>
        {`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes pulse-subtle {
            0%, 100% {
              transform: scale(1);
              opacity: 1;
            }
            50% {
              transform: scale(1.05);
              opacity: 0.9;
            }
          }

          .animate-fade-in {
            animation: fadeInUp 0.5s ease-out 1s both, pulse-subtle 2s ease-in-out 5s infinite;
          }
        `}
      </style>
    </div>
  );
}