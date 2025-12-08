import React from "react";
import { Check } from "lucide-react";

const RankFrameworkSection: React.FC = () => {
  const metrics = [
    "Years in professional villa management",
    "Verified service history",
    "Staff continuity & employment stability",
    "Local onsite concierge / property oversight",
    "Responsiveness & communication",
    "Listing accuracy & transparency",
    "Guest resolution history",
    "Pricing reliability (no duplicate pricing schemes)",
    "Dynamic pricing capability",
    "On-site staff standards (housekeeper, cook, butler etc.)",
    "Maintenance & condition quality control",
  ];

  return (
    <section id="rank-framework" className="py-20 md:py-28 px-6 bg-[#FAFAFA] scroll-mt-36">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <p className="text-sm font-medium tracking-[0.125em] uppercase text-muted-foreground mb-4">
            TRUST INDEX
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Villa Net Rank™ Framework
          </h2>
          <p className="text-xl md:text-2xl text-foreground mb-4">
            The Standardized Trust Index for Villa Quality & Management Integrity
          </p>
          <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-[1.7]">
            Villa Net Rank™ is a proprietary scoring system built from a decade of real-world operating experience, service performance, and partner-verified metrics.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {metrics.map((metric, index) => (
            <div key={index} className="flex items-start gap-3 p-4 bg-background rounded-lg border border-border">
              <Check className="w-5 h-5 text-foreground mt-0.5 flex-shrink-0" />
              <span className="text-foreground">{metric}</span>
            </div>
          ))}
        </div>

        <div className="bg-background border border-border rounded-xl p-8 text-center max-w-sm mx-auto">
          <p className="text-sm text-muted-foreground mb-2 uppercase tracking-[0.1em]">
            Example Score
          </p>
          <p className="text-5xl font-bold text-foreground mb-2">9.7 / 10</p>
          <p className="text-base font-medium text-foreground">Premier Trusted Manager</p>
        </div>
      </div>
    </section>
  );
};

export default RankFrameworkSection;