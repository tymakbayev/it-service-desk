import { store } from '../../store';
import { 
  fetchIncidents, 
  fetchIncidentById, 
  createIncident, 
  updateIncident, 
  assignIncident, 
  changeIncidentStatus, 
  addComment,
  setFilters,
  setPage,
  setPageSize,
  clearCurrentIncident,
  deleteIncident
} from './incidentSlice';
import { 
  Incident, 
  CreateIncidentDto, 
  UpdateIncidentDto, 
  AddCommentDto, 
  IncidentFilters, 
  IncidentStatus,
  IncidentPriority,
  IncidentComment
} from './IncidentTypes';
import NotificationModule from '../notifications/NotificationModule';
import { NotificationType } from '../notifications/NotificationTypes';
import WebSocketClient from '../../services/websocket/WebSocketClient';
import { formatDate } from '../../utils/dateUtils';

/**
 * Модуль для управления инцидентами
 * Предоставляет методы для работы с инцидентами через Redux store
 */
class IncidentModule {
  /**
   * Создает новый инцидент
   * @param {CreateIncidentDto} incidentData - Данные для создания инцидента
   * @returns {Promise<Incident>} Созданный инцидент
   */
  async createIncident(incidentData) {
    try {
      const result = await store.dispatch(createIncident(incidentData)).unwrap();
      
      // Отправляем уведомление об успешном создании
      NotificationModule.showNotification({
        id: Date.now().toString(),
        userId: store.getState().auth.user?.id || '',
        title: 'Инцидент создан',
        message: `Инцидент "${result.title}" успешно создан`,
        type: NotificationType.SUCCESS,
        isRead: false,
        createdAt: new Date(),
        relatedEntityId: result.id,
        relatedEntityType: 'incident'
      });
      
      // Оповещаем других пользователей через WebSocket
      WebSocketClient.emit('incident:created', {
        incidentId: result.id,
        title: result.title,
        createdBy: store.getState().auth.user?.id
      });
      
      return result;
    } catch (error) {
      // Отправляем уведомление об ошибке
      NotificationModule.showNotification({
        id: Date.now().toString(),
        userId: store.getState().auth.user?.id || '',
        title: 'Ошибка',
        message: `Не удалось создать инцидент: ${error.message || 'Неизвестная ошибка'}`,
        type: NotificationType.ERROR,
        isRead: false,
        createdAt: new Date()
      });
      
      throw error;
    }
  }
  
  /**
   * Обновляет существующий инцидент
   * @param {string} incidentId - ID инцидента
   * @param {UpdateIncidentDto} updateData - Данные для обновления
   * @returns {Promise<Incident>} Обновленный инцидент
   */
  async updateIncident(incidentId, updateData) {
    try {
      const result = await store.dispatch(updateIncident({ incidentId, updateData })).unwrap();
      
      // Отправляем уведомление об успешном обновлении
      NotificationModule.showNotification({
        id: Date.now().toString(),
        userId: store.getState().auth.user?.id || '',
        title: 'Инцидент обновлен',
        message: `Инцидент "${result.title}" успешно обновлен`,
        type: NotificationType.SUCCESS,
        isRead: false,
        createdAt: new Date(),
        relatedEntityId: result.id,
        relatedEntityType: 'incident'
      });
      
      // Оповещаем других пользователей через WebSocket
      WebSocketClient.emit('incident:updated', {
        incidentId: result.id,
        title: result.title,
        updatedBy: store.getState().auth.user?.id
      });
      
      return result;
    } catch (error) {
      // Отправляем уведомление об ошибке
      NotificationModule.showNotification({
        id: Date.now().toString(),
        userId: store.getState().auth.user?.id || '',
        title: 'Ошибка',
        message: `Не удалось обновить инцидент: ${error.message || 'Неизвестная ошибка'}`,
        type: NotificationType.ERROR,
        isRead: false,
        createdAt: new Date()
      });
      
      throw error;
    }
  }
  
