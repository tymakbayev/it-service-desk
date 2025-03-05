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
import { EQUIPMENT_STATUSES } from '../../../utils/constants';
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

  // Pagination hook
  const { 
    page, 
    limit, 
    handlePageChange, 
    handleLimitChange 
  } = usePagination(1, 10);

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

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setEquipmentToDelete(null);
  };

  // Handle filter changes
  const handleFilterApply = (filterData) => {
    dispatch(setEquipmentFilter(filterData));
    setShowFilterModal(false);
  };

  const handleFilterReset = () => {
    dispatch(setEquipmentFilter({}));
    setShowFilterModal(false);
  };

  // Handle export
  const handleExport = () => {
    dispatch(exportEquipmentData(filters));
  };

  // Define table columns
  const columns = [
    {
      header: 'Name',
      accessor: 'name',
      cell: (row) => <strong>{row.name}</strong>
    },
    {
      header: 'Type',
      accessor: 'type'
    },
    {
      header: 'Serial Number',
      accessor: 'serialNumber'
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => <StatusBadge status={row.status}>{row.status}</StatusBadge>
    },
    {
      header: 'Location',
      accessor: 'location'
    },
    {
      header: 'Assigned To',
      accessor: 'assignedTo',
      cell: (row) => row.assignedTo || 'Not assigned'
    },
    {
      header: 'Purchase Date',
      accessor: 'purchaseDate',
      cell: (row) => formatDate(row.purchaseDate)
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row) => (
        <ActionButtons>
          <Button 
            variant="icon" 
            onClick={() => navigate(`/equipment/${row._id}`)}
            title="View details"
          >
            <FaEye />
          </Button>
          {['admin', 'manager'].includes(user?.role) && (
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
        </ActionButtons>
      )
    }
  ];

  // Show only relevant columns based on screen size (responsive)
  const getResponsiveColumns = () => {
    const windowWidth = window.innerWidth;
    if (windowWidth < 768) {
      return columns.filter(col => 
        ['name', 'status', 'actions'].includes(col.accessor)
      );
    }
    if (windowWidth < 1024) {
      return columns.filter(col => 
        ['name', 'type', 'status', 'location', 'actions'].includes(col.accessor)
      );
    }
    return columns;
  };

  const [responsiveColumns, setResponsiveColumns] = useState(getResponsiveColumns());

  useEffect(() => {
    const handleResize = () => {
      setResponsiveColumns(getResponsiveColumns());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle success message dismissal
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  return (
    <ListContainer>
      <Card>
        <ListHeader>
          <Title>Equipment Inventory</Title>
          <ActionButtons>
            <ButtonWithIcon 
              onClick={() => setShowFilterModal(true)}
              variant="secondary"
            >
              <FaFilter /> Filter
            </ButtonWithIcon>
            
            {['admin', 'manager'].includes(user?.role) && (
              <>
                <ButtonWithIcon 
                  onClick={handleExport}
                  variant="secondary"
                >
                  <FaFileExport /> Export
                </ButtonWithIcon>
                
                <ButtonWithIcon 
                  onClick={() => navigate('/equipment/create')}
                  variant="primary"
                >
                  <FaPlus /> Add Equipment
                </ButtonWithIcon>
              </>
            )}
          </ActionButtons>
        </ListHeader>

        {successMessage && (
          <Alert type="success" onClose={() => setSuccessMessage('')}>
            {successMessage}
          </Alert>
        )}

        {error && (
          <Alert type="error">
            Error loading equipment: {error}
          </Alert>
        )}

        {loading ? (
          <Loader />
        ) : equipment.length === 0 ? (
          <NoDataContainer>
            <p>No equipment found. {user?.role !== 'user' && 'Add some equipment to get started.'}</p>
            {['admin', 'manager'].includes(user?.role) && (
              <Button 
                variant="primary" 
                onClick={() => navigate('/equipment/create')}
              >
                Add Equipment
              </Button>
            )}
          </NoDataContainer>
        ) : (
          <>
            <Table 
              columns={responsiveColumns} 
              data={equipment}
              hoverable
              striped
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
      >
        <EquipmentFilter 
          initialFilters={filters}
          onApply={handleFilterApply}
          onReset={handleFilterReset}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={cancelDelete}
        title="Confirm Deletion"
      >
        <p>
          Are you sure you want to delete the equipment "{equipmentToDelete?.name}"? 
          This action cannot be undone.
        </p>
        <ActionButtons>
          <Button variant="secondary" onClick={cancelDelete}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </ActionButtons>
      </Modal>
    </ListContainer>
  );
};

export default EquipmentList;