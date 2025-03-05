/**
 * IT Service Desk - Client Application Entry Point
 * 
 * This file initializes the React application, sets up Redux store with persistence,
 * configures theme providers, and renders the root component.
 * 
 * @module client/src/index
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ThemeProvider } from 'styled-components';
import { ToastContainer } from 'react-toastify';
import axios from 'axios';

// Import store and persistor
import { store, persistor } from './store';

// Import main App component
import App from './App';

// Import global styles and theme
import { GlobalStyles } from './assets/styles/GlobalStyles';
import { theme } from './assets/styles/theme';

// Import toast styles
import 'react-toastify/dist/ReactToastify.css';

// Import custom CSS
import './App.css';

// Configure axios defaults
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Add request interceptor to include auth token
axios.interceptors.request.use(
  (config) => {
    const token = store.getState().auth?.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle common errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle session expiration
    if (error.response && error.response.status === 401) {
      // Check if the error is not from the login endpoint
      if (!error.config.url.includes('/auth/login')) {
        store.dispatch({ type: 'auth/logout' });
        // Optionally show a toast notification
        // toast.error('Your session has expired. Please log in again.');
      }
    }
    
    // Handle server errors
    if (error.response && error.response.status >= 500) {
      console.error('Server error:', error.response.data);
      // Optionally show a toast notification
      // toast.error('A server error occurred. Please try again later.');
    }
    
    return Promise.reject(error);
  }
);

// Create root element
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the application
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Router>
          <ThemeProvider theme={theme}>
            <GlobalStyles />
            <App />
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
          </ThemeProvider>
        </Router>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);

// Enable hot module replacement for development
if (module.hot) {
  module.hot.accept('./App', () => {
    const NextApp = require('./App').default;
    root.render(
      <React.StrictMode>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <Router>
              <ThemeProvider theme={theme}>
                <GlobalStyles />
                <NextApp />
                <ToastContainer
                  position="top-right"
                  autoClose={5000}
                  hideProgressBar={false}
                  newestOnTop
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                  theme="light"
                />
              </ThemeProvider>
            </Router>
          </PersistGate>
        </Provider>
      </React.StrictMode>
    );
  });
}

// Performance monitoring
const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && typeof onPerfEntry === 'function') {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

// Log performance metrics in development mode
if (process.env.NODE_ENV === 'development') {
  reportWebVitals(console.log);
}

// Log application version
console.log(
  `%c IT Service Desk %c v${process.env.REACT_APP_VERSION || '1.0.0'} %c`,
  'background:#35495e; color:#fff; padding: 3px 0;',
  'background:#41b883; color:#fff; padding: 3px 0;',
  'background:transparent'
);