import React from "react";
import { ShieldCheck, Clock, ChartColumn, Globe, Star } from "lucide-react";

export const BenefitsSection: React.FC = () => {
  const benefits = [
    {
      icon: ShieldCheck,
      title: "Trust Accounting Verified"
    },
    {
      icon: Clock,
      title: "10+ Years of Experience (avg)"
    },
    {
      icon: ChartColumn,
      title: "Transparent Portfolio Data"
    },
    {
      icon: Globe,
      title: "Global Network Visibility"
    },
    {
      icon: Star,
      title: "Verified Reviews & Metrics"
    }
  ];

  return (
    <section className="py-20 md:py-24 px-6 bg-[#FAFAFA] dark:bg-accent/10">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-center">
          Villa Net Verified = Trust, Growth, and Transparency
        </h2>
        <p className="text-base md:text-lg text-muted-foreground mb-16 text-center max-w-2xl mx-auto">
          Every partner meets rigorous standards that set the benchmark for luxury villa management.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8">
          {benefits.map((benefit, index) => (
            <BenefitCard key={index} {...benefit} />
          ))}
        </div>
      </div>
    </section>
  );
};

interface BenefitCardProps {
  icon: React.ElementType;
  title: string;
}

const BenefitCard: React.FC<BenefitCardProps> = ({ icon: Icon, title }) => {
  return (
    <div className="flex flex-col items-center text-center p-6 rounded-xl bg-background border border-border/50 hover:border-accent/30 transition-colors duration-300">
      <div className="p-3 rounded-full bg-accent/5 mb-4">
        <Icon className="w-6 h-6 text-accent" />
      </div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
    </div>
  );
};