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
import { UserRole } from '../utils/constants';

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
  whitelist: ['filters', 'reportTypes', 'lastGeneratedReport'],
  blacklist: ['loading', 'error', 'items', 'currentReport'],
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
  
  // Handle role changes - update permissions and accessible features
  if (action.type === 'auth/updateUserRole/fulfilled') {
    const { role } = action.payload;
    const newState = { ...state };
    
    // Update permissions based on new role
    if (role === UserRole.USER) {
      // Regular users have limited access
      newState.reports = {
        ...state.reports,
        canCreateReports: false,
        canExportReports: false,
      };
      newState.equipment = {
        ...state.equipment,
        canManageEquipment: false,
      };
    } else if (role === UserRole.TECHNICIAN) {
      // Technicians have more access
      newState.reports = {
        ...state.reports,
        canCreateReports: true,
        canExportReports: true,
      };
      newState.equipment = {
        ...state.equipment,
        canManageEquipment: true,
      };
    } else if (role === UserRole.ADMIN) {
      // Admins have full access
      newState.reports = {
        ...state.reports,
        canCreateReports: true,
        canExportReports: true,
        canManageAllReports: true,
      };
      newState.equipment = {
        ...state.equipment,
        canManageEquipment: true,
        canManageAllEquipment: true,
      };
    }
    
    return appReducer(newState, action);
  }
  
  // Handle cross-slice state updates
  if (action.type === 'incidents/createIncident/fulfilled') {
    // When a new incident is created, update the dashboard stats
    if (state.dashboard) {
      const newState = {
        ...state,
        dashboard: {
          ...state.dashboard,
          stats: {
            ...state.dashboard.stats,
            totalIncidents: (state.dashboard.stats.totalIncidents || 0) + 1,
            openIncidents: (state.dashboard.stats.openIncidents || 0) + 1,
          },
          needsRefresh: true,
        },
      };
      return appReducer(newState, action);
    }
  }
  
  if (action.type === 'equipment/createEquipment/fulfilled') {
    // When new equipment is added, update the dashboard stats
    if (state.dashboard) {
      const newState = {
        ...state,
        dashboard: {
          ...state.dashboard,
          stats: {
            ...state.dashboard.stats,
            totalEquipment: (state.dashboard.stats.totalEquipment || 0) + 1,
          },
          needsRefresh: true,
        },
      };
      return appReducer(newState, action);
    }
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
      token: null,
      user: null,
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
        assignedTo: 'all',
        dateRange: null,
      },
      sortOrder: {
        field: 'createdAt',
        direction: 'desc',
      },
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
      },
      viewMode: 'list',
    },
    equipment: {
      items: [],
      selectedEquipment: null,
      loading: false,
      error: null,
      filters: {
        status: 'all',
        type: 'all',
        location: 'all',
      },
      sortOrder: {
        field: 'name',
        direction: 'asc',
      },
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
      },
      viewMode: 'grid',
      canManageEquipment: false,
      canManageAllEquipment: false,
    },
    dashboard: {
      stats: {
        totalIncidents: 0,
        openIncidents: 0,
        resolvedIncidents: 0,
        totalEquipment: 0,
        activeEquipment: 0,
        avgResolutionTime: 0,
      },
      recentIncidents: [],
      charts: {
        incidentsByStatus: [],
        incidentsByPriority: [],
        incidentsTrend: [],
        equipmentByStatus: [],
      },
      loading: false,
      error: null,
      needsRefresh: false,
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
        type: 'all',
        dateRange: null,
        createdBy: 'all',
      },
      reportTypes: [
        { id: 'incident-summary', name: 'Incident Summary' },
        { id: 'equipment-inventory', name: 'Equipment Inventory' },
        { id: 'performance-metrics', name: 'Performance Metrics' },
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
      },
      canCreateReports: false,
      canExportReports: false,
      canManageAllReports: false,
      lastGeneratedReport: null,
    },
  };
};

export default rootReducer;