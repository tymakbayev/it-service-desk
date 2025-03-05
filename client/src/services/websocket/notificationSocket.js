import { store } from '../../store';
import { addNotification, markAsRead, markAllAsRead } from '../../modules/notifications/store/notificationsSlice';
import websocketClient from './websocketClient';
import { toast } from 'react-toastify';
import { NOTIFICATION_TYPES, NOTIFICATION_PRIORITIES } from '../../utils/constants';

/**
 * NotificationSocket - модуль для работы с уведомлениями через WebSocket
 * Обеспечивает получение, обработку и отображение уведомлений в реальном времени
 */
class NotificationSocket {
  constructor() {
    this.subscriptions = [];
    this.notificationHandlers = new Map();
    this.isInitialized = false;
    this.userId = null;
  }

  /**
   * Инициализация подписок на уведомления
   * @param {string} userId - ID текущего пользователя
   * @returns {Promise<void>}
   */
  async initialize(userId) {
    if (this.isInitialized) {
      return;
    }

    this.userId = userId;

    try {
      // Убедимся, что WebSocket подключен
      if (!websocketClient.isConnected) {
        await websocketClient.connect();
      }

      // Подписка на все уведомления
      this.subscriptions.push(
        websocketClient.subscribe('notification', this.handleNotification.bind(this))
      );

      // Подписка на конкретные типы уведомлений
      Object.values(NOTIFICATION_TYPES).forEach(type => {
        this.subscriptions.push(
          websocketClient.subscribe(`notification:${type}`, 
            (notification) => this.handleTypedNotification(type, notification))
        );
      });

      // Подписка на уведомления для конкретного пользователя
      if (userId) {
        this.subscriptions.push(
          websocketClient.subscribe(`notification:user:${userId}`, 
            (notification) => this.handleUserNotification(notification))
        );
      }

      this.isInitialized = true;
      console.log('Notification socket initialized successfully');
    } catch (error) {
      console.error('Failed to initialize notification socket:', error);
      throw error;
    }
  }

  /**
   * Очистка всех подписок при размонтировании компонента
   */
  cleanup() {
    this.subscriptions.forEach(unsubscribe => unsubscribe());
    this.subscriptions = [];
    this.notificationHandlers.clear();
    this.isInitialized = false;
    this.userId = null;
  }

  /**
   * Обработчик для всех входящих уведомлений
   * @param {Object} notification - объект уведомления
   */
  handleNotification(notification) {
    // Добавляем уведомление в Redux store
    store.dispatch(addNotification(notification));

    // Показываем toast-уведомление в зависимости от приоритета
    this.showToastNotification(notification);

    // Вызываем все общие обработчики уведомлений
    const handlers = this.notificationHandlers.get('all') || [];
    handlers.forEach(handler => handler(notification));
  }

  /**
   * Обработчик для уведомлений определенного типа
   * @param {string} type - тип уведомления
   * @param {Object} notification - объект уведомления
   */
  handleTypedNotification(type, notification) {
    // Вызываем обработчики для конкретного типа уведомления
    const handlers = this.notificationHandlers.get(type) || [];
    handlers.forEach(handler => handler(notification));
  }

  /**
   * Обработчик для уведомлений, предназначенных конкретному пользователю
   * @param {Object} notification - объект уведомления
   */
  handleUserNotification(notification) {
    // Добавляем уведомление в Redux store
    store.dispatch(addNotification(notification));

    // Показываем toast-уведомление с более высоким приоритетом
    this.showToastNotification({
      ...notification,
      priority: NOTIFICATION_PRIORITIES.HIGH
    });

    // Вызываем обработчики для пользовательских уведомлений
    const handlers = this.notificationHandlers.get('user') || [];
    handlers.forEach(handler => handler(notification));
  }

