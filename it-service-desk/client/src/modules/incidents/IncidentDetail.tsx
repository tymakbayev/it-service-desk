import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import IncidentModule from './IncidentModule';
import { IncidentStatus, IncidentPriority, IncidentCategory, AddCommentDto } from './IncidentTypes';
import { useWebSocket } from '../../services/websocket/WebSocketProvider';
import { formatDistanceToNow } from 'date-fns';

const IncidentDetail: React.FC = () => {
  const { incidentId } = useParams<{ incidentId: string }>();
  const navigate = useNavigate();
  const { subscribe } = useWebSocket();
  
  const { currentIncident, loading, error } = useSelector((state: RootState) => state.incidents);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [commentContent, setCommentContent] = useState('');
  const [isInternalComment, setIsInternalComment] = useState(false);
  const [commentAttachments, setCommentAttachments] = useState<File[]>([]);
  
  useEffect(() => {
    if (incidentId) {
      // Загружаем детали инцидента
      IncidentModule.getIncidentDetails(incidentId);
      
      // Подписываемся на обновления этого инцидента через WebSocket
      const unsubscribe = IncidentModule.subscribeToIncidentUpdates((data) => {
        if (data.id === incidentId) {
          // Перезагружаем детали инцидента при получении обновления
          IncidentModule.getIncidentDetails(incidentId);
        }
      });
      
      return () => {
        unsubscribe();
        // Очищаем текущий инцидент при размонтировании компонента
        IncidentModule.clearCurrentIncident();
      };
    }
  }, [incidentId]);
  
  if (loading && !currentIncident) {
    return <div className="loading">Загрузка данных инцидента...</div>;
  }
  
  if (error) {
    return <div className="error">Ошибка: {error}</div>;
  }
  
  if (!currentIncident) {
    return <div className="not-found">Инцидент не найден</div>;
  }
  
  // Обработчик изменения статуса
  const handleStatusChange = async (newStatus: IncidentStatus) => {
    try {
      await IncidentModule.changeIncidentStatus(currentIncident.id, newStatus);
    } catch (error) {
      console.error('Failed to change status:', error);
    }
  };
  
  // Обработчик назначения инцидента
  const handleAssign = async (assigneeId: string) => {
    try {
      await IncidentModule.assignIncident(currentIncident.id, assigneeId);
    } catch (error) {
      console.error('Failed to assign incident:', error);
    }
  };
  
  // Обработчик добавления комментария
  const handleAddComment = async () => {
    if (!commentContent.trim()) return;
    
    try {
      const commentData: AddCommentDto = {
        incidentId: currentIncident.id,
        content: commentContent,
        isInternal: isInternalComment,
        attachments: commentAttachments.length > 0 ? commentAttachments : undefined
      };
      
      await IncidentModule.addComment(commentData);
      
      // Сбрасываем форму после успешного добавления
      setCommentContent('');
      setIsInternalComment(false);
      setCommentAttachments([]);
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };
  
  // Обработчик загрузки файлов
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setCommentAttachments(Array.from(e.target.files));
    }
  };
  
  // Обработчик возврата к списку
  const handleBackToList = () => {
    navigate('/incidents');
  };
  
  // Обработчик редактирования инцидента
  const handleEdit = () => {
    navigate(`/incidents/${currentIncident.id}/edit`);
  };
  
  return (
    <div className="incident-detail-container">
      <div className="incident-detail-header">
        <button className="back-button" onClick={handleBackToList}>
          &larr; Назад к списку
        </button>
        <h2>Инцидент #{currentIncident.id.substring(0, 8)}</h2>
        <div className="incident-actions">
          <button className="edit-button" onClick={handleEdit}>
            Редактировать
          </button>
        </div>
      </div>
      
      <div className="incident-detail-content">
        <div className="incident-main-info">
          <h3>{currentIncident.title}</h3>
          
          <div className="incident-meta">
            <div className="meta-item">
              <span className="meta-label">Статус:</span>
              <span className={`status-badge ${currentIncident.status}`}>
                {currentIncident.status === IncidentStatus.NEW ? 'Новый' :
                 currentIncident.status === IncidentStatus.ASSIGNED ? 'Назначен' :
                 currentIncident.status === IncidentStatus.IN_PROGRESS ? 'В работе' :
                 currentIncident.status === IncidentStatus.ON_HOLD ? 'На удержании' :
                 currentIncident.status === IncidentStatus.RESOLVED ? 'Решен' :
                 currentIncident.status === IncidentStatus.CLOSED ? 'Закрыт' :
                 'Отменен'}
              </span>
            </div>
            
            <div className="meta-item">
              <span className="meta-label">Приоритет:</span>
              <span className={`priority-badge ${currentIncident.priority}`}>
                {currentIncident.priority === IncidentPriority.LOW ? 'Низкий' :
                 currentIncident.priority === IncidentPriority.MEDIUM ? 'Средний' :
                 currentIncident.priority === IncidentPriority.HIGH ? 'Высокий' :
                 'Критический'}
              </span>
            </div>
            
            <div className="meta-item">
              <span className="meta-label">Категория:</span>
              <span>
                {currentIncident.category === IncidentCategory.HARDWARE ? 'Оборудование' :
                 currentIncident.category === IncidentCategory.SOFTWARE ? 'Программное обеспечение' :
                 currentIncident.category === IncidentCategory.NETWORK ? 'Сеть' :
                 currentIncident.category === IncidentCategory.SECURITY ? 'Безопасность' :
                 currentIncident.category === IncidentCategory.ACCESS ? 'Доступ' :
                 currentIncident.category === IncidentCategory.SERVICE_REQUEST ? 'Запрос на обслуживание' :
                 'Другое'}
              </span>
            </div>
          </div>
          
          <div className="incident-dates">
            <div className="date-item">
              <span className="date-label">Создан:</span>
              <span>{new Date(currentIncident.createdAt).toLocaleString()}</span>
            </div>
            
            {currentIncident.updatedAt && (
              <div className="date-item">
                <span className="date-label">Обновлен:</span>
                <span>{new Date(currentIncident.updatedAt).toLocaleString()}</span>
              </div>
            )}
            
            {currentIncident.resolvedAt && (
              <div className="date-item">
                <span className="date-label">Решен:</span>
                <span>{new Date(currentIncident.resolvedAt).toLocaleString()}</span>
              </div>
            )}
            
            {currentIncident.closedAt && (
              <div className="date-item">
                <span className="date-label">Закрыт:</span>
                <span>{new Date(currentIncident.closedAt).toLocaleString()}</span>
              </div>
            )}
            
            {currentIncident.dueDate && (
              <div className="date-item">
                <span className="date-label">Срок выполнения:</span>
                <span className={new Date(currentIncident.dueDate) < new Date() ? 'overdue' : ''}>
                  {new Date(currentIncident.dueDate).toLocaleString()}
                  {currentIncident.slaBreached && ' (SLA нарушен)'}
                </span>
              </div>
            )}
          </div>
          
          <div className="incident-people">
            <div className="people-item">
              <span className="people-label">Заявитель:</span>
              <span>{currentIncident.reporterName}</span>
            </div>
            
            <div className="people-item">
              <span className="people-label">Исполнитель:</span>
              <span>{currentIncident.assigneeName || 'Не назначен'}</span>
              
              {/* Кнопка назначения (для администраторов и техников) */}
              {(user?.role === 'admin' || user?.role === 'technician') && (
                <button 
                  className="assign-button"
                  onClick={() => handleAssign(user.id)}
                  disabled={currentIncident.assigneeId === user.id}
                >
                  {currentIncident.assigneeId === user.id ? 'Уже назначен на вас' : 'Назначить на меня'}
                </button>
              )}
            </div>
            
            {currentIncident.equipmentId && (
              <div className="people-item">
                <span className="people-label">Оборудование:</span>
                <a href={`/equipment/${currentIncident.equipmentId}`}>{currentIncident.equipmentName}</a>
              </div>
            )}
          </div>
          
          <div className="incident-description">
            <h4>Описание</h4>
            <div className="description-content">
              {currentIncident.description.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
          
          {/* Кнопки изменения статуса (для администраторов и техников) */}
          {(user?.role === 'admin' || user?.role === 'technician') && (
            <div className="status-actions">
              <h4>Изменить статус</h4>
              <div className="status-buttons">
                {currentIncident.status !== IncidentStatus.IN_PROGRESS && (
                  <button 
                    className="status-button in-progress"
                    onClick={() => handleStatusChange(IncidentStatus.IN_PROGRESS)}
                  >
                    В работу
                  </button>
                )}
                
                {currentIncident.status !== IncidentStatus.ON_HOLD && (
                  <button 
                    className="status-button on-hold"
                    onClick={() => handleStatusChange(IncidentStatus.ON_HOLD)}
                  >
                    На удержание
                  </button>
                )}
                
                {currentIncident.status !== IncidentStatus.RESOLVED && (
                  <button 
                    className="status-button resolved"
                    onClick={() => handleStatusChange(IncidentStatus.RESOLVED)}
                  >
                    Решено
                  </button>
                )}
                
                {currentIncident.status !== IncidentStatus.CLOSED && (
                  <button 
                    className="status-button closed"
                    onClick={() => handleStatusChange(IncidentStatus.CLOSED)}
                  >
                    Закрыть
                  </button>
                )}
                
                {currentIncident.status !== IncidentStatus.CANCELLED && (
                  <button 
                    className="status-button cancelled"
                    onClick={() => handleStatusChange(IncidentStatus.CANCELLED)}
                  >
                    Отменить
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="incident-comments">
          <h4>Комментарии</h4>
          
          {currentIncident.comments && currentIncident.comments.length > 0 ? (
            <div className="comments-list">
              {currentIncident.comments.map(comment => (
                <div 
                  key={comment.id} 
                  className={`comment ${comment.isInternal ? 'internal' : ''}`}
                >
                  <div className="comment-header">
                    <span className="comment-author">{comment.userName}</span>
                    <span className="comment-time">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                    {comment.isInternal && (
                      <span className="internal-badge">Внутренний</span>
                    )}
                  </div>
                  <div className="comment-content">
                    {comment.content.split('\n').map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-comments">Нет комментариев</div>
          )}
          
          <div className="add-comment">
            <h5>Добавить комментарий</h5>
            <textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="Введите комментарий..."
              rows={4}
            />
            
            <div className="comment-options">
              {(user?.role === 'admin' || user?.role === 'technician') && (
                <label className="internal-comment-label">
                  <input
                    type="checkbox"
                    checked={isInternalComment}
                    onChange={(e) => setIsInternalComment(e.target.checked)}
                  />
                  Внутренний комментарий (виден только сотрудникам)
                </label>
              )}
              
              <div className="file-upload">
                <label htmlFor="comment-attachments">Прикрепить файлы:</label>
                <input
                  type="file"
                  id="comment-attachments"
                  multiple
                  onChange={handleFileChange}
                />
              </div>
              
              {commentAttachments.length > 0 && (
                <div className="selected-files">
                  <p>Выбрано файлов: {commentAttachments.length}</p>
                  <ul>
                    {commentAttachments.map((file, index) => (
                      <li key={index}>{file.name} ({(file.size / 1024).toFixed(1)} KB)</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <button 
              className="add-comment-button" 
              onClick={handleAddComment}
              disabled={!commentContent.trim()}
            >
              Добавить комментарий
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncidentDetail;