  /**
   * Получает список инцидентов с пагинацией и фильтрацией
   * @param {number} [page] - Номер страницы
   * @param {number} [pageSize] - Размер страницы
   * @param {IncidentFilters} [filters] - Фильтры для инцидентов
   * @returns {Promise<void>}
   */
  async listIncidents(page, pageSize, filters) {
    try {
      // Если переданы параметры, обновляем их в store
      if (page !== undefined) {
        store.dispatch(setPage(page));
      }
      
      if (pageSize !== undefined) {
        store.dispatch(setPageSize(pageSize));
      }
      
      if (filters !== undefined) {
        store.dispatch(setFilters(filters));
      }
      
      // Получаем актуальные значения из store
      const state = store.getState().incidents;
      
      await store.dispatch(fetchIncidents({
        page: page !== undefined ? page : state.page,
        pageSize: pageSize !== undefined ? pageSize : state.pageSize,
        filters: filters !== undefined ? filters : state.filters
      })).unwrap();
    } catch (error) {
      NotificationModule.showNotification({
        id: Date.now().toString(),
        userId: store.getState().auth.user?.id || '',
        title: 'Ошибка',
        message: `Не удалось загрузить список инцидентов: ${error.message || 'Неизвестная ошибка'}`,
        type: NotificationType.ERROR,
        isRead: false,
        createdAt: new Date()
      });
      
      throw error;
    }
  }
  
  /**
   * Получает детальную информацию об инциденте по ID
   * @param {string} incidentId - ID инцидента
   * @returns {Promise<Incident>} Детальная информация об инциденте
   */
  async getIncidentDetails(incidentId) {
    try {
      const result = await store.dispatch(fetchIncidentById(incidentId)).unwrap();
      return result;
    } catch (error) {
      NotificationModule.showNotification({
        id: Date.now().toString(),
        userId: store.getState().auth.user?.id || '',
        title: 'Ошибка',
        message: `Не удалось загрузить информацию об инциденте: ${error.message || 'Неизвестная ошибка'}`,
        type: NotificationType.ERROR,
        isRead: false,
        createdAt: new Date()
      });
      
      throw error;
    }
  }
  
  /**
   * Назначает инцидент на сотрудника
   * @param {string} incidentId - ID инцидента
   * @param {string} assigneeId - ID сотрудника
   * @returns {Promise<Incident>} Обновленный инцидент
   */
  async assignIncident(incidentId, assigneeId) {
    try {
      const result = await store.dispatch(assignIncident({ incidentId, assigneeId })).unwrap();
      
      // Отправляем уведомление об успешном назначении
      NotificationModule.showNotification({
        id: Date.now().toString(),
        userId: store.getState().auth.user?.id || '',
        title: 'Инцидент назначен',
        message: `Инцидент "${result.title}" успешно назначен`,
        type: NotificationType.SUCCESS,
        isRead: false,
        createdAt: new Date(),
        relatedEntityId: result.id,
        relatedEntityType: 'incident'
      });
      
      // Оповещаем назначенного сотрудника через WebSocket
      WebSocketClient.emit('incident:assigned', {
        incidentId: result.id,
        title: result.title,
        assigneeId: assigneeId,
        assignedBy: store.getState().auth.user?.id
      });
      
      return result;
    } catch (error) {
      // Отправляем уведомление об ошибке
      NotificationModule.showNotification({
        id: Date.now().toString(),
        userId: store.getState().auth.user?.id || '',
        title: 'Ошибка',
        message: `Не удалось назначить инцидент: ${error.message || 'Неизвестная ошибка'}`,
        type: NotificationType.ERROR,
        isRead: false,
        createdAt: new Date()
      });
      
      throw error;
    }
  }
  
  /**
   * Изменяет статус инцидента
   * @param {string} incidentId - ID инцидента
   * @param {IncidentStatus} status - Новый статус
   * @param {string} [comment] - Комментарий к изменению статуса
   * @returns {Promise<Incident>} Обновленный инцидент
   */
  async changeStatus(incidentId, status, comment) {
    try {
      const result = await store.dispatch(changeIncidentStatus({ 
        incidentId, 
        status,
        comment 
      })).unwrap();
      
      // Получаем текстовое представление статуса
      const statusText = this.getStatusText(status);
      
      // Отправляем уведомление об успешном изменении статуса
      NotificationModule.showNotification({
        id: Date.now().toString(),
        userId: store.getState().auth.user?.id || '',
        title: 'Статус инцидента изменен',
        message: `Статус инцидента "${result.title}" изменен на "${statusText}"`,
        type: NotificationType.SUCCESS,
        isRead: false,
        createdAt: new Date(),
        relatedEntityId: result.id,
        relatedEntityType: 'incident'
      });
      
      // Оповещаем других пользователей через WebSocket
      WebSocketClient.emit('incident:statusChanged', {
        incidentId: result.id,
        title: result.title,
        status: status,
        statusText: statusText,
        changedBy: store.getState().auth.user?.id,
        comment: comment
      });
      
      return result;
    } catch (error) {
      // Отправляем уведомление об ошибке
      NotificationModule.showNotification({
        id: Date.now().toString(),
        userId: store.getState().auth.user?.id || '',
        title: 'Ошибка',
        message: `Не удалось изменить статус инцидента: ${error.message || 'Неизвестная ошибка'}`,
        type: NotificationType.ERROR,
        isRead: false,
        createdAt: new Date()
      });
      
      throw error;
    }
  }
  
