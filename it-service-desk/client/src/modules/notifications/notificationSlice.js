/**
 * notificationSlice.js
 * 
 * Redux slice для управления состоянием уведомлений в приложении IT Service Desk.
 * Обеспечивает функциональность для получения, добавления, обновления и удаления уведомлений,
 * а также для отслеживания непрочитанных уведомлений.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../services/api/apiClient';
import { NotificationType } from './NotificationTypes';

/**
 * Начальное состояние для slice уведомлений
 */
const initialState = {
  notifications: [],        // Список всех уведомлений
  unreadCount: 0,           // Количество непрочитанных уведомлений
  loading: false,           // Флаг загрузки
  error: null,              // Ошибка, если есть
  filter: 'all',            // Фильтр уведомлений (all, unread, read)
  sortBy: 'date',           // Сортировка (date, priority, type)
  sortDirection: 'desc',    // Направление сортировки (asc, desc)
  page: 1,                  // Текущая страница для пагинации
  limit: 10,                // Количество уведомлений на странице
  totalPages: 1,            // Общее количество страниц
  totalCount: 0             // Общее количество уведомлений
};

/**
 * Асинхронный thunk для получения уведомлений с сервера
 */
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { page = 1, limit = 10, filter = 'all', sortBy = 'date', sortDirection = 'desc' } = params;
      const response = await apiClient.get('/notifications', {
        params: { page, limit, filter, sortBy, sortDirection }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
    }
  }
);

/**
 * Асинхронный thunk для получения количества непрочитанных уведомлений
 */
export const fetchUnreadCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/notifications/unread-count');
      return response.data.count;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch unread count');
    }
  }
);

/**
 * Асинхронный thunk для отметки уведомления как прочитанного
 */
export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark notification as read');
    }
  }
);

/**
 * Асинхронный thunk для отметки всех уведомлений как прочитанных
 */
export const markAllNotificationsAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.put('/notifications/read-all');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark all notifications as read');
    }
  }
);

/**
 * Асинхронный thunk для удаления уведомления
 */
