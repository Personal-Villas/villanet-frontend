import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { MapPin, Bed, Bath, ChevronLeft, ChevronRight, ArrowLeft, Calendar, Moon } from 'lucide-react';
import { api } from '../api/api';
import Header from '../components/Header';
import Footer from '../components/Footer';

type Listing = {
  listing_id: string;
  name: string;
  location_text: string | null;
  city: string | null;
  country: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  price_usd: number | null;
  hero_image_url: string | null;
  images_json: string[];
  description?: string;
  lat?: number; lng?: number;
  amenities?: string[];
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
const addDays = (d: Date, n: number) => { 
  const x = new Date(d); 
  x.setDate(x.getDate() + n); 
  return x; 
};

function MonthGrid({ ym, days }: { ym: string; days: Day[] }) {
  const [Y, M] = ym.split('-').map(Number);
  const first = new Date(Y, M - 1, 1);
  const startWeekday = first.getDay();
  const numDays = new Date(Y, M, 0).getDate();

  const byDay = new Map<number, Day>();
  for (const d of days) {
    const dayNum = Number(d.date.slice(8, 10));
    byDay.set(dayNum, d);
  }

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(<div key={`pad-${i}`} className="p-2" />);
  for (let day = 1; day <= numDays; day++) {
    const info = byDay.get(day);
    const available = info
      ? (info.allotment != null ? info.allotment > 0 : info.status === 'available')
      : null;
    
    const bgColor = 
      available === true  ? 'bg-white hover:bg-gray-50' :
      available === false ? 'bg-gray-100' :
                            'bg-white hover:bg-gray-50';
    
    const priceColor = available === false ? 'text-gray-400' : 'text-gray-900';
    const dayColor = available === false ? 'text-gray-400' : 'text-gray-600';
    
    cells.push(
      <div 
        key={day} 
        className={`p-2 border-r border-b border-gray-200 transition-colors ${bgColor} ${available === false ? 'cursor-not-allowed' : 'cursor-pointer'} min-h-[90px] flex flex-col`}
      >
        <div className={`text-xs mb-2 font-medium ${dayColor} text-right`}>
          {String(day).padStart(2,'0')}
        </div>
        <div className={`lg:text-sm text-[10px] underline decoration-gray-300 underline-offset-4 font-semibold mb-2 ${priceColor} text-center`}>
          ${Number.isFinite(info?.price as any) ? `${(info!.price as number).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : ''}
        </div>
        <div className="mt-auto flex items-center justify-center gap-2">
          {info?.allotment != null && (
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <span>{info.allotment}</span>
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            </div>
          )}
          {info?.minStay != null && info.minStay > 1 && (
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <span>{info.minStay}</span>
              <Moon className="w-3.5 h-3.5" />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="text-base font-bold p-4 bg-white border-b border-gray-200 text-gray-900">
        {first.toLocaleString('en-US', { month:'long', year:'numeric' })}
      </div>
      <div className="grid grid-cols-7">
        <WeekHeader />
        {cells}
      </div>
    </div>
  );
}

function WeekHeader() {
  const labels = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  return (
    <>
      {labels.map(l => (
        <div key={l} className="text-xs font-semibold text-gray-700 text-center py-2.5 bg-white border-r border-b border-gray-200 last:border-r-0">
          {l}
        </div>
      ))}
    </>
  );
}

const cleanDescription = (text: string) => {
    // Primero, procesar el texto para identificar patrones especiales
    const lines = text.split('\n');
    const processedLines: (string | JSX.Element)[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Detectar líneas que comienzan con ** para negritas
      if (line.startsWith('**') && line.endsWith('**')) {
        processedLines.push(
          <strong key={i} className="text-neutral-900 font-semibold">
            {line.slice(2, -2)}
          </strong>
        );
      }
      // Detectar líneas que son títulos en mayúsculas (como "AMENITIES", "BEDROOM CONFIGURATION")
      else if (line === line.toUpperCase() && line.length > 3 && !line.includes('*')) {
        processedLines.push(
          <h4 key={i} className="text-lg font-semibold text-neutral-900 mt-4 mb-2">
            {line}
          </h4>
        );
      }
      // Detectar líneas que comienzan con * para lista de amenities
      else if (line.startsWith('* ') && line.length > 2) {
        processedLines.push(
          <div key={i} className="flex items-start gap-2 text-neutral-600 ml-4">
            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
            <span>{line.slice(2)}</span>
          </div>
        );
      }
      // Detectar líneas que son subtítulos (como "Grand Master:", "Bedroom 2:")
      else if (line.includes(':') && !line.startsWith('*') && line.length - line.indexOf(':') < 30) {
        processedLines.push(
          <div key={i} className="font-semibold text-neutral-900 mt-2">
            {line}
          </div>
        );
      }
      // Líneas normales de texto
      else if (line) {
        processedLines.push(line);
      }
      // Líneas vacías para separación
      else if (i > 0 && lines[i-1].trim()) {
        processedLines.push(<br key={i} />);
      }
    }
    
    return processedLines;
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

  // ✅ Estados para el Header (pueden ser vacíos ya que no usamos search/filters aquí)
  const [query, setQuery] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);

  const [start, setStart] = useState(() => {
    const s = new Date();
    s.setDate(1);
    return s;
  });
  
  const end = useMemo(() => {
    const e = new Date(start);
    e.setMonth(e.getMonth() + 2);
    e.setDate(0); // Last day of second month
    return e;
  }, [start]);

  const months = useMemo(() => {
    const map = new Map<string, Day[]>();
    for (const d of days) {
      const key = d.date.slice(0,7);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(d);
    }
    return Array.from(map.entries()).sort(([a],[b]) => a < b ? -1 : 1);
  }, [days]);

  const images = useMemo(() => {
    if (!listing) return ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80&auto=format&fit=crop'];
    
    const imgs = listing.images_json || [];
    const hero = listing.hero_image_url;
    
    // Filtrar imágenes duplicadas y asegurar calidad
    const uniqueImages = Array.from(new Set([
      ...(hero ? [hero] : []),
      ...imgs
    ])).filter(img => img && img.trim() !== '');
    
    // Priorizar imágenes de mayor calidad
    const sortedImages = uniqueImages.sort((a, b) => {
      // Si una imagen parece ser de baja calidad, ponerla al final
      if (a.includes('thumbnail') || a.includes('small')) return 1;
      if (b.includes('thumbnail') || b.includes('small')) return -1;
      return 0;
    });
    
    return sortedImages.length > 0 ? sortedImages : ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80&auto=format&fit=crop'];
  }, [listing]);

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
        const listingData = await api<Listing>(`/listings/${id}`);
        setListing({
          ...listingData,
          images_json: Array.isArray(listingData?.images_json) ? listingData.images_json : [],
        });
      } catch (err: any) {
        console.error('Error fetching property details:', err);
        
        if (err?.message?.includes('401') || err?.message?.includes('Authentication')) {
          setError('Your session has expired. Please log in again.');
        } else if (err?.message?.includes('404') || err?.message?.includes('not found')) {
          setError('Property not found');
        } else if (err?.message?.includes('500')) {
          setError('Server error. Please try again later.');
        } else if (err?.message?.includes('Rate limit')) {
          setError('Rate limit exceeded. Please wait a moment and try again.');
        } else {
          setError(err?.message || 'Failed to load property details');
        }
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
        const availabilityData = await api<{ days: Day[] }>(`/availability/${id}?from=${from}&to=${to}`);
        
        // 🔍 DEBUG: Ver qué llega del backend
        console.log('📅 Availability data received:', availabilityData);
        console.log('📅 First 3 days:', availabilityData?.days?.slice(0, 3));
        
        setDays(availabilityData?.days || []);
      } catch (err: any) {
        console.error('Error fetching availability:', err);
        
        if (err?.message?.includes('500')) {
          setAvailabilityError('Availability service temporarily unavailable');
        } else if (err?.message?.includes('401')) {
          setAvailabilityError('Sign in to view availability');
        } else {
          setAvailabilityError('Unable to load availability calendar');
        }
        
        setDays([]);
      } finally {
        setLoadingAvailability(false);
      }
    };

    fetchAvailability();
  }, [id, listing, start, end]);

  const prevMonth = () => setStart(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setStart(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  const retryAvailability = () => {
    setAvailabilityError(null);
    setStart(prev => new Date(prev));
  };

  const nextImage = () => setCurrentImageIndex(prev => (prev + 1) % images.length);
  const prevImage = () => setCurrentImageIndex(prev => (prev - 1 + images.length) % images.length);

  // ✅ Calcular activeFiltersCount para el Header
  const activeFiltersCount = 0; // En property detail no hay filtros activos

  const today = new Date().toISOString().split('T')[0];
  const minCheckOut = checkIn || today;

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
            onClick={() => navigate('/properties')}
            className="flex items-center gap-2 text-orange-500 hover:text-orange-600 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Properties
          </button>
          
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
            <p className="text-neutral-600 mb-4">{error}</p>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => navigate('/properties')}
                className="bg-neutral-500 text-white px-6 py-2 rounded-lg hover:bg-neutral-600 transition"
              >
                Back to Properties
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition"
              >
                Try Again
              </button>
            </div>
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
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">Property Not Found</h2>
            <p className="text-neutral-600">The property you're looking for doesn't exist.</p>
            <button 
              onClick={() => navigate('/properties')}
              className="mt-4 bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition"
            >
              Back to Properties
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ✅ Agregar el Header */}
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

      <div className="max-w-6xl mx-auto p-4 lg:p-6 space-y-6 lg:space-y-8">
        <button 
          onClick={() => navigate('/properties')}
          className="flex items-center gap-2 text-orange-500 hover:text-orange-600"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Properties
        </button>

        {/* Property Header - MOVED BEFORE IMAGE */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold">{listing.name}</h1>
          <div className="flex items-center gap-2 text-neutral-600 mt-2">
            <MapPin className="w-4 h-4 lg:w-5 lg:h-5" />
            <span className="text-sm lg:text-base">
              {listing.location_text || `${listing.city || ''}${listing.city && listing.country ? ', ' : ''}${listing.country || ''}`}
            </span>
          </div>
        </div>

        {/* Image Carousel */}
        <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-neutral-100">
          <img 
            src={images[currentImageIndex]} 
            alt={listing.name} 
            className="object-cover w-full h-full"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80&auto=format&fit=crop';
            }}
          />
          
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
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {currentImageIndex + 1} / {images.length}
              </div>
            </>
          )}
        </div>

        {/* Property Details */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex flex-wrap gap-4 lg:gap-6 text-base lg:text-lg text-neutral-800">
            <span className="flex items-center gap-2">
              <Bed className="w-4 h-4 lg:w-5 lg:h-5" /> 
              {listing.bedrooms ?? '—'} Bedrooms
            </span>
            <span className="flex items-center gap-2">
              <Bath className="w-4 h-4 lg:w-5 lg:h-5" /> 
              {listing.bathrooms ?? '—'} Bathrooms
            </span>
          </div>
          <p className="text-xl lg:text-2xl font-semibold text-[#203F3C]">
            ${listing.price_usd?.toLocaleString() ?? '—'} / night
          </p>
        </div>

        {/* Calendar Section */}
        <div className="bg-white  p-4 lg:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 lg:mb-6 gap-3">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg lg:text-xl font-semibold">Availability Calendar</h2>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={prevMonth} 
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors bg-white"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-xs lg:text-sm text-gray-700 min-w-[160px] lg:min-w-[200px] text-center font-medium">
                {start.toLocaleString(undefined, { month:'short', year:'numeric' })} – {addDays(new Date(start), 45).toLocaleString(undefined, { month:'short', year:'numeric' })}
              </span>
              <button 
                onClick={nextMonth} 
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors bg-white"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 mb-4 text-xs lg:text-sm">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-white border-2 border-gray-300"></div>
              <span className="text-gray-600">Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-gray-200 border-2 border-gray-300"></div>
              <span className="text-gray-600">Unavailable</span>
            </div>
          </div>

          {availabilityError && (
            <div className="mb-4 p-3 lg:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div>
                  <h3 className="text-yellow-800 font-medium text-sm lg:text-base">Availability Unavailable</h3>
                  <p className="text-yellow-600 text-xs lg:text-sm mt-1">{availabilityError}</p>
                </div>
                <button
                  onClick={retryAvailability}
                  className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition text-xs lg:text-sm font-medium"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {loadingAvailability && (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
              <p className="text-neutral-600">Loading availability...</p>
            </div>
          )}

          {!loadingAvailability && days.length === 0 && !availabilityError && (
            <div className="p-8 text-center text-neutral-600">
              <Calendar className="w-12 h-12 mx-auto mb-2 text-neutral-400" />
              <p>No availability data for this period</p>
            </div>
          )}

          {!loadingAvailability && days.length > 0 && (
            <div className="grid lg:grid-cols-2 gap-4 lg:gap-6">
              {months.slice(0, 2).map(([ym, arr]) => (
                <MonthGrid key={ym} ym={ym} days={arr} />
              ))}
            </div>
          )}
        </div>

        {/* Description */}
        {listing.description && (
          <div>
            <h3 className="text-lg lg:text-xl font-semibold mb-2">Description</h3>
            <div className="text-neutral-700 leading-relaxed text-sm lg:text-base space-y-2">
              {cleanDescription(listing.description).map((item, index) => {
                if (typeof item === 'string') {
                  return <p key={index}>{item}</p>;
                }
                return item;
              })}
            </div>
          </div>
        )}

        {/* Amenities */}
        {Array.isArray(listing.amenities) && listing.amenities.length > 0 && (
          <div>
            <h3 className="text-lg lg:text-xl font-semibold mb-3">Amenities</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {listing.amenities.slice(0, 8).map((amenity, i) => (
                <div key={i} className="flex items-center gap-2 text-neutral-600">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                  <span className="text-sm lg:text-base">{amenity}</span>
                </div>
              ))}
            </div>
            {listing.amenities.length > 8 && (
              <p className="text-sm text-neutral-500 mt-3">
                +{listing.amenities.length - 8} more amenities
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 pt-6 border-t sticky bottom-0 lg:static bg-white lg:bg-transparent pb-4 lg:pb-0">
          <button 
            onClick={() => navigate('/properties')}
            className="flex-1 bg-neutral-100 text-neutral-700 px-6 py-3 rounded-lg font-medium hover:bg-neutral-200 transition-colors"
          >
            Back to Properties
          </button>
          <button 
            onClick={() => alert('Booking functionality coming soon!')}
            className="flex-1 bg-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors"
          >
            Book Now
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}