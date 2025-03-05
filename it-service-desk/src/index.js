/**
 * IT Service Desk - Client Application Entry Point
 * 
 * This file initializes the React application, sets up Redux store with persistence,
 * configures theme providers, and renders the root component.
 * 
 * @module src/index
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ThemeProvider } from 'styled-components';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import store configuration
import { store, persistor } from './store';

// Import WebSocket provider
import { WebSocketProvider } from './services/websocket/WebSocketProvider';

// Import main App component
import App from './App';

// Import global styles and theme
import './App.css';
import theme from './utils/theme';

// Import service worker registration for PWA support
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

// Create root element
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the application
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <ThemeProvider theme={theme}>
            <WebSocketProvider>
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
            </WebSocketProvider>
          </ThemeProvider>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register({
  onUpdate: (registration) => {
    const waitingServiceWorker = registration.waiting;
    
    if (waitingServiceWorker) {
      waitingServiceWorker.addEventListener("statechange", (event) => {
        if (event.target.state === "activated") {
          window.location.reload();
        }
      });
      waitingServiceWorker.postMessage({ type: "SKIP_WAITING" });
    }
  },
});

// Enable hot module replacement for development
if (process.env.NODE_ENV === 'development' && module.hot) {
  module.hot.accept('./App', () => {
    // eslint-disable-next-line global-require
    const NextApp = require('./App').default;
    root.render(
      <React.StrictMode>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <BrowserRouter>
              <ThemeProvider theme={theme}>
                <WebSocketProvider>
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
                </WebSocketProvider>
              </ThemeProvider>
            </BrowserRouter>
          </PersistGate>
        </Provider>
      </React.StrictMode>
    );
  });
}

// Log environment information in development mode
if (process.env.NODE_ENV === 'development') {
  console.log('Running in development mode');
  console.log('API URL:', process.env.REACT_APP_API_URL);
  console.log('WebSocket URL:', process.env.REACT_APP_WS_URL);
  console.log('Version:', process.env.REACT_APP_VERSION);
}

// Add error tracking
window.addEventListener('error', (event) => {
  // Log client-side errors
  console.error('Global error:', event.error);
  
  // You could send these errors to your backend or a monitoring service
  if (process.env.NODE_ENV === 'production') {
    // Example: Send error to backend
    fetch(`${process.env.REACT_APP_API_URL}/api/logs/error`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: event.error?.message || 'Unknown error',
        stack: event.error?.stack,
        url: window.location.href,
        timestamp: new Date().toISOString(),
      }),
    }).catch(err => console.error('Failed to report error:', err));
  }
});

// Add unhandled promise rejection tracking
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  
  // Similar error reporting logic as above
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to backend
    fetch(`${process.env.REACT_APP_API_URL}/api/logs/error`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: event.reason?.message || 'Unhandled promise rejection',
        stack: event.reason?.stack,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        type: 'unhandledrejection',
      }),
    }).catch(err => console.error('Failed to report rejection:', err));
  }
});

// Create serviceWorkerRegistration.js file if it doesn't exist
// This is a placeholder and would normally be generated by create-react-app
if (typeof serviceWorkerRegistration === 'undefined') {
  console.warn('Service worker registration is not available');
}

// Export for testing purposes
export { store, persistor };