import { useState, useEffect } from 'react';
import { AdvisorSignupData } from '../types/advisor';
import { advisorService } from '../services/advisorService';
import { type SupportedCurrency } from './useCurrency';

interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    role: 'admin' | 'ta' | 'pmc';
    status: 'pending' | 'approved' | 'rejected';
    full_name: string;
  };
}

const STORAGE_KEY = 'advisor_signup_data';

export const useAdvisorSignup = () => {
  // ✅ Leer el email del query param ?email= al inicializar
  const emailFromUrl = new URLSearchParams(window.location.search).get('email') ?? '';

  const [currentStep, setCurrentStep] = useState<'step1' | 'welcome' | 'step2'>('step1');
  const [formData, setFormData] = useState<AdvisorSignupData>({
    personalInfo: {
      firstName: '',
      lastName: '',
      // ✅ Precarga el email desde la URL si existe
      email: emailFromUrl,
      password: ''
    },
    agencyLogo: null,
    // ✅ NUEVO: moneda preferida — por defecto USD
    preferred_currency: 'USD' as SupportedCurrency,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ✅ Cargar datos del localStorage al montar, pero NUNCA saltear el step1.
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const data = JSON.parse(savedData) as AdvisorSignupData;
        setFormData(() => ({
          ...data,
          // ✅ Preservar preferred_currency guardado, si existe
          preferred_currency: data.preferred_currency ?? ('USD' as SupportedCurrency),
          personalInfo: {
            ...data.personalInfo,
            // ✅ El email de la URL siempre tiene prioridad sobre el guardado
            email: emailFromUrl || data.personalInfo.email,
          }
        }));
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Guardar datos en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  const updateFormData = (updates: Partial<AdvisorSignupData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    setSubmitError(null);
  };

  const goToWelcome = () => setCurrentStep('welcome');
  const goToStep2 = () => setCurrentStep('step2');
  const goBackToStep1 = () => setCurrentStep('step1');

  const submitForm = async (): Promise<AuthResponse> => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await advisorService.submitAdvisorSignup(formData);

      // ✅ NUEVO: persistir la moneda elegida en localStorage para que
      // Properties.tsx la lea inmediatamente al redirigir al dashboard.
      if (formData.preferred_currency) {
        localStorage.setItem('villanet_preferred_currency', formData.preferred_currency);
      }

      // Limpiar datos del signup (pero NO villanet_preferred_currency)
      localStorage.removeItem(STORAGE_KEY);

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setSubmitError(errorMessage);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearStorage = () => {
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    currentStep,
    formData,
    updateFormData,
    goToWelcome,
    goToStep2,
    goBackToStep1,
    submitForm,
    isSubmitting,
    submitError,
    clearStorage
  };
};