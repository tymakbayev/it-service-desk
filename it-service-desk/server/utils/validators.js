/**
 * IT Service Desk - Validators
 * 
 * This file contains validation functions and schemas used throughout the application.
 * It provides centralized validation logic for API requests, form inputs, and data integrity.
 * Uses Joi for schema validation and custom validation functions for specific business rules.
 */

const Joi = require('joi');
const constants = require('./constants');

/**
 * Common validation patterns
 */
const patterns = {
  // Alphanumeric with spaces and common punctuation
  namePattern: /^[a-zA-Z0-9\s.,'-]+$/,
  // Strong password pattern (at least one uppercase, one lowercase, one number, one special character)
  strongPasswordPattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  // Phone number pattern (international format)
  phonePattern: /^\+?[1-9]\d{1,14}$/,
  // Serial number pattern (alphanumeric with dashes)
  serialNumberPattern: /^[A-Za-z0-9-]+$/,
  // MAC address pattern
  macAddressPattern: /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/,
  // IP address pattern (IPv4 and IPv6)
  ipAddressPattern: /^((\d{1,3}\.){3}\d{1,3}|([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4})$/
};

/**
 * Custom validation messages
 */
const messages = {
  required: '{{#label}} is required',
  string: {
    min: '{{#label}} must be at least {{#limit}} characters',
    max: '{{#label}} must not exceed {{#limit}} characters',
    email: '{{#label}} must be a valid email address',
    pattern: {
      base: '{{#label}} contains invalid characters'
    }
  },
  password: {
    weak: 'Password is too weak. It must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  },
  date: {
    future: '{{#label}} cannot be in the future',
    past: '{{#label}} cannot be in the past'
  },
  object: {
    unknown: 'Unknown field: {{#label}}'
  }
};

/**
 * Base Joi configuration with custom error messages
 */
const joiConfig = {
  errors: {
    wrap: {
      label: false
    }
  },
  messages
};

/**
 * User validation schemas
 */
const userValidation = {
  /**
   * Registration schema
   */
  register: Joi.object({
    username: Joi.string()
      .min(constants.VALIDATION.USERNAME_MIN_LENGTH)
      .max(constants.VALIDATION.USERNAME_MAX_LENGTH)
      .required()
      .trim(),
    email: Joi.string()
      .email()
      .max(constants.VALIDATION.EMAIL_MAX_LENGTH)
      .required()
      .trim()
      .lowercase(),
    password: Joi.string()
      .min(constants.VALIDATION.PASSWORD_MIN_LENGTH)
      .max(constants.VALIDATION.PASSWORD_MAX_LENGTH)
      .pattern(patterns.strongPasswordPattern)
      .message(messages.password.weak)
      .required(),
    confirmPassword: Joi.string()
      .valid(Joi.ref('password'))
      .required()
      .messages({ 'any.only': 'Passwords do not match' }),
    firstName: Joi.string()
      .max(constants.VALIDATION.NAME_MAX_LENGTH)
      .pattern(patterns.namePattern)
      .required()
      .trim(),
    lastName: Joi.string()
      .max(constants.VALIDATION.NAME_MAX_LENGTH)
      .pattern(patterns.namePattern)
      .required()
      .trim(),
    department: Joi.string()
      .max(constants.VALIDATION.NAME_MAX_LENGTH)
      .trim(),
    phone: Joi.string()
      .pattern(patterns.phonePattern)
      .message('Phone number must be in a valid format')
      .allow('', null),
    role: Joi.string()
      .valid(...Object.values(constants.ROLES))
      .default(constants.ROLES.USER)
  }).options(joiConfig),

  /**
   * Login schema
   */
  login: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .trim()
      .lowercase(),
    password: Joi.string()
      .required(),
    rememberMe: Joi.boolean()
      .default(false)
  }).options(joiConfig),

  /**
   * Password reset request schema
   */
  forgotPassword: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .trim()
      .lowercase()
  }).options(joiConfig),

  /**
   * Password reset schema
   */
  resetPassword: Joi.object({
    token: Joi.string()
      .required(),
    password: Joi.string()
      .min(constants.VALIDATION.PASSWORD_MIN_LENGTH)
      .max(constants.VALIDATION.PASSWORD_MAX_LENGTH)
      .pattern(patterns.strongPasswordPattern)
      .message(messages.password.weak)
      .required(),
    confirmPassword: Joi.string()
      .valid(Joi.ref('password'))
      .required()
      .messages({ 'any.only': 'Passwords do not match' })
  }).options(joiConfig),

  /**
   * Change password schema
   */
  changePassword: Joi.object({
    currentPassword: Joi.string()
      .required(),
    newPassword: Joi.string()
      .min(constants.VALIDATION.PASSWORD_MIN_LENGTH)
      .max(constants.VALIDATION.PASSWORD_MAX_LENGTH)
      .pattern(patterns.strongPasswordPattern)
      .message(messages.password.weak)
      .required()
      .invalid(Joi.ref('currentPassword'))
      .messages({ 'any.invalid': 'New password must be different from current password' }),
    confirmPassword: Joi.string()
      .valid(Joi.ref('newPassword'))
      .required()
      .messages({ 'any.only': 'Passwords do not match' })
  }).options(joiConfig),

  /**
   * Update user profile schema
   */
  updateProfile: Joi.object({
    firstName: Joi.string()
      .max(constants.VALIDATION.NAME_MAX_LENGTH)
      .pattern(patterns.namePattern)
      .trim(),
    lastName: Joi.string()
      .max(constants.VALIDATION.NAME_MAX_LENGTH)
      .pattern(patterns.namePattern)
      .trim(),
    department: Joi.string()
      .max(constants.VALIDATION.NAME_MAX_LENGTH)
      .trim()
      .allow('', null),
    phone: Joi.string()
      .pattern(patterns.phonePattern)
      .message('Phone number must be in a valid format')
      .allow('', null),
    avatar: Joi.string()
      .uri()
      .allow('', null),
    preferences: Joi.object({
      theme: Joi.string().valid('light', 'dark', 'system').default('system'),
      notifications: Joi.boolean().default(true),
      emailNotifications: Joi.boolean().default(true)
    }).default()
  }).options(joiConfig)
};

