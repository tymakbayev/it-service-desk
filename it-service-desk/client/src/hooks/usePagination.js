/**
 * usePagination Hook
 * 
 * Custom hook for handling pagination functionality in the application.
 * Provides state and methods for managing page navigation, items per page,
 * and other pagination-related features.
 * 
 * This hook can be used with any component that requires pagination,
 * such as tables, lists, or grids of data.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Custom hook for pagination functionality
 * @param {Object} options - Pagination options
 * @param {number} options.initialPage - Initial page number (default: 1)
 * @param {number} options.initialLimit - Initial number of items per page (default: 10)
 * @param {number} options.totalItems - Total number of items (required for calculating total pages)
 * @param {boolean} options.syncWithUrl - Whether to sync pagination state with URL parameters (default: true)
 * @param {Function} options.onPageChange - Callback function when page changes
 * @returns {Object} Pagination state and methods
 */
const usePagination = ({
  initialPage = 1,
  initialLimit = 10,
  totalItems = 0,
  syncWithUrl = true,
  onPageChange = null
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
      return isNaN(limitParam) ? initialLimit : Math.max(1, limitParam);
    }
    return initialLimit;
  });
  
  // Calculate total pages based on total items and items per page
  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalItems / limit)), [totalItems, limit]);
  
  // Ensure page is within valid range when totalPages changes
  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [totalPages, page]);
  
  // Calculate if there are previous and next pages
  const hasPreviousPage = page > 1;
  const hasNextPage = page < totalPages;
  
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
    if (range.length > 0 && range[0] > 2) {
      rangeWithDots.push(1);
      rangeWithDots.push('...');
    } else if (range.length > 0) {
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
    } else if (range.length > 0 && totalPages > 1) {
      rangeWithDots.push(totalPages);
    } else if (totalPages === 1) {
      rangeWithDots.push(1);
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
      onPageChange({ page, limit });
    }
  }, [page, limit, onPageChange]);
  
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
  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setPage(prevPage => prevPage + 1);
    }
  }, [hasNextPage]);
  
  /**
   * Go to the previous page
   */
  const previousPage = useCallback(() => {
    if (hasPreviousPage) {
      setPage(prevPage => prevPage - 1);
    }
  }, [hasPreviousPage]);
  
  /**
   * Go to the first page
   */
  const firstPage = useCallback(() => {
    if (page !== 1) {
      setPage(1);
    }
  }, [page]);
  
  /**
   * Go to the last page
   */
  const lastPage = useCallback(() => {
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
      // Calculate the first item index of the current page
      const firstItemIndex = (page - 1) * limit;
      
      // Set the new limit
      setLimit(parsedLimit);
      
      // Calculate the new page to keep the same items in view as much as possible
      const newPage = Math.floor(firstItemIndex / parsedLimit) + 1;
      setPage(Math.max(1, Math.min(newPage, Math.ceil(totalItems / parsedLimit))));
    }
  }, [page, limit, totalItems]);
  
  /**
   * Calculate the range of items being displayed
   * @returns {Object} Object containing start and end indices
   */
  const itemRange = useMemo(() => {
    const start = (page - 1) * limit + 1;
    const end = Math.min(page * limit, totalItems);
    return { start, end };
  }, [page, limit, totalItems]);
  
  /**
   * Get pagination metadata for API requests
   * @returns {Object} Pagination metadata
   */
  const getPaginationMeta = useCallback(() => {
    return {
      page,
      limit,
      skip: (page - 1) * limit
    };
  }, [page, limit]);
  
  /**
   * Get common pagination options for select inputs
   * @returns {Array} Array of pagination limit options
   */
  const limitOptions = useMemo(() => [
    { value: 5, label: '5 per page' },
    { value: 10, label: '10 per page' },
    { value: 25, label: '25 per page' },
    { value: 50, label: '50 per page' },
    { value: 100, label: '100 per page' }
  ], []);
  
  return {
    // State
    page,
    limit,
    totalPages,
    hasPreviousPage,
    hasNextPage,
    totalItems,
    itemRange,
    
    // Methods
    goToPage,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    changeLimit,
    getPageRange,
    getPaginationMeta,
    
    // Options
    limitOptions
  };
};

export default usePagination;