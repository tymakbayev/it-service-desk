/**
 * IT Service Desk - Constants
 * 
 * This file contains all the constant values used throughout the application.
 * Centralizing constants helps maintain consistency and makes updates easier.
 */

// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

// User Roles
const ROLES = {
  ADMIN: 'ADMIN',
  TECHNICIAN: 'TECHNICIAN',
  USER: 'USER'
};

// Role Hierarchy (higher number = higher privileges)
const ROLE_HIERARCHY = {
  [ROLES.USER]: 1,
  [ROLES.TECHNICIAN]: 2,
  [ROLES.ADMIN]: 3
};

// Incident Statuses
const INCIDENT_STATUS = {
  NEW: 'NEW',
  ASSIGNED: 'ASSIGNED',
  IN_PROGRESS: 'IN_PROGRESS',
  ON_HOLD: 'ON_HOLD',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
  CANCELLED: 'CANCELLED'
};

// Incident Priorities
const INCIDENT_PRIORITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
};

// Priority SLA (in hours)
const PRIORITY_SLA = {
  [INCIDENT_PRIORITY.LOW]: 48,
  [INCIDENT_PRIORITY.MEDIUM]: 24,
  [INCIDENT_PRIORITY.HIGH]: 8,
  [INCIDENT_PRIORITY.CRITICAL]: 2
};

// Equipment Statuses
const EQUIPMENT_STATUS = {
  AVAILABLE: 'AVAILABLE',
  IN_USE: 'IN_USE',
  UNDER_MAINTENANCE: 'UNDER_MAINTENANCE',
  BROKEN: 'BROKEN',
  DECOMMISSIONED: 'DECOMMISSIONED'
};

// Equipment Types
const EQUIPMENT_TYPE = {
  DESKTOP: 'DESKTOP',
  LAPTOP: 'LAPTOP',
  SERVER: 'SERVER',
  NETWORK: 'NETWORK',
  PERIPHERAL: 'PERIPHERAL',
  MOBILE: 'MOBILE',
  OTHER: 'OTHER'
};

// Notification Types
const NOTIFICATION_TYPE = {
  INCIDENT_CREATED: 'INCIDENT_CREATED',
  INCIDENT_UPDATED: 'INCIDENT_UPDATED',
  INCIDENT_ASSIGNED: 'INCIDENT_ASSIGNED',
  INCIDENT_RESOLVED: 'INCIDENT_RESOLVED',
  INCIDENT_CLOSED: 'INCIDENT_CLOSED',
  EQUIPMENT_ADDED: 'EQUIPMENT_ADDED',
  EQUIPMENT_UPDATED: 'EQUIPMENT_UPDATED',
  EQUIPMENT_STATUS_CHANGED: 'EQUIPMENT_STATUS_CHANGED',
  USER_REGISTERED: 'USER_REGISTERED',
  REPORT_GENERATED: 'REPORT_GENERATED',
  SYSTEM: 'SYSTEM'
};

// Notification Priorities
const NOTIFICATION_PRIORITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH'
};

// Report Types
const REPORT_TYPE = {
  INCIDENTS: 'INCIDENTS',
  EQUIPMENT: 'EQUIPMENT',
  USERS: 'USERS',
  PERFORMANCE: 'PERFORMANCE',
  CUSTOM: 'CUSTOM'
};

// Report Formats
const REPORT_FORMAT = {
  PDF: 'PDF',
  EXCEL: 'EXCEL',
  CSV: 'CSV',
  HTML: 'HTML'
};

// Time Periods for Reports and Dashboard
const TIME_PERIOD = {
  TODAY: 'TODAY',
  YESTERDAY: 'YESTERDAY',
  THIS_WEEK: 'THIS_WEEK',
  LAST_WEEK: 'LAST_WEEK',
  THIS_MONTH: 'THIS_MONTH',
  LAST_MONTH: 'LAST_MONTH',
  THIS_QUARTER: 'THIS_QUARTER',
  LAST_QUARTER: 'LAST_QUARTER',
  THIS_YEAR: 'THIS_YEAR',
  LAST_YEAR: 'LAST_YEAR',
  CUSTOM: 'CUSTOM'
};

