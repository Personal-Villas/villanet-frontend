import React from 'react';
import { ShoppingBag, X, ExternalLink } from 'lucide-react';
import { useCart } from '../context/CartContext';

const PLACEHOLDER = '/assets/hero-villa-Cl4d2Edi.jpg';

const CartSidebar: React.FC = () => {
  const { 
    items, 
    isCartOpen, 
    closeCart, 
    removeItem, 
    openCartModal,
    cartCount 
  } = useCart();

  // Función para obtener la imagen correcta
  const getImageUrl = (villa: any) => {
    return villa.heroImage || 
           villa.hero_image_url || 
           (villa.images_json && villa.images_json[0]) || 
           PLACEHOLDER;
  };

  return (
    <>
      {/* Side Cart Panel */}
      <div
        className={`fixed top-16 right-0 h-[calc(100vh-4rem)] w-full max-w-md bg-white border-l border-neutral-200 shadow-2xl z-50 transform transition-transform duration-300 ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 bg-neutral-50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            <h2 className="text-base font-semibold">
              Your Selection ({cartCount})
            </h2>
          </div>
          <button
            onClick={closeCart}
            className="text-neutral-500 hover:text-neutral-900 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="h-full overflow-y-auto pb-28">
          {items.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <ShoppingBag className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
              <p className="text-neutral-600 mb-2">No villas selected yet</p>
              <p className="text-sm text-neutral-500">
                Click "Add to quote" on any villa to start building your quote
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-neutral-200">
              {items.map((villa) => (
                <li key={villa.id} className="flex gap-3 px-4 py-3 hover:bg-neutral-50">
                  <img
                    src={getImageUrl(villa)}
                    alt={villa.name}
                    className="w-16 h-16 rounded-md object-cover flex-shrink-0 border border-neutral-200"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = PLACEHOLDER;
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{villa.name}</p>
                    <p className="text-xs text-neutral-500 truncate mt-0.5">
                      {villa.location || villa.villaNetDestinationTag || 'Location not specified'}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-neutral-500">
                        {villa.bedrooms ?? '—'} BR
                      </span>
                      <span className="text-xs text-neutral-500">
                        {villa.bathrooms ?? '—'} BA
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(villa.id)}
                    className="text-xs text-red-600 hover:text-red-700 self-start"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 border-t border-neutral-200 bg-white p-4 z-50">
            <div className="flex gap-3 mb-3">
              <button
                onClick={openCartModal}
                className="flex-1 px-4 py-3 text-sm font-medium bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 z-50"
              >
                <ExternalLink className="w-4 h-4" />
                Create Client PDF
              </button>
            </div>
            <p className="text-xs text-neutral-500 text-center">
              Your selection is saved automatically
            </p>
          </div>
        )}
      </div>

      {/* Overlay */}
      {isCartOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 md:hidden"
          onClick={closeCart}
        />
      )}
    </>
  );
};

export default CartSidebar;