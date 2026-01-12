import React, { useState } from 'react';
import { X, Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { api } from '../api/api';

type CartModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const PLACEHOLDER = '/assets/hero-villa-Cl4d2Edi.jpg';

const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose }) => {
  const { items, removeItem } = useCart();
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Función para obtener la imagen correcta
  const getImageUrl = (villa: any) => {
    return villa.heroImage || 
           villa.hero_image_url || 
           (villa.images_json && villa.images_json[0]) || 
           PLACEHOLDER;
  };

  const formatMoney = (n: number | null | undefined) => {
    if (n == null) return '—';
    const amount = Number(n);
    return Number.isFinite(amount) ? `$${amount.toLocaleString()}` : '—';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clientEmail.trim()) {
      setMessage({ type: 'error', text: 'Please enter your client email.' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      await api('/cart/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: clientName.trim(),
          clientEmail: clientEmail.trim(),
          listings: items.map(v => ({
            id: v.id,
            name: v.name,
            location: v.location || v.villaNetDestinationTag || v.villaNetCity || 'Location not specified',
            bedrooms: v.bedrooms,
            bathrooms: v.bathrooms,
            priceUSD: v.priceUSD,
            imageUrl: getImageUrl(v), // 🔥 Usar la función helper
          })),
        }),
      });

      setMessage({ 
        type: 'success', 
        text: 'PDF will be sent to your client shortly. You can close this window.' 
      });
      
      // Limpiar formulario después de éxito
      setClientName('');
      setClientEmail('');
      
      // No cerrar automáticamente, dejar que el usuario vea el mensaje
    } catch (err: any) {
      console.error('Error sending PDF:', err);
      setMessage({ 
        type: 'error', 
        text: err.message || 'Error sending PDF. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl border border-neutral-200 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
          <div>
            <h2 className="text-lg font-semibold">
              Quote – {items.length} {items.length === 1 ? 'villa' : 'villas'} selected
            </h2>
            <p className="text-sm text-neutral-500 mt-1">
              Send a curated selection to your client
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-2xl leading-none text-neutral-500 hover:text-neutral-900 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Grid de propiedades */}
          {items.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {items.map((villa) => (
                  <div
                    key={villa.id}
                    className="border border-neutral-200 rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow"
                  >
                    <div className="relative">
                      <img
                        src={getImageUrl(villa)} // 🔥 Usar la función helper
                        alt={villa.name}
                        className="w-full h-32 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = PLACEHOLDER;
                        }}
                      />
                      <button
                        onClick={() => removeItem(villa.id)}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="p-3 space-y-1">
                      <p className="text-sm font-semibold truncate">{villa.name}</p>
                      <p className="text-xs text-neutral-500 truncate">
                        {villa.location || villa.villaNetDestinationTag || "Location not specified"}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {villa.bedrooms ?? "—"} BR • {villa.bathrooms ?? "—"} BA
                      </p>
                      <p className="text-xs text-neutral-700 font-medium">
                        From {formatMoney(villa.priceUSD)}/nt
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Formulario */}
              <div className="border border-neutral-200 rounded-lg p-6 bg-gradient-to-r from-neutral-50 to-white">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  Email selection as PDF to your client
                </h3>
                
                {message && (
                  <div className={`mb-4 p-3 rounded-lg flex items-start gap-2 ${
                    message.type === 'success' 
                      ? 'bg-green-50 text-green-800 border border-green-200' 
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    {message.type === 'success' ? (
                      <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    )}
                    <p className="text-sm">{message.text}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Client name (optional)
                      </label>
                      <input
                        type="text"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900"
                        placeholder="e.g. Sarah Johnson"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Client email*
                      </label>
                      <input
                        type="email"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        required
                        className="w-full px-3 py-2.5 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900"
                        placeholder="client@email.com"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting || items.length === 0}
                      className="lg:w-[30%] px-6 py-3.5 text-sm font-medium bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 w-full"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Sending PDF...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Send PDF to Client
                        </>
                      )}
                    </button>
                    <p className="text-xs text-neutral-500 mt-4 lg:text-start text-center">
                      Your client will receive a beautifully formatted PDF with all selected villas
                    </p>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-10 h-10 text-neutral-400" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                Your quote is empty
              </h3>
              <p className="text-neutral-600 mb-6">
                Add villas to your quote to create a curated selection for your clients
              </p>
              <button
                onClick={onClose}
                className="px-6 py-3 text-sm font-medium border border-neutral-300 rounded-lg hover:bg-neutral-50"
              >
                Continue browsing villas
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-neutral-200 px-6 py-4 bg-neutral-50">
            <div className="flex justify-between items-center">
              <div className="text-xs text-neutral-500">
                <p className="font-medium">Tips for your clients:</p>
                <ul className="list-disc list-inside mt-1">
                  <li>All villas are vetted and verified</li>
                  <li>Full property manager support included</li>
                  <li>24/7 concierge service available</li>
                </ul>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-neutral-900">
                  {items.length} {items.length === 1 ? 'villa' : 'villas'} selected
                </p>
                <button
                  onClick={onClose}
                  className="mt-2 text-sm font-medium text-neutral-700 hover:text-neutral-900"
                >
                  Close preview
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartModal;