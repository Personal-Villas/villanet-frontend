import React from "react";
import { Info } from "lucide-react";

interface FloatingButtonProps {
  onClick: () => void;
}

export const FloatingButton: React.FC<FloatingButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 px-4 py-2.5 bg-white border border-[#E5E5E5] rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 text-gray-700 hover:text-gray-900 animate-fade-in md:bottom-6 md:right-6 max-md:bottom-20 max-md:right-4 max-md:px-3 max-md:py-2"
      aria-label="Learn about Villa Net Rank"
      style={{
        animation: "0.5s ease-out 1s 1 normal both running fadeInUp, 2s ease-in-out 5s infinite normal none running pulse-subtle"
      }}
    >
      <Info className="h-4 w-4" />
      <span className="text-sm font-medium max-md:hidden">
        Villa Net Rank?
      </span>
      <span className="text-sm font-medium md:hidden">Villa Rank?</span>
    </button>
  );
};