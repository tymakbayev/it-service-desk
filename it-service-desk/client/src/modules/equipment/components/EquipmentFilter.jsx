import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { FaSearch, FaTimes, FaCalendarAlt } from 'react-icons/fa';
import * as Yup from 'yup';
import { useFormik } from 'formik';

import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Card from '../../../components/common/Card';
import { setEquipmentFilter } from '../store/equipmentSlice';
import { EQUIPMENT_STATUSES } from '../../../utils/constants';

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
        if (value !== '' && value !== null && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {});
      
      dispatch(setEquipmentFilter(cleanedValues));
      updateActiveFilters(cleanedValues);
      
      if (onClose) {
        onClose();
      }
    },
  });

  // Update active filters display
  const updateActiveFilters = (filterValues) => {
    const newActiveFilters = [];
    
    Object.entries(filterValues).forEach(([key, value]) => {
      if (value) {
        let label = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
        
        // Format special cases
        if (key === 'status' && Object.values(EQUIPMENT_STATUSES).includes(value)) {
          label = 'Status';
          value = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
        } else if (key.includes('Date')) {
          label = key.replace('From', ' From').replace('To', ' To');
          value = new Date(value).toLocaleDateString();
        }
        
        newActiveFilters.push({ key, label, value });
      }
    });
    
    setActiveFilters(newActiveFilters);
  };

  // Initialize active filters on component mount
  useEffect(() => {
    updateActiveFilters(filters);
  }, [filters]);

  // Clear all filters
  const handleClearAllFilters = () => {
    formik.resetForm();
    dispatch(setEquipmentFilter({}));
    setActiveFilters([]);
  };

  // Remove a specific filter
  const handleRemoveFilter = (filterKey) => {
    const newValues = { ...formik.values, [filterKey]: '' };
    formik.setValues(newValues);
    
    const newFilters = { ...filters };
    delete newFilters[filterKey];
    
    dispatch(setEquipmentFilter(newFilters));
    updateActiveFilters(newFilters);
  };

  return (
    <Card>
      <FilterForm onSubmit={formik.handleSubmit}>
        <FilterTitle>Filter Equipment</FilterTitle>
        
        {activeFilters.length > 0 && (
          <>
            <ActiveFiltersContainer>
              {activeFilters.map((filter) => (
                <ActiveFilter key={filter.key}>
                  <FilterBadgeText>
                    {filter.label}: {filter.value}
                  </FilterBadgeText>
                  <ClearFilterButton 
                    type="button" 
                    onClick={() => handleRemoveFilter(filter.key)}
                  >
                    <FaTimes />
                  </ClearFilterButton>
                </ActiveFilter>
              ))}
            </ActiveFiltersContainer>
          </>
        )}
        
        <FilterRow>
          <FilterField>
            <FilterLabel htmlFor="search">Search</FilterLabel>
            <Input
              id="search"
              name="search"
              type="text"
              placeholder="Search by name or serial number"
              value={formik.values.search}
              onChange={formik.handleChange}
              icon={<FaSearch />}
            />
          </FilterField>
          
          <FilterField>
            <FilterLabel htmlFor="status">Status</FilterLabel>
            <SelectField
              id="status"
              name="status"
              value={formik.values.status}
              onChange={formik.handleChange}
            >
              <option value="">All Statuses</option>
              {Object.values(EQUIPMENT_STATUSES).map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
                </option>
              ))}
            </SelectField>
          </FilterField>
        </FilterRow>
        
        <FilterRow>
          <FilterField>
            <FilterLabel htmlFor="type">Equipment Type</FilterLabel>
            <Input
              id="type"
              name="type"
              type="text"
              placeholder="e.g. Laptop, Printer, Server"
              value={formik.values.type}
              onChange={formik.handleChange}
            />
          </FilterField>
          
          <FilterField>
            <FilterLabel htmlFor="manufacturer">Manufacturer</FilterLabel>
            <Input
              id="manufacturer"
              name="manufacturer"
              type="text"
              placeholder="e.g. Dell, HP, Lenovo"
              value={formik.values.manufacturer}
              onChange={formik.handleChange}
            />
          </FilterField>
        </FilterRow>
        
        <FilterRow>
          <FilterField>
            <FilterLabel htmlFor="location">Location</FilterLabel>
            <Input
              id="location"
              name="location"
              type="text"
              placeholder="e.g. Office 101, IT Department"
              value={formik.values.location}
              onChange={formik.handleChange}
            />
          </FilterField>
        </FilterRow>
        
        <FilterRow>
          <FilterField>
            <FilterLabel>Purchase Date Range</FilterLabel>
            <DateRangeContainer>
              <Input
                id="purchaseDateFrom"
                name="purchaseDateFrom"
                type="date"
                value={formik.values.purchaseDateFrom}
                onChange={formik.handleChange}
                error={formik.touched.purchaseDateFrom && formik.errors.purchaseDateFrom}
                icon={<FaCalendarAlt />}
              />
              <Input
                id="purchaseDateTo"
                name="purchaseDateTo"
                type="date"
                value={formik.values.purchaseDateTo}
                onChange={formik.handleChange}
                error={formik.touched.purchaseDateTo && formik.errors.purchaseDateTo}
                icon={<FaCalendarAlt />}
              />
            </DateRangeContainer>
          </FilterField>
        </FilterRow>
        
        <FilterRow>
          <FilterField>
            <FilterLabel>Warranty Expiry Date Range</FilterLabel>
            <DateRangeContainer>
              <Input
                id="warrantyExpiryDateFrom"
                name="warrantyExpiryDateFrom"
                type="date"
                value={formik.values.warrantyExpiryDateFrom}
                onChange={formik.handleChange}
                error={formik.touched.warrantyExpiryDateFrom && formik.errors.warrantyExpiryDateFrom}
                icon={<FaCalendarAlt />}
              />
              <Input
                id="warrantyExpiryDateTo"
                name="warrantyExpiryDateTo"
                type="date"
                value={formik.values.warrantyExpiryDateTo}
                onChange={formik.handleChange}
                error={formik.touched.warrantyExpiryDateTo && formik.errors.warrantyExpiryDateTo}
                icon={<FaCalendarAlt />}
              />
            </DateRangeContainer>
          </FilterField>
        </FilterRow>
        
        <FilterActions>
          <Button 
            type="button" 
            variant="secondary" 
            onClick={handleClearAllFilters}
          >
            Clear All
          </Button>
          <Button 
            type="button" 
            variant="secondary" 
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="primary"
          >
            Apply Filters
          </Button>
        </FilterActions>
      </FilterForm>
    </Card>
  );
};

export default EquipmentFilter;