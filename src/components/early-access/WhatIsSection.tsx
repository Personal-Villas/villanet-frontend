import React from 'react';

const WhatIsSection: React.FC = () => {
  return (
    <>
      <div data-orientation="horizontal" role="none" className="shrink-0 bg-border h-[1px] w-full mx-auto max-w-6xl"></div>
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-sm font-medium tracking-[0.125em] uppercase text-muted-foreground mb-6">
            What is Villanet
          </p>
          <div className="space-y-6">
            <p className="text-lg text-muted-foreground leading-[1.6]">
              Villanet is a private villa search platform built specifically for luxury travel advisors.
            </p>
            <p className="text-lg text-muted-foreground leading-[1.6]">
              It brings together vetted villa partners across the Caribbean and Mexico, with structured data that makes pricing, operations, and portfolio quality easier to understand.
            </p>
            <p className="text-xl font-semibold text-foreground mt-8">
              This is not a B2C marketplace.<br />Villanet is designed for advisors.
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

export default WhatIsSection;