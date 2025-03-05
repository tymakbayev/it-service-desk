import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';
import { FaSort, FaSortUp, FaSortDown, FaSearch, FaFilter, FaEllipsisH } from 'react-icons/fa';
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

const ActionsContainer = styled.div`
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
    font-weight: 500;
  }
  
  p {
    margin-bottom: 1rem;
  }
`;

const SelectionInfo = styled.div`
  margin-bottom: 1rem;
  padding: 0.5rem;
  background-color: #e8eaf6;
  border-radius: 0.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TableCell = styled.td`
  max-width: ${props => props.maxWidth || 'auto'};
  overflow: ${props => props.overflow || 'visible'};
  text-overflow: ${props => props.textOverflow || 'clip'};
  white-space: ${props => props.whiteSpace || 'normal'};
`;

const DropdownMenu = styled.div`
  position: relative;
  display: inline-block;
`;

const DropdownContent = styled.div`
  display: ${props => props.isOpen ? 'block' : 'none'};
  position: absolute;
  right: 0;
  background-color: #f9f9f9;
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  z-index: 1;
  border-radius: 0.25rem;
`;

const DropdownItem = styled.a`
  color: black;
  padding: 12px 16px;
  text-decoration: none;
  display: block;
  cursor: pointer;
  
  &:hover {
    background-color: #f1f1f1;
  }
