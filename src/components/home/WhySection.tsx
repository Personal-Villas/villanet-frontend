import React from "react";
import { ShieldCheck, Award, DollarSign, MessageSquare } from "lucide-react";

/*const advisorTrustBullets = [
  "Verified property manager identities",
  "Operational reliability scored (Villa Net Rank™)",
  "Transparent commission norms (typically 10–20%)",
  "Direct line to decision-makers—no middle layers",
];
*/
export const WhySection: React.FC = () => {
  return (
    <section id="why" className="py-24 px-6">
      <div className="container mx-auto max-w-3xl text-center">
        <h1 className="text-sm font-medium tracking-[0.1em] uppercase mb-8 text-muted-foreground">
          WHY VILLA NET EXISTS
        </h1>
        <h2 className="text-5xl md:text-[56px] font-medium mb-8 text-foreground">
          A clear, trusted way to source exceptional villas.
        </h2>

        <div className="space-y-8">
          <p className="text-lg leading-[1.45] text-muted-foreground max-w-[620px] mx-auto">
            The villa market is fragmented. Availability shifts daily. Quality
            and service can be inconsistent. Advisors and property managers
            rely on trust—but trust hasn&apos;t been standardized.
          </p>

          {/* bullets 2x2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[620px] mx-auto">
            <div className="flex items-start gap-3 text-left">
              <ShieldCheck className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
              <span className="text-foreground">
                Verified property manager identities
              </span>
            </div>
            <div className="flex items-start gap-3 text-left">
              <Award className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
              <span className="text-foreground">
                Operational reliability scored (Villa Net Rank™)
              </span>
            </div>
            <div className="flex items-start gap-3 text-left">
              <DollarSign className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
              <span className="text-foreground">
                Transparent commission norms (typically 10–20%)
              </span>
            </div>
            <div className="flex items-start gap-3 text-left">
              <MessageSquare className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
              <span className="text-foreground">
                Direct line to decision-makers—no middle layers
              </span>
            </div>
          </div>

          <div className="shrink-0 bg-border h-[1px] w-full my-8 max-w-[620px] mx-auto" />

          <p className="text-sm uppercase tracking-[0.1em] text-foreground">
            No markups. No inflated rates. Just a clean, direct, trusted
            network.
          </p>

          <a
            href="#how"
            className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium h-10 px-4 py-2 mt-4 hover:bg-accent hover:text-accent-foreground"
          >
            See How Villa Net Works ↓
          </a>
        </div>
      </div>
    </section>
  );
};