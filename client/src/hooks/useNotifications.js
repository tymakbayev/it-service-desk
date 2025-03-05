import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// Import notification actions and selectors
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  addNotification,
  updateNotificationCount
} from '../modules/notifications/store/notificationsSlice';

// Import WebSocket hook
import { useWebSocket } from './useWebSocket';
import notificationSocket from '../services/websocket/notificationSocket';

/**
 * Custom hook for notification functionality
 * Provides methods for fetching, marking as read, and subscribing to real-time notifications
 * 
 * @returns {Object} Notification methods and state
 */
const useNotifications = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isSubscribed, setIsSubscribed] = useState(false);
  
  // Select notifications state from Redux store
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    totalCount,
    page,
    limit
  } = useSelector((state) => state.notifications);
  
  // Get user from auth state
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  
  // Initialize WebSocket connection
  const { socket, isConnected } = useWebSocket(notificationSocket);

  /**
   * Subscribe to real-time notifications when authenticated
   */
  useEffect(() => {
    if (isAuthenticated && user && isConnected && !isSubscribed) {
      // Subscribe to user-specific notification channel
      socket.emit('subscribe', { userId: user.id });
      setIsSubscribed(true);
      
      // Handle incoming notifications
      socket.on('notification', (notification) => {
        dispatch(addNotification(notification));
        dispatch(updateNotificationCount(1));
        
        // Show toast notification for new notifications
        toast.info(notification.message, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      });
      
      // Cleanup function
      return () => {
        if (socket) {
          socket.off('notification');
          socket.emit('unsubscribe', { userId: user.id });
          setIsSubscribed(false);
        }
      };
    }
  }, [isAuthenticated, user, isConnected, socket, dispatch, isSubscribed]);

  /**
   * Load notifications when component mounts and user is authenticated
   */
  useEffect(() => {
    if (isAuthenticated && user) {
      loadNotifications();
    }
  }, [isAuthenticated, user]);

  /**
   * Load user notifications from the server
   * @param {Object} params - Query parameters for pagination and filtering
   * @returns {Promise} Promise resolving to the notifications
   */
  const loadNotifications = useCallback(async (params = { page: 1, limit: 10 }) => {
    try {
      if (!isAuthenticated) return;
      
      const result = await dispatch(fetchNotifications(params)).unwrap();
      return result;
    } catch (err) {
      console.error('Failed to load notifications:', err);
      toast.error('Failed to load notifications');
    }
  }, [dispatch, isAuthenticated]);

  /**
   * Mark a notification as read
   * @param {string} notificationId - ID of the notification to mark as read
   * @returns {Promise} Promise resolving to the updated notification
   */
  const markNotificationAsRead = useCallback(async (notificationId) => {
    try {
      const result = await dispatch(markAsRead(notificationId)).unwrap();
      return result;
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      toast.error('Failed to mark notification as read');
    }
  }, [dispatch]);

  /**
   * Mark all notifications as read
   * @returns {Promise} Promise resolving to the operation result
   */
  const markAllNotificationsAsRead = useCallback(async () => {
    try {
      const result = await dispatch(markAllAsRead()).unwrap();
      return result;
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
      toast.error('Failed to mark all notifications as read');
    }
  }, [dispatch]);

  /**
   * Delete a notification
   * @param {string} notificationId - ID of the notification to delete
   * @returns {Promise} Promise resolving to the operation result
   */
  const removeNotification = useCallback(async (notificationId) => {
    try {
      const result = await dispatch(deleteNotification(notificationId)).unwrap();
      return result;
    } catch (err) {
      console.error('Failed to delete notification:', err);
      toast.error('Failed to delete notification');
    }
  }, [dispatch]);

  /**
   * Navigate to the related entity when a notification is clicked
   * @param {Object} notification - The notification object
   */
  const handleNotificationClick = useCallback((notification) => {
    // Mark notification as read
    markNotificationAsRead(notification._id);
    
    // Navigate to the related entity based on notification type
    if (notification.type === 'INCIDENT') {
      navigate(`/incidents/${notification.entityId}`);
    } else if (notification.type === 'EQUIPMENT') {
      navigate(`/equipment/${notification.entityId}`);
    } else if (notification.type === 'REPORT') {
      navigate(`/reports/${notification.entityId}`);
    } else if (notification.type === 'SYSTEM') {
      // System notifications might not have a specific page to navigate to
      // You could navigate to a system status page or just mark as read
    } else {
      // Default to notifications page
      navigate('/notifications');
    }
  }, [markNotificationAsRead, navigate]);

  /**
   * Get the count of unread notifications
   * @returns {number} Count of unread notifications
   */
  const getUnreadCount = useCallback(() => {
    return unreadCount;
  }, [unreadCount]);

  /**
   * Load more notifications (pagination)
   * @returns {Promise} Promise resolving to the additional notifications
   */
  const loadMoreNotifications = useCallback(async () => {
    if (isLoading || notifications.length >= totalCount) {
      return;
    }
    
    const nextPage = page + 1;
    return loadNotifications({ page: nextPage, limit });
  }, [isLoading, loadNotifications, notifications.length, page, totalCount, limit]);

  /**
   * Refresh notifications
   * @returns {Promise} Promise resolving to the refreshed notifications
   */
  const refreshNotifications = useCallback(() => {
    return loadNotifications({ page: 1, limit });
  }, [loadNotifications, limit]);

  return {
    // State
    notifications,
    unreadCount,
    isLoading,
    error,
    totalCount,
    page,
    limit,
    
    // Methods
    loadNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    removeNotification,
    handleNotificationClick,
    getUnreadCount,
    loadMoreNotifications,
    refreshNotifications,
    
    // WebSocket state
    isConnected,
    isSubscribed
  };
};

export default useNotifications;