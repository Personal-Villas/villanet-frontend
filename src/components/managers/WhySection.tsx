import React from "react";
import { Users, TrendingUp, Award, Globe } from "lucide-react";

export const WhySection: React.FC = () => {
  const features = [
    {
      icon: Users,
      title: "Access to Verified Travel Advisors",
      description: "Connect directly with professional luxury travel advisors who prioritize vetted partnerships and reliable service.",
      delay: "100ms"
    },
    {
      icon: TrendingUp,
      title: "Visibility in High-Value Markets",
      description: "Reach discerning clients through a curated platform built for exclusivity and trust.",
      delay: "200ms"
    },
    {
      icon: Award,
      title: "Verified Data Layer & Partner Scorecard",
      description: "Showcase your operational excellence through transparent metrics and Villa Net Rank™ scoring.",
      delay: "300ms"
    },
    {
      icon: Globe,
      title: "Co-Marketing & Brand Credibility",
      description: "Display the Villa Net Verified badge across your channels — a mark of trust recognized globally.",
      delay: "400ms"
    }
  ];

  return (
    <>
      <div className="shrink-0 bg-border h-[1px] w-full mx-auto max-w-6xl" />
      
      <section className="py-20 md:py-28 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center gap-3 mb-6">
              <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
              <p className="text-sm font-medium tracking-[0.15em] uppercase text-muted-foreground">
                WHY JOIN VILLA NET
              </p>
              <div className="h-[1px] w-12 bg-gradient-to-r from-[#D4AF37] via-transparent to-transparent" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Elevate Your Business
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Join a curated network built on trust, transparency, and exceptional service standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
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