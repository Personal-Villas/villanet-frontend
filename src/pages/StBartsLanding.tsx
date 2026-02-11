import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { publicApi } from '../api/api'; // Tu api pública
import { useCart } from '../context/CartContext'; // ✅ Tu contexto real
import { PropertyCard } from '../components/PropertyCard';
import { PaginationControls } from '../components/PaginationControls';
import { SearchLoader } from '../components/SearchLoader';
import { BottomNav } from '../components/BottomNav';
import SEO from '../components/SEO';

// Definimos el tipo localmente para que coincida con la API y el componente
type Listing = {
  id: string;
  name: string;
  priceUSD: number | null;
  location: string | null;
  heroImage: string | null;
  images_json: string[];
  rank?: number | null;
  // Campos opcionales que PropertyCard podría usar
  villaNetDestinationTag?: string | null;
  villaNetCity?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
};

export const StBartsLanding = () => {
  const navigate = useNavigate();
  
  // ✅ 1. Conexión correcta con tu CartContext
  const { 
    items: cartItems, // Renombramos 'items' del contexto a 'cartItems' para no confundir
    isInCart, 
    toggleItem 
  } = useCart();

  // Estados de la página
  const [activeTab, setActiveTab] = useState('explore');
  const [listings, setListings] = useState<Listing[]>([]); // ✅ Tipado correcto
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  
  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Estado para el carrusel de imágenes (índice por ID de villa)
  const [imageIndices, setImageIndices] = useState<{ [key: string]: number }>({});

  // --- LOGICA DEL CARRUSEL ---
  const handleNextImage = (e: React.MouseEvent, id: string, total: number) => {
    e.stopPropagation();
    setImageIndices(prev => ({
      ...prev,
      [id]: ((prev[id] || 0) + 1) % total
    }));
  };

  const handlePrevImage = (e: React.MouseEvent, id: string, total: number) => {
    e.stopPropagation();
    setImageIndices(prev => ({
      ...prev,
      [id]: ((prev[id] || 0) - 1 + total) % total
    }));
  };

  // --- HELPERS DE FORMATO ---
  const formatMoney = (n: number | null) => 
    n ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n) : 'Price on request';

  const formatRank = (n: any) => (n ? `★ ${n}` : 'Unrated');

  // --- FETCH DE DATOS (AC1) ---
  const fetchStBartsVillas = useCallback(async () => {
    setLoading(true);
    setProgress(20);
    try {
      // Llamada hardcodeada a St. Barts
      const response = await publicApi.get(`/public/listings?destination=st-barts&page=${currentPage}&limit=12`);
      setProgress(70);
      
      // Asumiendo que response.listings trae el array
      if (response && response.listings) {
        setListings(response.listings);
        setTotalPages(response.totalPages || 1);
      }
      setProgress(100);
    } catch (error) {
      console.error("Error loading St. Barts villas", error);
    } finally {
      // Pequeño delay para suavizar la animación de carga
      setTimeout(() => setLoading(false), 500);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchStBartsVillas();
  }, [fetchStBartsVillas]);

  return (
    <div className="min-h-screen bg-white pb-24 md:pb-0">
      <SEO title="St. Barts Luxury Collection | Guest Mode" />

      {/* Loader estilo VRBO */}
      {loading && <SearchLoader progress={progress} />}

      {/* Header Mobile-First */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md px-6 py-4 border-b border-neutral-100 flex justify-between items-center shadow-sm">
        <div>
           <h1 className="font-serif text-xl italic tracking-tighter text-neutral-900">St. Barts Collection</h1>
           <p className="text-[10px] text-neutral-500 font-medium">Verified Luxury • Instant Quote</p>
        </div>
        <div className="text-[10px] uppercase tracking-widest font-bold bg-neutral-900 text-white px-3 py-1.5 rounded-full">
          Guest
        </div>
      </header>

      <main className="px-4 py-6">
        {activeTab === 'explore' && (
          <div className="space-y-8">
            {/* Grilla de Propiedades */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {listings.map((villa) => (
                <PropertyCard 
                  key={villa.id}
                  item={villa}
                  // Props de Carrusel
                  currentIndex={imageIndices[villa.id] || 0}
                  onImagePrev={handlePrevImage}
                  onImageNext={handleNextImage}
                  
                  // Props de Navegación
                  onGoToDetail={(item) => navigate(`/listing/${item.id}`)}
                  
                  // ✅ Props del Contexto Corregidas
                  onToggleCart={(item) => toggleItem(item)} // Usa toggleItem del context
                  isInCart={isInCart(villa.id)}            // Usa isInCart del context
                  
                  // Props de Acción "Guest"
                  onOpenMessage={() => setActiveTab('inquiry')}
                  
                  // Helpers
                  formatMoney={formatMoney}
                  formatRank={formatRank}
                />
              ))}
            </div>

            {/* Paginación */}
            {!loading && listings.length > 0 && (
              <PaginationControls 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  setCurrentPage(page);
                }}
              />
            )}
            
            {!loading && listings.length === 0 && (
               <div className="text-center py-20 text-neutral-400">
                 No villas found available at the moment.
               </div>
            )}
          </div>
        )}

        {/* Vista de Favoritos (Reutilizando cards) */}
        {activeTab === 'saved' && (
          <div className="space-y-6">
             <h2 className="text-2xl font-serif px-2">Your Saved Villas ({cartItems.length})</h2>
             {cartItems.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                 <p className="text-neutral-400 mb-4">You haven't saved any villas yet.</p>
                 <button onClick={() => setActiveTab('explore')} className="text-neutral-900 underline font-medium">
                   Start Exploring
                 </button>
               </div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {cartItems.map((villa) => (
                   <PropertyCard 
                     key={villa.id}
                     item={villa}
                     currentIndex={imageIndices[villa.id] || 0}
                     onImagePrev={handlePrevImage}
                     onImageNext={handleNextImage}
                     onGoToDetail={(item) => navigate(`/listing/${item.id}`)}
                     onToggleCart={(item) => toggleItem(item)}
                     isInCart={true} // Obviamente está en el carrito
                     onOpenMessage={() => setActiveTab('inquiry')}
                     formatMoney={formatMoney}
                     formatRank={formatRank}
                   />
                 ))}
               </div>
             )}
          </div>
        )}
        
        {/* Placeholder para Inquiry Tab */}
        {activeTab === 'inquiry' && (
           <div className="flex flex-col items-center justify-center h-[50vh] text-center px-6">
             <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
               <span className="text-2xl">👋</span>
             </div>
             <h2 className="text-xl font-medium mb-2">Concierge Service</h2>
             <p className="text-neutral-500 text-sm max-w-xs mx-auto">
               You can request availability for any saved villa directly from here. Feature coming in the next step.
             </p>
             <button onClick={() => setActiveTab('explore')} className="mt-6 btn-primary bg-neutral-900 text-white px-6 py-3 rounded-lg text-sm">
               Back to Collection
             </button>
           </div>
        )}
      </main>

      {/* ✅ Navegación Inferior (Visible solo en mobile gracias a la clase md:hidden dentro del componente) */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};