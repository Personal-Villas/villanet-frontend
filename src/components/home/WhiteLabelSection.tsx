import React from "react";
import { ShieldCheck, FileText, Lock } from "lucide-react";

const benefits = [
  {
    icon: <ShieldCheck className="w-5 h-5 text-foreground" strokeWidth={1.5} />,
    title: 'No "Book Now" Buttons',
    description:
      "Clients can never bypass you. Every booking flows through the advisor.",
  },
  {
    icon: <FileText className="w-5 h-5 text-foreground" strokeWidth={1.5} />,
    title: "White-Label Proposals",
    description:
      "Send polished, branded proposals under your own identity — not ours.",
  },
  {
    icon: <Lock className="w-5 h-5 text-foreground" strokeWidth={1.5} />,
    title: "Lead Protection",
    description:
      "Your client relationships stay yours. No data sharing, no poaching.",
  },
];

export const WhiteLabelSection: React.FC = () => {
  return (
    <section className="py-24 px-6 bg-background">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div>
            <h2 className="text-4xl md:text-5xl font-semibold text-foreground mb-10">
              Your brand. Your client. Always.
            </h2>
            <div className="space-y-8">
              {benefits.map((benefit) => (
                <div key={benefit.title} className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent/30 flex items-center justify-center">
                    {benefit.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground mb-1">
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: phone mockups */}
          <div className="flex justify-center gap-6">
            <PhoneMockup
              imageSrc="src/assets/images/advisor-view.png"
              imageAlt="Advisor View"
              label="Advisor View"
            />
            <PhoneMockup
              imageSrc="src/assets/images/client-view.png"
              imageAlt="Client View"
              label="Client View"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

interface PhoneMockupProps {
  imageSrc: string;
  imageAlt: string;
  label: string;
}

const PhoneMockup: React.FC<PhoneMockupProps> = ({
  imageSrc,
  imageAlt,
  label,
}) => (
  <div className="flex flex-col items-center">
    <div className="w-[180px] h-[360px] rounded-[28px] border-2 border-border bg-card shadow-lg overflow-hidden">
      <div className="flex justify-center pt-2 pb-1">
        <div className="w-16 h-4 rounded-full bg-border" />
      </div>
      <div className="flex-1 m-2 rounded-xl bg-muted overflow-hidden h-[280px]">
        <img
          src={imageSrc}
          alt={imageAlt}
          className="w-full h-full object-cover object-top"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      </div>
    </div>
    <p className="text-sm font-medium text-foreground mt-4">{label}</p>
  </div>
);