import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';
import { FaSort, FaSortUp, FaSortDown, FaSearch, FaFilter } from 'react-icons/fa';
import Input from './Input';
import Button from './Button';
import Pagination from './Pagination';
import Loader from './Loader';

// Table variants
const VARIANTS = {
  DEFAULT: 'default',
  STRIPED: 'striped',
  BORDERED: 'bordered',
  BORDERLESS: 'borderless',
  HOVER: 'hover',
  SMALL: 'small',
  DARK: 'dark',
};

// Table sizes
const SIZES = {
  SMALL: 'sm',
  MEDIUM: 'md',
  LARGE: 'lg',
};

// Styled components
const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  position: relative;
  margin-bottom: 1rem;
  border-radius: 0.25rem;
  box-shadow: ${(props) => (props.elevated ? '0 2px 5px rgba(0, 0, 0, 0.1)' : 'none')};
`;

const TableWrapper = styled.div`
  position: relative;
  width: 100%;
  
  ${(props) => props.loading && css`
    opacity: 0.6;
    pointer-events: none;
  `}
`;

const LoaderWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.5);
  z-index: 10;
`;

const StyledTable = styled.table`
  width: 100%;
  margin-bottom: 0;
  color: #333;
  border-collapse: collapse;
  
  ${(props) => props.size === SIZES.SMALL && css`
    font-size: 0.875rem;
    
    th, td {
      padding: 0.3rem;
    }
  `}
  
  ${(props) => props.size === SIZES.MEDIUM && css`
    font-size: 1rem;
    
    th, td {
      padding: 0.5rem;
    }
  `}
  
  ${(props) => props.size === SIZES.LARGE && css`
    font-size: 1.125rem;
    
    th, td {
      padding: 0.75rem;
    }
  `}
  
  ${(props) => props.variant === VARIANTS.STRIPED && css`
    tbody tr:nth-of-type(odd) {
      background-color: rgba(0, 0, 0, 0.03);
    }
  `}
  
  ${(props) => props.variant === VARIANTS.BORDERED && css`
    border: 1px solid #dee2e6;
    
    th, td {
      border: 1px solid #dee2e6;
    }
  `}
  
  ${(props) => props.variant === VARIANTS.BORDERLESS && css`
    th, td {
      border: none;
    }
  `}
  
  ${(props) => props.variant === VARIANTS.HOVER && css`
    tbody tr:hover {
      background-color: rgba(0, 0, 0, 0.075);
    }
  `}
  
  ${(props) => props.variant === VARIANTS.DARK && css`
    color: #fff;
    background-color: #343a40;
    
    th {
      background-color: #212529;
    }
    
    td {
      border-color: #454d55;
    }
    
    tbody tr:hover {
      background-color: #3d4349;
    }
  `}
`;

const TableHead = styled.thead`
  background-color: ${(props) => (props.variant === VARIANTS.DARK ? '#212529' : '#f8f9fa')};
  
  th {
    vertical-align: bottom;
    border-bottom: 2px solid #dee2e6;
    font-weight: 600;
    text-align: left;
    white-space: nowrap;
  }
`;

const TableBody = styled.tbody`
  background-color: ${(props) => (props.variant === VARIANTS.DARK ? '#343a40' : 'transparent')};
  
  td {
    vertical-align: middle;
    border-top: 1px solid #dee2e6;
  }
  
  tr:last-child td {
    border-bottom: 1px solid #dee2e6;
  }
`;

const TableFooter = styled.tfoot`
  background-color: ${(props) => (props.variant === VARIANTS.DARK ? '#212529' : '#f8f9fa')};
  
  td {
    font-weight: 600;
    border-top: 2px solid #dee2e6;
  }
`;

const SortableHeader = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  
  &:hover {
    color: ${(props) => (props.variant === VARIANTS.DARK ? '#fff' : '#3f51b5')};
  }
  
  .sort-icon {
    margin-left: 0.5rem;
    font-size: 0.875rem;
  }
