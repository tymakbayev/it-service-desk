/**
 * Node.js
 * 
 * This file serves as a comprehensive guide to Node.js usage in the IT Service Desk application.
 * It includes best practices, configuration patterns, and examples of Node.js implementation
 * throughout the project.
 */

// Core Node.js modules used in the project
const fs = require('fs');
const path = require('path');
const http = require('http');
const crypto = require('crypto');
const util = require('util');
const events = require('events');

// Promisify common callback-based functions for better async/await support
const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);
const mkdirAsync = util.promisify(fs.mkdir);

/**
 * File System Operations
 * Examples of common file operations used in the application
 */
class FileSystemOperations {
  /**
   * Creates a directory if it doesn't exist
   * @param {string} dirPath - Path to the directory
   * @returns {Promise<void>}
   */
  static async ensureDirectoryExists(dirPath) {
    try {
      await fs.promises.access(dirPath);
    } catch (error) {
      await mkdirAsync(dirPath, { recursive: true });
      console.log(`Directory created: ${dirPath}`);
    }
  }

  /**
   * Saves data to a file
   * @param {string} filePath - Path to the file
   * @param {string|Buffer} data - Data to write
   * @returns {Promise<void>}
   */
  static async saveToFile(filePath, data) {
    await this.ensureDirectoryExists(path.dirname(filePath));
    await writeFileAsync(filePath, data);
    return filePath;
  }

  /**
   * Reads data from a file
   * @param {string} filePath - Path to the file
   * @returns {Promise<Buffer>} - File contents
   */
  static async readFromFile(filePath) {
    return await readFileAsync(filePath);
  }

  /**
   * Deletes a file if it exists
   * @param {string} filePath - Path to the file
   * @returns {Promise<void>}
   */
  static async deleteFile(filePath) {
    try {
      await fs.promises.access(filePath);
      await fs.promises.unlink(filePath);
      console.log(`File deleted: ${filePath}`);
    } catch (error) {
      // File doesn't exist, no action needed
    }
  }
}

/**
 * Security Utilities
 * Common security functions used throughout the application
 */
class SecurityUtils {
  /**
   * Generates a random token
   * @param {number} bytes - Number of bytes for the token
   * @returns {string} - Hex string token
   */
  static generateRandomToken(bytes = 32) {
    return crypto.randomBytes(bytes).toString('hex');
  }

  /**
   * Hashes a password with a random salt
   * @param {string} password - Plain text password
   * @returns {Promise<{hash: string, salt: string}>} - Hash and salt
   */
  static async hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    return new Promise((resolve, reject) => {
      crypto.scrypt(password, salt, 64, (err, derivedKey) => {
        if (err) reject(err);
        resolve({ hash: derivedKey.toString('hex'), salt });
      });
    });
  }

  /**
   * Verifies a password against a hash and salt
   * @param {string} password - Plain text password to verify
   * @param {string} hash - Stored hash
   * @param {string} salt - Salt used for hashing
   * @returns {Promise<boolean>} - True if password matches
   */
  static async verifyPassword(password, hash, salt) {
    return new Promise((resolve, reject) => {
      crypto.scrypt(password, salt, 64, (err, derivedKey) => {
        if (err) reject(err);
        resolve(derivedKey.toString('hex') === hash);
      });
    });
  }
}

/**
 * HTTP Server Utilities
 * Helper functions for HTTP server operations
 */
class HttpServerUtils {
  /**
   * Creates an HTTP server with the Express app
   * @param {Express} app - Express application
   * @param {number} port - Port to listen on
   * @returns {http.Server} - HTTP server instance
   */
  static createServer(app, port) {
    const server = http.createServer(app);
    
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use`);
        process.exit(1);
      } else {
        console.error('Server error:', error);
      }
    });
    
    return server;
  }

  /**
   * Gracefully shuts down the server
   * @param {http.Server} server - HTTP server instance
   * @param {mongoose.Connection} dbConnection - Mongoose connection
   * @returns {Promise<void>}
   */
  static async gracefulShutdown(server, dbConnection) {
    console.log('Shutting down gracefully...');
    
    // Close the server first to stop accepting new connections
    await new Promise((resolve) => {
      server.close(() => {
        console.log('Server closed');
        resolve();
      });
    });
    
    // Close database connection
    if (dbConnection) {
      await dbConnection.close();
      console.log('Database connection closed');
    }
    
    console.log('Shutdown complete');
  }
}

/**
 * Environment Utilities
 * Functions for working with environment variables and configuration
 */
class EnvironmentUtils {
  /**
   * Gets an environment variable with a fallback
   * @param {string} key - Environment variable name
   * @param {*} defaultValue - Default value if not found
   * @returns {string} - Environment variable value or default
   */
  static getEnvVariable(key, defaultValue = '') {
    return process.env[key] || defaultValue;
  }

  /**
   * Gets a required environment variable
   * @param {string} key - Environment variable name
   * @throws {Error} - If environment variable is not set
   * @returns {string} - Environment variable value
   */
  static getRequiredEnvVariable(key) {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Required environment variable ${key} is not set`);
    }
    return value;
  }

  /**
   * Checks if the application is running in production
   * @returns {boolean} - True if in production
   */
  static isProduction() {
    return process.env.NODE_ENV === 'production';
  }

  /**
   * Checks if the application is running in development
   * @returns {boolean} - True if in development
   */
  static isDevelopment() {
    return process.env.NODE_ENV === 'development';
  }

  /**
   * Checks if the application is running in test mode
   * @returns {boolean} - True if in test mode
   */
  static isTest() {
    return process.env.NODE_ENV === 'test';
  }
}

