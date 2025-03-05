import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { format } from 'date-fns';
import { FaFilter, FaSearch, FaTimes } from 'react-icons/fa';

// Components
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Card from '../../../components/common/Card';

// Utils and constants
import { 
  INCIDENT_PRIORITIES, 
  INCIDENT_STATUSES, 
  INCIDENT_CATEGORIES 
} from '../../../utils/constants';

const FilterContainer = styled.div`
  margin-bottom: 20px;
  transition: all 0.3s ease;
`;

const FilterHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  cursor: pointer;
`;

const FilterTitle = styled.h3`
  margin: 0;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 8px;
  }
`;

const FilterBody = styled.div`
  padding: 15px;
  background-color: ${({ theme }) => theme.colors.background.light};
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const FilterRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 15px;
  gap: 15px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const FilterGroup = styled.div`
  flex: 1;
  min-width: 200px;
  
  h4 {
    margin-top: 0;
    margin-bottom: 10px;
    font-size: 14px;
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  font-size: 14px;
  margin-right: 10px;
  cursor: pointer;
  
  input {
    margin-right: 5px;
  }
`;

const DateRangeContainer = styled.div`
  display: flex;
  gap: 10px;
  
  @media (max-width: 576px) {
    flex-direction: column;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  margin-bottom: 15px;
  
  svg {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: ${({ theme }) => theme.colors.text.secondary};
  }
  
  input {
    padding-left: 35px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 15px;
`;

const FilterBadge = styled.span`
  background-color: ${({ theme }) => theme.colors.primary.main};
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  margin-left: 8px;
`;

const SelectContainer = styled.div`
  width: 100%;
  
  select {
    width: 100%;
    padding: 8px 12px;
    border-radius: 4px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    background-color: ${({ theme }) => theme.colors.background.main};
    font-size: 14px;
    
    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.colors.primary.main};
    }
  }
`;

/**
 * IncidentFilter component provides filtering options for the incident list
 * @param {Object} props - Component props
 * @param {Object} props.filters - Current active filters
 * @param {Function} props.onFilterChange - Handler for filter changes
 * @param {Function} props.onMultiSelectChange - Handler for multi-select filter changes
 * @param {Function} props.onApplyFilters - Handler for applying filters
 * @param {Function} props.onResetFilters - Handler for resetting filters
 * @param {string} props.searchTerm - Current search term
 * @param {Function} props.onSearchChange - Handler for search term changes
 */
