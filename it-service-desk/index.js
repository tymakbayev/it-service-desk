/**
 * IT Service Desk - Main Application Entry Point
 * 
 * This file serves as the main entry point for the IT Service Desk application.
 * It imports and configures all necessary modules, sets up routing, and exports
 * the configured application.
 * 
 * @module index
 */

// Import required modules
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import application components and services
import App from './App';
import { store, persistor } from './store';
import { WebSocketProvider } from './services/websocket/WebSocketProvider';
import reportWebVitals from './reportWebVitals';
import './assets/styles/GlobalStyles.js';

// Create root element
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render application
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
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
        </BrowserRouter>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

/**
 * Report web vitals
 * 
 * This function can be used to report web vitals metrics to an analytics service.
 * Currently, it just logs the metrics to the console in development mode.
 * 
 * @param {Object} metrics - The web vitals metrics
 */
function reportWebVitals(onPerfEntry) {
  if (onPerfEntry && typeof onPerfEntry === 'function') {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
}

// Export reportWebVitals for testing purposes
export default reportWebVitals;