/**
 * Process Management
 * Functions for managing the Node.js process
 */
class ProcessManager {
  /**
   * Sets up process signal handlers for graceful shutdown
   * @param {Function} shutdownHandler - Function to call on shutdown
   */
  static setupSignalHandlers(shutdownHandler) {
    // Handle graceful shutdown on SIGTERM and SIGINT
    process.on('SIGTERM', () => {
      console.log('SIGTERM received');
      shutdownHandler();
    });

    process.on('SIGINT', () => {
      console.log('SIGINT received');
      shutdownHandler();
    });

    // Handle uncaught exceptions and unhandled rejections
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      shutdownHandler();
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      shutdownHandler();
    });
  }

  /**
   * Gets the process memory usage
   * @returns {Object} - Memory usage statistics
   */
  static getMemoryUsage() {
    const memoryUsage = process.memoryUsage();
    return {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
      external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`,
    };
  }
}

/**
 * Custom Event Emitter
 * Example of using Node.js EventEmitter for application events
 */
class ApplicationEvents extends events.EventEmitter {
  constructor() {
    super();
    this.EVENT_TYPES = {
      INCIDENT_CREATED: 'incident:created',
      INCIDENT_UPDATED: 'incident:updated',
      INCIDENT_RESOLVED: 'incident:resolved',
      EQUIPMENT_ADDED: 'equipment:added',
      EQUIPMENT_UPDATED: 'equipment:updated',
      EQUIPMENT_REMOVED: 'equipment:removed',
      USER_CREATED: 'user:created',
      USER_UPDATED: 'user:updated',
      NOTIFICATION_SENT: 'notification:sent',
      REPORT_GENERATED: 'report:generated',
    };
  }

  /**
   * Emits an incident created event
   * @param {Object} incident - Incident data
   */
  emitIncidentCreated(incident) {
    this.emit(this.EVENT_TYPES.INCIDENT_CREATED, incident);
  }

  /**
   * Emits an incident updated event
   * @param {Object} incident - Updated incident data
   */
  emitIncidentUpdated(incident) {
    this.emit(this.EVENT_TYPES.INCIDENT_UPDATED, incident);
  }

  /**
   * Emits an incident resolved event
   * @param {Object} incident - Resolved incident data
   */
  emitIncidentResolved(incident) {
    this.emit(this.EVENT_TYPES.INCIDENT_RESOLVED, incident);
  }

  /**
   * Emits an equipment added event
   * @param {Object} equipment - Equipment data
   */
  emitEquipmentAdded(equipment) {
    this.emit(this.EVENT_TYPES.EQUIPMENT_ADDED, equipment);
  }

  /**
   * Emits an equipment updated event
   * @param {Object} equipment - Updated equipment data
   */
  emitEquipmentUpdated(equipment) {
    this.emit(this.EVENT_TYPES.EQUIPMENT_UPDATED, equipment);
  }

  /**
   * Emits an equipment removed event
   * @param {Object} equipment - Removed equipment data
   */
  emitEquipmentRemoved(equipment) {
    this.emit(this.EVENT_TYPES.EQUIPMENT_REMOVED, equipment);
  }

  /**
   * Emits a user created event
   * @param {Object} user - User data
   */
  emitUserCreated(user) {
    this.emit(this.EVENT_TYPES.USER_CREATED, user);
  }

  /**
   * Emits a user updated event
   * @param {Object} user - Updated user data
   */
  emitUserUpdated(user) {
    this.emit(this.EVENT_TYPES.USER_UPDATED, user);
  }

  /**
   * Emits a notification sent event
   * @param {Object} notification - Notification data
   */
  emitNotificationSent(notification) {
    this.emit(this.EVENT_TYPES.NOTIFICATION_SENT, notification);
  }

  /**
   * Emits a report generated event
   * @param {Object} report - Report data
   */
  emitReportGenerated(report) {
    this.emit(this.EVENT_TYPES.REPORT_GENERATED, report);
  }
}

// Create a singleton instance of the application events
const applicationEvents = new ApplicationEvents();

// Export all utilities and the events instance
module.exports = {
  FileSystemOperations,
  SecurityUtils,
  HttpServerUtils,
  EnvironmentUtils,
  ProcessManager,
  applicationEvents
};