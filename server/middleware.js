/**
 * IT Service Desk - Middleware Configuration
 * 
 * This file exports a function that configures and applies all middleware to the Express application.
 * It includes security, logging, parsing, and custom application middleware.
 * 
 * @module server/middleware
 */

'use strict';

// Core dependencies
const path = require('path');
const express = require('express');

// Security middleware
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const compression = require('compression');

// Logging middleware
const morgan = require('morgan');

// Custom middleware
const { errorHandler, requestLogger } = require('./middleware/index');
const validationMiddleware = require('./middleware/validation.middleware');
const loggerMiddleware = require('./middleware/logger.middleware');

// Configuration
const config = require('./config/config');
const logger = require('./config/winston');

/**
 * Configure and apply all middleware to the Express application
 * @param {Object} app - Express application instance
 */
const setupMiddleware = (app) => {
  // Security headers
  app.use(helmet());
  
  // CORS configuration
  app.use(cors({
    origin: config.cors.origin,
    methods: config.cors.methods,
    allowedHeaders: config.cors.allowedHeaders,
    exposedHeaders: config.cors.exposedHeaders,
    credentials: config.cors.credentials,
    maxAge: config.cors.maxAge
  }));
  
  // Request body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  
  // Compression for all responses
  app.use(compression());
  
  // Request logging
  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
  }
  
  // Custom request logger
  app.use(requestLogger);
  
  // Rate limiting
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
      status: 429,
      message: 'Too many requests, please try again later.'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    skip: (req) => {
      // Skip rate limiting for certain paths or in development
      if (process.env.NODE_ENV === 'development') {
        return true;
      }
      // Skip rate limiting for API documentation
      if (req.path.startsWith('/api-docs')) {
        return true;
      }
      return false;
    }
  });
  
  // Apply rate limiting to API routes
  app.use('/api/', apiLimiter);
  
  // Serve static files
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
  app.use('/reports', express.static(path.join(__dirname, 'reports')));
  
  // In production, serve the React app
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
  }
  
  // Trust proxy if behind a reverse proxy
  if (config.server.behindProxy) {
    app.set('trust proxy', 1);
  }
  
  // Add validation middleware to app instance for route-specific use
  app.locals.validate = validationMiddleware;
  
  // Add custom logger to app instance
  app.locals.logger = loggerMiddleware;
  
  // Error handling middleware - should be applied last
  app.use(errorHandler);
  
  logger.info('All middleware configured successfully');
};

module.exports = setupMiddleware;