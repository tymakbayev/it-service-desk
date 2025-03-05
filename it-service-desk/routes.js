/**
 * IT Service Desk - Application Routes Configuration
 * 
 * This file defines all routes for the application, including:
 * - Public routes (login, register, forgot password, etc.)
 * - Protected routes (dashboard, incidents, equipment, etc.)
 * - Role-based routes (admin, technician, user)
 * 
 * The routing structure implements:
 * - Nested routes for better organization
 * - Route protection with authentication guards
 * - Role-based access control
 * - Lazy loading for better performance
 * 
 * @module routes
 */

import React, { lazy, Suspense } from 'react';
import { Navigate, useRoutes } from 'react-router-dom';

// Layout components
import Layout from './components/Layout';
import AuthGuard from './components/AuthGuard';
import RoleGuard from './components/RoleGuard';
import LoadingScreen from './components/common/Loader';

// Constants
import { UserRole } from './utils/constants';

// Lazy-loaded components for better performance
// Auth pages
const LoginPage = lazy(() => import('./modules/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('./modules/auth/pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./modules/auth/pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./modules/auth/pages/ResetPasswordPage'));
const ProfilePage = lazy(() => import('./modules/auth/pages/ProfilePage'));

// Dashboard
const DashboardPage = lazy(() => import('./modules/dashboard/pages/DashboardPage'));

// Incidents
const IncidentsPage = lazy(() => import('./modules/incidents/pages/IncidentsPage'));
const IncidentDetailPage = lazy(() => import('./modules/incidents/pages/IncidentDetailPage'));
const CreateIncidentPage = lazy(() => import('./modules/incidents/pages/CreateIncidentPage'));

// Equipment
const EquipmentPage = lazy(() => import('./modules/equipment/pages/EquipmentPage'));
const EquipmentDetailPage = lazy(() => import('./modules/equipment/pages/EquipmentDetailPage'));
const CreateEquipmentPage = lazy(() => import('./modules/equipment/pages/CreateEquipmentPage'));

// Notifications
const NotificationsPage = lazy(() => import('./modules/notifications/pages/NotificationsPage'));

// Reports
const ReportsPage = lazy(() => import('./modules/reports/pages/ReportsPage'));
const GenerateReportPage = lazy(() => import('./modules/reports/pages/GenerateReportPage'));
const ViewReportPage = lazy(() => import('./modules/reports/pages/ViewReportPage'));

// Error pages
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const ForbiddenPage = lazy(() => import('./pages/ForbiddenPage'));
const ServerErrorPage = lazy(() => import('./pages/ServerErrorPage'));

/**
 * Wraps the component with Suspense for lazy loading
 * @param {React.Component} Component - The component to be wrapped
 * @returns {React.Component} - The wrapped component with loading screen
 */
const Loadable = (Component) => (props) => (
  <Suspense fallback={<LoadingScreen />}>
    <Component {...props} />
  </Suspense>
);

/**
 * Routes configuration for the application
 * @returns {React.Component} - The routes component
 */
export default function Router() {
  return useRoutes([
    // Public routes (no authentication required)
    {
      path: 'auth',
      children: [
        {
          path: 'login',
          element: <Loadable(LoginPage) />
        },
        {
          path: 'register',
          element: <Loadable(RegisterPage) />
        },
        {
          path: 'forgot-password',
          element: <Loadable(ForgotPasswordPage) />
        },
        {
          path: 'reset-password/:token',
          element: <Loadable(ResetPasswordPage) />
        },
        {
          path: '',
          element: <Navigate to="/auth/login" replace />
        }
      ]
    },

    // Protected routes (authentication required)
    {
      path: '/',
      element: (
        <AuthGuard>
          <Layout />
        </AuthGuard>
      ),
      children: [
        // Dashboard (accessible by all authenticated users)
        {
          path: '',
          element: <Navigate to="/dashboard" replace />
        },
        {
          path: 'dashboard',
          element: <Loadable(DashboardPage) />
        },

        // Profile (accessible by all authenticated users)
        {
          path: 'profile',
          element: <Loadable(ProfilePage) />
        },

        // Incidents (different access based on roles)
        {
          path: 'incidents',
          children: [
            {
              path: '',
              element: <Loadable(IncidentsPage) />
            },
            {
              path: 'new',
              element: <Loadable(CreateIncidentPage) />
            },
            {
              path: ':id',
              element: <Loadable(IncidentDetailPage) />
            }
          ]
        },

        // Equipment (admin and technician only)
        {
          path: 'equipment',
          element: (
            <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.TECHNICIAN]}>
              <Outlet />
            </RoleGuard>
          ),
          children: [
            {
              path: '',
              element: <Loadable(EquipmentPage) />
            },
            {
              path: 'new',
              element: <Loadable(CreateEquipmentPage) />
            },
            {
              path: ':id',
              element: <Loadable(EquipmentDetailPage) />
            }
          ]
        },

        // Notifications (accessible by all authenticated users)
        {
          path: 'notifications',
          element: <Loadable(NotificationsPage) />
        },

        // Reports (admin only)
        {
          path: 'reports',
          element: (
            <RoleGuard allowedRoles={[UserRole.ADMIN]}>
              <Outlet />
            </RoleGuard>
          ),
          children: [
            {
              path: '',
              element: <Loadable(ReportsPage) />
            },
            {
              path: 'generate',
              element: <Loadable(GenerateReportPage) />
            },
            {
              path: ':id',
              element: <Loadable(ViewReportPage) />
            }
          ]
        }
      ]
    },

    // Error pages
    {
      path: '404',
      element: <Loadable(NotFoundPage) />
    },
    {
      path: '403',
      element: <Loadable(ForbiddenPage) />
    },
    {
      path: '500',
      element: <Loadable(ServerErrorPage) />
    },

    // Catch all route - redirect to 404
    {
      path: '*',
      element: <Navigate to="/404" replace />
    }
  ]);
}

// Components used in the routes
const Outlet = () => {
  const { Outlet } = require('react-router-dom');
  return <Outlet />;
};

/**
 * AuthGuard component to protect routes that require authentication
 * Redirects to login page if user is not authenticated
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 * @returns {React.Component} - The protected route or redirect
 */
function AuthGuard({ children }) {
  const { isAuthenticated, isInitialized } = useAuth();
  
  if (!isInitialized) {
    return <LoadingScreen />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" />;
  }
  
  return <>{children}</>;
}

/**
 * RoleGuard component to protect routes that require specific roles
 * Redirects to forbidden page if user doesn't have the required role
 * 
 * @param {Object} props - Component props
 * @param {Array} props.allowedRoles - Array of roles allowed to access the route
 * @param {React.ReactNode} props.children - Child components to render if authorized
 * @returns {React.Component} - The protected route or redirect
 */
function RoleGuard({ allowedRoles, children }) {
  const { user } = useAuth();
  
  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to="/403" />;
  }
  
  return <>{children}</>;
}

// Import the useAuth hook
import { useAuth } from './hooks/useAuth';