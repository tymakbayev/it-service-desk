/**
 * NotificationModule.js
 * 
 * Модуль для управления уведомлениями в приложении IT Service Desk.
 * Обеспечивает функциональность для создания, отображения, получения и управления
 * уведомлениями пользователя. Интегрируется с Redux store и toast-уведомлениями.
 */

import { store } from '../../store';
import { 
  addNotification, 
  fetchNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  removeNotification
} from './store/notificationsSlice';
import { toast } from 'react-toastify';

/**
 * Типы уведомлений
 * @enum {string}
 */
export const NotificationType = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error'
};

/**
 * Класс для управления уведомлениями в приложении
 */
class NotificationModule {
  /**
   * Показывает уведомление пользователю
   * @param {Object} notification - Объект уведомления
   * @param {string} notification.id - Уникальный идентификатор уведомления
   * @param {string} notification.title - Заголовок уведомления
   * @param {string} notification.message - Текст уведомления
   * @param {string} notification.type - Тип уведомления (info, success, warning, error)
   * @param {boolean} notification.isRead - Статус прочтения
   * @param {Date} notification.createdAt - Дата создания
   * @param {string} [notification.userId] - ID пользователя
   * @param {string} [notification.relatedEntityId] - ID связанной сущности
   * @param {string} [notification.relatedEntityType] - Тип связанной сущности
   * @param {boolean} [showToast=true] - Показывать ли toast-уведомление
   */
  showNotification(notification, showToast = true) {
    // Добавляем уведомление в Redux store
    store.dispatch(addNotification(notification));
    
    // Показываем toast-уведомление, если требуется
    if (showToast) {
      const toastOptions = {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        onClick: () => {
          // При клике на уведомление отмечаем его как прочитанное
          if (notification.id) {
            this.markAsRead(notification.id);
          }
        }
      };
      
      switch (notification.type) {
        case NotificationType.SUCCESS:
          toast.success(notification.message, toastOptions);
          break;
        case NotificationType.WARNING:
          toast.warning(notification.message, toastOptions);
          break;
        case NotificationType.ERROR:
          toast.error(notification.message, toastOptions);
          break;
        default:
          toast.info(notification.message, toastOptions);
          break;
      }
    }
  }
  
  /**
   * Получает список уведомлений пользователя с сервера
   * @returns {Promise<Array>} Промис с массивом уведомлений
   */
  async listNotifications() {
    try {
      return await store.dispatch(fetchNotifications()).unwrap();
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      this.showNotification({
        id: Date.now().toString(),
        title: 'Ошибка',
        message: 'Не удалось загрузить уведомления',
        type: NotificationType.ERROR,
        isRead: false,
        createdAt: new Date()
      });
      throw error;
    }
  }
  