  /**
   * Отображение toast-уведомления в зависимости от приоритета
   * @param {Object} notification - объект уведомления
   */
  showToastNotification(notification) {
    const { title, message, priority, type } = notification;
    
    // Настройки для toast-уведомления
    const toastOptions = {
      position: "top-right",
      autoClose: this.getAutoCloseTime(priority),
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      onClick: () => this.markNotificationAsRead(notification._id)
    };

    // Выбор типа toast-уведомления в зависимости от приоритета
    switch (priority) {
      case NOTIFICATION_PRIORITIES.HIGH:
        toast.error(`${title}: ${message}`, toastOptions);
        break;
      case NOTIFICATION_PRIORITIES.MEDIUM:
        toast.warning(`${title}: ${message}`, toastOptions);
        break;
      case NOTIFICATION_PRIORITIES.LOW:
      default:
        toast.info(`${title}: ${message}`, toastOptions);
        break;
    }
  }

  /**
   * Определение времени автозакрытия toast-уведомления в зависимости от приоритета
   * @param {string} priority - приоритет уведомления
   * @returns {number} время в миллисекундах
   */
  getAutoCloseTime(priority) {
    switch (priority) {
      case NOTIFICATION_PRIORITIES.HIGH:
        return 10000; // 10 секунд для высокого приоритета
      case NOTIFICATION_PRIORITIES.MEDIUM:
        return 7000; // 7 секунд для среднего приоритета
      case NOTIFICATION_PRIORITIES.LOW:
      default:
        return 5000; // 5 секунд для низкого приоритета
    }
  }

  /**
   * Добавление обработчика для определенного типа уведомлений
   * @param {string} type - тип уведомления или 'all' для всех типов
   * @param {Function} handler - функция-обработчик
   * @returns {Function} функция для отписки
   */
  addNotificationHandler(type, handler) {
    if (!this.notificationHandlers.has(type)) {
      this.notificationHandlers.set(type, []);
    }
    
    const handlers = this.notificationHandlers.get(type);
    handlers.push(handler);
    
    // Возвращаем функцию для отписки
    return () => {
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    };
  }

  /**
   * Отправка уведомления через WebSocket
   * @param {Object} notification - объект уведомления
   * @returns {Promise<void>}
   */
  async sendNotification(notification) {
    try {
      if (!websocketClient.isConnected) {
        await websocketClient.connect();
      }
      
      websocketClient.emit('send-notification', notification);
    } catch (error) {
      console.error('Failed to send notification:', error);
      throw error;
    }
  }

  /**
   * Отметить уведомление как прочитанное
   * @param {string} notificationId - ID уведомления
   */
  markNotificationAsRead(notificationId) {
    store.dispatch(markAsRead(notificationId));
    
    // Отправляем информацию на сервер
    if (websocketClient.isConnected) {
      websocketClient.emit('mark-notification-read', { 
        notificationId, 
        userId: this.userId 
      });
    }
  }

  /**
   * Отметить все уведомления как прочитанные
   */
  markAllNotificationsAsRead() {
    store.dispatch(markAllAsRead());
    
    // Отправляем информацию на сервер
    if (websocketClient.isConnected && this.userId) {
      websocketClient.emit('mark-all-notifications-read', { 
        userId: this.userId 
      });
    }
  }

  /**
   * Получение статуса инициализации
   * @returns {boolean} статус инициализации
   */
  getInitializationStatus() {
    return this.isInitialized;
  }

  /**
   * Подписка на уведомления для конкретного инцидента
   * @param {string} incidentId - ID инцидента
   * @param {Function} callback - функция обратного вызова
   * @returns {Function} функция для отписки
   */
  subscribeToIncidentNotifications(incidentId, callback) {
    if (!websocketClient.isConnected) {
      console.warn('WebSocket not connected, cannot subscribe to incident notifications');
      return () => {};
    }
    
    return websocketClient.subscribe(`notification:incident:${incidentId}`, callback);
  }

  /**
   * Подписка на уведомления для конкретного оборудования
   * @param {string} equipmentId - ID оборудования
   * @param {Function} callback - функция обратного вызова
   * @returns {Function} функция для отписки
   */
  subscribeToEquipmentNotifications(equipmentId, callback) {
    if (!websocketClient.isConnected) {
      console.warn('WebSocket not connected, cannot subscribe to equipment notifications');
      return () => {};
    }
    
    return websocketClient.subscribe(`notification:equipment:${equipmentId}`, callback);
  }
}

// Создаем и экспортируем синглтон
const notificationSocket = new NotificationSocket();
export default notificationSocket;