`;

const TableControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  max-width: 300px;
  width: 100%;
`;

const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const RowsPerPageContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  color: #6c757d;
  
  svg {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }
  
  h4 {
    margin-bottom: 0.5rem;
  }
  
  p {
    max-width: 400px;
  }
`;

/**
 * A reusable table component with sorting, filtering, and pagination capabilities
 */
const Table = forwardRef(({
  columns,
  data,
  variant = VARIANTS.DEFAULT,
  size = SIZES.MEDIUM,
  elevated = false,
  loading = false,
  sortable = true,
  filterable = true,
  searchable = true,
  paginated = true,
  selectable = false,
  onRowClick,
  onSelectionChange,
  emptyState,
  footerContent,
  initialSort = { field: '', direction: 'asc' },
  initialPage = 1,
  initialRowsPerPage = 10,
  rowsPerPageOptions = [5, 10, 25, 50],
  totalItems,
  serverSide = false,
  onPageChange,
  onRowsPerPageChange,
  onSortChange,
  onSearchChange,
  onFilterChange,
  className,
  ...props
}, ref) => {
  // State for client-side operations
  const [sortConfig, setSortConfig] = useState(initialSort);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(initialPage);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);
  const [selectedRows, setSelectedRows] = useState([]);
  
  // Reset page when data changes
  useEffect(() => {
    if (!serverSide) {
      setPage(1);
    }
  }, [data, serverSide]);
  
  // Handle row selection
  const handleSelectAll = useCallback((e) => {
    if (e.target.checked) {
      const allIds = data.map(item => item.id);
      setSelectedRows(allIds);
      if (onSelectionChange) {
        onSelectionChange(allIds);
      }
    } else {
      setSelectedRows([]);
      if (onSelectionChange) {
        onSelectionChange([]);
      }
    }
  }, [data, onSelectionChange]);
  
  const handleSelectRow = useCallback((e, id) => {
    e.stopPropagation();
    setSelectedRows(prev => {
      const newSelection = prev.includes(id)
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id];
      
      if (onSelectionChange) {
        onSelectionChange(newSelection);
      }
      
      return newSelection;
    });
  }, [onSelectionChange]);
  
  // Handle sorting
  const handleSort = useCallback((field) => {
    if (!sortable) return;
    
    setSortConfig(prevConfig => {
      const newDirection = 
        prevConfig.field === field && prevConfig.direction === 'asc' 
          ? 'desc' 
          : 'asc';
      
      const newConfig = { field, direction: newDirection };
      
      if (serverSide && onSortChange) {
        onSortChange(newConfig);
      }
      
      return newConfig;
    });
  }, [sortable, serverSide, onSortChange]);
  
  // Handle search
  const handleSearch = useCallback((e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (serverSide && onSearchChange) {
      onSearchChange(value);
    }
    
    if (!serverSide) {
      setPage(1);
    }
  }, [serverSide, onSearchChange]);
  
  // Handle filter changes
  const handleFilterChange = useCallback((field, value) => {
    setFilters(prev => {
      const newFilters = { ...prev, [field]: value };
      
      if (serverSide && onFilterChange) {
        onFilterChange(newFilters);
      }
      
      return newFilters;
    });
    
    if (!serverSide) {
      setPage(1);
    }
  }, [serverSide, onFilterChange]);
  
  // Handle pagination
  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
    
    if (serverSide && onPageChange) {
      onPageChange(newPage);
    }
  }, [serverSide, onPageChange]);
  
  const handleRowsPerPageChange = useCallback((e) => {
    const value = parseInt(e.target.value, 10);
    setRowsPerPage(value);
    setPage(1);
    
    if (serverSide && onRowsPerPageChange) {
      onRowsPerPageChange(value);
    }
  }, [serverSide, onRowsPerPageChange]);
  
  // Process data for client-side operations
  const processedData = useMemo(() => {
    if (serverSide || !data) return data;
    
    let result = [...data];
    
    // Apply search
    if (searchTerm && searchable) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(item => {
        return columns.some(column => {
          if (!column.searchable) return false;
          
          const value = column.accessor 
            ? (typeof column.accessor === 'function' 
                ? column.accessor(item) 
                : item[column.accessor])
            : '';
            
          return value && value.toString().toLowerCase().includes(searchLower);
        });
      });
    }
    
    // Apply filters
    if (Object.keys(filters).length > 0 && filterable) {
      result = result.filter(item => {
        return Object.entries(filters).every(([field, value]) => {
          if (!value) return true;
          
          const column = columns.find(col => 
            (typeof col.accessor === 'string' && col.accessor === field) || 
            col.id === field
          );
          
          if (!column || !column.filterable) return true;
          
          const itemValue = typeof column.accessor === 'function'
            ? column.accessor(item)
            : item[field];
            
          if (column.filterType === 'select') {
            return itemValue === value;
          }
          
          return itemValue && itemValue.toString().toLowerCase().includes(value.toLowerCase());
        });
      });
    }
    
    // Apply sorting
    if (sortConfig.field && sortable) {
      const { field, direction } = sortConfig;
      
      result.sort((a, b) => {
        const column = columns.find(col => 
          (typeof col.accessor === 'string' && col.accessor === field) || 
          col.id === field
        );
        
        if (!column || !column.sortable) return 0;
        
        let aValue = typeof column.accessor === 'function'
          ? column.accessor(a)
          : a[field];
          
        let bValue = typeof column.accessor === 'function'
          ? column.accessor(b)
          : b[field];
          
        // Handle custom sort function
        if (column.sortFn) {
          return column.sortFn(aValue, bValue, direction);
        }
        
        // Default sorting logic
        if (aValue === null || aValue === undefined) return direction === 'asc' ? -1 : 1;
        if (bValue === null || bValue === undefined) return direction === 'asc' ? 1 : -1;
        
        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toString().toLowerCase();
          return direction === 'asc' 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        
        return direction === 'asc' ? aValue - bValue : bValue - aValue;
      });
    }
    
    return result;
  }, [data, columns, searchTerm, filters, sortConfig, serverSide, searchable, filterable, sortable]);
  
  // Paginate data for client-side pagination
  const paginatedData = useMemo(() => {
    if (serverSide || !paginated || !processedData) return processedData;
    
    const startIndex = (page - 1) * rowsPerPage;
    return processedData.slice(startIndex, startIndex + rowsPerPage);
  }, [processedData, page, rowsPerPage, serverSide, paginated]);
  
  // Calculate total pages for client-side pagination
  const totalPages = useMemo(() => {
    if (serverSide) {
      return Math.ceil((totalItems || 0) / rowsPerPage);
    }
    
    if (!paginated || !processedData) return 1;
    
    return Math.ceil(processedData.length / rowsPerPage);
  }, [processedData, rowsPerPage, serverSide, paginated, totalItems]);
  
  // Determine if all rows are selected
  const allSelected = useMemo(() => {
    if (!data || data.length === 0) return false;
    return data.every(item => selectedRows.includes(item.id));
  }, [data, selectedRows]);
  
  // Render table header
  const renderTableHeader = () => {
    return (
      <TableHead variant={variant}>
        <tr>
          {selectable && (
            <th style={{ width: '40px' }}>
              <Input
                type="checkbox"
                checked={allSelected}
                onChange={handleSelectAll}
                aria-label="Select all rows"
              />
            </th>
          )}
          {columns.map(column => (
            <th 
              key={column.id || column.accessor}
              style={{ 
                width: column.width || 'auto',
                ...column.headerStyle
              }}
            >
              {column.sortable && sortable ? (
                <SortableHeader
                  variant={variant}
                  onClick={() => handleSort(column.id || column.accessor)}
                >
                  {column.Header}
                  <span className="sort-icon">
                    {sortConfig.field === (column.id || column.accessor) ? (
                      sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />
                    ) : (
                      <FaSort />
                    )}
                  </span>
                </SortableHeader>
              ) : (
                column.Header
              )}
            </th>
          ))}
        </tr>
      </TableHead>
    );
  };
  
  // Render table body
  const renderTableBody = () => {
    const dataToRender = paginatedData || [];
    
    if (dataToRender.length === 0) {
      return (
        <TableBody variant={variant}>
          <tr>
            <td colSpan={selectable ? columns.length + 1 : columns.length} style={{ textAlign: 'center' }}>
              {emptyState || (
                <EmptyStateContainer>
                  <FaSearch size={32} />
                  <h4>No data found</h4>
                  <p>There are no items to display at the moment.</p>
                </EmptyStateContainer>
              )}
            </td>
          </tr>
        </TableBody>
      );
    }
    
    return (
      <TableBody variant={variant}>
        {dataToRender.map((row, rowIndex) => (
          <tr 
            key={row.id || rowIndex}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            style={{ 
              cursor: onRowClick ? 'pointer' : 'default',
              backgroundColor: selectedRows.includes(row.id) ? 'rgba(63, 81, 181, 0.08)' : undefined
            }}
          >
            {selectable && (
              <td>
                <Input
                  type="checkbox"
                  checked={selectedRows.includes(row.id)}
                  onChange={(e) => handleSelectRow(e, row.id)}
                  onClick={(e) => e.stopPropagation()}
                  aria-label={`Select row ${rowIndex + 1}`}
                />
              </td>
            )}
            {columns.map(column => {
              const cellValue = typeof column.accessor === 'function'
                ? column.accessor(row)
                : row[column.accessor];
                
              return (
                <td 
                  key={column.id || column.accessor}
                  style={column.cellStyle}
                >
                  {column.Cell ? column.Cell({ value: cellValue, row }) : cellValue}
                </td>
              );
            })}
          </tr>
        ))}
      </TableBody>
    );
  };
  
  // Render table footer
  const renderTableFooter = () => {
    if (!footerContent) return null;
    
    return (
      <TableFooter variant={variant}>
        {typeof footerContent === 'function' 
          ? footerContent({ 
              data: processedData, 
              selectedRows, 
              columns 
            }) 
          : footerContent
        }
      </TableFooter>
    );
  };
  
  // Render table controls
  const renderTableControls = () => {
    if (!searchable && !filterable) return null;
    
    return (
      <TableControls>
        {searchable && (
          <SearchContainer>
            <Input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearch}
              icon={<FaSearch />}
              fullWidth
            />
          </SearchContainer>
        )}
        
        {filterable && (
          <FilterContainer>
            <Button
              variant="outline-secondary"
              size="sm"
              leftIcon={<FaFilter />}
            >
              Filters
            </Button>
            {/* Additional filter controls can be added here */}
          </FilterContainer>
        )}
      </TableControls>
    );
  };
  
  // Render pagination controls
  const renderPagination = () => {
    if (!paginated) return null;
    
    const totalCount = serverSide 
      ? totalItems 
      : (processedData ? processedData.length : 0);
    
    const startItem = (page - 1) * rowsPerPage + 1;
    const endItem = Math.min(page * rowsPerPage, totalCount);
    
    return (
      <PaginationContainer>
        <div>
          {totalCount > 0 && (
            <span>
              Showing {startItem} to {endItem} of {totalCount} entries
            </span>
          )}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <RowsPerPageContainer>
            <span>Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={handleRowsPerPageChange}
              style={{ padding: '0.25rem', borderRadius: '0.25rem' }}
            >
              {rowsPerPageOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </RowsPerPageContainer>
          
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            size="sm"
          />
        </div>
      </PaginationContainer>
    );
  };
  
  return (
    <div ref={ref} className={className}>
      {renderTableControls()}
      
      <TableContainer elevated={elevated}>
        <TableWrapper loading={loading}>
          {loading && (
            <LoaderWrapper>
              <Loader size="md" />
            </LoaderWrapper>
          )}
          
          <StyledTable
            variant={variant}
            size={size}
            {...props}
          >
            {renderTableHeader()}
            {renderTableBody()}
            {renderTableFooter()}
          </StyledTable>
        </TableWrapper>
      </TableContainer>
      
      {renderPagination()}
    </div>
  );
});

Table.displayName = 'Table';

Table.propTypes = {
  /** Array of column definitions */
  columns: PropTypes.arrayOf(PropTypes.shape({
    /** Unique identifier for the column */
    id: PropTypes.string,
    /** Column header text */
    Header: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
    /** Property accessor or function to get cell value */
    accessor: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).isRequired,
    /** Custom cell renderer */
    Cell: PropTypes.func,
    /** Whether column is sortable */
    sortable: PropTypes.bool,
    /** Whether column is searchable */
    searchable: PropTypes.bool,
    /** Whether column is filterable */
    filterable: PropTypes.bool,
    /** Filter type for the column */
    filterType: PropTypes.oneOf(['text', 'select', 'date', 'number']),
    /** Custom sort function */
    sortFn: PropTypes.func,
    /** Column width */
    width: PropTypes.string,
    /** Custom header styles */
    headerStyle: PropTypes.object,
    /** Custom cell styles */
    cellStyle: PropTypes.object,
  })).isRequired,
  /** Array of data objects */
  data: PropTypes.array.isRequired,
  /** Table variant */
  variant: PropTypes.oneOf(Object.values(VARIANTS)),
  /** Table size */
  size: PropTypes.oneOf(Object.values(SIZES)),
  /** Whether to add elevation shadow */
  elevated: PropTypes.bool,
  /** Loading state */
  loading: PropTypes.bool,
  /** Whether table is sortable */
  sortable: PropTypes.bool,
  /** Whether table is filterable */
  filterable: PropTypes.bool,
  /** Whether table is searchable */
  searchable: PropTypes.bool,
  /** Whether table is paginated */
  paginated: PropTypes.bool,
  /** Whether rows are selectable */
  selectable: PropTypes.bool,
  /** Row click handler */
  onRowClick: PropTypes.func,
  /** Selection change handler */
  onSelectionChange: PropTypes.func,
  /** Custom empty state content */
  emptyState: PropTypes.node,
  /** Footer content or render function */
  footerContent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  /** Initial sort configuration */
  initialSort: PropTypes.shape({
    field: PropTypes.string,
    direction: PropTypes.oneOf(['asc', 'desc']),
  }),
  /** Initial page number */
  initialPage: PropTypes.number,
  /** Initial rows per page */
  initialRowsPerPage: PropTypes.number,
  /** Rows per page options */
  rowsPerPageOptions: PropTypes.arrayOf(PropTypes.number),
  /** Total number of items (for server-side pagination) */
  totalItems: PropTypes.number,
  /** Whether to use server-side operations */
  serverSide: PropTypes.bool,
  /** Page change handler (for server-side pagination) */
  onPageChange: PropTypes.func,
  /** Rows per page change handler (for server-side pagination) */
  onRowsPerPageChange: PropTypes.func,
  /** Sort change handler (for server-side sorting) */
  onSortChange: PropTypes.func,
  /** Search change handler (for server-side search) */
  onSearchChange: PropTypes.func,
  /** Filter change handler (for server-side filtering) */
  onFilterChange: PropTypes.func,
  /** Additional class name */
  className: PropTypes.string,
};

Table.defaultProps = {
  variant: VARIANTS.DEFAULT,
  size: SIZES.MEDIUM,
  elevated: false,
  loading: false,
  sortable: true,
  filterable: true,
  searchable: true,
  paginated: true,
  selectable: false,
  initialSort: { field: '', direction: 'asc' },
  initialPage: 1,
  initialRowsPerPage: 10,
  rowsPerPageOptions: [5, 10, 25, 50],
  serverSide: false,
};

// Export variants and sizes as static properties
Table.VARIANTS = VARIANTS;
Table.SIZES = SIZES;

export default Table;