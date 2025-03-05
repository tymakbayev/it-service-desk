import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaEdit, FaTrash, FaEye, FaPlus, FaFilter, FaFileExport } from 'react-icons/fa';

import Table from '../../../components/common/Table';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import Loader from '../../../components/common/Loader';
import Pagination from '../../../components/common/Pagination';
import Alert from '../../../components/common/Alert';
import Modal from '../../../components/common/Modal';
import EquipmentFilter from './EquipmentFilter';

import { 
  fetchEquipment, 
  deleteEquipment, 
  setEquipmentFilter, 
  exportEquipmentData,
  resetEquipmentState
} from '../store/equipmentSlice';
import { EQUIPMENT_STATUSES, EQUIPMENT_TYPES, USER_ROLES } from '../../../utils/constants';
import { formatDate } from '../../../utils/dateUtils';
import usePagination from '../../../hooks/usePagination';

const ListContainer = styled.div`
  padding: 20px;
`;

const ListHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
`;

const Title = styled.h1`
  font-size: 24px;
  color: #333;
  margin: 0;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
  
  @media (max-width: 768px) {
    flex-wrap: wrap;
  }
`;

const StatusBadge = styled.span`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  background-color: ${props => {
    switch (props.status) {
      case EQUIPMENT_STATUSES.OPERATIONAL:
        return '#4caf50';
      case EQUIPMENT_STATUSES.MAINTENANCE:
        return '#ff9800';
      case EQUIPMENT_STATUSES.BROKEN:
        return '#f44336';
      case EQUIPMENT_STATUSES.RESERVED:
        return '#2196f3';
      case EQUIPMENT_STATUSES.RETIRED:
        return '#9e9e9e';
      default:
        return '#e0e0e0';
    }
  }};
  color: white;
`;

const NoDataContainer = styled.div`
  text-align: center;
  padding: 40px 0;
  color: #666;
`;

const FilterContainer = styled.div`
  margin-bottom: 20px;
`;

const ButtonWithIcon = styled(Button)`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ActionButtonsCell = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  gap: 10px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchInput = styled.input`
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  flex: 1;
  min-width: 200px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #4a90e2;
  }
`;

const ActiveFiltersContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
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
 * Equipment List Component
 * 
 * Displays a list of equipment items with filtering, pagination, and CRUD operations.
 * Allows users to view, create, edit, and delete equipment items.
 */
