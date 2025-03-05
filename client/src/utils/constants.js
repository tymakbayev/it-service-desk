/**
 * IT Service Desk - Client Constants
 * 
 * This file contains all the constant values used throughout the client application.
 * Centralizing constants helps maintain consistency and makes updates easier.
 */

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH_TOKEN: '/api/auth/refresh-token',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    VERIFY_EMAIL: '/api/auth/verify-email',
    PROFILE: '/api/auth/profile',
    UPDATE_PROFILE: '/api/auth/profile/update',
    CHANGE_PASSWORD: '/api/auth/change-password'
  },
  // Incident endpoints
  INCIDENTS: {
    BASE: '/api/incidents',
    GET_ALL: '/api/incidents',
    GET_BY_ID: (id) => `/api/incidents/${id}`,
    CREATE: '/api/incidents',
    UPDATE: (id) => `/api/incidents/${id}`,
    DELETE: (id) => `/api/incidents/${id}`,
    ASSIGN: (id) => `/api/incidents/${id}/assign`,
    CHANGE_STATUS: (id) => `/api/incidents/${id}/status`,
    ADD_COMMENT: (id) => `/api/incidents/${id}/comments`,
    GET_COMMENTS: (id) => `/api/incidents/${id}/comments`,
    UPLOAD_ATTACHMENT: (id) => `/api/incidents/${id}/attachments`,
    GET_ATTACHMENTS: (id) => `/api/incidents/${id}/attachments`
  },
  // Equipment endpoints
  EQUIPMENT: {
    BASE: '/api/equipment',
    GET_ALL: '/api/equipment',
    GET_BY_ID: (id) => `/api/equipment/${id}`,
    CREATE: '/api/equipment',
    UPDATE: (id) => `/api/equipment/${id}`,
    DELETE: (id) => `/api/equipment/${id}`,
    CHANGE_STATUS: (id) => `/api/equipment/${id}/status`,
    ASSIGN_TO_USER: (id) => `/api/equipment/${id}/assign`,
    UPLOAD_IMAGE: (id) => `/api/equipment/${id}/image`,
    GET_HISTORY: (id) => `/api/equipment/${id}/history`
  },
  // Dashboard endpoints
  DASHBOARD: {
    SUMMARY: '/api/dashboard/summary',
    INCIDENTS_BY_STATUS: '/api/dashboard/incidents-by-status',
    INCIDENTS_BY_PRIORITY: '/api/dashboard/incidents-by-priority',
    INCIDENTS_OVER_TIME: '/api/dashboard/incidents-over-time',
    EQUIPMENT_BY_STATUS: '/api/dashboard/equipment-by-status',
    EQUIPMENT_BY_TYPE: '/api/dashboard/equipment-by-type',
    RECENT_INCIDENTS: '/api/dashboard/recent-incidents',
    PERFORMANCE_METRICS: '/api/dashboard/performance-metrics',
    TOP_USERS: '/api/dashboard/top-users',
    RESOLUTION_TIME: '/api/dashboard/resolution-time'
  },
  // Report endpoints
  REPORTS: {
    BASE: '/api/reports',
    GET_ALL: '/api/reports',
    GET_BY_ID: (id) => `/api/reports/${id}`,
    CREATE: '/api/reports',
    DELETE: (id) => `/api/reports/${id}`,
    DOWNLOAD: (id, format) => `/api/reports/${id}/download?format=${format}`,
    GENERATE: '/api/reports/generate'
  },
  // Notification endpoints
  NOTIFICATIONS: {
    GET_ALL: '/api/notifications',
    GET_UNREAD: '/api/notifications/unread',
    MARK_AS_READ: (id) => `/api/notifications/${id}/read`,
    MARK_ALL_AS_READ: '/api/notifications/read-all',
    DELETE: (id) => `/api/notifications/${id}`,
    DELETE_ALL: '/api/notifications/delete-all'
  },
  // User endpoints
  USERS: {
    GET_ALL: '/api/users',
    GET_BY_ID: (id) => `/api/users/${id}`,
    CREATE: '/api/users',
    UPDATE: (id) => `/api/users/${id}`,
    DELETE: (id) => `/api/users/${id}`,
    CHANGE_ROLE: (id) => `/api/users/${id}/role`,
    TECHNICIANS: '/api/users/technicians'
  }
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'it_service_desk_token',
  REFRESH_TOKEN: 'it_service_desk_refresh_token',
  USER: 'it_service_desk_user',
  THEME: 'it_service_desk_theme',
  LANGUAGE: 'it_service_desk_language',
  SIDEBAR_STATE: 'it_service_desk_sidebar_state',
  DASHBOARD_LAYOUT: 'it_service_desk_dashboard_layout',
  LAST_NOTIFICATION_CHECK: 'it_service_desk_last_notification_check'
};