/**
 * Incident validation schemas
 */
const incidentValidation = {
  /**
   * Create incident schema
   */
  create: Joi.object({
    title: Joi.string()
      .max(constants.VALIDATION.TITLE_MAX_LENGTH)
      .required()
      .trim(),
    description: Joi.string()
      .max(constants.VALIDATION.DESCRIPTION_MAX_LENGTH)
      .required()
      .trim(),
    priority: Joi.string()
      .valid(...Object.values(constants.INCIDENT_PRIORITY))
      .default(constants.INCIDENT_PRIORITY.MEDIUM),
    status: Joi.string()
      .valid(...Object.values(constants.INCIDENT_STATUS))
      .default(constants.INCIDENT_STATUS.NEW),
    category: Joi.string()
      .required()
      .trim(),
    assignedTo: Joi.string()
      .allow(null),
    relatedEquipment: Joi.array()
      .items(Joi.string())
      .default([]),
    attachments: Joi.array()
      .items(Joi.string())
      .default([]),
    dueDate: Joi.date()
      .allow(null)
  }).options(joiConfig),

  /**
   * Update incident schema
   */
  update: Joi.object({
    title: Joi.string()
      .max(constants.VALIDATION.TITLE_MAX_LENGTH)
      .trim(),
    description: Joi.string()
      .max(constants.VALIDATION.DESCRIPTION_MAX_LENGTH)
      .trim(),
    priority: Joi.string()
      .valid(...Object.values(constants.INCIDENT_PRIORITY)),
    status: Joi.string()
      .valid(...Object.values(constants.INCIDENT_STATUS)),
    category: Joi.string()
      .trim(),
    assignedTo: Joi.string()
      .allow(null),
    relatedEquipment: Joi.array()
      .items(Joi.string()),
    attachments: Joi.array()
      .items(Joi.string()),
    dueDate: Joi.date()
      .allow(null),
    resolutionNotes: Joi.string()
      .max(constants.VALIDATION.DESCRIPTION_MAX_LENGTH)
      .allow('', null)
      .trim()
  }).options(joiConfig),

  /**
   * Add comment to incident schema
   */
  addComment: Joi.object({
    content: Joi.string()
      .max(constants.VALIDATION.COMMENT_MAX_LENGTH)
      .required()
      .trim(),
    isInternal: Joi.boolean()
      .default(false),
    attachments: Joi.array()
      .items(Joi.string())
      .default([])
  }).options(joiConfig),

  /**
   * Incident filter schema
   */
  filter: Joi.object({
    status: Joi.alternatives()
      .try(
        Joi.string().valid(...Object.values(constants.INCIDENT_STATUS)),
        Joi.array().items(Joi.string().valid(...Object.values(constants.INCIDENT_STATUS)))
      ),
    priority: Joi.alternatives()
      .try(
        Joi.string().valid(...Object.values(constants.INCIDENT_PRIORITY)),
        Joi.array().items(Joi.string().valid(...Object.values(constants.INCIDENT_PRIORITY)))
      ),
    assignedTo: Joi.alternatives()
      .try(
        Joi.string(),
        Joi.array().items(Joi.string())
      ),
    createdBy: Joi.alternatives()
      .try(
        Joi.string(),
        Joi.array().items(Joi.string())
      ),
    category: Joi.alternatives()
      .try(
        Joi.string(),
        Joi.array().items(Joi.string())
      ),
    dateFrom: Joi.date(),
    dateTo: Joi.date().min(Joi.ref('dateFrom')),
    search: Joi.string().allow('', null),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(constants.VALIDATION.PAGINATION_MAX_LIMIT).default(constants.VALIDATION.PAGINATION_DEFAULT_LIMIT),
    sort: Joi.string().default('-createdAt'),
    isOverdue: Joi.boolean(),
    hasSLABreach: Joi.boolean()
  }).options(joiConfig)
};

