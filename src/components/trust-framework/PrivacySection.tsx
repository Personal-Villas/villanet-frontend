import React from "react";
import { Lock } from "lucide-react";

const PrivacySection: React.FC = () => {
  const privacyPoints = [
    "We do not sell personal data",
    "We only store information needed for service delivery",
    "All communication can be anonymized if client requests",
    "Compliance with relevant EU / US / CA data frameworks",
    "Data deletion requests honored within 30 days",
  ];

  return (
    <section id="privacy" className="py-20 md:py-28 px-6 scroll-mt-36">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <div className="inline-flex p-3 bg-accent/10 rounded-full mb-6">
            <Lock className="w-6 h-6 text-foreground" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Privacy Policy
          </h2>
        </div>

        <ul className="space-y-4 mb-10">
          {privacyPoints.map((point, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">{point}</span>
            </li>
          ))}
        </ul>

        <div className="text-center">
          <a 
            href="/privacy-policy" 
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border bg-background hover:bg-accent hover:text-accent-foreground h-10 text-base py-[14px] px-9 rounded-md shadow-none border-border"
          >
            Read Full Privacy Policy →
          </a>
        </div>
      </div>
    </section>
  );
};

export default PrivacySection;