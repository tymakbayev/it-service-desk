import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import { 
  FaEdit, 
  FaTrash, 
  FaHistory, 
  FaComments, 
  FaFileDownload, 
  FaUserCog,
  FaExclamationTriangle,
  FaCheck,
  FaArrowLeft
} from 'react-icons/fa';
import { format } from 'date-fns';

// Components
import Layout from '../../../components/Layout';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Loader from '../../../components/common/Loader';
import Modal from '../../../components/common/Modal';
import IncidentStatusBadge from '../components/IncidentStatusBadge';
import Alert from '../../../components/common/Alert';

// Store
import { 
  fetchIncidentById, 
  updateIncidentStatus, 
  updateIncident,
  deleteIncident,
  addIncidentComment
} from '../store/incidentsSlice';

// Hooks
import useAuth from '../../../hooks/useAuth';

// Utils
import { formatDate, formatDateTime } from '../../../utils/dateUtils';
import { INCIDENT_STATUSES, INCIDENT_PRIORITIES, USER_ROLES } from '../../../utils/constants';

// Styled components
const PageContainer = styled.div`
  padding: 1.5rem;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const PageTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
`;

const BackButton = styled(Button)`
  margin-right: 1rem;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const IncidentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const IncidentTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
  flex: 1;
`;

const IncidentMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 0.5rem;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  color: #4a5568;
`;

const MetaLabel = styled.span`
  font-weight: 600;
  margin-right: 0.5rem;
`;

const MetaValue = styled.span``;

const IncidentContent = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  
  @media (min-width: 768px) {
    grid-template-columns: 2fr 1fr;
  }
`;

const IncidentDescription = styled.div`
  white-space: pre-line;
  line-height: 1.6;
  color: #4a5568;
`;

const IncidentSidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SidebarSection = styled.div`
  margin-bottom: 1.5rem;
`;

const SidebarTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 0.75rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
`;

const CommentsList = styled.div`
  margin-top: 2rem;
`;

const CommentItem = styled.div`
  padding: 1rem;
  background-color: #f7fafc;
  border-radius: 0.375rem;
  margin-bottom: 1rem;
`;

const CommentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
`;

const CommentAuthor = styled.div`
  font-weight: 600;
  color: #2d3748;
`;

const CommentDate = styled.div`
  font-size: 0.75rem;
  color: #718096;
`;

const CommentText = styled.div`
  white-space: pre-line;
  color: #4a5568;
`;

const AttachmentsList = styled.div`
  margin-top: 0.5rem;
`;

const AttachmentItem = styled.div`
  display: flex;
  align-items: center;
  padding: 0.5rem;
  background-color: #f7fafc;
  border-radius: 0.375rem;
  margin-bottom: 0.5rem;
`;

const AttachmentName = styled.div`
  margin-left: 0.5rem;
  flex: 1;
`;

const AttachmentDownload = styled.a`
  color: #3182ce;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`;

const HistoryList = styled.div`
  margin-top: 0.5rem;
`;

const HistoryItem = styled.div`
  padding: 0.75rem;
  background-color: #f7fafc;
  border-radius: 0.375rem;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
`;

const HistoryDate = styled.div`
  font-size: 0.75rem;
  color: #718096;
  margin-bottom: 0.25rem;
`;

const HistoryText = styled.div`
  color: #4a5568;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #2d3748;
`;

const StyledSelect = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  background-color: white;
  font-size: 1rem;
  transition: border-color 0.15s ease-in-out;

  &:focus {
    border-color: #4299e1;
    outline: none;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.5);
  }
`;

const StyledTextarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  background-color: white;
  font-size: 1rem;
  min-height: 100px;
  transition: border-color 0.15s ease-in-out;

  &:focus {
    border-color: #4299e1;
    outline: none;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.5);
  }
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1.5rem;
`;

const IncidentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  
  // Local state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignToUser, setAssignToUser] = useState('');
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [comment, setComment] = useState('');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [statusNote, setStatusNote] = useState('');

  // Redux state
  const { currentIncident, users, isUpdating, isDeleting } = useSelector((state) => ({
    currentIncident: state.incidents.currentIncident,
    users: state.users?.technicians || [],
    isUpdating: state.incidents.isUpdating,
    isDeleting: state.incidents.isDeleting
  }));

  // Fetch incident data
  useEffect(() => {
    const fetchIncidentData = async () => {
      setLoading(true);
      try {
        await dispatch(fetchIncidentById(id)).unwrap();
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to load incident details');
        toast.error(`Error: ${err.message || 'Failed to load incident details'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchIncidentData();
  }, [dispatch, id]);

  // Check if user can edit the incident
  const canEdit = useCallback(() => {
    if (!user || !currentIncident) return false;
    
    // Admin can edit all incidents
    if (user.role === USER_ROLES.ADMIN) return true;
    
    // Support can edit assigned incidents
    if (user.role === USER_ROLES.SUPPORT && 
        currentIncident.assignedTo && 
        currentIncident.assignedTo._id === user.id) return true;
    
    // User can only edit their own incidents if they're in certain statuses
    if (user.role === USER_ROLES.USER && 
        currentIncident.createdBy && 
        currentIncident.createdBy._id === user.id && 
        ['NEW', 'OPEN'].includes(currentIncident.status)) {
      return true;
    }
    
    return false;
  }, [user, currentIncident]);

  // Check if user can delete the incident
  const canDelete = useCallback(() => {
    if (!user || !currentIncident) return false;
    
    // Admin can delete all incidents
    if (user.role === USER_ROLES.ADMIN) return true;
    
    // User can only delete their own incidents if they're in NEW status
    if (user.role === USER_ROLES.USER && 
        currentIncident.createdBy && 
        currentIncident.createdBy._id === user.id && 
        currentIncident.status === 'NEW') {
      return true;
    }
    
    return false;
  }, [user, currentIncident]);

  // Check if user can change status
  const canChangeStatus = useCallback(() => {
    if (!user || !currentIncident) return false;
    
    // Admin and support can change status
    if ([USER_ROLES.ADMIN, USER_ROLES.SUPPORT].includes(user.role)) {
      // Support can only change status of assigned incidents
      if (user.role === USER_ROLES.SUPPORT && 
          (!currentIncident.assignedTo || currentIncident.assignedTo._id !== user.id)) {
        return false;
      }
      return true;
    }
    
    // User can only change status in specific cases (e.g., cancel their own NEW incidents)
    if (user.role === USER_ROLES.USER && 
        currentIncident.createdBy && 
        currentIncident.createdBy._id === user.id && 
        currentIncident.status === 'NEW') {
      return true;
    }
    
    return false;
  }, [user, currentIncident]);

  // Check if user can assign the incident
  const canAssign = useCallback(() => {
    if (!user || !currentIncident) return false;
    
    // Only admin and support can assign incidents
    return [USER_ROLES.ADMIN, USER_ROLES.SUPPORT].includes(user.role);
  }, [user, currentIncident]);

  // Handle status change
  const handleStatusChange = async () => {
    if (!newStatus) {
      toast.error('Please select a status');
      return;
    }

    try {
      await dispatch(updateIncidentStatus({
        id: currentIncident._id,
        status: newStatus,
        statusNote: statusNote
      })).unwrap();
      
      toast.success(`Incident status updated to ${newStatus}`);
      setShowStatusModal(false);
      setNewStatus('');
      setStatusNote('');
    } catch (err) {
      toast.error(`Failed to update status: ${err.message}`);
    }
  };

  // Handle incident deletion
  const handleDelete = async () => {
    try {
      await dispatch(deleteIncident(currentIncident._id)).unwrap();
      toast.success('Incident deleted successfully');
      navigate('/incidents');
    } catch (err) {
      toast.error(`Failed to delete incident: ${err.message}`);
    }
  };

  // Handle incident assignment
  const handleAssign = async () => {
    if (!assignToUser) {
      toast.error('Please select a user to assign');
      return;
    }

    try {
      await dispatch(updateIncident({
        id: currentIncident._id,
        data: { assignedTo: assignToUser }
      })).unwrap();
      
      toast.success('Incident assigned successfully');
      setShowAssignModal(false);
      setAssignToUser('');
    } catch (err) {
      toast.error(`Failed to assign incident: ${err.message}`);
    }
  };

  // Handle adding a comment
  const handleAddComment = async () => {
    if (!comment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    try {
      await dispatch(addIncidentComment({
        incidentId: currentIncident._id,
        comment: comment.trim()
      })).unwrap();
      
      toast.success('Comment added successfully');
      setShowCommentModal(false);
      setComment('');
    } catch (err) {
      toast.error(`Failed to add comment: ${err.message}`);
    }
  };

  // Handle edit incident
  const handleEdit = () => {
    navigate(`/incidents/edit/${currentIncident._id}`);
  };

  // Handle download attachment
  const handleDownloadAttachment = (attachmentId, fileName) => {
    // Implementation depends on your API structure
    const downloadUrl = `/api/incidents/${currentIncident._id}/attachments/${attachmentId}`;
    
    // Create a temporary link element to trigger the download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <Layout>
        <PageContainer>
          <Loader size="large" text="Loading incident details..." />
        </PageContainer>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <PageContainer>
          <Alert type="error" message={error} />
          <Button onClick={() => navigate('/incidents')} leftIcon={<FaArrowLeft />}>
            Back to Incidents
          </Button>
        </PageContainer>
      </Layout>
    );
  }

  if (!currentIncident) {
    return (
      <Layout>
        <PageContainer>
          <Alert type="warning" message="Incident not found" />
          <Button onClick={() => navigate('/incidents')} leftIcon={<FaArrowLeft />}>
            Back to Incidents
          </Button>
        </PageContainer>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageContainer>
        <PageHeader>
          <div>
            <BackButton 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/incidents')}
              leftIcon={<FaArrowLeft />}
            >
              Back to Incidents
            </BackButton>
            <PageTitle>Incident Details</PageTitle>
          </div>
          <ActionButtons>
            {canChangeStatus() && (
              <Button 
                variant="primary" 
                onClick={() => {
                  setNewStatus(currentIncident.status);
                  setShowStatusModal(true);
                }}
              >
                Change Status
              </Button>
            )}
            {canEdit() && (
              <Button 
                variant="secondary" 
                leftIcon={<FaEdit />} 
                onClick={handleEdit}
              >
                Edit
              </Button>
            )}
            {canDelete() && (
              <Button 
                variant="danger" 
                leftIcon={<FaTrash />} 
                onClick={() => setShowDeleteModal(true)}
              >
                Delete
              </Button>
            )}
          </ActionButtons>
        </PageHeader>

        <Card>
          <IncidentHeader>
            <div>
              <IncidentTitle>
                #{currentIncident.ticketNumber} - {currentIncident.title}
              </IncidentTitle>
              <IncidentMeta>
                <MetaItem>
                  <MetaLabel>Status:</MetaLabel>
                  <IncidentStatusBadge status={currentIncident.status} />
                </MetaItem>
                <MetaItem>
                  <MetaLabel>Priority:</MetaLabel>
                  <MetaValue>{INCIDENT_PRIORITIES[currentIncident.priority]}</MetaValue>
                </MetaItem>
                <MetaItem>
                  <MetaLabel>Category:</MetaLabel>
                  <MetaValue>{currentIncident.category}</MetaValue>
                </MetaItem>
                <MetaItem>
                  <MetaLabel>Created:</MetaLabel>
                  <MetaValue>{formatDateTime(currentIncident.createdAt)}</MetaValue>
                </MetaItem>
                {currentIncident.equipment && (
                  <MetaItem>
                    <MetaLabel>Equipment:</MetaLabel>
                    <MetaValue>{currentIncident.equipment.name} ({currentIncident.equipment.serialNumber})</MetaValue>
                  </MetaItem>
                )}
              </IncidentMeta>
            </div>
          </IncidentHeader>

          <IncidentContent>
            <div>
              <SidebarTitle>Description</SidebarTitle>
              <IncidentDescription>{currentIncident.description}</IncidentDescription>

              {currentIncident.comments && currentIncident.comments.length > 0 && (
                <CommentsList>
                  <SidebarTitle>Comments ({currentIncident.comments.length})</SidebarTitle>
                  {currentIncident.comments.map((comment, index) => (
                    <CommentItem key={index}>
                      <CommentHeader>
                        <CommentAuthor>
                          {comment.user ? `${comment.user.firstName} ${comment.user.lastName}` : 'Unknown User'}
                        </CommentAuthor>
                        <CommentDate>{formatDateTime(comment.createdAt)}</CommentDate>
                      </CommentHeader>
                      <CommentText>{comment.text}</CommentText>
                    </CommentItem>
                  ))}
                </CommentsList>
              )}

              {currentIncident.attachments && currentIncident.attachments.length > 0 && (
                <SidebarSection>
                  <SidebarTitle>Attachments ({currentIncident.attachments.length})</SidebarTitle>
                  <AttachmentsList>
                    {currentIncident.attachments.map((attachment, index) => (
                      <AttachmentItem key={index}>
                        <FaFileDownload />
                        <AttachmentName>{attachment.fileName}</AttachmentName>
                        <AttachmentDownload 
                          onClick={() => handleDownloadAttachment(attachment._id, attachment.fileName)}
                        >
                          Download
                        </AttachmentDownload>
                      </AttachmentItem>
                    ))}
                  </AttachmentsList>
                </SidebarSection>
              )}
            </div>

            <IncidentSidebar>
              <SidebarSection>
                <SidebarTitle>Details</SidebarTitle>
                <MetaItem>
                  <MetaLabel>Reported by:</MetaLabel>
                  <MetaValue>
                    {currentIncident.createdBy 
                      ? `${currentIncident.createdBy.firstName} ${currentIncident.createdBy.lastName}` 
                      : 'Unknown'}
                  </MetaValue>
                </MetaItem>
                <MetaItem>
                  <MetaLabel>Assigned to:</MetaLabel>
                  <MetaValue>
                    {currentIncident.assignedTo 
                      ? `${currentIncident.assignedTo.firstName} ${currentIncident.assignedTo.lastName}` 
                      : 'Unassigned'}
                  </MetaValue>
                </MetaItem>
                {canAssign() && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    leftIcon={<FaUserCog />} 
                    onClick={() => setShowAssignModal(true)}
                    style={{ marginTop: '0.5rem' }}
                  >
                    {currentIncident.assignedTo ? 'Reassign' : 'Assign'}
                  </Button>
                )}
              </SidebarSection>

              <SidebarSection>
                <SidebarTitle>Actions</SidebarTitle>
                <Button 
                  variant="outline" 
                  size="sm" 
                  leftIcon={<FaComments />} 
                  onClick={() => setShowCommentModal(true)}
                  style={{ marginBottom: '0.5rem', width: '100%' }}
                >
                  Add Comment
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  leftIcon={<FaHistory />} 
                  onClick={() => setShowHistoryModal(true)}
                  style={{ width: '100%' }}
                >
                  View History
                </Button>
              </SidebarSection>

              {currentIncident.history && currentIncident.history.length > 0 && (
                <SidebarSection>
                  <SidebarTitle>Recent Activity</SidebarTitle>
                  <HistoryList>
                    {currentIncident.history.slice(0, 3).map((item, index) => (
                      <HistoryItem key={index}>
                        <HistoryDate>{formatDateTime(item.timestamp)}</HistoryDate>
                        <HistoryText>{item.description}</HistoryText>
                      </HistoryItem>
                    ))}
                    {currentIncident.history.length > 3 && (
                      <Button 
                        variant="text" 
                        size="sm" 
                        onClick={() => setShowHistoryModal(true)}
                      >
                        View all activity
                      </Button>
                    )}
                  </HistoryList>
                </SidebarSection>
              )}
            </IncidentSidebar>
          </IncidentContent>
        </Card>

        {/* Status Change Modal */}
        <Modal
          isOpen={showStatusModal}
          onClose={() => setShowStatusModal(false)}
          title="Change Incident Status"
        >
          <FormGroup>
            <Label htmlFor="status">New Status</Label>
            <StyledSelect
              id="status"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <option value="">Select Status</option>
              {Object.entries(INCIDENT_STATUSES).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </StyledSelect>
          </FormGroup>
          <FormGroup>
            <Label htmlFor="statusNote">Status Note (Optional)</Label>
            <StyledTextarea
              id="statusNote"
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              placeholder="Add a note about this status change"
            />
          </FormGroup>
          <ModalActions>
            <Button 
              variant="outline" 
              onClick={() => setShowStatusModal(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleStatusChange}
              isLoading={isUpdating}
              leftIcon={<FaCheck />}
            >
              Update Status
            </Button>
          </ModalActions>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete Incident"
        >
          <Alert 
            type="warning" 
            message="Are you sure you want to delete this incident? This action cannot be undone."
            icon={<FaExclamationTriangle />}
          />
          <ModalActions>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={handleDelete}
              isLoading={isDeleting}
              leftIcon={<FaTrash />}
            >
              Delete
            </Button>
          </ModalActions>
        </Modal>

        {/* Assign Modal */}
        <Modal
          isOpen={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          title="Assign Incident"
        >
          <FormGroup>
            <Label htmlFor="assignTo">Assign To</Label>
            <StyledSelect
              id="assignTo"
              value={assignToUser}
              onChange={(e) => setAssignToUser(e.target.value)}
            >
              <option value="">Select User</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.firstName} {user.lastName} ({user.email})
                </option>
              ))}
            </StyledSelect>
          </FormGroup>
          <ModalActions>
            <Button 
              variant="outline" 
              onClick={() => setShowAssignModal(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleAssign}
              isLoading={isUpdating}
              leftIcon={<FaUserCog />}
            >
              Assign
            </Button>
          </ModalActions>
        </Modal>

        {/* Add Comment Modal */}
        <Modal
          isOpen={showCommentModal}
          onClose={() => setShowCommentModal(false)}
          title="Add Comment"
        >
          <FormGroup>
            <Label htmlFor="comment">Comment</Label>
            <StyledTextarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Enter your comment here"
            />
          </FormGroup>
          <ModalActions>
            <Button 
              variant="outline" 
              onClick={() => setShowCommentModal(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleAddComment}
              isLoading={isUpdating}
              leftIcon={<FaComments />}
            >
              Add Comment
            </Button>
          </ModalActions>
        </Modal>

        {/* History Modal */}
        <Modal
          isOpen={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
          title="Incident History"
          size="large"
        >
          {currentIncident.history && currentIncident.history.length > 0 ? (
            <HistoryList>
              {currentIncident.history.map((item, index) => (
                <HistoryItem key={index}>
                  <HistoryDate>{formatDateTime(item.timestamp)}</HistoryDate>
                  <HistoryText>{item.description}</HistoryText>
                  {item.user && (
                    <HistoryText>
                      By: {item.user.firstName} {item.user.lastName}
                    </HistoryText>
                  )}
                </HistoryItem>
              ))}
            </HistoryList>
          ) : (
            <Alert type="info" message="No history available for this incident" />
          )}
          <ModalActions>
            <Button 
              variant="primary" 
              onClick={() => setShowHistoryModal(false)}
            >
              Close
            </Button>
          </ModalActions>
        </Modal>
      </PageContainer>
    </Layout>
  );
};

export default IncidentDetailPage;