/**
 * Equipment validation schemas
 */
const equipmentValidation = {
  /**
   * Create equipment schema
   */
  create: Joi.object({
    name: Joi.string()
      .max(constants.VALIDATION.NAME_MAX_LENGTH)
      .required()
      .trim(),
    type: Joi.string()
      .valid(...Object.values(constants.EQUIPMENT_TYPE))
      .required(),
    status: Joi.string()
      .valid(...Object.values(constants.EQUIPMENT_STATUS))
      .default(constants.EQUIPMENT_STATUS.AVAILABLE),
    serialNumber: Joi.string()
      .pattern(patterns.serialNumberPattern)
      .message('Serial number must contain only alphanumeric characters and dashes')
      .allow('', null),
    model: Joi.string()
      .max(constants.VALIDATION.NAME_MAX_LENGTH)
      .trim(),
    manufacturer: Joi.string()
      .max(constants.VALIDATION.NAME_MAX_LENGTH)
      .trim(),
    purchaseDate: Joi.date()
      .allow(null),
    warrantyExpiryDate: Joi.date()
      .allow(null)
      .min(Joi.ref('purchaseDate')),
    location: Joi.string()
      .max(constants.VALIDATION.NAME_MAX_LENGTH)
      .trim()
      .allow('', null),
    assignedTo: Joi.string()
      .allow(null),
    ipAddress: Joi.string()
      .pattern(patterns.ipAddressPattern)
      .message('IP address must be in a valid format')
      .allow('', null),
    macAddress: Joi.string()
      .pattern(patterns.macAddressPattern)
      .message('MAC address must be in a valid format (XX:XX:XX:XX:XX:XX)')
      .allow('', null),
    notes: Joi.string()
      .max(constants.VALIDATION.DESCRIPTION_MAX_LENGTH)
      .trim()
      .allow('', null),
    attachments: Joi.array()
      .items(Joi.string())
      .default([]),
    specifications: Joi.object()
      .default({})
  }).options(joiConfig),

  /**
   * Update equipment schema
   */
  update: Joi.object({
    name: Joi.string()
      .max(constants.VALIDATION.NAME_MAX_LENGTH)
      .trim(),
    type: Joi.string()
      .valid(...Object.values(constants.EQUIPMENT_TYPE)),
    status: Joi.string()
      .valid(...Object.values(constants.EQUIPMENT_STATUS)),
    serialNumber: Joi.string()
      .pattern(patterns.serialNumberPattern)
      .message('Serial number must contain only alphanumeric characters and dashes')
      .allow('', null),
    model: Joi.string()
      .max(constants.VALIDATION.NAME_MAX_LENGTH)
      .trim(),
    manufacturer: Joi.string()
      .max(constants.VALIDATION.NAME_MAX_LENGTH)
      .trim(),
    purchaseDate: Joi.date()
      .allow(null),
    warrantyExpiryDate: Joi.date()
      .allow(null)
      .min(Joi.ref('purchaseDate')),
    location: Joi.string()
      .max(constants.VALIDATION.NAME_MAX_LENGTH)
      .trim()
      .allow('', null),
    assignedTo: Joi.string()
      .allow(null),
    ipAddress: Joi.string()
      .pattern(patterns.ipAddressPattern)
      .message('IP address must be in a valid format')
      .allow('', null),
    macAddress: Joi.string()
      .pattern(patterns.macAddressPattern)
      .message('MAC address must be in a valid format (XX:XX:XX:XX:XX:XX)')
      .allow('', null),
    notes: Joi.string()
      .max(constants.VALIDATION.DESCRIPTION_MAX_LENGTH)
      .trim()
      .allow('', null),
    attachments: Joi.array()
      .items(Joi.string()),
    specifications: Joi.object()
  }).options(joiConfig),

  /**
   * Equipment filter schema
   */
  filter: Joi.object({
    type: Joi.alternatives()
      .try(
        Joi.string().valid(...Object.values(constants.EQUIPMENT_TYPE)),
        Joi.array().items(Joi.string().valid(...Object.values(constants.EQUIPMENT_TYPE)))
      ),
    status: Joi.alternatives()
      .try(
        Joi.string().valid(...Object.values(constants.EQUIPMENT_STATUS)),
        Joi.array().items(Joi.string().valid(...Object.values(constants.EQUIPMENT_STATUS)))
      ),
    assignedTo: Joi.alternatives()
      .try(
        Joi.string(),
        Joi.array().items(Joi.string())
      ),
    manufacturer: Joi.alternatives()
      .try(
        Joi.string(),
        Joi.array().items(Joi.string())
      ),
    location: Joi.alternatives()
      .try(
        Joi.string(),
        Joi.array().items(Joi.string())
      ),
    purchaseDateFrom: Joi.date(),
    purchaseDateTo: Joi.date().min(Joi.ref('purchaseDateFrom')),
    warrantyExpired: Joi.boolean(),
    search: Joi.string().allow('', null),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(constants.VALIDATION.PAGINATION_MAX_LIMIT).default(constants.VALIDATION.PAGINATION_DEFAULT_LIMIT),
    sort: Joi.string().default('name')
  }).options(joiConfig)
};

