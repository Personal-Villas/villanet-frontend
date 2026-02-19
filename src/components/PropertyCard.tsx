import React from 'react';
import {
    ChevronLeft,
    ChevronRight,
    ShieldCheck,
    Star,
    MapPin,
    Bed,
    Bath,
    DollarSign
} from 'lucide-react';
import LazyImage from './LazyImage';
import { isAboveFold } from '../services/imageUtils';

interface PropertyCardProps {
    item: any;
    /** Índice 0-based de esta card en la página (0–11 para 12 por página).
     *  Se usa para determinar si la imagen es above-the-fold (priority). */
    cardIndex: number;
    currentIndex: number;
    onImagePrev: (e: React.MouseEvent, id: string, total: number) => void;
    onImageNext: (e: React.MouseEvent, id: string, total: number) => void;
    onGoToDetail: (item: any) => void;
    onToggleCart: (item: any) => void;
    onOpenMessage: (item: any) => void;
    isInCart: boolean;
    formatMoney: (n: number | null) => string;
    formatRank: (n: number | string | null | undefined) => string;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
    item,
    cardIndex,
    currentIndex,
    onImagePrev,
    onImageNext,
    onGoToDetail,
    onToggleCart,
    onOpenMessage,
    isInCart,
    formatMoney,
    formatRank
}) => {
    const images = item.images_json?.length > 0 ? item.images_json : [item.heroImage];

    // Las primeras 4 cards son above-the-fold en desktop (grilla de 4 columnas)
    // y las primeras 2 en mobile. Priorizar 4 cubre ambos casos.
    const heroHasPriority = isAboveFold(cardIndex);

    return (
        <div className="group border border-border rounded-lg overflow-hidden bg-card transition-all duration-200 hover:shadow-xl hover:-translate-y-1 mt-10">

            {/* --- CARRUSEL DE IMÁGENES --- */}
            <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                <div className="relative w-full h-full">
                    <div className="relative w-full h-full overflow-hidden">
                        <div
                            className="flex h-full transition-transform duration-300 ease-out"
                            style={{ transform: `translateX(${-currentIndex * 100}%)` }}
                        >
                            {images.map((image: string, imgIdx: number) => (
                                <div key={imgIdx} className="w-full h-full flex-shrink-0" style={{ minWidth: '100%' }}>
                                    <LazyImage
                                        src={image}
                                        alt={`${item.name} - Image ${imgIdx + 1}`}
                                        aspectRatio="4/3"
                                        className="w-full h-full object-cover"
                                        /**
                                         * priority solo en la imagen del héroe (imgIdx === 0)
                                         * de las primeras 4 cards (heroHasPriority).
                                         * Las imágenes del carrusel (imgIdx > 0) siempre lazy,
                                         * incluso en cards above-the-fold, porque no son visibles inicialmente.
                                         */
                                        priority={heroHasPriority && imgIdx === 0}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Flechas de Navegación */}
                    <button
                        disabled={currentIndex === 0}
                        onClick={(e) => onImagePrev(e, item.id, images.length)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md border border-border transition-all duration-200 opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:bg-white hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        <ChevronLeft className="w-4 h-4 text-foreground" />
                    </button>

                    <button
                        onClick={(e) => onImageNext(e, item.id, images.length)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md border border-border transition-all duration-200 opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:bg-white hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        <ChevronRight className="w-4 h-4 text-foreground" />
                    </button>

                    {/* Contador */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs font-medium pointer-events-none">
                        {currentIndex + 1} / {images.length}
                    </div>
                </div>

                {/* Badges Superiores */}
                <div className="absolute top-3 left-3 right-3 flex justify-between items-start gap-2 z-10">
                    {(item.rank !== null && item.rank !== undefined && item.rank > 0) ? (
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-background/95 backdrop-blur-sm border border-border shadow-sm">
                            <Star className="w-3.5 h-3.5 text-yellow-600 fill-yellow-600" />
                            <span className="text-xs font-semibold text-foreground">
                                {formatRank(item.rank)}
                            </span>
                        </div>
                    ) : null}
                </div>
            </div>

            {/* --- INFO DE LA PROPIEDAD --- */}
            <div className="p-4">
                <a
                    className="block mb-2 group/link"
                    href={`/property/${item.id}`}
                    onClick={(e) => {
                        e.preventDefault();
                        onGoToDetail(item);
                    }}
                >
                    <h3 className="text-lg font-semibold text-foreground group-hover/link:text-primary transition-colors mb-1">
                        {item.name}
                    </h3>
                    {item.location?.trim() && item.location !== 'Unknown' && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            <span className="text-xs truncate">{item.location}</span>
                        </div>
                    )}
                </a>

                {/* Métricas */}
                <div className="flex items-center md:flex-nowrap flex-wrap gap-2 md:gap-3 text-xs md:text-sm text-muted-foreground mb-3 pb-3 border-b border-border">
                    <div className="flex items-center gap-1 whitespace-nowrap">
                        <Bed className="w-4 h-4" />
                        <span>{item.bedrooms ?? '–'} BR</span>
                    </div>
                    <span className="hidden md:inline">•</span>
                    <div className="flex items-center gap-1 whitespace-nowrap">
                        <Bath className="w-4 h-4" />
                        <span>{item.bathrooms ?? '–'} BA</span>
                    </div>
                    <span className="hidden md:inline">•</span>
                    <div className="flex items-center gap-1 whitespace-nowrap">
                        <DollarSign className="w-4 h-4" />
                        <span>From {formatMoney(item.priceUSD)}/nt</span>
                    </div>
                </div>

                {/* Property Manager */}
                <div className="mb-4 text-xs space-y-2">
                    <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                        <span className="text-muted-foreground truncate">{item.propertyManager}</span>
                    </div>
                </div>

                {/* Botones */}
                <div className="flex flex-col gap-2">
                    <button
                        onClick={() => onGoToDetail(item)}
                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 rounded-md px-3 w-full bg-[#000000] text-white hover:bg-black/90"
                    >
                        View Villa
                    </button>

                    <div className="flex gap-2">
                        <button
                            onClick={() => onToggleCart(item)}
                            className={`inline-flex items-center justify-center gap-1 whitespace-nowrap text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 rounded-md px-2 border flex-1 ${isInCart
                                ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
                                : 'bg-background text-foreground border-border hover:bg-accent'
                                }`}
                        >
                            {isInCart ? 'Remove' : 'Add to quote'}
                        </button>

                        <button
                            onClick={() => onOpenMessage(item)}
                            className="inline-flex items-center justify-center gap-1 whitespace-nowrap text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border bg-background hover:text-accent-foreground h-9 rounded-md px-2 border-border hover:bg-accent flex-1"
                        >
                            Message
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};