import React, { useEffect, useMemo, useRef, useState } from 'react';
import { X, Send, Loader2, CheckCircle, AlertCircle, Calendar, Users } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { api } from '../api/api';

type CartModalProps = {
  isOpen: boolean;
  onClose: () => void;
  defaultCheckIn?: string;
  defaultCheckOut?: string;
  defaultGuests?: number;
};

const PLACEHOLDER = '/assets/hero-villa-Cl4d2Edi.jpg';

type MessageState = { type: 'success' | 'error'; text: string } | null;

type AvStatus = 'idle' | 'checking' | 'available' | 'unavailable' | 'unknown';
type AvMap = Record<string, { status: AvStatus; reason?: string }>;

type AvailabilityResponse = {
  ok: boolean;
  results: Array<{
    listingId: string;
    available: boolean | null; // null => unknown
    reason?: string;
  }>;
};

const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  defaultCheckIn,
  defaultCheckOut,
  defaultGuests,
}) => {
  const { items, removeItem, clearCart } = useCart();

  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<MessageState>(null);

  // availability UI
  const [avMap, setAvMap] = useState<AvMap>({});
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);

  const travelLocked = !!defaultCheckIn && !!defaultCheckOut;

  // Abort controller para cancelar checks viejos
  const avAbortRef = useRef<AbortController | null>(null);
  const avDebounceRef = useRef<number | null>(null);

  // ===== helpers =====
  const getImageUrl = (villa: any) =>
    villa.heroImage || villa.hero_image_url || (villa.images_json && villa.images_json[0]) || PLACEHOLDER;

  const getLocation = (villa: any) =>
    villa.location || villa.villaNetDestinationTag || villa.villaNetCity || 'Location not specified';

  const formatMoney = (n: number | null | undefined) => {
    if (n == null) return '—';
    const amount = Number(n);
    return Number.isFinite(amount)
      ? `$${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
      : '—';
  };

  const hasDates = !!checkIn && !!checkOut;

  const isValidRange = useMemo(() => {
    if (!hasDates) return true;
    return new Date(checkIn) < new Date(checkOut);
  }, [hasDates, checkIn, checkOut]);

  const guestsNum = useMemo(() => {
    const g = Number(guests);
    return Number.isFinite(g) && g > 0 ? g : null;
  }, [guests]);

  const anyUnavailable = useMemo(() => {
    if (!hasDates) return false;
    return (items as any[]).some((v) => avMap[v.id]?.status === 'unavailable');
  }, [hasDates, items, avMap]);

  const anyUnknown = useMemo(() => {
    if (!hasDates) return false;
    return (items as any[]).some((v) => {
      const s = avMap[v.id]?.status;
      return s === 'unknown' || s === 'idle';
    });
  }, [hasDates, items, avMap]);

  // ===== Prefill defaults on open =====
  useEffect(() => {
    if (!isOpen) return;

    setCheckIn((v) => v || (defaultCheckIn ?? ''));
    setCheckOut((v) => v || (defaultCheckOut ?? ''));
    setGuests((v) => v || (defaultGuests && defaultGuests > 0 ? String(defaultGuests) : ''));

    // Reset mensajes al abrir
    setMessage(null);

    // Asegurar badges base por item (idle)
    setAvMap((prev) => {
      const next: AvMap = { ...prev };
      for (const it of items as any[]) {
        if (!next[it.id]) next[it.id] = { status: 'idle' };
      }
      // limpiar ids que ya no existen
      for (const key of Object.keys(next)) {
        if (!(items as any[]).some((it) => String(it.id) === String(key))) {
          delete next[key];
        }
      }
      return next;
    });
  }, [isOpen, defaultCheckIn, defaultCheckOut, defaultGuests, items]);

  // ===== Mantener avMap sincronizado con items (si agregan/quitan villas) =====
  useEffect(() => {
    if (!isOpen) return;
    setAvMap((prev) => {
      const next: AvMap = { ...prev };
      for (const it of items as any[]) {
        if (!next[it.id]) next[it.id] = { status: 'idle' };
      }
      for (const key of Object.keys(next)) {
        if (!(items as any[]).some((it) => String(it.id) === String(key))) {
          delete next[key];
        }
      }
      return next;
    });
  }, [isOpen, items]);

  // ======== Availability check (debounced) ========
  useEffect(() => {
    if (!isOpen) return;

    // Si está locked (viene de una búsqueda con availability), NO chequeamos acá.
    // Igual mantenemos badges sin forzar "available", porque no queremos mentir;
    // podrías setearlos a idle/unknown.
    if (travelLocked) return;

    // si no hay fechas, reset badges
    if (!hasDates) {
      setIsCheckingAvailability(false);
      setAvMap((prev) => {
        const next: AvMap = { ...prev };
        for (const it of items as any[]) {
          next[it.id] = { status: 'idle' };
        }
        return next;
      });
      return;
    }

    // rango inválido: no chequeamos
    if (!isValidRange) return;

    // debounce
    if (avDebounceRef.current) window.clearTimeout(avDebounceRef.current);

    avDebounceRef.current = window.setTimeout(async () => {
      // cancelar request anterior
      avAbortRef.current?.abort();
      const ac = new AbortController();
      avAbortRef.current = ac;

      try {
        setIsCheckingAvailability(true);

        // marcar checking por item
        setAvMap((prev) => {
          const next: AvMap = { ...prev };
          for (const it of items as any[]) next[it.id] = { status: 'checking' };
          return next;
        });

        const body = {
          checkIn,
          checkOut,
          guests: guestsNum,
          strict: false, // si querés CTA/CTD estricto, ponelo true
          items: (items as any[]).map((villa) => ({
            id: villa.id,
            guestyBookingDomain:
              (villa as any).guestyBookingDomain ||
              (villa as any).guesty_booking_domain ||
              null,
          })),
        };

        const res = await api<AvailabilityResponse>('/quotes/availability-check', {
          method: 'POST',
          body: JSON.stringify(body),
          signal: ac.signal,
        });

        // default unknown para todos
        const next: AvMap = {};
        for (const it of items as any[]) next[it.id] = { status: 'unknown' };

        // aplicar results
        for (const r of res.results || []) {
          if (r.available === true) next[r.listingId] = { status: 'available' };
          else if (r.available === false) next[r.listingId] = { status: 'unavailable', reason: r.reason };
          else next[r.listingId] = { status: 'unknown', reason: r.reason };
        }

        setAvMap(next);
      } catch (e: any) {
        if (e?.name === 'AbortError') return;
        console.error('availability-check error:', e);

        // dejamos unknown (pero no rompemos UX)
        setAvMap(() => {
          const next: AvMap = {};
          for (const it of items as any[]) next[it.id] = { status: 'unknown' };
          return next;
        });
      } finally {
        setIsCheckingAvailability(false);
      }
    }, 500);

    return () => {
      if (avDebounceRef.current) window.clearTimeout(avDebounceRef.current);
      avAbortRef.current?.abort();
    };
  }, [isOpen, travelLocked, hasDates, isValidRange, checkIn, checkOut, guestsNum, items]);

  // ======== Submit ========
  async function submitQuote({ sendWithoutDates }: { sendWithoutDates: boolean }) {
    if (!clientEmail.trim()) {
      setMessage({ type: 'error', text: 'Please enter your client email.' });
      return;
    }

    if (hasDates && !isValidRange) {
      setMessage({ type: 'error', text: 'Check-out date must be after check-in date.' });
      return;
    }

    // si hay fechas y hay unavailable -> bloquear (a menos que sendWithoutDates)
    if (hasDates && anyUnavailable && !sendWithoutDates) {
      setMessage({
        type: 'error',
        text: 'Some villas are not available for these dates. Remove them or change dates (or send without dates).',
      });
      return;
    }

    // si está chequeando disponibilidad, evitamos submit con fechas (pero permitimos sin fechas)
    if (!sendWithoutDates && hasDates && isCheckingAvailability) {
      setMessage({ type: 'error', text: 'Please wait until availability check finishes.' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const payload = {
        clientName: clientName.trim() || null,
        clientEmail: clientEmail.trim(),
        checkIn: sendWithoutDates ? null : (checkIn || null),
        checkOut: sendWithoutDates ? null : (checkOut || null),
        guests: sendWithoutDates ? null : (guestsNum ?? null),
        items: (items as any[]).map((villa) => ({
          id: villa.id,
          name: villa.name,
          location: getLocation(villa),
          bedrooms: villa.bedrooms,
          bathrooms: villa.bathrooms,
          priceUSD: villa.priceUSD,
          imageUrl: getImageUrl(villa),
          guestyBookingDomain:
            (villa as any).guestyBookingDomain ||
            (villa as any).guesty_booking_domain ||
            'book.guesty.com',
        })),
      };

      const createResponse = await api<{ quoteId: number; success: boolean; message: string }>('/quotes', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const quoteId = createResponse.quoteId;

      await api(`/quotes/${quoteId}/send`, { method: 'POST' });

      setMessage({
        type: 'success',
        text: `Quote sent successfully to ${clientEmail}. Your client will receive direct booking links.`,
      });

      setClientName('');
      setClientEmail('');
      setCheckIn('');
      setCheckOut('');
      setGuests('');
      clearCart();

      window.setTimeout(() => onClose(), 2000);
    } catch (err: any) {
      console.error('Error sending quote:', err);
      setMessage({
        type: 'error',
        text: err?.message || 'Error sending quote. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitQuote({ sendWithoutDates: false });
  };

  if (!isOpen) return null;

  const badgeFor = (id: string) => {
    if (!hasDates) return null;

    const s = avMap[id]?.status || 'idle';

    if (s === 'checking') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-700">
          <Loader2 className="h-3 w-3 animate-spin" />
          Checking
        </span>
      );
    }

    if (s === 'available') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[11px] text-green-800 border border-green-200">
          <CheckCircle className="h-3 w-3" />
          Available
        </span>
      );
    }

    if (s === 'unavailable') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] text-red-800 border border-red-200">
          <AlertCircle className="h-3 w-3" />
          Not available
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] text-amber-800 border border-amber-200">
        <AlertCircle className="h-3 w-3" />
        Unknown
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl border border-neutral-200 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
          <div>
            <h2 className="text-lg font-semibold">
              Send Quote – {items.length} {items.length === 1 ? 'villa' : 'villas'} selected
            </h2>
            <p className="text-sm text-neutral-500 mt-1">Send direct booking links to your client</p>
          </div>
          <button onClick={onClose} className="text-2xl leading-none text-neutral-500 hover:text-neutral-900 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length > 0 ? (
            <>
              {/* Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {(items as any[]).map((villa) => (
                  <div
                    key={villa.id}
                    className="border border-neutral-200 rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow"
                  >
                    <div className="relative">
                      <img
                        src={getImageUrl(villa)}
                        alt={villa.name}
                        className="w-full h-32 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = PLACEHOLDER;
                        }}
                      />
                      <button
                        onClick={() => removeItem(villa.id)}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                        aria-label="Remove villa"
                      >
                        ✕
                      </button>
                      <div className="absolute bottom-2 left-2">{badgeFor(villa.id)}</div>
                    </div>

                    <div className="p-3 space-y-1">
                      <p className="text-sm font-semibold truncate">{villa.name}</p>
                      <p className="text-xs text-neutral-500 truncate">{getLocation(villa)}</p>
                      <p className="text-xs text-neutral-500">
                        {villa.bedrooms ?? '—'} BR • {villa.bathrooms ?? '—'} BA
                      </p>
                      <p className="text-xs text-neutral-700 font-medium">From {formatMoney(villa.priceUSD)}/nt</p>

                      {hasDates && avMap[villa.id]?.status === 'unavailable' && (
                        <p className="text-[11px] text-red-700">
                          {avMap[villa.id]?.reason
                            ? `Reason: ${avMap[villa.id].reason}`
                            : 'Not available for selected dates.'}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Form */}
              <div className="border border-neutral-200 rounded-lg p-6 bg-gradient-to-r from-neutral-50 to-white">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  Send Quote with Direct Booking Links
                </h3>

                <p className="text-sm text-neutral-600 mb-3">
                  Your client will receive an email with direct links to check availability and book each villa.
                </p>

                {hasDates && (
                  <div className="mb-4 rounded-lg border border-neutral-200 bg-white p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm text-neutral-800">
                        {isCheckingAvailability ? 'Checking availability…' : 'Availability check ready.'}
                        {anyUnavailable && (
                          <span className="ml-2 text-red-700 font-medium">Some villas are not available.</span>
                        )}
                        {!anyUnavailable && anyUnknown && (
                          <span className="ml-2 text-amber-700 font-medium">Some villas could not be verified.</span>
                        )}
                      </div>
                      {isCheckingAvailability && <Loader2 className="h-4 w-4 animate-spin text-neutral-700" />}
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">
                      We verify each villa for the selected date range to avoid broken booking links.
                    </p>
                  </div>
                )}

                {!isValidRange && hasDates && (
                  <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-red-800 text-sm flex gap-2">
                    <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <p>Check-out date must be after check-in date.</p>
                  </div>
                )}

                {message && (
                  <div
                    className={`mb-4 p-3 rounded-lg flex items-start gap-2 ${
                      message.type === 'success'
                        ? 'bg-green-50 text-green-800 border border-green-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}
                  >
                    {message.type === 'success' ? (
                      <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    )}
                    <p className="text-sm">{message.text}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Client */}
                  <div>
                    <h4 className="text-sm font-medium text-neutral-700 mb-3">Client Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Client name (optional)</label>
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
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Client email*</label>
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
                  </div>

                  {/* Travel */}
                  <div>
                    <h4 className="text-sm font-medium text-neutral-700 mb-3">Travel Details (Optional)</h4>

                    {travelLocked ? (
                      <div className="rounded-lg border border-neutral-200 bg-white p-3">
                        <p className="text-sm font-medium text-neutral-900">Travel details</p>
                        <p className="text-sm text-neutral-600">
                          {defaultCheckIn} → {defaultCheckOut}
                          {defaultGuests && defaultGuests > 0 ? ` • ${defaultGuests} guests` : ''}
                        </p>
                        <p className="text-xs text-neutral-500 mt-1">
                          These dates will be pre-filled in all booking links.
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Check-in
                            </label>
                            <input
                              type="date"
                              value={checkIn}
                              onChange={(e) => setCheckIn(e.target.value)}
                              className="w-full px-3 py-2.5 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900"
                              disabled={isSubmitting}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Check-out
                            </label>
                            <input
                              type="date"
                              value={checkOut}
                              onChange={(e) => setCheckOut(e.target.value)}
                              min={checkIn || undefined}
                              className="w-full px-3 py-2.5 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900"
                              disabled={isSubmitting}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1 flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              Guests
                            </label>
                            <input
                              type="number"
                              min={1}
                              value={guests}
                              onChange={(e) => setGuests(e.target.value)}
                              className="w-full px-3 py-2.5 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900"
                              placeholder="Number of guests"
                              disabled={isSubmitting}
                            />
                          </div>
                        </div>

                        <p className="text-xs text-neutral-500 mt-2">
                          {hasDates
                            ? 'We will check availability for the selected range.'
                            : 'Leave dates empty for flexible date links.'}
                        </p>
                      </>
                    )}
                  </div>

                  {/* Submit */}
                  <div className="pt-4 border-t border-neutral-200">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          type="submit"
                          disabled={
                            isSubmitting ||
                            (items as any[]).length === 0 ||
                            (!travelLocked && hasDates && anyUnavailable) ||
                            (!travelLocked && hasDates && isCheckingAvailability) ||
                            (!isValidRange && hasDates)
                          }
                          className="px-8 py-3.5 text-sm font-medium bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Sending…
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              Send Quote
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => submitQuote({ sendWithoutDates: true })}
                          disabled={isSubmitting || (items as any[]).length === 0}
                          className="px-6 py-3.5 text-sm font-medium border border-neutral-300 rounded-lg hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Send without dates
                        </button>
                      </div>

                      <div className="text-xs text-neutral-600">
                        {hasDates && anyUnavailable && (
                          <p className="text-red-700 font-medium">
                            Remove unavailable villas or change dates. (Or “Send without dates”.)
                          </p>
                        )}
                        {hasDates && !anyUnavailable && anyUnknown && (
                          <p className="text-amber-700 font-medium">
                            Some villas couldn’t be verified, but you can still send.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-10 h-10 text-neutral-400" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">Your quote is empty</h3>
              <p className="text-neutral-600 mb-6">Add villas to your quote to create a curated selection for your clients</p>
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
        {(items as any[]).length > 0 && (
          <div className="border-t border-neutral-200 px-6 py-4 bg-neutral-50">
            <div className="flex justify-between items-center">
              <div className="text-xs text-neutral-500">
                <p className="font-medium">Benefits for your clients:</p>
                <ul className="list-disc list-inside mt-1">
                  <li>Direct booking with property managers</li>
                  <li>Real-time availability</li>
                  <li>Secure payment processing</li>
                </ul>
              </div>

              <div className="text-right">
                <p className="text-sm font-medium text-neutral-900">
                  {(items as any[]).length} {(items as any[]).length === 1 ? 'villa' : 'villas'} selected
                </p>
                <button onClick={onClose} className="mt-2 text-sm font-medium text-neutral-700 hover:text-neutral-900">
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
