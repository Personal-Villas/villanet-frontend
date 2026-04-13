import React from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { useCart } from '../context/CartContext';

/**
 * Renders ephemeral "Added to quote" toasts in the top-right corner.
 * Mount once, near CartSidebar, inside CartProvider.
 *
 * Each toast auto-dismisses after 2.5 s (controlled by CartContext).
 */
const AddToQuoteToast: React.FC = () => {
  const { toasts, dismissToast } = useCart();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-[60] flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-center gap-3 bg-neutral-900 text-white text-sm px-4 py-3 rounded-xl shadow-xl animate-slide-in max-w-xs"
          style={{ animation: 'slideInRight 0.2s ease-out' }}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span className="flex-1 truncate">
            <span className="font-medium">Added:</span> {toast.villaName}
          </span>
          <button
            onClick={() => dismissToast(toast.id)}
            className="text-neutral-400 hover:text-white flex-shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}

      {/* Keyframe — injected inline so no extra CSS file is needed */}
      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(1.5rem); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default AddToQuoteToast;