`;

/**
 * Table component for displaying data in a tabular format with sorting, filtering, and pagination
 */
const Table = ({
  data = [],
  columns = [],
  variant = VARIANTS.DEFAULT,
  size = SIZES.MEDIUM,
  elevated = false,
  loading = false,
  selectable = false,
  searchable = false,
  filterable = false,
  pagination = false,
  defaultSortField = '',
  defaultSortDirection = 'asc',
  onSort = () => {},
  onSearch = () => {},
  onFilter = () => {},
  onRowClick = () => {},
  onSelectionChange = () => {},
  emptyStateMessage = 'No data available',
  emptyStateAction = null,
  rowsPerPageOptions = [10, 25, 50, 100],
  defaultRowsPerPage = 10,
  totalCount = 0,
  currentPage = 1,
  onPageChange = () => {},
  onRowsPerPageChange = () => {},
  customFilters = null,
  actions = [],
  footer = null,
  keyField = 'id',
  className = '',
  style = {},
}) => {
  // State for sorting
  const [sortField, setSortField] = useState(defaultSortField);
  const [sortDirection, setSortDirection] = useState(defaultSortDirection);
  
  // State for search
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for selection
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  
  // State for pagination
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);
  const [page, setPage] = useState(currentPage);
  
  // State for row actions dropdown
  const [openActionRow, setOpenActionRow] = useState(null);
  
  // Update pagination state when props change
  useEffect(() => {
    setPage(currentPage);
  }, [currentPage]);
  
  useEffect(() => {
    setRowsPerPage(defaultRowsPerPage);
  }, [defaultRowsPerPage]);
  
  // Handle sort
  const handleSort = useCallback((field) => {
    const newDirection = 
      field === sortField
        ? sortDirection === 'asc'
          ? 'desc'
          : 'asc'
        : 'asc';
    
    setSortField(field);
    setSortDirection(newDirection);
    onSort(field, newDirection);
  }, [sortField, sortDirection, onSort]);
  
  // Handle search
  const handleSearch = useCallback((e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  }, [onSearch]);
  
  // Handle row selection
  const handleSelectRow = useCallback((row) => {
    setSelectedRows((prevSelected) => {
      const isSelected = prevSelected.some((selectedRow) => selectedRow[keyField] === row[keyField]);
      
      const newSelected = isSelected
        ? prevSelected.filter((selectedRow) => selectedRow[keyField] !== row[keyField])
        : [...prevSelected, row];
      
      onSelectionChange(newSelected);
      return newSelected;
    });
  }, [keyField, onSelectionChange]);
  
  // Handle select all
  const handleSelectAll = useCallback(() => {
    if (selectAll) {
      setSelectedRows([]);
      setSelectAll(false);
      onSelectionChange([]);
    } else {
      setSelectedRows([...data]);
      setSelectAll(true);
      onSelectionChange([...data]);
    }
  }, [data, selectAll, onSelectionChange]);
  
  // Handle page change
  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
    onPageChange(newPage);
  }, [onPageChange]);
  
  // Handle rows per page change
  const handleRowsPerPageChange = useCallback((e) => {
    const value = parseInt(e.target.value, 10);
    setRowsPerPage(value);
    setPage(1);
    onRowsPerPageChange(value);
  }, [onRowsPerPageChange]);
  
  // Handle row click
  const handleRowClick = useCallback((row, event) => {
    // Don't trigger row click when clicking on checkboxes or action buttons
    if (
      event.target.type === 'checkbox' ||
      event.target.closest('.row-actions') ||
      event.target.closest('button')
    ) {
      return;
    }
    
    onRowClick(row);
  }, [onRowClick]);
  
  // Handle row action click
  const handleActionClick = useCallback((action, row) => {
    if (action.onClick) {
      action.onClick(row);
    }
    setOpenActionRow(null);
  }, []);
  
  // Toggle action dropdown
  const toggleActionDropdown = useCallback((rowId) => {
    setOpenActionRow(openActionRow === rowId ? null : rowId);
  }, [openActionRow]);
  
  // Check if a row is selected
  const isRowSelected = useCallback((row) => {
    return selectedRows.some((selectedRow) => selectedRow[keyField] === row[keyField]);
  }, [selectedRows, keyField]);
  
  // Render sort icon
  const renderSortIcon = useCallback((field) => {
    if (field !== sortField) {
      return <FaSort className="sort-icon" />;
    }
    
    return sortDirection === 'asc' ? (
      <FaSortUp className="sort-icon" />
    ) : (
      <FaSortDown className="sort-icon" />
    );
  }, [sortField, sortDirection]);
  
  // Render table header
  const renderTableHeader = useMemo(() => {
    return (
      <TableHead variant={variant}>
        <tr>
          {selectable && (
            <th style={{ width: '40px' }}>
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
              />
            </th>
          )}
          
          {columns.map((column) => (
            <th
              key={column.field}
              style={{
                width: column.width || 'auto',
                ...column.headerStyle
              }}
            >
              {column.sortable ? (
                <SortableHeader
                  variant={variant}
                  onClick={() => handleSort(column.field)}
                >
                  {column.header}
                  {renderSortIcon(column.field)}
                </SortableHeader>
              ) : (
                column.header
              )}
            </th>
          ))}
          
          {actions.length > 0 && (
            <th style={{ width: '80px', textAlign: 'center' }}>Actions</th>
          )}
        </tr>
      </TableHead>
    );
  }, [
    variant,
    columns,
    selectable,
    actions.length,
    selectAll,
    handleSelectAll,
    handleSort,
    renderSortIcon
  ]);
  
  // Render table body
  const renderTableBody = useMemo(() => {
    if (data.length === 0) {
      return (
        <TableBody variant={variant}>
          <tr>
            <td colSpan={columns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)}>
              <EmptyStateContainer>
                <FaSearch size={32} />
                <h4>{emptyStateMessage}</h4>
                {emptyStateAction}
              </EmptyStateContainer>
            </td>
          </tr>
        </TableBody>
      );
    }
    
    return (
      <TableBody variant={variant}>
        {data.map((row, rowIndex) => (
          <tr
            key={row[keyField] || rowIndex}
            onClick={(e) => handleRowClick(row, e)}
            style={{
              cursor: onRowClick ? 'pointer' : 'default',
              backgroundColor: isRowSelected(row) ? 'rgba(63, 81, 181, 0.08)' : undefined,
              ...row.style
            }}
          >
            {selectable && (
              <td>
                <input
                  type="checkbox"
                  checked={isRowSelected(row)}
                  onChange={() => handleSelectRow(row)}
                />
              </td>
            )}
            
            {columns.map((column) => (
              <TableCell
                key={`${row[keyField] || rowIndex}-${column.field}`}
                maxWidth={column.maxWidth}
                overflow={column.overflow}
                textOverflow={column.textOverflow}
                whiteSpace={column.whiteSpace}
                style={column.cellStyle}
              >
                {column.render
                  ? column.render(row[column.field], row, rowIndex)
                  : row[column.field]}
              </TableCell>
            ))}
            
            {actions.length > 0 && (
              <td className="row-actions" style={{ textAlign: 'center' }}>
                {actions.length === 1 ? (
                  <Button
                    size="sm"
                    variant={actions[0].variant || 'primary'}
                    onClick={() => handleActionClick(actions[0], row)}
                    icon={actions[0].icon}
                    title={actions[0].label}
                  >
                    {actions[0].showLabel && actions[0].label}
                  </Button>
                ) : (
                  <DropdownMenu>
                    <Button
                      size="sm"
                      variant="light"
                      onClick={() => toggleActionDropdown(row[keyField])}
                      icon={<FaEllipsisH />}
                    />
                    <DropdownContent isOpen={openActionRow === row[keyField]}>
                      {actions.map((action, idx) => (
                        <DropdownItem
                          key={idx}
                          onClick={() => handleActionClick(action, row)}
                        >
                          {action.icon && (
                            <span style={{ marginRight: '8px' }}>{action.icon}</span>
                          )}
                          {action.label}
                        </DropdownItem>
                      ))}
                    </DropdownContent>
                  </DropdownMenu>
                )}
              </td>
            )}
          </tr>
        ))}
      </TableBody>
    );
  }, [
    data,
    columns,
    variant,
    selectable,
    actions,
    keyField,
    emptyStateMessage,
    emptyStateAction,
    handleRowClick,
    handleSelectRow,
    handleActionClick,
    toggleActionDropdown,
    isRowSelected,
    openActionRow
  ]);
  
  // Render table footer
  const renderTableFooter = useMemo(() => {
    if (!footer) return null;
    
    return (
      <TableFooter variant={variant}>
        <tr>
          {selectable && <td></td>}
          {footer.map((cell, index) => (
            <td key={index}>{cell}</td>
          ))}
          {actions.length > 0 && <td></td>}
        </tr>
      </TableFooter>
    );
  }, [footer, variant, selectable, actions.length]);
  
  // Render table controls
  const renderTableControls = useMemo(() => {
    if (!searchable && !filterable && selectedRows.length === 0) {
      return null;
    }
    
    return (
      <>
        {selectedRows.length > 0 && (
          <SelectionInfo>
            <div>{selectedRows.length} item(s) selected</div>
            <Button
              size="sm"
              variant="light"
              onClick={() => {
                setSelectedRows([]);
                setSelectAll(false);
                onSelectionChange([]);
              }}
            >
              Clear selection
            </Button>
          </SelectionInfo>
        )}
        
        <TableControls>
          {searchable && (
            <SearchContainer>
              <Input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={handleSearch}
                icon={<FaSearch />}
                size="sm"
                fullWidth
              />
            </SearchContainer>
          )}
          
          {filterable && (
            <FilterContainer>
              {customFilters || (
                <Button
                  size="sm"
                  variant="light"
                  icon={<FaFilter />}
                  onClick={() => onFilter()}
                >
                  Filter
                </Button>
              )}
            </FilterContainer>
          )}
        </TableControls>
      </>
    );
  }, [
    searchable,
    filterable,
    selectedRows.length,
    searchTerm,
    handleSearch,
    onFilter,
    customFilters,
    onSelectionChange
  ]);
  
  // Render pagination
  const renderPagination = useMemo(() => {
    if (!pagination) return null;
    
    const totalPages = Math.ceil(totalCount / rowsPerPage);
    
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
        <div>
          <select
            value={rowsPerPage}
            onChange={handleRowsPerPageChange}
            style={{ padding: '0.25rem', borderRadius: '0.25rem', border: '1px solid #dee2e6' }}
          >
            {rowsPerPageOptions.map((option) => (
              <option key={option} value={option}>
                {option} per page
              </option>
            ))}
          </select>
        </div>
        
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          size={size === SIZES.LARGE ? 'md' : size}
        />
        
        <div>
          Showing {Math.min((page - 1) * rowsPerPage + 1, totalCount)} to {Math.min(page * rowsPerPage, totalCount)} of {totalCount} entries
        </div>
      </div>
    );
  }, [
    pagination,
    page,
    rowsPerPage,
    totalCount,
    size,
    rowsPerPageOptions,
    handlePageChange,
    handleRowsPerPageChange
  ]);
  
  return (
    <div className={className} style={style}>
      {renderTableControls}
      
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
          >
            {renderTableHeader}
            {renderTableBody}
            {renderTableFooter}
          </StyledTable>
        </TableWrapper>
      </TableContainer>
      
      {renderPagination}
    </div>
  );
};

Table.propTypes = {
  /** Data array to display in the table */
  data: PropTypes.array,
  
  /** Column configuration */
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      /** Unique field identifier */
      field: PropTypes.string.isRequired,
      
      /** Column header text */
      header: PropTypes.node.isRequired,
      
      /** Whether the column is sortable */
      sortable: PropTypes.bool,
      
      /** Custom render function for cell content */
      render: PropTypes.func,
      
      /** Column width */
      width: PropTypes.string,
      
      /** Maximum width for the column */
      maxWidth: PropTypes.string,
      
      /** Overflow behavior */
      overflow: PropTypes.string,
      
      /** Text overflow behavior */
      textOverflow: PropTypes.string,
      
      /** White space behavior */
      whiteSpace: PropTypes.string,
      
      /** Custom header styles */
      headerStyle: PropTypes.object,
      
      /** Custom cell styles */
      cellStyle: PropTypes.object,
    })
  ),
  
  /** Table variant */
  variant: PropTypes.oneOf(Object.values(VARIANTS)),
  
  /** Table size */
  size: PropTypes.oneOf(Object.values(SIZES)),
  
  /** Whether to add elevation shadow */
  elevated: PropTypes.bool,
  
  /** Loading state */
  loading: PropTypes.bool,
  
  /** Whether rows are selectable */
  selectable: PropTypes.bool,
  
  /** Whether to show search input */
  searchable: PropTypes.bool,
  
  /** Whether to show filter controls */
  filterable: PropTypes.bool,
  
  /** Whether to show pagination */
  pagination: PropTypes.bool,
  
  /** Default sort field */
  defaultSortField: PropTypes.string,
  
  /** Default sort direction */
  defaultSortDirection: PropTypes.oneOf(['asc', 'desc']),
  
  /** Sort callback */
  onSort: PropTypes.func,
  
  /** Search callback */
  onSearch: PropTypes.func,
  
  /** Filter callback */
  onFilter: PropTypes.func,
  
  /** Row click callback */
  onRowClick: PropTypes.func,
  
  /** Selection change callback */
  onSelectionChange: PropTypes.func,
  
  /** Empty state message */
  emptyStateMessage: PropTypes.node,
  
  /** Empty state action */
  emptyStateAction: PropTypes.node,
  
  /** Rows per page options */
  rowsPerPageOptions: PropTypes.arrayOf(PropTypes.number),
  
  /** Default rows per page */
  defaultRowsPerPage: PropTypes.number,
  
  /** Total count of items */
  totalCount: PropTypes.number,
  
  /** Current page */
  currentPage: PropTypes.number,
  
  /** Page change callback */
  onPageChange: PropTypes.func,
  
  /** Rows per page change callback */
  onRowsPerPageChange: PropTypes.func,
  
  /** Custom filter components */
  customFilters: PropTypes.node,
  
  /** Row actions */
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      /** Action label */
      label: PropTypes.string.isRequired,
      
      /** Whether to show label on button */
      showLabel: PropTypes.bool,
      
      /** Action icon */
      icon: PropTypes.node,
      
      /** Button variant */
      variant: PropTypes.string,
      
      /** Click handler */
      onClick: PropTypes.func.isRequired,
    })
  ),
  
  /** Footer cells */
  footer: PropTypes.arrayOf(PropTypes.node),
  
  /** Key field for unique row identification */
  keyField: PropTypes.string,
  
  /** Additional class name */
  className: PropTypes.string,
  
  /** Additional inline styles */
  style: PropTypes.object,
};

export default Table;