/**
 * Report validation schemas
 */
const reportValidation = {
  /**
   * Generate report schema
   */
  generate: Joi.object({
    title: Joi.string()
      .max(constants.VALIDATION.TITLE_MAX_LENGTH)
      .required()
      .trim(),
    type: Joi.string()
      .valid(...Object.values(constants.REPORT_TYPE))
      .required(),
    format: Joi.string()
      .valid(...Object.values(constants.REPORT_FORMAT))
      .default(constants.REPORT_FORMAT.PDF),
    dateRange: Joi.object({
      from: Joi.date().required(),
      to: Joi.date().min(Joi.ref('from')).required()
    }).required(),
    filters: Joi.object({
      status: Joi.alternatives()
        .try(
          Joi.string(),
          Joi.array().items(Joi.string())
        ),
      priority: Joi.alternatives()
        .try(
          Joi.string(),
          Joi.array().items(Joi.string())
        ),
      assignedTo: Joi.alternatives()
        .try(
          Joi.string(),
          Joi.array().items(Joi.string())
        ),
      category: Joi.alternatives()
        .try(
          Joi.string(),
          Joi.array().items(Joi.string())
        ),
      equipmentType: Joi.alternatives()
        .try(
          Joi.string(),
          Joi.array().items(Joi.string())
        ),
      equipmentStatus: Joi.alternatives()
        .try(
          Joi.string(),
          Joi.array().items(Joi.string())
        ),
      userRole: Joi.alternatives()
        .try(
          Joi.string(),
          Joi.array().items(Joi.string())
        )
    }).default({}),
    includeCharts: Joi.boolean().default(true),
    includeSummary: Joi.boolean().default(true),
    includeDetails: Joi.boolean().default(true),
    scheduledDelivery: Joi.object({
      enabled: Joi.boolean().default(false),
      recipients: Joi.array().items(Joi.string().email()).when('enabled', {
        is: true,
        then: Joi.array().min(1).required()
      }),
      frequency: Joi.string().valid('once', 'daily', 'weekly', 'monthly').when('enabled', {
        is: true,
        then: Joi.required()
      })
    }).default({ enabled: false })
  }).options(joiConfig),

  /**
   * Report filter schema
   */
  filter: Joi.object({
    type: Joi.alternatives()
      .try(
        Joi.string().valid(...Object.values(constants.REPORT_TYPE)),
        Joi.array().items(Joi.string().valid(...Object.values(constants.REPORT_TYPE)))
      ),
    format: Joi.alternatives()
      .try(
        Joi.string().valid(...Object.values(constants.REPORT_FORMAT)),
        Joi.array().items(Joi.string().valid(...Object.values(constants.REPORT_FORMAT)))
      ),
    createdBy: Joi.alternatives()
      .try(
        Joi.string(),
        Joi.array().items(Joi.string())
      ),
    dateFrom: Joi.date(),
    dateTo: Joi.date().min(Joi.ref('dateFrom')),
    search: Joi.string().allow('', null),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(constants.VALIDATION.PAGINATION_MAX_LIMIT).default(constants.VALIDATION.PAGINATION_DEFAULT_LIMIT),
    sort: Joi.string().default('-createdAt')
  }).options(joiConfig)
};

