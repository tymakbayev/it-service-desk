import { store } from '../../store';
import { addNotification, fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead } from './notificationSlice';
import { Notification, NotificationType } from './NotificationTypes';
import { toast } from 'react-toastify';

class NotificationModule {
  /**
   * Показывает уведомление пользователю
   */
  showNotification(notification: Notification): void {
    // Добавляем уведомление в Redux store
    store.dispatch(addNotification(notification));
    
    // Также показываем toast-уведомление
    const toastOptions = {
      position: toast.POSITION.TOP_RIGHT,
      autoClose: 5000
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
  
  /**
   * Получает список уведомлений пользователя
   */
  async listNotifications(): Promise<void> {
    return store.dispatch(fetchNotifications()).unwrap();
  }
  
  /**
   * Отмечает уведомление как прочитанное
   */
  async markAsRead(notificationId: string): Promise<void> {
    return store.dispatch(markNotificationAsRead(notificationId)).unwrap();
  }
  
  /**
   * Отмечает все уведомления как прочитанные
   */
  async markAllAsRead(): Promise<void> {
    return store.dispatch(markAllNotificationsAsRead()).unwrap();
  }
  
  /**
   * Создает новое уведомление
   */
  createNotification({
    title,
    message,
    type = NotificationType.INFO,
    relatedEntityId,
    relatedEntityType
  }: {
    title: string;
    message: string;
    type?: NotificationType;
    relatedEntityId?: string;
    relatedEntityType?: 'incident' | 'equipment' | 'task';
  }): Notification {
    const userId = store.getState().auth.user?.id;
    
    if (!userId) {
      throw new Error('User is not authenticated');
    }
    
    const notification: Notification = {
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
    
    return notification;
  }
}

export default new NotificationModule();
