/**
 * IT Service Desk - Root Reducer
 * 
 * This file combines all feature reducers into a single root reducer for the Redux store.
 * It handles global state reset, persistence configuration, and provides mechanisms for 
 * cross-slice state management.
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

const reportsPersistConfig = {
  key: 'reports',
  storage,
  whitelist: ['filters', 'sortOrder', 'viewMode'],
  blacklist: ['loading', 'error', 'items', 'selectedReport'],
};

// Create the app reducer with all feature reducers
const appReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  incidents: persistReducer(incidentsPersistConfig, incidentsReducer),
  equipment: persistReducer(equipmentPersistConfig, equipmentReducer),
  dashboard: dashboardReducer,
  notifications: persistReducer(notificationsPersistConfig, notificationsReducer),
  reports: persistReducer(reportsPersistConfig, reportsReducer),
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
    storage.removeItem('persist:reports');
    
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
  
  // Handle session expiration
  if (action.type === 'auth/sessionExpired') {
    // Similar to logout but with a different action type
    const newState = {
      ...state,
      auth: undefined,
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
  
  // Handle cross-slice state updates
  if (action.type === 'incidents/createIncident/fulfilled' || 
      action.type === 'incidents/updateIncident/fulfilled') {
    // When an incident is created or updated, we might want to update dashboard stats
    // This is handled by the dashboard slice's extraReducers, but we could add additional
    // cross-slice logic here if needed
  }
  
  if (action.type === 'equipment/createEquipment/fulfilled' || 
      action.type === 'equipment/updateEquipment/fulfilled') {
    // Similar to incidents, equipment changes might affect dashboard stats
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
        status: null,
        priority: null,
        assignedTo: null,
        dateRange: null,
      },
      sortOrder: 'desc',
      viewMode: 'list',
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
      },
    },
    equipment: {
      items: [],
      selectedEquipment: null,
      loading: false,
      error: null,
      filters: {
        type: null,
        status: null,
        location: null,
      },
      sortOrder: 'desc',
      viewMode: 'grid',
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
      },
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
      preferences: {
        email: true,
        browser: true,
        mobile: false,
      },
    },
    reports: {
      items: [],
      selectedReport: null,
      loading: false,
      error: null,
      filters: {
        type: null,
        dateRange: null,
        createdBy: null,
      },
      sortOrder: 'desc',
      viewMode: 'list',
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
      },
    },
  };
};

export default rootReducer;