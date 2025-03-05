import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchEquipmentById, 
  updateEquipmentStatus,
  resetEquipmentDetail
} from '../store/equipmentSlice';
import { fetchIncidentsByEquipmentId } from '../../incidents/store/incidentsSlice';
import { Card, Button, Modal, Alert, Loader, Table } from '../../../components/common';
import { useAuth } from '../../../hooks/useAuth';
import { ROLES, EQUIPMENT_STATUS } from '../../../utils/constants';
import { formatDate } from '../../../utils/dateUtils';

/**
 * Equipment Detail Page Component
 * 
 * Displays detailed information about a specific equipment item,
 * including its specifications, status, history, and related incidents.
 * Allows authorized users to update equipment status and navigate to edit page.
 */
const EquipmentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();

  // Local state
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState('info');
  const [activeTab, setActiveTab] = useState('details');

  // Redux state
  const { 
    currentEquipment, 
    loading: equipmentLoading, 
    error: equipmentError 
  } = useSelector((state) => state.equipment);
  
  const { 
    incidents: relatedIncidents, 
    loading: incidentsLoading 
  } = useSelector((state) => state.incidents);

  // Check if user has permission to edit equipment
  const canEditEquipment = user && (
    user.role === ROLES.ADMIN || 
    user.role === ROLES.TECHNICIAN
  );

  /**
   * Load equipment data and related incidents
   */
  const loadEquipmentData = useCallback(() => {
    if (id) {
      dispatch(fetchEquipmentById(id));
      dispatch(fetchIncidentsByEquipmentId(id));
    }
  }, [dispatch, id]);

  // Load data on mount and when dependencies change
  useEffect(() => {
    loadEquipmentData();
    
    // Cleanup on unmount
    return () => {
      dispatch(resetEquipmentDetail());
    };
  }, [loadEquipmentData, dispatch]);

  /**
   * Navigate to equipment edit page
   */
  const handleEditEquipment = () => {
    navigate(`/equipment/${id}/edit`);
  };

  /**
   * Navigate back to equipment list
   */
  const handleBackToList = () => {
    navigate('/equipment');
  };

  /**
   * Open status change modal
   * @param {string} status - Initial status value
   */
  const handleOpenStatusModal = (status) => {
    setNewStatus(status || currentEquipment?.status);
    setStatusNote('');
    setShowStatusModal(true);
  };

  /**
   * Close status change modal
   */
  const handleCloseStatusModal = () => {
    setShowStatusModal(false);
  };

  /**
   * Handle status change in modal
   * @param {Event} e - Change event
   */
  const handleStatusChange = (e) => {
    setNewStatus(e.target.value);
  };

  /**
   * Handle status note change in modal
   * @param {Event} e - Change event
   */
  const handleStatusNoteChange = (e) => {
    setStatusNote(e.target.value);
  };

  /**
   * Submit status change
   */
  const handleSubmitStatusChange = async () => {
    if (!newStatus) {
      setAlertMessage('Please select a status');
      setAlertType('error');
      return;
    }

    try {
      await dispatch(updateEquipmentStatus({
        id: currentEquipment.id,
        status: newStatus,
        statusNote: statusNote
      })).unwrap();
      
      setAlertMessage('Equipment status updated successfully');
      setAlertType('success');
      handleCloseStatusModal();
      loadEquipmentData();
    } catch (error) {
      setAlertMessage(`Failed to update status: ${error.message}`);
      setAlertType('error');
    }
  };

  /**
   * Close alert message
   */
  const handleCloseAlert = () => {
    setAlertMessage(null);
  };

  /**
   * Change active tab
   * @param {string} tab - Tab name
   */
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  /**
   * Navigate to incident detail page
   * @param {string} incidentId - Incident ID
   */
  const handleViewIncident = (incidentId) => {
    navigate(`/incidents/${incidentId}`);
  };

  // Show loading state
  if (equipmentLoading && !currentEquipment) {
    return <Loader size="large" center />;
  }

  // Show error state
  if (equipmentError && !currentEquipment) {
    return (
      <Alert 
        type="error" 
        message={`Error loading equipment: ${equipmentError}`} 
        onClose={() => navigate('/equipment')}
      />
    );
  }

  // Show not found state
  if (!currentEquipment) {
    return (
      <Alert 
        type="warning" 
        message="Equipment not found" 
        onClose={() => navigate('/equipment')}
      />
    );
  }

  // Define columns for history table
  const historyColumns = [
    { id: 'date', label: 'Date', format: (value) => formatDate(value) },
    { id: 'status', label: 'Status' },
    { id: 'note', label: 'Note' },
    { id: 'updatedBy', label: 'Updated By' }
  ];

  // Define columns for incidents table
  const incidentColumns = [
    { id: 'id', label: 'ID' },
    { id: 'title', label: 'Title' },
    { id: 'status', label: 'Status' },
    { id: 'priority', label: 'Priority' },
    { id: 'createdAt', label: 'Created', format: (value) => formatDate(value) },
    { 
      id: 'actions', 
      label: 'Actions', 
      render: (row) => (
        <Button 
          size="small" 
          variant="outlined" 
          onClick={() => handleViewIncident(row.id)}
        >
          View
        </Button>
      ) 
    }
  ];

  // Get status badge color based on equipment status
  const getStatusColor = (status) => {
    switch (status) {
      case EQUIPMENT_STATUS.OPERATIONAL:
        return 'success';
      case EQUIPMENT_STATUS.MAINTENANCE:
        return 'warning';
      case EQUIPMENT_STATUS.BROKEN:
        return 'error';
      case EQUIPMENT_STATUS.RETIRED:
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <div className="equipment-detail-page">
      {alertMessage && (
        <Alert
          type={alertType}
          message={alertMessage}
          onClose={handleCloseAlert}
        />
      )}

      <div className="page-header">
        <div className="page-title">
          <Button 
            variant="text" 
            onClick={handleBackToList}
            startIcon="arrow_back"
          >
            Back to Equipment List
          </Button>
          <h1>{currentEquipment.name}</h1>
        </div>
        
        <div className="page-actions">
          {canEditEquipment && (
            <>
              <Button 
                variant="outlined" 
                color="primary" 
                onClick={() => handleOpenStatusModal(currentEquipment.status)}
                startIcon="update"
              >
                Update Status
              </Button>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleEditEquipment}
                startIcon="edit"
              >
                Edit Equipment
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="tab-navigation">
        <Button 
          variant={activeTab === 'details' ? 'contained' : 'text'} 
          onClick={() => handleTabChange('details')}
        >
          Details
        </Button>
        <Button 
          variant={activeTab === 'history' ? 'contained' : 'text'} 
          onClick={() => handleTabChange('history')}
        >
          Status History
        </Button>
        <Button 
          variant={activeTab === 'incidents' ? 'contained' : 'text'} 
          onClick={() => handleTabChange('incidents')}
        >
          Related Incidents
        </Button>
      </div>

      {activeTab === 'details' && (
        <div className="equipment-details">
          <Card>
            <div className="equipment-header">
              <h2>Equipment Information</h2>
              <div className={`status-badge status-${getStatusColor(currentEquipment.status)}`}>
                {currentEquipment.status}
              </div>
            </div>
            
            <div className="equipment-info-grid">
              <div className="info-group">
                <h3>Basic Information</h3>
                <div className="info-row">
                  <span className="info-label">ID:</span>
                  <span className="info-value">{currentEquipment.id}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Type:</span>
                  <span className="info-value">{currentEquipment.type}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Model:</span>
                  <span className="info-value">{currentEquipment.model}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Serial Number:</span>
                  <span className="info-value">{currentEquipment.serialNumber}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Manufacturer:</span>
                  <span className="info-value">{currentEquipment.manufacturer}</span>
                </div>
              </div>
              
              <div className="info-group">
                <h3>Location & Assignment</h3>
                <div className="info-row">
                  <span className="info-label">Location:</span>
                  <span className="info-value">{currentEquipment.location}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Department:</span>
                  <span className="info-value">{currentEquipment.department}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Assigned To:</span>
                  <span className="info-value">{currentEquipment.assignedTo || 'Not assigned'}</span>
                </div>
              </div>
              
              <div className="info-group">
                <h3>Dates</h3>
                <div className="info-row">
                  <span className="info-label">Purchase Date:</span>
                  <span className="info-value">{formatDate(currentEquipment.purchaseDate)}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Warranty Until:</span>
                  <span className="info-value">
                    {currentEquipment.warrantyExpiration 
                      ? formatDate(currentEquipment.warrantyExpiration) 
                      : 'No warranty'}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Last Maintenance:</span>
                  <span className="info-value">
                    {currentEquipment.lastMaintenanceDate 
                      ? formatDate(currentEquipment.lastMaintenanceDate) 
                      : 'No maintenance recorded'}
                  </span>
                </div>
              </div>
            </div>
            
            {currentEquipment.specifications && (
              <div className="specifications-section">
                <h3>Specifications</h3>
                <div className="specifications-content">
                  {Object.entries(currentEquipment.specifications).map(([key, value]) => (
                    <div className="spec-item" key={key}>
                      <span className="spec-label">{key}:</span>
                      <span className="spec-value">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {currentEquipment.notes && (
              <div className="notes-section">
                <h3>Notes</h3>
                <p>{currentEquipment.notes}</p>
              </div>
            )}
          </Card>
        </div>
      )}

      {activeTab === 'history' && (
        <Card>
          <h2>Status History</h2>
          {currentEquipment.statusHistory && currentEquipment.statusHistory.length > 0 ? (
            <Table 
              columns={historyColumns}
              data={currentEquipment.statusHistory}
              keyField="date"
            />
          ) : (
            <p className="no-data-message">No status history available</p>
          )}
        </Card>
      )}

      {activeTab === 'incidents' && (
        <Card>
          <h2>Related Incidents</h2>
          {incidentsLoading ? (
            <Loader size="medium" />
          ) : relatedIncidents && relatedIncidents.length > 0 ? (
            <Table 
              columns={incidentColumns}
              data={relatedIncidents}
              keyField="id"
            />
          ) : (
            <p className="no-data-message">No incidents related to this equipment</p>
          )}
        </Card>
      )}

      {/* Status Update Modal */}
      <Modal
        open={showStatusModal}
        onClose={handleCloseStatusModal}
        title="Update Equipment Status"
        actions={
          <>
            <Button variant="text" onClick={handleCloseStatusModal}>
              Cancel
            </Button>
            <Button variant="contained" color="primary" onClick={handleSubmitStatusChange}>
              Update Status
            </Button>
          </>
        }
      >
        <div className="status-form">
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              value={newStatus}
              onChange={handleStatusChange}
              className="form-control"
            >
              <option value="">Select Status</option>
              {Object.values(EQUIPMENT_STATUS).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="statusNote">Note (optional)</label>
            <textarea
              id="statusNote"
              value={statusNote}
              onChange={handleStatusNoteChange}
              className="form-control"
              rows={4}
              placeholder="Add a note about this status change"
            />
          </div>
        </div>
      </Modal>

      <style jsx>{`
        .equipment-detail-page {
          padding: 20px;
        }
        
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .page-title {
          display: flex;
          flex-direction: column;
        }
        
        .page-title h1 {
          margin: 10px 0;
          font-size: 24px;
        }
        
        .page-actions {
          display: flex;
          gap: 10px;
        }
        
        .tab-navigation {
          display: flex;
          margin-bottom: 20px;
          border-bottom: 1px solid #e0e0e0;
        }
        
        .equipment-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .status-badge {
          padding: 6px 12px;
          border-radius: 16px;
          font-weight: 500;
          font-size: 14px;
        }
        
        .status-success {
          background-color: #e6f7ed;
          color: #0a7d33;
        }
        
        .status-warning {
          background-color: #fff8e6;
          color: #b76e00;
        }
        
        .status-error {
          background-color: #fdeded;
          color: #d32f2f;
        }
        
        .status-secondary {
          background-color: #eeeef0;
          color: #616161;
        }
        
        .status-default {
          background-color: #f5f5f5;
          color: #757575;
        }
        
        .equipment-info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .info-group {
          margin-bottom: 20px;
        }
        
        .info-group h3 {
          font-size: 16px;
          margin-bottom: 10px;
          color: #555;
          border-bottom: 1px solid #eee;
          padding-bottom: 5px;
        }
        
        .info-row {
          display: flex;
          margin-bottom: 8px;
        }
        
        .info-label {
          font-weight: 500;
          width: 140px;
          color: #666;
        }
        
        .specifications-section,
        .notes-section {
          margin-top: 20px;
          border-top: 1px solid #eee;
          padding-top: 20px;
        }
        
        .specifications-content {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 10px;
        }
        
        .spec-item {
          display: flex;
        }
        
        .spec-label {
          font-weight: 500;
          margin-right: 8px;
          color: #666;
        }
        
        .no-data-message {
          padding: 20px;
          text-align: center;
          color: #757575;
          font-style: italic;
        }
        
        .status-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
        }
        
        .form-group label {
          margin-bottom: 8px;
          font-weight: 500;
        }
        
        .form-control {
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 16px;
        }
        
        select.form-control {
          height: 42px;
        }
      `}</style>
    </div>
  );
};

export default EquipmentDetailPage;