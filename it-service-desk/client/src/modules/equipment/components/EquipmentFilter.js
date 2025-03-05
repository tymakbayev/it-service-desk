import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { FaSearch, FaTimes, FaFilter } from 'react-icons/fa';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { format } from 'date-fns';

import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Card from '../../../components/common/Card';
import { setEquipmentFilter, clearEquipmentFilter } from '../store/equipmentSlice';
import { EQUIPMENT_STATUSES, EQUIPMENT_TYPES } from '../../../utils/constants';

const FilterForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
`;

const FilterRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const FilterField = styled.div`
  flex: 1;
  min-width: 200px;
`;

const FilterLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
`;

const SelectField = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.3s;
  background-color: white;

  &:focus {
    border-color: #4a90e2;
    outline: none;
  }
  
  ${props => props.error && `
    border-color: #e53935;
  `}
`;

const ErrorMessage = styled.div`
  color: #e53935;
  font-size: 12px;
  margin-top: 4px;
`;

const FilterActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
`;

const FilterTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 16px;
  color: #333;
  font-weight: 600;
`;

const DateRangeContainer = styled.div`
  display: flex;
  gap: 12px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ActiveFiltersContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
  margin-bottom: 8px;
`;

const ActiveFilter = styled.div`
  display: flex;
  align-items: center;
  background-color: #e3f2fd;
  border-radius: 16px;
  padding: 4px 12px;
  font-size: 14px;
  color: #1976d2;
`;

const FilterBadgeText = styled.span`
  margin-right: 8px;
`;

const ClearFilterButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #1976d2;
  display: flex;
  align-items: center;
  padding: 0;
  font-size: 14px;
  
  &:hover {
    color: #1565c0;
  }
`;

const FilterHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const FilterIcon = styled(FaFilter)`
  margin-right: 8px;
`;

/**
 * Equipment Filter Component
 * 
 * This component provides filtering capabilities for the equipment list.
 * It allows users to filter equipment by various criteria such as status,
 * type, location, purchase date range, and more.
 */
