import React, { useEffect } from 'react';
import { useAdvisorSignup } from '../hooks/useAdvisorSignup';
import { AdvisorSignupStep1 } from '../components/advisor-signup/AdvisorSignupStep1';
import AdvisorSignupStep2 from '../components/advisor-signup/AdvisorSignupStep2';
import { WelcomeStep } from '../components/advisor-signup/WelcomeStep';

export const AdvisorSignup: React.FC = () => {
  const {
    currentStep,
    formData,
    updateFormData,
    goToWelcome,
    goBackToStep1,
    goToStep2,
    submitForm,
    isSubmitting,
    submitError,
    clearStorage
  } = useAdvisorSignup();

  // ✅ Limpiar cualquier dato guardado de sesiones anteriores al entrar a la página.
  // Evita que un usuario que ya visitó el signup arranque con datos viejos pre-cargados.
  useEffect(() => {
    clearStorage();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFinalSubmit = async () => {
    try {
      const result = await submitForm();

      // ✅ Guardar token en localStorage
      localStorage.setItem('access', result.accessToken);

      // ✅ Disparar evento para que el AuthContext se actualice automáticamente
      window.dispatchEvent(new Event('authStateChange'));

      // ✅ Pequeño delay para asegurar que el contexto se actualice antes de redirigir
      setTimeout(() => {
        window.location.href = '/properties';
      }, 100);

    } catch (error) {
      console.error('Signup submission error:', error);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'step1':
        return (
          <div className="max-w-md mx-auto pt-24 pb-16 px-6">
            <p className="text-sm font-medium tracking-[0.125em] uppercase text-muted-foreground mb-4">
              FOR TRAVEL ADVISORS
            </p>
            <h1 className="font-momo font-semibold text-4xl md:text-5xl leading-[1.1] text-foreground mb-4 md:w-[450px]">
              Become a Verified Villa Advisor
            </h1>
            <p className="text-base md:text-lg text-muted-foreground mb-10">
              Get access to the travel industry's most vetted villas — backed by data, trusted by professionals.
            </p>

            <AdvisorSignupStep1
              data={formData}
              updateData={updateFormData}
              onComplete={goToWelcome}
            />
          </div>
        );
      case 'welcome':
        return (
          <WelcomeStep onContinue={goToStep2} />
        );
      case 'step2':
        return (
          <>
            {submitError && (
              <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md mx-auto z-50">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{submitError}</span>
                <button
                  onClick={() => window.location.reload()}
                  className="ml-2 text-red-800 underline"
                >
                  Try again
                </button>
              </div>
            )}
            <AdvisorSignupStep2
              data={formData}
              updateData={updateFormData}
              onSubmit={handleFinalSubmit}
              isSubmitting={isSubmitting}
              onBack={goBackToStep1}
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {renderStep()}
    </div>
  );
};