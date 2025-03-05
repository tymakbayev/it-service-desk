/**
 * IT Service Desk - Client Utility Constants
 * 
 * This file contains utility constants used throughout the client application.
 * These constants are more specific to UI/UX and frontend functionality,
 * complementing the main constants.js file.
 */

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  LIMIT_OPTIONS: [5, 10, 25, 50, 100],
  MAX_VISIBLE_PAGES: 5
};

// Form validation messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  EMAIL_INVALID: 'Please enter a valid email address',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters',
  PASSWORD_TOO_WEAK: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  PASSWORDS_DONT_MATCH: 'Passwords do not match',
  INVALID_DATE: 'Please enter a valid date',
  MAX_LENGTH_EXCEEDED: (max) => `Maximum length of ${max} characters exceeded`,
  MIN_LENGTH: (min) => `Must be at least ${min} characters`,
  INVALID_FORMAT: 'Invalid format',
  INVALID_NUMBER: 'Please enter a valid number',
  INVALID_PHONE: 'Please enter a valid phone number'
};

// Date formats for display
export const DATE_FORMATS = {
  FULL: 'MMMM dd, yyyy HH:mm:ss',
  SHORT: 'MM/dd/yyyy',
  TIME: 'HH:mm:ss',
  DATETIME: 'MM/dd/yyyy HH:mm',
  RELATIVE: 'relative',
  ISO: 'yyyy-MM-dd\'T\'HH:mm:ss.SSSxxx'
};

// Chart colors
export const CHART_COLORS = {
  PRIMARY: [
    '#4e73df', '#2e59d9', '#224abe', '#1e429f', '#1a3a8a'
  ],
  SUCCESS: [
    '#1cc88a', '#18a67a', '#14926a', '#107d5a', '#0c694a'
  ],
  INFO: [
    '#36b9cc', '#30a5b7', '#2a91a1', '#247d8c', '#1e6976'
  ],
  WARNING: [
    '#f6c23e', '#f4b619', '#e2a612', '#c1900f', '#a07a0c'
  ],
  DANGER: [
    '#e74a3b', '#e32f1e', '#c52a1a', '#a82416', '#8a1e12'
  ],
  SECONDARY: [
    '#858796', '#717483', '#5d6071', '#4a4c5e', '#36384a'
  ],
  LIGHT: [
    '#f8f9fc', '#e6e9f4', '#d4d7ed', '#c2c6e5', '#b0b4de'
  ],
  DARK: [
    '#5a5c69', '#484a54', '#36373f', '#24252a', '#121215'
  ],
  STATUS: {
    NEW: '#4e73df',
    ASSIGNED: '#f6c23e',
    IN_PROGRESS: '#36b9cc',
    ON_HOLD: '#858796',
    RESOLVED: '#1cc88a',
    CLOSED: '#5a5c69',
    CANCELLED: '#e74a3b'
  },
  PRIORITY: {
    LOW: '#1cc88a',
    MEDIUM: '#f6c23e',
    HIGH: '#e74a3b',
    CRITICAL: '#e74a3b'
  },
  EQUIPMENT_STATUS: {
    AVAILABLE: '#1cc88a',
    IN_USE: '#4e73df',
    UNDER_MAINTENANCE: '#f6c23e',
    BROKEN: '#e74a3b',
    DECOMMISSIONED: '#5a5c69'
  }
};

// Animation durations
export const ANIMATION = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500
};

// Toast notification settings
export const TOAST_CONFIG = {
  POSITION: 'top-right',
  AUTO_CLOSE: 5000,
  HIDE_PROGRESS_BAR: false,
  CLOSE_ON_CLICK: true,
  PAUSE_ON_HOVER: true,
  DRAGGABLE: true
};

// Modal sizes
export const MODAL_SIZES = {
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
  XL: 'xl',
  FULL: 'full'
};

// Button variants
export const BUTTON_VARIANTS = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  SUCCESS: 'success',
  DANGER: 'danger',
  WARNING: 'warning',
  INFO: 'info',
  LIGHT: 'light',
  DARK: 'dark',
  LINK: 'link',
  OUTLINE_PRIMARY: 'outline-primary',
  OUTLINE_SECONDARY: 'outline-secondary',
  OUTLINE_SUCCESS: 'outline-success',
  OUTLINE_DANGER: 'outline-danger',
  OUTLINE_WARNING: 'outline-warning',
  OUTLINE_INFO: 'outline-info',
  OUTLINE_LIGHT: 'outline-light',
  OUTLINE_DARK: 'outline-dark'
};

// Button sizes
export const BUTTON_SIZES = {
  SM: 'sm',
  MD: 'md',
  LG: 'lg'
};

// Input types
export const INPUT_TYPES = {
  TEXT: 'text',
  PASSWORD: 'password',
  EMAIL: 'email',
  NUMBER: 'number',
  DATE: 'date',
  DATETIME: 'datetime-local',
  TEXTAREA: 'textarea',
  SELECT: 'select',
  CHECKBOX: 'checkbox',
  RADIO: 'radio',
  FILE: 'file',
  HIDDEN: 'hidden',
  COLOR: 'color',
  RANGE: 'range',
  TEL: 'tel',
  URL: 'url',
  SEARCH: 'search',
  TIME: 'time',
  WEEK: 'week',
  MONTH: 'month'
};

// Table column alignment options
export const TABLE_ALIGN = {
  LEFT: 'left',
  CENTER: 'center',
  RIGHT: 'right'
};

