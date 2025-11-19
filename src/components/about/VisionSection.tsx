import React from "react";

export const VisionSection: React.FC = () => {
  return (
    <section className="py-24 px-6">
      <div className="container mx-auto max-w-3xl text-center">
        <div className="shrink-0 bg-border h-[1px] w-full mb-12" />
        
        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-[1.2]">
          This is just the beginning.
        </h2>
        
        <div className="space-y-4 text-lg leading-[1.6] text-muted-foreground">
          <p>
            We're starting with verified partners across the Caribbean and Mexico — but the Villa Net framework is designed to scale globally.
          </p>
          <p className="font-medium text-foreground">
            Our vision: a world where every villa is rated not by hype, but by trust.
          </p>
        </div>
        
        <div className="shrink-0 bg-border h-[1px] w-full mt-12" />
      </div>
    </section>
  );
};