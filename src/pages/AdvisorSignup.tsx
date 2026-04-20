import React, { useEffect, useState } from 'react';
import { useAdvisorSignup } from '../hooks/useAdvisorSignup';
import { AdvisorSignupStep1 } from '../components/advisor-signup/AdvisorSignupStep1';
import AdvisorSignupStep2 from '../components/advisor-signup/AdvisorSignupStep2';
import { SuccessScreen } from '../components/SuccessScreen';

// WelcomeStep removed: it showed a false success screen (green check, "You're in!")
// before the account was actually created (that only happens on step2 submit).
// Step1 now goes directly to step2.

export const AdvisorSignup: React.FC = () => {
  const {
    currentStep,
    formData,
    updateFormData,
    goBackToStep1,
    goToStep2,
    submitForm,
    isSubmitting,
    submitError,
    clearStorage
  } = useAdvisorSignup();

  // Shows the real success screen only after submitForm() resolves successfully.
  const [showSuccess, setShowSuccess] = useState(false);

  // Clean up any data saved from previous sessions on mount.
  // Prevents a returning visitor from seeing pre-filled stale data.
  useEffect(() => {
    clearStorage();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFinalSubmit = async () => {
    try {
      const result = await submitForm();

      // Save token and notify AuthContext
      localStorage.setItem('access', result.accessToken);
      window.dispatchEvent(new Event('authStateChange'));

      // Account created successfully — now show the success screen
      setShowSuccess(true);

    } catch (error) {
      console.error('Signup submission error:', error);
    }
  };

  const handleReturnHome = () => {
    window.location.href = '/properties';
  };

  // Success screen only renders after a confirmed successful submit
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-background">
        <SuccessScreen
          title="You're in. Welcome to Villa Net."
          subtitle="Your advisor account is ready. You now have access to our full catalog of vetted luxury villas."
          onReturnHome={handleReturnHome}
        />
      </div>
    );
  }

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
              onComplete={goToStep2}
            />
          </div>
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