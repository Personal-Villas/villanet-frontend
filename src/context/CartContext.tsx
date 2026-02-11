import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Listing = {
  id: string;
  name: string;
  location?: string | null;
  villaNetDestinationTag?: string | null;
  villaNetCity?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  priceUSD?: number | null;
  heroImage?: string | null;
  images_json?: string[];
  rank?: number | null; 
};

type CartContextType = {
  items: Listing[];
  isInCart: (id: string) => boolean;
  toggleItem: (listing: Listing) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  cartCount: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  isCartModalOpen: boolean;
  openCartModal: () => void;
  closeCartModal: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<Listing[]>(() => {
    // Cargar del localStorage al iniciar
    const saved = localStorage.getItem('villa-cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);

  // Persistir en localStorage cuando cambia
  useEffect(() => {
    localStorage.setItem('villa-cart', JSON.stringify(items));
  }, [items]);

  const isInCart = (id: string) => items.some(item => item.id === id);

  const toggleItem = (listing: Listing) => {
    setItems(prev => {
      const exists = prev.some(item => item.id === listing.id);
      if (exists) {
        return prev.filter(item => item.id !== listing.id);
      } else {
        setIsCartOpen(true);
        return [...prev, listing];
      }
    });
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem('villa-cart');
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const openCartModal = () => setIsCartModalOpen(true);
  const closeCartModal = () => setIsCartModalOpen(false);

  return (
    <CartContext.Provider
      value={{
        items,
        isInCart,
        toggleItem,
        removeItem,
        clearCart,
        cartCount: items.length,
        isCartOpen,
        openCart,
        closeCart,
        isCartModalOpen,
        openCartModal,
        closeCartModal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

