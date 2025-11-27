import React from 'react';

interface SuccessStepProps {
  onReturnHome: () => void;
}

export const SuccessStep: React.FC<SuccessStepProps> = ({ onReturnHome }) => {
  return (
    <div className="max-w-md mx-auto pt-32 pb-16 px-6">
      <div className="text-center py-8 animate-fade-in">
        <div className="p-4 rounded-full bg-accent/10 inline-flex mb-6">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="lucide lucide-circle-check w-10 h-10 text-accent"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <path d="m9 12 2 2 4-4"></path>
          </svg>
        </div>
        
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Thank you — our team will reach out shortly to schedule an intro call.
        </h2>
        
        <p className="text-base text-muted-foreground mb-8">
          We onboard all property managers personally to ensure alignment, quality, and long-term success in the network.
        </p>
        
        <button 
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 text-base py-[14px] px-9 rounded-md shadow-none"
          onClick={onReturnHome}
        >
          Return to Homepage
        </button>
      </div>
    </div>
  );
};