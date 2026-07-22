import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Reusable pagination controls.
 *
 * @param {number} currentPage
 * @param {number} totalPages
 * @param {function} onPageChange - Called with next page number
 * @param {number} totalItems - Optional total items count for display
 */
export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  className = '',
}) {
  if (totalPages <= 1) return null;

  // Generate visible page numbers with ellipsis
  const getPageNumbers = () => {
    const pages = [];
    const delta = 1; // Pages shown around current

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }

    return pages;
  };

  return (
    <nav className={`pagination-wrapper ${className}`.trim()} aria-label="Pagination">
      <button
        type="button"
        className="btn btn-outline btn-sm"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
        <span>Previous</span>
      </button>

      <div className="pagination-pages">
        {getPageNumbers().map((page, idx) =>
          page === '...' ? (
            <span key={`ellipsis-${idx}`} className="pagination-ellipsis">
              …
            </span>
          ) : (
            <button
              key={page}
              type="button"
              className={`pagination-page-btn ${page === currentPage ? 'active' : ''}`}
              onClick={() => onPageChange(page)}
              aria-current={page === currentPage ? 'page' : undefined}
              aria-label={`Page ${page}`}
            >
              {page}
            </button>
          )
        )}
      </div>

      <button
        type="button"
        className="btn btn-outline btn-sm"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Next page"
      >
        <span>Next</span>
        <ChevronRight size={16} />
      </button>

      {totalItems != null && (
        <span className="pagination-info">
          {totalItems.toLocaleString()} total
        </span>
      )}
    </nav>
  );
}