const IncidentFilter = ({ 
  filters = {}, 
  onFilterChange, 
  onMultiSelectChange,
  onApplyFilters, 
  onResetFilters,
  searchTerm = '',
  onSearchChange
}) => {
  const dispatch = useDispatch();
  
  // Get equipment list for the dropdown
  const { equipment } = useSelector((state) => state.equipment);
  
  // Get users list for assignment filter
  const { users } = useSelector((state) => state.auth);
  
  // Local state for date range
  const [startDate, setStartDate] = useState(filters.createdAfter || '');
  const [endDate, setEndDate] = useState(filters.createdBefore || '');
  
  // Local state for selected statuses and priorities
  const [selectedStatuses, setSelectedStatuses] = useState(filters.status || []);
  const [selectedPriorities, setSelectedPriorities] = useState(filters.priority || []);
  const [selectedCategories, setSelectedCategories] = useState(filters.category || []);
  
  // UI state
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Count active filters
  const getActiveFilterCount = () => {
    let count = 0;
    
    if (searchTerm) count++;
    if (selectedStatuses.length) count++;
    if (selectedPriorities.length) count++;
    if (selectedCategories.length) count++;
    if (filters.assignedTo) count++;
    if (filters.equipmentId) count++;
    if (startDate) count++;
    if (endDate) count++;
    
    return count;
  };
  
  // Update local state when filters change
  useEffect(() => {
    setStartDate(filters.createdAfter ? format(new Date(filters.createdAfter), 'yyyy-MM-dd') : '');
    setEndDate(filters.createdBefore ? format(new Date(filters.createdBefore), 'yyyy-MM-dd') : '');
    setSelectedStatuses(filters.status || []);
    setSelectedPriorities(filters.priority || []);
    setSelectedCategories(filters.category || []);
  }, [filters]);

  // Handle status checkbox change
  const handleStatusChange = (status) => {
    const newSelectedStatuses = selectedStatuses.includes(status)
      ? selectedStatuses.filter(s => s !== status)
      : [...selectedStatuses, status];
    
    setSelectedStatuses(newSelectedStatuses);
    onMultiSelectChange('status', newSelectedStatuses);
  };

  // Handle priority checkbox change
  const handlePriorityChange = (priority) => {
    const newSelectedPriorities = selectedPriorities.includes(priority)
      ? selectedPriorities.filter(p => p !== priority)
      : [...selectedPriorities, priority];
    
    setSelectedPriorities(newSelectedPriorities);
    onMultiSelectChange('priority', newSelectedPriorities);
  };

  // Handle category checkbox change
  const handleCategoryChange = (category) => {
    const newSelectedCategories = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];
    
    setSelectedCategories(newSelectedCategories);
    onMultiSelectChange('category', newSelectedCategories);
  };

  // Handle date range changes
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'startDate') {
      setStartDate(value);
      onFilterChange({ 
        target: { 
          name: 'createdAfter', 
          value: value ? new Date(value).toISOString() : '' 
        } 
      });
    } else if (name === 'endDate') {
      setEndDate(value);
      onFilterChange({ 
        target: { 
          name: 'createdBefore', 
          value: value ? new Date(value).toISOString() : '' 
        } 
      });
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    onSearchChange(e.target.value);
  };

  // Toggle filter expansion
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Apply filters
  const handleApplyFilters = () => {
    onApplyFilters();
    setIsExpanded(false);
  };

  // Reset filters
  const handleResetFilters = () => {
    setStartDate('');
    setEndDate('');
    setSelectedStatuses([]);
    setSelectedPriorities([]);
    setSelectedCategories([]);
    onResetFilters();
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <FilterContainer>
      <Card>
        <FilterHeader onClick={toggleExpand}>
          <FilterTitle>
            <FaFilter /> 
            Filter Incidents
            {activeFilterCount > 0 && <FilterBadge>{activeFilterCount}</FilterBadge>}
          </FilterTitle>
          <Button 
            variant="text" 
            size="small" 
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand();
            }}
          >
            {isExpanded ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </FilterHeader>

        <SearchContainer>
          <FaSearch />
          <Input
            type="text"
            placeholder="Search by title, description or ID..."
            value={searchTerm}
            onChange={handleSearchChange}
            fullWidth
          />
        </SearchContainer>

        {isExpanded && (
          <FilterBody>
            <FilterRow>
              <FilterGroup>
                <h4>Status</h4>
                <CheckboxGroup>
                  {INCIDENT_STATUSES.map((status) => (
                    <CheckboxLabel key={status.value}>
                      <input
                        type="checkbox"
                        checked={selectedStatuses.includes(status.value)}
                        onChange={() => handleStatusChange(status.value)}
                      />
                      {status.label}
                    </CheckboxLabel>
                  ))}
                </CheckboxGroup>
              </FilterGroup>

              <FilterGroup>
                <h4>Priority</h4>
                <CheckboxGroup>
                  {INCIDENT_PRIORITIES.map((priority) => (
                    <CheckboxLabel key={priority.value}>
                      <input
                        type="checkbox"
                        checked={selectedPriorities.includes(priority.value)}
                        onChange={() => handlePriorityChange(priority.value)}
                      />
                      {priority.label}
                    </CheckboxLabel>
                  ))}
                </CheckboxGroup>
              </FilterGroup>
            </FilterRow>

            <FilterRow>
              <FilterGroup>
                <h4>Category</h4>
                <CheckboxGroup>
                  {INCIDENT_CATEGORIES.map((category) => (
                    <CheckboxLabel key={category.value}>
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.value)}
                        onChange={() => handleCategoryChange(category.value)}
                      />
                      {category.label}
                    </CheckboxLabel>
                  ))}
                </CheckboxGroup>
              </FilterGroup>

              <FilterGroup>
                <h4>Assigned To</h4>
                <SelectContainer>
                  <select
                    name="assignedTo"
                    value={filters.assignedTo || ''}
                    onChange={onFilterChange}
                  >
                    <option value="">All Users</option>
                    {users && users.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.firstName} {user.lastName}
                      </option>
                    ))}
                  </select>
                </SelectContainer>
              </FilterGroup>
            </FilterRow>

            <FilterRow>
              <FilterGroup>
                <h4>Related Equipment</h4>
                <SelectContainer>
                  <select
                    name="equipmentId"
                    value={filters.equipmentId || ''}
                    onChange={onFilterChange}
                  >
                    <option value="">All Equipment</option>
                    {equipment && equipment.map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.name} ({item.serialNumber})
                      </option>
                    ))}
                  </select>
                </SelectContainer>
              </FilterGroup>

              <FilterGroup>
                <h4>Date Range</h4>
                <DateRangeContainer>
                  <Input
                    type="date"
                    name="startDate"
                    placeholder="From"
                    value={startDate}
                    onChange={handleDateChange}
                    fullWidth
                  />
                  <Input
                    type="date"
                    name="endDate"
                    placeholder="To"
                    value={endDate}
                    onChange={handleDateChange}
                    fullWidth
                  />
                </DateRangeContainer>
              </FilterGroup>
            </FilterRow>

            <ButtonGroup>
              <Button 
                variant="outlined" 
                color="secondary" 
                onClick={handleResetFilters}
                startIcon={<FaTimes />}
              >
                Reset Filters
              </Button>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleApplyFilters}
                startIcon={<FaFilter />}
              >
                Apply Filters
              </Button>
            </ButtonGroup>
          </FilterBody>
        )}
      </Card>
    </FilterContainer>
  );
};

export default IncidentFilter;