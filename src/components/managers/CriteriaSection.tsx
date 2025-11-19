import React from "react";
import { CircleCheck } from "lucide-react";

export const CriteriaSection: React.FC = () => {
  const criteria = [
    "5+ years of professional property management experience",
    "Trust accounting or client funds protection",
    "Comprehensive insurance coverage",
    "Transparent pricing and commission structures",
    "Responsive communication standards",
    "Portfolio of well-maintained properties",
    "Positive guest feedback history",
    "Commitment to ongoing operational excellence"
  ];

  return (
    <section className="py-16 md:py-20 px-6 bg-background">
      <div className="container mx-auto max-w-3xl">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-center">
          What We Look For in Partners
        </h2>
        <p className="text-base md:text-lg text-muted-foreground mb-12 text-center">
          Our verification criteria ensure every manager meets Villa Net's standards
        </p>
        
        <div className="space-y-4">
          {criteria.map((item, index) => (
            <div key={index} className="flex items-start gap-3">
              <CircleCheck className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
              <p className="text-base text-muted-foreground">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};