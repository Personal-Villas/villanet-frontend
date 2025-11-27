import { useState, useEffect } from 'react';
import { PropertyManagerSignupData } from '../types/propertyManager';
import { propertyManagerService } from '../services/propertyManagerService';

const STORAGE_KEY = 'property_manager_signup_data';

export const usePropertyManagerSignup = () => {
  const [currentStep, setCurrentStep] = useState<'form' | 'success'>('form');
  const [formData, setFormData] = useState<PropertyManagerSignupData>({
    companyInfo: {
      companyName: '',
      contactName: '',
      email: '',
      website: '',
      locations: ''
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Cargar datos del localStorage al montar
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        setFormData(JSON.parse(savedData));
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  // Guardar datos en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  const updateFormData = (updates: Partial<PropertyManagerSignupData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    setSubmitError(null);
  };

  const goToSuccess = () => setCurrentStep('success');
  const goBackToForm = () => setCurrentStep('form');

  const submitForm = async (): Promise<boolean> => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Aquí llamarías al servicio para enviar los datos al backend
      const success = await propertyManagerService.submitSignup(formData);
      
      if (success) {
        // Limpiar localStorage después del envío exitoso
        localStorage.removeItem(STORAGE_KEY);
        goToSuccess();
        return true;
      } else {
        throw new Error('Failed to submit form');
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setSubmitError(errorMessage);
      return false;
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
    goToSuccess,
    goBackToForm,
    submitForm,
    isSubmitting,
    submitError,
    clearStorage
  };
};