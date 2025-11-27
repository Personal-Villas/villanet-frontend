import React from "react";
import {
  CircleCheck,
  MessageSquare,
  Percent,
  DollarSign,
  Lock,
  Settings,
  Users,
  Heart,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export const AdvisorsPmsSplit: React.FC = () => {
  return (
    <section className="py-30 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-[#E5E5E5]">
          {/* Advisors */}
          <AdvisorsSection />
          
          {/* PMs */}
          <PropertyManagersSection />
        </div>
      </div>
    </section>
  );
};

const AdvisorsSection: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div id="advisors" className="py-12 md:pr-12">
      <div className="max-w-md">
        <h3 className="text-3xl font-medium mb-3">
          Build confidence. Save time. Deliver better stays.
        </h3>
        <p className="text-sm text-[#6B7280] mb-8">
          For travel advisors, villa specialists, and concierge teams.
        </p>

        <ul className="space-y-5 mb-8">
          <li className="flex items-start gap-3">
            <CircleCheck className="w-6 h-6 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-base text-foreground">
                Curated villa portfolios only
              </p>
              <p className="text-sm text-[#6B7280] mt-1">
                (No mass listings. Every PM is vetted.)
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <MessageSquare className="w-6 h-6 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-base text-foreground">
                Direct communication with decision-makers
              </p>
              <p className="text-sm text-[#6B7280] mt-1">
                (Fewer delays, tighter service.)
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <Percent className="w-6 h-6 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-base text-foreground">
                Clear commission structures (typically 10–20%)
              </p>
              <p className="text-sm text-[#6B7280] mt-1">
                (Aligned with industry norms.)
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <DollarSign className="w-6 h-6 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-base text-foreground">
                No subscription fees or platform markup
              </p>
              <p className="text-sm text-[#6B7280] mt-1">
                (Your client pays the same rate.)
              </p>
            </div>
          </li>
        </ul>

        <button onClick={() => navigate('/advisor-signup')} className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium h-10 px-4 py-2 bg-black text-white hover:bg-black/90 group">
          Join the Advisor Network
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

const PropertyManagersSection: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div id="pms" className="py-12 md:pl-12">
      <div className="max-w-md">
        <h3 className="text-3xl font-medium mb-3">
          Reach the right guests without changing your workflow.
        </h3>
        <p className="text-sm text-[#6B7280] mb-8">
          Built to support professional Property Managers.
        </p>

        <ul className="space-y-5 mb-6">
          <li className="flex items-start gap-3">
            <Lock className="w-6 h-6 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-base text-foreground">
                Zero exclusivity requirements
              </p>
              <p className="text-sm text-[#6B7280] mt-1">
                (You remain in full control of your inventory.)
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <Settings className="w-6 h-6 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-base text-foreground">
                Your rates, policies, and systems stay intact
              </p>
              <p className="text-sm text-[#6B7280] mt-1">
                (No API, no calendar hosting.)
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <Users className="w-6 h-6 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-base text-foreground">
                Receive qualified advisor inquiries
              </p>
              <p className="text-sm text-[#6B7280] mt-1">
                (Warm leads — not rate shoppers.)
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <Heart className="w-6 h-6 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-base text-foreground">
                Designed to support long-term relationships
              </p>
              <p className="text-sm text-[#6B7280] mt-1">
                (We emphasize repeat guests + advisor loyalty.)
              </p>
            </div>
          </li>
        </ul>

        <p className="text-sm text-[#6B7280] mb-4">
          Currently free during Beta.
        </p>

        <button onClick={() => navigate('/property-manager-signup')} className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium h-10 px-4 py-2 border bg-background border-black text-black hover:bg-black/5 group">
          Apply as a Verified PM
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};