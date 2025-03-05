/**
 * formatters.js
 * Utility functions for formatting data in the IT Service Desk application.
 * 
 * This module provides a comprehensive set of functions for formatting various types of data
 * such as dates, currency, numbers, file sizes, status values, priorities, and other common data types
 * used throughout the application.
 */

import { format, parseISO } from 'date-fns';
import { 
  INCIDENT_PRIORITY, 
  INCIDENT_STATUS, 
  EQUIPMENT_STATUS 
} from './constants';

/**
 * Format a number with thousand separators
 * @param {number} number - The number to format
 * @param {number} decimals - Number of decimal places (default: 0)
 * @param {string} decimalSeparator - Decimal separator (default: '.')
 * @param {string} thousandSeparator - Thousand separator (default: ' ')
 * @returns {string} Formatted number
 */
export const formatNumber = (
  number,
  decimals = 0,
  decimalSeparator = '.',
  thousandSeparator = ' '
) => {
  if (number === null || number === undefined || isNaN(number)) {
    return '';
  }

  try {
    const num = parseFloat(number);
    const fixedNumber = num.toFixed(decimals);
    const [integerPart, decimalPart] = fixedNumber.split('.');

    // Add thousand separators to integer part
    const formattedIntegerPart = integerPart.replace(
      /\B(?=(\d{3})+(?!\d))/g,
      thousandSeparator
    );

    // Return formatted number with decimal part if needed
    return decimals > 0
      ? `${formattedIntegerPart}${decimalSeparator}${decimalPart}`
      : formattedIntegerPart;
  } catch (error) {
    console.error('Error formatting number:', error);
    return String(number);
  }
};

/**
 * Format a number as currency
 * @param {number} amount - The amount to format
 * @param {string} currencyCode - Currency code (default: 'USD')
 * @param {string} locale - Locale for formatting (default: 'en-US')
 * @returns {string} Formatted currency
 */
export const formatCurrency = (
  amount,
  currencyCode = 'USD',
  locale = 'en-US'
) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '';
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `${amount} ${currencyCode}`;
  }
};

/**
 * Format a file size in bytes to a human-readable format
 * @param {number} bytes - The file size in bytes
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  if (bytes === null || bytes === undefined || isNaN(bytes)) return '';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
};

/**
 * Format a percentage value
 * @param {number} value - The value to format as percentage
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Formatted percentage
 */
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '';
  }

  try {
    return `${parseFloat(value).toFixed(decimals)}%`;
  } catch (error) {
    console.error('Error formatting percentage:', error);
    return `${value}%`;
  }
};

/**
 * Format a phone number
 * @param {string} phoneNumber - The phone number to format
 * @param {string} format - Format pattern (default: '+X (XXX) XXX-XX-XX')
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phoneNumber, format = '+X (XXX) XXX-XX-XX') => {
  if (!phoneNumber) return '';

  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, '');
  
  // Simple formatting for common patterns
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  } else if (digits.length === 11) {
    return `+${digits.slice(0, 1)} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
  }
  
  return phoneNumber;
};

/**
 * Format a date to a specified format
 * @param {string|Date} date - The date to format
 * @param {string} formatPattern - Format pattern (default: 'dd.MM.yyyy')
 * @returns {string} Formatted date
 */
export const formatDate = (date, formatPattern = 'dd.MM.yyyy') => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatPattern);
  } catch (error) {
    console.error('Error formatting date:', error);
    return String(date);
  }
};

/**
 * Format a date and time
 * @param {string|Date} date - The date to format
 * @param {string} formatPattern - Format pattern (default: 'dd.MM.yyyy HH:mm')
 * @returns {string} Formatted date and time
 */
export const formatDateTime = (date, formatPattern = 'dd.MM.yyyy HH:mm') => {
  return formatDate(date, formatPattern);
};

/**
 * Format a time duration in milliseconds to a human-readable format
 * @param {number} milliseconds - The duration in milliseconds
 * @param {boolean} includeSeconds - Whether to include seconds (default: true)
 * @returns {string} Formatted duration
 */
