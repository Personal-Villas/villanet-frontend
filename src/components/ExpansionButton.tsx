import { Search } from 'lucide-react';

interface ExpansionButtonProps {
  onClick: () => void;
  resultsCount: number;
}

export default function ExpansionButton({ onClick, resultsCount }: ExpansionButtonProps) {
  // Solo mostrar si hay menos de 5 resultados
  if (resultsCount > 5) return null;

  return (
    <div className="w-full max-w-4xl mx-auto my-6 p-6 bg-white rounded-lg border border-border shadow-sm animate-fade-in">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Looking for something else?
          </h3>
          <p className="text-sm text-gray-600">
            We couldn't find many matches for your current search. Let us know what you're looking for and we'll help you find the perfect villa.
          </p>
        </div>
        
        <button
          onClick={onClick}
          className="shrink-0 px-6 py-3 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-all duration-200 flex items-center gap-2 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          aria-label="Request personalized villa search"
        >
          <Search className="w-4 h-4" />
          Tell us what you need
        </button>
      </div>
    </div>
  );
}