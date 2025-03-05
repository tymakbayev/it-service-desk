import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { format } from 'date-fns';

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
  
  // Update local state when filters change
  useEffect(() => {
    setStartDate(filters.createdAfter || '');
    setEndDate(filters.createdBefore || '');
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

  return (
    <FilterContainer>
      <FilterHeader>
        <h3>Filter Incidents</h3>
        <Button 
          variant="text" 
          onClick={onResetFilters}
          size="small"
        >
          Reset Filters
        </Button>
      </FilterHeader>

      <FilterSection>
        <FilterLabel>Search</FilterLabel>
        <Input
          type="text"
          placeholder="Search by title, description or ID..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          fullWidth
        />
      </FilterSection>

      <FilterGrid>
        <FilterSection>
          <FilterLabel>Status</FilterLabel>
          <CheckboxGroup>
            {Object.entries(INCIDENT_STATUSES).map(([key, value]) => (
              <CheckboxItem key={key}>
                <input
                  type="checkbox"
                  id={`status-${key}`}
                  checked={selectedStatuses.includes(value)}
                  onChange={() => handleStatusChange(value)}
                />
                <label htmlFor={`status-${key}`}>{value}</label>
              </CheckboxItem>
            ))}
          </CheckboxGroup>
        </FilterSection>

        <FilterSection>
          <FilterLabel>Priority</FilterLabel>
          <CheckboxGroup>
            {Object.entries(INCIDENT_PRIORITIES).map(([key, value]) => (
              <CheckboxItem key={key}>
                <input
                  type="checkbox"
                  id={`priority-${key}`}
                  checked={selectedPriorities.includes(value)}
                  onChange={() => handlePriorityChange(value)}
                />
                <label htmlFor={`priority-${key}`}>{value}</label>
              </CheckboxItem>
            ))}
          </CheckboxGroup>
        </FilterSection>

        <FilterSection>
          <FilterLabel>Category</FilterLabel>
          <CheckboxGroup>
            {Object.entries(INCIDENT_CATEGORIES).map(([key, value]) => (
              <CheckboxItem key={key}>
                <input
                  type="checkbox"
                  id={`category-${key}`}
                  checked={selectedCategories.includes(value)}
                  onChange={() => handleCategoryChange(value)}
                />
                <label htmlFor={`category-${key}`}>{value}</label>
              </CheckboxItem>
            ))}
          </CheckboxGroup>
        </FilterSection>

        <FilterSection>
          <FilterLabel>Date Range</FilterLabel>
          <DateRangeContainer>
            <div>
              <label htmlFor="startDate">From:</label>
              <Input
                type="date"
                id="startDate"
                name="startDate"
                value={startDate}
                onChange={handleDateChange}
              />
            </div>
            <div>
              <label htmlFor="endDate">To:</label>
              <Input
                type="date"
                id="endDate"
                name="endDate"
                value={endDate}
                onChange={handleDateChange}
              />
            </div>
          </DateRangeContainer>
        </FilterSection>

        <FilterSection>
          <FilterLabel>Assigned To</FilterLabel>
          <Input
            type="select"
            name="assignedTo"
            value={filters.assignedTo || ''}
            onChange={onFilterChange}
            fullWidth
          >
            <option value="">All Users</option>
            {users && users.map(user => (
              <option key={user._id} value={user._id}>
                {user.firstName} {user.lastName}
              </option>
            ))}
          </Input>
        </FilterSection>

        <FilterSection>
          <FilterLabel>Equipment</FilterLabel>
          <Input
            type="select"
            name="equipmentId"
            value={filters.equipmentId || ''}
            onChange={onFilterChange}
            fullWidth
          >
            <option value="">All Equipment</option>
            {equipment && equipment.map(item => (
              <option key={item._id} value={item._id}>
                {item.name} ({item.serialNumber})
              </option>
            ))}
          </Input>
        </FilterSection>
      </FilterGrid>

      <FilterActions>
        <Button 
          variant="primary" 
          onClick={onApplyFilters}
          fullWidth
        >
          Apply Filters
        </Button>
      </FilterActions>
    </FilterContainer>
  );
};

// Styled components
const FilterContainer = styled(Card)`
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

const FilterHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  
  h3 {
    margin: 0;
    font-size: 1.2rem;
  }
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
`;

const FilterSection = styled.div`
  margin-bottom: 1.5rem;
`;

const FilterLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const CheckboxItem = styled.div`
  display: flex;
  align-items: center;
  
  input {
    margin-right: 0.5rem;
  }
  
  label {
    cursor: pointer;
  }
`;

const DateRangeContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  
  label {
    display: block;
    margin-bottom: 0.3rem;
  }
`;

const FilterActions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
`;

export default IncidentFilter;