// User Roles
export const ROLES = {
  ADMIN: 'ADMIN',
  TECHNICIAN: 'TECHNICIAN',
  USER: 'USER'
};

// Role Hierarchy (higher number = higher privileges)
export const ROLE_HIERARCHY = {
  [ROLES.USER]: 1,
  [ROLES.TECHNICIAN]: 2,
  [ROLES.ADMIN]: 3
};

// Role-based permissions
export const PERMISSIONS = {
  // Incident permissions
  INCIDENTS: {
    VIEW_ALL: [ROLES.ADMIN, ROLES.TECHNICIAN],
    VIEW_OWN: [ROLES.USER],
    CREATE: [ROLES.ADMIN, ROLES.TECHNICIAN, ROLES.USER],
    UPDATE_ANY: [ROLES.ADMIN, ROLES.TECHNICIAN],
    UPDATE_OWN: [ROLES.USER],
    DELETE: [ROLES.ADMIN],
    ASSIGN: [ROLES.ADMIN, ROLES.TECHNICIAN],
    CHANGE_STATUS: [ROLES.ADMIN, ROLES.TECHNICIAN],
    COMMENT: [ROLES.ADMIN, ROLES.TECHNICIAN, ROLES.USER]
  },
  // Equipment permissions
  EQUIPMENT: {
    VIEW: [ROLES.ADMIN, ROLES.TECHNICIAN, ROLES.USER],
    CREATE: [ROLES.ADMIN, ROLES.TECHNICIAN],
    UPDATE: [ROLES.ADMIN, ROLES.TECHNICIAN],
    DELETE: [ROLES.ADMIN],
    CHANGE_STATUS: [ROLES.ADMIN, ROLES.TECHNICIAN],
    ASSIGN: [ROLES.ADMIN, ROLES.TECHNICIAN]
  },
  // Dashboard permissions
  DASHBOARD: {
    VIEW: [ROLES.ADMIN, ROLES.TECHNICIAN, ROLES.USER],
    CONFIGURE: [ROLES.ADMIN]
  },
  // Report permissions
  REPORTS: {
    VIEW: [ROLES.ADMIN, ROLES.TECHNICIAN],
    CREATE: [ROLES.ADMIN, ROLES.TECHNICIAN],
    DOWNLOAD: [ROLES.ADMIN, ROLES.TECHNICIAN],
    DELETE: [ROLES.ADMIN]
  },
  // User management permissions
  USERS: {
    VIEW: [ROLES.ADMIN],
    CREATE: [ROLES.ADMIN],
    UPDATE: [ROLES.ADMIN],
    DELETE: [ROLES.ADMIN],
    CHANGE_ROLE: [ROLES.ADMIN]
  }
};

// Incident Statuses
export const INCIDENT_STATUS = {
  NEW: 'NEW',
  ASSIGNED: 'ASSIGNED',
  IN_PROGRESS: 'IN_PROGRESS',
  ON_HOLD: 'ON_HOLD',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
  CANCELLED: 'CANCELLED'
};

// Status display names
export const INCIDENT_STATUS_DISPLAY = {
  [INCIDENT_STATUS.NEW]: 'New',
  [INCIDENT_STATUS.ASSIGNED]: 'Assigned',
  [INCIDENT_STATUS.IN_PROGRESS]: 'In Progress',
  [INCIDENT_STATUS.ON_HOLD]: 'On Hold',
  [INCIDENT_STATUS.RESOLVED]: 'Resolved',
  [INCIDENT_STATUS.CLOSED]: 'Closed',
  [INCIDENT_STATUS.CANCELLED]: 'Cancelled'
};

