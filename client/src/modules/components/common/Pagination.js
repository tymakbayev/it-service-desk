import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';
import { FaChevronLeft, FaChevronRight, FaAngleDoubleLeft, FaAngleDoubleRight } from 'react-icons/fa';

/**
 * Pagination component for navigating through multi-page content
 * 
 * This component provides a UI for navigating through paginated data.
 * It includes first/last page buttons, previous/next buttons, and page number buttons.
 * It can be customized with different sizes, styles, and behaviors.
 */

// Styled components
const PaginationContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 1rem 0;
  font-family: 'Roboto', sans-serif;
  flex-wrap: wrap;
  gap: 0.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

const PaginationControls = styled.div`
  display: flex;
  align-items: center;
`;

const PaginationInfo = styled.div`
  margin: 0 1rem;
  color: #666;
  font-size: 0.875rem;
  white-space: nowrap;
`;

const PageSizeSelector = styled.div`
  display: flex;
  align-items: center;
  margin-left: 1rem;
  
  label {
    margin-right: 0.5rem;
    font-size: 0.875rem;
    color: #666;
    white-space: nowrap;
  }
  
  select {
    padding: 0.25rem 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    background-color: white;
    font-size: 0.875rem;
    cursor: pointer;
    
    &:focus {
      outline: none;
      border-color: #3f51b5;
      box-shadow: 0 0 0 2px rgba(63, 81, 181, 0.2);
    }
  }
`;

const PaginationList = styled.ul`
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0;
  flex-wrap: wrap;
`;

// Button size styles
const buttonSizes = {
  sm: css`
    height: 28px;
    min-width: 28px;
    font-size: 0.75rem;
  `,
  md: css`
    height: 36px;
    min-width: 36px;
    font-size: 0.875rem;
  `,
  lg: css`
    height: 44px;
    min-width: 44px;
    font-size: 1rem;
  `
};

const PaginationButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 0.125rem;
  padding: 0 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: ${props => props.active ? '#3f51b5' : 'white'};
  color: ${props => props.active ? 'white' : props.disabled ? '#ccc' : '#333'};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  min-width: 36px;
  height: 36px;
  
  ${props => buttonSizes[props.size || 'md']}
  
  &:hover {
    background-color: ${props => props.disabled ? 'white' : props.active ? '#303f9f' : '#f5f5f5'};
    border-color: ${props => props.disabled ? '#ddd' : '#3f51b5'};
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(63, 81, 181, 0.2);
  }
  
  ${props => props.isEllipsis && css`
    border: none;
    background-color: transparent;
    cursor: default;
    
    &:hover {
      background-color: transparent;
      border-color: transparent;
    }
    
    &:focus {
      box-shadow: none;
    }
  `}
`;

const PaginationItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: center;
`;

/**
 * Pagination component
 * 
 * @param {Object} props - Component props
 * @param {number} props.currentPage - Current active page (1-based)
 * @param {number} props.totalPages - Total number of pages
 * @param {number} props.totalItems - Total number of items across all pages
 * @param {number} props.pageSize - Number of items per page
 * @param {Array<number>} props.pageSizeOptions - Available page size options
 * @param {Function} props.onPageChange - Callback when page changes (receives page number)
 * @param {Function} props.onPageSizeChange - Callback when page size changes (receives new page size)
 * @param {boolean} props.showPageSizeSelector - Whether to show the page size selector
 * @param {boolean} props.showPageInfo - Whether to show the page info text
 * @param {boolean} props.showFirstLastButtons - Whether to show first/last page buttons
 * @param {string} props.size - Size of pagination buttons ('sm', 'md', 'lg')
 * @param {number} props.siblingCount - Number of sibling pages to show on each side of current page
 * @param {number} props.boundaryCount - Number of boundary pages to always show at start and end
 */
