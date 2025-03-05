import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  fetchEquipment, 
  deleteEquipment,
  setEquipmentFilter,
  clearEquipmentFilter
} from '../store/equipmentSlice';
import EquipmentList from '../components/EquipmentList';
import EquipmentFilter from '../components/EquipmentFilter';
import { Card, Button, Modal, Alert, Loader, Pagination } from '../../../components/common';
import { useAuth } from '../../../hooks/useAuth';
import { ROLES } from '../../../utils/constants';
import usePagination from '../../../hooks/usePagination';

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

  return (
    <div className="equipment-page">
      <div className="page-header">
        <h1>Equipment Management</h1>
        {canManageEquipment && (
          <Button 
            variant="primary" 
            onClick={handleAddEquipment}
            icon="plus"
          >
            Add Equipment
          </Button>
        )}
      </div>

      {alertMessage && (
        <Alert 
          type={alertType} 
          message={alertMessage} 
          onClose={handleCloseAlert} 
          dismissible
        />
      )}

      <Card className="filter-card">
        <Card.Header>
          <h3>Filter Equipment</h3>
        </Card.Header>
        <Card.Body>
          <EquipmentFilter 
            filters={filters} 
            onFilterChange={handleFilterChange} 
            onClearFilters={handleClearFilters} 
          />
        </Card.Body>
      </Card>

      {loading ? (
        <Loader size="large" center />
      ) : error ? (
        <Alert 
          type="error" 
          message={`Error loading equipment: ${error}`} 
        />
      ) : (
        <>
          <EquipmentList 
            equipment={equipment} 
            onView={handleViewEquipment}
            onEdit={canManageEquipment ? handleEditEquipment : null}
            onDelete={canManageEquipment ? handleDeleteClick : null}
          />
          
          {totalPages > 1 && (
            <Pagination 
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              limit={limit}
              onLimitChange={handleLimitChange}
              totalItems={totalItems}
            />
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={handleCloseDeleteModal}
        title="Confirm Deletion"
      >
        <Modal.Body>
          {selectedEquipment && (
            <p>
              Are you sure you want to delete the equipment: 
              <strong>{selectedEquipment.name}</strong> 
              (Serial: {selectedEquipment.serialNumber})?
              This action cannot be undone.
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default EquipmentPage;