const winston = require('winston');
const { format, transports } = winston;
const path = require('path');
const config = require('../config/config');
const constants = require('../utils/constants');

/**
 * Настройка форматирования логов
 */
const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.splat(),
  format.json(),
  format.metadata({ fillExcept: ['message', 'level', 'timestamp', 'label'] })
);

/**
 * Настройка форматирования консольных логов
 */
const consoleFormat = format.combine(
  format.colorize(),
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.printf(({ timestamp, level, message, metadata }) => {
    let metaStr = '';
    if (metadata && Object.keys(metadata).length > 0 && metadata.constructor === Object) {
      if (metadata.userId) {
        metaStr += ` [User: ${metadata.userId}]`;
      }
      if (metadata.ip) {
        metaStr += ` [IP: ${metadata.ip}]`;
      }
      if (metadata.path) {
        metaStr += ` [Path: ${metadata.path}]`;
      }
    }
    return `[${timestamp}] ${level}:${metaStr} ${message}`;
  })
);

/**
 * Создание логгера Winston
 */
const logger = winston.createLogger({
  level: config.env === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'it-service-desk' },
  transports: [
    // Запись всех логов уровня error и ниже в файл error.log
    new transports.File({
      filename: path.join(config.logs.dir, 'error.log'),
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    }),
    // Запись всех логов в файл combined.log
    new transports.File({
      filename: path.join(config.logs.dir, 'combined.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    }),
  ],
  exceptionHandlers: [
    new transports.File({
      filename: path.join(config.logs.dir, 'exceptions.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    }),
  ],
  rejectionHandlers: [
    new transports.File({
      filename: path.join(config.logs.dir, 'rejections.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    }),
  ],
});

// Если не в production, также выводим логи в консоль
if (config.env !== 'production') {
  logger.add(
    new transports.Console({
      format: consoleFormat,
      level: 'debug',
    })
  );
}

/**
 * Middleware для логирования HTTP запросов
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const loggerMiddleware = (req, res, next) => {
  const startTime = new Date();
  const { method, originalUrl, ip } = req;
  const userAgent = req.headers['user-agent'] || 'unknown';
  const userId = req.user ? req.user.id : 'unauthenticated';

  // Логируем начало запроса
  logger.info(`${method} ${originalUrl} - Request started`, {
    method,
    path: originalUrl,
    ip,
    userAgent,
    userId,
    requestId: req.id,
  });

  // Функция для логирования завершения запроса
  const logRequestCompletion = () => {
    const responseTime = new Date() - startTime;
    const logLevel = res.statusCode >= 500 ? 'error' : 
                     res.statusCode >= 400 ? 'warn' : 'info';
    
    const logMessage = `${method} ${originalUrl} - ${res.statusCode} - ${responseTime}ms`;
    
    logger[logLevel](logMessage, {
      method,
      path: originalUrl,
      statusCode: res.statusCode,
      responseTime,
      ip,
      userAgent,
      userId,
      requestId: req.id,
    });
  };

  // Добавляем обработчики событий для логирования завершения запроса
  res.on('finish', logRequestCompletion);
  res.on('close', () => {
    if (!res.finished) {
      logger.warn(`${method} ${originalUrl} - Connection closed before response completed`, {
        method,
        path: originalUrl,
        ip,
        userAgent,
        userId,
        requestId: req.id,
      });
    }
  });

  // Добавляем функцию логирования в объект запроса для использования в других частях приложения
  req.logger = {
    info: (message, meta = {}) => logger.info(message, { ...meta, requestId: req.id, userId, path: originalUrl }),
    warn: (message, meta = {}) => logger.warn(message, { ...meta, requestId: req.id, userId, path: originalUrl }),
    error: (message, meta = {}) => logger.error(message, { ...meta, requestId: req.id, userId, path: originalUrl }),
    debug: (message, meta = {}) => logger.debug(message, { ...meta, requestId: req.id, userId, path: originalUrl }),
  };

  next();
};

/**
 * Функция для создания логгера для конкретного модуля
 * 
 * @param {string} moduleName - Имя модуля
 * @returns {Object} Объект логгера для модуля
 */
const createModuleLogger = (moduleName) => {
  return {
    info: (message, meta = {}) => logger.info(`[${moduleName}] ${message}`, meta),
    warn: (message, meta = {}) => logger.warn(`[${moduleName}] ${message}`, meta),
    error: (message, meta = {}) => logger.error(`[${moduleName}] ${message}`, meta),
    debug: (message, meta = {}) => logger.debug(`[${moduleName}] ${message}`, meta),
  };
};

/**
 * Функция для логирования ошибок базы данных
 * 
 * @param {Error} error - Объект ошибки
 * @param {string} operation - Название операции
 * @param {string} collection - Название коллекции
 * @param {Object} query - Объект запроса
 */
const logDatabaseError = (error, operation, collection, query) => {
  logger.error(`Database error during ${operation} on ${collection}`, {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    database: {
      operation,
      collection,
      query: JSON.stringify(query),
    },
  });
};

/**
 * Функция для логирования действий пользователя
 * 
 * @param {string} userId - ID пользователя
 * @param {string} action - Действие пользователя
 * @param {Object} details - Детали действия
 */
const logUserAction = (userId, action, details = {}) => {
  logger.info(`User action: ${action}`, {
    userId,
    action,
    details,
  });
};

/**
 * Функция для логирования системных событий
 * 
 * @param {string} event - Название события
 * @param {Object} details - Детали события
 */
const logSystemEvent = (event, details = {}) => {
  logger.info(`System event: ${event}`, {
    event,
    details,
  });
};

module.exports = {
  logger,
  loggerMiddleware,
  createModuleLogger,
  logDatabaseError,
  logUserAction,
  logSystemEvent,
};