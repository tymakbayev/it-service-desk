import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { 
  fetchEquipmentById, 
  updateEquipmentStatus,
  resetEquipmentDetail
} from '../equipmentSlice';
import { fetchIncidentsByEquipmentId } from '../../incidents/store/incidentsSlice';
import { Card, Button, Modal, Alert, Loader, Table } from '../../../components/common';
import Layout from '../../../components/Layout';
import { useAuth } from '../../../hooks/useAuth';
import { ROLES, EQUIPMENT_STATUS, EQUIPMENT_TYPES } from '../../../utils/constants';
import { formatDate, formatDateTime } from '../../../utils/dateUtils';

const PageContainer = styled.div`
  padding: 20px;
`;

const EquipmentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const EquipmentTitle = styled.h1`
  font-size: 24px;
  margin: 0;
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 500;
  background-color: ${props => {
    switch (props.status) {
      case EQUIPMENT_STATUS.AVAILABLE:
        return '#4caf50';
      case EQUIPMENT_STATUS.IN_USE:
        return '#2196f3';
      case EQUIPMENT_STATUS.MAINTENANCE:
        return '#ff9800';
      case EQUIPMENT_STATUS.REPAIR:
        return '#f44336';
      case EQUIPMENT_STATUS.RETIRED:
        return '#9e9e9e';
      default:
        return '#9e9e9e';
    }
  }};
  color: white;
`;

const TabContainer = styled.div`
  margin-bottom: 20px;
`;

const TabButton = styled.button`
  padding: 10px 20px;
  background-color: ${props => props.active ? '#4a90e2' : '#f5f5f5'};
  color: ${props => props.active ? 'white' : '#333'};
  border: none;
  border-radius: 4px;
  margin-right: 10px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => props.active ? '#4a90e2' : '#e0e0e0'};
  }
`;

const DetailSection = styled.div`
  margin-bottom: 30px;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  margin-bottom: 15px;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const DetailItem = styled.div`
  margin-bottom: 15px;
`;

const DetailLabel = styled.div`
  font-weight: 500;
  color: #666;
  margin-bottom: 5px;
  font-size: 14px;
`;

const DetailValue = styled.div`
  font-size: 16px;
`;

const HistoryItem = styled.div`
  padding: 15px;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
`;

const HistoryDate = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
`;

const HistoryAction = styled.div`
  font-size: 16px;
`;

const HistoryNote = styled.div`
  font-size: 14px;
  color: #666;
  margin-top: 5px;
  font-style: italic;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
`;

const ModalContent = styled.div`
  padding: 20px;
`;

const ModalTitle = styled.h2`
  margin-bottom: 20px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  
  &:focus {
    outline: none;
    border-color: #4a90e2;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #4a90e2;
  }
`;