export const formatDuration = (milliseconds, includeSeconds = true) => {
  if (!milliseconds && milliseconds !== 0) return '';
  
  try {
    const seconds = Math.floor((milliseconds / 1000) % 60);
    const minutes = Math.floor((milliseconds / (1000 * 60)) % 60);
    const hours = Math.floor((milliseconds / (1000 * 60 * 60)) % 24);
    const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
    
    const parts = [];
    
    if (days > 0) {
      parts.push(`${days}d`);
    }
    
    if (hours > 0) {
      parts.push(`${hours}h`);
    }
    
    if (minutes > 0) {
      parts.push(`${minutes}m`);
    }
    
    if (includeSeconds && seconds > 0) {
      parts.push(`${seconds}s`);
    }
    
    return parts.length > 0 ? parts.join(' ') : '0s';
  } catch (error) {
    console.error('Error formatting duration:', error);
    return String(milliseconds);
  }
};

/**
 * Format an incident status to a human-readable string
 * @param {string} status - The incident status
 * @returns {string} Formatted status
 */
export const formatIncidentStatus = (status) => {
  if (!status) return '';
  
  const statusMap = {
    [INCIDENT_STATUS.NEW]: 'New',
    [INCIDENT_STATUS.ASSIGNED]: 'Assigned',
    [INCIDENT_STATUS.IN_PROGRESS]: 'In Progress',
    [INCIDENT_STATUS.ON_HOLD]: 'On Hold',
    [INCIDENT_STATUS.RESOLVED]: 'Resolved',
    [INCIDENT_STATUS.CLOSED]: 'Closed',
    [INCIDENT_STATUS.CANCELLED]: 'Cancelled'
  };
  
  return statusMap[status] || status;
};

/**
 * Format an incident priority to a human-readable string
 * @param {string} priority - The incident priority
 * @returns {string} Formatted priority
 */
export const formatIncidentPriority = (priority) => {
  if (!priority) return '';
  
  const priorityMap = {
    [INCIDENT_PRIORITY.LOW]: 'Low',
    [INCIDENT_PRIORITY.MEDIUM]: 'Medium',
    [INCIDENT_PRIORITY.HIGH]: 'High',
    [INCIDENT_PRIORITY.CRITICAL]: 'Critical'
  };
  
  return priorityMap[priority] || priority;
};

/**
 * Format equipment status to a human-readable string
 * @param {string} status - The equipment status
 * @returns {string} Formatted status
 */
export const formatEquipmentStatus = (status) => {
  if (!status) return '';
  
  const statusMap = {
    [EQUIPMENT_STATUS.AVAILABLE]: 'Available',
    [EQUIPMENT_STATUS.IN_USE]: 'In Use',
    [EQUIPMENT_STATUS.UNDER_MAINTENANCE]: 'Under Maintenance',
    [EQUIPMENT_STATUS.RESERVED]: 'Reserved',
    [EQUIPMENT_STATUS.DECOMMISSIONED]: 'Decommissioned',
    [EQUIPMENT_STATUS.BROKEN]: 'Broken'
  };
  
  return statusMap[status] || status;
};

/**
 * Format a name (first name and last name) to a full name
 * @param {string} firstName - First name
 * @param {string} lastName - Last name
 * @returns {string} Full name
 */
export const formatFullName = (firstName, lastName) => {
  if (!firstName && !lastName) return '';
  
  return [firstName, lastName].filter(Boolean).join(' ');
};

/**
 * Format an email address
 * @param {string} email - Email address
 * @param {boolean} mask - Whether to mask the email (default: false)
 * @returns {string} Formatted email
 */
export const formatEmail = (email, mask = false) => {
  if (!email) return '';
  
  if (mask) {
    const [username, domain] = email.split('@');
    if (!username || !domain) return email;
    
    const maskedUsername = username.length > 2
      ? `${username.substring(0, 2)}${'*'.repeat(username.length - 2)}`
      : username;
    
    return `${maskedUsername}@${domain}`;
  }
  
  return email;
};