// Status colors for UI
export const INCIDENT_STATUS_COLORS = {
  [INCIDENT_STATUS.NEW]: '#3498db', // Blue
  [INCIDENT_STATUS.ASSIGNED]: '#9b59b6', // Purple
  [INCIDENT_STATUS.IN_PROGRESS]: '#f39c12', // Orange
  [INCIDENT_STATUS.ON_HOLD]: '#95a5a6', // Gray
  [INCIDENT_STATUS.RESOLVED]: '#2ecc71', // Green
  [INCIDENT_STATUS.CLOSED]: '#27ae60', // Dark Green
  [INCIDENT_STATUS.CANCELLED]: '#e74c3c' // Red
};

// Incident Priorities
export const INCIDENT_PRIORITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
};

// Priority display names
export const INCIDENT_PRIORITY_DISPLAY = {
  [INCIDENT_PRIORITY.LOW]: 'Low',
  [INCIDENT_PRIORITY.MEDIUM]: 'Medium',
  [INCIDENT_PRIORITY.HIGH]: 'High',
  [INCIDENT_PRIORITY.CRITICAL]: 'Critical'
};

// Priority colors for UI
export const INCIDENT_PRIORITY_COLORS = {
  [INCIDENT_PRIORITY.LOW]: '#3498db', // Blue
  [INCIDENT_PRIORITY.MEDIUM]: '#f39c12', // Orange
  [INCIDENT_PRIORITY.HIGH]: '#e67e22', // Dark Orange
  [INCIDENT_PRIORITY.CRITICAL]: '#e74c3c' // Red
};

// Priority SLA (in hours)
export const PRIORITY_SLA = {
  [INCIDENT_PRIORITY.LOW]: 48,
  [INCIDENT_PRIORITY.MEDIUM]: 24,
  [INCIDENT_PRIORITY.HIGH]: 8,
  [INCIDENT_PRIORITY.CRITICAL]: 2
};

// Equipment Statuses
export const EQUIPMENT_STATUS = {
  AVAILABLE: 'AVAILABLE',
  IN_USE: 'IN_USE',
  UNDER_MAINTENANCE: 'UNDER_MAINTENANCE',
  BROKEN: 'BROKEN',
  DECOMMISSIONED: 'DECOMMISSIONED'
};

// Equipment status display names
export const EQUIPMENT_STATUS_DISPLAY = {
  [EQUIPMENT_STATUS.AVAILABLE]: 'Available',
  [EQUIPMENT_STATUS.IN_USE]: 'In Use',
  [EQUIPMENT_STATUS.UNDER_MAINTENANCE]: 'Under Maintenance',
  [EQUIPMENT_STATUS.BROKEN]: 'Broken',
  [EQUIPMENT_STATUS.DECOMMISSIONED]: 'Decommissioned'
};

// Equipment status colors for UI
export const EQUIPMENT_STATUS_COLORS = {
  [EQUIPMENT_STATUS.AVAILABLE]: '#2ecc71', // Green
  [EQUIPMENT_STATUS.IN_USE]: '#3498db', // Blue
  [EQUIPMENT_STATUS.UNDER_MAINTENANCE]: '#f39c12', // Orange
  [EQUIPMENT_STATUS.BROKEN]: '#e74c3c', // Red
  [EQUIPMENT_STATUS.DECOMMISSIONED]: '#95a5a6' // Gray
};

// Equipment Types
export const EQUIPMENT_TYPE = {
  DESKTOP: 'DESKTOP',
  LAPTOP: 'LAPTOP',
  SERVER: 'SERVER',
  NETWORK: 'NETWORK',
  PERIPHERAL: 'PERIPHERAL',
  MOBILE: 'MOBILE',
  OTHER: 'OTHER'
};

