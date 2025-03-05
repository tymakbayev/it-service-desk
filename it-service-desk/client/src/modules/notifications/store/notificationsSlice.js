import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import notificationsApi from '../../../services/api/notificationsApi';

/**
 * Notification types
 */
export const NOTIFICATION_TYPES = {
  INFO: 'INFO',
  WARNING: 'WARNING',
  ERROR: 'ERROR',
  SUCCESS: 'SUCCESS',
  INCIDENT_ASSIGNED: 'INCIDENT_ASSIGNED',
  INCIDENT_STATUS_CHANGED: 'INCIDENT_STATUS_CHANGED',
  INCIDENT_COMMENT_ADDED: 'INCIDENT_COMMENT_ADDED',
  EQUIPMENT_STATUS_CHANGED: 'EQUIPMENT_STATUS_CHANGED',
  REPORT_GENERATED: 'REPORT_GENERATED',
  SYSTEM: 'SYSTEM'
};

/**
 * Initial state for notifications slice
 */
const initialState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  lastFetched: null
};

/**
 * Async thunk to fetch all notifications for the current user
 */
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationsApi.getNotifications();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

/**
 * Async thunk to mark a notification as read
 */
export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      const response = await notificationsApi.markAsRead(notificationId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

/**
 * Async thunk to mark all notifications as read
 */
export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationsApi.markAllAsRead();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

/**
 * Async thunk to delete a notification
 */
export const deleteNotification = createAsyncThunk(
  'notifications/delete',
  async (notificationId, { rejectWithValue }) => {
    try {
      await notificationsApi.deleteNotification(notificationId);
      return notificationId;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

/**
 * Async thunk to clear all notifications
 */
export const clearAllNotifications = createAsyncThunk(
  'notifications/clearAll',
  async (_, { rejectWithValue }) => {
    try {
      await notificationsApi.clearAllNotifications();
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

/**
 * Notifications slice
 */
const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    /**
     * Add a new notification (typically from WebSocket)
     */
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.read) {
        state.unreadCount += 1;
      }
    },
    
    /**
     * Reset notifications error state
     */
    resetError: (state) => {
      state.error = null;
    },
    
    /**
     * Update unread count (typically after WebSocket notification)
     */
    updateUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },
    
    /**
     * Reset notifications state (typically on logout)
     */
    resetNotifications: () => initialState
  },
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload.notifications;
        state.unreadCount = action.payload.unreadCount;
        state.lastFetched = new Date().toISOString();
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || { message: 'Failed to fetch notifications' };
      })
      
      // Mark as read
      .addCase(markAsRead.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        state.isLoading = false;
        const { notificationId } = action.payload;
        
        // Find and update the notification
        const notification = state.notifications.find(n => n._id === notificationId);
        if (notification && !notification.read) {
          notification.read = true;
          notification.readAt = new Date().toISOString();
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAsRead.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || { message: 'Failed to mark notification as read' };
      })
      
      // Mark all as read
      .addCase(markAllAsRead.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.isLoading = false;
        state.notifications = state.notifications.map(notification => ({
          ...notification,
          read: true,
          readAt: notification.readAt || new Date().toISOString()
        }));
        state.unreadCount = 0;
      })
      .addCase(markAllAsRead.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || { message: 'Failed to mark all notifications as read' };
      })
      
      // Delete notification
      .addCase(deleteNotification.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.isLoading = false;
        const notificationId = action.payload;
        
        // Find the notification to check if it was unread
        const notification = state.notifications.find(n => n._id === notificationId);
        
        // Remove the notification
        state.notifications = state.notifications.filter(n => n._id !== notificationId);
        
        // Update unread count if needed
        if (notification && !notification.read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || { message: 'Failed to delete notification' };
      })
      
      // Clear all notifications
      .addCase(clearAllNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(clearAllNotifications.fulfilled, (state) => {
        state.isLoading = false;
        state.notifications = [];
        state.unreadCount = 0;
      })
      .addCase(clearAllNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || { message: 'Failed to clear notifications' };
      });
  }
});

// Export actions
export const { 
  addNotification, 
  resetError, 
  updateUnreadCount, 
  resetNotifications 
} = notificationsSlice.actions;

// Selectors
export const selectNotifications = state => state.notifications.notifications;
export const selectUnreadCount = state => state.notifications.unreadCount;
export const selectIsLoading = state => state.notifications.isLoading;
export const selectError = state => state.notifications.error;
export const selectLastFetched = state => state.notifications.lastFetched;

// Export reducer
export default notificationsSlice.reducer;