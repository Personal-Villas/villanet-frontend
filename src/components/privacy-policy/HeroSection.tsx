import React from "react";

const HeroSection: React.FC = () => {
  return (
    <section className="pt-32 pb-16 px-6">
      <div className="container mx-auto max-w-3xl">
        <p className="text-sm font-medium tracking-[0.2em] uppercase text-muted-foreground mb-4">
          Legal
        </p>
        <h1 className="font-momo text-4xl md:text-5xl lg:font-semibold leading-[1.1] text-foreground mb-4">
          Privacy Policy
        </h1>
        <p className="text-lg text-foreground mb-2">
          Villa Net International LLC
        </p>
        <p className="text-sm text-muted-foreground">
          Effective Date: January 2025
        </p>
        <p className="text-base text-muted-foreground mt-4 leading-[1.8]">
          Villa Net International LLC ("Villa Net," "we," "our," "us") is committed to respecting your privacy.
        </p>
      </div>
    </section>
  );
};

export default HeroSection;