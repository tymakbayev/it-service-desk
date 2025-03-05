/**
 * IT Service Desk - Client-side Validators
 * 
 * This file contains validation functions and schemas used throughout the client application.
 * It provides centralized validation logic for form inputs, data integrity, and consistent
 * error messages across the application.
 * 
 * Uses Yup for schema validation and custom validation functions for specific business rules.
 */

import * as Yup from 'yup';
import { parseISO, isValid, isAfter, isBefore } from 'date-fns';

/**
 * Common validation patterns
 */
export const patterns = {
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
  ipAddressPattern: /^((\d{1,3}\.){3}\d{1,3}|([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4})$/,
  // Email pattern
  emailPattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
};

/**
 * Validation constants
 */
export const VALIDATION = {
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 50,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 100,
  NAME_MAX_LENGTH: 100,
  EMAIL_MAX_LENGTH: 255,
  TITLE_MIN_LENGTH: 3,
  TITLE_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 2000,
  SERIAL_NUMBER_MAX_LENGTH: 50,
  COMMENT_MAX_LENGTH: 1000,
  PHONE_MAX_LENGTH: 20,
  ADDRESS_MAX_LENGTH: 200,
  LOCATION_MAX_LENGTH: 100
};

/**
 * Custom validation messages
 */
export const messages = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  passwordMatch: 'Passwords must match',
  passwordStrength: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  minLength: (field, length) => `${field} must be at least ${length} characters`,
  maxLength: (field, length) => `${field} must not exceed ${length} characters`,
  invalidFormat: (field) => `${field} format is invalid`,
  futureDate: 'Date cannot be in the future',
  pastDate: 'Date cannot be in the past',
  invalidDate: 'Please enter a valid date',
  invalidPhone: 'Please enter a valid phone number',
  invalidMac: 'Please enter a valid MAC address',
  invalidIp: 'Please enter a valid IP address',
  invalidSerialNumber: 'Please enter a valid serial number',
  invalidSelection: 'Please make a valid selection'
};

/**
 * Validates if a string is a valid date
 * @param {string} value - The date string to validate
 * @returns {boolean} - True if the date is valid
 */
export const isValidDate = (value) => {
  if (!value) return false;
  const date = parseISO(value);
  return isValid(date);
};

/**
 * Validates if a date is in the future
 * @param {string|Date} value - The date to validate
 * @returns {boolean} - True if the date is in the future
 */
export const isFutureDate = (value) => {
  if (!value) return false;
  const date = typeof value === 'string' ? parseISO(value) : value;
  return isValid(date) && isAfter(date, new Date());
};

/**
 * Validates if a date is in the past
 * @param {string|Date} value - The date to validate
 * @returns {boolean} - True if the date is in the past
 */
export const isPastDate = (value) => {
  if (!value) return false;
  const date = typeof value === 'string' ? parseISO(value) : value;
  return isValid(date) && isBefore(date, new Date());
};

/**
 * Validates if a value is empty (null, undefined, empty string, or empty array)
 * @param {*} value - The value to check
 * @returns {boolean} - True if the value is empty
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

/**
 * Validates if a string is a valid email
 * @param {string} value - The email to validate
 * @returns {boolean} - True if the email is valid
 */
export const isValidEmail = (value) => {
  if (!value) return false;
  return patterns.emailPattern.test(value);
};

/**
 * Validates if a string is a valid phone number
 * @param {string} value - The phone number to validate
 * @returns {boolean} - True if the phone number is valid
 */
export const isValidPhone = (value) => {
  if (!value) return true; // Phone can be optional
  return patterns.phonePattern.test(value);
};

/**
 * Validates if a string is a valid MAC address
 * @param {string} value - The MAC address to validate
 * @returns {boolean} - True if the MAC address is valid
 */
export const isValidMacAddress = (value) => {
  if (!value) return false;
  return patterns.macAddressPattern.test(value);
};

/**
 * Validates if a string is a valid IP address
 * @param {string} value - The IP address to validate
 * @returns {boolean} - True if the IP address is valid
 */
export const isValidIpAddress = (value) => {
  if (!value) return false;
  return patterns.ipAddressPattern.test(value);
};

