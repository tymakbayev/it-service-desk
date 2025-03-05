import io from 'socket.io-client';
import { store } from '../../store';
import { addNotification } from '../../modules/notifications/store/notificationsSlice';
import { updateIncident } from '../../modules/incidents/store/incidentsSlice';
import { updateEquipment } from '../../modules/equipment/store/equipmentSlice';
import { refreshDashboardData } from '../../modules/dashboard/store/dashboardSlice';
import { toast } from 'react-toastify';

/**
 * WebSocketClient - класс для управления WebSocket соединением
 * Обеспечивает подключение к серверу, обработку событий и управление подписками
 */
class WebSocketClient {
  constructor() {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000; // 3 секунды
    this.subscriptions = new Map();
    this.isConnected = false;
    this.connectionPromise = null;
    this.userId = null;
    this.userRole = null;
    this.eventHandlers = {};
  }

  /**
   * Инициализация клиента с данными пользователя
   * @param {string} userId - ID пользователя
   * @param {string} userRole - Роль пользователя
   */
  init(userId, userRole) {
    this.userId = userId;
    this.userRole = userRole;
    
    // Если уже есть соединение, обновляем данные пользователя на сервере
    if (this.isConnected && this.socket) {
      this.socket.emit('user:update', { userId, userRole });
    }
  }

  /**
   * Получение токена авторизации из localStorage
   * @returns {string|null} JWT токен или null, если токен не найден
   */
  getAuthToken() {
    return localStorage.getItem('token');
  }

  /**
   * Подключение к WebSocket серверу
   * @param {string} [token] - JWT токен для аутентификации (опционально)
   * @returns {Promise<void>} Promise, который разрешается при успешном подключении
   */
  connect(token) {
    // Если уже есть активное подключение или попытка подключения, вернем существующий Promise
    if (this.isConnected || this.connectionPromise) {
      return this.connectionPromise || Promise.resolve();
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        const authToken = token || this.getAuthToken();
        
        if (!authToken) {
          reject(new Error('Authentication token not found'));
          this.connectionPromise = null;
          return;
        }
        
        // Создаем соединение с сервером, передавая токен для аутентификации
        this.socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
          auth: {
            token: authToken
          },
          reconnection: true,
          reconnectionAttempts: this.maxReconnectAttempts,
          reconnectionDelay: this.reconnectDelay,
          transports: ['websocket', 'polling']
        });
        
        // Обработка успешного подключения
        this.socket.on('connect', () => {
          console.log('WebSocket connected successfully');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          
          // Если есть данные пользователя, отправляем их на сервер
          if (this.userId && this.userRole) {
            this.socket.emit('user:update', { 
              userId: this.userId, 
              userRole: this.userRole 
            });
          }
          
          resolve();
          this.connectionPromise = null;
        });
        
