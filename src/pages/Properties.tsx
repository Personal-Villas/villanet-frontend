import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Bed, Bath, MapPin, SlidersHorizontal, LogOut } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { api } from '../api/api';

type Listing = {
  id: string;
  name: string;
  bedrooms: number | null;
  bathrooms: number | null;
  priceUSD: number | null;
  location: string | null;
  heroImage: string | null;
};

function useDebounce<T>(v: T, ms: number) {
  const [d, set] = useState(v);
  useEffect(() => {
    const t = setTimeout(() => set(v), ms);
    return () => clearTimeout(t);
  }, [v, ms]);
  return d;
}

const ITEMS_PER_PAGE = 24;
const PLACEHOLDER = 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80&auto=format&fit=crop';

export default function Properties() {
  const { user, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();
  
  // Filters
  const [query, setQuery] = useState('');
  const [bedrooms, setBedrooms] = useState<string[]>([]);
  const [bathrooms, setBathrooms] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Pagination state
  const [items, setItems] = useState<Listing[]>([]);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const deb = useDebounce(query, 600);
  
  // Infinite scroll observer
  const observerTarget = useRef<HTMLDivElement>(null);

  // Reset pagination when filters change
  useEffect(() => {
    setOffset(0);
    setItems([]);
    setHasMore(true);
  }, [deb, bedrooms, bathrooms, minPrice, maxPrice]);

  // Fetch listings
  useEffect(() => {
    if (authLoading || !user) return;

    const controller = new AbortController();

    (async () => {
      setLoading(true);
      setError(null);
      
      try {
        const qs = new URLSearchParams();
        if (deb.trim().length >= 3) qs.set('q', deb.trim());
        if (bedrooms.length) qs.set('bedrooms', bedrooms.join(','));
        if (bathrooms.length) qs.set('bathrooms', bathrooms.join(','));
        if (minPrice) qs.set('minPrice', String(Number(minPrice) || ''));
        if (maxPrice) qs.set('maxPrice', String(Number(maxPrice) || ''));
        qs.set('limit', String(ITEMS_PER_PAGE));
        qs.set('offset', String(offset));

        const data = await api<{
          results: Listing[];
          total: number;
          hasMore: boolean;
        }>(`/listings?${qs.toString()}`, { signal: controller.signal });

        if (!controller.signal.aborted) {
          const normalized = (data.results || []).map(item => ({
            ...item,
            id: item.id || `temp-${Math.random()}`,
            heroImage: item.heroImage || PLACEHOLDER
          }));

          setItems(prev => offset === 0 ? normalized : [...prev, ...normalized]);
          setTotal(data.total);
          setHasMore(data.hasMore);
        }
      } catch (err: any) {
        if (!controller.signal.aborted) {
          setError(
            err.message?.includes('429')
              ? 'Rate limit exceeded. Please wait.'
              : err.message?.includes('401')
              ? 'Session expired. Please log in.'
              : 'Server error. Please try again.'
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [deb, bedrooms, bathrooms, minPrice, maxPrice, offset, user, authLoading]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!observerTarget.current || loading || !hasMore) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setOffset(prev => prev + ITEMS_PER_PAGE);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [loading, hasMore]);

  const toggleOption = useCallback((value: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => prev.includes(value) ? prev.filter(x => x !== value) : [...prev, value]);
  }, []);

  const clearAllFilters = useCallback(() => {
    setQuery('');
    setBedrooms([]);
    setBathrooms([]);
    setMinPrice('');
    setMaxPrice('');
  }, []);

  const goToDetail = useCallback((property: Listing) => {
    navigate(`/property/${property.id}`);
  }, [navigate]);

  const formatMoney = (n: number | null | undefined) =>
    n == null ? '—' : `$${n.toLocaleString()}`;

  const activeFiltersCount = bedrooms.length + bathrooms.length + (minPrice ? 1 : 0) + (maxPrice ? 1 : 0);

  // Auth guards
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
            onClick={() => navigate('/login')}
            className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-neutral-200 sticky top-0 bg-white z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-neutral-900">
              Properties
              {total > 0 && <span className="text-base text-neutral-500 ml-2">({total.toLocaleString()})</span>}
            </h1>
            <div className="flex items-center gap-3">
              <span className="text-sm text-neutral-600 hidden sm:block">{user.full_name}</span>
              {user.role === 'admin' && (
                <button
                  onClick={() => navigate('/admin/users')}
                  className="text-sm px-3 py-2 rounded-lg bg-neutral-400 text-white hover:bg-neutral-500 transition"
                >
                  Dashboard
                </button>
              )}
              <button onClick={logout} className="text-orange-500 hover:text-orange-600" title="Logout">
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
              className="w-full pl-12 pr-24 py-3.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by name or location (3+ chars)"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-16 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-neutral-700 hover:text-orange-500"
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
                <button onClick={clearAllFilters} className="text-sm text-orange-500 hover:text-orange-600 font-medium">
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
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-3">Price Range (USD)</label>
                <div className="flex gap-3">
                  <input
                    className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    inputMode="numeric"
                    value={minPrice}
                    onChange={e => setMinPrice(e.target.value)}
                    placeholder="Min"
                  />
                  <span className="text-neutral-400 self-center">—</span>
                  <input
                    className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
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
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, idx) => (
            <article
              key={`${item.id}-${idx}`}
              className="group bg-white rounded-lg border border-neutral-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer"
              onClick={() => goToDetail(item)}
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                <img
                  src={item.heroImage || PLACEHOLDER}
                  alt={item.name}
                  loading="lazy"
                  onError={ev => ((ev.target as HTMLImageElement).src = PLACEHOLDER)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="p-4">
                <h3 className="text-lg font-medium text-neutral-900 mb-1 group-hover:text-orange-500 transition">
                  {item.name}
                </h3>
                
                <div className="flex items-center gap-1 text-sm text-neutral-600 mb-3">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{item.location || '—'}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-neutral-600">
                    <span className="flex items-center gap-1.5">
                      <Bed className="w-4 h-4" />
                      {item.bedrooms ?? '—'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Bath className="w-4 h-4" />
                      {item.bathrooms ?? '—'}
                    </span>
                  </div>
                  <span className="text-lg font-semibold text-neutral-900">
                    {formatMoney(item.priceUSD)}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Loading indicator */}
        {loading && offset > 0 && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        )}

        {/* Infinite scroll trigger */}
        <div ref={observerTarget} className="h-10" />

        {/* No results */}
        {!loading && items.length === 0 && (
          <div className="text-center py-12">
            <p className="text-neutral-500">No properties found.</p>
            {activeFiltersCount > 0 && (
              <button onClick={clearAllFilters} className="mt-4 text-orange-500 hover:text-orange-600 font-medium">
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* End message */}
        {!loading && items.length > 0 && !hasMore && (
          <p className="text-center py-8 text-neutral-500">
            You've reached the end • {items.length} of {total} properties
          </p>
        )}
      </div>
    </div>
  );
}