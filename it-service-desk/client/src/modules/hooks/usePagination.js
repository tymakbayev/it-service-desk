/**
 * usePagination Hook
 * 
 * Custom hook for handling pagination functionality in the application.
 * Provides state and methods for managing page navigation, items per page,
 * and other pagination-related features.
 * 
 * @module hooks/usePagination
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Available page size options for the pagination dropdown
 */
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

/**
 * Custom hook for pagination functionality
 * @param {Object} options - Pagination options
 * @param {number} options.initialPage - Initial page number (default: 1)
 * @param {number} options.initialLimit - Initial number of items per page (default: 10)
 * @param {number} options.totalItems - Total number of items (required for calculating total pages)
 * @param {boolean} options.syncWithUrl - Whether to sync pagination state with URL parameters (default: true)
 * @param {Function} options.onPageChange - Callback function when page changes
 * @param {Array<number>} options.pageSizeOptions - Available page size options (default: [10, 25, 50, 100])
 * @returns {Object} Pagination state and methods
 */
const usePagination = ({
  initialPage = 1,
  initialLimit = 10,
  totalItems = 0,
  syncWithUrl = true,
  onPageChange = null,
  pageSizeOptions = PAGE_SIZE_OPTIONS
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Initialize state from URL params if syncWithUrl is true, otherwise use provided defaults
  const [page, setPage] = useState(() => {
    if (syncWithUrl && searchParams.has('page')) {
      const pageParam = parseInt(searchParams.get('page'), 10);
      return isNaN(pageParam) ? initialPage : Math.max(1, pageParam);
    }
    return initialPage;
  });
  
  const [limit, setLimit] = useState(() => {
    if (syncWithUrl && searchParams.has('limit')) {
      const limitParam = parseInt(searchParams.get('limit'), 10);
      return isNaN(limitParam) || !pageSizeOptions.includes(limitParam) 
        ? initialLimit 
        : limitParam;
    }
    return initialLimit;
  });
  
  // Calculate total pages based on total items and items per page
  const totalPages = useMemo(() => 
    Math.max(1, Math.ceil(totalItems / limit)), 
    [totalItems, limit]
  );
  
  // Ensure page is within valid range when totalPages changes
  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [totalPages, page]);
  
  // Calculate if there are previous and next pages
  const hasPreviousPage = page > 1;
  const hasNextPage = page < totalPages;
  
  // Calculate offset for data fetching
  const offset = useMemo(() => (page - 1) * limit, [page, limit]);
  
  // Calculate visible page range for pagination controls
  const getPageRange = useCallback(() => {
    const delta = 2; // Number of pages to show before and after current page
    const range = [];
    const rangeWithDots = [];
    
    // Calculate range of visible page numbers
    for (let i = Math.max(2, page - delta); i <= Math.min(totalPages - 1, page + delta); i++) {
      range.push(i);
    }
    
    // Add first page and dots if necessary
    if (range.length > 0) {
      rangeWithDots.push(1);
      if (range[0] > 2) {
        rangeWithDots.push('...');
      }
    } else if (totalPages > 0) {
      rangeWithDots.push(1);
    }
    
    // Add range
    range.forEach(i => {
      rangeWithDots.push(i);
    });
    
    // Add last page and dots if necessary
    if (range.length > 0 && range[range.length - 1] < totalPages - 1) {
      rangeWithDots.push('...');
      rangeWithDots.push(totalPages);
    } else if (range.length > 0 && range[range.length - 1] < totalPages) {
      rangeWithDots.push(totalPages);
    }
    
    return rangeWithDots;
  }, [page, totalPages]);
  
  /**
   * Update URL parameters when page or limit changes
   */
  useEffect(() => {
    if (syncWithUrl) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('page', page.toString());
      newParams.set('limit', limit.toString());
      setSearchParams(newParams, { replace: true });
    }
  }, [page, limit, syncWithUrl, searchParams, setSearchParams]);
  
  /**
   * Call onPageChange callback when page or limit changes
   */
  useEffect(() => {
    if (onPageChange) {
      onPageChange({ page, limit, offset });
    }
  }, [page, limit, offset, onPageChange]);
  
  /**
   * Go to a specific page
   * @param {number} pageNumber - Page number to navigate to
   */
  const goToPage = useCallback((pageNumber) => {
    const targetPage = Math.max(1, Math.min(pageNumber, totalPages));
    if (targetPage !== page) {
      setPage(targetPage);
    }
  }, [page, totalPages]);
  
  /**
   * Go to the next page
   */
  const goToNextPage = useCallback(() => {
    if (hasNextPage) {
      setPage(prevPage => prevPage + 1);
    }
  }, [hasNextPage]);
  
  /**
   * Go to the previous page
   */
  const goToPreviousPage = useCallback(() => {
    if (hasPreviousPage) {
      setPage(prevPage => prevPage - 1);
    }
  }, [hasPreviousPage]);
  
  /**
   * Go to the first page
   */
  const goToFirstPage = useCallback(() => {
    if (page !== 1) {
      setPage(1);
    }
  }, [page]);
  
  /**
   * Go to the last page
   */
  const goToLastPage = useCallback(() => {
    if (page !== totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);
  
  /**
   * Change the number of items per page
   * @param {number} newLimit - New number of items per page
   */
  const changeLimit = useCallback((newLimit) => {
    const parsedLimit = parseInt(newLimit, 10);
    if (!isNaN(parsedLimit) && parsedLimit > 0 && parsedLimit !== limit) {
      // Calculate new page to keep the same starting item when possible
      const firstItemIndex = (page - 1) * limit;
      const newPage = Math.floor(firstItemIndex / parsedLimit) + 1;
      
      setLimit(parsedLimit);
      setPage(Math.min(newPage, Math.ceil(totalItems / parsedLimit)));
    }
  }, [limit, page, totalItems]);
  
  /**
   * Reset pagination to initial values
   */
  const resetPagination = useCallback(() => {
    setPage(initialPage);
    setLimit(initialLimit);
  }, [initialPage, initialLimit]);
  
  /**
   * Get the current pagination state
   * @returns {Object} Current pagination state
   */
  const getPaginationState = useCallback(() => ({
    page,
    limit,
    offset,
    totalPages,
    totalItems
  }), [page, limit, offset, totalPages, totalItems]);
  
  /**
   * Get the range of items being displayed
   * @returns {Object} Range information
   */
  const getDisplayRange = useCallback(() => {
    const start = totalItems === 0 ? 0 : (page - 1) * limit + 1;
    const end = Math.min(page * limit, totalItems);
    return { start, end, total: totalItems };
  }, [page, limit, totalItems]);
  
  return {
    // State
    page,
    limit,
    offset,
    totalPages,
    totalItems,
    hasPreviousPage,
    hasNextPage,
    pageSizeOptions,
    
    // Methods
    goToPage,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    goToLastPage,
    changeLimit,
    resetPagination,
    getPageRange,
    getPaginationState,
    getDisplayRange,
    
    // Display helpers
    displayRange: getDisplayRange()
  };
};

export default usePagination;