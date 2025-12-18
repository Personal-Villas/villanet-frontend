import React from 'react';

const EarlyAccessSection: React.FC = () => {
  return (
    <>
      <div data-orientation="horizontal" role="none" className="shrink-0 bg-border h-[1px] w-full mx-auto max-w-6xl"></div>
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-sm font-medium tracking-[0.125em] uppercase text-muted-foreground mb-6">
            Early Access
          </p>
          <p className="text-lg text-muted-foreground leading-[1.6] mb-6">
            Access to Villanet is currently limited.
          </p>
          <p className="text-lg text-foreground font-medium mb-4">
            Early access is intended for:
          </p>
          <ul className="space-y-3 mb-8">
            <li className="flex items-start gap-3">
              <span className="text-muted-foreground">•</span>
              <span className="text-lg text-muted-foreground">Independent or small-agency luxury travel advisors</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-muted-foreground">•</span>
              <span className="text-lg text-muted-foreground">Advisors actively selling villas in the Caribbean or Mexico</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-muted-foreground">•</span>
              <span className="text-lg text-muted-foreground">Professionals who value transparency and operational clarity</span>
            </li>
          </ul>
          <p className="text-base text-muted-foreground italic">
            Requests are reviewed manually.
          </p>
        </div>
      </section>
    </>
  );
};

export default EarlyAccessSection;