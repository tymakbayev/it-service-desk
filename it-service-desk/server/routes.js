/**
 * IT Service Desk - Main Routes Configuration
 * 
 * This file serves as the central routing configuration for the IT Service Desk application.
 * It imports and configures all route modules and sets up the API endpoints structure.
 * 
 * @module server/routes
 */

'use strict';

const express = require('express');
const router = express.Router();
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');

// Import route modules
const authRoutes = require('./routes/auth.routes');
const incidentRoutes = require('./routes/incident.routes');
const equipmentRoutes = require('./routes/equipment.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const reportRoutes = require('./routes/report.routes');
const notificationRoutes = require('./routes/notification.routes');

// Import middleware
const { authMiddleware } = require('./middleware');
const errorHandler = require('./middleware/error.handler');
const requestLogger = require('./middleware/request.logger');

// Import constants and config
const { API_VERSION } = require('./utils/constants');
const config = require('./config/config');
const logger = require('./config/winston');

// Try to load Swagger documentation
let swaggerDocument;
try {
  const swaggerPath = path.join(__dirname, 'swagger.json');
  if (fs.existsSync(swaggerPath)) {
    swaggerDocument = JSON.parse(fs.readFileSync(swaggerPath, 'utf8'));
  } else {
    logger.warn('Swagger documentation file not found at: ' + swaggerPath);
  }
} catch (error) {
  logger.error('Failed to load Swagger documentation:', error);
}

/**
 * Configure all API routes
 * @param {Object} app - Express application instance
 */
const configureRoutes = (app) => {
  // Apply request logging middleware
  app.use(requestLogger);

  // API health check endpoint
  app.get('/api/health', (req, res) => {
    res.status(200).json({
      status: 'success',
      message: 'IT Service Desk API is running',
      version: API_VERSION,
      timestamp: new Date().toISOString()
    });
  });

  // API version endpoint
  app.get('/api/version', (req, res) => {
    res.status(200).json({
      version: API_VERSION,
      environment: process.env.NODE_ENV
    });
  });

  // Mount API routes
  const apiRouter = express.Router();
  
  // Auth routes - no authentication required for these endpoints
  apiRouter.use('/auth', authRoutes);
  
  // Protected routes - require authentication
  apiRouter.use('/incidents', authMiddleware, incidentRoutes);
  apiRouter.use('/equipment', authMiddleware, equipmentRoutes);
  apiRouter.use('/dashboard', authMiddleware, dashboardRoutes);
  apiRouter.use('/reports', authMiddleware, reportRoutes);
  apiRouter.use('/notifications', authMiddleware, notificationRoutes);

  // Mount the API router at /api
  app.use('/api', apiRouter);

  // Serve Swagger documentation if available
  if (swaggerDocument) {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'IT Service Desk API Documentation',
      customfavIcon: '/favicon.ico'
    }));
    logger.info('Swagger documentation available at /api-docs');
  }

  // Serve static files from the 'uploads' directory
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
  
  // Serve static files from the 'reports' directory
  app.use('/reports', authMiddleware, express.static(path.join(__dirname, 'reports')));

  // In production, serve the React frontend
  if (process.env.NODE_ENV === 'production') {
    // Serve static files from the React build directory
    const clientBuildPath = path.join(__dirname, '../client/build');
    
    if (fs.existsSync(clientBuildPath)) {
      app.use(express.static(clientBuildPath));
      
      // For any route not handled by the API, serve the React app
      app.get('*', (req, res) => {
        res.sendFile(path.join(clientBuildPath, 'index.html'));
      });
      
      logger.info('Serving React frontend from: ' + clientBuildPath);
    } else {
      logger.warn('Client build directory not found at: ' + clientBuildPath);
    }
  }

  // 404 handler for API routes
  app.use('/api/*', (req, res) => {
    res.status(404).json({
      status: 'error',
      message: `Cannot ${req.method} ${req.originalUrl}`,
      error: 'Not Found'
    });
  });

  // Global error handler
  app.use(errorHandler);

  return router;
};

module.exports = configureRoutes;