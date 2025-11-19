import React from "react";
import { ShieldCheck, TrendingUp, Sparkles, Handshake } from "lucide-react";

export const DifferenceSection: React.FC = () => {
  const features = [
    {
      icon: ShieldCheck,
      title: "Verified Property Managers",
      description: "Every manager on Villa Net is independently verified for trust accounting, insurance, and operational excellence. Our partners meet strict hospitality and transparency benchmarks before joining the network."
    },
    {
      icon: TrendingUp,
      title: "Villa Net Rank™",
      description: "Each property and manager is scored across dozens of data points — from service reliability to guest satisfaction. The algorithm is proprietary, but the result is universal: clarity, consistency, and confidence at a glance."
    },
    {
      icon: Sparkles,
      title: "AI Meets Human Expertise",
      description: "Our technology analyzes thousands of trust signals — financial integrity, response time, guest feedback — while our team hand-verifies every listing. Because true luxury is always human."
    },
    {
      icon: Handshake,
      title: "Built for Travel Advisors",
      description: "Verified supply. Faster responses. Transparent commissions. Villa Net empowers professionals to connect with the world's most trusted property managers — all in one unified system."
    }
  ];

  return (
    <section className="relative overflow-hidden py-16 md:py-24 px-4 md:px-6">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '10s' }} />
      </div>
      
      <div className="container mx-auto max-w-5xl relative z-10">
        <div className="text-center mb-16">
          <p className="text-sm font-medium tracking-[0.15em] uppercase text-muted-foreground mb-4">
            THE VILLA NET DIFFERENCE
          </p>
          <div className="w-20 h-[1px] bg-gradient-to-r from-transparent via-accent to-transparent mx-auto mb-6" />
          <p className="text-sm text-muted-foreground">
            The trust framework behind every verified villa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description }) => {
  return (
    <div className="group p-8 md:p-10 border border-border rounded-2xl bg-background shadow-sm hover:shadow-lg hover:scale-[1.02] hover:border-accent/30 active:scale-[0.98] md:active:scale-[1.02] transition-all duration-300">
      <div className="flex justify-center mb-8">
        <div className="p-3 rounded-full bg-accent/5 group-hover:bg-accent/10 transition-colors duration-300">
          <Icon className="w-[28px] h-[28px] text-foreground group-hover:text-accent transition-colors duration-300" />
        </div>
      </div>
      <h3 className="text-lg font-semibold text-foreground leading-tight mb-4 text-center">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground leading-[1.7] text-center max-w-md mx-auto">
        {description}
      </p>
    </div>
  );
};