

interface FiltersPanelProps {
    showFilters: boolean;
    bedrooms: string[];
    setBedrooms: (bedrooms: string[]) => void;
    bathrooms: string[];
    setBathrooms: (bathrooms: string[]) => void;
    minPrice: string;
    setMinPrice: (price: string) => void;
    maxPrice: string;
    setMaxPrice: (price: string) => void;
    activeFiltersCount: number;
    clearAllFilters: () => void;
    toggleOption: (value: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => void;
  }
  
  export default function FiltersPanel({
    showFilters,
    bedrooms,
    setBedrooms,
    bathrooms,
    setBathrooms,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    activeFiltersCount,
    clearAllFilters,
    toggleOption
  }: FiltersPanelProps) {
    if (!showFilters) return null;
  
    return (
      <div className="mb-8 p-6 border border-neutral-200 rounded-2xl bg-white">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-neutral-900">Filters</h3>
          {activeFiltersCount > 0 && (
            <button 
              onClick={clearAllFilters} 
              className="text-neutral-700 hover:text-neutral-900 font-medium underline"
            >
              Clear all
            </button>
          )}
        </div>
  
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Bedrooms */}
          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-3">Bedrooms</label>
            <div className="flex flex-wrap gap-2">
              {['1', '2', '3', '4', '5', '6+'].map(opt => (
                <button
                  key={opt}
                  onClick={() => toggleOption(opt, setBedrooms as React.Dispatch<React.SetStateAction<string[]>>)}
                  className={`px-4 py-2 rounded-full border text-sm font-medium transition ${
                    bedrooms.includes(opt)
                      ? 'bg-neutral-900 text-white border-neutral-900'
                      : 'bg-white text-neutral-700 border-neutral-300 hover:border-neutral-900'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
  
          {/* Bathrooms */}
          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-3">Bathrooms</label>
            <div className="flex flex-wrap gap-2">
              {['1', '2', '3', '4', '5+'].map(opt => (
                <button
                  key={opt}
                  onClick={() => toggleOption(opt, setBathrooms as React.Dispatch<React.SetStateAction<string[]>>)}
                  className={`px-4 py-2 rounded-full border text-sm font-medium transition ${
                    bathrooms.includes(opt)
                      ? 'bg-neutral-900 text-white border-neutral-900'
                      : 'bg-white text-neutral-700 border-neutral-300 hover:border-neutral-900'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
  
          {/* Price Range */}
          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-3">Price Range (USD)</label>
            <div className="ml-[-20px] flex space-x-1">
              <input
                className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                inputMode="numeric"
                value={minPrice}
                onChange={e => setMinPrice(e.target.value)}
                placeholder="Min"
              />
              <span className="text-neutral-400 self-center">—</span>
              <input
                className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                inputMode="numeric"
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value)}
                placeholder="Max"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }