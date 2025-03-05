/**
 * IT Service Desk - Root Reducer
 * 
 * This file combines all feature reducers into a single root reducer for the Redux store.
 * It also handles global state reset and provides a mechanism for cross-slice state management.
 * 
 * @module store/rootReducer
 */

import { combineReducers } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

// Import all feature reducers
import authReducer from '../modules/auth/store/authSlice';
import incidentsReducer from '../modules/incidents/store/incidentsSlice';
import equipmentReducer from '../modules/equipment/store/equipmentSlice';
import dashboardReducer from '../modules/dashboard/store/dashboardSlice';
import notificationsReducer from '../modules/notifications/store/notificationsSlice';
import reportsReducer from '../modules/reports/store/reportsSlice';

// Define persist configurations for specific slices
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['token', 'user', 'isAuthenticated', 'role'],
};

const notificationsPersistConfig = {
  key: 'notifications',
  storage,
  whitelist: ['unreadCount', 'preferences'],
  blacklist: ['socket', 'loading', 'error'],
};

const equipmentPersistConfig = {
  key: 'equipment',
  storage,
  whitelist: ['filters', 'sortOrder', 'viewMode'],
  blacklist: ['loading', 'error', 'items'],
};

const incidentsPersistConfig = {
  key: 'incidents',
  storage,
  whitelist: ['filters', 'sortOrder', 'viewMode'],
  blacklist: ['loading', 'error', 'items'],
};

// Create the app reducer with all feature reducers
const appReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  incidents: persistReducer(incidentsPersistConfig, incidentsReducer),
  equipment: persistReducer(equipmentPersistConfig, equipmentReducer),
  dashboard: dashboardReducer,
  notifications: persistReducer(notificationsPersistConfig, notificationsReducer),
  reports: reportsReducer,
});

/**
 * Root reducer with state reset capability
 * When the RESET_STORE action is dispatched, the entire state is reset
 * When the user logs out, the state is partially reset (preserving some UI preferences)
 * 
 * @param {Object} state - The current Redux state
 * @param {Object} action - The dispatched action
 * @returns {Object} The new state
 */
const rootReducer = (state, action) => {
  // Handle complete store reset
  if (action.type === 'RESET_STORE') {
    // Clear persisted state from storage
    storage.removeItem('persist:root');
    storage.removeItem('persist:auth');
    storage.removeItem('persist:notifications');
    storage.removeItem('persist:equipment');
    storage.removeItem('persist:incidents');
    
    // Return undefined to get initial state for all reducers
    return appReducer(undefined, action);
  }
  
  // Handle logout - preserve some UI state but clear sensitive/user-specific data
  if (action.type === 'auth/logout/fulfilled') {
    // Create a new state object with only the parts we want to keep
    const newState = {
      ...state,
      // Clear auth state completely
      auth: undefined,
      // Clear user-specific data but keep UI preferences
      incidents: {
        ...state.incidents,
        items: [],
        selectedIncident: null,
        loading: false,
        error: null,
      },
      equipment: {
        ...state.equipment,
        items: [],
        selectedEquipment: null,
        loading: false,
        error: null,
      },
      notifications: {
        ...state.notifications,
        items: [],
        unreadCount: 0,
        loading: false,
        error: null,
      },
      dashboard: undefined,
      reports: {
        ...state.reports,
        items: [],
        selectedReport: null,
        loading: false,
        error: null,
      },
    };
    
    return appReducer(newState, action);
  }
  
  // Normal state updates
  return appReducer(state, action);
};

/**
 * Get the initial state for testing purposes
 * @returns {Object} The initial state of the application
 */
export const getInitialState = () => {
  return {
    auth: {
      user: null,
      token: null,
      isAuthenticated: false,
      role: null,
      loading: false,
      error: null,
    },
    incidents: {
      items: [],
      selectedIncident: null,
      loading: false,
      error: null,
      filters: {
        status: 'all',
        priority: 'all',
        assignee: 'all',
        dateRange: null,
      },
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
      },
      sortOrder: {
        field: 'createdAt',
        direction: 'desc',
      },
      viewMode: 'list',
    },
    equipment: {
      items: [],
      selectedEquipment: null,
      loading: false,
      error: null,
      filters: {
        type: 'all',
        status: 'all',
        location: 'all',
      },
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
      },
      sortOrder: {
        field: 'name',
        direction: 'asc',
      },
      viewMode: 'grid',
    },
    dashboard: {
      statistics: null,
      recentIncidents: [],
      equipmentStatus: null,
      performanceMetrics: null,
      loading: false,
      error: null,
      timeRange: 'week',
    },
    notifications: {
      items: [],
      unreadCount: 0,
      loading: false,
      error: null,
      socket: null,
      preferences: {
        email: true,
        browser: true,
        desktop: false,
      },
    },
    reports: {
      items: [],
      selectedReport: null,
      loading: false,
      error: null,
      filters: {
        type: 'all',
        dateRange: null,
      },
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
      },
    },
  };
};

/**
 * Reset action creator
 * Dispatching this action will reset the entire Redux store
 * @returns {Object} Reset action
 */
export const resetStore = () => ({
  type: 'RESET_STORE',
});

export default rootReducer;