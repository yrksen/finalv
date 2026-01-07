import { useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "./ui/button";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  variant?: "mobile" | "desktop";
}

export function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  variant = "desktop"
}: PaginationControlsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to show current page centered
  useEffect(() => {
    if (variant === "mobile" && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const pageButton = container.querySelector(`[data-page="${currentPage}"]`) as HTMLElement;
      
      if (pageButton) {
        // Calculate the scroll position to center the button
        const buttonCenter = pageButton.offsetLeft + pageButton.offsetWidth / 2;
        const containerCenter = container.offsetWidth / 2;
        const scrollPosition = buttonCenter - containerCenter;
        
        container.scrollTo({ 
          left: Math.max(0, scrollPosition), 
          behavior: 'smooth' 
        });
      }
    }
  }, [currentPage, variant]);

  // Generate page range for desktop (sliding window)
  const getPageRange = () => {
    const maxVisible = 7; // Show 7 pages at most
    
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const halfVisible = Math.floor(maxVisible / 2);
    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    // Adjust if we're near the end
    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    // When clicking on edges, shift the window to reveal 3 more pages
    if (currentPage === endPage && endPage < totalPages) {
      const shift = Math.min(3, totalPages - endPage);
      startPage = Math.min(startPage + shift, totalPages - maxVisible + 1);
      endPage = Math.min(endPage + shift, totalPages);
    } else if (currentPage === startPage && startPage > 1) {
      const shift = Math.min(3, startPage - 1);
      startPage = Math.max(startPage - shift, 1);
      endPage = Math.max(endPage - shift, maxVisible);
    }

    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  };

  if (variant === "mobile") {
    return (
      <div className="mt-6 bg-white border rounded-lg py-4 px-2 flex items-center justify-center gap-2">
        {/* Skip to First Page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="flex-shrink-0"
        >
          <ChevronsLeft className="size-4" />
        </Button>
        
        {/* Previous Page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="flex-shrink-0"
        >
          <ChevronLeft className="size-4" />
        </Button>
        
        {/* Scrollable Page Numbers */}
        <div ref={scrollContainerRef} className="flex-1 overflow-x-auto scroll-smooth">
          <div className="flex items-center gap-1 px-2 min-w-max">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                data-page={page}
                onClick={() => onPageChange(page)}
                className={`w-8 h-8 flex-shrink-0 rounded-lg text-sm font-medium transition-colors ${
                  page === currentPage
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
        
        {/* Next Page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="flex-shrink-0"
        >
          <ChevronRight className="size-4" />
        </Button>
        
        {/* Skip to Last Page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="flex-shrink-0"
        >
          <ChevronsRight className="size-4" />
        </Button>
      </div>
    );
  }

  // Desktop variant
  const pageRange = getPageRange();
  const showFirstEllipsis = pageRange[0] > 1;
  const showLastEllipsis = pageRange[pageRange.length - 1] < totalPages;

  return (
    <div className="mt-8 flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="size-4" />
      </Button>
      
      <div className="flex items-center gap-1">
        {showFirstEllipsis && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="w-10 h-10 rounded-lg text-sm font-medium transition-colors bg-white text-gray-700 hover:bg-gray-100 border"
            >
              1
            </button>
            <span className="px-2 text-gray-400">...</span>
          </>
        )}
        
        {pageRange.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
              page === currentPage
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border'
            }`}
          >
            {page}
          </button>
        ))}
        
        {showLastEllipsis && (
          <>
            <span className="px-2 text-gray-400">...</span>
            <button
              onClick={() => onPageChange(totalPages)}
              className="w-10 h-10 rounded-lg text-sm font-medium transition-colors bg-white text-gray-700 hover:bg-gray-100 border"
            >
              {totalPages}
            </button>
          </>
        )}
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}