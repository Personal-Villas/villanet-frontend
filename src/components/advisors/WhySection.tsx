import React from "react";
import { ShieldCheck, DollarSign, Headphones } from "lucide-react";

export const WhySection: React.FC = () => {
  const features = [
    {
      icon: ShieldCheck,
      title: "Verified Villas & Property Managers",
      description: "Every villa is managed by verified professionals with proven track records, transparent operations, and comprehensive insurance.",
      delay: "100ms"
    },
    {
      icon: DollarSign,
      title: "Transparent Commissions",
      description: "Clear, consistent commission structures with no hidden fees. Know exactly what you earn on every booking.",
      delay: "200ms"
    },
    {
      icon: Headphones,
      title: "Concierge Coordination for Every Stay",
      description: "Direct access to property managers and concierge teams ensures seamless experiences from booking to checkout.",
      delay: "300ms"
    }
  ];

  return (
    <>
      <div className="shrink-0 bg-border h-[1px] w-full mx-auto max-w-6xl" />
      
      <section className="py-20 md:py-28 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center gap-3 mb-6">
              <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
              <p className="text-sm font-medium tracking-[0.15em] uppercase text-muted-foreground">
                WHY VILLA NET
              </p>
              <div className="h-[1px] w-12 bg-gradient-to-r from-[#D4AF37] via-transparent to-transparent" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Built for Advisors
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to deliver exceptional villa experiences
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  delay: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description, delay }) => {
  return (
    <div 
      className="border border-border rounded-2xl bg-background p-8 shadow-sm hover:shadow-md transition-all duration-300 animate-fade-in-up" 
      style={{ animationDelay: delay, animationFillMode: 'forwards' }}
    >
      <div className="p-3 rounded-full bg-accent/5 mb-6 w-fit">
        <Icon className="w-6 h-6 text-accent" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-3">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground leading-[1.6]">
        {description}
      </p>
    </div>
  );
};