  /**
   * Добавляет комментарий к инциденту
   * @param {string} incidentId - ID инцидента
   * @param {AddCommentDto} commentData - Данные комментария
   * @returns {Promise<Incident>} Обновленный инцидент
   */
  async addComment(incidentId, commentData) {
    try {
      const result = await store.dispatch(addComment({ incidentId, commentData })).unwrap();
      
      // Отправляем уведомление об успешном добавлении комментария
      NotificationModule.showNotification({
        id: Date.now().toString(),
        userId: store.getState().auth.user?.id || '',
        title: 'Комментарий добавлен',
        message: `Комментарий к инциденту "${result.title}" успешно добавлен`,
        type: NotificationType.SUCCESS,
        isRead: false,
        createdAt: new Date(),
        relatedEntityId: result.id,
        relatedEntityType: 'incident'
      });
      
      // Оповещаем других пользователей через WebSocket
      WebSocketClient.emit('incident:commentAdded', {
        incidentId: result.id,
        title: result.title,
        commentId: result.comments[result.comments.length - 1].id,
        commentText: commentData.text,
        authorId: store.getState().auth.user?.id,
        authorName: store.getState().auth.user?.name || 'Пользователь'
      });
      
      return result;
    } catch (error) {
      // Отправляем уведомление об ошибке
      NotificationModule.showNotification({
        id: Date.now().toString(),
        userId: store.getState().auth.user?.id || '',
        title: 'Ошибка',
        message: `Не удалось добавить комментарий: ${error.message || 'Неизвестная ошибка'}`,
        type: NotificationType.ERROR,
        isRead: false,
        createdAt: new Date()
      });
      
      throw error;
    }
  }
  
  /**
   * Удаляет инцидент
   * @param {string} incidentId - ID инцидента
   * @returns {Promise<void>}
   */
  async deleteIncident(incidentId) {
    try {
      await store.dispatch(deleteIncident(incidentId)).unwrap();
      
      // Отправляем уведомление об успешном удалении
      NotificationModule.showNotification({
        id: Date.now().toString(),
        userId: store.getState().auth.user?.id || '',
        title: 'Инцидент удален',
        message: 'Инцидент успешно удален',
        type: NotificationType.SUCCESS,
        isRead: false,
        createdAt: new Date()
      });
      
      // Оповещаем других пользователей через WebSocket
      WebSocketClient.emit('incident:deleted', {
        incidentId: incidentId,
        deletedBy: store.getState().auth.user?.id
      });
    } catch (error) {
      // Отправляем уведомление об ошибке
      NotificationModule.showNotification({
        id: Date.now().toString(),
        userId: store.getState().auth.user?.id || '',
        title: 'Ошибка',
        message: `Не удалось удалить инцидент: ${error.message || 'Неизвестная ошибка'}`,
        type: NotificationType.ERROR,
        isRead: false,
        createdAt: new Date()
      });
      
      throw error;
    }
  }
  
  /**
   * Очищает текущий инцидент в store
   */
  clearCurrentIncident() {
    store.dispatch(clearCurrentIncident());
  }
  
  /**
   * Получает текстовое представление статуса инцидента
   * @param {IncidentStatus} status - Статус инцидента
   * @returns {string} Текстовое представление статуса
   */
  getStatusText(status) {
    const statusMap = {
      [IncidentStatus.NEW]: 'Новый',
      [IncidentStatus.ASSIGNED]: 'Назначен',
      [IncidentStatus.IN_PROGRESS]: 'В работе',
      [IncidentStatus.ON_HOLD]: 'Приостановлен',
      [IncidentStatus.RESOLVED]: 'Решен',
      [IncidentStatus.CLOSED]: 'Закрыт',
      [IncidentStatus.REOPENED]: 'Переоткрыт'
    };
    
    return statusMap[status] || 'Неизвестный статус';
  }
  
  /**
   * Получает текстовое представление приоритета инцидента
   * @param {IncidentPriority} priority - Приоритет инцидента
   * @returns {string} Текстовое представление приоритета
   */
  getPriorityText(priority) {
    const priorityMap = {
      [IncidentPriority.LOW]: 'Низкий',
      [IncidentPriority.MEDIUM]: 'Средний',
      [IncidentPriority.HIGH]: 'Высокий',
      [IncidentPriority.CRITICAL]: 'Критический'
    };
    
    return priorityMap[priority] || 'Неизвестный приоритет';
  }
  