/**
 * Notification validation schemas
 */
const notificationValidation = {
  /**
   * Create notification schema
   */
  create: Joi.object({
    title: Joi.string()
      .max(constants.VALIDATION.TITLE_MAX_LENGTH)
      .required()
      .trim(),
    message: Joi.string()
      .max(constants.VALIDATION.DESCRIPTION_MAX_LENGTH)
      .required()
      .trim(),
    type: Joi.string()
      .valid(...Object.values(constants.NOTIFICATION_TYPE))
      .default(constants.NOTIFICATION_TYPE.SYSTEM),
    priority: Joi.string()
      .valid(...Object.values(constants.NOTIFICATION_PRIORITY))
      .default(constants.NOTIFICATION_PRIORITY.MEDIUM),
    recipients: Joi.alternatives()
      .try(
        Joi.string(),
        Joi.array().items(Joi.string())
      )
      .required(),
    relatedEntity: Joi.object({
      type: Joi.string().required(),
      id: Joi.string().required()
    }).allow(null),
    actions: Joi.array().items(Joi.object({
      label: Joi.string().required(),
      url: Joi.string().required()
    })).default([])
  }).options(joiConfig),

  /**
   * Update notification schema
   */
  update: Joi.object({
    read: Joi.boolean(),
    archived: Joi.boolean()
  }).options(joiConfig),

  /**
   * Notification filter schema
   */
  filter: Joi.object({
    type: Joi.alternatives()
      .try(
        Joi.string().valid(...Object.values(constants.NOTIFICATION_TYPE)),
        Joi.array().items(Joi.string().valid(...Object.values(constants.NOTIFICATION_TYPE)))
      ),
    priority: Joi.alternatives()
      .try(
        Joi.string().valid(...Object.values(constants.NOTIFICATION_PRIORITY)),
        Joi.array().items(Joi.string().valid(...Object.values(constants.NOTIFICATION_PRIORITY)))
      ),
    read: Joi.boolean(),
    archived: Joi.boolean(),
    dateFrom: Joi.date(),
    dateTo: Joi.date().min(Joi.ref('dateFrom')),
    search: Joi.string().allow('', null),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(constants.VALIDATION.PAGINATION_MAX_LIMIT).default(constants.VALIDATION.PAGINATION_DEFAULT_LIMIT),
    sort: Joi.string().default('-createdAt')
  }).options(joiConfig)
};

/**
 * Dashboard validation schemas
 */
const dashboardValidation = {
  /**
   * Dashboard filter schema
   */
  filter: Joi.object({
    period: Joi.string()
      .valid(...Object.values(constants.TIME_PERIOD))
      .default(constants.TIME_PERIOD.THIS_MONTH),
    customDateRange: Joi.object({
      from: Joi.date().required(),
      to: Joi.date().min(Joi.ref('from')).required()
    }).when('period', {
      is: constants.TIME_PERIOD.CUSTOM,
      then: Joi.required()
    }),
    widgets: Joi.array()
      .items(Joi.string().valid(...Object.values(constants.DASHBOARD_WIDGET)))
      .default(Object.values(constants.DASHBOARD_WIDGET))
  }).options(joiConfig),

  /**
   * Save dashboard layout schema
   */
  saveLayout: Joi.object({
    layout: Joi.array().items(Joi.object({
      id: Joi.string().required(),
      x: Joi.number().integer().min(0).required(),
      y: Joi.number().integer().min(0).required(),
      w: Joi.number().integer().min(1).required(),
      h: Joi.number().integer().min(1).required(),
      widget: Joi.string().valid(...Object.values(constants.DASHBOARD_WIDGET)).required()
    })).required()
  }).options(joiConfig)
};

