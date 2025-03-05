/**
 * IT Service Desk - API Routes Index
 * 
 * This file serves as the central hub for all API routes in the application.
 * It imports and registers all route modules and applies common middleware.
 * 
 * @module server/routes/index
 */

'use strict';

// Core dependencies
const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth.routes');
const incidentRoutes = require('./incident.routes');
const equipmentRoutes = require('./equipment.routes');
const dashboardRoutes = require('./dashboard.routes');
const reportRoutes = require('./report.routes');
const notificationRoutes = require('./notification.routes');

// Import middleware
const { authMiddleware, requestLogger } = require('../middleware');

// API health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'IT Service Desk API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API documentation endpoint
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'IT Service Desk API',
    version: '1.0.0',
    documentation: '/api-docs',
    endpoints: {
      auth: '/api/auth',
      incidents: '/api/incidents',
      equipment: '/api/equipment',
      dashboard: '/api/dashboard',
      reports: '/api/reports',
      notifications: '/api/notifications'
    }
  });
});

// Apply request logger middleware to all routes
router.use(requestLogger);

// Register API routes
router.use('/auth', authRoutes);
router.use('/incidents', authMiddleware, incidentRoutes);
router.use('/equipment', authMiddleware, equipmentRoutes);
router.use('/dashboard', authMiddleware, dashboardRoutes);
router.use('/reports', authMiddleware, reportRoutes);
router.use('/notifications', authMiddleware, notificationRoutes);

// API version endpoint
router.get('/version', (req, res) => {
  const packageJson = require('../../package.json');
  
  res.status(200).json({
    status: 'success',
    version: packageJson.version,
    name: packageJson.name,
    description: packageJson.description
  });
});

// Handle 404 for API routes
router.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    error: 'Not Found'
  });
});

/**
 * Apply API routes to the main Express application
 * 
 * @param {express.Application} app - Express application instance
 * @returns {express.Application} - Express application with routes applied
 */
const applyRoutes = (app) => {
  // Mount API routes under /api prefix
  app.use('/api', router);
  
  // Handle root path
  app.get('/', (req, res) => {
    res.status(200).json({
      status: 'success',
      message: 'IT Service Desk API Server',
      apiEndpoint: '/api'
    });
  });
  
  // Handle 404 for all other routes
  app.use('*', (req, res) => {
    res.status(404).json({
      status: 'error',
      message: `Cannot ${req.method} ${req.originalUrl}`,
      error: 'Not Found'
    });
  });
  
  return app;
};

module.exports = {
  router,
  applyRoutes
};