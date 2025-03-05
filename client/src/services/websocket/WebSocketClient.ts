import { io, Socket } from 'socket.io-client';
import { store } from '../../store';
import NotificationModule from '../../modules/notifications/NotificationModule';
import { Notification } from '../../modules/notifications/NotificationTypes';
import { getAuthToken } from '../../utils/auth';

class WebSocketClient {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000; // 3 seconds
  private subscriptions: Map<string, Function[]> = new Map();
  
  /**
   * Подключение к WebSocket серверу
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const token = getAuthToken();
        
        if (!token) {
          reject(new Error('Authentication token not found'));
          return;
        }
        
        // Создаем соединение с сервером, передавая токен для аутентификации
        this.socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
          auth: {
            token
          },
          reconnection: true,
          reconnectionAttempts: this.maxReconnectAttempts,
          reconnectionDelay: this.reconnectDelay
        });
        
        this.socket.on('connect', () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          resolve();
        });
        
        this.socket.on('connect_error', (error) => {
          console.error('WebSocket connection error:', error);
          this.reconnectAttempts++;
          
          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            reject(new Error(`Failed to connect after ${this.maxReconnectAttempts} attempts`));
          }
        });
        
        this.socket.on('disconnect', (reason) => {
          console.log('WebSocket disconnected:', reason);
        });
        
        // Обработка входящих уведомлений
        this.socket.on('notification', (notification: Notification) => {
          NotificationModule.showNotification(notification);
          
          // Вызываем все подписанные обработчики для этого типа уведомлений
          const handlers = this.subscriptions.get('notification') || [];
          handlers.forEach(handler => handler(notification));
          
          // Вызываем обработчики для конкретного типа уведомления, если они есть
          const specificHandlers = this.subscriptions.get(`notification:${notification.type}`) || [];
          specificHandlers.forEach(handler => handler(notification));
        });
        
        // Обработка обновлений инцидентов
        this.socket.on('incident_update', (data) => {
          const handlers = this.subscriptions.get('incident_update') || [];
          handlers.forEach(handler => handler(data));
        });
        
        // Обработка обновлений оборудования
        this.socket.on('equipment_update', (data) => {
          const handlers = this.subscriptions.get('equipment_update') || [];
          handlers.forEach(handler => handler(data));
        });
      } catch (error) {
        reject(error);
      }
    });
  }
  
  /**
   * Отключение от WebSocket сервера
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
  
  /**
   * Подписка на определенный тип событий
   */
  subscribe(event: string, callback: Function): () => void {
    if (!this.subscriptions.has(event)) {
      this.subscriptions.set(event, []);
    }
    
    const handlers = this.subscriptions.get(event)!;
    handlers.push(callback);
    
    // Возвращаем функцию для отписки
    return () => this.unsubscribe(event, callback);
  }
  
  /**
   * Отписка от определенного типа событий
   */
  unsubscribe(event: string, callback: Function): void {
    if (!this.subscriptions.has(event)) {
      return;
    }
    
    const handlers = this.subscriptions.get(event)!;
    const index = handlers.indexOf(callback);
    
    if (index !== -1) {
      handlers.splice(index, 1);
    }
    
    if (handlers.length === 0) {
      this.subscriptions.delete(event);
    }
  }
  
  /**
   * Проверка состояния подключения
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
  
  /**
   * Отправка события на сервер
   */
  emit(event: string, data: any): void {
    if (!this.socket || !this.isConnected()) {
      throw new Error('WebSocket is not connected');
    }
    
    this.socket.emit(event, data);
  }
}

export default new WebSocketClient();
