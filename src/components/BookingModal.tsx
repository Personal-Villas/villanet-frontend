import { useState } from 'react';
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
}

export default function BookingModal({ isOpen, onClose, listing, unavailableDates }: BookingModalProps) {
  const [bookingCheckIn, setBookingCheckIn] = useState('');
  const [bookingCheckOut, setBookingCheckOut] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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
      const formData = new FormData(e.currentTarget);
      const payload = {
        propertyName: listing.name,
        firstName: formData.get("firstName") as string,
        lastName: formData.get("lastName") as string,
        email: formData.get("email") as string,
        checkIn: bookingCheckIn,
        checkOut: bookingCheckOut,
        guests: Number(formData.get("guests")),
      };

      // Simular envío a la API
      await api("/booking", {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      
      setIsSuccess(true);
      
      // Cerrar automáticamente después de 2 segundos
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
        setBookingCheckIn('');
        setBookingCheckOut('');
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
      setBookingCheckIn('');
      setBookingCheckOut('');
      setIsSuccess(false);
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
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-neutral-700">First Name</label>
              <input 
                name="firstName" 
                required 
                disabled={isSubmitting}
                className="w-full border rounded-md px-3 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700">Last Name</label>
              <input 
                name="lastName" 
                required 
                disabled={isSubmitting}
                className="w-full border rounded-md px-3 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700">Email</label>
              <input 
                type="email" 
                name="email" 
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
                name="guests" 
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
                type="submit"
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
          </form>
        )}
      </div>
    </div>
  );
}