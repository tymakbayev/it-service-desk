import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { 
  FaEdit, 
  FaTrash, 
  FaHistory, 
  FaComments, 
  FaFileDownload, 
  FaUserCog,
  FaExclamationTriangle,
  FaCheck
} from 'react-icons/fa';

// Components
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

  // Redux state
  const { currentIncident, users } = useSelector((state) => ({
    currentIncident: state.incidents.currentIncident,
    users: state.users.users
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
    if (user.role === USER_ROLES.SUPPORT && currentIncident.assignedTo?._id === user.id) return true;
    
    // User can only edit their own incidents if they're in certain statuses
    if (user.role === USER_ROLES.USER && 
        currentIncident.createdBy?._id === user.id && 
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
        currentIncident.createdBy?._id === user.id && 
        currentIncident.status === 'NEW') {
      return true;
    }
    
    return false;
  }, [user, currentIncident]);

  // Check if user can change status
  const canChangeStatus = useCallback(() => {
    if (!user || !currentIncident) return false;
    
    // Admin and support can change status
    if ([USER_ROLES.ADMIN, USER_ROLES.SUPPORT].includes(user.role)) return true;
    
    // User can only change status of their own incidents and only to CANCELLED
    if (user.role === USER_ROLES.USER && 
        currentIncident.createdBy?._id === user.id && 
        ['NEW', 'OPEN'].includes(currentIncident.status)) {
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
    if (!currentIncident || !newStatus) return;
    
    try {
      await dispatch(updateIncidentStatus({
        id: currentIncident._id,
        status: newStatus,
        comment: `Status changed to ${newStatus}`
      })).unwrap();
      
      toast.success(`Incident status updated to ${newStatus}`);
      setShowStatusModal(false);
      setNewStatus('');
    } catch (err) {
      toast.error(`Failed to update status: ${err.message}`);
    }
  };

  // Handle incident deletion
  const handleDelete = async () => {
    if (!currentIncident) return;
    
    try {
      await dispatch(deleteIncident(currentIncident._id)).unwrap();
      toast.success('Incident deleted successfully');
      navigate('/incidents');
    } catch (err) {
      toast.error(`Failed to delete incident: ${err.message}`);
    } finally {
      setShowDeleteModal(false);
    }
  };

  // Handle incident assignment
  const handleAssign = async () => {
    if (!currentIncident || !assignToUser) return;
    
    try {
      await dispatch(updateIncident({
        id: currentIncident._id,
        data: {
          assignedTo: assignToUser,
          status: currentIncident.status === 'NEW' ? 'OPEN' : currentIncident.status
        },
        comment: `Incident assigned to ${users.find(u => u._id === assignToUser)?.username || 'another user'}`
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
    if (!currentIncident || !comment.trim()) return;
    
    try {
      await dispatch(addIncidentComment({
        id: currentIncident._id,
        comment: comment.trim()
      })).unwrap();
      
      toast.success('Comment added successfully');
      setShowCommentModal(false);
      setComment('');
    } catch (err) {
      toast.error(`Failed to add comment: ${err.message}`);
    }
  };

  // Navigate to edit page
  const handleEdit = () => {
    navigate(`/incidents/edit/${id}`);
  };

  // Generate and download incident report
  const handleDownloadReport = async () => {
    if (!currentIncident) return;
    
    try {
      // This would typically call an API endpoint that returns a file
      // For now, we'll just show a success message
      toast.info('Report download functionality will be implemented soon');
    } catch (err) {
      toast.error(`Failed to download report: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert 
        type="error" 
        title="Error Loading Incident" 
        message={error}
        action={{
          label: "Go Back",
          onClick: () => navigate('/incidents')
        }}
      />
    );
  }

  if (!currentIncident) {
    return (
      <Alert 
        type="warning" 
        title="Incident Not Found" 
        message="The requested incident could not be found or you don't have permission to view it."
        action={{
          label: "Go Back",
          onClick: () => navigate('/incidents')
        }}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            Incident #{currentIncident.ticketNumber}
          </h1>
          <p className="text-gray-600">
            Created on {formatDateTime(currentIncident.createdAt)}
          </p>
        </div>
        <div className="flex space-x-2">
          {canEdit() && (
            <Button 
              variant="primary" 
              onClick={handleEdit}
              icon={<FaEdit />}
            >
              Edit
            </Button>
          )}
          {canDelete() && (
            <Button 
              variant="danger" 
              onClick={() => setShowDeleteModal(true)}
              icon={<FaTrash />}
            >
              Delete
            </Button>
          )}
          <Button 
            variant="secondary" 
            onClick={handleDownloadReport}
            icon={<FaFileDownload />}
          >
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main incident details */}
        <div className="md:col-span-2">
          <Card className="mb-6">
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-4">{currentIncident.title}</h2>
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex items-center">
                  <span className="text-gray-600 mr-2">Status:</span>
                  <IncidentStatusBadge status={currentIncident.status} />
                </div>
                <div>
                  <span className="text-gray-600 mr-2">Priority:</span>
                  <span className={`font-medium ${
                    currentIncident.priority === 'HIGH' ? 'text-red-600' : 
                    currentIncident.priority === 'MEDIUM' ? 'text-yellow-600' : 
                    'text-green-600'
                  }`}>
                    {currentIncident.priority}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 mr-2">Category:</span>
                  <span className="font-medium">{currentIncident.category}</span>
                </div>
              </div>
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Description</h3>
                <p className="text-gray-800 whitespace-pre-line">{currentIncident.description}</p>
              </div>
              {currentIncident.resolution && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-2">Resolution</h3>
                  <p className="text-gray-800 whitespace-pre-line">{currentIncident.resolution}</p>
                </div>
              )}
              {currentIncident.equipment && currentIncident.equipment.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-2">Related Equipment</h3>
                  <ul className="list-disc list-inside">
                    {currentIncident.equipment.map(item => (
                      <li key={item._id} className="mb-1">
                        <a 
                          href={`/equipment/${item._id}`} 
                          className="text-blue-600 hover:underline"
                        >
                          {item.name} ({item.inventoryNumber})
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Card>

          {/* Comments section */}
          <Card className="mb-6">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Comments & Activity</h3>
                <Button 
                  variant="secondary" 
                  size="small"
                  onClick={() => setShowCommentModal(true)}
                  icon={<FaComments />}
                >
                  Add Comment
                </Button>
              </div>
              
              {currentIncident.comments && currentIncident.comments.length > 0 ? (
                <div className="space-y-4">
                  {currentIncident.comments.map((comment, index) => (
                    <div key={index} className="border-b border-gray-200 pb-4 last:border-0">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium">
                          {comment.user?.username || 'System'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDateTime(comment.createdAt)}
                        </div>
                      </div>
                      <p className="text-gray-800">{comment.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No comments yet</p>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar with actions and metadata */}
        <div className="md:col-span-1">
          {/* Actions card */}
          <Card className="mb-6">
            <div className="p-4">
              <h3 className="text-lg font-medium mb-4">Actions</h3>
              <div className="space-y-3">
                {canChangeStatus() && (
                  <Button 
                    variant="primary" 
                    fullWidth
                    onClick={() => setShowStatusModal(true)}
                    icon={<FaExclamationTriangle />}
                  >
                    Change Status
                  </Button>
                )}
                {canAssign() && (
                  <Button 
                    variant="secondary" 
                    fullWidth
                    onClick={() => setShowAssignModal(true)}
                    icon={<FaUserCog />}
                  >
                    Assign Incident
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  fullWidth
                  onClick={() => setShowHistoryModal(true)}
                  icon={<FaHistory />}
                >
                  View History
                </Button>
              </div>
            </div>
          </Card>

          {/* Metadata card */}
          <Card>
            <div className="p-4">
              <h3 className="text-lg font-medium mb-4">Details</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-gray-600 text-sm">Created By</p>
                  <p className="font-medium">
                    {currentIncident.createdBy?.username || 'Unknown User'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Assigned To</p>
                  <p className="font-medium">
                    {currentIncident.assignedTo?.username || 'Not Assigned'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Created On</p>
                  <p className="font-medium">{formatDate(currentIncident.createdAt)}</p>
                </div>
                {currentIncident.updatedAt && (
                  <div>
                    <p className="text-gray-600 text-sm">Last Updated</p>
                    <p className="font-medium">{formatDate(currentIncident.updatedAt)}</p>
                  </div>
                )}
                {currentIncident.dueDate && (
                  <div>
                    <p className="text-gray-600 text-sm">Due Date</p>
                    <p className={`font-medium ${
                      new Date(currentIncident.dueDate) < new Date() ? 'text-red-600' : ''
                    }`}>
                      {formatDate(currentIncident.dueDate)}
                    </p>
                  </div>
                )}
                {currentIncident.resolvedAt && (
                  <div>
                    <p className="text-gray-600 text-sm">Resolved On</p>
                    <p className="font-medium">{formatDate(currentIncident.resolvedAt)}</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Status Change Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Change Incident Status"
      >
        <div className="p-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              New Status
            </label>
            <select
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <option value="">Select a status</option>
              {Object.entries(INCIDENT_STATUSES)
                .filter(([key, value]) => {
                  // Filter available statuses based on user role and current status
                  if (user.role === USER_ROLES.USER) {
                    return key === 'CANCELLED' && ['NEW', 'OPEN'].includes(currentIncident.status);
                  }
                  
                  // Support and admin can set any status except for statuses that would be a step backward
                  const currentStatusIndex = Object.keys(INCIDENT_STATUSES).indexOf(currentIncident.status);
                  const newStatusIndex = Object.keys(INCIDENT_STATUSES).indexOf(key);
                  
                  // Allow any status change for admin
                  if (user.role === USER_ROLES.ADMIN) return true;
                  
                  // Support can't set a status back to NEW
                  if (user.role === USER_ROLES.SUPPORT && key === 'NEW') return false;
                  
                  return key !== currentIncident.status;
                })
                .map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))
              }
            </select>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="secondary"
              onClick={() => setShowStatusModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleStatusChange}
              disabled={!newStatus}
              icon={<FaCheck />}
            >
              Update Status
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Incident"
      >
        <div className="p-4">
          <p className="mb-4">
            Are you sure you want to delete this incident? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-2">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              icon={<FaTrash />}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Assign Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Assign Incident"
      >
        <div className="p-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Assign To
            </label>
            <select
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={assignToUser}
              onChange={(e) => setAssignToUser(e.target.value)}
            >
              <option value="">Select a user</option>
              {users
                .filter(u => [USER_ROLES.ADMIN, USER_ROLES.SUPPORT].includes(u.role))
                .map(user => (
                  <option key={user._id} value={user._id}>
                    {user.username} ({user.role})
                  </option>
                ))
              }
            </select>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="secondary"
              onClick={() => setShowAssignModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAssign}
              disabled={!assignToUser}
              icon={<FaUserCog />}
            >
              Assign
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Comment Modal */}
      <Modal
        isOpen={showCommentModal}
        onClose={() => setShowCommentModal(false)}
        title="Add Comment"
      >
        <div className="p-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Comment
            </label>
            <textarea
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              rows="4"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Enter your comment here..."
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="secondary"
              onClick={() => setShowCommentModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAddComment}
              disabled={!comment.trim()}
              icon={<FaComments />}
            >
              Add Comment
            </Button>
          </div>
        </div>
      </Modal>

      {/* History Modal */}
      <Modal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        title="Incident History"
        size="large"
      >
        <div className="p-4">
          {currentIncident.history && currentIncident.history.length > 0 ? (
            <div className="space-y-4">
              {currentIncident.history.map((entry, index) => (
                <div key={index} className="border-b border-gray-200 pb-4 last:border-0">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium">
                      {entry.user?.username || 'System'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDateTime(entry.timestamp)}
                    </div>
                  </div>
                  <p className="text-gray-800">{entry.action}</p>
                  {entry.details && (
                    <div className="mt-2 text-sm text-gray-600">
                      <pre className="whitespace-pre-wrap font-sans">
                        {typeof entry.details === 'object' 
                          ? JSON.stringify(entry.details, null, 2) 
                          : entry.details}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No history available</p>
          )}
          <div className="mt-4 flex justify-end">
            <Button
              variant="secondary"
              onClick={() => setShowHistoryModal(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default IncidentDetailPage;