/**
 * Validates if a string is a valid serial number
 * @param {string} value - The serial number to validate
 * @returns {boolean} - True if the serial number is valid
 */
export const isValidSerialNumber = (value) => {
  if (!value) return false;
  return patterns.serialNumberPattern.test(value);
};

/**
 * Validates if a password meets strength requirements
 * @param {string} value - The password to validate
 * @returns {boolean} - True if the password is strong enough
 */
export const isStrongPassword = (value) => {
  if (!value) return false;
  return patterns.strongPasswordPattern.test(value);
};

/**
 * User validation schemas
 */
export const userSchemas = {
  /**
   * Login form validation schema
   */
  login: Yup.object({
    email: Yup.string()
      .email(messages.email)
      .required(messages.required)
      .trim(),
    password: Yup.string()
      .required(messages.required),
    rememberMe: Yup.boolean()
  }),

  /**
   * Registration form validation schema
   */
  register: Yup.object({
    username: Yup.string()
      .min(VALIDATION.USERNAME_MIN_LENGTH, messages.minLength('Username', VALIDATION.USERNAME_MIN_LENGTH))
      .max(VALIDATION.USERNAME_MAX_LENGTH, messages.maxLength('Username', VALIDATION.USERNAME_MAX_LENGTH))
      .required(messages.required)
      .trim(),
    email: Yup.string()
      .email(messages.email)
      .max(VALIDATION.EMAIL_MAX_LENGTH, messages.maxLength('Email', VALIDATION.EMAIL_MAX_LENGTH))
      .required(messages.required)
      .trim(),
    password: Yup.string()
      .min(VALIDATION.PASSWORD_MIN_LENGTH, messages.minLength('Password', VALIDATION.PASSWORD_MIN_LENGTH))
      .max(VALIDATION.PASSWORD_MAX_LENGTH, messages.maxLength('Password', VALIDATION.PASSWORD_MAX_LENGTH))
      .matches(patterns.strongPasswordPattern, messages.passwordStrength)
      .required(messages.required),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], messages.passwordMatch)
      .required(messages.required),
    firstName: Yup.string()
      .max(VALIDATION.NAME_MAX_LENGTH, messages.maxLength('First name', VALIDATION.NAME_MAX_LENGTH))
      .matches(patterns.namePattern, messages.invalidFormat('First name'))
      .required(messages.required)
      .trim(),
    lastName: Yup.string()
      .max(VALIDATION.NAME_MAX_LENGTH, messages.maxLength('Last name', VALIDATION.NAME_MAX_LENGTH))
      .matches(patterns.namePattern, messages.invalidFormat('Last name'))
      .required(messages.required)
      .trim(),
    department: Yup.string()
      .max(VALIDATION.NAME_MAX_LENGTH, messages.maxLength('Department', VALIDATION.NAME_MAX_LENGTH))
      .trim(),
    phone: Yup.string()
      .test('is-valid-phone', messages.invalidPhone, isValidPhone)
      .max(VALIDATION.PHONE_MAX_LENGTH, messages.maxLength('Phone number', VALIDATION.PHONE_MAX_LENGTH))
      .nullable()
  }),

  /**
   * Forgot password form validation schema
   */
  forgotPassword: Yup.object({
    email: Yup.string()
      .email(messages.email)
      .required(messages.required)
      .trim()
  }),

  /**
   * Reset password form validation schema
   */
  resetPassword: Yup.object({
    password: Yup.string()
      .min(VALIDATION.PASSWORD_MIN_LENGTH, messages.minLength('Password', VALIDATION.PASSWORD_MIN_LENGTH))
      .max(VALIDATION.PASSWORD_MAX_LENGTH, messages.maxLength('Password', VALIDATION.PASSWORD_MAX_LENGTH))
      .matches(patterns.strongPasswordPattern, messages.passwordStrength)
      .required(messages.required),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], messages.passwordMatch)
      .required(messages.required)
  }),

  /**
   * User profile update validation schema
   */
  profileUpdate: Yup.object({
    firstName: Yup.string()
      .max(VALIDATION.NAME_MAX_LENGTH, messages.maxLength('First name', VALIDATION.NAME_MAX_LENGTH))
      .matches(patterns.namePattern, messages.invalidFormat('First name'))
      .required(messages.required)
      .trim(),
    lastName: Yup.string()
      .max(VALIDATION.NAME_MAX_LENGTH, messages.maxLength('Last name', VALIDATION.NAME_MAX_LENGTH))
      .matches(patterns.namePattern, messages.invalidFormat('Last name'))
      .required(messages.required)
      .trim(),
    department: Yup.string()
      .max(VALIDATION.NAME_MAX_LENGTH, messages.maxLength('Department', VALIDATION.NAME_MAX_LENGTH))
      .trim(),
    phone: Yup.string()
      .test('is-valid-phone', messages.invalidPhone, isValidPhone)
      .max(VALIDATION.PHONE_MAX_LENGTH, messages.maxLength('Phone number', VALIDATION.PHONE_MAX_LENGTH))
      .nullable(),
    email: Yup.string()
      .email(messages.email)
      .max(VALIDATION.EMAIL_MAX_LENGTH, messages.maxLength('Email', VALIDATION.EMAIL_MAX_LENGTH))
      .required(messages.required)
      .trim()
  }),

  /**
   * Change password validation schema
   */
  changePassword: Yup.object({
    currentPassword: Yup.string()
      .required(messages.required),
    newPassword: Yup.string()
      .min(VALIDATION.PASSWORD_MIN_LENGTH, messages.minLength('Password', VALIDATION.PASSWORD_MIN_LENGTH))
      .max(VALIDATION.PASSWORD_MAX_LENGTH, messages.maxLength('Password', VALIDATION.PASSWORD_MAX_LENGTH))
      .matches(patterns.strongPasswordPattern, messages.passwordStrength)
      .required(messages.required)
      .notOneOf([Yup.ref('currentPassword')], 'New password must be different from current password'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('newPassword'), null], messages.passwordMatch)
      .required(messages.required)
  })
};

