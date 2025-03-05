/**
 * IT Service Desk - Application Routes Configuration
 * 
 * This file defines all routes for the application, including:
 * - Public routes (login, register, etc.)
 * - Protected routes requiring authentication
 * - Role-based routes (admin, technician, user)
 * - Nested routes for feature modules
 * 
 * The routes are organized by feature modules and access levels.
 * 
 * @module client/src/routes
 */

import React from 'react';
import { Navigate } from 'react-router-dom';

// Layout components
import Layout from './components/Layout';

// Auth pages
import LoginPage from './modules/auth/pages/LoginPage';
import RegisterPage from './modules/auth/pages/RegisterPage';
import ForgotPasswordPage from './modules/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from './modules/auth/pages/ResetPasswordPage';
import ProfilePage from './modules/auth/pages/ProfilePage';

// Incident pages
import IncidentsPage from './modules/incidents/pages/IncidentsPage';
import IncidentDetailPage from './modules/incidents/pages/IncidentDetailPage';
import CreateIncidentPage from './modules/incidents/pages/CreateIncidentPage';

// Equipment pages
import EquipmentPage from './modules/equipment/pages/EquipmentPage';
import EquipmentDetailPage from './modules/equipment/pages/EquipmentDetailPage';
import CreateEquipmentPage from './modules/equipment/pages/CreateEquipmentPage';

// Dashboard pages
import DashboardPage from './modules/dashboard/pages/DashboardPage';

// Notification pages
import NotificationsPage from './modules/notifications/pages/NotificationsPage';

// Report pages
import ReportsPage from './modules/reports/pages/ReportsPage';
import GenerateReportPage from './modules/reports/pages/GenerateReportPage';
import ViewReportPage from './modules/reports/pages/ViewReportPage';

// Error pages
const NotFoundPage = () => <div>404 - Page Not Found</div>;
const UnauthorizedPage = () => <div>401 - Unauthorized Access</div>;

// Constants for user roles
import { UserRole } from './utils/constants';

/**
 * Route guard component for protected routes
 * Redirects to login if user is not authenticated
 */
const ProtectedRoute = ({ children, isAuthenticated }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

/**
 * Route guard component for role-based routes
 * Redirects to unauthorized page if user doesn't have required role
 */
const RoleBasedRoute = ({ children, userRole, allowedRoles }) => {
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return children;
};

/**
 * Generates routes configuration based on authentication state and user role
 * 
 * @param {boolean} isAuthenticated - Whether the user is authenticated
 * @param {string} userRole - The role of the current user
 * @returns {Array} Array of route objects for React Router
 */
const getRoutes = (isAuthenticated, userRole) => [
  // Public routes (accessible without authentication)
  {
    path: '/login',
    element: isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
  },
  {
    path: '/register',
    element: isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />
  },
  {
    path: '/reset-password/:token',
    element: <ResetPasswordPage />
  },
  {
    path: '/unauthorized',
    element: <UnauthorizedPage />
  },

  // Protected routes (require authentication)
  {
    path: '/',
    element: (
      <ProtectedRoute isAuthenticated={isAuthenticated}>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      // Default redirect to dashboard
      {
        path: '',
        element: <Navigate to="/dashboard" replace />
      },
      
      // Dashboard routes
      {
        path: 'dashboard',
        element: <DashboardPage />
      },
      
      // Profile route
      {
        path: 'profile',
        element: <ProfilePage />
      },
      
      // Incidents routes
      {
        path: 'incidents',
        children: [
          { path: '', element: <IncidentsPage /> },
          { path: 'new', element: <CreateIncidentPage /> },
          { path: ':id', element: <IncidentDetailPage /> }
        ]
      },
      
      // Equipment routes
      {
        path: 'equipment',
        children: [
          { 
            path: '', 
            element: <EquipmentPage /> 
          },
          { 
            path: 'new', 
            element: (
              <RoleBasedRoute 
                userRole={userRole} 
                allowedRoles={[UserRole.ADMIN, UserRole.TECHNICIAN]}
              >
                <CreateEquipmentPage />
              </RoleBasedRoute>
            ) 
          },
          { 
            path: ':id', 
            element: <EquipmentDetailPage /> 
          }
        ]
      },
      
      // Notifications routes
      {
        path: 'notifications',
        element: <NotificationsPage />
      },
      
      // Reports routes - restricted to admin and technician roles
      {
        path: 'reports',
        element: (
          <RoleBasedRoute 
            userRole={userRole} 
            allowedRoles={[UserRole.ADMIN, UserRole.TECHNICIAN]}
          >
            <ReportsPage />
          </RoleBasedRoute>
        ),
        children: [
          { path: '', element: <ReportsPage /> },
          { path: 'generate', element: <GenerateReportPage /> },
          { path: ':id', element: <ViewReportPage /> }
        ]
      },
      
      // Admin routes - restricted to admin role
      {
        path: 'admin',
        element: (
          <RoleBasedRoute 
            userRole={userRole} 
            allowedRoles={[UserRole.ADMIN]}
          >
            <Navigate to="/admin/users" replace />
          </RoleBasedRoute>
        ),
        children: [
          { path: 'users', element: <div>User Management</div> },
          { path: 'settings', element: <div>System Settings</div> }
        ]
      }
    ]
  },
  
  // Catch-all route for 404 errors
  {
    path: '*',
    element: <NotFoundPage />
  }
];

export default getRoutes;