/**
 * IT Service Desk - Helper Utilities
 * 
 * This file contains utility functions used throughout the application.
 * These helpers provide common functionality for data manipulation,
 * formatting, validation, and other general-purpose operations.
 */

const crypto = require('crypto');
const { format, addHours, isAfter, differenceInHours, differenceInMinutes, parseISO } = require('date-fns');
const constants = require('./constants');

/**
 * Generates a random string of specified length
 * @param {number} length - Length of the string to generate
 * @param {string} [chars] - Characters to use (defaults to alphanumeric)
 * @returns {string} Random string
 */
const generateRandomString = (length, chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') => {
  let result = '';
  const charactersLength = chars.length;
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * charactersLength));
  }
  
  return result;
};

/**
 * Generates a secure random token
 * @param {number} [bytes=32] - Number of bytes for the token
 * @returns {string} Hex-encoded random token
 */
const generateSecureToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString('hex');
};

/**
 * Formats a date to a specified format
 * @param {Date|string|number} date - Date to format
 * @param {string} [formatStr='yyyy-MM-dd HH:mm:ss'] - Format string
 * @returns {string} Formatted date string
 */
const formatDate = (date, formatStr = 'yyyy-MM-dd HH:mm:ss') => {
  if (!date) return '';
  return format(new Date(date), formatStr);
};

/**
 * Checks if an SLA deadline is breached based on priority and creation time
 * @param {string} priority - Incident priority
 * @param {Date|string|number} createdAt - Creation timestamp
 * @param {Date|string|number} [resolvedAt] - Resolution timestamp (if resolved)
 * @returns {boolean} True if SLA is breached, false otherwise
 */
const isSLABreached = (priority, createdAt, resolvedAt = null) => {
  if (!priority || !createdAt) return false;
  
  const priorityHours = constants.PRIORITY_SLA[priority] || 24;
  const deadline = addHours(new Date(createdAt), priorityHours);
  
  if (resolvedAt) {
    return isAfter(new Date(resolvedAt), deadline);
  }
  
  return isAfter(new Date(), deadline);
};

/**
 * Calculates time remaining until SLA breach
 * @param {string} priority - Incident priority
 * @param {Date|string|number} createdAt - Creation timestamp
 * @returns {Object} Object containing hours, minutes and isBreached flag
 */
const calculateSLATimeRemaining = (priority, createdAt) => {
  if (!priority || !createdAt) {
    return { hours: 0, minutes: 0, isBreached: false };
  }
  
  const priorityHours = constants.PRIORITY_SLA[priority] || 24;
  const deadline = addHours(new Date(createdAt), priorityHours);
  const now = new Date();
  
  if (isAfter(now, deadline)) {
    return { hours: 0, minutes: 0, isBreached: true };
  }
  
  const diffMs = deadline.getTime() - now.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  return { hours, minutes, isBreached: false };
};

/**
 * Sanitizes an object by removing specified fields
 * @param {Object} obj - Object to sanitize
 * @param {Array<string>} fieldsToRemove - Fields to remove from the object
 * @returns {Object} Sanitized object
 */
const sanitizeObject = (obj, fieldsToRemove = []) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sanitized = { ...obj };
  
  fieldsToRemove.forEach(field => {
    delete sanitized[field];
  });
  
  return sanitized;
};

/**
 * Converts a string to title case
 * @param {string} str - String to convert
 * @returns {string} Title-cased string
 */
const toTitleCase = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Truncates a string to a specified length and adds ellipsis if needed
 * @param {string} str - String to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} [suffix='...'] - Suffix to add if truncated
 * @returns {string} Truncated string
 */
