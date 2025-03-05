import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { format, formatDistanceToNow } from 'date-fns';
import { FaArrowLeft, FaEdit, FaPaperclip, FaDownload, FaTrash, FaUser, FaClock, FaTag } from 'react-icons/fa';

// Components
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import Modal from '../../../components/common/Modal';
import Loader from '../../../components/common/Loader';
import Alert from '../../../components/common/Alert';

// Store
import { 
  getIncidentById, 
  updateIncidentStatus, 
  assignIncident, 
  addComment, 
  deleteComment, 
  clearCurrentIncident 
} from '../store/incidentsSlice';

// Hooks
import { useAuth } from '../../../hooks/useAuth';
import { useWebSocket } from '../../../hooks/useWebSocket';

// Utils and constants
import { 
  INCIDENT_STATUSES, 
  INCIDENT_PRIORITIES, 
  INCIDENT_STATUS_COLORS,
  INCIDENT_PRIORITY_COLORS,
  USER_ROLES
} from '../../../utils/constants';

/**
 * IncidentDetail component displays detailed information about a specific incident
 * Allows users to view, update status, assign, add comments, and manage attachments
 */
const IncidentDetail = () => {
  const { incidentId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { subscribeToChannel, unsubscribeFromChannel } = useWebSocket();
  
  // Local state
  const [commentContent, setCommentContent] = useState('');
  const [isInternalComment, setIsInternalComment] = useState(false);
  const [commentAttachments, setCommentAttachments] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDeleteCommentModal, setShowDeleteCommentModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Redux state
  const { currentIncident, loading, error: incidentError } = useSelector(state => state.incidents);
  const { technicians } = useSelector(state => state.auth);
  
  // Load incident data on component mount
  useEffect(() => {
    if (incidentId) {
      dispatch(getIncidentById(incidentId));
      
      // Subscribe to incident updates via WebSocket
      subscribeToChannel(`incident:${incidentId}`, (data) => {
        if (data.type === 'UPDATE') {
          dispatch(getIncidentById(incidentId));
        }
      });
    }
    
    // Cleanup on unmount
    return () => {
      dispatch(clearCurrentIncident());
      if (incidentId) {
        unsubscribeFromChannel(`incident:${incidentId}`);
      }
    };
  }, [incidentId, dispatch, subscribeToChannel, unsubscribeFromChannel]);

  // Handle status change
  const handleStatusChange = async (newStatus) => {
    try {
      await dispatch(updateIncidentStatus({ incidentId, status: newStatus })).unwrap();
      setShowStatusModal(false);
      setSuccess(`Статус инцидента успешно изменен на "${newStatus}"`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Не удалось изменить статус инцидента');
    }
  };
  
  // Handle incident assignment
  const handleAssign = async (assigneeId) => {
    try {
      await dispatch(assignIncident({ incidentId, assigneeId })).unwrap();
      setShowAssignModal(false);
      setSuccess('Инцидент успешно назначен');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Не удалось назначить инцидент');
    }
  };
  
  // Handle comment submission
  const handleAddComment = async (e) => {
    e.preventDefault();
    
    if (!commentContent.trim()) {
      setError('Комментарий не может быть пустым');
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append('content', commentContent);
      formData.append('isInternal', isInternalComment);
      
      // Add attachments if any
      if (commentAttachments.length > 0) {
        Array.from(commentAttachments).forEach(file => {
          formData.append('attachments', file);
        });
      }
      
      await dispatch(addComment({ incidentId, formData })).unwrap();
      
      // Reset form after successful submission
      setCommentContent('');
      setIsInternalComment(false);
      setCommentAttachments([]);
      setSuccess('Комментарий успешно добавлен');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Не удалось добавить комментарий');
    }
  };
  
  // Handle file selection for comment attachments
  const handleFileChange = (e) => {
    if (e.target.files) {
      setCommentAttachments(e.target.files);
    }
  };
  
  // Handle comment deletion
  const handleDeleteComment = async () => {
    if (!commentToDelete) return;
    
    try {
      await dispatch(deleteComment({ 
        incidentId, 
        commentId: commentToDelete 
      })).unwrap();
      
      setShowDeleteCommentModal(false);
      setCommentToDelete(null);
      setSuccess('Комментарий успешно удален');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Не удалось удалить комментарий');
    }
  };
  
  // Handle back to list navigation
  const handleBackToList = () => {
    navigate('/incidents');
  };
  
  // Handle edit incident navigation
  const handleEdit = () => {
    navigate(`/incidents/${incidentId}/edit`);
  };
  
  // Check if user can edit the incident
  const canEditIncident = () => {
    if (!user || !currentIncident) return false;
    
    return (
      user.role === USER_ROLES.ADMIN ||
      user.role === USER_ROLES.TECHNICIAN ||
      (user.role === USER_ROLES.USER && currentIncident.createdBy === user.id)
    );
  };
  
  // Check if user can change incident status
  const canChangeStatus = () => {
    if (!user || !currentIncident) return false;
    
    return (
      user.role === USER_ROLES.ADMIN ||
      user.role === USER_ROLES.TECHNICIAN ||
      (user.role === USER_ROLES.USER && 
       currentIncident.createdBy === user.id && 
       [INCIDENT_STATUSES.CLOSED, INCIDENT_STATUSES.CANCELLED].includes(currentIncident.status))
    );
  };
  
  // Check if user can assign the incident
  const canAssignIncident = () => {
    if (!user) return false;
    
    return (
      user.role === USER_ROLES.ADMIN ||
      user.role === USER_ROLES.TECHNICIAN
    );
  };
  
  // Check if user can delete a comment
  const canDeleteComment = (comment) => {
    if (!user) return false;
    
    return (
      user.role === USER_ROLES.ADMIN ||
      comment.author.id === user.id
    );
  };
  
  // Render loading state
  if (loading && !currentIncident) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader size="large" />
      </div>
    );
  }
  
  // Render error state
  if (incidentError && !currentIncident) {
    return (
      <div className="p-4">
        <Alert type="error" message={incidentError} />
        <div className="mt-4">
          <Button onClick={handleBackToList} variant="secondary">
            <FaArrowLeft className="mr-2" /> Вернуться к списку
          </Button>
        </div>
      </div>
    );
  }
  
  // Render not found state
  if (!currentIncident) {
    return (
      <div className="p-4">
        <Alert type="warning" message="Инцидент не найден" />
        <div className="mt-4">
          <Button onClick={handleBackToList} variant="secondary">
            <FaArrowLeft className="mr-2" /> Вернуться к списку
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="incident-detail p-4">
      {/* Success and error messages */}
      {success && <Alert type="success" message={success} className="mb-4" />}
      {error && <Alert type="error" message={error} className="mb-4" />}
      
      {/* Header with actions */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Button onClick={handleBackToList} variant="secondary" className="mr-4">
            <FaArrowLeft className="mr-2" /> Назад
          </Button>
          <h1 className="text-2xl font-bold">Инцидент #{currentIncident.id.substring(0, 8)}</h1>
        </div>
        <div className="flex">
          {canChangeStatus() && (
            <Button 
              onClick={() => setShowStatusModal(true)} 
              variant="primary" 
              className="mr-2"
            >
              Изменить статус
            </Button>
          )}
          {canAssignIncident() && (
            <Button 
              onClick={() => setShowAssignModal(true)} 
              variant="primary" 
              className="mr-2"
            >
              Назначить
            </Button>
          )}
          {canEditIncident() && (
            <Button onClick={handleEdit} variant="secondary">
              <FaEdit className="mr-2" /> Редактировать
            </Button>
          )}
        </div>
      </div>
      
      {/* Incident details */}
      <Card className="mb-6">
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-4">{currentIncident.title}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <div className="flex items-center mb-2">
                <FaUser className="mr-2 text-gray-500" />
                <span className="font-medium mr-2">Создатель:</span>
                <span>{currentIncident.createdBy.name}</span>
              </div>
              
              <div className="flex items-center mb-2">
                <FaClock className="mr-2 text-gray-500" />
                <span className="font-medium mr-2">Создан:</span>
                <span>
                  {format(new Date(currentIncident.createdAt), 'dd.MM.yyyy HH:mm')}
                  {' '}
                  ({formatDistanceToNow(new Date(currentIncident.createdAt), { addSuffix: true })})
                </span>
              </div>
              
              <div className="flex items-center mb-2">
                <FaClock className="mr-2 text-gray-500" />
                <span className="font-medium mr-2">Срок выполнения:</span>
                <span>{format(new Date(currentIncident.dueDate), 'dd.MM.yyyy')}</span>
              </div>
            </div>
            
            <div>
              <div className="flex items-center mb-2">
                <FaTag className="mr-2 text-gray-500" />
                <span className="font-medium mr-2">Статус:</span>
                <span 
                  className="px-2 py-1 rounded text-white text-sm"
                  style={{ backgroundColor: INCIDENT_STATUS_COLORS[currentIncident.status] }}
                >
                  {currentIncident.status}
                </span>
              </div>
              
              <div className="flex items-center mb-2">
                <FaTag className="mr-2 text-gray-500" />
                <span className="font-medium mr-2">Приоритет:</span>
                <span 
                  className="px-2 py-1 rounded text-white text-sm"
                  style={{ backgroundColor: INCIDENT_PRIORITY_COLORS[currentIncident.priority] }}
                >
                  {currentIncident.priority}
                </span>
              </div>
              
              <div className="flex items-center mb-2">
                <FaUser className="mr-2 text-gray-500" />
                <span className="font-medium mr-2">Назначен:</span>
                <span>
                  {currentIncident.assignedTo 
                    ? currentIncident.assignedTo.name 
                    : 'Не назначен'}
                </span>
              </div>
            </div>
          </div>
          
          {currentIncident.equipment && (
            <div className="mb-4">
              <h3 className="font-medium mb-2">Связанное оборудование:</h3>
              <div className="bg-gray-100 p-3 rounded">
                <div className="font-medium">{currentIncident.equipment.name}</div>
                <div className="text-sm text-gray-600">
                  Инвентарный номер: {currentIncident.equipment.inventoryNumber}
                </div>
                <div className="text-sm text-gray-600">
                  Тип: {currentIncident.equipment.type}
                </div>
              </div>
            </div>
          )}
          
          <div className="mb-4">
            <h3 className="font-medium mb-2">Описание:</h3>
            <div className="bg-gray-100 p-3 rounded whitespace-pre-wrap">
              {currentIncident.description}
            </div>
          </div>
          
          {currentIncident.attachments && currentIncident.attachments.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Вложения:</h3>
              <ul className="bg-gray-100 p-3 rounded">
                {currentIncident.attachments.map((attachment, index) => (
                  <li key={index} className="flex items-center mb-2 last:mb-0">
                    <FaPaperclip className="mr-2 text-gray-500" />
                    <a 
                      href={attachment.url} 
                      download={attachment.filename}
                      className="text-blue-600 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {attachment.filename}
                    </a>
                    <span className="text-gray-500 text-sm ml-2">
                      ({Math.round(attachment.size / 1024)} KB)
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Card>
      
      {/* Comments section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Комментарии</h3>
        
        {/* Comment form */}
        <Card className="mb-4">
          <div className="p-4">
            <form onSubmit={handleAddComment}>
              <div className="mb-3">
                <textarea
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                  placeholder="Добавьте комментарий..."
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                ></textarea>
              </div>
              
              <div className="flex flex-wrap items-center justify-between">
                <div className="flex items-center mb-2 sm:mb-0">
                  <label className="flex items-center cursor-pointer mr-4">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={isInternalComment}
                      onChange={(e) => setIsInternalComment(e.target.checked)}
                    />
                    <span className="text-sm">
                      Внутренний комментарий (виден только сотрудникам)
                    </span>
                  </label>
                  
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      multiple
                      onChange={handleFileChange}
                    />
                    <Button type="button" variant="secondary" size="small">
                      <FaPaperclip className="mr-1" /> Прикрепить файлы
                    </Button>
                  </label>
                </div>
                
                <Button type="submit" variant="primary">
                  Отправить комментарий
                </Button>
              </div>
              
              {commentAttachments.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium mb-1">Выбранные файлы:</p>
                  <ul className="text-sm text-gray-600">
                    {Array.from(commentAttachments).map((file, index) => (
                      <li key={index} className="mb-1">
                        {file.name} ({Math.round(file.size / 1024)} KB)
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </form>
          </div>
        </Card>
        
        {/* Comments list */}
        {currentIncident.comments && currentIncident.comments.length > 0 ? (
          <div className="space-y-4">
            {currentIncident.comments.map((comment) => (
              <Card 
                key={comment.id} 
                className={`${comment.isInternal ? 'border-l-4 border-yellow-500' : ''}`}
              >
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center">
                      <div className="font-medium">{comment.author.name}</div>
                      <div className="text-gray-500 text-sm ml-2">
                        {format(new Date(comment.createdAt), 'dd.MM.yyyy HH:mm')}
                      </div>
                      {comment.isInternal && (
                        <div className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded">
                          Внутренний
                        </div>
                      )}
                    </div>
                    
                    {canDeleteComment(comment) && (
                      <Button 
                        variant="danger" 
                        size="small"
                        onClick={() => {
                          setCommentToDelete(comment.id);
                          setShowDeleteCommentModal(true);
                        }}
                      >
                        <FaTrash />
                      </Button>
                    )}
                  </div>
                  
                  <div className="whitespace-pre-wrap mb-3">{comment.content}</div>
                  
                  {comment.attachments && comment.attachments.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-1">Вложения:</p>
                      <ul className="text-sm">
                        {comment.attachments.map((attachment, index) => (
                          <li key={index} className="flex items-center mb-1">
                            <FaPaperclip className="mr-1 text-gray-500" />
                            <a 
                              href={attachment.url} 
                              download={attachment.filename}
                              className="text-blue-600 hover:underline"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {attachment.filename}
                            </a>
                            <span className="text-gray-500 text-xs ml-1">
                              ({Math.round(attachment.size / 1024)} KB)
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center p-6 bg-gray-100 rounded">
            <p className="text-gray-500">Комментариев пока нет</p>
          </div>
        )}
      </div>
      
      {/* Status change modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Изменить статус инцидента"
      >
        <div className="p-4">
          <p className="mb-4">Выберите новый статус для инцидента:</p>
          <div className="space-y-2">
            {Object.values(INCIDENT_STATUSES).map((status) => (
              <button
                key={status}
                className={`w-full p-2 text-left rounded border ${
                  currentIncident.status === status 
                    ? 'bg-blue-100 border-blue-500' 
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => handleStatusChange(status)}
                disabled={currentIncident.status === status}
              >
                <div className="flex items-center">
                  <span 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: INCIDENT_STATUS_COLORS[status] }}
                  ></span>
                  {status}
                </div>
              </button>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <Button 
              variant="secondary" 
              onClick={() => setShowStatusModal(false)}
            >
              Отмена
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* Assign incident modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Назначить инцидент"
      >
        <div className="p-4">
          <p className="mb-4">Выберите сотрудника для назначения:</p>
          <div className="max-h-60 overflow-y-auto space-y-2">
            {technicians && technicians.length > 0 ? (
              technicians.map((tech) => (
                <button
                  key={tech.id}
                  className={`w-full p-2 text-left rounded border ${
                    currentIncident.assignedTo && currentIncident.assignedTo.id === tech.id
                      ? 'bg-blue-100 border-blue-500' 
                      : 'hover:bg-gray-100'
                  }`}
                  onClick={() => handleAssign(tech.id)}
                  disabled={currentIncident.assignedTo && currentIncident.assignedTo.id === tech.id}
                >
                  <div className="flex items-center">
                    <FaUser className="mr-2 text-gray-500" />
                    <div>
                      <div>{tech.name}</div>
                      <div className="text-sm text-gray-500">{tech.email}</div>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <p className="text-gray-500 text-center p-4">
                Нет доступных сотрудников для назначения
              </p>
            )}
          </div>
          <div className="mt-6 flex justify-between">
            <Button 
              variant="danger" 
              onClick={() => handleAssign(null)}
              disabled={!currentIncident.assignedTo}
            >
              Снять назначение
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => setShowAssignModal(false)}
            >
              Отмена
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* Delete comment confirmation modal */}
      <Modal
        isOpen={showDeleteCommentModal}
        onClose={() => {
          setShowDeleteCommentModal(false);
          setCommentToDelete(null);
        }}
        title="Удаление комментария"
      >
        <div className="p-4">
          <p className="mb-4">Вы уверены, что хотите удалить этот комментарий?</p>
          <p className="mb-4 text-gray-500">Это действие нельзя отменить.</p>
          <div className="flex justify-end space-x-2">
            <Button 
              variant="secondary" 
              onClick={() => {
                setShowDeleteCommentModal(false);
                setCommentToDelete(null);
              }}
            >
              Отмена
            </Button>
            <Button 
              variant="danger" 
              onClick={handleDeleteComment}
            >
              Удалить
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default IncidentDetail;