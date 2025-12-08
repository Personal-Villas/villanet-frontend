import React from "react";

const HeroSection: React.FC = () => {
  return (
    <section className="pt-32 pb-16 px-6">
      <div className="container mx-auto max-w-4xl text-center">
        <h1 className="font-momo text-4xl md:text-5xl lg:text-[64px] lg:font-medium leading-[1.1] text-foreground mb-6">
          Villa Net Principles & Trust Framework
        </h1>
        <p className="text-xl md:text-2xl text-foreground mb-4 max-w-3xl mx-auto">
          The trust layer for the global villa market—uniting top property managers, elite travel advisors, and discerning guests.
        </p>
        <p className="text-sm text-muted-foreground uppercase tracking-[0.1em]">
          Quality-controlled. Service-driven. Data-enhanced.
        </p>
      </div>
    </section>
  );
};

export default HeroSection;