const NoDataMessage = styled.div`
  padding: 20px;
  text-align: center;
  color: #666;
`;

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
        id: currentEquipment._id,
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

  /**
   * Create new incident for this equipment
   */
  const handleCreateIncident = () => {
    navigate('/incidents/new', { 
      state: { 
        equipmentId: id,
        equipmentName: currentEquipment?.name
      } 
    });
  };

  // Render loading state
  if (equipmentLoading && !currentEquipment) {
    return (
      <Layout>
        <PageContainer>
          <Loader size="large" />
        </PageContainer>
      </Layout>
    );
  }

  // Render error state
  if (equipmentError && !currentEquipment) {
    return (
      <Layout>
        <PageContainer>
          <Alert 
            type="error" 
            message={`Error loading equipment: ${equipmentError}`} 
            onClose={handleCloseAlert}
          />
          <Button onClick={handleBackToList}>Back to Equipment List</Button>
        </PageContainer>
      </Layout>
    );
  }

  // Render if equipment not found
  if (!equipmentLoading && !currentEquipment) {
    return (
      <Layout>
        <PageContainer>
          <Alert 
            type="error" 
            message="Equipment not found" 
            onClose={handleCloseAlert}
          />
          <Button onClick={handleBackToList}>Back to Equipment List</Button>
        </PageContainer>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageContainer>
        {alertMessage && (
          <Alert 
            type={alertType} 
            message={alertMessage} 
            onClose={handleCloseAlert}
          />
        )}

        <EquipmentHeader>
          <EquipmentTitle>{currentEquipment.name}</EquipmentTitle>
          <ButtonGroup>
            <Button onClick={handleBackToList} variant="outlined">Back to List</Button>
            {canEditEquipment && (
              <>
                <Button onClick={handleOpenStatusModal} variant="outlined">Change Status</Button>
                <Button onClick={handleEditEquipment}>Edit Equipment</Button>
              </>
            )}
          </ButtonGroup>
        </EquipmentHeader>

        <Card>
          <TabContainer>
            <TabButton 
              active={activeTab === 'details'} 
              onClick={() => handleTabChange('details')}
            >
              Details
            </TabButton>
            <TabButton 
              active={activeTab === 'history'} 
              onClick={() => handleTabChange('history')}
            >
              History
            </TabButton>
            <TabButton 
              active={activeTab === 'incidents'} 
              onClick={() => handleTabChange('incidents')}
            >
              Related Incidents
            </TabButton>
          </TabContainer>

          {activeTab === 'details' && (
            <>
              <DetailSection>
                <SectionTitle>General Information</SectionTitle>
                <DetailGrid>
                  <DetailItem>
                    <DetailLabel>Status</DetailLabel>
                    <DetailValue>
                      <StatusBadge status={currentEquipment.status}>
                        {currentEquipment.status}
                      </StatusBadge>
                    </DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Type</DetailLabel>
                    <DetailValue>{currentEquipment.type}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Serial Number</DetailLabel>
                    <DetailValue>{currentEquipment.serialNumber}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Model</DetailLabel>
                    <DetailValue>{currentEquipment.model}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Manufacturer</DetailLabel>
                    <DetailValue>{currentEquipment.manufacturer}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Location</DetailLabel>
                    <DetailValue>{currentEquipment.location || 'Not specified'}</DetailValue>
                  </DetailItem>
                </DetailGrid>
              </DetailSection>

              <DetailSection>
                <SectionTitle>Dates</SectionTitle>
                <DetailGrid>
                  <DetailItem>
                    <DetailLabel>Purchase Date</DetailLabel>
                    <DetailValue>
                      {currentEquipment.purchaseDate 
                        ? formatDate(currentEquipment.purchaseDate) 
                        : 'Not specified'}
                    </DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Warranty Expiration</DetailLabel>
                    <DetailValue>
                      {currentEquipment.warrantyExpiration 
                        ? formatDate(currentEquipment.warrantyExpiration) 
                        : 'Not specified'}
                    </DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Created At</DetailLabel>
                    <DetailValue>{formatDateTime(currentEquipment.createdAt)}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Last Updated</DetailLabel>
                    <DetailValue>{formatDateTime(currentEquipment.updatedAt)}</DetailValue>
                  </DetailItem>
                </DetailGrid>
              </DetailSection>

              <DetailSection>
                <SectionTitle>Assignment</SectionTitle>
                <DetailGrid>
                  <DetailItem>
                    <DetailLabel>Assigned To</DetailLabel>
                    <DetailValue>
                      {currentEquipment.assignedTo || 'Not assigned'}
                    </DetailValue>
                  </DetailItem>
                </DetailGrid>
              </DetailSection>

              {currentEquipment.specifications && (
                <DetailSection>
                  <SectionTitle>Specifications</SectionTitle>
                  <DetailValue>
                    {currentEquipment.specifications.split('\n').map((line, index) => (
                      <p key={index}>{line}</p>
                    ))}
                  </DetailValue>
                </DetailSection>
              )}

              {currentEquipment.notes && (
                <DetailSection>
                  <SectionTitle>Notes</SectionTitle>
                  <DetailValue>
                    {currentEquipment.notes.split('\n').map((line, index) => (
                      <p key={index}>{line}</p>
                    ))}
                  </DetailValue>
                </DetailSection>
              )}
            </>
          )}

          {activeTab === 'history' && (
            <DetailSection>
              <SectionTitle>Status History</SectionTitle>
              {currentEquipment.statusHistory && currentEquipment.statusHistory.length > 0 ? (
                currentEquipment.statusHistory.map((history, index) => (
                  <HistoryItem key={index}>
                    <HistoryDate>{formatDateTime(history.date)}</HistoryDate>
                    <HistoryAction>
                      Status changed to <StatusBadge status={history.status}>{history.status}</StatusBadge>
                    </HistoryAction>
                    {history.note && (
                      <HistoryNote>Note: {history.note}</HistoryNote>
                    )}
                  </HistoryItem>
                ))
              ) : (
                <NoDataMessage>No status history available</NoDataMessage>
              )}
            </DetailSection>
          )}

          {activeTab === 'incidents' && (
            <DetailSection>
              <SectionTitle>Related Incidents</SectionTitle>
              <ButtonGroup style={{ marginBottom: '20px' }}>
                <Button onClick={handleCreateIncident}>Create New Incident</Button>
              </ButtonGroup>
              
              {incidentsLoading ? (
                <Loader />
              ) : relatedIncidents && relatedIncidents.length > 0 ? (
                <Table
                  columns={[
                    { key: 'id', header: 'ID' },
                    { key: 'title', header: 'Title' },
                    { key: 'status', header: 'Status' },
                    { key: 'priority', header: 'Priority' },
                    { key: 'createdAt', header: 'Created' },
                    { key: 'actions', header: 'Actions' }
                  ]}
                  data={relatedIncidents.map(incident => ({
                    id: incident._id.substring(0, 8),
                    title: incident.title,
                    status: incident.status,
                    priority: incident.priority,
                    createdAt: formatDate(incident.createdAt),
                    actions: (
                      <Button 
                        size="small" 
                        onClick={() => handleViewIncident(incident._id)}
                      >
                        View
                      </Button>
                    )
                  }))}
                />
              ) : (
                <NoDataMessage>No incidents reported for this equipment</NoDataMessage>
              )}
            </DetailSection>
          )}
        </Card>

        {/* Status Change Modal */}
        <Modal
          isOpen={showStatusModal}
          onClose={handleCloseStatusModal}
          title="Change Equipment Status"
        >
          <ModalContent>
            <FormGroup>
              <Label htmlFor="status">Status</Label>
              <Select
                id="status"
                value={newStatus}
                onChange={handleStatusChange}
              >
                <option value="">Select Status</option>
                {Object.values(EQUIPMENT_STATUS).map(status => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </Select>
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="statusNote">Note (Optional)</Label>
              <TextArea
                id="statusNote"
                value={statusNote}
                onChange={handleStatusNoteChange}
                placeholder="Add a note about this status change"
              />
            </FormGroup>
            
            <ButtonGroup>
              <Button onClick={handleCloseStatusModal} variant="outlined">
                Cancel
              </Button>
              <Button onClick={handleSubmitStatusChange}>
                Update Status
              </Button>
            </ButtonGroup>
          </ModalContent>
        </Modal>
      </PageContainer>
    </Layout>
  );
};

export default EquipmentDetailPage;