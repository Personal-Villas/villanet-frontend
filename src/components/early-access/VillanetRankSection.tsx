import React from 'react';

const VillanetRankSection: React.FC = () => {
  return (
    <section className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <p className="text-sm font-medium tracking-[0.125em] uppercase text-muted-foreground mb-6">
          The Villanet Rank™
        </p>
        <p className="text-xl font-semibold text-foreground mb-4">
          Behind every villa is a property manager.
        </p>
        <p className="text-lg text-muted-foreground leading-[1.6]">
          Villanet surfaces operational strength through a proprietary PM scoring system based on experience, responsiveness, and reliability.
        </p>
      </div>
    </section>
  );
};

export default VillanetRankSection;