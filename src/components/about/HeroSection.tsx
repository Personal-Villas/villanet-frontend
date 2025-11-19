import React from "react";

export const HeroSection: React.FC = () => {
  return (
    <section className="pt-32 pb-24 px-6">
      <div className="container mx-auto max-w-4xl text-center">
        <p className="text-sm font-medium tracking-[0.1em] uppercase text-muted-foreground mb-6">
          ABOUT VILLA NET
        </p>
        <h1 className="font-semibold text-5xl md:text-[64px] leading-[1.1] text-foreground mb-6">
          The Future of Trust in Luxury Travel
        </h1>
        <p className="text-xl text-foreground mb-4 max-w-3xl mx-auto">
          Luxury villas deserve better than endless scrolls and uncertain hosts.
        </p>
        <p className="text-lg leading-[1.6] text-muted-foreground max-w-3xl mx-auto">
          Villa Net makes trust visible — connecting travel advisors and verified property managers through the world's first trust layer for luxury villas.
        </p>
      </div>
    </section>
  );
};