/**
 * Common validation functions
 */

/**
 * Validates if a value is a valid MongoDB ObjectId
 * @param {string} value - Value to validate
 * @returns {boolean} True if valid, false otherwise
 */
const isValidObjectId = (value) => {
  if (!value) return false;
  
  // MongoDB ObjectId is a 24-character hex string
  return /^[0-9a-fA-F]{24}$/.test(value);
};

/**
 * Validates if a date is in the past
 * @param {Date|string|number} date - Date to validate
 * @returns {boolean} True if in the past, false otherwise
 */
const isPastDate = (date) => {
  if (!date) return false;
  return new Date(date) < new Date();
};

/**
 * Validates if a date is in the future
 * @param {Date|string|number} date - Date to validate
 * @returns {boolean} True if in the future, false otherwise
 */
const isFutureDate = (date) => {
  if (!date) return false;
  return new Date(date) > new Date();
};

/**
 * Validates if a user has permission to perform an action on a resource
 * @param {Object} user - User object
 * @param {string} action - Action to perform
 * @param {Object} resource - Resource object
 * @returns {boolean} True if has permission, false otherwise
 */
const hasPermission = (user, action, resource) => {
  if (!user || !action) return false;
  
  // Admin has all permissions
  if (user.role === constants.ROLES.ADMIN) return true;
  
  // Check specific permissions based on role and resource
  switch (action) {
    case 'view':
      // Most resources can be viewed by any authenticated user
      return true;
      
    case 'create':
      // Creating incidents is allowed for all users
      if (resource === 'incident') return true;
      // Creating equipment is only for technicians and admins
      if (resource === 'equipment') return user.role === constants.ROLES.TECHNICIAN;
      // Creating reports is only for technicians and admins
      if (resource === 'report') return user.role === constants.ROLES.TECHNICIAN;
      return false;
      
    case 'update':
      // Users can only update their own incidents
      if (resource.type === 'incident') {
        if (user.role === constants.ROLES.TECHNICIAN) return true;
        return resource.createdBy && resource.createdBy.toString() === user.id;
      }
      // Only technicians and admins can update equipment
      if (resource.type === 'equipment') {
        return user.role === constants.ROLES.TECHNICIAN;
      }
      return false;
      
    case 'delete':
      // Only admins can delete resources (handled by the admin check above)
      return false;
      
    default:
      return false;
  }
};

/**
 * Validates pagination parameters
 * @param {Object} params - Pagination parameters
 * @returns {Object} Validated pagination parameters
 */
const validatePagination = (params = {}) => {
  const { page = 1, limit = constants.VALIDATION.PAGINATION_DEFAULT_LIMIT } = params;
  
  return {
    page: Math.max(1, parseInt(page, 10)),
    limit: Math.min(
      constants.VALIDATION.PAGINATION_MAX_LIMIT,
      Math.max(1, parseInt(limit, 10))
    )
  };
};

/**
 * Validates and sanitizes sort parameters
 * @param {string} sortParam - Sort parameter (e.g., 'field' or '-field')
 * @param {Array<string>} allowedFields - Allowed fields to sort by
 * @returns {Object} Validated sort object for MongoDB
 */
const validateSort = (sortParam = '', allowedFields = []) => {
  if (!sortParam) return { createdAt: -1 };
  
  const sortFields = sortParam.split(',');
  const sortObject = {};
  
  sortFields.forEach(field => {
    let sortField = field.trim();
    let sortOrder = 1;
    
    if (sortField.startsWith('-')) {
      sortField = sortField.substring(1);
      sortOrder = -1;
    }
    
    if (allowedFields.length === 0 || allowedFields.includes(sortField)) {
      sortObject[sortField] = sortOrder;
    }
  });
  
  // If no valid sort fields were found, use default
  if (Object.keys(sortObject).length === 0) {
    return { createdAt: -1 };
  }
  
  return sortObject;
};

module.exports = {
  patterns,
  messages,
  userValidation,
  incidentValidation,
  equipmentValidation,
  reportValidation,
  notificationValidation,
  dashboardValidation,
  isValidObjectId,
  isPastDate,
  isFutureDate,
  hasPermission,
  validatePagination,
  validateSort
};