const EquipmentList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { 
    equipment, 
    loading, 
    error, 
    totalItems, 
    filters 
  } = useSelector((state) => state.equipment);
  
  const { user } = useSelector((state) => state.auth);
  
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [equipmentToDelete, setEquipmentToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [activeFilters, setActiveFilters] = useState([]);

  // Pagination hook
  const { 
    page, 
    limit, 
    handlePageChange, 
    handleLimitChange 
  } = usePagination(1, 10);

  // Check if user has admin or technician role
  const hasEditPermission = user && (
    user.role === USER_ROLES.ADMIN || 
    user.role === USER_ROLES.TECHNICIAN
  );

  // Update active filters when filters change
  useEffect(() => {
    const newActiveFilters = [];
    
    if (filters.status) {
      newActiveFilters.push({ key: 'status', value: filters.status, label: 'Status' });
    }
    
    if (filters.type) {
      newActiveFilters.push({ key: 'type', value: filters.type, label: 'Type' });
    }
    
    if (filters.location) {
      newActiveFilters.push({ key: 'location', value: filters.location, label: 'Location' });
    }
    
    if (filters.manufacturer) {
      newActiveFilters.push({ key: 'manufacturer', value: filters.manufacturer, label: 'Manufacturer' });
    }
    
    if (filters.search) {
      newActiveFilters.push({ key: 'search', value: filters.search, label: 'Search' });
    }
    
    setActiveFilters(newActiveFilters);
  }, [filters]);

  // Load equipment data
  const loadEquipment = useCallback(() => {
    dispatch(fetchEquipment({ page, limit, ...filters }));
  }, [dispatch, page, limit, filters]);

  useEffect(() => {
    loadEquipment();
    
    // Cleanup on unmount
    return () => {
      dispatch(resetEquipmentState());
    };
  }, [loadEquipment, dispatch]);

  // Handle equipment deletion
  const handleDeleteClick = (equipment) => {
    setEquipmentToDelete(equipment);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (equipmentToDelete) {
      try {
        await dispatch(deleteEquipment(equipmentToDelete._id)).unwrap();
        setSuccessMessage('Equipment deleted successfully');
        loadEquipment();
      } catch (err) {
        console.error('Failed to delete equipment:', err);
      }
      setDeleteModalOpen(false);
      setEquipmentToDelete(null);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(setEquipmentFilter({ search: searchTerm }));
  };

  // Handle filter removal
  const removeFilter = (key) => {
    const updatedFilters = { ...filters };
    delete updatedFilters[key];
    
    if (key === 'search') {
      setSearchTerm('');
    }
    
    dispatch(setEquipmentFilter(updatedFilters));
  };

  // Clear all filters
  const clearAllFilters = () => {
    dispatch(setEquipmentFilter({}));
    setSearchTerm('');
  };

  // Handle export
  const handleExport = () => {
    dispatch(exportEquipmentData(filters));
  };

  // Table columns configuration
  const columns = [
    {
      header: 'Name',
      accessor: 'name',
      cell: (row) => (
        <div>
          <strong>{row.name}</strong>
          <div style={{ fontSize: '12px', color: '#666' }}>{row.serialNumber}</div>
        </div>
      )
    },
    {
      header: 'Type',
      accessor: 'type',
      cell: (row) => EQUIPMENT_TYPES[row.type] || row.type
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => <StatusBadge status={row.status}>{EQUIPMENT_STATUSES[row.status] || row.status}</StatusBadge>
    },
    {
      header: 'Location',
      accessor: 'location',
    },
    {
      header: 'Assigned To',
      accessor: 'assignedTo',
      cell: (row) => row.assignedTo ? row.assignedTo.name : '-'
    },
    {
      header: 'Last Updated',
      accessor: 'updatedAt',
      cell: (row) => formatDate(row.updatedAt)
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row) => (
        <ActionButtonsCell>
          <Button 
            variant="icon" 
            onClick={() => navigate(`/equipment/${row._id}`)}
            title="View details"
          >
            <FaEye />
          </Button>
          
          {hasEditPermission && (
            <>
              <Button 
                variant="icon" 
                onClick={() => navigate(`/equipment/edit/${row._id}`)}
                title="Edit equipment"
              >
                <FaEdit />
              </Button>
              
              <Button 
                variant="icon" 
                color="danger"
                onClick={() => handleDeleteClick(row)}
                title="Delete equipment"
              >
                <FaTrash />
              </Button>
            </>
          )}
        </ActionButtonsCell>
      )
    }
  ];

  return (
    <ListContainer>
      {successMessage && (
        <Alert 
          type="success" 
          message={successMessage} 
          onClose={() => setSuccessMessage('')}
          style={{ marginBottom: '20px' }}
        />
      )}
      
      {error && (
        <Alert 
          type="error" 
          message={error} 
          style={{ marginBottom: '20px' }}
        />
      )}
      
      <Card>
        <ListHeader>
          <Title>Equipment Inventory</Title>
          
          <ActionButtons>
            {hasEditPermission && (
              <ButtonWithIcon 
                onClick={() => navigate('/equipment/new')}
                color="primary"
              >
                <FaPlus /> Add Equipment
              </ButtonWithIcon>
            )}
            
            <ButtonWithIcon 
              onClick={() => setShowFilterModal(true)}
              variant="outlined"
            >
              <FaFilter /> Filter
            </ButtonWithIcon>
            
            <ButtonWithIcon 
              onClick={handleExport}
              variant="outlined"
            >
              <FaFileExport /> Export
            </ButtonWithIcon>
          </ActionButtons>
        </ListHeader>
        
        <SearchContainer>
          <form onSubmit={handleSearch} style={{ display: 'flex', flex: 1, gap: '10px' }}>
            <SearchInput
              type="text"
              placeholder="Search equipment by name, serial number, or model..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button type="submit">Search</Button>
          </form>
        </SearchContainer>
        
        {activeFilters.length > 0 && (
          <ActiveFiltersContainer>
            {activeFilters.map((filter) => (
              <ActiveFilter key={filter.key}>
                <FilterBadgeText>
                  {filter.label}: {filter.value}
                </FilterBadgeText>
                <ClearFilterButton onClick={() => removeFilter(filter.key)}>
                  <FaTimes size={12} />
                </ClearFilterButton>
              </ActiveFilter>
            ))}
            
            {activeFilters.length > 1 && (
              <Button 
                variant="text" 
                size="small" 
                onClick={clearAllFilters}
              >
                Clear All
              </Button>
            )}
          </ActiveFiltersContainer>
        )}
        
        {loading ? (
          <Loader />
        ) : equipment.length === 0 ? (
          <NoDataContainer>
            <p>No equipment found. Try adjusting your filters or add new equipment.</p>
            {hasEditPermission && (
              <Button 
                color="primary" 
                onClick={() => navigate('/equipment/new')}
                style={{ marginTop: '10px' }}
              >
                Add Equipment
              </Button>
            )}
          </NoDataContainer>
        ) : (
          <>
            <Table 
              columns={columns} 
              data={equipment} 
              keyField="_id"
            />
            
            <Pagination 
              currentPage={page}
              totalItems={totalItems}
              itemsPerPage={limit}
              onPageChange={handlePageChange}
              onLimitChange={handleLimitChange}
            />
          </>
        )}
      </Card>
      
      {/* Filter Modal */}
      <Modal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        title="Filter Equipment"
        size="large"
      >
        <EquipmentFilter 
          onClose={() => setShowFilterModal(false)}
        />
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Deletion"
        size="small"
      >
        <div>
          <p>Are you sure you want to delete the equipment "{equipmentToDelete?.name}"?</p>
          <p>This action cannot be undone.</p>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <Button 
              variant="outlined" 
              onClick={() => setDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              color="danger" 
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </ListContainer>
  );
};

export default EquipmentList;