// Dashboard Widget Types
const DASHBOARD_WIDGET = {
  INCIDENTS_BY_STATUS: 'INCIDENTS_BY_STATUS',
  INCIDENTS_BY_PRIORITY: 'INCIDENTS_BY_PRIORITY',
  INCIDENTS_OVER_TIME: 'INCIDENTS_OVER_TIME',
  EQUIPMENT_BY_STATUS: 'EQUIPMENT_BY_STATUS',
  EQUIPMENT_BY_TYPE: 'EQUIPMENT_BY_TYPE',
  RECENT_INCIDENTS: 'RECENT_INCIDENTS',
  PERFORMANCE_METRICS: 'PERFORMANCE_METRICS',
  TOP_USERS: 'TOP_USERS',
  RESOLUTION_TIME: 'RESOLUTION_TIME'
};

// Validation Constants
const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 50,
  EMAIL_MAX_LENGTH: 255,
  NAME_MAX_LENGTH: 100,
  TITLE_MAX_LENGTH: 200,
  DESCRIPTION_MAX_LENGTH: 5000,
  COMMENT_MAX_LENGTH: 1000,
  PAGINATION_DEFAULT_LIMIT: 10,
  PAGINATION_MAX_LIMIT: 100
};

// File Upload Constants
const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_MIME_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'application/zip'
  ],
  UPLOAD_DIR: 'uploads',
  TEMP_DIR: 'uploads/temp'
};

// JWT Constants
const JWT = {
  ACCESS_TOKEN_EXPIRY: '15m', // 15 minutes
  REFRESH_TOKEN_EXPIRY: '7d', // 7 days
  RESET_PASSWORD_EXPIRY: '1h', // 1 hour
  VERIFY_EMAIL_EXPIRY: '24h', // 24 hours
  ISSUER: 'it-service-desk',
  AUDIENCE: 'it-service-desk-users'
};

// Email Templates
const EMAIL_TEMPLATES = {
  WELCOME: 'welcome',
  PASSWORD_RESET: 'password-reset',
  VERIFY_EMAIL: 'verify-email',
  INCIDENT_CREATED: 'incident-created',
  INCIDENT_UPDATED: 'incident-updated',
  INCIDENT_ASSIGNED: 'incident-assigned',
  INCIDENT_RESOLVED: 'incident-resolved',
  EQUIPMENT_ASSIGNED: 'equipment-assigned'
};

// WebSocket Events
const WEBSOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'error',
  NOTIFICATION: 'notification',
  INCIDENT_UPDATED: 'incident_updated',
  EQUIPMENT_UPDATED: 'equipment_updated',
  USER_CONNECTED: 'user_connected',
  USER_DISCONNECTED: 'user_disconnected',
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room'
};