/**
 * Format a boolean value to a human-readable string
 * @param {boolean} value - The boolean value
 * @param {string} trueText - Text for true value (default: 'Yes')
 * @param {string} falseText - Text for false value (default: 'No')
 * @returns {string} Formatted boolean
 */
export const formatBoolean = (value, trueText = 'Yes', falseText = 'No') => {
  if (value === null || value === undefined) return '';
  
  return value ? trueText : falseText;
};

/**
 * Format a list of items to a comma-separated string
 * @param {Array} items - The list of items
 * @param {string} separator - Separator (default: ', ')
 * @returns {string} Formatted list
 */
export const formatList = (items, separator = ', ') => {
  if (!items || !Array.isArray(items)) return '';
  
  return items.filter(Boolean).join(separator);
};

/**
 * Truncate a string to a specified length
 * @param {string} text - The text to truncate
 * @param {number} maxLength - Maximum length (default: 50)
 * @param {string} suffix - Suffix to add when truncated (default: '...')
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 50, suffix = '...') => {
  if (!text) return '';
  
  if (text.length <= maxLength) {
    return text;
  }
  
  return `${text.substring(0, maxLength)}${suffix}`;
};

/**
 * Format a time elapsed since a given date
 * @param {string|Date} date - The date
 * @returns {string} Formatted time elapsed
 */
export const formatTimeElapsed = (date) => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const now = new Date();
    const diffMs = now - dateObj;
    
    // Convert to seconds
    const diffSec = Math.floor(diffMs / 1000);
    
    if (diffSec < 60) {
      return `${diffSec} second${diffSec !== 1 ? 's' : ''} ago`;
    }
    
    // Convert to minutes
    const diffMin = Math.floor(diffSec / 60);
    
    if (diffMin < 60) {
      return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
    }
    
    // Convert to hours
    const diffHour = Math.floor(diffMin / 60);
    
    if (diffHour < 24) {
      return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`;
    }
    
    // Convert to days
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffDay < 30) {
      return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
    }
    
    // Convert to months
    const diffMonth = Math.floor(diffDay / 30);
    
    if (diffMonth < 12) {
      return `${diffMonth} month${diffMonth !== 1 ? 's' : ''} ago`;
    }
    
    // Convert to years
    const diffYear = Math.floor(diffMonth / 12);
    
    return `${diffYear} year${diffYear !== 1 ? 's' : ''} ago`;
  } catch (error) {
    console.error('Error formatting time elapsed:', error);
    return '';
  }
};

/**
 * Format a URL by removing protocol and trailing slashes
 * @param {string} url - The URL to format
 * @returns {string} Formatted URL
 */
export const formatUrl = (url) => {
  if (!url) return '';
  
  try {
    // Remove protocol
    let formattedUrl = url.replace(/^(https?:\/\/)/, '');
    
    // Remove trailing slash
    formattedUrl = formattedUrl.replace(/\/$/, '');
    
    return formattedUrl;
  } catch (error) {
    console.error('Error formatting URL:', error);
    return url;
  }
};

/**
 * Format a JSON object to a pretty-printed string
 * @param {Object} obj - The object to format
 * @param {number} indent - Indentation spaces (default: 2)
 * @returns {string} Formatted JSON string
 */
export const formatJson = (obj, indent = 2) => {
  if (!obj) return '';
  
  try {
    return JSON.stringify(obj, null, indent);
  } catch (error) {
    console.error('Error formatting JSON:', error);
    return String(obj);
  }
};

export default {
  formatNumber,
  formatCurrency,
  formatFileSize,
  formatPercentage,
  formatPhoneNumber,
  formatDate,
  formatDateTime,
  formatDuration,
  formatIncidentStatus,
  formatIncidentPriority,
  formatEquipmentStatus,
  formatFullName,
  formatEmail,
  formatBoolean,
  formatList,
  truncateText,
  formatTimeElapsed,
  formatUrl,
  formatJson
};