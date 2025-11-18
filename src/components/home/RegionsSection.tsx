import React from "react";

export const RegionsSection: React.FC = () => {
  const regions = [
    {
      name: "Caribbean",
      locations: [
        "St. Barts",
        "Turks & Caicos", 
        "Anguilla",
        "St. Martin",
        "Barbados",
        "Jamaica",
        "British Virgin Islands",
        "US Virgin Islands"
      ]
    },
    {
      name: "Mexico",
      locations: [
        "Punta Mita",
        "Puerto Vallarta",
        "Los Cabos", 
        "Riviera Maya"
      ]
    },
    {
      name: "Dominican Republic",
      locations: [
        "Casa de Campo",
        "Punta Cana"
      ]
    }
  ];

  return (
    <section id="regions" className="py-[140px] px-6 bg-gray-100">
      <div className="container mx-auto max-w-6xl text-center">
        <h2 className="text-4xl md:text-5xl mb-6">Global Network. Curated Growth.</h2>
        <p className="text-base text-[#6B7280] mx-auto max-w-[720px] mb-4">
          We expand selectively, partnering only with property managers who meet our operational and service benchmarks.
        </p>
        <p className="text-lg text-muted-foreground mb-12">Quality is the gate.</p>
        
        <div className="grid md:grid-cols-3 gap-12 max-w-4xl mx-auto text-left">
          {regions.map((region) => (
            <div key={region.name}>
              <h3 className="text-lg font-semibold mb-4 text-[#111111]">
                {region.name}
              </h3>
              <ul className="space-y-2 text-sm text-[#6B7280]">
                {region.locations.map((location) => (
                  <li key={location}>{location}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};