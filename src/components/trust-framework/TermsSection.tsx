import React from "react";
import { FileText } from "lucide-react";

const TermsSection: React.FC = () => {
  const termsPoints = [
    "We facilitate communication and booking between guests and property partners",
    "Policies, inclusions, and conditions of each villa are determined by the property manager",
    "Villa Net is not the owner or operator of individual properties",
    "Dispute resolution processes available for all parties",
    "Legal jurisdiction governed by applicable law",
  ];

  return (
    <section id="terms" className="py-20 md:py-28 px-6 bg-[#FAFAFA] scroll-mt-36">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <div className="inline-flex p-3 bg-background rounded-full border border-border mb-6">
            <FileText className="w-6 h-6 text-foreground" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Terms of Service
          </h2>
        </div>

        <ul className="space-y-4 mb-10">
          {termsPoints.map((point, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">{point}</span>
            </li>
          ))}
        </ul>

        <div className="text-center">
          <a 
            href="/terms-of-service" 
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border bg-background hover:bg-accent hover:text-accent-foreground h-10 text-base py-[14px] px-9 rounded-md shadow-none border-border"
          >
            View Full Legal Version →
          </a>
        </div>
      </div>
    </section>
  );
};

export default TermsSection;