import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { MapPin, Bed, Bath, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { api } from '../api/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BookingModal from '../components/BookingModal';
import AvailabilityCalendar from '../components/AvailabilityCalendar';

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

const cleanDescription = (text: string) => {
  const lines = text.split('\n');
  const processedLines: (string | JSX.Element)[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.startsWith('**') && line.endsWith('**')) {
      processedLines.push(
        <strong key={i} className="text-neutral-900 font-semibold">
          {line.slice(2, -2)}
        </strong>
      );
    }
    else if (line === line.toUpperCase() && line.length > 3 && !line.includes('*')) {
      processedLines.push(
        <h4 key={i} className="text-lg font-semibold text-neutral-900 mt-4 mb-2">
          {line}
        </h4>
      );
    }
    else if (line.startsWith('* ') && line.length > 2) {
      processedLines.push(
        <div key={i} className="flex items-start gap-2 text-neutral-600 ml-4">
          <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
          <span>{line.slice(2)}</span>
        </div>
      );
    }
    else if (line.includes(':') && !line.startsWith('*') && line.length - line.indexOf(':') < 30) {
      processedLines.push(
        <div key={i} className="font-semibold text-neutral-900 mt-2">
          {line}
        </div>
      );
    }
    else if (line) {
      processedLines.push(line);
    }
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
  const [showBookingForm, setShowBookingForm] = useState(false);

  const [query, setQuery] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  //const [selectedBadges, setSelectedBadges] = useState<string[]>([]);

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
    if (!listing) return ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80&auto=format&fit=crop'];
    
    const imgs = listing.images_json || [];
    const hero = listing.hero_image_url;
    
    const uniqueImages = Array.from(new Set([
      ...(hero ? [hero] : []),
      ...imgs
    ])).filter(img => img && img.trim() !== '');
    
    const sortedImages = uniqueImages.sort((a, b) => {
      if (a.includes('thumbnail') || a.includes('small')) return 1;
      if (b.includes('thumbnail') || b.includes('small')) return -1;
      return 0;
    });
    
    return sortedImages.length > 0 ? sortedImages : ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80&auto=format&fit=crop'];
  }, [listing]);

  const unavailableDates = useMemo(() => {
    const unavailable = new Set<string>();
    
    for (const day of days) {
      const isAvailable = day.allotment != null 
        ? day.allotment > 0 
        : day.status === 'available';
      
      if (!isAvailable) {
        unavailable.add(day.date);
      }
    }
    
    return unavailable;
  }, [days]);

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

  const nextImage = () => setCurrentImageIndex(prev => (prev + 1) % images.length);
  const prevImage = () => setCurrentImageIndex(prev => (prev - 1 + images.length) % images.length);

  const activeFiltersCount = 0;
  const today = new Date().toISOString().split('T')[0];
  const minCheckOut = checkIn || today;

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

        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold">{listing.name}</h1>
          <div className="flex items-center gap-2 text-neutral-600 mt-2">
            <MapPin className="w-4 h-4 lg:w-5 lg:h-5" />
            <span className="text-sm lg:text-base">
              {listing.location_text || `${listing.city || ''}${listing.city && listing.country ? ', ' : ''}${listing.country || ''}`}
            </span>
          </div>
        </div>

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

        <AvailabilityCalendar
          days={days}
          loading={loadingAvailability}
          error={availabilityError}
          onRetry={retryAvailability}
        />

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

        <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 pt-6 border-t sticky bottom-0 lg:static bg-white lg:bg-transparent pb-4 lg:pb-0">
          <button 
            onClick={() => navigate('/properties')}
            className="flex-1 bg-neutral-100 text-neutral-700 px-6 py-3 rounded-lg font-medium hover:bg-neutral-200 transition-colors"
          >
            Back to Properties
          </button>
          <button 
            onClick={() => setShowBookingForm(true)}
            className="flex-1 bg-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors"
          >
            Book Now
          </button>
        </div>
      </div>

      <BookingModal
        isOpen={showBookingForm}
        onClose={() => setShowBookingForm(false)}
        listing={listing}
        unavailableDates={unavailableDates}
      />

      <Footer />
    </div>
  );
}