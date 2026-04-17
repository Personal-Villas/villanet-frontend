// components/ExpansionModal.tsx
import { useState, useEffect } from 'react';
import { X, MapPin, Calendar, BedDouble, Bath, DollarSign, Users, User, Mail, Search } from 'lucide-react';
import { publicApi } from '../api/api';
import { useAuth } from '../auth/useAuth';
import { ExpansionLeadRequest, ExpansionLeadResponse } from '../types/leads';
import { toast } from 'sonner';

interface ExpansionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFilters: {
    query: string;
    selectedDestination: string;
    bedrooms: string[];
    bathrooms: string[];
    minPrice: string;
    maxPrice: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    selectedBadges: string[];
    sortBy: string;
  };
  currentResultsCount: number;
}

export default function ExpansionModal({
  isOpen,
  onClose,
  currentFilters,
  currentResultsCount,
}: ExpansionModalProps) {
  const { user } = useAuth(); // Hook de autenticación
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Estados de contacto
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');

  // Estados del formulario - inicializados con los filtros actuales
  const [location, setLocation] = useState(currentFilters.selectedDestination || currentFilters.query || '');
  const [checkIn, setCheckIn] = useState(currentFilters.checkIn || '');
  const [checkOut, setCheckOut] = useState(currentFilters.checkOut || '');
  const [bedrooms, setBedrooms] = useState<string[]>(currentFilters.bedrooms || []);
  const [bathrooms, setBathrooms] = useState<string[]>(currentFilters.bathrooms || []);
  const [minPrice, setMinPrice] = useState(currentFilters.minPrice || '');
  const [maxPrice, setMaxPrice] = useState(currentFilters.maxPrice || '');
  const [guests, setGuests] = useState(currentFilters.guests || 0);

  // Auto-poblar nombre y email si está logueado
  useEffect(() => {
    if (user) {
      // Determinar el nombre según el tipo de usuario
      let userName = '';
      
      if (user.full_name) {
        // Usuario regular (tabla users)
        userName = user.full_name;
      }

      setFullName(userName);
      setEmail(user.email || '');
    }
  }, [user]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación de campos requeridos
    if (!fullName.trim()) {
      toast.error('Please provide your name');
      return;
    }

    if (!email.trim()) {
      toast.error('Please provide your email');
      return;
    }

    // Validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please provide a valid email address');
      return;
    }

    // Validación de búsqueda
    if (!location && !checkIn && !checkOut) {
      toast.error('Please provide at least a location or dates');
      return;
    }

    setLoading(true);

    try {
      // Tracking GTM - Submit
      if (window.dataLayer) {
        window.dataLayer.push({
          event: 'expansion_request_submitted',
          location,
          check_in: checkIn,
          check_out: checkOut,
          bedrooms: bedrooms.join(','),
          bathrooms: bathrooms.join(','),
          guests,
          current_results_count: currentResultsCount,
          user_logged_in: !!user,
        });
      }

      const requestData: ExpansionLeadRequest = {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        location,
        checkIn,
        checkOut,
        bedrooms,
        bathrooms,
        minPrice,
        maxPrice,
        guests,
        amenities: currentFilters.selectedBadges,
        currentResultsCount,
        searchContext: {
          query: currentFilters.query,
          selectedDestination: currentFilters.selectedDestination,
          sortBy: currentFilters.sortBy,
        },
      };

      const response = await publicApi.post<ExpansionLeadResponse>(
        '/api/leads/expansion-request',
        requestData
      );

      setSuccess(true);
      toast.success('Request received! We\'ll be in touch soon.');

      // Tracking GTM - Success
      if (window.dataLayer) {
        window.dataLayer.push({
          event: 'expansion_request_success',
          lead_id: response.leadId,
        });
      }

      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (error: any) {
      console.error('Error submitting expansion request:', error);
      toast.error(error.message || 'Failed to submit request. Please try again.');
      
      // Tracking GTM - Error
      if (window.dataLayer) {
        window.dataLayer.push({
          event: 'expansion_request_error',
          error_message: error.message,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-2">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Tell us what you're looking for
              </h2>
              <p className="text-sm text-gray-500">
                We'll find the perfect villa for you
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Success State */}
        {success ? (
          <div className="px-6 py-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Request Received!
            </h3>
            <p className="text-gray-600">
              We'll reach out to you at <strong>{email}</strong> shortly with personalized villa recommendations.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
            {/* Contact Information Section */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                Your Contact Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    required
                    disabled={!!user} // Deshabilitar si está logueado
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all ${
                      user ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                  />
                  {user && (
                    <p className="text-xs text-gray-500 mt-1">
                      ✓ From your account
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    required
                    disabled={!!user} // Deshabilitar si está logueado
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all ${
                      user ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                  />
                  {user && (
                    <p className="text-xs text-gray-500 mt-1">
                      ✓ From your account
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Search Preferences Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Search className="w-4 h-4 text-gray-600" />
                What are you looking for?
              </h3>
              
              <div className="space-y-4">
                {/* Location */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4" />
                    Preferred Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. St. Barts, Turks & Caicos, Punta Mita..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4" />
                      Check-in
                    </label>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4" />
                      Check-out
                    </label>
                    <input
                      type="date"
                      value={checkOut}
                      min={checkIn || undefined}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Bedrooms & Bathrooms */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <BedDouble className="w-4 h-4" />
                      Bedrooms
                    </label>
                    <input
                      type="text"
                      value={bedrooms.join(', ')}
                      onChange={(e) => setBedrooms(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                      placeholder="e.g. 4, 5, or 6+"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Bath className="w-4 h-4" />
                      Bathrooms
                    </label>
                    <input
                      type="text"
                      value={bathrooms.join(', ')}
                      onChange={(e) => setBathrooms(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                      placeholder="e.g. 4, 5"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="w-4 h-4" />
                    Budget (per night)
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      placeholder="Min price"
                      min="0"
                      step="100"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                    />
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      placeholder="Max price"
                      min="0"
                      step="100"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Guests */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Users className="w-4 h-4" />
                    Number of Guests
                  </label>
                  <input
                    type="number"
                    value={guests || ''}
                    onChange={(e) => setGuests(parseInt(e.target.value) || 0)}
                    placeholder="How many guests?"
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center">
              We'll review your request and get back to you within 24 hours with personalized recommendations.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}