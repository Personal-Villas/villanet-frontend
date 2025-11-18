import React from "react";
import { Search, MessageSquare, CircleCheckBig, FileText, Award, Mail } from "lucide-react";

const advisorSteps = [
  {
    icon: <Search className="w-7 h-7 text-foreground flex-shrink-0 mt-0.5" />,
    title: "Browse verified villas",
    text: "Access curated properties with transparent quality metrics.",
  },
  {
    icon: (
      <MessageSquare className="w-7 h-7 text-foreground flex-shrink-0 mt-0.5" />
    ),
    title: "Request dates + guest needs",
    text: "Inquiries go directly to the property manager — no intermediaries.",
  },
  {
    icon: (
      <CircleCheckBig className="w-7 h-7 text-foreground flex-shrink-0 mt-0.5" />
    ),
    title: "Confirm and finalize directly with the PM",
    text: "Transparent commission structure, aligned workflow.",
  },
];

const pmSteps = [
  {
    icon: <FileText className="w-7 h-7 text-foreground flex-shrink-0 mt-0.5" />,
    title: "Submit your PM profile",
    text: "Simple operational details. No tech setup required.",
  },
  {
    icon: <Award className="w-7 h-7 text-foreground flex-shrink-0 mt-0.5" />,
    title: "Receive Villa Net Rank & Badges",
    text: "Evaluated using our transparent scoring framework.",
  },
  {
    icon: <Mail className="w-7 h-7 text-foreground flex-shrink-0 mt-0.5" />,
    title: "Start receiving advisor referrals",
    text: "Connect with qualified advisors seeking your portfolio.",
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <section
      id="how"
      className="mt-20 pt-20 pb-24 px-6 bg-gray-100 border-t border-[#E5E5E5]"
    >
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-4xl md:text-5xl text-center mb-6">
          How Villa Net Works.
        </h2>
        <p className="text-center text-base text-[#6B7280] max-w-3xl mx-auto mb-16">
          Villa Net provides the trusted operational framework for advisors
          and property managers to work together directly.
        </p>

        <div className="grid md:grid-cols-2 gap-16">
          {/* Advisors steps */}
          <StepsSection 
            title="For Advisors"
            subtitle="Typical time to complete: under 2 minutes."
            steps={advisorSteps}
          />

          {/* PM steps */}
          <StepsSection 
            title="For Property Managers"
            subtitle="Currently free during Beta."
            steps={pmSteps}
          />
        </div>
      </div>
    </section>
  );
};

interface StepsSectionProps {
  title: string;
  subtitle: string;
  steps: Array<{
    icon: React.ReactNode;
    title: string;
    text: string;
  }>;
}

const StepsSection: React.FC<StepsSectionProps> = ({ title, subtitle, steps }) => {
  return (
    <div>
      <h3 className="text-2xl font-medium mb-3">{title}</h3>
      <p className="text-sm text-[#6B7280] mb-8">{subtitle}</p>

      <div className="space-y-6">
        {steps.map((step, index) => (
          <div
            key={step.title}
            className="border border-[#E5E5E5] rounded-lg p-6"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-6 h-6 rounded-full border border-[#111111] flex items-center justify-center">
                <span className="text-xs font-medium text-[#111111]">
                  {index + 1}
                </span>
              </div>
              {step.icon}
              <div>
                <p className="text-base font-medium mb-1">
                  {step.title}
                </p>
                <p className="text-sm text-[#6B7280]">{step.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};