/**
 * Incident validation schemas
 */
export const incidentSchemas = {
  /**
   * Create/Edit incident validation schema
   */
  incident: Yup.object({
    title: Yup.string()
      .min(VALIDATION.TITLE_MIN_LENGTH, messages.minLength('Title', VALIDATION.TITLE_MIN_LENGTH))
      .max(VALIDATION.TITLE_MAX_LENGTH, messages.maxLength('Title', VALIDATION.TITLE_MAX_LENGTH))
      .required(messages.required)
      .trim(),
    description: Yup.string()
      .max(VALIDATION.DESCRIPTION_MAX_LENGTH, messages.maxLength('Description', VALIDATION.DESCRIPTION_MAX_LENGTH))
      .required(messages.required)
      .trim(),
    priority: Yup.string()
      .required(messages.required),
    status: Yup.string()
      .required(messages.required),
    category: Yup.string()
      .required(messages.required),
    assignedTo: Yup.string()
      .nullable(),
    equipment: Yup.string()
      .nullable(),
    location: Yup.string()
      .max(VALIDATION.LOCATION_MAX_LENGTH, messages.maxLength('Location', VALIDATION.LOCATION_MAX_LENGTH))
      .trim(),
    dueDate: Yup.date()
      .nullable()
      .test('is-valid-date', messages.invalidDate, function(value) {
        if (!value) return true; // Optional field
        return isValidDate(value);
      })
  }),

  /**
   * Incident comment validation schema
   */
  comment: Yup.object({
    content: Yup.string()
      .max(VALIDATION.COMMENT_MAX_LENGTH, messages.maxLength('Comment', VALIDATION.COMMENT_MAX_LENGTH))
      .required(messages.required)
      .trim()
  }),

  /**
   * Incident filter validation schema
   */
  filter: Yup.object({
    status: Yup.array()
      .of(Yup.string()),
    priority: Yup.array()
      .of(Yup.string()),
    category: Yup.array()
      .of(Yup.string()),
    assignedTo: Yup.array()
      .of(Yup.string()),
    dateFrom: Yup.date()
      .nullable()
      .test('is-valid-date', messages.invalidDate, function(value) {
        if (!value) return true;
        return isValidDate(value);
      }),
    dateTo: Yup.date()
      .nullable()
      .test('is-valid-date', messages.invalidDate, function(value) {
        if (!value) return true;
        return isValidDate(value);
      })
      .test('is-after-from', 'End date must be after start date', function(value) {
        const { dateFrom } = this.parent;
        if (!value || !dateFrom) return true;
        return isAfter(parseISO(value), parseISO(dateFrom));
      })
  })
};

