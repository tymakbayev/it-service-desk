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
  clearCurrentIncident
} from './incidentSlice';
import { 
  Incident, 
  CreateIncidentDto, 
  UpdateIncidentDto, 
  AddCommentDto, 
  IncidentFilters, 
  IncidentStatus 
} from './IncidentTypes';
import NotificationModule from '../notifications/NotificationModule';
import { NotificationType } from '../notifications/NotificationTypes';
import WebSocketClient from '../../services/websocket/WebSocketClient';

class IncidentModule {
  /**
   * Создает новый инцидент
   */
  async createIncident(incidentData: CreateIncidentDto): Promise<Incident> {
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
      
      return result;
    } catch (error) {
      // Отправляем уведомление об ошибке
      NotificationModule.showNotification({
        id: Date.now().toString(),
        userId: store.getState().auth.user?.id || '',
        title: 'Ошибка',
        message: `Не удалось создать инцидент: ${error.message}`,
        type: NotificationType.ERROR,
        isRead: false,
        createdAt: new Date()
      });
      
      throw error;
    }
  }
  
  /**
   * Обновляет существующий инцидент
   */
  async updateIncident(incidentId: string, updateData: UpdateIncidentDto): Promise<Incident> {
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
      
      return result;
    } catch (error) {
      // Отправляем уведомление об ошибке
      NotificationModule.showNotification({
        id: Date.now().toString(),
        userId: store.getState().auth.user?.id || '',
        title: 'Ошибка',
        message: `Не удалось обновить инцидент: ${error.message}`,
        type: NotificationType.ERROR,
        isRead: false,
        createdAt: new Date()
      });
      
      throw error;
    }
  }
  
  /**
   * Получает список инцидентов с пагинацией и фильтрацией
   */
  async listIncidents(page?: number, pageSize?: number, filters?: IncidentFilters): Promise<void> {
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
        message: `Не удалось загрузить список инцидентов: ${error.message}`,
        type: NotificationType.ERROR,
        isRead: false,
        createdAt: new Date()
      });
      
      throw error;
    }
  }
  
  /**
   * Получает детальную информацию об инциденте
   */
  async getIncidentDetails(incidentId: string): Promise<Incident> {
    try {
      return await store.dispatch(fetchIncidentById(incidentId)).unwrap();
    } catch (error) {
      NotificationModule.showNotification({
        id: Date.now().toString(),
        userId: store.getState().auth.user?.id || '',
        title: 'Ошибка',
        message: `Не удалось загрузить детали инцидента: ${error.message}`,
        type: NotificationType.ERROR,
        isRead: false,
        createdAt: new Date()
      });
      
      throw error;
    }
  }
  
  /**
   * Назначает инцидент на сотрудника
   */
  async assignIncident(incidentId: string, assigneeId: string): Promise<Incident> {
    try {
      const result = await store.dispatch(assignIncident({ incidentId, assigneeId })).unwrap();
      
      // Отправляем уведомление об успешном назначении
      NotificationModule.showNotification({
        id: Date.now().toString(),
        userId: store.getState().auth.user?.id || '',
        title: 'Инцидент назначен',
        message: `Инцидент "${result.title}" назначен на ${result.assigneeName}`,
        type: NotificationType.SUCCESS,
        isRead: false,
        createdAt: new Date(),
        relatedEntityId: result.id,
        relatedEntityType: 'incident'
      });
      
      return result;
    } catch (error) {
      // Отправляем уведомление об ошибке
      NotificationModule.showNotification({
        id: Date.now().toString(),
        userId: store.getState().auth.user?.id || '',
        title: 'Ошибка',
        message: `Не удалось назначить инцидент: ${error.message}`,
        type: NotificationType.ERROR,
        isRead: false,
        createdAt: new Date()
      });
      
      throw error;
    }
  }
  
  /**
   * Изменяет статус инцидента
   */
  async changeIncidentStatus(incidentId: string, status: IncidentStatus): Promise<Incident> {
    try {
      const result = await store.dispatch(changeIncidentStatus({ incidentId, status })).unwrap();
      
      // Отправляем уведомление об успешном изменении статуса
      NotificationModule.showNotification({
        id: Date.now().toString(),
        userId: store.getState().auth.user?.id || '',
        title: 'Статус инцидента изменен',
        message: `Статус инцидента "${result.title}" изменен на "${this.getStatusDisplayName(status)}"`,
        type: NotificationType.SUCCESS,
        isRead: false,
        createdAt: new Date(),
        relatedEntityId: result.id,
        relatedEntityType: 'incident'
      });
      
      return result;
    } catch (error) {
      // Отправляем уведомление об ошибке
      NotificationModule.showNotification({
        id: Date.now().toString(),
        userId: store.getState().auth.user?.id || '',
        title: 'Ошибка',
        message: `Не удалось изменить статус инцидента: ${error.message}`,
        type: NotificationType.ERROR,
        isRead: false,
        createdAt: new Date()
      });
      
      throw error;
    }
  }
  
  /**
   * Добавляет комментарий к инциденту
   */
  async addComment(commentData: AddCommentDto): Promise<void> {
    try {
      await store.dispatch(addComment(commentData)).unwrap();
      
      // Отправляем уведомление об успешном добавлении комментария
      NotificationModule.showNotification({
        id: Date.now().toString(),
        userId: store.getState().auth.user?.id || '',
        title: 'Комментарий добавлен',
        message: 'Комментарий успешно добавлен к инциденту',
        type: NotificationType.SUCCESS,
        isRead: false,
        createdAt: new Date(),
        relatedEntityId: commentData.incidentId,
        relatedEntityType: 'incident'
      });
    } catch (error) {
      // Отправляем уведомление об ошибке
      NotificationModule.showNotification({
        id: Date.now().toString(),
        userId: store.getState().auth.user?.id || '',
        title: 'Ошибка',
        message: `Не удалось добавить комментарий: ${error.message}`,
        type: NotificationType.ERROR,
        isRead: false,
        createdAt: new Date()
      });
      
      throw error;
    }
  }
  
  /**
   * Очищает текущий инцидент из состояния
   */
  clearCurrentIncident(): void {
    store.dispatch(clearCurrentIncident());
  }
  
  /**
   * Подписывается на обновления инцидентов через WebSocket
   */
  subscribeToIncidentUpdates(callback: (data: any) => void): () => void {
    return WebSocketClient.subscribe('incident_update', callback);
  }
  
  /**
   * Возвращает отображаемое имя статуса
   */
  private getStatusDisplayName(status: IncidentStatus): string {
    const statusMap: Record<IncidentStatus, string> = {
      [IncidentStatus.NEW]: 'Новый',
      [IncidentStatus.ASSIGNED]: 'Назначен',
      [IncidentStatus.IN_PROGRESS]: 'В работе',
      [IncidentStatus.ON_HOLD]: 'На удержании',
      [IncidentStatus.RESOLVED]: 'Решен',
      [IncidentStatus.CLOSED]: 'Закрыт',
      [IncidentStatus.CANCELLED]: 'Отменен'
    };
    
    return statusMap[status] || status;
  }
}

export default new IncidentModule();
