import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  hasAvailabilityFilter?: boolean;
  showNextButton?: boolean;
}

export const PaginationControls: React.FC<PaginationProps> = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  hasAvailabilityFilter = false,
  showNextButton = true
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-4 py-8 lg:pb-8 pb-[50px]">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-6 py-3 border border-neutral-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 transition-colors font-medium text-neutral-700 flex items-center gap-2"
      >
        <ChevronLeft className="w-4 h-4" />
        Previous
      </button>

      <span className="text-sm text-neutral-600">
        Page {currentPage} {hasAvailabilityFilter && totalPages > 100 ? '' : `of ${totalPages}`}
        {hasAvailabilityFilter && totalPages > 100 && ' (availability mode)'}
      </span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!showNextButton}
        className="px-6 py-3 border border-neutral-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 transition-colors font-medium text-neutral-700 flex items-center gap-2"
      >
        Next
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};