export const removeNotification = createAsyncThunk(
  'notifications/removeNotification',
  async (notificationId, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/notifications/${notificationId}`);
      return notificationId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove notification');
    }
  }
);

/**
 * Асинхронный thunk для удаления всех уведомлений
 */
export const clearAllNotifications = createAsyncThunk(
  'notifications/clearAll',
  async (_, { rejectWithValue }) => {
    try {
      await apiClient.delete('/notifications');
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to clear all notifications');
    }
  }
);

/**
 * Redux slice для уведомлений
 */
const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    /**
     * Добавляет новое уведомление в список
     */
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
      state.totalCount += 1;
    },
    
    /**
     * Очищает список уведомлений (локально, без обращения к API)
     */
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
      state.totalCount = 0;
      state.totalPages = 1;
    },
    
    /**
     * Устанавливает фильтр для уведомлений
     */
    setNotificationFilter: (state, action) => {
      state.filter = action.payload;
      state.page = 1; // Сбрасываем на первую страницу при изменении фильтра
    },
    
    /**
     * Устанавливает параметры сортировки
     */
    setNotificationSort: (state, action) => {
      const { sortBy, sortDirection } = action.payload;
      state.sortBy = sortBy;
      state.sortDirection = sortDirection;
    },
    
    /**
     * Устанавливает текущую страницу для пагинации
     */
    setNotificationPage: (state, action) => {
      state.page = action.payload;
    },
    
    /**
     * Устанавливает количество элементов на странице
     */
    setNotificationLimit: (state, action) => {
      state.limit = action.payload;
      state.page = 1; // Сбрасываем на первую страницу при изменении лимита
    },
    
    /**
     * Обновляет уведомление в списке
     */
    updateNotification: (state, action) => {
      const index = state.notifications.findIndex(n => n.id === action.payload.id);
      if (index !== -1) {
        // Если уведомление было непрочитанным и стало прочитанным
        if (!state.notifications[index].isRead && action.payload.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        // Если уведомление было прочитанным и стало непрочитанным
        else if (state.notifications[index].isRead && !action.payload.isRead) {
          state.unreadCount += 1;
        }
        state.notifications[index] = action.payload;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Обработка fetchNotifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.notifications;
        state.totalCount = action.payload.totalCount;
        state.totalPages = action.payload.totalPages;
        state.unreadCount = action.payload.unreadCount;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch notifications';
      })
      
      // Обработка fetchUnreadCount
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      
      // Обработка markNotificationAsRead
      .addCase(markNotificationAsRead.pending, (state) => {
        state.error = null;
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const index = state.notifications.findIndex(n => n.id === action.payload.id);
        if (index !== -1) {
          state.notifications[index] = action.payload;
          if (state.notifications[index].isRead) {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
        }
      })
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        state.error = action.payload || 'Failed to mark notification as read';
      })
      
      // Обработка markAllNotificationsAsRead
      .addCase(markAllNotificationsAsRead.pending, (state) => {
        state.error = null;
      })
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.notifications.forEach(notification => {
          notification.isRead = true;
        });
        state.unreadCount = 0;
      })
      .addCase(markAllNotificationsAsRead.rejected, (state, action) => {
        state.error = action.payload || 'Failed to mark all notifications as read';
      })
      
      // Обработка removeNotification
      .addCase(removeNotification.pending, (state) => {
        state.error = null;
      })
      .addCase(removeNotification.fulfilled, (state, action) => {
        const index = state.notifications.findIndex(n => n.id === action.payload);
        if (index !== -1) {
          // Если удаляемое уведомление было непрочитанным, уменьшаем счетчик
          if (!state.notifications[index].isRead) {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
          state.notifications.splice(index, 1);
          state.totalCount -= 1;
        }
      })
      .addCase(removeNotification.rejected, (state, action) => {
        state.error = action.payload || 'Failed to remove notification';
      })
      
      // Обработка clearAllNotifications
      .addCase(clearAllNotifications.pending, (state) => {
        state.error = null;
      })
      .addCase(clearAllNotifications.fulfilled, (state) => {
        state.notifications = [];
        state.unreadCount = 0;
        state.totalCount = 0;
        state.totalPages = 1;
      })
      .addCase(clearAllNotifications.rejected, (state, action) => {
        state.error = action.payload || 'Failed to clear all notifications';
      });
  }
});

// Экспорт actions
export const { 
  addNotification, 
  clearNotifications, 
  setNotificationFilter, 
  setNotificationSort, 
  setNotificationPage, 
  setNotificationLimit,
  updateNotification
} = notificationSlice.actions;

// Селекторы
export const selectAllNotifications = (state) => state.notifications.notifications;
export const selectUnreadCount = (state) => state.notifications.unreadCount;
export const selectNotificationsLoading = (state) => state.notifications.loading;
export const selectNotificationsError = (state) => state.notifications.error;
export const selectNotificationFilter = (state) => state.notifications.filter;
export const selectNotificationSort = (state) => ({
  sortBy: state.notifications.sortBy,
  sortDirection: state.notifications.sortDirection
});
export const selectNotificationPagination = (state) => ({
  page: state.notifications.page,
  limit: state.notifications.limit,
  totalPages: state.notifications.totalPages,
  totalCount: state.notifications.totalCount
});

// Селектор для фильтрации уведомлений по типу
export const selectNotificationsByType = (state, type) => {
  return state.notifications.notifications.filter(notification => notification.type === type);
};

// Селектор для получения непрочитанных уведомлений
export const selectUnreadNotifications = (state) => {
  return state.notifications.notifications.filter(notification => !notification.isRead);
};

// Селектор для получения прочитанных уведомлений
export const selectReadNotifications = (state) => {
  return state.notifications.notifications.filter(notification => notification.isRead);
};

// Экспорт reducer
export default notificationSlice.reducer;