// Breakpoints for responsive design
export const BREAKPOINTS = {
  XS: 0,
  SM: 576,
  MD: 768,
  LG: 992,
  XL: 1200,
  XXL: 1400
};

// Z-index values for consistent layering
export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
  TOAST: 1080
};

// Common regex patterns
export const REGEX_PATTERNS = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  PHONE: /^\+?[1-9]\d{1,14}$/,
  URL: /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/,
  IP_ADDRESS: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  MAC_ADDRESS: /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/,
  UUID: /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
};

// Dashboard widget configuration
export const DASHBOARD_WIDGET_CONFIG = {
  DEFAULT_LAYOUT: [
    { i: 'incidents-by-status', x: 0, y: 0, w: 6, h: 2 },
    { i: 'incidents-by-priority', x: 6, y: 0, w: 6, h: 2 },
    { i: 'incidents-over-time', x: 0, y: 2, w: 12, h: 3 },
    { i: 'equipment-by-status', x: 0, y: 5, w: 6, h: 2 },
    { i: 'equipment-by-type', x: 6, y: 5, w: 6, h: 2 },
    { i: 'recent-incidents', x: 0, y: 7, w: 6, h: 3 },
    { i: 'performance-metrics', x: 6, y: 7, w: 6, h: 3 }
  ],
  WIDGET_TITLES: {
    'incidents-by-status': 'Incidents by Status',
    'incidents-by-priority': 'Incidents by Priority',
    'incidents-over-time': 'Incidents Over Time',
    'equipment-by-status': 'Equipment by Status',
    'equipment-by-type': 'Equipment by Type',
    'recent-incidents': 'Recent Incidents',
    'performance-metrics': 'Performance Metrics',
    'top-users': 'Top Users',
    'resolution-time': 'Resolution Time'
  },
  CHART_TYPES: {
    'incidents-by-status': 'doughnut',
    'incidents-by-priority': 'pie',
    'incidents-over-time': 'line',
    'equipment-by-status': 'doughnut',
    'equipment-by-type': 'bar',
    'resolution-time': 'bar'
  }
};

// File upload constraints
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: {
    IMAGE: ['image/jpeg', 'image/png', 'image/gif'],
    DOCUMENT: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain'
    ],
    ALL: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain'
    ]
  },
  ERROR_MESSAGES: {
    TOO_LARGE: 'File is too large. Maximum size is 5MB.',
    INVALID_TYPE: 'Invalid file type. Please upload a supported file format.',
    UPLOAD_FAILED: 'File upload failed. Please try again.'
  }
};

// Status badge variants
export const STATUS_BADGE_VARIANTS = {
  NEW: 'primary',
  ASSIGNED: 'warning',
  IN_PROGRESS: 'info',
  ON_HOLD: 'secondary',
  RESOLVED: 'success',
  CLOSED: 'dark',
  CANCELLED: 'danger',
  AVAILABLE: 'success',
  IN_USE: 'primary',
  UNDER_MAINTENANCE: 'warning',
  BROKEN: 'danger',
  DECOMMISSIONED: 'dark',
  LOW: 'success',
  MEDIUM: 'warning',
  HIGH: 'danger',
  CRITICAL: 'danger'
};

// Sidebar navigation items
export const SIDEBAR_ITEMS = {
  DASHBOARD: {
    path: '/dashboard',
    icon: 'tachometer-alt',
    label: 'Dashboard',
    roles: ['ADMIN', 'TECHNICIAN', 'USER']
  },
  INCIDENTS: {
    path: '/incidents',
    icon: 'ticket-alt',
    label: 'Incidents',
    roles: ['ADMIN', 'TECHNICIAN', 'USER']
  },
  EQUIPMENT: {
    path: '/equipment',
    icon: 'desktop',
    label: 'Equipment',
    roles: ['ADMIN', 'TECHNICIAN', 'USER']
  },
  REPORTS: {
    path: '/reports',
    icon: 'chart-bar',
    label: 'Reports',
    roles: ['ADMIN', 'TECHNICIAN']
  },
  NOTIFICATIONS: {
    path: '/notifications',
    icon: 'bell',
    label: 'Notifications',
    roles: ['ADMIN', 'TECHNICIAN', 'USER']
  },
  USERS: {
    path: '/users',
    icon: 'users',
    label: 'Users',
    roles: ['ADMIN']
  },
  SETTINGS: {
    path: '/settings',
    icon: 'cog',
    label: 'Settings',
    roles: ['ADMIN', 'TECHNICIAN', 'USER']
  },
  PROFILE: {
    path: '/profile',
    icon: 'user',
    label: 'Profile',
    roles: ['ADMIN', 'TECHNICIAN', 'USER']
  }
};

// Export all constants
export default {
  PAGINATION,
  VALIDATION_MESSAGES,
  DATE_FORMATS,
  CHART_COLORS,
  ANIMATION,
  TOAST_CONFIG,
  MODAL_SIZES,
  BUTTON_VARIANTS,
  BUTTON_SIZES,
  INPUT_TYPES,
  TABLE_ALIGN,
  BREAKPOINTS,
  Z_INDEX,
  REGEX_PATTERNS,
  DASHBOARD_WIDGET_CONFIG,
  FILE_UPLOAD,
  STATUS_BADGE_VARIANTS,
  SIDEBAR_ITEMS
};