  /**
   * Форматирует данные инцидента для отображения
   * @param {Incident} incident - Инцидент
   * @returns {Object} Отформатированные данные инцидента
   */
  formatIncidentForDisplay(incident) {
    if (!incident) return null;
    
    return {
      ...incident,
      statusText: this.getStatusText(incident.status),
      priorityText: this.getPriorityText(incident.priority),
      createdAtFormatted: formatDate(incident.createdAt),
      updatedAtFormatted: formatDate(incident.updatedAt),
      resolvedAtFormatted: incident.resolvedAt ? formatDate(incident.resolvedAt) : null,
      closedAtFormatted: incident.closedAt ? formatDate(incident.closedAt) : null,
      formattedComments: incident.comments ? this.formatComments(incident.comments) : []
    };
  }
  
  /**
   * Форматирует комментарии для отображения
   * @param {IncidentComment[]} comments - Массив комментариев
   * @returns {Object[]} Отформатированные комментарии
   */
  formatComments(comments) {
    if (!comments || !Array.isArray(comments)) return [];
    
    return comments.map(comment => ({
      ...comment,
      createdAtFormatted: formatDate(comment.createdAt)
    }));
  }
  
  /**
   * Получает доступные статусы для перехода из текущего статуса
   * @param {IncidentStatus} currentStatus - Текущий статус инцидента
   * @returns {IncidentStatus[]} Массив доступных статусов
   */
  getAvailableStatusTransitions(currentStatus) {
    const transitions = {
      [IncidentStatus.NEW]: [
        IncidentStatus.ASSIGNED,
        IncidentStatus.IN_PROGRESS,
        IncidentStatus.ON_HOLD,
        IncidentStatus.CLOSED
      ],
      [IncidentStatus.ASSIGNED]: [
        IncidentStatus.IN_PROGRESS,
        IncidentStatus.ON_HOLD,
        IncidentStatus.RESOLVED,
        IncidentStatus.CLOSED
      ],
      [IncidentStatus.IN_PROGRESS]: [
        IncidentStatus.ON_HOLD,
        IncidentStatus.RESOLVED,
        IncidentStatus.CLOSED
      ],
      [IncidentStatus.ON_HOLD]: [
        IncidentStatus.IN_PROGRESS,
        IncidentStatus.RESOLVED,
        IncidentStatus.CLOSED
      ],
      [IncidentStatus.RESOLVED]: [
        IncidentStatus.CLOSED,
        IncidentStatus.REOPENED
      ],
      [IncidentStatus.CLOSED]: [
        IncidentStatus.REOPENED
      ],
      [IncidentStatus.REOPENED]: [
        IncidentStatus.ASSIGNED,
        IncidentStatus.IN_PROGRESS,
        IncidentStatus.ON_HOLD
      ]
    };
    
    return transitions[currentStatus] || [];
  }
  
  /**
   * Проверяет, может ли пользователь редактировать инцидент
   * @param {Incident} incident - Инцидент
   * @returns {boolean} Результат проверки
   */
  canEditIncident(incident) {
    if (!incident) return false;
    
    const user = store.getState().auth.user;
    if (!user) return false;
    
    // Администратор может редактировать любой инцидент
    if (user.role === 'ADMIN') return true;
    
    // Техник может редактировать инциденты, назначенные на него
    if (user.role === 'TECHNICIAN' && incident.assignee && incident.assignee.id === user.id) {
      return true;
    }
    
    // Пользователь может редактировать только свои инциденты
    if (user.role === 'USER' && incident.createdBy && incident.createdBy.id === user.id) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Проверяет, может ли пользователь изменить статус инцидента
   * @param {Incident} incident - Инцидент
   * @returns {boolean} Результат проверки
   */
  canChangeStatus(incident) {
    if (!incident) return false;
    
    const user = store.getState().auth.user;
    if (!user) return false;
    
    // Администратор может изменять статус любого инцидента
    if (user.role === 'ADMIN') return true;
    
    // Техник может изменять статус инцидентов, назначенных на него
    if (user.role === 'TECHNICIAN' && incident.assignee && incident.assignee.id === user.id) {
      return true;
    }
    
    // Пользователь может только переоткрыть закрытый инцидент, если он его создал
    if (user.role === 'USER' && 
        incident.status === IncidentStatus.CLOSED && 
        incident.createdBy && 
        incident.createdBy.id === user.id) {
      return true;
    }
    
    return false;
  }
}

// Экспортируем экземпляр модуля для использования в приложении
const incidentModule = new IncidentModule();
export default incidentModule;