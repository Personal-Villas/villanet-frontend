import { useState, useMemo } from 'react';
import { X, ChevronLeft, ChevronRight, MapPin, Bed, Bath } from 'lucide-react';

type ListingDetail = {
  listing_id: string;
  name: string;
  bedrooms: number | null;
  bathrooms: number | null;
  price_usd: number | null;
  location_text: string | null;
  city?: string | null;
  country?: string | null;
  hero_image_url: string | null;
  images_json?: string[];
  address?: { full?: string | null };
  prices?: { basePrice?: number | null };
  publicDescription?: { summary?: string };
  amenities?: string[];
  description?: string;
};

interface PropertyDetailModalProps {
  detail: ListingDetail | null;
  onClose: () => void;
}

const PLACEHOLDER = 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80&auto=format&fit=crop';

// Función para limpiar el texto de la descripción
const cleanDescription = (text: string) => {
    return text
      .replace(/\n\s*\n\s*\n/g, '\n\n')  // 3+ saltos → 2 saltos
      .replace(/\n{3,}/g, '\n\n')        // cualquier 3+ → 2
      .replace(/^\s+|\s+$/g, '')         // trim inicio/fin
      .replace(/\s+\n/g, '\n')           // espacios antes de salto → solo salto
      .replace(/\n\s+/g, '\n');          // salto + espacios → solo salto
  };

export default function PropertyDetailModal({ detail, onClose }: PropertyDetailModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const formatMoney = (n: number | null | undefined) =>
    n == null ? '—' : `$${n.toLocaleString()}`;

  const detailImages: string[] = useMemo(() => {
    if (!detail) return [];
    if (Array.isArray(detail.images_json) && detail.images_json.length > 0) return detail.images_json;
    const imgsArr: any[] =
      (detail as any).pictures || (detail as any).images || (detail as any).picture || [];
    const urls = imgsArr
      .map((img: any) =>
        typeof img === 'string' ? img : img?.original || img?.url || img?.thumbnail || ''
      )
      .filter(Boolean);
    return urls;
  }, [detail]);

  const hasImages = detailImages.length > 0;

  const nextImage = () =>
    setCurrentImageIndex(prev => (hasImages ? (prev + 1) % detailImages.length : 0));
  
  const prevImage = () =>
    setCurrentImageIndex(prev => (hasImages ? (prev - 1 + detailImages.length) % detailImages.length : 0));

  if (!detail) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Gallery */}
        <div className="relative aspect-[16/9] bg-neutral-100">
          {hasImages ? (
            <>
              <img
                src={detailImages[currentImageIndex] || PLACEHOLDER}
                alt={detail.name}
                className="w-full h-full object-cover"
                onError={e => ((e.target as HTMLImageElement).src = PLACEHOLDER)}
              />
              {detailImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full transition"
                  >
                    <ChevronLeft className="w-6 h-6 text-neutral-900" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-14 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full transition"
                  >
                    <ChevronRight className="w-6 h-6 text-neutral-900" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {detailImages.length}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-400">
              <div className="text-center">
                <MapPin className="w-16 h-16 mx-auto mb-2 opacity-30" />
                <p>No images available</p>
              </div>
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/90 hover:bg-white p-2 rounded-full transition"
          >
            <X className="w-6 h-6 text-neutral-900" />
          </button>
        </div>

        {/* Content */}
        <div className="lg:p-8 p-5 text-center lg:text-left">
          <h2 className="text-3xl font-light text-neutral-900 mb-2">{detail.name}</h2>
          <div className="flex lg:items-center gap-2 text-neutral-600 mb-6">
            <MapPin className="w-5 h-5" />
            <span>{detail.address?.full || detail.location_text || '—'}</span>
          </div>

          <div className="flex items-center lg:gap-8 gap-4 mb-6 pb-6 border-b border-neutral-200">
            <div className="flex items-center gap-2">
              <Bed className="w-5 h-5 text-neutral-600" />
              <span className="text-sm lg:text-lg font-medium text-neutral-900">
                {detail.bedrooms ?? '—'} Bedrooms
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Bath className="w-5 h-5 text-neutral-600" />
              <span className="text-sm lg:text-lg font-medium text-neutral-900">
                {detail.bathrooms ?? '—'} Bathrooms
              </span>
            </div>
            <div className="ml-auto">
              <span className="text-sm lg:text-3xl font-semibold text-neutral-900">
                {formatMoney(detail.price_usd ?? detail.prices?.basePrice ?? null)}
              </span>
              <span className="text-neutral-600 lg:ml-2 ml-1">/ night</span>
            </div>
          </div>

          {/* ✅ DESCRIPTION CORREGIDO - usa description en lugar de publicDescription */}
          {detail.description && (
            <div className="mb-6">
              <h3 className="text-xl font-medium text-neutral-900 mb-3">Description</h3>
              {/* ✅ white-space: pre-line para respetar saltos de línea */}
              <p 
                className="text-neutral-600 leading-relaxed whitespace-pre-line"
                style={{ lineHeight: '1.6' }}
              >
                {cleanDescription(detail.description)}
              </p>
            </div>
          )}

          {Array.isArray(detail.amenities) && detail.amenities.length > 0 && (
            <div>
              <h3 className="text-xl font-medium text-neutral-900 mb-3">Amenities</h3>
              <div className="grid grid-cols-2 gap-3">
                {detail.amenities.slice(0, 8).map((amenity, i) => (
                  <div key={i} className="flex items-center gap-2 text-neutral-600">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
              {detail.amenities.length > 8 && (
                <p className="text-sm text-neutral-500 mt-3">
                  +{detail.amenities.length - 8} more amenities
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}