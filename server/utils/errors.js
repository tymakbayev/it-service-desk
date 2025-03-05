/**
 * IT Service Desk - Custom Error Classes
 * 
 * This file contains custom error classes for the application.
 * These error classes extend the native Error class to provide
 * more context and structure for error handling throughout the application.
 */

const { HTTP_STATUS } = require('./constants');

/**
 * Base API Error class
 * Extends the native Error class to include HTTP status code and additional metadata
 */
class ApiError extends Error {
  /**
   * Create a new API error
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {Object} metadata - Additional error metadata
   */
  constructor(message, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, metadata = {}) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.metadata = metadata;
    this.timestamp = new Date().toISOString();
    this.isOperational = true; // Used to determine if error is operational or programming error
    
    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Bad Request Error (400)
 * Used when the request is malformed or contains invalid data
 */
class BadRequestError extends ApiError {
  constructor(message = 'Bad request', metadata = {}) {
    super(message, HTTP_STATUS.BAD_REQUEST, metadata);
  }
}

/**
 * Unauthorized Error (401)
 * Used when authentication is required but failed or not provided
 */
class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized access', metadata = {}) {
    super(message, HTTP_STATUS.UNAUTHORIZED, metadata);
  }
}

/**
 * Forbidden Error (403)
 * Used when the user doesn't have permission to access the requested resource
 */
class ForbiddenError extends ApiError {
  constructor(message = 'Forbidden access', metadata = {}) {
    super(message, HTTP_STATUS.FORBIDDEN, metadata);
  }
}

/**
 * Not Found Error (404)
 * Used when the requested resource is not found
 */
class NotFoundError extends ApiError {
  constructor(message = 'Resource not found', metadata = {}) {
    super(message, HTTP_STATUS.NOT_FOUND, metadata);
  }
}

/**
 * Conflict Error (409)
 * Used when the request conflicts with the current state of the server
 */
class ConflictError extends ApiError {
  constructor(message = 'Resource conflict', metadata = {}) {
    super(message, HTTP_STATUS.CONFLICT, metadata);
  }
}

/**
 * Validation Error (422)
 * Used when the request data fails validation
 */
class ValidationError extends ApiError {
  constructor(message = 'Validation failed', metadata = {}) {
    super(message, HTTP_STATUS.UNPROCESSABLE_ENTITY, metadata);
  }
}

/**
 * Internal Server Error (500)
 * Used for unexpected server errors
 */
class InternalServerError extends ApiError {
  constructor(message = 'Internal server error', metadata = {}) {
    super(message, HTTP_STATUS.INTERNAL_SERVER_ERROR, metadata);
  }
}

/**
 * Service Unavailable Error (503)
 * Used when the server is temporarily unavailable
 */
class ServiceUnavailableError extends ApiError {
  constructor(message = 'Service temporarily unavailable', metadata = {}) {
    super(message, HTTP_STATUS.SERVICE_UNAVAILABLE, metadata);
  }
}

/**
 * Database Error
 * Used for database-related errors
 */
class DatabaseError extends ApiError {
  constructor(message = 'Database error occurred', originalError = null, metadata = {}) {
    const enhancedMetadata = { ...metadata };
    if (originalError) {
      enhancedMetadata.originalError = {
        message: originalError.message,
        code: originalError.code,
        name: originalError.name
      };
    }
    super(message, HTTP_STATUS.INTERNAL_SERVER_ERROR, enhancedMetadata);
  }
}

/**
 * Authentication Error
 * Used for authentication-related errors
 */
class AuthenticationError extends UnauthorizedError {
  constructor(message = 'Authentication failed', metadata = {}) {
    super(message, metadata);
  }
}

/**
 * Authorization Error
 * Used for authorization-related errors
 */
class AuthorizationError extends ForbiddenError {
  constructor(message = 'Not authorized to perform this action', metadata = {}) {
    super(message, metadata);
  }
}

/**
 * Token Error
 * Used for JWT token-related errors
 */
class TokenError extends UnauthorizedError {
  constructor(message = 'Invalid or expired token', metadata = {}) {
    super(message, metadata);
  }
}

/**
 * File Upload Error
 * Used for file upload-related errors
 */
class FileUploadError extends BadRequestError {
  constructor(message = 'File upload failed', metadata = {}) {
    super(message, metadata);
  }
}

/**
 * Rate Limit Error
 * Used when a user has sent too many requests in a given amount of time
 */
class RateLimitError extends ApiError {
  constructor(message = 'Too many requests, please try again later', metadata = {}) {
    super(message, HTTP_STATUS.TOO_MANY_REQUESTS, metadata);
  }
}

/**
 * External Service Error
 * Used when an external service (API, email, etc.) fails
 */
class ExternalServiceError extends ApiError {
  constructor(message = 'External service error', service = 'unknown', metadata = {}) {
    const enhancedMetadata = { 
      ...metadata,
      service 
    };
    super(message, HTTP_STATUS.INTERNAL_SERVER_ERROR, enhancedMetadata);
  }
}

/**
 * Create an error instance based on status code
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {Object} metadata - Additional error metadata
 * @returns {ApiError} - Appropriate error instance
 */
function createErrorFromStatusCode(statusCode, message, metadata = {}) {
  switch (statusCode) {
    case HTTP_STATUS.BAD_REQUEST:
      return new BadRequestError(message, metadata);
    case HTTP_STATUS.UNAUTHORIZED:
      return new UnauthorizedError(message, metadata);
    case HTTP_STATUS.FORBIDDEN:
      return new ForbiddenError(message, metadata);
    case HTTP_STATUS.NOT_FOUND:
      return new NotFoundError(message, metadata);
    case HTTP_STATUS.CONFLICT:
      return new ConflictError(message, metadata);
    case HTTP_STATUS.UNPROCESSABLE_ENTITY:
      return new ValidationError(message, metadata);
    case HTTP_STATUS.SERVICE_UNAVAILABLE:
      return new ServiceUnavailableError(message, metadata);
    default:
      return new ApiError(message, statusCode, metadata);
  }
}

module.exports = {
  ApiError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  InternalServerError,
  ServiceUnavailableError,
  DatabaseError,
  AuthenticationError,
  AuthorizationError,
  TokenError,
  FileUploadError,
  RateLimitError,
  ExternalServiceError,
  createErrorFromStatusCode
};