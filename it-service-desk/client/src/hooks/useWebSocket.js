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
 * @returns {Object} WebSocket methods and state
 */
export const useWebSocket = (
  socketService,
  {
    autoConnect = true,
    reconnectInterval = 5000,
    maxReconnectAttempts = 5
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
   * Connect to the WebSocket server
   * @returns {Promise<void>}
   */
  const connect = useCallback(async () => {
    // Don't connect if already connected or connecting
    if (isConnected || isConnecting) return;
    
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
      });
      
      socketRef.current.on('disconnect', (reason) => {
        setIsConnected(false);
        console.log(`WebSocket disconnected: ${reason}`);
        
        // Attempt to reconnect if disconnected unexpectedly
        if (reason === 'io server disconnect' || reason === 'transport close') {
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
      });
      
    } catch (err) {
      setIsConnecting(false);
      setError(err.message);
      console.error('Failed to initialize WebSocket connection:', err);
      
      // Attempt to reconnect
      handleReconnect();
    }
  }, [isConnected, isConnecting, token, socketService]);

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
   * Handle reconnection logic
   */
  const handleReconnect = useCallback(() => {
    // Clear any existing reconnect timer
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    
    // Check if we've exceeded the maximum number of reconnection attempts
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      console.error(`Failed to reconnect after ${maxReconnectAttempts} attempts`);
      toast.error('Connection to server lost. Please refresh the page.');
      return;
    }
    
    // Increment reconnection attempts counter
    reconnectAttemptsRef.current += 1;
    
    // Schedule reconnection attempt
    reconnectTimerRef.current = setTimeout(() => {
      console.log(`Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`);
      connect();
    }, reconnectInterval);
  }, [connect, maxReconnectAttempts, reconnectInterval]);

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
   * @param {Function} [ack] - Optional acknowledgement callback
   * @returns {boolean} Success status
   */
  const emit = useCallback((event, data, ack) => {
    if (!socketRef.current || !isConnected) {
      console.warn('Cannot emit event: WebSocket not connected');
      return false;
    }
    
    socketRef.current.emit(event, data, ack);
    return true;
  }, [isConnected]);

  /**
   * Send a message with acknowledgement (Promise-based)
   * @param {string} event - Event name to emit
   * @param {*} data - Data to send with the event
   * @param {number} [timeout=5000] - Timeout in milliseconds
   * @returns {Promise<*>} Promise resolving to the acknowledgement data
   */
  const emitWithAck = useCallback((event, data, timeout = 5000) => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current || !isConnected) {
        reject(new Error('WebSocket not connected'));
        return;
      }
      
      // Create timeout for the acknowledgement
      const timeoutId = setTimeout(() => {
        reject(new Error(`WebSocket acknowledgement timeout for event: ${event}`));
      }, timeout);
      
      // Emit event with acknowledgement callback
      socketRef.current.emit(event, data, (response) => {
        clearTimeout(timeoutId);
        
        if (response && response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
    });
  }, [isConnected]);

  /**
   * Get the current socket instance
   * @returns {Object|null} Socket instance or null if not connected
   */
  const getSocket = useCallback(() => {
    return socketRef.current;
  }, []);

  // Connect to WebSocket when component mounts if autoConnect is true
  useEffect(() => {
    // Only auto-connect if the user is authenticated and autoConnect is true
    if (autoConnect && isAuthenticated && token) {
      connect();
    }
    
    // Cleanup function to disconnect WebSocket when component unmounts
    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [autoConnect, connect, isAuthenticated, token]);

  // Reconnect when authentication state changes (e.g., user logs in)
  useEffect(() => {
    if (isAuthenticated && token && !isConnected && !isConnecting && autoConnect) {
      connect();
    } else if (!isAuthenticated && isConnected) {
      disconnect();
    }
  }, [isAuthenticated, token, isConnected, isConnecting, autoConnect, connect, disconnect]);

  return {
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    subscribe,
    emit,
    emitWithAck,
    getSocket,
    reconnectAttempts: reconnectAttemptsRef.current
  };
};

export default useWebSocket;