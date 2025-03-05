/**
 * IT Service Desk - Redux Store Configuration
 * 
 * This file configures the Redux store for the application, including:
 * - Setting up the root reducer
 * - Configuring middleware
 * - Setting up Redux Persist for state persistence
 * - Configuring Redux DevTools
 * - Exporting typed hooks for use throughout the application
 * 
 * @module client/src/store
 */

import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { useDispatch, useSelector } from 'react-redux';
import logger from 'redux-logger';

// Import root reducer
import rootReducer from './store/rootReducer';

// Persist configuration
const persistConfig = {
  key: 'root',
  storage,
  // Blacklist state slices that shouldn't be persisted (e.g., large data or sensitive info)
  blacklist: ['notifications'],
  // Whitelist specific state slices to persist (alternative to blacklist)
  // whitelist: ['auth'],
};

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Middleware configuration
const middleware = (getDefaultMiddleware) => {
  const middlewareArray = getDefaultMiddleware({
    serializableCheck: {
      // Ignore non-serializable values in the specified paths
      ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      ignoredPaths: ['notifications.socket'],
    },
    immutableCheck: true,
    thunk: true,
  });

  // Add logger middleware only in development
  if (process.env.NODE_ENV === 'development') {
    middlewareArray.push(logger);
  }

  return middlewareArray;
};

// Configure the Redux store
const store = configureStore({
  reducer: persistedReducer,
  middleware,
  devTools: process.env.NODE_ENV !== 'production',
});

// Create persistor
const persistor = persistStore(store);

// Export store and persistor
export { store, persistor };

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Define typed hooks for use throughout the application
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T>(selector: (state: RootState) => T): T => useSelector<RootState, T>(selector);

export default store;