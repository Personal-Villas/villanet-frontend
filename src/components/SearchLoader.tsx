import React from 'react';

interface SearchLoaderProps {
  progress: number;
}

export const SearchLoader: React.FC<SearchLoaderProps> = ({ progress }) => {
  return (
    <div className="fixed inset-0 z-50 bg-white/70 backdrop-blur-sm flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white shadow-xl p-6 text-center">
        {/* Spinner animado */}
        <div className="mx-auto mb-4 h-10 w-10 rounded-full border-2 border-neutral-900 border-b-transparent animate-spin" />
        
        <p className="text-sm font-medium text-neutral-900">
          We're finding your perfect villa…
        </p>

        {/* Barra de progreso */}
        <div className="mt-5 w-full h-2 rounded-full bg-neutral-100 overflow-hidden">
          <div
            className="h-full bg-neutral-900 transition-all duration-300 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
        
        <p className="mt-2 text-xs text-neutral-500">{progress}%</p>
      </div>
    </div>
  );
};