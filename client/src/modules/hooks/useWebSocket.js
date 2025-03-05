/**
 * useWebSocket Hook
 * 
 * Custom hook for managing WebSocket connections in the application.
 * Provides functionality for establishing, maintaining, and interacting with
 * WebSocket connections, handling reconnection logic, and managing connection state.
 * 
 * This hook abstracts the complexity of WebSocket management, making it easier
 * to use real-time features throughout the application.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

/**
 * Custom hook for WebSocket functionality
 * @param {Object} socketService - WebSocket service instance
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoConnect - Whether to connect automatically on mount
 * @param {number} options.reconnectInterval - Interval between reconnection attempts in ms
 * @param {number} options.maxReconnectAttempts - Maximum number of reconnection attempts
 * @param {boolean} options.showToasts - Whether to show toast notifications for connection events
 * @returns {Object} WebSocket methods and state
 */
const useWebSocket = (
  socketService,
  {
    autoConnect = true,
    reconnectInterval = 5000,
    maxReconnectAttempts = 5,
    showToasts = true
  } = {}
) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimerRef = useRef(null);
  const socketRef = useRef(null);
  
  // Get authentication state from Redux store
  const { token, isAuthenticated } = useSelector((state) => state.auth);

  /**
   * Handle reconnection logic
   */
  const handleReconnect = useCallback(() => {
    // Clear any existing reconnect timer
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    
    // Check if max reconnect attempts reached
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      console.error(`Maximum reconnection attempts (${maxReconnectAttempts}) reached`);
      if (showToasts) {
        toast.error('Unable to connect to server. Please refresh the page or try again later.');
      }
      return;
    }
    
    // Increment reconnect attempts
    reconnectAttemptsRef.current += 1;
    
    // Schedule reconnect
    reconnectTimerRef.current = setTimeout(() => {
      console.log(`Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`);
      connect();
    }, reconnectInterval);
    
  }, [maxReconnectAttempts, reconnectInterval, showToasts]);

  /**
   * Connect to the WebSocket server
   * @returns {Promise<void>}
   */
  const connect = useCallback(async () => {
    // Don't connect if already connected or connecting
    if (isConnected || isConnecting) return;
    
    // Don't connect if not authenticated
    if (!isAuthenticated || !token) {
      console.log('Not connecting to WebSocket: User not authenticated');
      return;
    }
    
    try {
      setIsConnecting(true);
      setError(null);
      
      // Initialize socket connection with authentication token
      socketRef.current = await socketService.connect(token);
      
      // Set up event listeners
      socketRef.current.on('connect', () => {
        setIsConnected(true);
        setIsConnecting(false);
        reconnectAttemptsRef.current = 0;
        console.log('WebSocket connected');
        
        if (showToasts && reconnectAttemptsRef.current > 0) {
          toast.success('Reconnected to server');
        }
      });
      
      socketRef.current.on('disconnect', (reason) => {
        setIsConnected(false);
        console.log(`WebSocket disconnected: ${reason}`);
        
        // Attempt to reconnect if disconnected unexpectedly
        if (reason === 'io server disconnect' || reason === 'transport close') {
          if (showToasts) {
            toast.warning('Connection to server lost. Attempting to reconnect...');
          }
          handleReconnect();
        }
      });
      
      socketRef.current.on('connect_error', (err) => {
        setIsConnecting(false);
        setError(err.message);
        console.error('WebSocket connection error:', err);
        
        // Attempt to reconnect
        handleReconnect();
      });
      
      socketRef.current.on('error', (err) => {
        setError(err.message);
        console.error('WebSocket error:', err);
        
        if (showToasts) {
          toast.error(`WebSocket error: ${err.message}`);
        }
      });
      
    } catch (err) {
      setIsConnecting(false);
      setError(err.message);
      console.error('Failed to initialize WebSocket connection:', err);
      
      // Attempt to reconnect
      handleReconnect();
    }
  }, [isConnected, isConnecting, token, isAuthenticated, socketService, handleReconnect, showToasts]);

  /**
   * Disconnect from the WebSocket server
   */
  const disconnect = useCallback(() => {
    if (!socketRef.current) return;
    
    // Clear any pending reconnect timers
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    
    // Disconnect socket
    socketRef.current.disconnect();
    socketRef.current = null;
    setIsConnected(false);
    setIsConnecting(false);
    reconnectAttemptsRef.current = 0;
    console.log('WebSocket disconnected manually');
  }, []);

  /**
   * Subscribe to a WebSocket event
   * @param {string} event - Event name to subscribe to
   * @param {Function} callback - Callback function to execute when event is received
   * @returns {Function} Unsubscribe function
   */
  const subscribe = useCallback((event, callback) => {
    if (!socketRef.current) {
      console.warn('Cannot subscribe to event: WebSocket not connected');
      return () => {};
    }
    
    socketRef.current.on(event, callback);
    
    // Return unsubscribe function
    return () => {
      if (socketRef.current) {
        socketRef.current.off(event, callback);
      }
    };
  }, []);

  /**
   * Emit a WebSocket event
   * @param {string} event - Event name to emit
   * @param {*} data - Data to send with the event
   * @param {Function} [callback] - Optional callback for acknowledgement
   * @returns {boolean} Success status
   */
  const emit = useCallback((event, data, callback) => {
    if (!socketRef.current || !isConnected) {
      console.warn(`Cannot emit event '${event}': WebSocket not connected`);
      return false;
    }
    
    socketRef.current.emit(event, data, callback);
    return true;
  }, [isConnected]);

  /**
   * Get the current socket instance
   * @returns {Object|null} Socket instance or null if not connected
   */
  const getSocket = useCallback(() => {
    return socketRef.current;
  }, []);

  // Connect on mount if autoConnect is true and user is authenticated
  useEffect(() => {
    if (autoConnect && isAuthenticated && token) {
      connect();
    }
    
    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [autoConnect, isAuthenticated, token, connect, disconnect]);

  // Reconnect when authentication state changes
  useEffect(() => {
    if (isAuthenticated && token) {
      // Reconnect if we have a token and we're not already connected/connecting
      if (!isConnected && !isConnecting) {
        connect();
      }
    } else {
      // Disconnect if we're not authenticated
      if (isConnected) {
        disconnect();
      }
    }
  }, [isAuthenticated, token, isConnected, isConnecting, connect, disconnect]);

  return {
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    subscribe,
    emit,
    getSocket
  };
};

export default useWebSocket;