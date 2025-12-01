import React from "react";
import { useNavigate } from "react-router-dom";


export const FinalCTASection: React.FC = () => {

  const navigate = useNavigate();

  return (
    <section className="py-20 md:py-24 px-6 bg-[#FAFAFA] dark:bg-accent/10">
      <div className="container mx-auto max-w-3xl text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
          Ready to Elevate Your Villa Management Business?
        </h2>
        <p className="text-lg text-muted-foreground mb-12">
          Join a global network where trust is earned, verified, and rewarded.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={() => navigate('/property-manager-signup')} className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-[#000000] text-white hover:bg-black/90 h-10 text-base py-[14px] px-9 rounded-md shadow-none">
            Apply for Verification →
          </button>
        </div>
      </div>
    </section>
  );
};