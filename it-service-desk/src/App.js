/**
 * IT Service Desk - Main Application Component
 * 
 * This component serves as the root of the application, handling:
 * - Routing configuration
 * - Authentication state management
 * - Layout structure
 * - Protected routes
 * - WebSocket connection management
 * - Global notifications
 * 
 * @module client/src/App
 */

import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// Components
import Layout from './components/Layout';
import Loader from './components/common/Loader';

// Hooks
import useAuth from './hooks/useAuth';
import useWebSocket from './hooks/useWebSocket';

// Services
import { initializeWebSocket } from './services/websocket/websocketClient';

// Store actions
import { fetchUserProfile } from './modules/auth/store/authSlice';
import { fetchNotifications } from './modules/notifications/store/notificationsSlice';

// Constants
import { ROLES } from './utils/constants';

// Lazy-loaded page components for better performance
const LoginPage = lazy(() => import('./modules/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('./modules/auth/pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./modules/auth/pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./modules/auth/pages/ResetPasswordPage'));
const ProfilePage = lazy(() => import('./modules/auth/pages/ProfilePage'));
const DashboardPage = lazy(() => import('./modules/dashboard/pages/DashboardPage'));
const IncidentsPage = lazy(() => import('./modules/incidents/pages/IncidentsPage'));
const IncidentDetailPage = lazy(() => import('./modules/incidents/pages/IncidentDetailPage'));
const CreateIncidentPage = lazy(() => import('./modules/incidents/pages/CreateIncidentPage'));
const EquipmentPage = lazy(() => import('./modules/equipment/pages/EquipmentPage'));
const EquipmentDetailPage = lazy(() => import('./modules/equipment/pages/EquipmentDetailPage'));
const CreateEquipmentPage = lazy(() => import('./modules/equipment/pages/CreateEquipmentPage'));
const NotificationsPage = lazy(() => import('./modules/notifications/pages/NotificationsPage'));
const ReportsPage = lazy(() => import('./modules/reports/pages/ReportsPage'));
const GenerateReportPage = lazy(() => import('./modules/reports/pages/GenerateReportPage'));
const ViewReportPage = lazy(() => import('./modules/reports/pages/ViewReportPage'));
const NotFoundPage = lazy(() => import('./components/NotFoundPage'));

/**
 * Protected Route component that checks authentication status
 * and redirects to login if not authenticated
 */
const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login page with return URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access if requiredRoles is provided and not empty
  if (requiredRoles.length > 0 && (!user || !requiredRoles.includes(user.role))) {
    toast.error("You don't have permission to access this page");
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

/**
 * Main App component
 */
const App = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useAuth();
  const { connect, disconnect } = useWebSocket();
  const notifications = useSelector(state => state.notifications.unreadCount);

  // Initialize user data on app load if authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      // Fetch user profile data
      dispatch(fetchUserProfile());
      
      // Fetch notifications
      dispatch(fetchNotifications());
      
      // Initialize WebSocket connection
      connect();
      
      // Cleanup WebSocket connection on unmount
      return () => {
        disconnect();
      };
    }
  }, [isAuthenticated, user, dispatch, connect, disconnect]);

  // Handle new notifications
  useEffect(() => {
    if (notifications > 0) {
      // Show notification badge or toast for new notifications
      document.title = `(${notifications}) IT Service Desk`;
    } else {
      document.title = 'IT Service Desk';
    }
  }, [notifications]);

  // Loading fallback for lazy-loaded components
  const renderLoader = () => (
    <div className="page-loader">
      <Loader size="large" />
    </div>
  );

  return (
    <div className="app-container">
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
      />
      
      <Suspense fallback={renderLoader()}>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
          } />
          <Route path="/register" element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />
          } />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          
          {/* Protected routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            {/* Dashboard */}
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            
            {/* User profile */}
            <Route path="profile" element={<ProfilePage />} />
            
            {/* Incidents */}
            <Route path="incidents" element={<IncidentsPage />} />
            <Route path="incidents/new" element={<CreateIncidentPage />} />
            <Route path="incidents/:id" element={<IncidentDetailPage />} />
            
            {/* Equipment */}
            <Route path="equipment" element={<EquipmentPage />} />
            <Route path="equipment/new" element={
              <ProtectedRoute requiredRoles={[ROLES.ADMIN, ROLES.TECHNICIAN]}>
                <CreateEquipmentPage />
              </ProtectedRoute>
            } />
            <Route path="equipment/:id" element={<EquipmentDetailPage />} />
            
            {/* Notifications */}
            <Route path="notifications" element={<NotificationsPage />} />
            
            {/* Reports */}
            <Route path="reports" element={
              <ProtectedRoute requiredRoles={[ROLES.ADMIN, ROLES.TECHNICIAN]}>
                <ReportsPage />
              </ProtectedRoute>
            } />
            <Route path="reports/generate" element={
              <ProtectedRoute requiredRoles={[ROLES.ADMIN, ROLES.TECHNICIAN]}>
                <GenerateReportPage />
              </ProtectedRoute>
            } />
            <Route path="reports/:id" element={
              <ProtectedRoute requiredRoles={[ROLES.ADMIN, ROLES.TECHNICIAN]}>
                <ViewReportPage />
              </ProtectedRoute>
            } />
          </Route>
          
          {/* 404 Not Found */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </div>
  );
};

export default App;