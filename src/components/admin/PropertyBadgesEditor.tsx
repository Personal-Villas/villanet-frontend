import { useEffect, useState } from 'react';
import { api } from '../../api/api';

type Badge = {
  id: number;
  slug: string;
  name: string;
  category_slug: string;
  description?: string | null;
  icon?: string | null;
  is_dynamic: boolean;
};
type Category = { slug: string; name: string; sort_order: number };
type Assignment = { badge: Badge; value?: string | null };

export default function PropertyBadgesEditor({
  propertyId,
  headers,
  onClose,
  onSaved
}: {
  propertyId: string;
  headers: Record<string, string>;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [catalog, setCatalog] = useState<{ categories: Category[]; badges: Badge[] }>({ 
    categories: [], 
    badges: [] 
  });
  const [assign, setAssign] = useState<Record<string, string | undefined>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    (async () => {
      try {
        const c = await api<{ categories: Category[]; badges: Badge[] }>('/badges', { headers });
        setCatalog(c);
        const a = await api<{ assignments: Assignment[] }>(`/properties/${propertyId}/badges`, { headers });
        const map: Record<string, string | undefined> = {};
        for (const it of a.assignments) map[it.badge.slug] = it.value ?? undefined;
        setAssign(map);
      } finally {
        setLoading(false);
      }
    })();
  }, [propertyId]);

  const toggle = (b: Badge) => {
    setAssign(prev => {
      const copy = { ...prev };
      if (Object.prototype.hasOwnProperty.call(copy, b.slug)) delete copy[b.slug];
      else copy[b.slug] = b.is_dynamic ? '' : undefined;
      return copy;
    });
  };

  const setVal = (slug: string, v: string) => setAssign(prev => ({ ...prev, [slug]: v }));

  const save = async () => {
    setSaving(true);
    try {
      const assignments = Object.keys(assign).map(slug => {
        const v = assign[slug];
        return v === undefined ? { slug } : { slug, value: v };
      });
      await api(`/properties/${propertyId}/badges`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ assignments })
      });
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  // Filtrar badges
  const filteredBadges = catalog.badges.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (b.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || b.category_slug === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const activeBadgesCount = Object.keys(assign).length;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="flex flex-col items-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading badges...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full h-full md:h-auto md:max-w-4xl rounded-2xl shadow-2xl max-h-[100vh] md:max-h-[90vh] overflow-hidden flex flex-col mr-1">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl md:text-2xl font-bold text-white">Edit Property Badges</h3>
            <button 
              onClick={onClose} 
              className="text-white/90 hover:text-white hover:bg-white/10 rounded-lg p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-blue-100 text-sm">
            {activeBadgesCount} badge{activeBadgesCount !== 1 ? 's' : ''} selected
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-gray-50 border-b border-gray-200 p-4 space-y-3">
          {/* Búsqueda */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search badges..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Filtro por categoría */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              All Categories
            </button>
            {catalog.categories.sort((a,b) => a.sort_order - b.sort_order).map(cat => (
              <button
                key={cat.slug}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat.slug
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {filteredBadges.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No badges found</h3>
              <p className="text-gray-500">Try adjusting your search or category filter</p>
            </div>
          ) : (
            <div className="space-y-6">
              {catalog.categories
                .sort((a,b) => a.sort_order - b.sort_order)
                .filter(cat => selectedCategory === 'all' || selectedCategory === cat.slug)
                .map(cat => {
                  const categoryBadges = filteredBadges.filter(b => b.category_slug === cat.slug);
                  if (categoryBadges.length === 0) return null;

                  return (
                    <div key={cat.slug} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide">{cat.name}</h4>
                        <div className="flex-1 h-px bg-gray-200"></div>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {categoryBadges.filter(b => Object.prototype.hasOwnProperty.call(assign, b.slug)).length} / {categoryBadges.length}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {categoryBadges.map(b => {
                          const active = Object.prototype.hasOwnProperty.call(assign, b.slug);
                          return (
                            <div 
                              key={b.slug} 
                              className={`relative border-2 rounded-xl p-4 transition-all ${
                                active 
                                  ? 'border-blue-500 bg-blue-50 shadow-md' 
                                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                              }`}
                            >
                              <label className="flex items-start gap-3 cursor-pointer">
                                <div className="pt-0.5">
                                  <input 
                                    type="checkbox" 
                                    checked={active} 
                                    onChange={() => toggle(b)}
                                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-gray-900 text-sm">{b.name}</span>
                                    {b.is_dynamic && (
                                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                                        Dynamic
                                      </span>
                                    )}
                                  </div>
                                  {b.description && (
                                    <p className="text-xs text-gray-600 line-clamp-2">{b.description}</p>
                                  )}
                                </div>
                              </label>
                              
                              {active && b.is_dynamic && (
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                  <input
                                    className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
                                    placeholder="Enter value (e.g., 4.9★, #1 Ranked)"
                                    value={assign[b.slug] ?? ''}
                                    onChange={e => setVal(b.slug, e.target.value)}
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 p-4 flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
          <div className="text-sm text-gray-600">
            <span className="font-semibold">{activeBadgesCount}</span> badge{activeBadgesCount !== 1 ? 's' : ''} will be saved
          </div>
          <div className="flex gap-2 sm:gap-3">
            <button 
              onClick={onClose} 
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-lg border-2 border-gray-300 bg-white hover:bg-gray-50 font-medium text-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg disabled:hover:shadow-md"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                'Save Badges'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}