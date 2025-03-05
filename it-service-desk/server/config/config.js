/**
 * Application configuration
 * This file contains all the configuration settings for the application
 * Environment variables are loaded from .env file
 */
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Environment
const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PRODUCTION = NODE_ENV === 'production';
const IS_DEVELOPMENT = NODE_ENV === 'development';
const IS_TEST = NODE_ENV === 'test';

// Server configuration
const SERVER_PORT = parseInt(process.env.PORT || '5000', 10);
const SERVER_HOST = process.env.HOST || 'localhost';
const API_PREFIX = process.env.API_PREFIX || '/api';
const API_VERSION = process.env.API_VERSION || 'v1';
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

// Database configuration
const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/it-service-desk';
const DB_OPTIONS = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  maxPoolSize: 10
};

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-should-be-long-and-secure';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-should-be-different';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// Email configuration
const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.example.com';
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || '587', 10);
const EMAIL_USER = process.env.EMAIL_USER || 'user@example.com';
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD || 'password';
const EMAIL_FROM = process.env.EMAIL_FROM || 'IT Service Desk <noreply@example.com>';
const EMAIL_SECURE = process.env.EMAIL_SECURE === 'true';

// File upload configuration
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.resolve(__dirname, '../../uploads');
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '5242880', 10); // 5MB
const ALLOWED_FILE_TYPES = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document').split(',');

// Logging configuration
const LOG_LEVEL = process.env.LOG_LEVEL || (IS_PRODUCTION ? 'info' : 'debug');
const LOG_FILE = process.env.LOG_FILE || path.resolve(__dirname, '../../logs/app.log');
const LOG_MAX_SIZE = process.env.LOG_MAX_SIZE || '10m';
const LOG_MAX_FILES = parseInt(process.env.LOG_MAX_FILES || '7', 10);

// WebSocket configuration
const WS_PATH = process.env.WS_PATH || '/socket.io';
const WS_PING_TIMEOUT = parseInt(process.env.WS_PING_TIMEOUT || '5000', 10);
const WS_PING_INTERVAL = parseInt(process.env.WS_PING_INTERVAL || '25000', 10);

// Rate limiting
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10); // 15 minutes
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX || '100', 10); // 100 requests per window

// Security
const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);

// Application roles
const ROLES = {
  ADMIN: 'ADMIN',
  TECHNICIAN: 'TECHNICIAN',
  USER: 'USER'
};

// Incident statuses
const INCIDENT_STATUSES = {
  NEW: 'NEW',
  ASSIGNED: 'ASSIGNED',
  IN_PROGRESS: 'IN_PROGRESS',
  ON_HOLD: 'ON_HOLD',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
  CANCELLED: 'CANCELLED'
};

// Incident priorities
const INCIDENT_PRIORITIES = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
};

// Equipment statuses
const EQUIPMENT_STATUSES = {
  AVAILABLE: 'AVAILABLE',
  IN_USE: 'IN_USE',
  UNDER_MAINTENANCE: 'UNDER_MAINTENANCE',
  BROKEN: 'BROKEN',
  DECOMMISSIONED: 'DECOMMISSIONED'
};

// Report types
const REPORT_TYPES = {
  INCIDENTS: 'incidents',
  EQUIPMENT: 'equipment',
  USERS: 'users',
  PERFORMANCE: 'performance'
};

// Report formats
const REPORT_FORMATS = {
  PDF: 'pdf',
  EXCEL: 'excel',
  CSV: 'csv'
};

// Notification types
const NOTIFICATION_TYPES = {
  INCIDENT_CREATED: 'INCIDENT_CREATED',
  INCIDENT_UPDATED: 'INCIDENT_UPDATED',
  INCIDENT_ASSIGNED: 'INCIDENT_ASSIGNED',
  INCIDENT_RESOLVED: 'INCIDENT_RESOLVED',
  EQUIPMENT_ADDED: 'EQUIPMENT_ADDED',
  EQUIPMENT_UPDATED: 'EQUIPMENT_UPDATED',
  EQUIPMENT_STATUS_CHANGED: 'EQUIPMENT_STATUS_CHANGED',
  USER_REGISTERED: 'USER_REGISTERED',
  SYSTEM: 'SYSTEM'
};

// Pagination defaults
const DEFAULT_PAGE_SIZE = parseInt(process.env.DEFAULT_PAGE_SIZE || '10', 10);
const MAX_PAGE_SIZE = parseInt(process.env.MAX_PAGE_SIZE || '100', 10);

// Session configuration
const SESSION_SECRET = process.env.SESSION_SECRET || 'session-secret-key-should-be-secure';
const SESSION_MAX_AGE = parseInt(process.env.SESSION_MAX_AGE || '86400000', 10); // 24 hours

