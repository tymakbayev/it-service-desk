/**
 * IT Service Desk - Redux Store Configuration
 * 
 * This file configures the Redux store for the application, including:
 * - Setting up the root reducer with all feature reducers
 * - Configuring middleware (thunk, logger, etc.)
 * - Setting up Redux Persist for state persistence
 * - Exporting typed hooks for use throughout the application
 * 
 * @module store/index
 */

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';

// Import reducers from feature modules
import authReducer from '../modules/auth/store/authSlice';
import incidentsReducer from '../modules/incidents/store/incidentsSlice';
import equipmentReducer from '../modules/equipment/store/equipmentSlice';
import dashboardReducer from '../modules/dashboard/store/dashboardSlice';
import notificationsReducer from '../modules/notifications/store/notificationsSlice';
import reportsReducer from '../modules/reports/store/reportsSlice';

// Configure Redux Logger
const logger = createLogger({
  collapsed: true,
  duration: true,
  diff: true,
  colors: {
    title: () => '#139BFE',
    prevState: () => '#9E9E9E',
    action: () => '#149945',
    nextState: () => '#A47104',
    error: () => '#FF0000',
  },
});

// Configure Redux Persist
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'], // Only persist auth state
  blacklist: ['notifications', 'dashboard'], // Don't persist these states
};

// Auth-specific persist config for more granular control
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['token', 'user', 'isAuthenticated'],
};

// Combine all reducers
const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  incidents: incidentsReducer,
  equipment: equipmentReducer,
  dashboard: dashboardReducer,
  notifications: notificationsReducer,
  reports: reportsReducer,
});

// Apply root persist config
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure middleware based on environment
const getMiddleware = (getDefaultMiddleware) => {
  const middleware = getDefaultMiddleware({
    serializableCheck: {
      ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      // Ignore these paths in the state
      ignoredPaths: ['notifications.socket'],
    },
    immutableCheck: { warnAfter: 300 },
    thunk: { extraArgument: {} },
  }).concat(thunk);

  // Add logger middleware only in development
  if (process.env.NODE_ENV === 'development') {
    return middleware.concat(logger);
  }

  return middleware;
};

// Create the Redux store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: getMiddleware,
  devTools: process.env.NODE_ENV !== 'production',
  preloadedState: {},
  enhancers: [],
});

// Create the persistor
export const persistor = persistStore(store);

// Export types for TypeScript support
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Import hook types
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

// Export a reset store action creator
export const resetStore = () => ({
  type: 'RESET_STORE',
});

// Export a store enhancer for development tools
export const getStoreWithState = (preloadedState = {}) => {
  return configureStore({
    reducer: persistedReducer,
    middleware: getMiddleware,
    devTools: process.env.NODE_ENV !== 'production',
    preloadedState,
  });
};

// Default export
export default {
  store,
  persistor,
  resetStore,
  getStoreWithState,
};