const EquipmentFilter = ({ onClose }) => {
  const dispatch = useDispatch();
  const { filters } = useSelector((state) => state.equipment);
  const [activeFilters, setActiveFilters] = useState([]);

  // Define validation schema
  const validationSchema = Yup.object({
    status: Yup.string().nullable(),
    type: Yup.string().nullable(),
    location: Yup.string().nullable(),
    manufacturer: Yup.string().nullable(),
    purchaseDateFrom: Yup.date().nullable(),
    purchaseDateTo: Yup.date().nullable()
      .min(
        Yup.ref('purchaseDateFrom'),
        'End date must be after start date'
      ),
    warrantyExpiryDateFrom: Yup.date().nullable(),
    warrantyExpiryDateTo: Yup.date().nullable()
      .min(
        Yup.ref('warrantyExpiryDateFrom'),
        'End date must be after start date'
      ),
    search: Yup.string().nullable(),
  });

  // Initialize formik
  const formik = useFormik({
    initialValues: {
      status: filters.status || '',
      type: filters.type || '',
      location: filters.location || '',
      manufacturer: filters.manufacturer || '',
      purchaseDateFrom: filters.purchaseDateFrom || '',
      purchaseDateTo: filters.purchaseDateTo || '',
      warrantyExpiryDateFrom: filters.warrantyExpiryDateFrom || '',
      warrantyExpiryDateTo: filters.warrantyExpiryDateTo || '',
      search: filters.search || '',
    },
    validationSchema,
    onSubmit: (values) => {
      // Remove empty values
      const cleanedValues = Object.entries(values).reduce((acc, [key, value]) => {
        if (value && value !== '') {
          acc[key] = value;
        }
        return acc;
      }, {});
      
      dispatch(setEquipmentFilter(cleanedValues));
      
      if (onClose) {
        onClose();
      }
    },
  });

  // Update active filters display
  useEffect(() => {
    const newActiveFilters = [];
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        let displayValue = value;
        
        // Format dates for display
        if (key.includes('Date') && value) {
          try {
            displayValue = format(new Date(value), 'yyyy-MM-dd');
          } catch (error) {
            console.error('Date formatting error:', error);
          }
        }
        
        // Format status for display
        if (key === 'status' && value) {
          const statusObj = EQUIPMENT_STATUSES.find(s => s.value === value);
          displayValue = statusObj ? statusObj.label : value;
        }
        
        // Format type for display
        if (key === 'type' && value) {
          const typeObj = EQUIPMENT_TYPES.find(t => t.value === value);
          displayValue = typeObj ? typeObj.label : value;
        }
        
        newActiveFilters.push({
          key,
          value: displayValue,
          label: getFilterLabel(key),
        });
      }
    });
    
    setActiveFilters(newActiveFilters);
  }, [filters]);

  // Get human-readable label for filter keys
  const getFilterLabel = (key) => {
    const labels = {
      status: 'Status',
      type: 'Type',
      location: 'Location',
      manufacturer: 'Manufacturer',
      purchaseDateFrom: 'Purchase From',
      purchaseDateTo: 'Purchase To',
      warrantyExpiryDateFrom: 'Warranty From',
      warrantyExpiryDateTo: 'Warranty To',
      search: 'Search',
    };
    
    return labels[key] || key;
  };

  // Handle clearing a single filter
  const handleClearFilter = (key) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    dispatch(setEquipmentFilter(newFilters));
    
    // Update formik values
    formik.setFieldValue(key, '');
  };

  // Handle clearing all filters
  const handleClearAllFilters = () => {
    dispatch(clearEquipmentFilter());
    
    // Reset formik values
    Object.keys(formik.values).forEach(key => {
      formik.setFieldValue(key, '');
    });
  };

  return (
    <Card>
      <FilterHeader>
        <FilterTitle>
          <FilterIcon />
          Filter Equipment
        </FilterTitle>
        {activeFilters.length > 0 && (
          <Button 
            type="button" 
            variant="text" 
            onClick={handleClearAllFilters}
          >
            Clear All Filters
          </Button>
        )}
      </FilterHeader>
      
      {activeFilters.length > 0 && (
        <ActiveFiltersContainer>
          {activeFilters.map((filter) => (
            <ActiveFilter key={filter.key}>
              <FilterBadgeText>
                {filter.label}: {filter.value}
              </FilterBadgeText>
              <ClearFilterButton onClick={() => handleClearFilter(filter.key)}>
                <FaTimes size={12} />
              </ClearFilterButton>
            </ActiveFilter>
          ))}
        </ActiveFiltersContainer>
      )}
      
      <FilterForm onSubmit={formik.handleSubmit}>
        <FilterRow>
          <FilterField>
            <FilterLabel htmlFor="search">Search</FilterLabel>
            <Input
              id="search"
              name="search"
              type="text"
              placeholder="Search by name, serial number..."
              icon={<FaSearch />}
              value={formik.values.search}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.search && formik.errors.search}
            />
          </FilterField>
        </FilterRow>
        
        <FilterRow>
          <FilterField>
            <FilterLabel htmlFor="status">Status</FilterLabel>
            <SelectField
              id="status"
              name="status"
              value={formik.values.status}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.status && formik.errors.status}
            >
              <option value="">All Statuses</option>
              {EQUIPMENT_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </SelectField>
            {formik.touched.status && formik.errors.status && (
              <ErrorMessage>{formik.errors.status}</ErrorMessage>
            )}
          </FilterField>
          
          <FilterField>
            <FilterLabel htmlFor="type">Type</FilterLabel>
            <SelectField
              id="type"
              name="type"
              value={formik.values.type}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.type && formik.errors.type}
            >
              <option value="">All Types</option>
              {EQUIPMENT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </SelectField>
            {formik.touched.type && formik.errors.type && (
              <ErrorMessage>{formik.errors.type}</ErrorMessage>
            )}
          </FilterField>
        </FilterRow>
        
        <FilterRow>
          <FilterField>
            <FilterLabel htmlFor="location">Location</FilterLabel>
            <Input
              id="location"
              name="location"
              type="text"
              placeholder="Filter by location"
              value={formik.values.location}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.location && formik.errors.location}
            />
          </FilterField>
          
          <FilterField>
            <FilterLabel htmlFor="manufacturer">Manufacturer</FilterLabel>
            <Input
              id="manufacturer"
              name="manufacturer"
              type="text"
              placeholder="Filter by manufacturer"
              value={formik.values.manufacturer}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.manufacturer && formik.errors.manufacturer}
            />
          </FilterField>
        </FilterRow>
        
        <FilterField>
          <FilterLabel>Purchase Date Range</FilterLabel>
          <DateRangeContainer>
            <Input
              id="purchaseDateFrom"
              name="purchaseDateFrom"
              type="date"
              placeholder="From"
              value={formik.values.purchaseDateFrom}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.purchaseDateFrom && formik.errors.purchaseDateFrom}
            />
            <Input
              id="purchaseDateTo"
              name="purchaseDateTo"
              type="date"
              placeholder="To"
              value={formik.values.purchaseDateTo}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.purchaseDateTo && formik.errors.purchaseDateTo}
            />
          </DateRangeContainer>
          {formik.touched.purchaseDateTo && formik.errors.purchaseDateTo && (
            <ErrorMessage>{formik.errors.purchaseDateTo}</ErrorMessage>
          )}
        </FilterField>
        
        <FilterField>
          <FilterLabel>Warranty Expiry Date Range</FilterLabel>
          <DateRangeContainer>
            <Input
              id="warrantyExpiryDateFrom"
              name="warrantyExpiryDateFrom"
              type="date"
              placeholder="From"
              value={formik.values.warrantyExpiryDateFrom}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.warrantyExpiryDateFrom && formik.errors.warrantyExpiryDateFrom}
            />
            <Input
              id="warrantyExpiryDateTo"
              name="warrantyExpiryDateTo"
              type="date"
              placeholder="To"
              value={formik.values.warrantyExpiryDateTo}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.warrantyExpiryDateTo && formik.errors.warrantyExpiryDateTo}
            />
          </DateRangeContainer>
          {formik.touched.warrantyExpiryDateTo && formik.errors.warrantyExpiryDateTo && (
            <ErrorMessage>{formik.errors.warrantyExpiryDateTo}</ErrorMessage>
          )}
        </FilterField>
        
        <FilterActions>
          <Button 
            type="button" 
            variant="outlined" 
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained"
          >
            Apply Filters
          </Button>
        </FilterActions>
      </FilterForm>
    </Card>
  );
};

export default EquipmentFilter;