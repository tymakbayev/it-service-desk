const { ValidationError } = require('joi');
const mongoose = require('mongoose');
const winston = require('winston');
const logger = require('../config/winston');
const constants = require('../utils/constants');

/**
 * Middleware для обработки ошибок в приложении
 * Централизованная обработка всех типов ошибок с соответствующими HTTP-статусами
 * 
 * @param {Error} err - Объект ошибки
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const errorMiddleware = (err, req, res, next) => {
  // Логирование ошибки
  logger.error(`${err.name}: ${err.message}`, { 
    metadata: {
      path: req.path,
      method: req.method,
      ip: req.ip,
      stack: err.stack,
      userId: req.user ? req.user.id : 'unauthenticated'
    }
  });

  // Определение типа ошибки и соответствующего HTTP-статуса
  let statusCode = constants.HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let errorMessage = 'Внутренняя ошибка сервера';
  let errorDetails = null;

  // Обработка ошибок валидации Joi
  if (err instanceof ValidationError) {
    statusCode = constants.HTTP_STATUS.BAD_REQUEST;
    errorMessage = 'Ошибка валидации данных';
    errorDetails = err.details.map(detail => ({
      message: detail.message,
      path: detail.path,
      type: detail.type
    }));
  } 
  // Обработка ошибок валидации Mongoose
  else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = constants.HTTP_STATUS.BAD_REQUEST;
    errorMessage = 'Ошибка валидации данных';
    errorDetails = Object.keys(err.errors).reduce((result, key) => {
      result[key] = err.errors[key].message;
      return result;
    }, {});
  } 
  // Обработка ошибок дублирования ключей в MongoDB
  else if (err.name === 'MongoServerError' && err.code === 11000) {
    statusCode = constants.HTTP_STATUS.CONFLICT;
    errorMessage = 'Запись с такими данными уже существует';
    const field = Object.keys(err.keyValue)[0];
    errorDetails = { [field]: `Значение '${err.keyValue[field]}' уже используется` };
  } 
  // Обработка ошибок кастинга Mongoose
  else if (err instanceof mongoose.Error.CastError) {
    statusCode = constants.HTTP_STATUS.BAD_REQUEST;
    errorMessage = 'Неверный формат данных';
    errorDetails = { [err.path]: err.message };
  } 
  // Обработка ошибок JWT
  else if (err.name === 'JsonWebTokenError') {
    statusCode = constants.HTTP_STATUS.UNAUTHORIZED;
    errorMessage = 'Недействительный токен авторизации';
  } 
  // Обработка истекших JWT
  else if (err.name === 'TokenExpiredError') {
    statusCode = constants.HTTP_STATUS.UNAUTHORIZED;
    errorMessage = 'Срок действия токена истек';
  } 
  // Обработка ошибок авторизации
  else if (err.name === 'UnauthorizedError') {
    statusCode = constants.HTTP_STATUS.UNAUTHORIZED;
    errorMessage = err.message || 'Ошибка авторизации';
  } 
  // Обработка ошибок доступа
  else if (err.name === 'ForbiddenError') {
    statusCode = constants.HTTP_STATUS.FORBIDDEN;
    errorMessage = err.message || 'Доступ запрещен';
  } 
  // Обработка ошибок отсутствия ресурса
  else if (err.name === 'NotFoundError') {
    statusCode = constants.HTTP_STATUS.NOT_FOUND;
    errorMessage = err.message || 'Ресурс не найден';
  } 
  // Обработка пользовательских ошибок с указанным статусом
  else if (err.statusCode) {
    statusCode = err.statusCode;
    errorMessage = err.message;
    errorDetails = err.details;
  }

  // Формирование ответа
  const errorResponse = {
    success: false,
    error: {
      message: errorMessage,
      code: statusCode,
      ...(errorDetails && { details: errorDetails })
    }
  };

  // В режиме разработки добавляем стек ошибки
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = err.stack;
  }

  // Отправка ответа клиенту
  res.status(statusCode).json(errorResponse);
};

/**
 * Middleware для обработки ошибок 404 (Not Found)
 * Вызывается, когда не найден обработчик для запрошенного маршрута
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const notFoundMiddleware = (req, res, next) => {
  const error = new Error(`Маршрут не найден: ${req.originalUrl}`);
  error.name = 'NotFoundError';
  next(error);
};

/**
 * Класс для создания пользовательских ошибок с указанием HTTP-статуса
 */
class AppError extends Error {
  /**
   * @param {string} message - Сообщение об ошибке
   * @param {number} statusCode - HTTP-статус ошибки
   * @param {Object} details - Дополнительные детали ошибки
   */
  constructor(message, statusCode, details = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Создает ошибку Bad Request (400)
   * @param {string} message - Сообщение об ошибке
   * @param {Object} details - Дополнительные детали ошибки
   * @returns {AppError} Экземпляр ошибки
   */
  static badRequest(message = 'Неверный запрос', details = null) {
    return new AppError(message, constants.HTTP_STATUS.BAD_REQUEST, details);
  }

  /**
   * Создает ошибку Unauthorized (401)
   * @param {string} message - Сообщение об ошибке
   * @param {Object} details - Дополнительные детали ошибки
   * @returns {AppError} Экземпляр ошибки
   */
  static unauthorized(message = 'Не авторизован', details = null) {
    return new AppError(message, constants.HTTP_STATUS.UNAUTHORIZED, details);
  }

  /**
   * Создает ошибку Forbidden (403)
   * @param {string} message - Сообщение об ошибке
   * @param {Object} details - Дополнительные детали ошибки
   * @returns {AppError} Экземпляр ошибки
   */
  static forbidden(message = 'Доступ запрещен', details = null) {
    return new AppError(message, constants.HTTP_STATUS.FORBIDDEN, details);
  }

  /**
   * Создает ошибку Not Found (404)
   * @param {string} message - Сообщение об ошибке
   * @param {Object} details - Дополнительные детали ошибки
   * @returns {AppError} Экземпляр ошибки
   */
  static notFound(message = 'Ресурс не найден', details = null) {
    return new AppError(message, constants.HTTP_STATUS.NOT_FOUND, details);
  }

  /**
   * Создает ошибку Conflict (409)
   * @param {string} message - Сообщение об ошибке
   * @param {Object} details - Дополнительные детали ошибки
   * @returns {AppError} Экземпляр ошибки
   */
  static conflict(message = 'Конфликт данных', details = null) {
    return new AppError(message, constants.HTTP_STATUS.CONFLICT, details);
  }

  /**
   * Создает ошибку Internal Server Error (500)
   * @param {string} message - Сообщение об ошибке
   * @param {Object} details - Дополнительные детали ошибки
   * @returns {AppError} Экземпляр ошибки
   */
  static internal(message = 'Внутренняя ошибка сервера', details = null) {
    return new AppError(message, constants.HTTP_STATUS.INTERNAL_SERVER_ERROR, details);
  }
}

module.exports = {
  errorMiddleware,
  notFoundMiddleware,
  AppError
};