// Password policy
const PASSWORD_MIN_LENGTH = parseInt(process.env.PASSWORD_MIN_LENGTH || '8', 10);
const PASSWORD_REQUIRE_UPPERCASE = process.env.PASSWORD_REQUIRE_UPPERCASE !== 'false';
const PASSWORD_REQUIRE_LOWERCASE = process.env.PASSWORD_REQUIRE_LOWERCASE !== 'false';
const PASSWORD_REQUIRE_NUMBER = process.env.PASSWORD_REQUIRE_NUMBER !== 'false';
const PASSWORD_REQUIRE_SYMBOL = process.env.PASSWORD_REQUIRE_SYMBOL !== 'false';

// Export all configuration
module.exports = {
  env: {
    NODE_ENV,
    IS_PRODUCTION,
    IS_DEVELOPMENT,
    IS_TEST
  },
  server: {
    port: SERVER_PORT,
    host: SERVER_HOST,
    apiPrefix: API_PREFIX,
    apiVersion: API_VERSION,
    corsOrigin: CORS_ORIGIN
  },
  database: {
    uri: DB_URI,
    options: DB_OPTIONS
  },
  jwt: {
    secret: JWT_SECRET,
    expiresIn: JWT_EXPIRES_IN,
    refreshSecret: JWT_REFRESH_SECRET,
    refreshExpiresIn: JWT_REFRESH_EXPIRES_IN
  },
  email: {
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    user: EMAIL_USER,
    password: EMAIL_PASSWORD,
    from: EMAIL_FROM,
    secure: EMAIL_SECURE
  },
  upload: {
    dir: UPLOAD_DIR,
    maxFileSize: MAX_FILE_SIZE,
    allowedFileTypes: ALLOWED_FILE_TYPES
  },
  logging: {
    level: LOG_LEVEL,
    file: LOG_FILE,
    maxSize: LOG_MAX_SIZE,
    maxFiles: LOG_MAX_FILES
  },
  websocket: {
    path: WS_PATH,
    pingTimeout: WS_PING_TIMEOUT,
    pingInterval: WS_PING_INTERVAL
  },
  rateLimit: {
    windowMs: RATE_LIMIT_WINDOW_MS,
    max: RATE_LIMIT_MAX
  },
  security: {
    bcryptSaltRounds: BCRYPT_SALT_ROUNDS
  },
  roles: ROLES,
  incidentStatuses: INCIDENT_STATUSES,
  incidentPriorities: INCIDENT_PRIORITIES,
  equipmentStatuses: EQUIPMENT_STATUSES,
  reportTypes: REPORT_TYPES,
  reportFormats: REPORT_FORMATS,
  notificationTypes: NOTIFICATION_TYPES,
  pagination: {
    defaultPageSize: DEFAULT_PAGE_SIZE,
    maxPageSize: MAX_PAGE_SIZE
  },
  session: {
    secret: SESSION_SECRET,
    maxAge: SESSION_MAX_AGE
  },
  passwordPolicy: {
    minLength: PASSWORD_MIN_LENGTH,
    requireUppercase: PASSWORD_REQUIRE_UPPERCASE,
    requireLowercase: PASSWORD_REQUIRE_LOWERCASE,
    requireNumber: PASSWORD_REQUIRE_NUMBER,
    requireSymbol: PASSWORD_REQUIRE_SYMBOL
  },
  
  // Helper function to get full API path
  getFullApiPath: (path) => {
    return `${API_PREFIX}/${API_VERSION}${path}`;
  },
  
  // Helper function to check if a role is valid
  isValidRole: (role) => {
    return Object.values(ROLES).includes(role);
  },
  
  // Helper function to check if an incident status is valid
  isValidIncidentStatus: (status) => {
    return Object.values(INCIDENT_STATUSES).includes(status);
  },
  
  // Helper function to check if an incident priority is valid
  isValidIncidentPriority: (priority) => {
    return Object.values(INCIDENT_PRIORITIES).includes(priority);
  },
  
  // Helper function to check if an equipment status is valid
  isValidEquipmentStatus: (status) => {
    return Object.values(EQUIPMENT_STATUSES).includes(status);
  },
  
  // Helper function to check if a report type is valid
  isValidReportType: (type) => {
    return Object.values(REPORT_TYPES).includes(type);
  },
  
  // Helper function to check if a report format is valid
  isValidReportFormat: (format) => {
    return Object.values(REPORT_FORMATS).includes(format);
  },
  
  // Helper function to check if a notification type is valid
  isValidNotificationType: (type) => {
    return Object.values(NOTIFICATION_TYPES).includes(type);
  }
};