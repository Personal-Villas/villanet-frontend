import React from "react";
import { CircleCheck } from "lucide-react";

export const BenefitsSection: React.FC = () => {
  const benefits = [
    "Access exclusive partner rates & perks",
    "Direct access to verified villa managers",
    "Fast response times & booking confirmations"
  ];

  return (
    <>
      <div className="shrink-0 bg-border h-[1px] w-full mx-auto max-w-6xl" />
      
      <section className="py-20 md:py-28 px-6 bg-[#FAFAFA] dark:bg-accent/10">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Your Reputation, Protected
            </h2>
            <p className="text-base md:text-lg leading-[1.7] text-muted-foreground max-w-3xl mx-auto mb-12">
              Every villa on Villa Net is professionally managed, insured, and verified through our trust layer — so you can focus on creating exceptional travel experiences for your clients.
            </p>
          </div>

          <div className="max-w-2xl mx-auto space-y-6">
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className="flex items-start gap-4 animate-fade-in-up" 
                style={{ animationDelay: `${(index + 1) * 100}ms`, animationFillMode: 'forwards' }}
              >
                <div className="p-2 rounded-full bg-accent/5 flex-shrink-0">
                  <CircleCheck className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-base text-foreground font-medium">{benefit}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};