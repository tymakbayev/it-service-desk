import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { FaEdit, FaTrash, FaArrowLeft, FaHistory, FaFileDownload, FaQrCode } from 'react-icons/fa';

import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Loader from '../../../components/common/Loader';
import Alert from '../../../components/common/Alert';
import Modal from '../../../components/common/Modal';
import Table from '../../../components/common/Table';

import { getEquipmentById, deleteEquipment, generateEquipmentQRCode, getEquipmentHistory } from '../store/equipmentSlice';
import { EQUIPMENT_STATUSES, USER_ROLES } from '../../../utils/constants';
import { formatDate } from '../../../utils/dateUtils';

const DetailContainer = styled.div`
  padding: 20px;
`;

const DetailHeader = styled.div`
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

const DetailContent = styled.div`
  margin-bottom: 30px;
`;

const DetailSection = styled.div`
  margin-bottom: 30px;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  color: #333;
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
`;

const DetailRow = styled.div`
  display: flex;
  margin-bottom: 15px;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const DetailLabel = styled.div`
  width: 200px;
  font-weight: 600;
  color: #555;
  padding-right: 20px;
`;

const DetailValue = styled.div`
  flex: 1;
  color: #333;
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

const ButtonWithIcon = styled(Button)`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const QRCodeContainer = styled.div`
  margin-top: 20px;
  text-align: center;
  
  img {
    max-width: 200px;
    border: 1px solid #ddd;
    padding: 10px;
    background: white;
  }
`;

const TabContainer = styled.div`
  margin-top: 20px;
`;

const TabHeader = styled.div`
  display: flex;
  border-bottom: 1px solid #ddd;
  margin-bottom: 20px;
`;

const TabButton = styled.button`
  padding: 10px 20px;
  background: ${props => props.active ? '#f0f0f0' : 'transparent'};
  border: none;
  border-bottom: 2px solid ${props => props.active ? '#4a90e2' : 'transparent'};
  cursor: pointer;
  font-weight: ${props => props.active ? '600' : 'normal'};
  color: ${props => props.active ? '#333' : '#666'};
  
  &:hover {
    background: #f8f8f8;
  }
`;

const TabContent = styled.div`
  padding: 10px 0;
`;

const NoDataMessage = styled.div`
  text-align: center;
  padding: 30px;
  color: #666;
  font-style: italic;
`;

/**
 * Equipment Detail Component
 * 
 * This component displays detailed information about a specific equipment item.
 * It includes equipment specifications, status, history, and actions like edit and delete.
 */
const EquipmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { currentEquipment, loading, error, equipmentHistory, qrCodeData } = useSelector((state) => state.equipment);
  const { user } = useSelector((state) => state.auth);
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState('details');
  const [showQRCode, setShowQRCode] = useState(false);

  // Fetch equipment details when component mounts or ID changes
  useEffect(() => {
    if (id) {
      dispatch(getEquipmentById(id));
    }
    
    return () => {
      // Cleanup if needed
    };
  }, [dispatch, id]);

  // Load equipment history when switching to history tab
  useEffect(() => {
    if (activeTab === 'history' && id) {
      dispatch(getEquipmentHistory(id));
    }
  }, [activeTab, dispatch, id]);

  // Handle equipment deletion
  const handleDelete = () => {
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await dispatch(deleteEquipment(id)).unwrap();
      setSuccessMessage('Equipment deleted successfully');
      setDeleteModalOpen(false);
      
      // Navigate back to equipment list after short delay
      setTimeout(() => {
        navigate('/equipment');
      }, 1500);
    } catch (err) {
      console.error('Failed to delete equipment:', err);
    }
  };

  // Generate QR code for equipment
  const handleGenerateQRCode = () => {
    dispatch(generateEquipmentQRCode(id));
    setShowQRCode(true);
  };

  // Check if user has permission to edit/delete
  const canEditDelete = user && (
    user.role === USER_ROLES.ADMIN || 
    user.role === USER_ROLES.IT_SPECIALIST
  );

  // Render loading state
  if (loading && !currentEquipment) {
    return (
      <DetailContainer>
        <Loader />
      </DetailContainer>
    );
  }

  // Render error state
  if (error && !currentEquipment) {
    return (
      <DetailContainer>
        <Alert type="error" message={error} />
        <ButtonWithIcon onClick={() => navigate('/equipment')}>
          <FaArrowLeft /> Back to Equipment List
        </ButtonWithIcon>
      </DetailContainer>
    );
  }

  // Render success message if present
  if (successMessage) {
    return (
      <DetailContainer>
        <Alert type="success" message={successMessage} />
      </DetailContainer>
    );
  }

  // Render no data state
  if (!currentEquipment) {
    return (
      <DetailContainer>
        <Alert type="warning" message="Equipment not found" />
        <ButtonWithIcon onClick={() => navigate('/equipment')}>
          <FaArrowLeft /> Back to Equipment List
        </ButtonWithIcon>
      </DetailContainer>
    );
  }

  // Prepare history data for table
  const historyColumns = [
    { id: 'date', label: 'Date', format: (value) => formatDate(value) },
    { id: 'action', label: 'Action' },
    { id: 'user', label: 'User', format: (value) => value?.name || 'System' },
    { id: 'details', label: 'Details' }
  ];

  return (
    <DetailContainer>
      {/* Header with title and action buttons */}
      <DetailHeader>
        <div>
          <ButtonWithIcon variant="text" onClick={() => navigate('/equipment')}>
            <FaArrowLeft /> Back to Equipment List
          </ButtonWithIcon>
          <Title>{currentEquipment.name}</Title>
        </div>
        
        <ActionButtons>
          <ButtonWithIcon onClick={handleGenerateQRCode} variant="secondary">
            <FaQrCode /> Generate QR Code
          </ButtonWithIcon>
          
          {canEditDelete && (
            <>
              <ButtonWithIcon 
                onClick={() => navigate(`/equipment/edit/${id}`)}
                variant="primary"
              >
                <FaEdit /> Edit
              </ButtonWithIcon>
              
              <ButtonWithIcon 
                onClick={handleDelete}
                variant="danger"
              >
                <FaTrash /> Delete
              </ButtonWithIcon>
            </>
          )}
        </ActionButtons>
      </DetailHeader>

      {/* Tab navigation */}
      <TabContainer>
        <TabHeader>
          <TabButton 
            active={activeTab === 'details'} 
            onClick={() => setActiveTab('details')}
          >
            Details
          </TabButton>
          <TabButton 
            active={activeTab === 'history'} 
            onClick={() => setActiveTab('history')}
          >
            History
          </TabButton>
        </TabHeader>

        <TabContent>
          {activeTab === 'details' && (
            <Card>
              <DetailContent>
                <DetailSection>
                  <SectionTitle>General Information</SectionTitle>
                  
                  <DetailRow>
                    <DetailLabel>Name</DetailLabel>
                    <DetailValue>{currentEquipment.name}</DetailValue>
                  </DetailRow>
                  
                  <DetailRow>
                    <DetailLabel>Type</DetailLabel>
                    <DetailValue>{currentEquipment.type}</DetailValue>
                  </DetailRow>
                  
                  <DetailRow>
                    <DetailLabel>Serial Number</DetailLabel>
                    <DetailValue>{currentEquipment.serialNumber}</DetailValue>
                  </DetailRow>
                  
                  <DetailRow>
                    <DetailLabel>Manufacturer</DetailLabel>
                    <DetailValue>{currentEquipment.manufacturer}</DetailValue>
                  </DetailRow>
                  
                  <DetailRow>
                    <DetailLabel>Model</DetailLabel>
                    <DetailValue>{currentEquipment.model || 'N/A'}</DetailValue>
                  </DetailRow>
                </DetailSection>

                <DetailSection>
                  <SectionTitle>Status & Location</SectionTitle>
                  
                  <DetailRow>
                    <DetailLabel>Status</DetailLabel>
                    <DetailValue>
                      <StatusBadge status={currentEquipment.status}>
                        {currentEquipment.status}
                      </StatusBadge>
                    </DetailValue>
                  </DetailRow>
                  
                  <DetailRow>
                    <DetailLabel>Location</DetailLabel>
                    <DetailValue>{currentEquipment.location}</DetailValue>
                  </DetailRow>
                  
                  <DetailRow>
                    <DetailLabel>Assigned To</DetailLabel>
                    <DetailValue>
                      {currentEquipment.assignedTo ? currentEquipment.assignedTo.name : 'Not assigned'}
                    </DetailValue>
                  </DetailRow>
                </DetailSection>

                <DetailSection>
                  <SectionTitle>Dates & Warranty</SectionTitle>
                  
                  <DetailRow>
                    <DetailLabel>Purchase Date</DetailLabel>
                    <DetailValue>{formatDate(currentEquipment.purchaseDate)}</DetailValue>
                  </DetailRow>
                  
                  <DetailRow>
                    <DetailLabel>Warranty Expiry</DetailLabel>
                    <DetailValue>
                      {currentEquipment.warrantyExpiryDate 
                        ? formatDate(currentEquipment.warrantyExpiryDate) 
                        : 'No warranty information'}
                    </DetailValue>
                  </DetailRow>
                  
                  <DetailRow>
                    <DetailLabel>Last Maintenance</DetailLabel>
                    <DetailValue>
                      {currentEquipment.lastMaintenanceDate 
                        ? formatDate(currentEquipment.lastMaintenanceDate) 
                        : 'No maintenance recorded'}
                    </DetailValue>
                  </DetailRow>
                </DetailSection>

                <DetailSection>
                  <SectionTitle>Additional Information</SectionTitle>
                  
                  <DetailRow>
                    <DetailLabel>Description</DetailLabel>
                    <DetailValue>
                      {currentEquipment.description || 'No description provided'}
                    </DetailValue>
                  </DetailRow>
                  
                  <DetailRow>
                    <DetailLabel>Notes</DetailLabel>
                    <DetailValue>
                      {currentEquipment.notes || 'No notes available'}
                    </DetailValue>
                  </DetailRow>
                </DetailSection>

                {showQRCode && qrCodeData && (
                  <DetailSection>
                    <SectionTitle>QR Code</SectionTitle>
                    <QRCodeContainer>
                      <img src={qrCodeData} alt="Equipment QR Code" />
                      <div>
                        <ButtonWithIcon 
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = qrCodeData;
                            link.download = `equipment-${currentEquipment._id}.png`;
                            link.click();
                          }}
                          variant="secondary"
                          style={{ marginTop: '10px' }}
                        >
                          <FaFileDownload /> Download QR Code
                        </ButtonWithIcon>
                      </div>
                    </QRCodeContainer>
                  </DetailSection>
                )}
              </DetailContent>
            </Card>
          )}

          {activeTab === 'history' && (
            <Card>
              <DetailSection>
                <SectionTitle>Equipment History</SectionTitle>
                
                {loading && <Loader />}
                
                {!loading && equipmentHistory && equipmentHistory.length > 0 ? (
                  <Table 
                    columns={historyColumns}
                    data={equipmentHistory}
                    keyField="_id"
                  />
                ) : (
                  <NoDataMessage>
                    {!loading && 'No history records found for this equipment'}
                  </NoDataMessage>
                )}
              </DetailSection>
            </Card>
          )}
        </TabContent>
      </TabContainer>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Deletion"
      >
        <p>Are you sure you want to delete this equipment? This action cannot be undone.</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
          <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </DetailContainer>
  );
};

export default EquipmentDetail;