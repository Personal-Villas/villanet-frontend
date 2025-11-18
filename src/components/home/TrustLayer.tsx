import React from "react";
import {
  ShieldCheck,
  Award,
  Users,
  House,
  Building,
  Clock,
  Circle,
} from "lucide-react";

const trustCards = [
  {
    icon: <ShieldCheck className="w-[30px] h-[30px]" />,
    title: "Verified Property Manager",
    text: "Legal entity & identity verified.",
  },
  {
    icon: <Clock className="w-[30px] h-[30px]" />,
    title: "High Reliability PM",
    text: "Consistent response & fulfillment performance.",
  },
  {
    icon: <Users className="w-[30px] h-[30px]" />,
    title: "Staffed Villas Available",
    text: "Chef/Butler/Housekeeping included or optional.",
  },
  {
    icon: <House className="w-[30px] h-[30px]" />,
    title: "Family-Friendly Recommended",
    text: "Layouts, fencing, & services suitable for families.",
  },
  {
    icon: <Award className="w-[30px] h-[30px]" />,
    title: "Architectural Grade",
    text: "Design and finish meet luxury benchmarks.",
  },
  {
    icon: <Building className="w-[30px] h-[30px]" />,
    title: "5+ Years Operational Continuity",
    text: "Stable year-over-year operations.",
  },
];

export const TrustLayer: React.FC = () => {
  return (
    <section id="trust" className="py-24 px-6 bg-gray-100">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl mb-6">
            The Villa Net Trust Layer.
          </h2>
          <p className="text-sm text-muted-foreground italic mb-4">
            Built from over a decade operating in the luxury villa market.
          </p>

          <div className="mb-8 max-w-3xl mx-auto">
            <p className="text-sm font-medium text-foreground text-center mb-3">
              Villa Net Rank™ Scorecard Factors:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 text-muted-foreground">
              <span className="text-sm">Operations</span>
              <Circle className="w-3 h-3 text-muted-foreground/40" />
              <span className="text-sm">Staffing</span>
              <Circle className="w-3 h-3 text-muted-foreground/40" />
              <span className="text-sm">Accounting</span>
              <Circle className="w-3 h-3 text-muted-foreground/40" />
              <span className="text-sm">Reliability</span>
              <Circle className="w-3 h-3 text-muted-foreground/40" />
              <span className="text-sm">Guest Outcomes</span>
            </div>
          </div>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-[1.45] mt-8 mb-10">
            Every property manager is evaluated through the Villa Net Rank™
            scoring framework, creating transparency and confidence for
            advisors and guests.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {trustCards.map((card) => (
            <div
              key={card.title}
              className="flex flex-col items-center text-center gap-3 p-8 border border-[#E5E5E5] rounded bg-background"
            >
              {card.icon}
              <span className="text-base font-medium">{card.title}</span>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {card.text}
              </p>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground italic">
          Badges are earned — not purchased.
        </p>

        <div className="text-center mt-6 max-w-3xl mx-auto">
          <p className="text-sm text-foreground/90 mb-1">
            &quot;Villa Net actually recognizes operational excellence. It&apos;s
            the first time PMs are evaluated on what really matters.&quot;
          </p>
          <p className="text-xs text-muted-foreground">
            — Managing Director, Punta Mita Portfolio
          </p>
        </div>
      </div>
    </section>
  );
};