const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 10,
  pageSizeOptions = [10, 25, 50, 100],
  onPageChange,
  onPageSizeChange,
  showPageSizeSelector = true,
  showPageInfo = true,
  showFirstLastButtons = true,
  size = 'md',
  siblingCount = 1,
  boundaryCount = 1
}) => {
  // Calculate the range of page numbers to display
  const paginationRange = useMemo(() => {
    // Helper function to create a range array
    const range = (start, end) => {
      const length = end - start + 1;
      return Array.from({ length }, (_, i) => start + i);
    };

    // Calculate total number of items in the pagination (including ellipses)
    const totalPageNumbers = siblingCount * 2 + 3 + boundaryCount * 2;

    // Case 1: If the number of pages is less than the page numbers we want to show
    if (totalPageNumbers >= totalPages) {
      return range(1, totalPages);
    }

    // Calculate left and right sibling indices
    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    // Determine whether to show left and right ellipses
    const shouldShowLeftDots = leftSiblingIndex > boundaryCount + 1;
    const shouldShowRightDots = rightSiblingIndex < totalPages - boundaryCount;

    // Define the first and last boundary page numbers
    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    // Case 2: No left dots, but right dots
    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount + boundaryCount;
      const leftRange = range(1, leftItemCount);
      
      return [...leftRange, 'ELLIPSIS', ...range(totalPages - boundaryCount + 1, totalPages)];
    }

    // Case 3: No right dots, but left dots
    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount + boundaryCount;
      const rightRange = range(totalPages - rightItemCount + 1, totalPages);
      
      return [...range(1, boundaryCount), 'ELLIPSIS', ...rightRange];
    }

    // Case 4: Both left and right dots
    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = range(leftSiblingIndex, rightSiblingIndex);
      
      return [
        ...range(1, boundaryCount),
        'ELLIPSIS',
        ...middleRange,
        'ELLIPSIS',
        ...range(totalPages - boundaryCount + 1, totalPages)
      ];
    }
  }, [currentPage, totalPages, siblingCount, boundaryCount]);

  // Calculate the range of items being displayed
  const itemRangeText = useMemo(() => {
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(start + pageSize - 1, totalItems);
    return `${start}-${end} of ${totalItems}`;
  }, [currentPage, pageSize, totalItems]);

  // Handle page change
  const handlePageChange = (page) => {
    if (page === currentPage || page < 1 || page > totalPages) {
      return;
    }
    onPageChange(page);
  };

  // Handle page size change
  const handlePageSizeChange = (event) => {
    const newSize = parseInt(event.target.value, 10);
    if (onPageSizeChange) {
      onPageSizeChange(newSize);
    }
  };

  return (
    <PaginationContainer>
      {showPageInfo && (
        <PaginationInfo>
          Showing {itemRangeText} items
        </PaginationInfo>
      )}
      
      <PaginationControls>
        <PaginationList>
          {/* First page button */}
          {showFirstLastButtons && (
            <PaginationItem>
              <PaginationButton
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                size={size}
                aria-label="Go to first page"
                title="First Page"
              >
                <FaAngleDoubleLeft />
              </PaginationButton>
            </PaginationItem>
          )}
          
          {/* Previous page button */}
          <PaginationItem>
            <PaginationButton
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              size={size}
              aria-label="Go to previous page"
              title="Previous Page"
            >
              <FaChevronLeft />
            </PaginationButton>
          </PaginationItem>
          
          {/* Page number buttons */}
          {paginationRange.map((pageNumber, index) => {
            if (pageNumber === 'ELLIPSIS') {
              return (
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationButton
                    isEllipsis
                    size={size}
                    disabled
                    aria-hidden="true"
                  >
                    &hellip;
                  </PaginationButton>
                </PaginationItem>
              );
            }
            
            return (
              <PaginationItem key={pageNumber}>
                <PaginationButton
                  active={pageNumber === currentPage}
                  onClick={() => handlePageChange(pageNumber)}
                  size={size}
                  aria-label={`Go to page ${pageNumber}`}
                  aria-current={pageNumber === currentPage ? 'page' : undefined}
                >
                  {pageNumber}
                </PaginationButton>
              </PaginationItem>
            );
          })}
          
          {/* Next page button */}
          <PaginationItem>
            <PaginationButton
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              size={size}
              aria-label="Go to next page"
              title="Next Page"
            >
              <FaChevronRight />
            </PaginationButton>
          </PaginationItem>
          
          {/* Last page button */}
          {showFirstLastButtons && (
            <PaginationItem>
              <PaginationButton
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                size={size}
                aria-label="Go to last page"
                title="Last Page"
              >
                <FaAngleDoubleRight />
              </PaginationButton>
            </PaginationItem>
          )}
        </PaginationList>
        
        {/* Page size selector */}
        {showPageSizeSelector && (
          <PageSizeSelector>
            <label htmlFor="page-size-select">Items per page:</label>
            <select
              id="page-size-select"
              value={pageSize}
              onChange={handlePageSizeChange}
              aria-label="Select number of items per page"
            >
              {pageSizeOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </PageSizeSelector>
        )}
      </PaginationControls>
    </PaginationContainer>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number,
  totalPages: PropTypes.number,
  totalItems: PropTypes.number,
  pageSize: PropTypes.number,
  pageSizeOptions: PropTypes.arrayOf(PropTypes.number),
  onPageChange: PropTypes.func.isRequired,
  onPageSizeChange: PropTypes.func,
  showPageSizeSelector: PropTypes.bool,
  showPageInfo: PropTypes.bool,
  showFirstLastButtons: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  siblingCount: PropTypes.number,
  boundaryCount: PropTypes.number
};

export default Pagination;