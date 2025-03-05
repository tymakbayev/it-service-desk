const winston = require('winston');
const path = require('path');
const fs = require('fs');
const config = require('./config');
const { format, transports, createLogger } = winston;
require('winston-daily-rotate-file');

// Ensure logs directory exists
const logDir = path.dirname(config.LOG_FILE);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Define custom formats
const customFormats = {
  // Format for development console output
  console: format.combine(
    format.colorize(),
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(({ timestamp, level, message, ...meta }) => {
      const metaString = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
      return `[${timestamp}] ${level}: ${message}${metaString}`;
    })
  ),
  
  // Format for file output
  file: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.json()
  ),
  
  // Format for error logs
  error: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.json()
  )
};

// Create file transport for normal logs
const fileRotateTransport = new transports.DailyRotateFile({
  filename: path.join(logDir, 'application-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: config.LOG_MAX_SIZE,
  maxFiles: config.LOG_MAX_FILES,
  format: customFormats.file,
  level: 'info'
});

// Create file transport for error logs
const errorFileRotateTransport = new transports.DailyRotateFile({
  filename: path.join(logDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: config.LOG_MAX_SIZE,
  maxFiles: config.LOG_MAX_FILES,
  format: customFormats.error,
  level: 'error'
});

// Create file transport for HTTP request logs
const httpFileRotateTransport = new transports.DailyRotateFile({
  filename: path.join(logDir, 'http-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: config.LOG_MAX_SIZE,
  maxFiles: config.LOG_MAX_FILES,
  format: customFormats.file,
  level: 'http'
});

// Define logger instances
const logger = createLogger({
  level: config.LOG_LEVEL,
  defaultMeta: { service: 'it-service-desk' },
  exitOnError: false,
  transports: [
    fileRotateTransport,
    errorFileRotateTransport
  ]
});

// Create HTTP logger instance
const httpLogger = createLogger({
  level: 'http',
  defaultMeta: { service: 'http' },
  exitOnError: false,
  transports: [
    httpFileRotateTransport
  ]
});

// Add console transport in development environment
if (config.IS_DEVELOPMENT || config.IS_TEST) {
  logger.add(new transports.Console({
    format: customFormats.console
  }));
  
  httpLogger.add(new transports.Console({
    format: customFormats.console
  }));
}

// Create a stream object for Morgan middleware
const stream = {
  write: (message) => {
    httpLogger.http(message.trim());
  }
};

// Custom log levels
const logLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    verbose: 4,
    debug: 5,
    silly: 6
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    verbose: 'cyan',
    debug: 'blue',
    silly: 'grey'
  }
};

// Add custom log levels
winston.addColors(logLevels.colors);

/**
 * Creates a child logger with additional metadata
 * @param {Object} meta - Additional metadata to include in logs
 * @returns {winston.Logger} Child logger instance
 */
const createChildLogger = (meta = {}) => {
  return logger.child(meta);
};

/**
 * Utility function to log uncaught exceptions and unhandled rejections
 */
const setupExceptionHandling = () => {
  // Add exception handling
  logger.exceptions.handle(
    new transports.File({ 
      filename: path.join(logDir, 'exceptions.log'),
      format: customFormats.error
    })
  );

  // Add rejection handling (for unhandled promise rejections)
  logger.rejections.handle(
    new transports.File({ 
      filename: path.join(logDir, 'rejections.log'),
      format: customFormats.error
    })
  );

  // Log uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
  });

  // Log unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });
};

// Setup exception handling
setupExceptionHandling();

module.exports = {
  logger,
  httpLogger,
  stream,
  createChildLogger,
  logLevels
};