import React, { useEffect } from 'react';

interface WelcomeStepProps {
  onContinue: () => void;
}

export const WelcomeStep: React.FC<WelcomeStepProps> = ({ onContinue }) => {
  useEffect(() => {
    // Avanzar automáticamente después de 3 segundos
    const timer = setTimeout(() => {
      onContinue();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onContinue]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-md mx-auto text-center animate-fade-in">
        {/* Icono de check o éxito */}
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg 
            className="w-8 h-8 text-green-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M5 13l4 4L19 7" 
            />
          </svg>
        </div>

        {/* Título */}
        <h1 className="font-momo text-3xl md:text-4xl leading-[1.1] text-foreground mb-4">
          You're in! Welcome to the network.
        </h1>

        {/* Subtítulo */}
        <p className="text-lg text-muted-foreground mb-8">
          Help us tailor Villa Net to the way you travel.
        </p>

        {/* Spinner para indicar que está avanzando automáticamente */}
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );
};