// Equipment type display names
export const EQUIPMENT_TYPE_DISPLAY = {
  [EQUIPMENT_TYPE.DESKTOP]: 'Desktop',
  [EQUIPMENT_TYPE.LAPTOP]: 'Laptop',
  [EQUIPMENT_TYPE.SERVER]: 'Server',
  [EQUIPMENT_TYPE.NETWORK]: 'Network Device',
  [EQUIPMENT_TYPE.PERIPHERAL]: 'Peripheral',
  [EQUIPMENT_TYPE.MOBILE]: 'Mobile Device',
  [EQUIPMENT_TYPE.OTHER]: 'Other'
};

// Equipment type icons (for use with react-icons)
export const EQUIPMENT_TYPE_ICONS = {
  [EQUIPMENT_TYPE.DESKTOP]: 'FaDesktop',
  [EQUIPMENT_TYPE.LAPTOP]: 'FaLaptop',
  [EQUIPMENT_TYPE.SERVER]: 'FaServer',
  [EQUIPMENT_TYPE.NETWORK]: 'FaNetworkWired',
  [EQUIPMENT_TYPE.PERIPHERAL]: 'FaPrint',
  [EQUIPMENT_TYPE.MOBILE]: 'FaMobileAlt',
  [EQUIPMENT_TYPE.OTHER]: 'FaQuestionCircle'
};

// Notification Types
export const NOTIFICATION_TYPE = {
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

// Notification display messages
export const NOTIFICATION_MESSAGES = {
  [NOTIFICATION_TYPE.INCIDENT_CREATED]: 'New incident created',
  [NOTIFICATION_TYPE.INCIDENT_UPDATED]: 'Incident updated',
  [NOTIFICATION_TYPE.INCIDENT_ASSIGNED]: 'Incident assigned',
  [NOTIFICATION_TYPE.INCIDENT_RESOLVED]: 'Incident resolved',
  [NOTIFICATION_TYPE.INCIDENT_CLOSED]: 'Incident closed',
  [NOTIFICATION_TYPE.EQUIPMENT_ADDED]: 'New equipment added',
  [NOTIFICATION_TYPE.EQUIPMENT_UPDATED]: 'Equipment updated',
  [NOTIFICATION_TYPE.EQUIPMENT_STATUS_CHANGED]: 'Equipment status changed',
  [NOTIFICATION_TYPE.USER_REGISTERED]: 'New user registered',
  [NOTIFICATION_TYPE.REPORT_GENERATED]: 'Report generated',
  [NOTIFICATION_TYPE.SYSTEM]: 'System notification'
};

// Notification icons (for use with react-icons)
export const NOTIFICATION_ICONS = {
  [NOTIFICATION_TYPE.INCIDENT_CREATED]: 'FaExclamationCircle',
  [NOTIFICATION_TYPE.INCIDENT_UPDATED]: 'FaEdit',
  [NOTIFICATION_TYPE.INCIDENT_ASSIGNED]: 'FaUserPlus',
  [NOTIFICATION_TYPE.INCIDENT_RESOLVED]: 'FaCheckCircle',
  [NOTIFICATION_TYPE.INCIDENT_CLOSED]: 'FaArchive',
  [NOTIFICATION_TYPE.EQUIPMENT_ADDED]: 'FaPlus',
  [NOTIFICATION_TYPE.EQUIPMENT_UPDATED]: 'FaEdit',
  [NOTIFICATION_TYPE.EQUIPMENT_STATUS_CHANGED]: 'FaExchangeAlt',
  [NOTIFICATION_TYPE.USER_REGISTERED]: 'FaUserPlus',
  [NOTIFICATION_TYPE.REPORT_GENERATED]: 'FaFileAlt',
  [NOTIFICATION_TYPE.SYSTEM]: 'FaCog'
};

// Notification Priorities
export const NOTIFICATION_PRIORITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH'
};

// Notification priority colors
export const NOTIFICATION_PRIORITY_COLORS = {
  [NOTIFICATION_PRIORITY.LOW]: '#3498db', // Blue
  [NOTIFICATION_PRIORITY.MEDIUM]: '#f39c12', // Orange
  [NOTIFICATION_PRIORITY.HIGH]: '#e74c3c' // Red
};

