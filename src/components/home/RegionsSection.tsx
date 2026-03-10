import React from "react";

const regions = [
  {
    name: "Caribbean",
    locations: [
      "St. Barthélemy (St. Barts)",
      "Turks & Caicos",
      "St. Martin / St. Maarten",
      "Barbados",
      "Jamaica",
      "British Virgin Islands",
    ],
  },
  {
    name: "Dominican Republic",
    locations: [
      "Casa de Campo, Dominican Republic",
      "Punta Cana, Dominican Republic",
      "Cap Cana, Dominican Republic",
    ],
  },
  {
    name: "Mexico",
    locations: [
      "Punta Mita, Mexico",
      "Puerto Vallarta, Mexico",
      "Riviera Maya, Mexico",
    ],
  },
];

const villaImages = [
  { src: "src/assets/images/caribbean-villa.png", alt: "Caribbean villa" },
  { src: "src/assets/images/dominican-villa.png", alt: "Dominican Republic villa" },
  { src: "src/assets/images/mexico-villa.png", alt: "Mexico villa" },
];

export const RegionsSection: React.FC = () => {
  return (
    <section id="regions" className="py-24 px-6 bg-accent/20">
      <div className="container mx-auto max-w-6xl text-center">
        <h2 className="text-4xl md:text-5xl font-semibold text-foreground mb-4">
          Elite inventory. Global coverage.
        </h2>
        <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-14 leading-relaxed">
          We expand selectively, opening only the markets where our operational
          benchmarks are met.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-4xl mx-auto text-left mb-14">
          {regions.map((region) => (
            <div key={region.name}>
              <h3 className="text-lg font-semibold text-foreground mb-4">
                {region.name}
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {region.locations.map((location) => (
                  <li key={location}>{location}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Villa photo grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {villaImages.map((img) => (
            <div
              key={img.alt}
              className="relative rounded-xl overflow-hidden aspect-[4/3] bg-muted"
            >
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <div className="absolute top-3 left-3">
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 bg-background/90 text-foreground text-xs font-medium backdrop-blur-sm border border-transparent">
                  Vetted
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};