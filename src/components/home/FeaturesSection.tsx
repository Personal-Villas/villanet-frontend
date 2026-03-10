import React from "react";
import { Search, MapPin, Star } from "lucide-react";

const features = [
  {
    icon: <Search className="w-8 h-8 text-foreground mb-5" />,
    title: "Price-First Search",
    description:
      "Filter by nightly rate, total cost, or commission-eligible pricing. Surface the right villas without wading through irrelevant results.",
    imageSrc: "/assets/images/price-first-search.png",
    imageAlt: "Price-First Search UI",
  },
  {
    icon: <MapPin className="w-8 h-8 text-foreground mb-5" />,
    title: "1-Click Location Check",
    description:
      "See exactly where a villa sits — proximity to beach, airport, restaurants — before you pitch it. No guesswork, no surprises.",
    imageSrc: "/assets/images/location-check.png",
    imageAlt: "1-Click Location Check UI",
  },
  {
    icon: <Star className="w-8 h-8 text-foreground mb-5" strokeWidth={1.5} />,
    title: "Strategic Curation",
    description:
      "Build shortlists from pre-vetted inventory. Every property has standardized data, verified photos, and transparent pricing.",
    imageSrc: "/assets/images/strategic-curation.png",
    imageAlt: "Strategic Curation UI",
  },
];

export const FeaturesSection: React.FC = () => {
  return (
    <section className="py-24 px-6 bg-background">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-semibold text-foreground mb-4">
            Built for the way you actually work.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex flex-col items-start p-8 rounded-xl border border-border bg-card"
            >
              {feature.icon}
              <h3 className="text-lg font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                {feature.description}
              </p>
              <div className="w-full rounded-lg bg-muted overflow-hidden mt-auto aspect-[4/3]">
                <img
                  src={feature.imageSrc}
                  alt={feature.imageAlt}
                  className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};