import React from "react";
import { X, CircleCheckBig, Star, ChevronRight } from "lucide-react";

interface VillaNetRankModalProps {
  isOpen: boolean;
  onClose: () => void;
  rank?: number; // ⬅️ AGREGADO: prop opcional para mostrar el rank específico
}

export const VillaNetRankModal: React.FC<VillaNetRankModalProps> = ({
  isOpen,
  onClose,
  rank, // ⬅️ AGREGADO
}) => {
  if (!isOpen) return null;

  const trustPillars = [
    "Verified Property Manager (2025 confirmed)",
    "Transparent Trust Accounting",
    "10+ Years of Operational Experience",
    "Consistent Guest Satisfaction",
    "Verified Staff & On-Site Services",
    "AI Integrity & Data Authenticity",
    "Destination Expertise & Compliance"
  ];

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-black/80 animate-in fade-in-0"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        role="dialog"
        className="fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background shadow-lg duration-200 animate-in fade-in-0 zoom-in-95 slide-in-from-left-1/2 slide-in-from-top-[48%] sm:rounded-lg max-w-2xl max-h-[90vh] overflow-y-auto p-8 max-md:p-6"
      >
        {/* Header */}
        <div className="flex flex-col space-y-1.5 text-center sm:text-left">
          <h2 className="tracking-tight text-3xl font-semibold mb-2 text-left">
            Villa Net Rank™
          </h2>
          <p className="text-xl text-muted-foreground text-left">
            The Standard of Trust in the Global Villa Market
          </p>
        </div>

        <div className="border-t border-[#E5E5E5] my-6" />

        {/* 🔹 NUEVO: Mostrar el rank específico de la propiedad si existe */}
        {rank && (
          <div className="flex items-center justify-center py-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-200 mb-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 mb-2">This Property's Rank</p>
              <div className="flex items-center justify-center gap-2">
                <Star className="h-8 w-8 fill-yellow-500 text-yellow-500" />
                <p className="text-5xl font-bold text-gray-900">{rank.toFixed(1)}</p>
              </div>
              <p className="text-sm text-gray-500 mt-2">out of 10.0</p>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="space-y-4">
          <p className="text-base leading-relaxed text-gray-900">
            Every villa featured on Villa Net is independently verified and scored across{" "}
            <span className="font-semibold">7 key trust pillars:</span>
          </p>

          <ul className="space-y-3 my-6">
            {trustPillars.map((pillar, index) => (
              <li key={index} className="flex items-start gap-3">
                <CircleCheckBig className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-base text-gray-900">{pillar}</span>
              </li>
            ))}
          </ul>

          {/* Rating Highlight */}
          <div className="flex items-start gap-3 bg-yellow-50 border border-yellow-200 rounded-lg p-4 my-6">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-900 rounded-full">
              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
              <span className="text-sm font-semibold">9.0+</span>
            </div>
            <p className="text-sm text-gray-900 leading-relaxed">
              All villas on Villa Net rank{" "}
              <span className="font-semibold">9.0+</span> on our internal scoring system.
            </p>
          </div>
        </div>

        <div className="border-t border-[#E5E5E5] my-6" />

        {/* CTA Button */}
        <div className="hidden">
        <a
          className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white hover:bg-gray-700 transition-colors px-6 py-3 rounded-md text-base font-medium"
          href="/framework"
        >
          View the Full Villa Net Framework
          <ChevronRight className="h-5 w-5" />
        </a>
        </div>
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 p-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    </>
  );
};

export default VillaNetRankModal;