/**
 * Equipment validation schemas
 */
export const equipmentSchemas = {
  /**
   * Create/Edit equipment validation schema
   */
  equipment: Yup.object({
    name: Yup.string()
      .max(VALIDATION.NAME_MAX_LENGTH, messages.maxLength('Name', VALIDATION.NAME_MAX_LENGTH))
      .required(messages.required)
      .trim(),
    type: Yup.string()
      .required(messages.required),
    serialNumber: Yup.string()
      .max(VALIDATION.SERIAL_NUMBER_MAX_LENGTH, messages.maxLength('Serial number', VALIDATION.SERIAL_NUMBER_MAX_LENGTH))
      .test('is-valid-serial', messages.invalidSerialNumber, isValidSerialNumber)
      .required(messages.required)
      .trim(),
    status: Yup.string()
      .required(messages.required),
    purchaseDate: Yup.date()
      .nullable()
      .test('is-valid-date', messages.invalidDate, function(value) {
        if (!value) return true;
        return isValidDate(value);
      }),
    warrantyExpiration: Yup.date()
      .nullable()
      .test('is-valid-date', messages.invalidDate, function(value) {
        if (!value) return true;
        return isValidDate(value);
      })
      .test('is-after-purchase', 'Warranty date must be after purchase date', function(value) {
        const { purchaseDate } = this.parent;
        if (!value || !purchaseDate) return true;
        return isAfter(parseISO(value), parseISO(purchaseDate));
      }),
    location: Yup.string()
      .max(VALIDATION.LOCATION_MAX_LENGTH, messages.maxLength('Location', VALIDATION.LOCATION_MAX_LENGTH))
      .trim(),
    assignedTo: Yup.string()
      .nullable(),
    manufacturer: Yup.string()
      .max(VALIDATION.NAME_MAX_LENGTH, messages.maxLength('Manufacturer', VALIDATION.NAME_MAX_LENGTH))
      .trim(),
    model: Yup.string()
      .max(VALIDATION.NAME_MAX_LENGTH, messages.maxLength('Model', VALIDATION.NAME_MAX_LENGTH))
      .trim(),
    notes: Yup.string()
      .max(VALIDATION.DESCRIPTION_MAX_LENGTH, messages.maxLength('Notes', VALIDATION.DESCRIPTION_MAX_LENGTH))
      .trim(),
    ipAddress: Yup.string()
      .test('is-valid-ip', messages.invalidIp, function(value) {
        if (!value) return true; // Optional field
        return isValidIpAddress(value);
      })
      .nullable(),
    macAddress: Yup.string()
      .test('is-valid-mac', messages.invalidMac, function(value) {
        if (!value) return true; // Optional field
        return isValidMacAddress(value);
      })
      .nullable()
  }),

  /**
   * Equipment filter validation schema
   */
  filter: Yup.object({
    type: Yup.array()
      .of(Yup.string()),
    status: Yup.array()
      .of(Yup.string()),
    assignedTo: Yup.array()
      .of(Yup.string()),
    location: Yup.array()
      .of(Yup.string()),
    manufacturer: Yup.array()
      .of(Yup.string()),
    purchaseDateFrom: Yup.date()
      .nullable()
      .test('is-valid-date', messages.invalidDate, function(value) {
        if (!value) return true;
        return isValidDate(value);
      }),
    purchaseDateTo: Yup.date()
      .nullable()
      .test('is-valid-date', messages.invalidDate, function(value) {
        if (!value) return true;
        return isValidDate(value);
      })
      .test('is-after-from', 'End date must be after start date', function(value) {
        const { purchaseDateFrom } = this.parent;
        if (!value || !purchaseDateFrom) return true;
        return isAfter(parseISO(value), parseISO(purchaseDateFrom));
      })
  })
};

