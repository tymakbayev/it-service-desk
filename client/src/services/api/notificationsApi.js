/**
 * Notifications API Service
 * Handles all notification-related API requests
 */
import apiClient from './apiClient';

/**
 * Notification API endpoints
 */
const NOTIFICATION_ENDPOINTS = {
  GET_ALL: '/notifications',
  GET_UNREAD: '/notifications/unread',
  GET_BY_ID: '/notifications',
  MARK_AS_READ: '/notifications/read',
  MARK_ALL_AS_READ: '/notifications/read-all',
  DELETE: '/notifications',
  GET_SETTINGS: '/notifications/settings',
  UPDATE_SETTINGS: '/notifications/settings',
};

/**
 * Notification type definition
 * @typedef {Object} Notification
 * @property {string} _id - Notification ID
 * @property {string} userId - User ID
 * @property {string} title - Notification title
 * @property {string} message - Notification message
 * @property {string} type - Notification type (info, warning, error, success)
 * @property {string} [relatedItemId] - ID of related item (incident, equipment, etc.)
 * @property {string} [relatedItemType] - Type of related item (incident, equipment, etc.)
 * @property {boolean} isRead - Whether notification has been read
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 */

/**
 * Notification settings type definition
 * @typedef {Object} NotificationSettings
 * @property {boolean} emailNotifications - Whether to receive email notifications
 * @property {boolean} pushNotifications - Whether to receive push notifications
 * @property {boolean} incidentUpdates - Whether to receive incident update notifications
 * @property {boolean} equipmentUpdates - Whether to receive equipment update notifications
 * @property {boolean} systemNotifications - Whether to receive system notifications
 * @property {string[]} notificationTypes - Types of notifications to receive
 */

/**
 * Notification query parameters
 * @typedef {Object} NotificationQueryParams
 * @property {number} [page=1] - Page number for pagination
 * @property {number} [limit=10] - Number of items per page
 * @property {boolean} [unreadOnly=false] - Whether to return only unread notifications
 * @property {string} [type] - Filter by notification type
 * @property {string} [relatedItemType] - Filter by related item type
 * @property {string} [sortBy='createdAt'] - Field to sort by
 * @property {string} [sortOrder='desc'] - Sort order (asc or desc)
 */

/**
 * Notifications API service
 */
const notificationsApi = {
  /**
   * Get all notifications for the current user
   * @param {NotificationQueryParams} params - Query parameters
   * @returns {Promise<{notifications: Notification[], total: number, page: number, limit: number}>} Paginated notifications
   */
  getAll: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Add pagination parameters
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      
      // Add filter parameters
      if (params.unreadOnly) queryParams.append('unreadOnly', 'true');
      if (params.type) queryParams.append('type', params.type);
      if (params.relatedItemType) queryParams.append('relatedItemType', params.relatedItemType);
      
      // Add sorting parameters
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      
      const url = `${NOTIFICATION_ENDPOINTS.GET_ALL}?${queryParams.toString()}`;
      return await apiClient.get(url);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get unread notifications for the current user
   * @param {number} [limit=10] - Number of notifications to return
   * @returns {Promise<{notifications: Notification[], total: number}>} Unread notifications
   */
  getUnread: async (limit = 10) => {
    try {
      const url = `${NOTIFICATION_ENDPOINTS.GET_UNREAD}?limit=${limit}`;
      return await apiClient.get(url);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get a notification by ID
   * @param {string} id - Notification ID
   * @returns {Promise<Notification>} Notification details
   */
  getById: async (id) => {
    try {
      if (!id) {
        throw new Error('Notification ID is required');
      }
      return await apiClient.get(`${NOTIFICATION_ENDPOINTS.GET_BY_ID}/${id}`);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Mark a notification as read
   * @param {string} id - Notification ID
   * @returns {Promise<Notification>} Updated notification
   */
  markAsRead: async (id) => {
    try {
      if (!id) {
        throw new Error('Notification ID is required');
      }
      return await apiClient.patch(`${NOTIFICATION_ENDPOINTS.MARK_AS_READ}/${id}`);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Mark all notifications as read for the current user
   * @returns {Promise<{success: boolean, count: number}>} Result with count of updated notifications
   */
  markAllAsRead: async () => {
    try {
      return await apiClient.patch(NOTIFICATION_ENDPOINTS.MARK_ALL_AS_READ);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete a notification
   * @param {string} id - Notification ID
   * @returns {Promise<{success: boolean, message: string}>} Result message
   */
  delete: async (id) => {
    try {
      if (!id) {
        throw new Error('Notification ID is required');
      }
      return await apiClient.delete(`${NOTIFICATION_ENDPOINTS.DELETE}/${id}`);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete multiple notifications
   * @param {string[]} ids - Array of notification IDs
   * @returns {Promise<{success: boolean, count: number}>} Result with count of deleted notifications
   */
  deleteMultiple: async (ids) => {
    try {
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new Error('Valid notification IDs array is required');
      }
      return await apiClient.post(`${NOTIFICATION_ENDPOINTS.DELETE}/batch`, { ids });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get notification settings for the current user
   * @returns {Promise<NotificationSettings>} User's notification settings
   */
  getSettings: async () => {
    try {
      return await apiClient.get(NOTIFICATION_ENDPOINTS.GET_SETTINGS);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update notification settings for the current user
   * @param {NotificationSettings} settings - New notification settings
   * @returns {Promise<NotificationSettings>} Updated notification settings
   */
  updateSettings: async (settings) => {
    try {
      if (!settings || typeof settings !== 'object') {
        throw new Error('Valid notification settings object is required');
      }
      return await apiClient.put(NOTIFICATION_ENDPOINTS.UPDATE_SETTINGS, settings);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Subscribe to specific notification types
   * @param {string[]} types - Array of notification types to subscribe to
   * @returns {Promise<{success: boolean, message: string}>} Result message
   */
  subscribeToTypes: async (types) => {
    try {
      if (!types || !Array.isArray(types) || types.length === 0) {
        throw new Error('Valid notification types array is required');
      }
      return await apiClient.post(`${NOTIFICATION_ENDPOINTS.UPDATE_SETTINGS}/subscribe`, { types });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Unsubscribe from specific notification types
   * @param {string[]} types - Array of notification types to unsubscribe from
   * @returns {Promise<{success: boolean, message: string}>} Result message
   */
  unsubscribeFromTypes: async (types) => {
    try {
      if (!types || !Array.isArray(types) || types.length === 0) {
        throw new Error('Valid notification types array is required');
      }
      return await apiClient.post(`${NOTIFICATION_ENDPOINTS.UPDATE_SETTINGS}/unsubscribe`, { types });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get notification count for the current user
   * @param {boolean} [unreadOnly=true] - Whether to count only unread notifications
   * @returns {Promise<{count: number}>} Notification count
   */
  getCount: async (unreadOnly = true) => {
    try {
      const url = `${NOTIFICATION_ENDPOINTS.GET_ALL}/count?unreadOnly=${unreadOnly}`;
      return await apiClient.get(url);
    } catch (error) {
      throw error;
    }
  }
};

export default notificationsApi;