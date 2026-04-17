// components/advisor-signup/AdvisorSignupStep2.tsx
import React, { useState, useEffect } from 'react';
import { AdvisorSignupStepProps } from '../../types/advisor';
import { CURRENCY_OPTIONS, type SupportedCurrency } from '../../hooks/useCurrency';

const AdvisorSignupStep2: React.FC<AdvisorSignupStepProps & { onBack?: () => void }> = ({
  data,
  updateData,
  onSubmit,
  isSubmitting = false,
  onBack
}) => {
  const [selectedAdvisorType, setSelectedAdvisorType] = useState(data.professionalInfo?.advisorType || '');
  const [selectedRegions, setSelectedRegions] = useState<string[]>(data.professionalInfo?.travelRegions || []);
  const [selectedGroupSize, setSelectedGroupSize] = useState(data.professionalInfo?.groupSize || '');
  const [selectedBudget, setSelectedBudget] = useState(data.professionalInfo?.villaBudget || '');
  const [selectedCommission, setSelectedCommission] = useState(data.professionalInfo?.commissionPreference || '');
  const [website, setWebsite] = useState(data.professionalInfo?.website || '');
  const [agreesToTerms, setAgreesToTerms] = useState(data.professionalInfo?.agreesToTerms || false);
  const [progress, setProgress] = useState(20);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);

  // ✅ NUEVO: estado local para la moneda preferida
  const [selectedCurrency, setSelectedCurrency] = useState<SupportedCurrency>(
    data.preferred_currency ?? 'USD'
  );

  const advisorTypes = [
    'Independent travel advisor',
    'Agency owner',
    'Advisor within an agency',
    'Corporate travel specialist',
    'Other'
  ];

  const travelRegions = [
    'Caribbean',
    'Mexico',
    'Mediterranean',
    'Hawaii',
    'Ski destinations',
    'Other'
  ];

  const groupSizes = [
    '2–4 guests',
    '5–8 guests',
    '8–12 guests',
    '12+ guests'
  ];

  const villaBudgets = [
    '<$2,000',
    '$2,000–$4,000',
    '$4,000–$8,000',
    '$8,000+'
  ];

  const commissionPreferences = [
    'ACH / Bank Transfer',
    'Wire',
    'Wise',
    'PayPal'
  ];

  // Calcular progreso sin actualizar formData automáticamente
  useEffect(() => {
    let completed = 0;
    const totalFields = 7;

    if (selectedAdvisorType) completed++;
    if (selectedRegions.length > 0) completed++;
    if (selectedGroupSize) completed++;
    if (selectedBudget) completed++;
    if (selectedCommission) completed++;
    if (website) completed++;
    if (agreesToTerms) completed++;

    const stepProgress = Math.round((completed / totalFields) * 80);
    const newProgress = 20 + stepProgress;
    setProgress(newProgress);
  }, [selectedAdvisorType, selectedRegions, selectedGroupSize, selectedBudget, selectedCommission, website, agreesToTerms]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setLogoError(null);

    if (!file) return;

    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
    const MAX_SIZE_MB = 2;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setLogoError('Only JPG, PNG and WEBP files are allowed.');
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setLogoError(`File size must be under ${MAX_SIZE_MB}MB.`);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setLogoPreview(objectUrl);
    updateData({ agencyLogo: file });
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setLogoError(null);
    updateData({ agencyLogo: null });
  };

  const handleAdvisorTypeChange = (type: string) => {
    setSelectedAdvisorType(type);
    updateData({
      professionalInfo: {
        ...data.professionalInfo,
        advisorType: type
      }
    });
  };

  const handleRegionToggle = (region: string) => {
    const newRegions = selectedRegions.includes(region)
      ? selectedRegions.filter(r => r !== region)
      : [...selectedRegions, region];
    
    setSelectedRegions(newRegions);
    updateData({
      professionalInfo: {
        ...data.professionalInfo,
        travelRegions: newRegions
      }
    });
  };

  const handleGroupSizeChange = (size: string) => {
    setSelectedGroupSize(size);
    updateData({
      professionalInfo: {
        ...data.professionalInfo,
        groupSize: size
      }
    });
  };

  const handleBudgetChange = (budget: string) => {
    setSelectedBudget(budget);
    updateData({
      professionalInfo: {
        ...data.professionalInfo,
        villaBudget: budget
      }
    });
  };

  const handleCommissionChange = (preference: string) => {
    setSelectedCommission(preference);
    updateData({
      professionalInfo: {
        ...data.professionalInfo,
        commissionPreference: preference
      }
    });
  };

  // ✅ NUEVO: handler para cambio de moneda
  const handleCurrencyChange = (currency: SupportedCurrency) => {
    setSelectedCurrency(currency);
    updateData({ preferred_currency: currency });
  };

  const handleWebsiteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setWebsite(value);
    updateData({
      professionalInfo: {
        ...data.professionalInfo,
        website: value
      }
    });
  };

  const handleTermsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.checked;
    setAgreesToTerms(value);
    updateData({
      professionalInfo: {
        ...data.professionalInfo,
        agreesToTerms: value
      }
    });
  };

  const handleSaveAndContinue = () => {
    if (agreesToTerms) {
      onSubmit();
    }
  };

  const handleSkip = () => {
    // ✅ Asegurar que preferred_currency quede en formData antes de enviar
    updateData({
      preferred_currency: selectedCurrency,
      professionalInfo: {
        advisorType: selectedAdvisorType,
        travelRegions: selectedRegions,
        groupSize: selectedGroupSize,
        villaBudget: selectedBudget,
        commissionPreference: selectedCommission,
        website: website,
        agreesToTerms: agreesToTerms
      }
    });
    onSubmit();
  };

  const isFormValid = agreesToTerms;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto pt-12 pb-16 px-6">
        {/* Back navigation */}
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-8"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {/* Progress Bar */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-gray-900">
              Your Advisor Profile: {progress}% Complete
            </span>
          </div>
          <div className="relative w-full overflow-hidden rounded-full bg-gray-200 h-2">
            <div 
              className="h-full bg-black transition-all duration-500 ease-out" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            The more we know, the better we can match villas to your clients.
          </p>
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Tell us more about your advisor profile
        </h3>
        <p className="text-sm text-gray-600 mb-8">
          Optional — but helps us match you with the right villas
        </p>

        {/* Advisor Type */}
        <div className="mb-10">
          <label className="text-sm font-medium text-gray-900 mb-4 block">
            I am a…
          </label>
          <div className="flex flex-wrap gap-3">
            {advisorTypes.map((type) => (
              <button
                key={type}
                type="button"
                className={`inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-medium transition-all duration-200 active:scale-95 whitespace-nowrap border-2 ${
                  selectedAdvisorType === type
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-900 border-gray-300 hover:border-gray-900'
                }`}
                onClick={() => handleAdvisorTypeChange(type)}
              >
                {type}
                {selectedAdvisorType === type && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Agency Logo */}
        <div className="mb-10">
          <label className="text-sm font-medium text-gray-900 mb-1 block">
            Agency Logo
            <span className="text-gray-500 ml-1 font-normal">(Optional)</span>
          </label>
          <p className="text-xs text-gray-500 mb-4">JPG, PNG or WEBP · Max 2MB</p>

          {logoPreview ? (
            <div className="flex items-center gap-4">
              <img
                src={logoPreview}
                alt="Agency logo preview"
                className="w-20 h-20 object-contain rounded-lg border border-gray-200 bg-gray-50 p-1"
              />
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="text-sm text-red-600 hover:text-red-700 underline underline-offset-2"
              >
                Remove
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
              <svg className="w-7 h-7 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm text-gray-500">Click to upload your logo</span>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                className="hidden"
                onChange={handleLogoChange}
              />
            </label>
          )}

          {logoError && (
            <p className="text-xs text-red-600 mt-2">{logoError}</p>
          )}
        </div>

        {/* Travel Regions */}
        <div className="mb-10">
          <label className="text-sm font-medium text-gray-900 mb-4 block">
            Your primary travel regions
            <span className="text-gray-600 ml-1 font-normal">
              (select all that apply)
            </span>
          </label>
          <div className="flex flex-wrap gap-3">
            {travelRegions.map((region) => (
              <button
                key={region}
                type="button"
                className={`inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-medium transition-all duration-200 active:scale-95 whitespace-nowrap border-2 ${
                  selectedRegions.includes(region)
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-900 border-gray-300 hover:border-gray-900'
                }`}
                onClick={() => handleRegionToggle(region)}
              >
                {region}
                {selectedRegions.includes(region) && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Group Size */}
        <div className="mb-10">
          <label className="text-sm font-medium text-gray-900 mb-4 block">
            Typical group size you book
          </label>
          <div className="flex flex-wrap gap-3">
            {groupSizes.map((size) => (
              <button
                key={size}
                type="button"
                className={`inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-medium transition-all duration-200 active:scale-95 whitespace-nowrap border-2 ${
                  selectedGroupSize === size
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-900 border-gray-300 hover:border-gray-900'
                }`}
                onClick={() => handleGroupSizeChange(size)}
              >
                {size}
                {selectedGroupSize === size && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Villa Budget */}
        <div className="mb-10">
          <label className="text-sm font-medium text-gray-900 mb-4 block">
            Typical villa budget (USD/night)
          </label>
          <div className="flex flex-wrap gap-3">
            {villaBudgets.map((budget) => (
              <button
                key={budget}
                type="button"
                className={`inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-medium transition-all duration-200 active:scale-95 whitespace-nowrap border-2 ${
                  selectedBudget === budget
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-900 border-gray-300 hover:border-gray-900'
                }`}
                onClick={() => handleBudgetChange(budget)}
              >
                {budget}
                {selectedBudget === budget && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ✅ NUEVO: Preferred Currency */}
        <div className="mb-10">
          <label className="text-sm font-medium text-gray-900 mb-1 block">
            Preferred price display currency
          </label>
          <p className="text-sm text-gray-500 mb-4">
            Prices across the platform will be shown in this currency. You can change it anytime from your profile.
          </p>
          <div className="flex flex-wrap gap-3">
            {CURRENCY_OPTIONS.map((option) => (
              <button
                key={option.code}
                type="button"
                className={`inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-medium transition-all duration-200 active:scale-95 whitespace-nowrap border-2 ${
                  selectedCurrency === option.code
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-900 border-gray-300 hover:border-gray-900'
                }`}
                onClick={() => handleCurrencyChange(option.code)}
              >
                <span>{option.flag}</span>
                <span>{option.code}</span>
                {selectedCurrency === option.code && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
          {selectedCurrency !== 'USD' && (
            <p className="text-xs text-amber-600 mt-2">
              * Prices shown in {selectedCurrency} are indicative. All bookings are billed in USD.
            </p>
          )}
        </div>

        {/* Commission Preference */}
        <div className="mb-10">
          <label className="text-sm font-medium text-gray-900 mb-4 block">
            Commission payout preference
          </label>
          <div className="flex flex-wrap gap-3">
            {commissionPreferences.map((preference) => (
              <button
                key={preference}
                type="button"
                className={`inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-medium transition-all duration-200 active:scale-95 whitespace-nowrap border-2 ${
                  selectedCommission === preference
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-900 border-gray-300 hover:border-gray-900'
                }`}
                onClick={() => handleCommissionChange(preference)}
              >
                {preference}
                {selectedCommission === preference && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Website */}
        <div className="mb-10">
          <label className="text-sm font-medium text-gray-900 mb-2 block">
            Website, Instagram, or LinkedIn
            <span className="text-gray-600 ml-1 font-normal">(optional)</span>
          </label>
          <input 
            className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent h-12"
            placeholder="https://yourwebsite.com"
            value={website}
            onChange={handleWebsiteChange}
          />
        </div>

        {/* Terms */}
        <div className="border-t border-gray-200 pt-8 mt-8">
          <div className="flex items-start gap-3 mb-4">
            <input
              type="checkbox"
              id="terms"
              checked={agreesToTerms}
              onChange={handleTermsChange}
              className="h-4 w-4 shrink-0 rounded border-gray-300 text-black focus:ring-2 focus:ring-black mt-1 cursor-pointer"
            />
            <label htmlFor="terms" className="text-sm text-gray-900 leading-relaxed cursor-pointer">
              I confirm that I book travel professionally and agree to Villa Net's ethical use and confidentiality standards.
            </label>
          </div>
          <p className="text-xs text-gray-600">
            We never share advisor data publicly. Your client details remain fully confidential.
          </p>
        </div>

        {/* Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <button 
            className={`inline-flex items-center justify-center whitespace-nowrap transition-colors px-4 py-2 flex-1 h-12 text-base font-medium rounded-md ${
              isFormValid && !isSubmitting
                ? 'bg-black text-white hover:bg-gray-800'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            onClick={handleSaveAndContinue}
            disabled={!isFormValid || isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save & Go to Dashboard'}
          </button>
          <button 
            className={`inline-flex items-center justify-center whitespace-nowrap transition-colors border bg-white hover:bg-gray-50 px-4 py-2 flex-1 h-12 text-base font-medium rounded-md border-gray-300 text-gray-900 ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={handleSkip}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Skip for Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvisorSignupStep2;