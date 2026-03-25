import { useState, useEffect } from 'react';
import { AdvisorSignupData } from '../types/advisor';
import { advisorService } from '../services/advisorService';

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
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ✅ Cargar datos del localStorage al montar, pero NUNCA saltear el step1.
  // El localStorage sirve para no perder lo que el usuario ya escribió si recarga,
  // pero no debe avanzar el paso automáticamente — eso causaba que se saltee el formulario.
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const data = JSON.parse(savedData) as AdvisorSignupData;
        setFormData(() => ({
          ...data,
          personalInfo: {
            ...data.personalInfo,
            // ✅ El email de la URL siempre tiene prioridad sobre el guardado
            email: emailFromUrl || data.personalInfo.email,
          }
        }));
        // ✅ Eliminado: el bloque que hacía setCurrentStep('welcome') automáticamente.
        // El usuario siempre arranca en step1 y avanza manualmente.
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

      // Limpiar localStorage después del envío exitoso
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