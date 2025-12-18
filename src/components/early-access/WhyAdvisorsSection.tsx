import React from 'react';

const WhyAdvisorsSection: React.FC = () => {
  return (
    <section className="py-24 px-6 bg-[#FAFAFA]">
      <div className="max-w-3xl mx-auto">
        <p className="text-sm font-medium tracking-[0.125em] uppercase text-muted-foreground mb-6">
          Why Advisors Use Villanet
        </p>
        <p className="text-lg text-muted-foreground leading-[1.6] mb-10">
          Most villa platforms prioritize scale and aesthetics.<br />
          Villanet prioritizes clarity and trust.
        </p>
        <ul className="space-y-4">
          <li className="flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-check h-5 w-5 text-accent mt-0.5 flex-shrink-0">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="m9 12 2 2 4-4"></path>
            </svg>
            <span className="text-lg text-foreground">Clear commission visibility</span>
          </li>
          <li className="flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-check h-5 w-5 text-accent mt-0.5 flex-shrink-0">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="m9 12 2 2 4-4"></path>
            </svg>
            <span className="text-lg text-foreground">Transparency into who manages each villa</span>
          </li>
          <li className="flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-check h-5 w-5 text-accent mt-0.5 flex-shrink-0">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="m9 12 2 2 4-4"></path>
            </svg>
            <span className="text-lg text-foreground">Consistent operational standards</span>
          </li>
          <li className="flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-check h-5 w-5 text-accent mt-0.5 flex-shrink-0">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="m9 12 2 2 4-4"></path>
            </svg>
            <span className="text-lg text-foreground">A curated portfolio — not endless inventory</span>
          </li>
          <li className="flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-check h-5 w-5 text-accent mt-0.5 flex-shrink-0">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="m9 12 2 2 4-4"></path>
            </svg>
            <span className="text-lg text-foreground">Faster, more confident quoting</span>
          </li>
        </ul>
      </div>
    </section>
  );
};

export default WhyAdvisorsSection;