// API Routes
const API_ROUTES = {
  AUTH: {
    BASE: '/api/auth',
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH_TOKEN: '/api/auth/refresh-token',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    VERIFY_EMAIL: '/api/auth/verify-email',
    PROFILE: '/api/auth/profile',
    CHANGE_PASSWORD: '/api/auth/change-password'
  },
  USERS: {
    BASE: '/api/users',
    GET_ALL: '/api/users',
    GET_BY_ID: '/api/users/:id',
    CREATE: '/api/users',
    UPDATE: '/api/users/:id',
    DELETE: '/api/users/:id',
    CHANGE_ROLE: '/api/users/:id/role',
    TECHNICIANS: '/api/users/technicians'
  },
  INCIDENTS: {
    BASE: '/api/incidents',
    GET_ALL: '/api/incidents',
    GET_BY_ID: '/api/incidents/:id',
    CREATE: '/api/incidents',
    UPDATE: '/api/incidents/:id',
    DELETE: '/api/incidents/:id',
    ASSIGN: '/api/incidents/:id/assign',
    CHANGE_STATUS: '/api/incidents/:id/status',
    ADD_COMMENT: '/api/incidents/:id/comments',
    GET_COMMENTS: '/api/incidents/:id/comments',
    UPLOAD_ATTACHMENT: '/api/incidents/:id/attachments',
    GET_ATTACHMENTS: '/api/incidents/:id/attachments'
  },
  EQUIPMENT: {
    BASE: '/api/equipment',
    GET_ALL: '/api/equipment',
    GET_BY_ID: '/api/equipment/:id',
    CREATE: '/api/equipment',
    UPDATE: '/api/equipment/:id',
    DELETE: '/api/equipment/:id',
    CHANGE_STATUS: '/api/equipment/:id/status',
    ASSIGN_TO_USER: '/api/equipment/:id/assign',
    UPLOAD_IMAGE: '/api/equipment/:id/image',
    GET_HISTORY: '/api/equipment/:id/history'
  },
  DASHBOARD: {
    BASE: '/api/dashboard',
    SUMMARY: '/api/dashboard/summary',
    INCIDENTS_BY_STATUS: '/api/dashboard/incidents-by-status',
    INCIDENTS_BY_PRIORITY: '/api/dashboard/incidents-by-priority',
    INCIDENTS_OVER_TIME: '/api/dashboard/incidents-over-time',
    EQUIPMENT_BY_STATUS: '/api/dashboard/equipment-by-status',
    EQUIPMENT_BY_TYPE: '/api/dashboard/equipment-by-type',
    RECENT_INCIDENTS: '/api/dashboard/recent-incidents',
    PERFORMANCE_METRICS: '/api/dashboard/performance-metrics'
  },
  REPORTS: {
    BASE: '/api/reports',
    GET_ALL: '/api/reports',
    GET_BY_ID: '/api/reports/:id',
    CREATE: '/api/reports',
    DELETE: '/api/reports/:id',
    DOWNLOAD: '/api/reports/:id/download',
    GENERATE: '/api/reports/generate'
  },
  NOTIFICATIONS: {
    BASE: '/api/notifications',
    GET_ALL: '/api/notifications',
    GET_UNREAD: '/api/notifications/unread',
    MARK_AS_READ: '/api/notifications/:id/read',
    MARK_ALL_AS_READ: '/api/notifications/read-all',
    DELETE: '/api/notifications/:id',
    DELETE_ALL: '/api/notifications/delete-all'
  }
};

// Error Messages
const ERROR_MESSAGES = {
  AUTHENTICATION: {
    INVALID_CREDENTIALS: 'Invalid email or password',
    ACCOUNT_LOCKED: 'Your account has been locked due to too many failed login attempts',
    ACCOUNT_DISABLED: 'Your account has been disabled',
    EMAIL_NOT_VERIFIED: 'Please verify your email address before logging in',
    TOKEN_EXPIRED: 'Your session has expired. Please log in again',
    TOKEN_INVALID: 'Invalid authentication token',
    TOKEN_MISSING: 'Authentication token is missing',
    UNAUTHORIZED: 'You are not authorized to perform this action',
    FORBIDDEN: 'You do not have permission to access this resource',
    PASSWORD_MISMATCH: 'New password and confirm password do not match',
    OLD_PASSWORD_INCORRECT: 'Current password is incorrect',
    EMAIL_ALREADY_VERIFIED: 'Email is already verified',
    INVALID_RESET_TOKEN: 'Password reset token is invalid or has expired'
  },
  VALIDATION: {
    REQUIRED_FIELD: 'This field is required',
    INVALID_EMAIL: 'Please enter a valid email address',
    PASSWORD_TOO_SHORT: `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters long`,
    PASSWORD_TOO_WEAK: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    USERNAME_TOO_SHORT: `Username must be at least ${VALIDATION.USERNAME_MIN_LENGTH} characters long`,
    INVALID_DATE: 'Please enter a valid date',
    INVALID_ID: 'Invalid ID format',
    INVALID_STATUS: 'Invalid status value',
    INVALID_PRIORITY: 'Invalid priority value',
    INVALID_ROLE: 'Invalid role value',
    INVALID_FILE_TYPE: 'Invalid file type',
    FILE_TOO_LARGE: `File size must be less than ${FILE_UPLOAD.MAX_SIZE / (1024 * 1024)}MB`
  },
  RESOURCE: {
    NOT_FOUND: 'Resource not found',
    ALREADY_EXISTS: 'Resource already exists',
    CREATION_FAILED: 'Failed to create resource',
    UPDATE_FAILED: 'Failed to update resource',
    DELETION_FAILED: 'Failed to delete resource',
    USER_NOT_FOUND: 'User not found',
    INCIDENT_NOT_FOUND: 'Incident not found',
    EQUIPMENT_NOT_FOUND: 'Equipment not found',
    REPORT_NOT_FOUND: 'Report not found',
    NOTIFICATION_NOT_FOUND: 'Notification not found',
    COMMENT_NOT_FOUND: 'Comment not found',
    ATTACHMENT_NOT_FOUND: 'Attachment not found'
  },
  SERVER: {
    INTERNAL_ERROR: 'Internal server error',
    DATABASE_ERROR: 'Database error',
    SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
    EMAIL_SENDING_FAILED: 'Failed to send email',
    FILE_UPLOAD_FAILED: 'Failed to upload file',
    REPORT_GENERATION_FAILED: 'Failed to generate report'
  }
};

