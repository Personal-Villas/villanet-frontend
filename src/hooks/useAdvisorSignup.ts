import { useState, useEffect } from 'react';
import { AdvisorSignupData } from '../types/advisor';
import { advisorService } from '../services/advisorService';

// 🆕 Definir AuthResponse localmente o importarlo
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
  const [currentStep, setCurrentStep] = useState<'step1' | 'welcome' | 'step2'>('step1');
  const [formData, setFormData] = useState<AdvisorSignupData>({
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      password: ''
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Cargar datos del localStorage al montar
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        setFormData(data);
        
        // Si ya completó el paso 1, mostrar bienvenida
        if (data.personalInfo.firstName && data.personalInfo.email) {
          setCurrentStep('welcome');
        }
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
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

  // 🆕 Cambiar el tipo de retorno a AuthResponse
  const submitForm = async (): Promise<AuthResponse> => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await advisorService.submitAdvisorSignup(formData);
      
      // Limpiar localStorage después del envío exitoso
      localStorage.removeItem(STORAGE_KEY);
      
      return result; // 🆕 Devolver el resultado completo
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setSubmitError(errorMessage);
      throw error; // 🆕 Propagar el error
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