const truncateString = (str, maxLength, suffix = '...') => {
  if (!str || str.length <= maxLength) return str;
  return str.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * Calculates the resolution time for an incident
 * @param {Date|string|number} createdAt - Creation timestamp
 * @param {Date|string|number} resolvedAt - Resolution timestamp
 * @returns {Object} Object containing hours and minutes
 */
const calculateResolutionTime = (createdAt, resolvedAt) => {
  if (!createdAt || !resolvedAt) {
    return { hours: 0, minutes: 0 };
  }
  
  const created = new Date(createdAt);
  const resolved = new Date(resolvedAt);
  
  const hours = differenceInHours(resolved, created);
  const minutes = differenceInMinutes(resolved, created) % 60;
  
  return { hours, minutes };
};

/**
 * Formats a resolution time object to a readable string
 * @param {Object} resolutionTime - Resolution time object with hours and minutes
 * @returns {string} Formatted resolution time string
 */
const formatResolutionTime = (resolutionTime) => {
  const { hours, minutes } = resolutionTime;
  
  if (hours === 0 && minutes === 0) {
    return 'N/A';
  }
  
  if (hours === 0) {
    return `${minutes}m`;
  }
  
  if (minutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${minutes}m`;
};

/**
 * Calculates the SLA compliance percentage
 * @param {Array} incidents - Array of incidents
 * @returns {number} SLA compliance percentage
 */
const calculateSLACompliance = (incidents) => {
  if (!incidents || incidents.length === 0) {
    return 100;
  }
  
  const resolvedIncidents = incidents.filter(incident => 
    incident.status === constants.INCIDENT_STATUS.RESOLVED || 
    incident.status === constants.INCIDENT_STATUS.CLOSED
  );
  
  if (resolvedIncidents.length === 0) {
    return 100;
  }
  
  const compliantIncidents = resolvedIncidents.filter(incident => 
    !isSLABreached(incident.priority, incident.createdAt, incident.resolvedAt)
  );
  
  return Math.round((compliantIncidents.length / resolvedIncidents.length) * 100);
};

/**
 * Generates a unique incident reference number
 * @param {string} prefix - Prefix for the reference number
 * @returns {string} Unique reference number
 */
const generateReferenceNumber = (prefix = 'INC') => {
  const timestamp = new Date().getTime().toString().slice(-6);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${timestamp}-${random}`;
};

/**
 * Generates a unique equipment asset tag
 * @param {string} prefix - Prefix for the asset tag
 * @returns {string} Unique asset tag
 */
const generateAssetTag = (prefix = 'ASSET') => {
  const timestamp = new Date().getTime().toString().slice(-4);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${timestamp}-${random}`;
};

/**
 * Parses a date string in various formats
 * @param {string} dateString - Date string to parse
 * @returns {Date|null} Parsed date or null if invalid
 */
const parseDate = (dateString) => {
  if (!dateString) return null;
  
  try {
    // Try native Date parsing first
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date;
    }
    
    // Try date-fns parseISO
    return parseISO(dateString);
  } catch (error) {
    console.error('Error parsing date:', error);
    return null;
  }
};

/**
 * Validates an email address
 * @param {string} email - Email address to validate
 * @returns {boolean} True if valid, false otherwise
 */
const isValidEmail = (email) => {
  if (!email) return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates a password against security requirements
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with isValid flag and message
 */
const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }
  
  if (password.length < constants.VALIDATION.PASSWORD_MIN_LENGTH) {
    return { 
      isValid: false, 
      message: `Password must be at least ${constants.VALIDATION.PASSWORD_MIN_LENGTH} characters long` 
    };
  }
  
  if (password.length > constants.VALIDATION.PASSWORD_MAX_LENGTH) {
    return { 
      isValid: false, 
      message: `Password cannot exceed ${constants.VALIDATION.PASSWORD_MAX_LENGTH} characters` 
    };
  }
  
  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  // Check for at least one number
  if (!/\d/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  
  // Check for at least one special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one special character' };
  }
  
  return { isValid: true, message: 'Password is valid' };
};

/**
 * Creates a hash of a string using specified algorithm
 * @param {string} data - Data to hash
 * @param {string} [algorithm='sha256'] - Hashing algorithm
 * @returns {string} Hashed string
 */
const createHash = (data, algorithm = 'sha256') => {
  return crypto.createHash(algorithm).update(data).digest('hex');
};

/**
 * Compares two objects and returns the differences
 * @param {Object} obj1 - First object
 * @param {Object} obj2 - Second object
 * @returns {Object} Object containing the differences
 */
const getObjectDiff = (obj1, obj2) => {
  const diff = {};
  
  // Check for properties in obj1 that are different in obj2
  Object.keys(obj1).forEach(key => {
    if (JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key])) {
      diff[key] = {
        oldValue: obj1[key],
        newValue: obj2[key]
      };
    }
  });
  
  // Check for properties in obj2 that don't exist in obj1
  Object.keys(obj2).forEach(key => {
    if (obj1[key] === undefined && obj2[key] !== undefined) {
      diff[key] = {
        oldValue: undefined,
        newValue: obj2[key]
      };
    }
  });
  
  return diff;
};

/**
 * Converts a MongoDB document to a plain JavaScript object
 * @param {Object} doc - MongoDB document
 * @returns {Object} Plain JavaScript object
 */
const toObject = (doc) => {
  if (!doc) return null;
  if (typeof doc.toObject === 'function') {
    return doc.toObject();
  }
  return doc;
};

/**
 * Checks if a user has permission for an action based on role
 * @param {string} userRole - User's role
 * @param {string} requiredRole - Required role for the action
 * @returns {boolean} True if user has permission, false otherwise
 */
const hasPermission = (userRole, requiredRole) => {
  const userRoleLevel = constants.ROLE_HIERARCHY[userRole] || 0;
  const requiredRoleLevel = constants.ROLE_HIERARCHY[requiredRole] || 0;
  
  return userRoleLevel >= requiredRoleLevel;
};

/**
 * Formats a file size in bytes to a human-readable string
 * @param {number} bytes - File size in bytes
 * @param {number} [decimals=2] - Number of decimal places
 * @returns {string} Formatted file size
 */
const formatFileSize = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Generates pagination metadata
 * @param {number} totalItems - Total number of items
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @returns {Object} Pagination metadata
 */
const getPaginationMetadata = (totalItems, page, limit) => {
  const totalPages = Math.ceil(totalItems / limit);
  const currentPage = page > totalPages ? totalPages : page;
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;
  
  return {
    totalItems,
    itemsPerPage: limit,
    totalPages,
    currentPage,
    hasNextPage,
    hasPrevPage,
    nextPage: hasNextPage ? currentPage + 1 : null,
    prevPage: hasPrevPage ? currentPage - 1 : null
  };
};

module.exports = {
  generateRandomString,
  generateSecureToken,
  formatDate,
  isSLABreached,
  calculateSLATimeRemaining,
  sanitizeObject,
  toTitleCase,
  truncateString,
  calculateResolutionTime,
  formatResolutionTime,
  calculateSLACompliance,
  generateReferenceNumber,
  generateAssetTag,
  parseDate,
  isValidEmail,
  validatePassword,
  createHash,
  getObjectDiff,
  toObject,
  hasPermission,
  formatFileSize,
  getPaginationMetadata
};