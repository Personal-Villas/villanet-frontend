import React from "react";

export const CTASection: React.FC = () => {
  return (
    <section className="py-24 px-6">
      <div className="container mx-auto max-w-3xl text-center">
        <p className="text-sm font-medium tracking-[0.1em] uppercase text-muted-foreground mb-8">
          GET IN TOUCH
        </p>
        
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
          Interested in partnering or learning more?
        </h2>
        
        <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-[#000000] text-white hover:bg-black/90 h-10 text-base py-[14px] px-9 rounded-md shadow-none">
          Join Network →
        </button>
      </div>
    </section>
  );
};