const mongoose = require('mongoose');
const winston = require('winston');
const config = require('./config');

/**
 * Database connection manager
 * Handles MongoDB connection, events, and provides utility methods
 */
class Database {
  constructor() {
    this.mongoose = mongoose;
    this.isConnected = false;
    this.logger = winston.createLogger({
      level: config.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      defaultMeta: { service: 'database-service' },
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        })
      ]
    });
    
    // Configure mongoose
    this.mongoose.set('strictQuery', false);
    
    // Setup connection events
    this.mongoose.connection.on('connected', () => {
      this.isConnected = true;
      this.logger.info('MongoDB connection established successfully');
    });
    
    this.mongoose.connection.on('error', (err) => {
      this.logger.error('MongoDB connection error:', err);
      this.isConnected = false;
    });
    
    this.mongoose.connection.on('disconnected', () => {
      this.logger.info('MongoDB connection disconnected');
      this.isConnected = false;
    });
    
    // Handle process termination
    process.on('SIGINT', this.gracefulShutdown.bind(this, 'SIGINT'));
    process.on('SIGTERM', this.gracefulShutdown.bind(this, 'SIGTERM'));
    process.on('SIGUSR2', this.gracefulShutdown.bind(this, 'SIGUSR2')); // For nodemon restarts
  }

  /**
   * Connect to MongoDB database
   * @returns {Promise<mongoose.Connection>} Mongoose connection
   */
  async connect() {
    try {
      if (this.isConnected) {
        this.logger.info('Using existing database connection');
        return this.mongoose.connection;
      }
      
      this.logger.info(`Connecting to MongoDB at ${this.maskUri(config.DB_URI)}`);
      
      // Connect to MongoDB
      await this.mongoose.connect(config.DB_URI, config.DB_OPTIONS);
      
      this.logger.info('MongoDB connection initialized');
      return this.mongoose.connection;
    } catch (error) {
      this.logger.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  /**
   * Disconnect from MongoDB database
   * @returns {Promise<void>}
   */
  async disconnect() {
    try {
      if (!this.isConnected) {
        this.logger.info('No active connection to disconnect');
        return;
      }
      
      await this.mongoose.disconnect();
      this.logger.info('MongoDB disconnected successfully');
      this.isConnected = false;
    } catch (error) {
      this.logger.error('Error disconnecting from MongoDB:', error);
      throw error;
    }
  }

  /**
   * Gracefully shutdown database connection
   * @param {string} signal - The signal that triggered the shutdown
   */
  async gracefulShutdown(signal) {
    this.logger.info(`${signal} signal received: closing MongoDB connection`);
    try {
      await this.disconnect();
      
      // Different handling based on signal
      if (signal === 'SIGUSR2') {
        // For nodemon restarts
        process.kill(process.pid, 'SIGUSR2');
      } else {
        // For SIGINT and SIGTERM
        process.exit(0);
      }
    } catch (error) {
      this.logger.error('Error during graceful shutdown:', error);
      process.exit(1);
    }
  }

  /**
   * Get the current connection status
   * @returns {Boolean} Connection status
   */
  getConnectionStatus() {
    return this.isConnected;
  }

  /**
   * Get the mongoose instance
   * @returns {mongoose} Mongoose instance
   */
  getMongoose() {
    return this.mongoose;
  }

  /**
   * Get the current database connection
   * @returns {mongoose.Connection} Mongoose connection
   */
  getConnection() {
    return this.mongoose.connection;
  }

  /**
   * Mask sensitive information in database URI for logging
   * @param {string} uri - Database URI
   * @returns {string} Masked URI
   * @private
   */
  maskUri(uri) {
    if (!uri) return 'undefined';
    
    try {
      const parsedUri = new URL(uri);
      
      // Mask password if present
      if (parsedUri.password) {
        parsedUri.password = '****';
      }
      
      return parsedUri.toString();
    } catch (error) {
      // If URI parsing fails, return a generic masked string
      return uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
    }
  }

  /**
   * Check database health
   * @returns {Promise<Object>} Health status object
   */
  async checkHealth() {
    try {
      if (!this.isConnected) {
        return { status: 'error', message: 'Database not connected' };
      }
      
      // Execute a simple command to check if database is responsive
      await this.mongoose.connection.db.admin().ping();
      
      return { 
        status: 'ok', 
        message: 'Database is healthy',
        details: {
          host: this.mongoose.connection.host,
          port: this.mongoose.connection.port,
          name: this.mongoose.connection.name,
          readyState: this.mongoose.connection.readyState
        }
      };
    } catch (error) {
      return { 
        status: 'error', 
        message: 'Database health check failed',
        error: error.message
      };
    }
  }
}

// Export a singleton instance
module.exports = new Database();