// Report Types
export const REPORT_TYPE = {
  INCIDENTS: 'INCIDENTS',
  EQUIPMENT: 'EQUIPMENT',
  USERS: 'USERS',
  PERFORMANCE: 'PERFORMANCE',
  CUSTOM: 'CUSTOM'
};

// Report type display names
export const REPORT_TYPE_DISPLAY = {
  [REPORT_TYPE.INCIDENTS]: 'Incidents Report',
  [REPORT_TYPE.EQUIPMENT]: 'Equipment Report',
  [REPORT_TYPE.USERS]: 'Users Report',
  [REPORT_TYPE.PERFORMANCE]: 'Performance Report',
  [REPORT_TYPE.CUSTOM]: 'Custom Report'
};

// Report Formats
export const REPORT_FORMAT = {
  PDF: 'PDF',
  EXCEL: 'EXCEL',
  CSV: 'CSV',
  HTML: 'HTML'
};

// Report format display names
export const REPORT_FORMAT_DISPLAY = {
  [REPORT_FORMAT.PDF]: 'PDF Document',
  [REPORT_FORMAT.EXCEL]: 'Excel Spreadsheet',
  [REPORT_FORMAT.CSV]: 'CSV File',
  [REPORT_FORMAT.HTML]: 'HTML Document'
};

// Report format icons (for use with react-icons)
export const REPORT_FORMAT_ICONS = {
  [REPORT_FORMAT.PDF]: 'FaFilePdf',
  [REPORT_FORMAT.EXCEL]: 'FaFileExcel',
  [REPORT_FORMAT.CSV]: 'FaFileCsv',
  [REPORT_FORMAT.HTML]: 'FaFileCode'
};

