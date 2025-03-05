import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import WebSocketClient from './WebSocketClient';
import { getAuthToken } from '../../utils/authUtils';

/**
 * Контекст для WebSocket соединения
 * Предоставляет доступ к состоянию соединения и методам управления
 */
const WebSocketContext = createContext(null);

/**
 * Хук для использования WebSocket контекста
 * @returns {Object} Объект с методами и состоянием WebSocket
 */
export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

/**
 * Провайдер WebSocket соединения
 * Управляет подключением к WebSocket серверу и предоставляет API для компонентов
 */
export const WebSocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const { isAuthenticated, user } = useSelector(state => state.auth);
  
  /**
   * Подключение к WebSocket серверу
   * @returns {Promise<void>}
   */
  const connect = async () => {
    if (isConnecting || isConnected) return;
    
    try {
      setIsConnecting(true);
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Инициализация клиента с данными пользователя, если они доступны
      if (user) {
        WebSocketClient.init(user.id, user.role);
      }
      
      await WebSocketClient.connect(token);
      setIsConnected(true);
      setReconnectAttempts(0);
      
      // Уведомление об успешном подключении
      if (reconnectAttempts > 0) {
        toast.success('Соединение с сервером восстановлено', {
          position: "bottom-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
        });
      }
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      setReconnectAttempts(prev => prev + 1);
      
      // Уведомление о проблемах с соединением
      if (reconnectAttempts > 2) {
        toast.error('Проблемы с подключением к серверу уведомлений', {
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
        });
      }
    } finally {
      setIsConnecting(false);
    }
  };
  
  /**
   * Отключение от WebSocket сервера
   */
  const disconnect = () => {
    if (!isConnected) return;
    
    WebSocketClient.disconnect();
    setIsConnected(false);
    setReconnectAttempts(0);
  };
  
  /**
   * Подписка на событие WebSocket
   * @param {string} event - Название события
   * @param {Function} callback - Функция-обработчик события
   * @returns {Function} Функция для отписки от события
   */
  const subscribe = (event, callback) => {
    if (!isConnected) {
      console.warn(`Attempted to subscribe to ${event} while disconnected`);
    }
    
    return WebSocketClient.subscribe(event, callback);
  };
  
  /**
   * Отправка события на сервер
   * @param {string} event - Название события
   * @param {any} data - Данные для отправки
   * @returns {boolean} Успешность отправки
   */
  const emit = (event, data) => {
    if (!isConnected) {
      console.warn(`Attempted to emit ${event} while disconnected`);
      return false;
    }
    
    return WebSocketClient.emit(event, data);
  };
  
  /**
   * Получение статуса соединения
   * @returns {boolean} Статус соединения
   */
  const getConnectionStatus = () => {
    return isConnected;
  };
  
  /**
   * Автоматическое подключение/отключение при изменении статуса аутентификации
   */
  useEffect(() => {
    if (isAuthenticated && !isConnected && !isConnecting) {
      connect();
    } else if (!isAuthenticated && isConnected) {
      disconnect();
    }
    
    // Отключаемся при размонтировании компонента
    return () => {
      if (isConnected) {
        WebSocketClient.disconnect();
      }
    };
  }, [isAuthenticated]);
  
  /**
   * Автоматическое переподключение при потере соединения
   */
  useEffect(() => {
    if (!isConnected && isAuthenticated && reconnectAttempts > 0 && reconnectAttempts < 5) {
      const reconnectTimer = setTimeout(() => {
        connect();
      }, Math.min(1000 * reconnectAttempts, 10000)); // Экспоненциальная задержка, но не более 10 секунд
      
      return () => clearTimeout(reconnectTimer);
    }
  }, [isConnected, isAuthenticated, reconnectAttempts]);
  
  // Значение контекста, предоставляемое потребителям
  const contextValue = {
    isConnected,
    isConnecting,
    reconnectAttempts,
    connect,
    disconnect,
    subscribe,
    emit,
    getConnectionStatus
  };
  
  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};

export default WebSocketProvider;