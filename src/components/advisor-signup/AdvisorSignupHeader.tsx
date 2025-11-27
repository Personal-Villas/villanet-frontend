import React from 'react';

interface AdvisorSignupHeaderProps {
  currentStep: number;
  totalSteps: number;
}

export const AdvisorSignupHeader: React.FC<AdvisorSignupHeaderProps> = ({
  currentStep,
  totalSteps
}) => {
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
      
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};