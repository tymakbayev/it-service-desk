import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import WebSocketClient from './WebSocketClient';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface WebSocketContextType {
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  subscribe: (event: string, callback: Function) => () => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  useEffect(() => {
    // Подключаемся к WebSocket только если пользователь аутентифицирован
    if (isAuthenticated) {
      const connectWebSocket = async () => {
        try {
          await WebSocketClient.connect();
          setIsConnected(true);
        } catch (error) {
          console.error('Failed to connect to WebSocket:', error);
          setIsConnected(false);
        }
      };
      
      connectWebSocket();
    } else {
      // Отключаемся, если пользователь вышел из системы
      WebSocketClient.disconnect();
      setIsConnected(false);
    }
    
    // Отключаемся при размонтировании компонента
    return () => {
      WebSocketClient.disconnect();
      setIsConnected(false);
    };
  }, [isAuthenticated]);
  
  const connect = async () => {
    try {
      await WebSocketClient.connect();
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      setIsConnected(false);
      throw error;
    }
  };
  
  const disconnect = () => {
    WebSocketClient.disconnect();
    setIsConnected(false);
  };
  
  const subscribe = (event: string, callback: Function) => {
    return WebSocketClient.subscribe(event, callback);
  };
  
  const value = {
    isConnected,
    connect,
    disconnect,
    subscribe
  };
  
  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};
