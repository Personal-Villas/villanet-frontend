import React from "react";

export const HeroSection: React.FC = () => {
  return (
    <section className="pt-32 pb-24 px-6">
      <div className="container mx-auto max-w-4xl text-center">
        <p className="text-sm font-medium tracking-[0.125em] uppercase text-muted-foreground mb-6 animate-fade-in-up">
          FOR TRAVEL ADVISORS
        </p>
        <h1 className="font-momo font-semibold text-5xl md:text-[64px] leading-[1.1] text-foreground mb-6 animate-fade-in-up" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
          Book with Confidence. Earn with Trust.
        </h1>
        <p className="text-lg md:text-xl leading-[1.6] text-muted-foreground max-w-3xl mx-auto mb-12 animate-fade-in-up" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
          Villa Net connects you with the world's most vetted villas — managed by trusted professionals, verified by data.
        </p>
        <div className="flex justify-center animate-fade-in-up" style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
          <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-[#000000] text-white hover:bg-black/90 h-10 text-base py-[14px] px-9 rounded-md shadow-none">
            Join the Advisor Network →
          </button>
        </div>
      </div>
    </section>
  );
};