import React from "react";
import { useNavigate } from "react-router-dom";

interface CTASectionProps {
  onAuthClick: () => void;
}

export const CTASection: React.FC<CTASectionProps> = ({ onAuthClick }) => {
  const navigate = useNavigate();
  return (
    <section id="cta" className="py-[160px] px-6 bg-white">
      <div className="container mx-auto max-w-3xl text-center">
        <h2 className="text-5xl md:text-6xl mb-6">
          Elevate How You Source and Sell Villas.
        </h2>
        <p className="text-lg text-[#6B7280] mx-auto max-w-[680px] mb-3">
          Join a global network built on transparency, operational excellence, and trusted relationships.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-12 justify-center">
          <button 
            onClick={() => navigate('/advisor-signup')}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-[#000000] text-white hover:bg-black/90 h-10 text-base py-[14px] px-9 rounded-md shadow-none"
          >
            Join the Advisor Network →
          </button>
          
          <button 
            onClick={onAuthClick}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border bg-background hover:text-accent-foreground h-10 text-base py-[14px] px-9 rounded-md shadow-none border-[#111111] hover:bg-gray-50"
          >
            Apply as a Verified PM →
          </button>
        </div>
      </div>
    </section>
  );
};