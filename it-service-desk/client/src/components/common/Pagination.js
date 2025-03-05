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
  justify-content: center;
  margin: 1rem 0;
  font-family: 'Roboto', sans-serif;
`;

const PaginationInfo = styled.div`
  margin: 0 1rem;
  color: #666;
  font-size: 0.875rem;
`;

const PageSizeSelector = styled.div`
  display: flex;
  align-items: center;
  margin-left: 1rem;
  
  label {
    margin-right: 0.5rem;
    font-size: 0.875rem;
    color: #666;
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
  currentPage,
  totalPages,
  totalItems,
  pageSize,
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
    // Calculate the total number of items to display (siblings + boundaries + current + ellipses)
    const totalPageNumbers = siblingCount * 2 + boundaryCount * 2 + 3; // +3 for current page and 2 ellipses
    
    // If the number of pages is less than the page numbers we want to show,
    // we return all page numbers
    if (totalPages <= totalPageNumbers) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    // Calculate left and right sibling index
    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);
    
    // Determine whether to show left/right ellipses
    const shouldShowLeftDots = leftSiblingIndex > boundaryCount + 1;
    const shouldShowRightDots = rightSiblingIndex < totalPages - boundaryCount;
    
    // Calculate the boundary page numbers
    const leftBoundaryPages = Array.from({ length: boundaryCount }, (_, i) => i + 1);
    const rightBoundaryPages = Array.from({ length: boundaryCount }, (_, i) => totalPages - boundaryCount + i + 1);
    
    // Calculate the sibling page numbers (including current page)
    const siblingPages = Array.from(
      { length: rightSiblingIndex - leftSiblingIndex + 1 },
      (_, i) => leftSiblingIndex + i
    );
    
    // Construct the final range with ellipses
    let range = [];
    
    if (shouldShowLeftDots && shouldShowRightDots) {
      range = [
        ...leftBoundaryPages,
        '...',
        ...siblingPages,
        '...',
        ...rightBoundaryPages
      ];
    } else if (shouldShowLeftDots) {
      range = [
        ...leftBoundaryPages,
        '...',
        ...Array.from(
          { length: totalPages - leftSiblingIndex + 1 },
          (_, i) => leftSiblingIndex + i
        )
      ];
    } else if (shouldShowRightDots) {
      range = [
        ...Array.from(
          { length: rightSiblingIndex },
          (_, i) => i + 1
        ),
        '...',
        ...rightBoundaryPages
      ];
    }
    
    return range;
  }, [currentPage, totalPages, siblingCount, boundaryCount]);
  
  // Calculate the range of items being displayed
  const itemRangeStart = (currentPage - 1) * pageSize + 1;
  const itemRangeEnd = Math.min(currentPage * pageSize, totalItems);
  
  // Handle page change
  const handlePageChange = (page) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };
  
  // Handle page size change
  const handlePageSizeChange = (event) => {
    const newPageSize = parseInt(event.target.value, 10);
    if (newPageSize !== pageSize) {
      onPageSizeChange(newPageSize);
    }
  };
  
  return (
    <PaginationContainer>
      {showPageInfo && totalItems > 0 && (
        <PaginationInfo>
          Showing {itemRangeStart}-{itemRangeEnd} of {totalItems} items
        </PaginationInfo>
      )}
      
      <PaginationList>
        {/* First page button */}
        {showFirstLastButtons && (
          <li>
            <PaginationButton
              type="button"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              size={size}
              aria-label="Go to first page"
              title="First Page"
            >
              <FaAngleDoubleLeft />
            </PaginationButton>
          </li>
        )}
        
        {/* Previous page button */}
        <li>
          <PaginationButton
            type="button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            size={size}
            aria-label="Go to previous page"
            title="Previous Page"
          >
            <FaChevronLeft />
          </PaginationButton>
        </li>
        
        {/* Page number buttons */}
        {paginationRange.map((pageNumber, index) => {
          if (pageNumber === '...') {
            return (
              <li key={`ellipsis-${index}`}>
                <PaginationButton
                  type="button"
                  isEllipsis
                  disabled
                  size={size}
                  aria-hidden="true"
                >
                  ...
                </PaginationButton>
              </li>
            );
          }
          
          return (
            <li key={`page-${pageNumber}`}>
              <PaginationButton
                type="button"
                onClick={() => handlePageChange(pageNumber)}
                active={pageNumber === currentPage}
                size={size}
                aria-label={`Go to page ${pageNumber}`}
                aria-current={pageNumber === currentPage ? 'page' : undefined}
              >
                {pageNumber}
              </PaginationButton>
            </li>
          );
        })}
        
        {/* Next page button */}
        <li>
          <PaginationButton
            type="button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
            size={size}
            aria-label="Go to next page"
            title="Next Page"
          >
            <FaChevronRight />
          </PaginationButton>
        </li>
        
        {/* Last page button */}
        {showFirstLastButtons && (
          <li>
            <PaginationButton
              type="button"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages || totalPages === 0}
              size={size}
              aria-label="Go to last page"
              title="Last Page"
            >
              <FaAngleDoubleRight />
            </PaginationButton>
          </li>
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
    </PaginationContainer>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  totalItems: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
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