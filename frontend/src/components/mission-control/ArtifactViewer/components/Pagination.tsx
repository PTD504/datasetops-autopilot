import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  // Calculate item range
  const startItem = totalItems !== undefined && itemsPerPage !== undefined 
    ? (currentPage - 1) * itemsPerPage + 1 
    : null;
  const endItem = totalItems !== undefined && itemsPerPage !== undefined
    ? Math.min(currentPage * itemsPerPage, totalItems)
    : null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/[0.04] pt-4 select-none font-mono">
      {startItem && endItem && totalItems && (
        <span className="text-[10px] text-slate-500">
          Showing <span className="text-slate-350 font-semibold">{startItem}</span> to{" "}
          <span className="text-slate-355 font-semibold">{endItem}</span> of{" "}
          <span className="text-slate-450 font-bold">{totalItems}</span> artifacts
        </span>
      )}
      
      <div className="flex items-center gap-1.5 sm:ml-auto">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1 rounded-lg border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] hover:border-white/10 text-slate-400 hover:text-white transition-all disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:border-white/5 disabled:hover:text-slate-400 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center"
          aria-label="Previous Page"
        >
          <ChevronLeft size={14} />
        </button>

        {Array.from({ length: totalPages }).map((_, idx) => {
          const pageNum = idx + 1;
          const isSelected = currentPage === pageNum;
          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`min-w-[28px] h-[28px] px-1.5 rounded-lg border text-[10px] font-semibold transition-all cursor-pointer flex items-center justify-center ${
                isSelected
                  ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
                  : "bg-white/[0.01] text-slate-450 border-white/5 hover:bg-white/[0.02] hover:border-white/10"
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1 rounded-lg border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] hover:border-white/10 text-slate-400 hover:text-white transition-all disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:border-white/5 disabled:hover:text-slate-400 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center"
          aria-label="Next Page"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
