/**
 * IT Service Desk - Server Entry Point
 * 
 * This file initializes the server application, connects to the database,
 * and sets up all necessary middleware and routes.
 * 
 * @module server/index
 */

'use strict';

// Core dependencies
const http = require('http');
const path = require('path');
const fs = require('fs');

// Environment configuration
const dotenv = require('dotenv');
const result = dotenv.config();

if (result.error) {
  console.error('Error loading .env file:', result.error);
  process.exit(1);
}

// Import application modules
const app = require('./app');
const database = require('./config/database');
const config = require('./config/config');
const logger = require('./config/winston');
const WebSocketService = require('./services/websocket.service');
const NotificationService = require('./services/notification.service');

// Uncaught exception handler
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', {
    message: err.message,
    stack: err.stack
  });
  console.error('UNCAUGHT EXCEPTION! 💥', err);
  process.exit(1);
});

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket service with the server
WebSocketService.init(server);

// Initialize notification service
NotificationService.init();

// Start the server
const PORT = process.env.PORT || config.server.port || 5000;

// Connect to database and start server
async function startServer() {
  try {
    // Connect to MongoDB
    await database.connect();
    logger.info('MongoDB connection established successfully');

    // Start the server
    server.listen(PORT, () => {
      logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
      
      // Log server URLs
      const serverUrl = `http://localhost:${PORT}`;
      console.log(`API URL: ${serverUrl}/api`);
      console.log(`API Documentation: ${serverUrl}/api-docs`);
      
      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(__dirname, 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
        logger.info('Created uploads directory');
      }
      
      // Create reports directory if it doesn't exist
      const reportsDir = path.join(__dirname, 'reports');
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
        logger.info('Created reports directory');
      }
    });
  } catch (error) {
    logger.error('Failed to start server:', { error: error.message, stack: error.stack });
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

// Handle promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...', {
    message: err.message,
    stack: err.stack
  });
  console.error('UNHANDLED REJECTION! 💥', err);
  
  // Graceful shutdown
  server.close(() => {
    process.exit(1);
  });
});

// Handle SIGTERM signal (e.g., from Heroku)
process.on('SIGTERM', () => {
  logger.info('👋 SIGTERM RECEIVED. Shutting down gracefully');
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  
  server.close(() => {
    logger.info('💥 Process terminated!');
    console.log('💥 Process terminated!');
    
    // Close database connection
    database.disconnect().then(() => {
      process.exit(0);
    }).catch((err) => {
      logger.error('Error disconnecting from database', { error: err.message });
      process.exit(1);
    });
  });
});

// Handle SIGINT signal (Ctrl+C)
process.on('SIGINT', () => {
  logger.info('👋 SIGINT RECEIVED. Shutting down gracefully');
  console.log('👋 SIGINT RECEIVED. Shutting down gracefully');
  
  server.close(() => {
    logger.info('💥 Process terminated!');
    console.log('💥 Process terminated!');
    
    // Close database connection
    database.disconnect().then(() => {
      process.exit(0);
    }).catch((err) => {
      logger.error('Error disconnecting from database', { error: err.message });
      process.exit(1);
    });
  });
});

// Export server for testing
module.exports = server;