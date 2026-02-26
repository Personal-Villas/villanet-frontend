import { useState, useEffect } from 'react';
import { Calculator, TrendingUp, DollarSign, AlertCircle, Calendar } from 'lucide-react';
import { api } from '../api/api';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { trackEvent } from '../services/analytics';

interface QuoteCalculatorProps {
  listingId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  defaultCommission?: number;
}

interface FeeItem {
  title: string;
  amount: number;
  type: string;
}

interface QuoteServerData {
  currency: string;
  nights: number;
  base: number;
  cleaning: number;
  taxes: number;
  feesTotal: number;
  feeBreakdown: FeeItem[];
  // El total de Guesty ES el precio final — sin comisión adicional
  guestyTotal: number;
}

// Helper para redondeo a 2 decimales (igual que backend)
const money2 = (n: number): number => {
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100) / 100;
};

export default function QuoteCalculator({
  listingId,
  checkIn,
  checkOut,
  guests,
}: QuoteCalculatorProps) {
  const [quoteServer, setQuoteServer] = useState<QuoteServerData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Commission is embedded in Guesty's Service Fee — no additional % applied
  // Debounce para evitar spam a Guesty
  const debouncedParams = useDebouncedValue(
    { listingId, checkIn, checkOut, guests },
    450
  );



  // Validar que tenemos las fechas necesarias
  const hasValidDates = checkIn && checkOut && checkIn !== '' && checkOut !== '';
  const hasValidGuests = guests && guests > 0;

  // Fetch inicial y cuando cambian dates/guests/listing
  useEffect(() => {
    const { listingId: lid, checkIn: ci, checkOut: co, guests: g } = debouncedParams;

    // ✅ Validación mejorada
    if (!lid || !ci || !co || !g || ci === '' || co === '') {
      setQuoteServer(null);
      setLoading(false);
      return;
    }

    const fetchQuote = async () => {
      setLoading(true);
      setError(null);

      // --- EVENTO Calculadora Usada ---
      // Se dispara cuando el usuario ha ingresado datos válidos y se inicia el cálculo
      trackEvent('calculator_used', {
        listing_id: lid,
        check_in: ci,
        check_out: co,
        guests: g
      });

      try {
        const response = await api.post('/quotes/calculate', {
          listingId: lid,
          checkIn: ci,
          checkOut: co,
          guests: g,
          commissionPct: 0, // La comisión ya está embebida en el Service Fee de Guesty
        });

        if (response.ok) {

          // --- EVENTO Cotización Creada ---
          trackEvent('quote_created', {
            listing_id: lid,
            total_price: response.breakdown?.totalGross,
            currency: response.currency,
            nights: response.nights,
          });

          setQuoteServer({
            currency: response.currency,
            nights: response.nights,
            base: response.breakdown.base,
            cleaning: response.breakdown.cleaning || 0,
            taxes: response.breakdown.taxes,
            feesTotal: response.breakdown.feesTotal || 0,
            feeBreakdown: response.breakdown.feeBreakdown || [],
            // total viene del backend — mismo cálculo que usa sendQuoteEmail
            guestyTotal: response.breakdown.total,
          });
        } else {
          setError('Unable to calculate quote');
        }
      } catch (err: any) {
        console.error('Quote calculation error:', err);
        setError(err?.message || 'Failed to calculate pricing');
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
  }, [
    debouncedParams.listingId,
    debouncedParams.checkIn,
    debouncedParams.checkOut,
    debouncedParams.guests
  ]);

  // Los valores de comisión y total vienen directamente del backend (fuente de verdad)
  // No recalculamos localmente para garantizar coincidencia exacta con Guesty

  // ✅ Estado cuando faltan fechas (NO es loading, es "esperando input")
  if (!hasValidDates || !hasValidGuests) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <Calculator className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">Price Calculator</h3>
        </div>
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-sm text-gray-600 mb-2">
            Select dates and number of guests to calculate pricing
          </p>
          <p className="text-xs text-gray-500">
            Use the booking form above to get started
          </p>
        </div>
      </div>
    );
  }

  // Estado de carga (solo cuando está fetching)
  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <Calculator className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">Price Calculator</h3>
        </div>
        <div className="space-y-4 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-8 bg-gray-200 rounded mt-6"></div>
        </div>
      </div>
    );
  }

  // Estado de error
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-red-900 mb-1">
              Unable to Calculate Quote
            </h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Si no hay datos del servidor aún, mostrar mensaje
  if (!quoteServer) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <Calculator className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">Price Calculator</h3>
        </div>
        <div className="text-center py-8">
          <p className="text-sm text-gray-600">
            Calculating pricing...
          </p>
        </div>
      </div>
    );
  }

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: quoteServer.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Calculator className="w-5 h-5 text-gray-700" />
          <h3 className="text-lg font-semibold text-gray-900">Price Calculator</h3>
        </div>
        <div className="text-sm text-gray-500">
          {quoteServer.nights} {quoteServer.nights === 1 ? 'night' : 'nights'}
        </div>
      </div>

      {/* Breakdown */}
      <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Base Rate ({quoteServer.nights} {quoteServer.nights === 1 ? 'night' : 'nights'})</span>
          <span className="font-medium text-gray-900">
            {formatMoney(quoteServer.base)}
          </span>
        </div>

        {quoteServer.cleaning > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Cleaning Fee</span>
            <span className="font-medium text-gray-900">
              {formatMoney(quoteServer.cleaning)}
            </span>
          </div>
        )}

        {/* Fees individuales del feeBreakdown */}
        {quoteServer.feeBreakdown.length > 0
          ? quoteServer.feeBreakdown.filter(f => f.amount > 0).map((fee, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-600">{fee.title}</span>
                <span className="font-medium text-gray-900">{formatMoney(fee.amount)}</span>
              </div>
            ))
          : quoteServer.feesTotal > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Fees</span>
                <span className="font-medium text-gray-900">{formatMoney(quoteServer.feesTotal)}</span>
              </div>
            )
        }

        {quoteServer.taxes > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Taxes</span>
            <span className="font-medium text-gray-900">
              {formatMoney(quoteServer.taxes)}
            </span>
          </div>
        )}
      </div>

      {/* Your Earnings — resaltar el Service Fee como comisión del advisor */}
      {(() => {
        const serviceFee = quoteServer.feeBreakdown.find(f =>
          f.title.toLowerCase().includes('service')
        );
        if (!serviceFee || serviceFee.amount <= 0) return null;
        return (
          <div className="flex justify-between items-center mb-4 py-3 px-4 bg-blue-50 rounded-lg border border-blue-200">
            <span className="text-sm font-medium text-blue-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Your Commission (Service Fee)
            </span>
            <span className="text-base font-bold text-blue-900">
              {formatMoney(serviceFee.amount)}
            </span>
          </div>
        );
      })()}

      {/* Total — igual al total de Guesty, sin cargo adicional */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-5 h-5 text-gray-700" />
            <span className="text-sm font-semibold text-gray-900">
              Total Price
            </span>
          </div>
          <p className="text-xs text-gray-500">
            All fees & taxes included
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">
            {formatMoney(quoteServer.guestyTotal)}
          </div>
        </div>
      </div>

      {/* Nota */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500 text-center">
          Your commission is included in the Service Fee above
        </p>
      </div>
    </div>
  );
}