// Time Periods for Reports and Dashboard
export const TIME_PERIOD = {
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

// Time period display names
export const TIME_PERIOD_DISPLAY = {
  [TIME_PERIOD.TODAY]: 'Today',
  [TIME_PERIOD.YESTERDAY]: 'Yesterday',
  [TIME_PERIOD.THIS_WEEK]: 'This Week',
  [TIME_PERIOD.LAST_WEEK]: 'Last Week',
  [TIME_PERIOD.THIS_MONTH]: 'This Month',
  [TIME_PERIOD.LAST_MONTH]: 'Last Month',
  [TIME_PERIOD.THIS_QUARTER]: 'This Quarter',
  [TIME_PERIOD.LAST_QUARTER]: 'Last Quarter',
  [TIME_PERIOD.THIS_YEAR]: 'This Year',
  [TIME_PERIOD.LAST_YEAR]: 'Last Year',
  [TIME_PERIOD.CUSTOM]: 'Custom Range'
};

// Dashboard Widget Types
export const DASHBOARD_WIDGET = {
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

// Dashboard widget display names
export const DASHBOARD_WIDGET_DISPLAY = {
  [DASHBOARD_WIDGET.INCIDENTS_BY_STATUS]: 'Incidents by Status',
  [DASHBOARD_WIDGET.INCIDENTS_BY_PRIORITY]: 'Incidents by Priority',
  [DASHBOARD_WIDGET.INCIDENTS_OVER_TIME]: 'Incidents Over Time',
  [DASHBOARD_WIDGET.EQUIPMENT_BY_STATUS]: 'Equipment by Status',
  [DASHBOARD_WIDGET.EQUIPMENT_BY_TYPE]: 'Equipment by Type',
  [DASHBOARD_WIDGET.RECENT_INCIDENTS]: 'Recent Incidents',
  [DASHBOARD_WIDGET.PERFORMANCE_METRICS]: 'Performance Metrics',
  [DASHBOARD_WIDGET.TOP_USERS]: 'Top Users',
  [DASHBOARD_WIDGET.RESOLUTION_TIME]: 'Resolution Time'
};

// Dashboard widget icons (for use with react-icons)
export const DASHBOARD_WIDGET_ICONS = {
  [DASHBOARD_WIDGET.INCIDENTS_BY_STATUS]: 'FaChartPie',
  [DASHBOARD_WIDGET.INCIDENTS_BY_PRIORITY]: 'FaChartBar',
  [DASHBOARD_WIDGET.INCIDENTS_OVER_TIME]: 'FaChartLine',
  [DASHBOARD_WIDGET.EQUIPMENT_BY_STATUS]: 'FaChartPie',
  [DASHBOARD_WIDGET.EQUIPMENT_BY_TYPE]: 'FaChartBar',
  [DASHBOARD_WIDGET.RECENT_INCIDENTS]: 'FaList',
  [DASHBOARD_WIDGET.PERFORMANCE_METRICS]: 'FaTachometerAlt',
  [DASHBOARD_WIDGET.TOP_USERS]: 'FaUsers',
  [DASHBOARD_WIDGET.RESOLUTION_TIME]: 'FaClock'
};

// Chart Types
export const CHART_TYPE = {
  BAR: 'bar',
  LINE: 'line',
  PIE: 'pie',
  DOUGHNUT: 'doughnut',
  RADAR: 'radar',
  POLAR_AREA: 'polarArea',
  BUBBLE: 'bubble',
  SCATTER: 'scatter'
};

// Chart colors palette
export const CHART_COLORS = [
  '#3498db', // Blue
  '#2ecc71', // Green
  '#e74c3c', // Red
  '#f39c12', // Orange
  '#9b59b6', // Purple
  '#1abc9c', // Turquoise
  '#34495e', // Dark Blue
  '#e67e22', // Dark Orange
  '#27ae60', // Dark Green
  '#c0392b', // Dark Red
  '#8e44ad', // Dark Purple
  '#16a085', // Dark Turquoise
  '#7f8c8d', // Gray
  '#d35400', // Pumpkin
  '#2980b9'  // Royal Blue
];

// Validation Constants
export const VALIDATION = {
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

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  DEFAULT_SORT_FIELD: 'createdAt',
  DEFAULT_SORT_ORDER: 'desc'
};

// File Upload Constants
export const FILE_UPLOAD = {
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
    'text/plain'
  ],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt']
};

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  PROFILE: '/profile',
  DASHBOARD: '/dashboard',
  INCIDENTS: '/incidents',
  INCIDENT_DETAIL: '/incidents/:id',
  CREATE_INCIDENT: '/incidents/create',
  EDIT_INCIDENT: '/incidents/:id/edit',
  EQUIPMENT: '/equipment',
  EQUIPMENT_DETAIL: '/equipment/:id',
  CREATE_EQUIPMENT: '/equipment/create',
  EDIT_EQUIPMENT: '/equipment/:id/edit',
  NOTIFICATIONS: '/notifications',
  REPORTS: '/reports',
  CREATE_REPORT: '/reports/create',
  VIEW_REPORT: '/reports/:id',
  USERS: '/users',
  USER_DETAIL: '/users/:id',
  CREATE_USER: '/users/create',
  EDIT_USER: '/users/:id/edit',
  SETTINGS: '/settings',
  NOT_FOUND: '/404'
};

// Navigation items
export const NAVIGATION_ITEMS = [
  {
    name: 'Dashboard',
    path: ROUTES.DASHBOARD,
    icon: 'FaChartPie',
    roles: [ROLES.ADMIN, ROLES.TECHNICIAN, ROLES.USER]
  },
  {
    name: 'Incidents',
    path: ROUTES.INCIDENTS,
    icon: 'FaExclamationCircle',
    roles: [ROLES.ADMIN, ROLES.TECHNICIAN, ROLES.USER]
  },
  {
    name: 'Equipment',
    path: ROUTES.EQUIPMENT,
    icon: 'FaLaptop',
    roles: [ROLES.ADMIN, ROLES.TECHNICIAN, ROLES.USER]
  },
  {
    name: 'Reports',
    path: ROUTES.REPORTS,
    icon: 'FaFileAlt',
    roles: [ROLES.ADMIN, ROLES.TECHNICIAN]
  },
  {
    name: 'Users',
    path: ROUTES.USERS,
    icon: 'FaUsers',
    roles: [ROLES.ADMIN]
  },
  {
    name: 'Settings',
    path: ROUTES.SETTINGS,
    icon: 'FaCog',
    roles: [ROLES.ADMIN, ROLES.TECHNICIAN, ROLES.USER]
  }
];

