import React from "react";

const PrinciplesSection: React.FC = () => {
  const principles = [
    { title: "Quality over Quantity", description: "Curated supply, not mass-market scraping" },
    { title: "Service Over Transaction", description: "Relationships over rentals" },
    { title: "Transparency & Accountability", description: "Clarity in pricing, rules, expectations" },
    { title: "Ethical Curation", description: "We turn away properties that don't meet standards" },
    { title: "Human Expertise + AI Intelligence", description: "Decisions informed by both" },
    { title: "Guest-First & Advisor-First", description: "Because service is the differentiator" },
  ];

  return (
    <section id="principles" className="py-20 md:py-28 px-6 scroll-mt-36">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <p className="text-sm font-medium tracking-[0.125em] uppercase text-muted-foreground mb-4">
            OUR FOUNDATION
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Villa Net Principles
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-[1.7]">
            Our principles are the foundation of how we curate partners, rate managers, and guide the world's best villa experiences.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {principles.map((principle, index) => (
            <div 
              key={index} 
              className="p-6 border border-border rounded-lg bg-background hover:bg-accent/5 transition-colors"
            >
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {principle.title}
              </h3>
              <p className="text-muted-foreground">{principle.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PrinciplesSection;