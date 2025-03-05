import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  fetchEquipment, 
  deleteEquipment,
  setEquipmentFilter,
  clearEquipmentFilter
} from '../equipmentSlice';
import EquipmentList from '../components/EquipmentList';
import EquipmentFilter from '../components/EquipmentFilter';
import { Card, Button, Modal, Alert, Loader, Pagination } from '../../../components/common';
import { useAuth } from '../../../hooks/useAuth';
import { ROLES } from '../../../utils/constants';
import usePagination from '../../../hooks/usePagination';

const PageContainer = styled.div`
  padding: 20px;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h1`
  font-size: 24px;
  color: ${({ theme }) => theme.colors.primary};
  margin: 0;
`;

const FilterContainer = styled.div`
  margin-bottom: 20px;
`;

const ActionBar = styled.div`
  display: flex;
  gap: 10px;
`;

const PaginationContainer = styled.div`
  margin-top: 20px;
  display: flex;
  justify-content: center;
`;

const AlertContainer = styled.div`
  margin-bottom: 20px;
`;

/**
 * Equipment management page component
 * Displays a list of equipment with filtering, pagination, and CRUD operations
 */
const EquipmentPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Local state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState('info');
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  // Redux state
  const { 
    equipment, 
    loading, 
    error, 
    totalItems, 
    filters 
  } = useSelector((state) => state.equipment);

  // Pagination hook
  const { 
    page, 
    limit, 
    totalPages, 
    handlePageChange, 
    handleLimitChange 
  } = usePagination(totalItems, 10);

  // Check if user has permission to add/edit/delete equipment
  const canManageEquipment = user && (
    user.role === ROLES.ADMIN || 
    user.role === ROLES.TECHNICIAN
  );

  /**
   * Load equipment data with current filters and pagination
   */
  const loadEquipment = useCallback(() => {
    dispatch(fetchEquipment({ 
      page, 
      limit, 
      ...filters 
    }));
  }, [dispatch, page, limit, filters]);

  // Load equipment on mount and when dependencies change
  useEffect(() => {
    loadEquipment();
  }, [loadEquipment]);

  // Show error alert if fetch fails
  useEffect(() => {
    if (error) {
      setAlertMessage(`Error loading equipment: ${error}`);
      setAlertType('error');
    }
  }, [error]);

  /**
   * Handle equipment filter change
   * @param {Object} newFilters - New filter values
   */
  const handleFilterChange = (newFilters) => {
    dispatch(setEquipmentFilter(newFilters));
  };

  /**
   * Clear all applied filters
   */
  const handleClearFilters = () => {
    dispatch(clearEquipmentFilter());
  };

  /**
   * Toggle filter visibility
   */
  const toggleFilterVisibility = () => {
    setIsFilterVisible(!isFilterVisible);
  };

  /**
   * Navigate to equipment detail page
   * @param {string} id - Equipment ID
   */
  const handleViewEquipment = (id) => {
    navigate(`/equipment/${id}`);
  };

  /**
   * Navigate to equipment edit page
   * @param {string} id - Equipment ID
   */
  const handleEditEquipment = (id) => {
    navigate(`/equipment/${id}/edit`);
  };

  /**
   * Open delete confirmation modal
   * @param {Object} equipment - Equipment to delete
   */
  const handleDeleteClick = (equipment) => {
    setSelectedEquipment(equipment);
    setShowDeleteModal(true);
  };

  /**
   * Close delete confirmation modal
   */
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedEquipment(null);
  };

  /**
   * Confirm and execute equipment deletion
   */
  const handleConfirmDelete = async () => {
    if (!selectedEquipment) return;
    
    try {
      await dispatch(deleteEquipment(selectedEquipment.id)).unwrap();
      setAlertMessage('Equipment successfully deleted');
      setAlertType('success');
      handleCloseDeleteModal();
      loadEquipment();
    } catch (err) {
      setAlertMessage(`Failed to delete equipment: ${err.message}`);
      setAlertType('error');
      handleCloseDeleteModal();
    }
  };

  /**
   * Navigate to create equipment page
   */
  const handleAddEquipment = () => {
    navigate('/equipment/new');
  };

  /**
   * Close alert message
   */
  const handleCloseAlert = () => {
    setAlertMessage(null);
  };

  /**
   * Export equipment data to CSV
   */
  const handleExportData = () => {
    // Implementation will be added in future
    setAlertMessage('Export functionality will be available soon');
    setAlertType('info');
  };

  return (
    <PageContainer>
      <PageHeader>
        <Title>Equipment Management</Title>
        <ActionBar>
          <Button 
            variant="secondary" 
            onClick={toggleFilterVisibility}
          >
            {isFilterVisible ? 'Hide Filters' : 'Show Filters'}
          </Button>
          
          <Button 
            variant="secondary" 
            onClick={handleExportData}
          >
            Export Data
          </Button>
          
          {canManageEquipment && (
            <Button 
              variant="primary" 
              onClick={handleAddEquipment}
            >
              Add New Equipment
            </Button>
          )}
        </ActionBar>
      </PageHeader>

      {alertMessage && (
        <AlertContainer>
          <Alert 
            type={alertType} 
            message={alertMessage} 
            onClose={handleCloseAlert} 
          />
        </AlertContainer>
      )}

      {isFilterVisible && (
        <FilterContainer>
          <Card>
            <EquipmentFilter 
              filters={filters} 
              onFilterChange={handleFilterChange} 
              onClearFilters={handleClearFilters} 
            />
          </Card>
        </FilterContainer>
      )}

      {loading ? (
        <Loader size="large" center />
      ) : (
        <>
          <Card>
            <EquipmentList 
              equipment={equipment} 
              onView={handleViewEquipment}
              onEdit={canManageEquipment ? handleEditEquipment : undefined}
              onDelete={canManageEquipment ? handleDeleteClick : undefined}
            />
          </Card>

          {totalPages > 1 && (
            <PaginationContainer>
              <Pagination 
                currentPage={page} 
                totalPages={totalPages} 
                onPageChange={handlePageChange} 
                limit={limit}
                onLimitChange={handleLimitChange}
                totalItems={totalItems}
              />
            </PaginationContainer>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={handleCloseDeleteModal}
        title="Confirm Deletion"
      >
        <p>
          Are you sure you want to delete the equipment 
          <strong>{selectedEquipment ? ` "${selectedEquipment.name}"` : ''}?</strong>
        </p>
        <p>This action cannot be undone.</p>
        
        <ActionBar>
          <Button 
            variant="secondary" 
            onClick={handleCloseDeleteModal}
          >
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleConfirmDelete}
          >
            Delete
          </Button>
        </ActionBar>
      </Modal>
    </PageContainer>
  );
};

export default EquipmentPage;