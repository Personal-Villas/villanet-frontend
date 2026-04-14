import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';

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

// ─── Toast ────────────────────────────────────────────────────────────────────
export type ToastEntry = { id: number; villaName: string };

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
  // Dates
  quoteCheckIn: string;
  quoteCheckOut: string;
  setQuoteDates: (checkIn: string, checkOut: string) => void;
  // Toast queue (consumed by ToastContainer)
  toasts: ToastEntry[];
  dismissToast: (id: number) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<Listing[]>(() => {
    const saved = localStorage.getItem('villa-cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);

  const [quoteCheckIn, setQuoteCheckIn] = useState<string>(
    () => localStorage.getItem('quoteCheckIn') || ''
  );
  const [quoteCheckOut, setQuoteCheckOut] = useState<string>(
    () => localStorage.getItem('quoteCheckOut') || ''
  );

  // ─── Toast state ────────────────────────────────────────────────────────────
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  // useRef para el ID — nunca queda stale en closures y no provoca re-renders
  const toastSeqRef = useRef(0);

  const pushToast = useCallback((villaName: string) => {
    toastSeqRef.current += 1;
    const id = toastSeqRef.current;
    setToasts(prev => [...prev, { id, villaName }]);
    // Auto-dismiss after 2.5 s
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2500);
  }, []); // sin dependencias — el ref nunca queda stale

  const dismissToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // ─── Persist cart ───────────────────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem('villa-cart', JSON.stringify(items));
  }, [items]);

  const setQuoteDates = (checkIn: string, checkOut: string) => {
    setQuoteCheckIn(checkIn);
    setQuoteCheckOut(checkOut);
    if (checkIn) localStorage.setItem('quoteCheckIn', checkIn);
    else localStorage.removeItem('quoteCheckIn');
    if (checkOut) localStorage.setItem('quoteCheckOut', checkOut);
    else localStorage.removeItem('quoteCheckOut');
  };

  const isInCart = (id: string) => items.some(item => item.id === id);

  // ── CA1: toggleItem NEVER opens the sidebar ──────────────────────────────
  // `isAdding` se calcula de forma síncrona ANTES de setItems, por lo que
  // es confiable inmediatamente — sin depender de que el updater async haya corrido.
  // pushToast sigue fuera del updater para evitar doble-disparo en Strict Mode.
  const toggleItem = (listing: Listing) => {
    const isAdding = !items.some(item => item.id === listing.id);

    setItems(prev =>
      isAdding
        ? [...prev, listing]
        : prev.filter(item => item.id !== listing.id)
    );

    if (isAdding) {
      pushToast(listing.name);
    }
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
        quoteCheckIn,
        quoteCheckOut,
        setQuoteDates,
        toasts,
        dismissToast,
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