// Success Messages
const SUCCESS_MESSAGES = {
  AUTHENTICATION: {
    LOGIN_SUCCESS: 'Login successful',
    LOGOUT_SUCCESS: 'Logout successful',
    REGISTRATION_SUCCESS: 'Registration successful. Please check your email to verify your account',
    EMAIL_VERIFICATION_SUCCESS: 'Email verification successful. You can now log in',
    PASSWORD_RESET_EMAIL_SENT: 'Password reset instructions have been sent to your email',
    PASSWORD_RESET_SUCCESS: 'Password has been reset successfully',
    PASSWORD_CHANGE_SUCCESS: 'Password has been changed successfully',
    PROFILE_UPDATE_SUCCESS: 'Profile updated successfully'
  },
  RESOURCE: {
    CREATED: 'Resource created successfully',
    UPDATED: 'Resource updated successfully',
    DELETED: 'Resource deleted successfully',
    INCIDENT_CREATED: 'Incident created successfully',
    INCIDENT_UPDATED: 'Incident updated successfully',
    INCIDENT_ASSIGNED: 'Incident assigned successfully',
    INCIDENT_STATUS_CHANGED: 'Incident status changed successfully',
    EQUIPMENT_CREATED: 'Equipment created successfully',
    EQUIPMENT_UPDATED: 'Equipment updated successfully',
    EQUIPMENT_STATUS_CHANGED: 'Equipment status changed successfully',
    EQUIPMENT_ASSIGNED: 'Equipment assigned successfully',
    REPORT_GENERATED: 'Report generated successfully',
    NOTIFICATION_READ: 'Notification marked as read',
    ALL_NOTIFICATIONS_READ: 'All notifications marked as read',
    COMMENT_ADDED: 'Comment added successfully',
    ATTACHMENT_UPLOADED: 'Attachment uploaded successfully'
  }
};

// Export all constants
module.exports = {
  HTTP_STATUS,
  ROLES,
  ROLE_HIERARCHY,
  INCIDENT_STATUS,
  INCIDENT_PRIORITY,
  PRIORITY_SLA,
  EQUIPMENT_STATUS,
  EQUIPMENT_TYPE,
  NOTIFICATION_TYPE,
  NOTIFICATION_PRIORITY,
  REPORT_TYPE,
  REPORT_FORMAT,
  TIME_PERIOD,
  DASHBOARD_WIDGET,
  VALIDATION,
  FILE_UPLOAD,
  JWT,
  EMAIL_TEMPLATES,
  WEBSOCKET_EVENTS,
  API_ROUTES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES
};