import { useState, useEffect } from 'react';
import { X, Loader2, CheckCircle } from 'lucide-react';
import DateRangeCalendar from './DateRangeCalendar';
import { api } from '../api/api';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: {
    name: string;
    price_usd: number | null;
  };
  unavailableDates: Set<string>;
  // ✅ NUEVO: Datos del usuario autenticado
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    name?: string; // Por si viene el nombre completo
  } | null;
  // ✅ NUEVO: Datos del buscador principal
  prefilledCheckIn?: string;
  prefilledCheckOut?: string;
  prefilledGuests?: number;
}

export default function BookingModal({ 
  isOpen, 
  onClose, 
  listing, 
  unavailableDates,
  user,
  prefilledCheckIn = '',
  prefilledCheckOut = '',
  prefilledGuests = 1
}: BookingModalProps) {
  // ✅ Estados para campos del formulario
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [guests, setGuests] = useState(1);
  
  const [bookingCheckIn, setBookingCheckIn] = useState('');
  const [bookingCheckOut, setBookingCheckOut] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // ✅ Pre-llenar datos del usuario cuando se abre el modal
  useEffect(() => {
    if (isOpen && user) {
      // Intentar extraer firstName y lastName
      if (user.firstName) {
        setFirstName(user.firstName);
      }
      if (user.lastName) {
        setLastName(user.lastName);
      }
      
      // Si no hay firstName/lastName pero sí name completo, intentar dividirlo
      if (!user.firstName && !user.lastName && user.name) {
        const nameParts = user.name.trim().split(/\s+/);
        if (nameParts.length >= 2) {
          setFirstName(nameParts[0]);
          setLastName(nameParts.slice(1).join(' '));
        } else {
          setFirstName(user.name);
        }
      }
      
      // Email
      if (user.email) {
        setEmail(user.email);
      }
    }
  }, [isOpen, user]);

  // ✅ Pre-llenar fechas y guests del buscador principal
  useEffect(() => {
    if (isOpen) {
      if (prefilledCheckIn) {
        setBookingCheckIn(prefilledCheckIn);
      }
      if (prefilledCheckOut) {
        setBookingCheckOut(prefilledCheckOut);
      }
      if (prefilledGuests && prefilledGuests > 0) {
        setGuests(prefilledGuests);
      }
    }
  }, [isOpen, prefilledCheckIn, prefilledCheckOut, prefilledGuests]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!bookingCheckIn || !bookingCheckOut) {
      alert("Please select check-in and check-out dates.");
      return;
    }

    if (bookingCheckOut <= bookingCheckIn) {
      alert("Check-out date must be after check-in date.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        propertyName: listing.name,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        checkIn: bookingCheckIn,
        checkOut: bookingCheckOut,
        guests: guests,
      };

      // Envío a la API
      await api("/booking", {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      
      setIsSuccess(true);
      
      // Cerrar automáticamente después de 2 segundos
      setTimeout(() => {
        handleClose();
      }, 2000);

    } catch (error) {
      console.error('Booking error:', error);
      alert("There was an error submitting the request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      // ✅ NO reseteamos firstName, lastName, email porque son datos del usuario
      // Solo reseteamos el estado de éxito
      setIsSuccess(false);
      // Opcionalmente resetear fechas y guests si quieres que se borren al cerrar
      // setBookingCheckIn('');
      // setBookingCheckOut('');
      // setGuests(1);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4"
      onClick={handleClose}
    >
      <div 
        className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-neutral-800">
            {isSuccess ? 'Booking Request Sent!' : `Book Inquiry - ${listing.name}`}
          </h2>
          {!isSubmitting && !isSuccess && (
            <button
              onClick={handleClose}
              className="p-1 hover:bg-gray-100 rounded transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {isSuccess ? (
          <div className="text-center py-8 space-y-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-green-600 mb-2">
                Thank You!
              </h3>
              <p className="text-gray-600">
                Your booking request has been submitted successfully. We will contact you shortly to confirm your reservation.
              </p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                <strong>Property:</strong> {listing.name}
              </p>
              <p className="text-sm text-green-800">
                <strong>Dates:</strong> {new Date(bookingCheckIn).toLocaleDateString()} - {new Date(bookingCheckOut).toLocaleDateString()}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700">First Name</label>
              <input 
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required 
                disabled={isSubmitting}
                className="w-full border rounded-md px-3 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700">Last Name</label>
              <input 
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required 
                disabled={isSubmitting}
                className="w-full border rounded-md px-3 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                disabled={isSubmitting}
                className="w-full border rounded-md px-3 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <DateRangeCalendar
              checkInDate={bookingCheckIn}
              checkOutDate={bookingCheckOut}
              onCheckInSelect={setBookingCheckIn}
              onCheckOutSelect={setBookingCheckOut}
              unavailableDates={unavailableDates}
            />

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>📅 How to select:</strong> Click on a date for check-in, then click on a later date for check-out.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700">Guests</label>
              <input 
                type="number" 
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                min="1" 
                required 
                disabled={isSubmitting}
                className="w-full border rounded-md px-3 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div className="flex gap-3 pt-2 pb-10 lg:pb-0">
              <button 
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 bg-neutral-100 text-neutral-700 px-6 py-2 rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>

              <button 
                type="button"
                onClick={(e) => {
                  const form = e.currentTarget.closest('.space-y-4')?.parentElement as HTMLFormElement;
                  if (form) {
                    handleSubmit({ preventDefault: () => {}, currentTarget: form } as any);
                  }
                }}
                disabled={isSubmitting}
                className="flex-1 bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Send Request'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}