import React, { useState } from 'react';
import { usePropertyManagerSignup } from '../hooks/usePropertyManagerSignup';
import { PropertyManagerSignupForm } from '../components/property-manager-signup/PropertyManagerSignupForm';
import { SuccessStep } from '../components/property-manager-signup/SuccessStep';

export const PropertyManagerSignup: React.FC = () => {
  const {
    currentStep,
    formData,
    updateFormData,
    //goToSuccess,
    submitForm,
    isSubmitting,
    submitError
  } = usePropertyManagerSignup();

  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      const success = await submitForm();
      if (!success) {
        setLocalError('Failed to submit form. Please try again.');
      }
    } catch (error) {
      setLocalError('An unexpected error occurred. Please try again.');
    }
  };

  const handleReturnHome = () => {
    window.location.href = '/';
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'form':
        return (
          <div className="max-w-md mx-auto pt-24 pb-16 px-6">
            <p className="text-sm font-medium tracking-[0.125em] uppercase text-muted-foreground mb-4">
              FOR PROPERTY MANAGERS
            </p>
            <h1 className="font-momo font-medium text-4xl md:text-5xl leading-[1.1] text-foreground mb-4">
              Partner with Villa Net
            </h1>
            <p className="text-base md:text-lg text-muted-foreground mb-10">
              Join our trusted network of verified property managers and connect with top travel advisors worldwide.
            </p>
            
            {(submitError || localError) && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                <strong className="font-bold">Error: </strong>
                <span>{submitError || localError}</span>
              </div>
            )}
            
            <PropertyManagerSignupForm
              data={formData}
              updateData={updateFormData}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          </div>
        );
      case 'success':
        return (
          <SuccessStep onReturnHome={handleReturnHome} />
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