/**
 * Report validation schemas
 */
export const reportSchemas = {
  /**
   * Generate report validation schema
   */
  report: Yup.object({
    title: Yup.string()
      .max(VALIDATION.TITLE_MAX_LENGTH, messages.maxLength('Title', VALIDATION.TITLE_MAX_LENGTH))
      .required(messages.required)
      .trim(),
    type: Yup.string()
      .required(messages.required),
    format: Yup.string()
      .required(messages.required),
    dateFrom: Yup.date()
      .required(messages.required)
      .test('is-valid-date', messages.invalidDate, isValidDate),
    dateTo: Yup.date()
      .required(messages.required)
      .test('is-valid-date', messages.invalidDate, isValidDate)
      .test('is-after-from', 'End date must be after start date', function(value) {
        const { dateFrom } = this.parent;
        if (!value || !dateFrom) return true;
        return isAfter(parseISO(value), parseISO(dateFrom));
      }),
    includeCharts: Yup.boolean(),
    filters: Yup.object({
      status: Yup.array()
        .of(Yup.string()),
      priority: Yup.array()
        .of(Yup.string()),
      category: Yup.array()
        .of(Yup.string()),
      assignedTo: Yup.array()
        .of(Yup.string()),
      equipmentType: Yup.array()
        .of(Yup.string())
    })
  })
};

/**
 * Dashboard filter validation schema
 */
export const dashboardFilterSchema = Yup.object({
  period: Yup.string()
    .required(messages.required),
  dateFrom: Yup.date()
    .nullable()
    .test('is-valid-date', messages.invalidDate, function(value) {
      if (!value) return true;
      return isValidDate(value);
    }),
  dateTo: Yup.date()
    .nullable()
    .test('is-valid-date', messages.invalidDate, function(value) {
      if (!value) return true;
      return isValidDate(value);
    })
    .test('is-after-from', 'End date must be after start date', function(value) {
      const { dateFrom } = this.parent;
      if (!value || !dateFrom) return true;
      return isAfter(parseISO(value), parseISO(dateFrom));
    })
});

/**
 * Notification settings validation schema
 */
export const notificationSettingsSchema = Yup.object({
  emailNotifications: Yup.boolean(),
  pushNotifications: Yup.boolean(),
  incidentCreated: Yup.boolean(),
  incidentAssigned: Yup.boolean(),
  incidentStatusChanged: Yup.boolean(),
  incidentCommented: Yup.boolean(),
  equipmentStatusChanged: Yup.boolean(),
  reportGenerated: Yup.boolean()
});

/**
 * Form validation helper functions
 */
export const formHelpers = {
  /**
   * Get field error message
   * @param {Object} formik - Formik instance
   * @param {string} fieldName - Field name
   * @returns {string|null} - Error message or null
   */
  getFieldError: (formik, fieldName) => {
    return formik.touched[fieldName] && formik.errors[fieldName] 
      ? formik.errors[fieldName] 
      : null;
  },

  /**
   * Check if field has error
   * @param {Object} formik - Formik instance
   * @param {string} fieldName - Field name
   * @returns {boolean} - True if field has error
   */
  hasFieldError: (formik, fieldName) => {
    return formik.touched[fieldName] && Boolean(formik.errors[fieldName]);
  },

  /**
   * Get field props for form components
   * @param {Object} formik - Formik instance
   * @param {string} fieldName - Field name
   * @returns {Object} - Field props
   */
  getFieldProps: (formik, fieldName) => {
    return {
      ...formik.getFieldProps(fieldName),
      error: formHelpers.hasFieldError(formik, fieldName),
      helperText: formHelpers.getFieldError(formik, fieldName)
    };
  }
};

export default {
  patterns,
  VALIDATION,
  messages,
  isValidDate,
  isFutureDate,
  isPastDate,
  isEmpty,
  isValidEmail,
  isValidPhone,
  isValidMacAddress,
  isValidIpAddress,
  isValidSerialNumber,
  isStrongPassword,
  userSchemas,
  incidentSchemas,
  equipmentSchemas,
  reportSchemas,
  dashboardFilterSchema,
  notificationSettingsSchema,
  formHelpers
};