import { useState, useCallback } from 'react';

/**
 * Shared pagination state and controls hook.
 *
 * @param {object} initialOptions
 * @param {number} initialOptions.page - Initial page number (default: 1)
 * @param {number} initialOptions.limit - Items per page (default: 10)
 * @returns {object} Pagination state and handlers
 */
export function usePagination({ page = 1, limit = 10 } = {}) {
  const [currentPage, setCurrentPage] = useState(page);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(limit);

  const setPaginationData = useCallback(({ currentPage: pageNum, totalPages: totalP, totalJobs, totalUsers, totalLogs }) => {
    if (pageNum != null) setCurrentPage(pageNum);
    if (totalP != null) setTotalPages(totalP);
    const total = totalJobs ?? totalUsers ?? totalLogs ?? 0;
    setTotalItems(total);
  }, []);

  const goToPage = useCallback((newPage) => {
    setCurrentPage((prev) => {
      const pageNum = Number(newPage);
      if (isNaN(pageNum) || pageNum < 1) return prev;
      return pageNum;
    });
  }, []);

  const nextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }, []);

  const resetPagination = useCallback(() => {
    setCurrentPage(1);
    setTotalPages(1);
    setTotalItems(0);
  }, []);

  return {
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    setPageSize,
    setPaginationData,
    goToPage,
    nextPage,
    prevPage,
    resetPagination,
  };
}

export default usePagination;
