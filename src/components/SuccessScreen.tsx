import React from 'react';

type SuccessScreenProps = {
  title: string;
  subtitle: string;
  onReturnHome: () => void;
};

/**
 * Shared success screen used after advisor and property manager signups.
 * Visual style: outline circle check, bold black title, grey subtitle, "Return to Homepage" button.
 */
export const SuccessScreen: React.FC<SuccessScreenProps> = ({
  title,
  subtitle,
  onReturnHome,
}) => {
  return (
    <div className="max-w-md mx-auto pt-24 pb-16 px-6 text-center">
      {/* Outline circle check — matches Property Manager style */}
      <div className="flex justify-center mb-8">
        <div className="w-20 h-20 rounded-full border-2 border-foreground flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-foreground"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      </div>

      {/* Title — bold, black */}
      <h1 className="font-semibold text-3xl md:text-4xl text-foreground mb-4">
        {title}
      </h1>

      {/* Subtitle — grey, normal weight */}
      <p className="text-base text-muted-foreground mb-10">
        {subtitle}
      </p>

      <button
        onClick={onReturnHome}
        className="w-full py-3 px-6 bg-foreground text-background rounded-xl font-medium text-sm hover:opacity-90 transition-opacity"
      >
        Return to Homepage
      </button>
    </div>
  );
};