import React from "react";
import { Award, CircleCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../auth/AuthContext";

export const Hero: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthContext();

  return (
    <section id="top" className="relative w-full">
      {/* Fondo "hero" */}
      <div className="relative h-[500px] w-full overflow-hidden bg-gradient-to-b from-[#FFFFFF] to-[#F4F4F4]" />

      {/* Contenido hero */}
      <div className="container mx-auto px-6 -mt-96 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Texto izquierda */}
          <div className="max-w-[680px]">
            <h1 className="text-gray-900 text-6xl md:text-7xl font-semibold leading-[1.12] mb-9">
              The Trusted Network for Exceptional Villas.
            </h1>
            <p className="text-gray-700 text-lg md:text-xl max-w-2xl mb-12 leading-relaxed">
              Where verified property managers meet professional travel
              advisors — supported by standardized data and accountable
              service practices.
            </p>
            <p className="text-[#6B7280] text-[14px] tracking-[0.01em] mb-16">
              Every Property Manager is evaluated through the Villa Net Rank™
              scoring framework.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/advisor-signup')}
                className="inline-flex items-center justify-center gap-2 h-11 rounded-md bg-black text-white hover:bg-gray-800 text-base px-8 py-6 font-medium"
              >
                Join the Advisor Network
              </button>
              <button
                onClick={() => navigate('/property-manager-signup')}
                className="inline-flex items-center justify-center gap-2 h-11 rounded-md bg-white border border-gray-300 text-gray-900 hover:bg-gray-50 text-base px-8 py-6 font-medium"
              >
                Apply as a Verified PM
              </button>
              {isAuthenticated && (
                <button
                  onClick={() => navigate('/properties?quoteFlow=true')}
                  className="inline-flex items-center justify-center gap-2 h-11 rounded-md bg-black text-white hover:bg-gray-800 text-base px-8 py-6 font-medium"
                >
                  Create a New Quote
                </button>
              )}
            </div>
          </div>

          {/* "Phone" derecha */}
          <PhoneMockup />
        </div>
        {/* espacio extra igual al original */}
        <div className="h-[228px]" />
      </div>
    </section>
  );
};

const PhoneMockup: React.FC = () => {
  return (
    <div className="flex justify-center lg:justify-start">
      <div className="relative w-[280px] h-[560px] lg:translate-y-[62px]">
        <div className="absolute inset-0 bg-black rounded-[40px] shadow-[0_0_40px_rgba(0,0,0,0.08)]">
          <div className="absolute inset-[12px] bg-white rounded-[32px] overflow-hidden">
            <div className="p-4 space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Verified Property Managers
              </h3>

              {/* Card 1 */}
              <div className="bg-white border border-gray-200 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-900">
                      Villa Luxe Management
                    </span>
                    <span className="bg-[#0C6F47] text-white text-[12px] px-2.5 py-1 rounded-lg font-medium">
                      Elite
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <CircleCheck className="w-3 h-3 text-[#16A34A]/65" />
                    <Award className="w-3 h-3 text-amber-500" />
                  </div>
                </div>
                <p className="text-[13px] text-[#6B7280] leading-tight">
                  High Reliability + Staffed Villas + Architectural Grade
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-[0.03em] text-[#6B7280] font-normal">
                    VILLA NET RANK™
                  </span>
                  <span className="text-[20px] font-semibold text-[#0C6F47]">
                    9.4
                  </span>
                </div>
                <button className="w-full text-[10px] font-medium text-gray-900 bg-gray-100 hover:bg-gray-200 py-1.5 rounded-md transition-colors">
                  Contact PM
                </button>
                <div className="text-[12px] text-[#9CA3AF] space-y-0.5">
                  <p>Avg Response: &lt; 2 hours</p>
                  <p>Commission: 10–20% (Standard)</p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white border border-gray-200 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-900">
                      Mediterranean Estates
                    </span>
                    <span className="bg-[#ECF5F1] text-[#0C6F47] text-[12px] px-2.5 py-1 rounded-lg font-medium border border-[#5D8F73]">
                      Pro
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <CircleCheck className="w-3 h-3 text-[#16A34A]/65" />
                    <Award className="w-3 h-3 text-amber-500" />
                  </div>
                </div>
                <p className="text-[13px] text-[#6B7280] leading-tight">
                  Reliable Operations + Strong Service Standards
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-[0.03em] text-[#6B7280] font-normal">
                    VILLA NET RANK™
                  </span>
                  <span className="text-[20px] font-semibold text-[#0C6F47]">
                    9.2
                  </span>
                </div>
                <button className="w-full text-[10px] font-medium text-gray-900 bg-gray-100 hover:bg-gray-200 py-1.5 rounded-md transition-colors">
                  Contact PM
                </button>
                <div className="text-[12px] text-[#9CA3AF] space-y-0.5">
                  <p>Avg Response: &lt; 2 hours</p>
                  <p>Commission: 10–20% (Standard)</p>
                </div>
              </div>

              {/* Card 3 (muteada) */}
              <div className="bg-white border border-gray-200 rounded-lg p-3 space-y-2 opacity-60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-900">
                      Coastal Properties Co.
                    </span>
                    <span className="bg-[#F8F8F8] text-[#6B7280] text-[12px] px-2.5 py-1 rounded-lg font-medium border border-[#E5E5E5]">
                      Verified
                    </span>
                  </div>
                  <CircleCheck className="w-3 h-3 text-[#16A34A]/65" />
                </div>
                <p className="text-[13px] text-[#6B7280] leading-tight">
                  Fully vetted + Meets baseline trust criteria
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-[0.03em] text-[#6B7280] font-normal">
                    VILLA NET RANK™
                  </span>
                  <span className="text-[20px] font-semibold text-[#0C6F47]">
                    8.9
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};