// Theme settings
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
};

// Language options
export const LANGUAGES = {
  EN: 'en',
  ES: 'es',
  FR: 'fr',
  DE: 'de',
  JA: 'ja'
};

// Language display names
export const LANGUAGE_DISPLAY = {
  [LANGUAGES.EN]: 'English',
  [LANGUAGES.ES]: 'Español',
  [LANGUAGES.FR]: 'Français',
  [LANGUAGES.DE]: 'Deutsch',
  [LANGUAGES.JA]: '日本語'
};

// WebSocket events
export const WEBSOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'error',
  NOTIFICATION: 'notification',
  INCIDENT_UPDATED: 'incident_updated',
  EQUIPMENT_UPDATED: 'equipment_updated',
  USER_ACTIVITY: 'user_activity'
};

// HTTP Status Codes
export const HTTP_STATUS = {
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

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'You do not have permission to access this resource.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check the form for errors.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  DEFAULT: 'An error occurred. Please try again.'
};

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Successfully logged in.',
  LOGOUT: 'Successfully logged out.',
  REGISTER: 'Registration successful. Please check your email for verification.',
  PASSWORD_RESET: 'Password reset email sent. Please check your inbox.',
  PASSWORD_CHANGED: 'Password successfully changed.',
  PROFILE_UPDATED: 'Profile successfully updated.',
  INCIDENT_CREATED: 'Incident successfully created.',
  INCIDENT_UPDATED: 'Incident successfully updated.',
  INCIDENT_DELETED: 'Incident successfully deleted.',
  EQUIPMENT_CREATED: 'Equipment successfully added.',
  EQUIPMENT_UPDATED: 'Equipment successfully updated.',
  EQUIPMENT_DELETED: 'Equipment successfully deleted.',
  REPORT_GENERATED: 'Report successfully generated.',
  REPORT_DELETED: 'Report successfully deleted.',
  NOTIFICATION_READ: 'Notification marked as read.',
  ALL_NOTIFICATIONS_READ: 'All notifications marked as read.'
};

export default {
  API_ENDPOINTS,
  STORAGE_KEYS,
  ROLES,
  ROLE_HIERARCHY,
  PERMISSIONS,
  INCIDENT_STATUS,
  INCIDENT_STATUS_DISPLAY,
  INCIDENT_STATUS_COLORS,
  INCIDENT_PRIORITY,
  INCIDENT_PRIORITY_DISPLAY,
  INCIDENT_PRIORITY_COLORS,
  PRIORITY_SLA,
  EQUIPMENT_STATUS,
  EQUIPMENT_STATUS_DISPLAY,
  EQUIPMENT_STATUS_COLORS,
  EQUIPMENT_TYPE,
  EQUIPMENT_TYPE_DISPLAY,
  EQUIPMENT_TYPE_ICONS,
  NOTIFICATION_TYPE,
  NOTIFICATION_MESSAGES,
  NOTIFICATION_ICONS,
  NOTIFICATION_PRIORITY,
  NOTIFICATION_PRIORITY_COLORS,
  REPORT_TYPE,
  REPORT_TYPE_DISPLAY,
  REPORT_FORMAT,
  REPORT_FORMAT_DISPLAY,
  REPORT_FORMAT_ICONS,
  TIME_PERIOD,
  TIME_PERIOD_DISPLAY,
  DASHBOARD_WIDGET,
  DASHBOARD_WIDGET_DISPLAY,
  DASHBOARD_WIDGET_ICONS,
  CHART_TYPE,
  CHART_COLORS,
  VALIDATION,
  PAGINATION,
  FILE_UPLOAD,
  ROUTES,
  NAVIGATION_ITEMS,
  THEMES,
  LANGUAGES,
  LANGUAGE_DISPLAY,
  WEBSOCKET_EVENTS,
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES
};