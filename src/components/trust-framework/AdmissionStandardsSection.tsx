import React from "react";
import { Check, Users, Building } from "lucide-react";

const AdmissionStandardsSection: React.FC = () => {
  const managerRequirements = [
    "Minimum 3+ years verified history",
    "Responsible accounting & guest service posture",
    "Accurate listing representation",
    "Service turnaround commitment",
    "Acceptable communication standards",
  ];

  const villaRequirements = [
    "Proper maintenance & cleanliness",
    "Essential functionality & safety",
    "Consistency between photos & reality",
    "Required amenities functioning",
  ];

  return (
    <section id="admission-standards" className="py-20 md:py-28 px-6 scroll-mt-36">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <p className="text-sm font-medium tracking-[0.125em] uppercase text-muted-foreground mb-4">
            ADMISSION CRITERIA
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Who We Accept — and Who We Don't
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-[1.7]">
            We maintain strict onboarding criteria for both property managers and individual villas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Property Manager Requirements */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Users className="w-6 h-6 text-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                Property Manager Requirements
              </h3>
            </div>
            <ul className="space-y-4">
              {managerRequirements.map((req, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-foreground mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{req}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Villa Requirements */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Building className="w-6 h-6 text-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                Villa Requirements
              </h3>
            </div>
            <ul className="space-y-4">
              {villaRequirements.map((req, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-foreground mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{req}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-12 italic">
          "We cull supply that does not meet or maintain standards."
        </p>
      </div>
    </section>
  );
};

export default AdmissionStandardsSection;