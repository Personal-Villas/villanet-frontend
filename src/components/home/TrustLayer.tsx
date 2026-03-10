import React from "react";
import { Shield, House, DollarSign } from "lucide-react";

const trustCards = [
  {
    icon: <Shield className="w-8 h-8 text-foreground" strokeWidth={1.5} />,
    title: "Operational Integrity",
    text: "Response times, issue resolution, guest communication, and staff reliability.",
  },
  {
    icon: <House className="w-8 h-8 text-foreground" strokeWidth={1.5} />,
    title: "Property Standards",
    text: "Maintenance, photography accuracy, amenity verification, and design quality.",
  },
  {
    icon: <DollarSign className="w-8 h-8 text-foreground" strokeWidth={1.5} />,
    title: "Financial Transparency",
    text: "Clear pricing, commission structures, cancellation terms, and payment timelines.",
  },
];

export const TrustLayer: React.FC = () => {
  return (
    <section className="py-24 px-6 bg-accent/20">
      <div className="container mx-auto max-w-5xl text-center">
        <h2 className="text-4xl md:text-5xl font-semibold text-foreground mb-4">
          Expertly vetted. Operationally ranked.
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-16 leading-relaxed">
          Every property manager is evaluated through the Villa Net Rank™
          scoring framework — creating transparency and confidence for advisors
          and guests.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {trustCards.map((card) => (
            <div
              key={card.title}
              className="flex flex-col items-center text-center gap-3 p-8 rounded-xl border border-border bg-background"
            >
              {card.icon}
              <h3 className="text-base font-semibold text-foreground">
                {card.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {card.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};