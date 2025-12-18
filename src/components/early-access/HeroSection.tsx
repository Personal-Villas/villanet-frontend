import React from 'react';

const HeroSection: React.FC = () => {
  return (
    <section className="pt-32 pb-24 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-[1.1] animate-fade-in">
          A villa search platform designed for how experienced advisors actually work.
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground leading-[1.6] mb-10 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          Villanet is an advisor-first villa search experience focused on transparency, operational trust, and a curated portfolio — built to help advisors move faster without compromising confidence.
        </p>
        <button 
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-[#000000] text-[#FFFFFF] hover:bg-[#000000]/90 h-10 text-base py-[14px] px-9 rounded-md shadow-none animate-fade-in" 
          style={{ animationDelay: '0.2s' }}
          onClick={() => {
            document.getElementById('request-form')?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          Request early access
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right ml-2 h-4 w-4">
            <path d="M5 12h14"></path>
            <path d="m12 5 7 7-7 7"></path>
          </svg>
        </button>
      </div>
    </section>
  );
};

export default HeroSection;