  /**
   * Отмечает уведомление как прочитанное
   * @param {string} notificationId - ID уведомления
   * @returns {Promise<Object>} Промис с обновленным уведомлением
   */
  async markAsRead(notificationId) {
    try {
      return await store.dispatch(markNotificationAsRead(notificationId)).unwrap();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  }
  
  /**
   * Отмечает все уведомления как прочитанные
   * @returns {Promise<Array>} Промис с обновленными уведомлениями
   */
  async markAllAsRead() {
    try {
      return await store.dispatch(markAllNotificationsAsRead()).unwrap();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      this.showNotification({
        id: Date.now().toString(),
        title: 'Ошибка',
        message: 'Не удалось отметить все уведомления как прочитанные',
        type: NotificationType.ERROR,
        isRead: false,
        createdAt: new Date()
      });
      throw error;
    }
  }
  
  /**
   * Удаляет уведомление
   * @param {string} notificationId - ID уведомления
   * @returns {Promise<Object>} Промис с результатом операции
   */
  async removeNotification(notificationId) {
    try {
      return await store.dispatch(removeNotification(notificationId)).unwrap();
    } catch (error) {
      console.error('Failed to remove notification:', error);
      throw error;
    }
  }
  
  /**
   * Создает новое уведомление
   * @param {Object} params - Параметры уведомления
   * @param {string} params.title - Заголовок уведомления
   * @param {string} params.message - Текст уведомления
   * @param {string} [params.type=NotificationType.INFO] - Тип уведомления
   * @param {string} [params.relatedEntityId] - ID связанной сущности
   * @param {string} [params.relatedEntityType] - Тип связанной сущности ('incident', 'equipment', 'task')
   * @param {boolean} [params.showToast=true] - Показывать ли toast-уведомление
   * @returns {Object} Созданное уведомление
   */
  createNotification({
    title,
    message,
    type = NotificationType.INFO,
    relatedEntityId,
    relatedEntityType,
    showToast = true
  }) {
    const authState = store.getState().auth;
    const userId = authState?.user?.id;
    
    if (!userId && relatedEntityType !== 'system') {
      console.warn('User is not authenticated, creating system notification');
    }
    
    const notification = {
      id: Date.now().toString(), // Временный ID, будет заменен на серверный
      userId,
      title,
      message,
      type,
      isRead: false,
      createdAt: new Date(),
      relatedEntityId,
      relatedEntityType
    };
    
    // Показываем уведомление
    this.showNotification(notification, showToast);
    
    return notification;
  }
  
  /**
   * Обрабатывает входящее уведомление от WebSocket
   * @param {Object} notification - Объект уведомления с сервера
   */
  handleWebSocketNotification(notification) {
    // Проверяем, что уведомление предназначено текущему пользователю
    const currentUserId = store.getState().auth?.user?.id;
    
    if (!notification.userId || notification.userId === currentUserId) {
      this.showNotification({
        ...notification,
        createdAt: notification.createdAt ? new Date(notification.createdAt) : new Date()
      });
    }
  }
  
  /**
   * Создает уведомление об успехе
   * @param {string} message - Текст уведомления
   * @param {string} [title='Успешно'] - Заголовок уведомления
   * @param {Object} [options={}] - Дополнительные параметры
   * @returns {Object} Созданное уведомление
   */
  success(message, title = 'Успешно', options = {}) {
    return this.createNotification({
      title,
      message,
      type: NotificationType.SUCCESS,
      ...options
    });
  }
  
  /**
   * Создает информационное уведомление
   * @param {string} message - Текст уведомления
   * @param {string} [title='Информация'] - Заголовок уведомления
   * @param {Object} [options={}] - Дополнительные параметры
   * @returns {Object} Созданное уведомление
   */
  info(message, title = 'Информация', options = {}) {
    return this.createNotification({
      title,
      message,
      type: NotificationType.INFO,
      ...options
    });
  }
  
  /**
   * Создает предупреждающее уведомление
   * @param {string} message - Текст уведомления
   * @param {string} [title='Предупреждение'] - Заголовок уведомления
   * @param {Object} [options={}] - Дополнительные параметры
   * @returns {Object} Созданное уведомление
   */
  warning(message, title = 'Предупреждение', options = {}) {
    return this.createNotification({
      title,
      message,
      type: NotificationType.WARNING,
      ...options
    });
  }
  
  /**
   * Создает уведомление об ошибке
   * @param {string} message - Текст уведомления
   * @param {string} [title='Ошибка'] - Заголовок уведомления
   * @param {Object} [options={}] - Дополнительные параметры
   * @returns {Object} Созданное уведомление
   */
  error(message, title = 'Ошибка', options = {}) {
    return this.createNotification({
      title,
      message,
      type: NotificationType.ERROR,
      ...options
    });
  }
  
  /**
   * Создает уведомление о новом инциденте
   * @param {Object} incident - Объект инцидента
   * @returns {Object} Созданное уведомление
   */
  newIncident(incident) {
    return this.createNotification({
      title: 'Новый инцидент',
      message: `Создан новый инцидент: ${incident.title}`,
      type: NotificationType.INFO,
      relatedEntityId: incident.id,
      relatedEntityType: 'incident'
    });
  }
  
  /**
   * Создает уведомление об обновлении статуса инцидента
   * @param {Object} incident - Объект инцидента
   * @returns {Object} Созданное уведомление
   */
  incidentStatusUpdated(incident) {
    return this.createNotification({
      title: 'Статус инцидента изменен',
      message: `Инцидент "${incident.title}" теперь имеет статус "${incident.status}"`,
      type: NotificationType.INFO,
      relatedEntityId: incident.id,
      relatedEntityType: 'incident'
    });
  }
  
  /**
   * Создает уведомление о назначении инцидента
   * @param {Object} incident - Объект инцидента
   * @param {Object} assignee - Объект пользователя, которому назначен инцидент
   * @returns {Object} Созданное уведомление
   */
  incidentAssigned(incident, assignee) {
    return this.createNotification({
      title: 'Инцидент назначен',
      message: `Инцидент "${incident.title}" назначен на ${assignee.username}`,
      type: NotificationType.INFO,
      relatedEntityId: incident.id,
      relatedEntityType: 'incident'
    });
  }
  
  /**
   * Создает уведомление о добавлении нового оборудования
   * @param {Object} equipment - Объект оборудования
   * @returns {Object} Созданное уведомление
   */
  newEquipment(equipment) {
    return this.createNotification({
      title: 'Новое оборудование',
      message: `Добавлено новое оборудование: ${equipment.name}`,
      type: NotificationType.INFO,
      relatedEntityId: equipment.id,
      relatedEntityType: 'equipment'
    });
  }
  
  /**
   * Создает уведомление об изменении статуса оборудования
   * @param {Object} equipment - Объект оборудования
   * @returns {Object} Созданное уведомление
   */
  equipmentStatusUpdated(equipment) {
    return this.createNotification({
      title: 'Статус оборудования изменен',
      message: `Оборудование "${equipment.name}" теперь имеет статус "${equipment.status}"`,
      type: NotificationType.INFO,
      relatedEntityId: equipment.id,
      relatedEntityType: 'equipment'
    });
  }
}

// Экспортируем синглтон модуля уведомлений
export default new NotificationModule();