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
    available: boolean | null;
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

  // ===== NUEVOS CAMPOS =====
  const [guestFirstName, setGuestFirstName] = useState('');
  const [guestLastName, setGuestLastName] = useState('');
  const [travelAdvisorEmail, setTravelAdvisorEmail] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [sendToGuest, setSendToGuest] = useState(false);

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<MessageState>(null);

  // availability UI
  const [avMap, setAvMap] = useState<AvMap>({});
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);

  const travelLocked = !!defaultCheckIn && !!defaultCheckOut;

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

    setMessage(null);

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
  }, [isOpen, defaultCheckIn, defaultCheckOut, defaultGuests, items]);

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
    if (travelLocked) return;

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

    if (!isValidRange) return;

    if (avDebounceRef.current) window.clearTimeout(avDebounceRef.current);

    avDebounceRef.current = window.setTimeout(async () => {
      avAbortRef.current?.abort();
      const ac = new AbortController();
      avAbortRef.current = ac;

      try {
        setIsCheckingAvailability(true);

        setAvMap((prev) => {
          const next: AvMap = { ...prev };
          for (const it of items as any[]) next[it.id] = { status: 'checking' };
          return next;
        });

        const body = {
          checkIn,
          checkOut,
          guests: guestsNum,
          strict: false,
          items: (items as any[]).map((villa) => ({
            id: villa.id,
            guestyBookingDomain:
              (villa as any).guestyBookingDomain ||
              (villa as any).guesty_booking_domain ||
              'book.guesty.com',
          })),
        };

        const resp = await api.post('/quotes/availability-check', body);
        if (ac.signal.aborted) return;

        const data: AvailabilityResponse = resp.data;
        if (!data.ok || !Array.isArray(data.results)) {
          throw new Error('Invalid response from availability check');
        }

        const newMap: AvMap = {};
        for (const r of data.results) {
          const lid = String(r.listingId);
          if (r.available === true) {
            newMap[lid] = { status: 'available' };
          } else if (r.available === false) {
            newMap[lid] = { status: 'unavailable', reason: r.reason };
          } else {
            newMap[lid] = { status: 'unknown', reason: r.reason };
          }
        }

        setAvMap((prev) => {
          const merged: AvMap = {};
          for (const it of items as any[]) {
            merged[it.id] = newMap[it.id] || prev[it.id] || { status: 'idle' };
          }
          return merged;
        });
      } catch (err: any) {
        if (ac.signal.aborted) return;
        console.error('Availability check error:', err);
        setAvMap((prev) => {
          const next: AvMap = { ...prev };
          for (const it of items as any[]) next[it.id] = { status: 'unknown' };
          return next;
        });
      } finally {
        if (!ac.signal.aborted) {
          setIsCheckingAvailability(false);
        }
      }
    }, 500);

    return () => {
      if (avDebounceRef.current) window.clearTimeout(avDebounceRef.current);
      avAbortRef.current?.abort();
    };
  }, [isOpen, travelLocked, hasDates, isValidRange, checkIn, checkOut, guestsNum, items]);

  // ======== Submit (ORIGINAL LOGIC) ========
  async function submitQuote({ sendWithoutDates }: { sendWithoutDates: boolean }) {
    // Validaciones de campos requeridos
    if (!guestFirstName.trim()) {
      setMessage({ type: 'error', text: 'Guest first name is required' });
      return;
    }

    if (!guestLastName.trim()) {
      setMessage({ type: 'error', text: 'Guest last name is required' });
      return;
    }

    if (!travelAdvisorEmail.trim()) {
      setMessage({ type: 'error', text: 'Travel advisor email is required' });
      return;
    }

    if (sendToGuest && !guestEmail.trim()) {
      setMessage({ type: 'error', text: 'Guest email is required when "Send copy to guest" is checked' });
      return;
    }

    if (hasDates && !isValidRange) {
      setMessage({ type: 'error', text: 'Check-out date must be after check-in date.' });
      return;
    }

    if (hasDates && anyUnavailable && !sendWithoutDates) {
      setMessage({
        type: 'error',
        text: 'Some villas are not available for these dates. Remove them or change dates (or send without dates).',
      });
      return;
    }

    if (!sendWithoutDates && hasDates && isCheckingAvailability) {
      setMessage({ type: 'error', text: 'Please wait until availability check finishes.' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const payload = {
        guestFirstName: guestFirstName.trim(),
        guestLastName: guestLastName.trim(),
        travelAdvisorEmail: travelAdvisorEmail.trim(),
        guestEmail: sendToGuest && guestEmail.trim() ? guestEmail.trim() : null,
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

      // PASO 1: Crear el quote
      const createResponse = await api<{ quoteId: number; success: boolean; message: string }>('/quotes', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const quoteId = createResponse.quoteId;

      // PASO 2: Enviar el quote
      await api(`/quotes/${quoteId}/send`, { 
        method: 'POST',
        body: JSON.stringify(payload), // Enviar los mismos datos para que se actualicen
      });

      setMessage({
        type: 'success',
        text: guestEmail 
          ? `Quote sent successfully to ${travelAdvisorEmail} and ${guestEmail}!`
          : `Quote sent successfully to ${travelAdvisorEmail}!`,
      });

      // Limpiar formulario
      setGuestFirstName('');
      setGuestLastName('');
      setTravelAdvisorEmail('');
      setGuestEmail('');
      setSendToGuest(false);
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

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="absolute inset-0 overflow-auto">
        <div className="min-h-full flex items-start justify-center p-4 sm:p-6">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl my-8 flex flex-col max-h-[calc(100vh-4rem)]">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-neutral-200 px-6 py-4 rounded-t-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-semibold text-neutral-900 mb-1">
                    Send Curated Email Quote
                  </h3>
                </div>
                <button
                  onClick={onClose}
                  className="text-neutral-400 hover:text-neutral-600 transition-colors p-1 rounded-lg hover:bg-neutral-100"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Body - scrollable */}
            <div className="flex-1 overflow-auto">
              {(items as any[]).length > 0 ? (
                <>
                  {/* Villas grid */}
                  <div className="px-6 py-6 border-b border-neutral-200">
                    <h4 className="text-sm font-medium text-neutral-700 mb-4">
                      Selected Villas ({(items as any[]).length})
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {(items as any[]).map((villa) => {
                        const avStatus = avMap[villa.id]?.status || 'idle';
                        const avReason = avMap[villa.id]?.reason;

                        return (
                          <div key={villa.id} className="group relative bg-white border border-neutral-200 rounded-xl overflow-hidden hover:shadow-md transition-all">
                            <div className="relative h-48">
                              <img
                                src={getImageUrl(villa)}
                                alt={villa.name}
                                className="w-full h-full object-cover"
                              />
                              <button
                                onClick={() => removeItem(villa.id)}
                                className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
                                title="Remove from quote"
                              >
                                <X className="w-4 h-4 text-neutral-600" />
                              </button>

                              {/* Availability badge */}
                              {hasDates && (
                                <div className="absolute top-2 left-2">
                                  {avStatus === 'checking' && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-md">
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                      Checking...
                                    </span>
                                  )}
                                  {avStatus === 'available' && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-md">
                                      <CheckCircle className="w-3 h-3" />
                                      Available
                                    </span>
                                  )}
                                  {avStatus === 'unavailable' && (
                                    <span
                                      className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-md cursor-help"
                                      title={avReason || 'Not available'}
                                    >
                                      <AlertCircle className="w-3 h-3" />
                                      Unavailable
                                    </span>
                                  )}
                                  {avStatus === 'unknown' && (
                                    <span
                                      className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-md cursor-help"
                                      title={avReason || 'Could not verify'}
                                    >
                                      <AlertCircle className="w-3 h-3" />
                                      Unknown
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="p-4">
                              <h5 className="font-semibold text-neutral-900 mb-1 line-clamp-1">{villa.name}</h5>
                              <p className="text-sm text-neutral-600 mb-2 line-clamp-1">{getLocation(villa)}</p>
                              <div className="flex items-center justify-between text-xs text-neutral-500">
                                <span>
                                  {villa.bedrooms} BD • {villa.bathrooms} BA
                                </span>
                                <span className="font-semibold text-neutral-900">{formatMoney(villa.priceUSD)}/nt</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Message */}
                  {message && (
                    <div className="px-6 pt-4">
                      <div
                        className={`p-4 rounded-lg flex items-start gap-2 ${
                          message.type === 'success'
                            ? 'bg-green-50 border border-green-200 text-green-800'
                            : 'bg-red-50 border border-red-200 text-red-800'
                        }`}
                      >
                        {message.type === 'success' ? (
                          <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        )}
                        <p className="text-sm font-medium">{message.text}</p>
                      </div>
                    </div>
                  )}

                  {/* Form */}
                  <div className="px-6 py-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Client Information */}
                      <div>
                        <h4 className="text-sm font-medium text-neutral-700 mb-3">Client Information</h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Guest First Name */}
                          <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">
                              Guest First Name*
                            </label>
                            <input
                              type="text"
                              value={guestFirstName}
                              onChange={(e) => setGuestFirstName(e.target.value)}
                              required
                              className="w-full px-3 py-2.5 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900"
                              placeholder="e.g. Sarah"
                              disabled={isSubmitting}
                            />
                          </div>

                          {/* Guest Last Name */}
                          <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">
                              Guest Last Name*
                            </label>
                            <input
                              type="text"
                              value={guestLastName}
                              onChange={(e) => setGuestLastName(e.target.value)}
                              required
                              className="w-full px-3 py-2.5 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900"
                              placeholder="e.g. Johnson"
                              disabled={isSubmitting}
                            />
                          </div>

                          {/* Travel Advisor Email */}
                          <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">
                              Travel Advisor Email*
                            </label>
                            <input
                              type="email"
                              value={travelAdvisorEmail}
                              onChange={(e) => setTravelAdvisorEmail(e.target.value)}
                              required
                              className="w-full px-3 py-2.5 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900"
                              placeholder="advisor@email.com"
                              disabled={isSubmitting}
                            />
                            <p className="text-xs text-neutral-500 mt-1">
                              You will receive an email with the full quote which you can forward to your client
                            </p>
                          </div>

                          {/* Guest Email (Checkbox + Campo) */}
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <input
                                type="checkbox"
                                id="sendToGuest"
                                checked={sendToGuest}
                                onChange={(e) => setSendToGuest(e.target.checked)}
                                className="w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-2 focus:ring-neutral-900"
                                disabled={isSubmitting}
                              />
                              <label htmlFor="sendToGuest" className="text-sm font-medium text-neutral-700">
                                Send copy to guest
                              </label>
                            </div>

                            {sendToGuest && (
                              <input
                                type="email"
                                value={guestEmail}
                                onChange={(e) => setGuestEmail(e.target.value)}
                                required={sendToGuest}
                                className="w-full px-3 py-2.5 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900"
                                placeholder="guest@email.com"
                                disabled={isSubmitting}
                              />
                            )}
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
                                <label className="text-sm font-medium text-neutral-700 mb-1 flex items-center gap-1">
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
                                <label className="text-sm font-medium text-neutral-700 mb-1 flex items-center gap-1">
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
                                <label className=" text-sm font-medium text-neutral-700 mb-1 flex items-center gap-1">
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

                            {/* Nota de Comisiones */}
                            <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 p-3">
                              <p className="text-sm text-amber-900">
                                <span className="font-semibold">Note:</span> To ensure your commission is properly protected,
                                we require the first and last name of the lead guest for each quote submitted.
                              </p>
                            </div>
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
                                !guestFirstName.trim() ||
                                !guestLastName.trim() ||
                                !travelAdvisorEmail.trim() ||
                                (sendToGuest && !guestEmail.trim()) ||
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
                              disabled={
                                isSubmitting ||
                                (items as any[]).length === 0 ||
                                !guestFirstName.trim() ||
                                !guestLastName.trim() ||
                                !travelAdvisorEmail.trim() ||
                                (sendToGuest && !guestEmail.trim())
                              }
                              className="px-6 py-3.5 text-sm font-medium border border-neutral-300 rounded-lg hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Send without dates
                            </button>
                          </div>

                          <div className="text-xs text-neutral-600">
                            {hasDates && anyUnavailable && (
                              <p className="text-red-700 font-medium">
                                Remove unavailable villas or change dates. (Or "Send without dates".)
                              </p>
                            )}
                            {hasDates && !anyUnavailable && anyUnknown && (
                              <p className="text-amber-700 font-medium">
                                Some villas couldn't be verified, but you can still send.
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
      </div>
    </div>
  );
};

export default CartModal;