        // Обработка ошибок подключения
        this.socket.on('connect_error', (error) => {
          console.error('WebSocket connection error:', error);
          this.reconnectAttempts++;
          
          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            this.isConnected = false;
            reject(new Error(`Failed to connect after ${this.maxReconnectAttempts} attempts`));
            this.connectionPromise = null;
          }
        });
        
        // Обработка отключения
        this.socket.on('disconnect', (reason) => {
          console.log('WebSocket disconnected:', reason);
          this.isConnected = false;
          
          // Если отключение не было инициировано клиентом, пытаемся переподключиться
          if (reason === 'io server disconnect') {
            // Сервер разорвал соединение, нужно переподключиться вручную
            this.connect(authToken).catch(err => console.error('Reconnection failed:', err));
          }
          // В остальных случаях socket.io попытается переподключиться автоматически
        });
        
        // Обработка входящих уведомлений
        this.socket.on('notification', (notification) => {
          // Добавляем уведомление в Redux store
          store.dispatch(addNotification(notification));
          
          // Показываем toast-уведомление, если оно важное
          if (notification.priority === 'high') {
            toast.info(notification.message, {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true
            });
          }
          
          // Вызываем все подписанные обработчики для этого типа уведомлений
          const handlers = this.subscriptions.get('notification') || [];
          handlers.forEach(handler => handler(notification));
        });
        
        // Обработка обновлений инцидентов
        this.socket.on('incident:update', (incident) => {
          store.dispatch(updateIncident(incident));
          
          // Вызываем все подписанные обработчики для обновлений инцидентов
          const handlers = this.subscriptions.get('incident:update') || [];
          handlers.forEach(handler => handler(incident));
        });
        
        // Обработка обновлений оборудования
        this.socket.on('equipment:update', (equipment) => {
          store.dispatch(updateEquipment(equipment));
          
          // Вызываем все подписанные обработчики для обновлений оборудования
          const handlers = this.subscriptions.get('equipment:update') || [];
          handlers.forEach(handler => handler(equipment));
        });
        
        // Обработка обновлений данных дашборда
        this.socket.on('dashboard:update', () => {
          store.dispatch(refreshDashboardData());
          
          // Вызываем все подписанные обработчики для обновлений дашборда
          const handlers = this.subscriptions.get('dashboard:update') || [];
          handlers.forEach(handler => handler());
        });
        
        // Обработка ошибок
        this.socket.on('error', (error) => {
          console.error('WebSocket error:', error);
          toast.error(`WebSocket error: ${error.message || 'Unknown error'}`);
        });
        
        // Регистрируем все пользовательские обработчики событий
        Object.entries(this.eventHandlers).forEach(([event, handlers]) => {
          handlers.forEach(handler => {
            this.socket.on(event, handler);
          });
        });
        
      } catch (error) {
        console.error('Failed to initialize WebSocket connection:', error);
        this.isConnected = false;
        reject(error);
        this.connectionPromise = null;
      }
    });
    
    return this.connectionPromise;
  }

  /**
   * Отключение от WebSocket сервера
   */
  disconnect() {
    if (this.socket && this.isConnected) {
      this.socket.disconnect();
      this.isConnected = false;
      console.log('WebSocket disconnected by client');
    }
  }

  /**
   * Подписка на событие WebSocket
   * @param {string} event - Название события
   * @param {Function} callback - Функция-обработчик события
   * @returns {Function} Функция для отписки от события
   */
  subscribe(event, callback) {
    if (!this.subscriptions.has(event)) {
      this.subscriptions.set(event, []);
    }
    
    const handlers = this.subscriptions.get(event);
    handlers.push(callback);
    
    // Возвращаем функцию для отписки
    return () => {
      const index = handlers.indexOf(callback);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    };
  }

  /**
   * Отправка события на сервер
   * @param {string} event - Название события
   * @param {any} data - Данные для отправки
   * @returns {Promise<void>} Promise, который разрешается при успешной отправке
   */
  async emit(event, data) {
    if (!this.isConnected) {
      try {
        await this.connect();
      } catch (error) {
        throw new Error(`Failed to connect to WebSocket server: ${error.message}`);
      }
    }
    
    return new Promise((resolve, reject) => {
      this.socket.emit(event, data, (response) => {
        if (response && response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
    });
  }

  /**
   * Регистрация обработчика события
   * @param {string} event - Название события
   * @param {Function} handler - Функция-обработчик события
   */
  on(event, handler) {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = [];
    }
    
    this.eventHandlers[event].push(handler);
    
    // Если соединение уже установлено, добавляем обработчик сразу
    if (this.socket && this.isConnected) {
      this.socket.on(event, handler);
    }
  }

  /**
   * Удаление обработчика события
   * @param {string} event - Название события
   * @param {Function} handler - Функция-обработчик события для удаления
   */
  off(event, handler) {
    if (!this.eventHandlers[event]) {
      return;
    }
    
    // Удаляем обработчик из списка
    const index = this.eventHandlers[event].indexOf(handler);
    if (index !== -1) {
      this.eventHandlers[event].splice(index, 1);
    }
    
    // Если соединение установлено, удаляем обработчик
    if (this.socket && this.isConnected) {
      this.socket.off(event, handler);
    }
  }

  /**
   * Отправка уведомления о прочтении
   * @param {string} notificationId - ID уведомления
   * @returns {Promise<void>} Promise, который разрешается при успешной отправке
   */
  async markNotificationAsRead(notificationId) {
    return this.emit('notification:read', { notificationId });
  }

  /**
   * Отправка уведомления о прочтении всех уведомлений
   * @returns {Promise<void>} Promise, который разрешается при успешной отправке
   */
  async markAllNotificationsAsRead() {
    return this.emit('notification:readAll');
  }

  /**
   * Подписка на обновления инцидентов
   * @param {Function} callback - Функция-обработчик обновлений
   * @returns {Function} Функция для отписки
   */
  subscribeToIncidentUpdates(callback) {
    return this.subscribe('incident:update', callback);
  }

  /**
   * Подписка на обновления оборудования
   * @param {Function} callback - Функция-обработчик обновлений
   * @returns {Function} Функция для отписки
   */
  subscribeToEquipmentUpdates(callback) {
    return this.subscribe('equipment:update', callback);
  }

  /**
   * Подписка на обновления дашборда
   * @param {Function} callback - Функция-обработчик обновлений
   * @returns {Function} Функция для отписки
   */
  subscribeToDashboardUpdates(callback) {
    return this.subscribe('dashboard:update', callback);
  }

  /**
   * Подписка на уведомления
   * @param {Function} callback - Функция-обработчик уведомлений
   * @returns {Function} Функция для отписки
   */
  subscribeToNotifications(callback) {
    return this.subscribe('notification', callback);
  }

  /**
   * Проверка статуса подключения
   * @returns {boolean} true, если соединение установлено
   */
  isConnectedToServer() {
    return this.isConnected;
  }

  /**
   * Получение ID сокета
   * @returns {string|null} ID сокета или null, если соединение не установлено
   */
  getSocketId() {
    return this.socket && this.isConnected ? this.socket.id : null;
  }
}

// Создаем и экспортируем единственный экземпляр WebSocketClient
const websocketClient = new WebSocketClient();
export default websocketClient;