import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, X, Bed, Bath, MapPin, SlidersHorizontal, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { api } from '../api/api';


type Listing = {
  id: string;
  listing_id?: string;
  name: string;
  bedrooms: number | null;
  bathrooms: number | null;
  priceUSD: number | null;
  location: string | null;
  heroImage: string | null;
  images_json?: string[];
};

function useDebounce<T>(v: T, ms: number) {
  const [d, set] = useState(v);
  useEffect(() => {
    const t = setTimeout(() => set(v), ms);
    return () => clearTimeout(t);
  }, [v, ms]);
  return d;
}

const ITEMS_PER_PAGE = 9;
const PLACEHOLDER = 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80&auto=format&fit=crop';

export default function Properties() {
  const { user, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [bedrooms, setBedrooms] = useState<string[]>([]);
  const [bathrooms, setBathrooms] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const [items, setItems] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const deb = useDebounce(query, 600);
  const skeletons = useMemo(() => Array.from({ length: 9 }).map((_, i) => ({ _key: `sk-${i}` })), []);

  // --- Fetch listado ---
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }


    const controller = new AbortController();
    let timeoutId: number | undefined;

    (async () => {
      timeoutId = window.setTimeout(async () => {
        setLoading(true);
        setError(null);
        try {
          const qs = new URLSearchParams();
          if (deb.trim().length >= 3) qs.set('q', deb.trim());
          if (bedrooms.length) qs.set('bedrooms', bedrooms.join(','));
          if (bathrooms.length) qs.set('bathrooms', bathrooms.join(','));
          if (minPrice) qs.set('minPrice', String(Number(minPrice) || ''));
          if (maxPrice) qs.set('maxPrice', String(Number(maxPrice) || ''));

          const data = await api<{ results: Listing[] }>(`/listings?${qs.toString()}`, {
            signal: controller.signal
          });

          if (!controller.signal.aborted) {
            const normalizedResults = (data.results || []).map(item => ({
              ...item,
              id: item.id || item.listing_id || `temp-${Math.random()}`,
              heroImage: item.heroImage || PLACEHOLDER
            }));
            
            setItems(normalizedResults);
            setCurrentPage(1);
          }
        } catch (err: any) {
          if (!controller.signal.aborted) {
            const msg = typeof err?.message === 'string' ? err.message : 'Failed to fetch listings';
            setError(
              msg.includes('429')
                ? 'Rate limit exceeded. Please wait a moment and try again.'
                : msg.includes('401')
                ? 'Session expired. Please log in again.'
                : 'Server error. Please try again later.'
            );
            setItems([]);
          }
        } finally {
          if (!controller.signal.aborted) setLoading(false);
        }
      }, 200);
    })();

    return () => {
      controller.abort();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [deb, bedrooms, bathrooms, minPrice, maxPrice, user, authLoading]);

  const toggleOption = (value: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => (prev.includes(value) ? prev.filter(x => x !== value) : [...prev, value]));
  };

  const handleBookNow = (property: Listing) => {
    console.log('Booking property:', property);
    alert(`Booking feature for ${property.name} will be implemented soon!`);
  };

  const clearAllFilters = () => {
    setQuery('');
    setBedrooms([]);
    setBathrooms([]);
    setMinPrice('');
    setMaxPrice('');
    setCurrentPage(1);
  };

  const retryFetch = () => {
    setError(null);
    setBedrooms(prev => [...prev]);
  };

  const activeFiltersCount = bedrooms.length + bathrooms.length + (minPrice ? 1 : 0) + (maxPrice ? 1 : 0);

  // --- Paginación ---
  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE) || 1;
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return items.slice(start, start + ITEMS_PER_PAGE);
  }, [items, currentPage]);

  const goToPage = (p: number) => {
    setCurrentPage(Math.min(Math.max(1, p), totalPages));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

// Helper para obtener el id correcto para la ruta
const getRealId = (it: Listing) => (it as any).listing_id || it.id;

// Reemplaza tu handlePropertyClick por:
const goToDetail = (propertyIdOrObj: string | Listing) => {
    const realId = typeof propertyIdOrObj === 'string'
      ? propertyIdOrObj
      : getRealId(propertyIdOrObj);
    if (!realId) return;
    navigate(`/property/${realId}`); 
  };

  // --- Helpers ---
  const formatMoney = (n: number | null | undefined) =>
    n == null ? '—' : `$${n.toLocaleString()}`;

  // --- Early returns por auth ---
  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Authentication Required</h2>
          <p className="text-neutral-600 mb-4">Please log in to view properties</p>
          <button
            onClick={() => (window.location.href = '/login')}
            className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (user.status === 'pending') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-yellow-600 mb-2">Account Pending Approval</h2>
          <p className="text-neutral-600">Your account is waiting for administrator approval.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-neutral-200">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
      <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-neutral-900">Properties</h1>
      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
        {/* 👇 Solo admins */}
        <span className="text-xs sm:text-sm text-neutral-600 truncate">
          {user.full_name} <span className="hidden sm:inline">({user.role})</span>
        </span>
        {user.role === 'admin' && (
          <Link
            to="/admin/users"       
            className="text-xs sm:text-sm text-white px-3 py-2 rounded-lg bg-neutral-400 hover:bg-neutral-500 transition whitespace-nowrap"
          >
            Go to Dashboard
          </Link>
        )}
        <button
          onClick={logout}
          className="text-xs sm:text-sm text-orange-500 hover:text-orange-600 whitespace-nowrap"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
</header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              className="w-full pl-12 pr-24 py-3.5 border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by name or location (3+ chars)"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-16 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-neutral-700 hover:text-orange-500 transition"
            >
              <SlidersHorizontal className="w-5 h-5" />
              {activeFiltersCount > 0 && (
                <span className="bg-orange-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mb-6 p-6 border border-neutral-200 rounded-lg bg-neutral-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-neutral-900">Filters</h3>
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-orange-500 hover:text-orange-600 font-medium transition"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Bedrooms */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-3">Bedrooms</label>
                <div className="flex flex-wrap gap-2">
                  {['2', '3', '4', '5', '6+'].map(opt => (
                    <button
                      key={opt}
                      onClick={() => toggleOption(opt, setBedrooms)}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${
                        bedrooms.includes(opt)
                          ? 'bg-neutral-900 text-white border-neutral-900'
                          : 'bg-white text-neutral-700 border-neutral-300 hover:border-neutral-400'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bathrooms */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-3">Bathrooms</label>
                <div className="flex flex-wrap gap-2">
                  {['2', '3', '4', '5+'].map(opt => (
                    <button
                      key={opt}
                      onClick={() => toggleOption(opt, setBathrooms)}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${
                        bathrooms.includes(opt)
                          ? 'bg-neutral-900 text-white border-neutral-900'
                          : 'bg-white text-neutral-700 border-neutral-300 hover:border-neutral-400'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="md:col-span-2 lg:col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-3">Price Range (USD)</label>
                <div className="flex gap-3">
                  <input
                    className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                    inputMode="numeric"
                    value={minPrice}
                    onChange={e => setMinPrice(e.target.value)}
                    placeholder="Min"
                  />
                  <span className="text-neutral-400 self-center">—</span>
                  <input
                    className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                    inputMode="numeric"
                    value={maxPrice}
                    onChange={e => setMaxPrice(e.target.value)}
                    placeholder="Max"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-red-800 font-medium">Error loading properties</h3>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
              <button
                onClick={retryFetch}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm font-medium"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Counter / page */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-neutral-600">
            {loading
              ? 'Loading...'
              : `Showing ${(currentPage - 1) * ITEMS_PER_PAGE + 1}-${Math.min(
                  currentPage * ITEMS_PER_PAGE,
                  items.length
                )} of ${items.length} ${items.length === 1 ? 'property' : 'properties'}`}
          </p>
          {!loading && totalPages > 1 && (
            <p className="text-sm text-neutral-600">Page {currentPage} of {totalPages}</p>
          )}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(loading ? skeletons : currentItems).map((it: any, idx: number) =>
            loading ? (
              <div key={it._key} className="animate-pulse">
                <div className="aspect-[4/3] bg-neutral-200 rounded-lg mb-4" />
                <div className="h-6 bg-neutral-200 rounded mb-2" />
                <div className="h-4 bg-neutral-200 rounded w-2/3 mb-3" />
                <div className="h-4 bg-neutral-200 rounded w-1/2" />
              </div>
            ) : (
              <article
                key={`property-${it.id}-${idx}`}
                className="group bg-white rounded-lg border border-neutral-200 overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                {/* Imagen clickeable */}
                <div 
                  className="relative aspect-[4/3] overflow-hidden bg-neutral-100 cursor-pointer"
                  onClick={() => goToDetail(it)}
                >
                  <img
                    src={it.heroImage || PLACEHOLDER}
                    alt={it.name || 'Property'}
                    loading="lazy"
                    onError={ev => ((ev.target as HTMLImageElement).src = PLACEHOLDER)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Contenido de la tarjeta */}
                <div className="p-4">
                  <h3 
                    className="text-lg font-medium text-neutral-900 mb-1 hover:text-orange-500 transition cursor-pointer"
                    onClick={() => goToDetail(it)}
                  >
                    {it.name || 'Unnamed Property'}
                  </h3>
                  
                  <div className="flex items-center gap-1 text-sm text-neutral-600 mb-3">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{it.location || '—'}</span>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4 text-sm text-neutral-600">
                      <span className="flex items-center gap-1.5">
                        <Bed className="w-4 h-4" />
                        {it.bedrooms ?? '—'}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Bath className="w-4 h-4" />
                        {it.bathrooms ?? '—'}
                      </span>
                    </div>
                    <span className="text-lg font-semibold text-neutral-900">
                      {formatMoney(it.priceUSD)}
                    </span>
                  </div>

                  {/* Botones visibles siempre */}
                  <div className="flex gap-2 pt-2 border-t border-neutral-100">
                    <button
                      onClick={() => goToDetail(it)}
                      className="flex-1 bg-neutral-100 text-neutral-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-neutral-200 transition-colors"
                    >
                      More Info
                    </button>
                    <button
                      onClick={() => handleBookNow(it)}
                      className="flex-1 bg-orange-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </article>
            )
          )}
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
              const showPage =
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1);
              const showEllipsis =
                (page === 2 && currentPage > 3) ||
                (page === totalPages - 1 && currentPage < totalPages - 2);

              if (!showPage && !showEllipsis) return null;
              if (showEllipsis) return <span key={page} className="px-2 text-neutral-400">…</span>;

              return (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${
                    currentPage === page
                      ? 'bg-neutral-900 text-white border-neutral-900'
                      : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {!loading && items.length === 0 && !error && (
          <div className="text-center py-12">
            <p className="text-neutral-500">No properties found matching your criteria.</p>
            <button onClick={clearAllFilters} className="mt-4 text-orange-500 hover:text-orange-600 font-medium">
              Clear all filters
            </button>
          </div>
        )}
      </div>

    </div>
  );
}