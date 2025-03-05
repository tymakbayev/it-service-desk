/**
 * dateUtils.js
 * Utility functions for date and time operations in the IT Service Desk application.
 * 
 * This module provides a comprehensive set of functions for date formatting,
 * parsing, comparison, and manipulation used throughout the application.
 */

import { format, parseISO, formatDistance, differenceInDays, differenceInHours, 
         differenceInMinutes, addDays, addHours, isAfter, isBefore, isEqual, 
         isValid, startOfDay, endOfDay, startOfWeek, endOfWeek, 
         startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { ru, enUS } from 'date-fns/locale';
import { constants } from './constants';

// Default locale for date formatting
const DEFAULT_LOCALE = enUS;

/**
 * Format a date string or Date object to a human-readable format
 * @param {string|Date} date - The date to format
 * @param {string} formatStr - The format string (date-fns format)
 * @param {Object} options - Additional options
 * @returns {string} Formatted date string
 */
export const formatDate = (date, formatStr = 'dd.MM.yyyy', options = {}) => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    
    if (!isValid(dateObj)) {
      console.warn('Invalid date provided to formatDate:', date);
      return '';
    }
    
    const { locale = DEFAULT_LOCALE, ...restOptions } = options;
    return format(dateObj, formatStr, { locale, ...restOptions });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Format a date with time
 * @param {string|Date} date - The date to format
 * @param {Object} options - Additional options
 * @returns {string} Formatted date and time
 */
export const formatDateTime = (date, options = {}) => {
  return formatDate(date, 'dd.MM.yyyy HH:mm', options);
};

/**
 * Format a date for API requests (ISO format)
 * @param {Date} date - The date to format
 * @returns {string} ISO formatted date
 */
export const formatForAPI = (date) => {
  if (!date) return null;
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return dateObj.toISOString();
  } catch (error) {
    console.error('Error formatting date for API:', error);
    return null;
  }
};

/**
 * Get relative time (e.g., "2 hours ago", "in 3 days")
 * @param {string|Date} date - The date to compare with current time
 * @param {Object} options - Additional options
 * @returns {string} Relative time string
 */
export const getRelativeTime = (date, options = {}) => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const { locale = DEFAULT_LOCALE, addSuffix = true, ...restOptions } = options;
    
    return formatDistance(dateObj, new Date(), {
      addSuffix,
      locale,
      ...restOptions
    });
  } catch (error) {
    console.error('Error getting relative time:', error);
    return '';
  }
};

/**
 * Calculate time elapsed since a given date in a human-readable format
 * @param {string|Date} startDate - The start date
 * @param {string|Date} endDate - The end date (defaults to now)
 * @returns {string} Elapsed time in a readable format
 */
export const getElapsedTime = (startDate, endDate = new Date()) => {
  if (!startDate) return '';
  
  try {
    const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
    const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
    
    const days = differenceInDays(end, start);
    const hours = differenceInHours(end, start) % 24;
    const minutes = differenceInMinutes(end, start) % 60;
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  } catch (error) {
    console.error('Error calculating elapsed time:', error);
    return '';
  }
};

/**
 * Check if a date is in the past
 * @param {string|Date} date - The date to check
 * @returns {boolean} True if the date is in the past
 */
export const isPast = (date) => {
  if (!date) return false;
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return isBefore(dateObj, new Date());
  } catch (error) {
    console.error('Error checking if date is in past:', error);
    return false;
  }
};

/**
 * Check if a date is in the future
 * @param {string|Date} date - The date to check
 * @returns {boolean} True if the date is in the future
 */
export const isFuture = (date) => {
  if (!date) return false;
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return isAfter(dateObj, new Date());
  } catch (error) {
    console.error('Error checking if date is in future:', error);
    return false;
  }
};

/**
 * Check if a date is today
 * @param {string|Date} date - The date to check
 * @returns {boolean} True if the date is today
 */
export const isToday = (date) => {
  if (!date) return false;
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const today = new Date();
    
    return (
      dateObj.getDate() === today.getDate() &&
      dateObj.getMonth() === today.getMonth() &&
      dateObj.getFullYear() === today.getFullYear()
    );
  } catch (error) {
    console.error('Error checking if date is today:', error);
    return false;
  }
};

/**
 * Add days to a date
 * @param {string|Date} date - The date to add days to
 * @param {number} days - Number of days to add
 * @returns {Date} New date with added days
 */
export const addDaysToDate = (date, days) => {
  if (!date) return null;
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return addDays(dateObj, days);
  } catch (error) {
    console.error('Error adding days to date:', error);
    return null;
  }
};

/**
 * Add hours to a date
 * @param {string|Date} date - The date to add hours to
 * @param {number} hours - Number of hours to add
 * @returns {Date} New date with added hours
 */
export const addHoursToDate = (date, hours) => {
  if (!date) return null;
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return addHours(dateObj, hours);
  } catch (error) {
    console.error('Error adding hours to date:', error);
    return null;
  }
};

/**
 * Get the start of day for a given date
 * @param {string|Date} date - The date
 * @returns {Date} Date representing the start of the day
 */
export const getStartOfDay = (date = new Date()) => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return startOfDay(dateObj);
  } catch (error) {
    console.error('Error getting start of day:', error);
    return null;
  }
};

/**
 * Get the end of day for a given date
 * @param {string|Date} date - The date
 * @returns {Date} Date representing the end of the day
 */
export const getEndOfDay = (date = new Date()) => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return endOfDay(dateObj);
  } catch (error) {
    console.error('Error getting end of day:', error);
    return null;
  }
};

/**
 * Get the start of week for a given date
 * @param {string|Date} date - The date
 * @param {Object} options - Additional options
 * @returns {Date} Date representing the start of the week
 */
export const getStartOfWeek = (date = new Date(), options = {}) => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const { locale = DEFAULT_LOCALE, weekStartsOn = 1 } = options;
    
    return startOfWeek(dateObj, { locale, weekStartsOn });
  } catch (error) {
    console.error('Error getting start of week:', error);
    return null;
  }
};

/**
 * Get the end of week for a given date
 * @param {string|Date} date - The date
 * @param {Object} options - Additional options
 * @returns {Date} Date representing the end of the week
 */
export const getEndOfWeek = (date = new Date(), options = {}) => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const { locale = DEFAULT_LOCALE, weekStartsOn = 1 } = options;
    
    return endOfWeek(dateObj, { locale, weekStartsOn });
  } catch (error) {
    console.error('Error getting end of week:', error);
    return null;
  }
};

/**
 * Get the start of month for a given date
 * @param {string|Date} date - The date
 * @returns {Date} Date representing the start of the month
 */
export const getStartOfMonth = (date = new Date()) => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return startOfMonth(dateObj);
  } catch (error) {
    console.error('Error getting start of month:', error);
    return null;
  }
};

/**
 * Get the end of month for a given date
 * @param {string|Date} date - The date
 * @returns {Date} Date representing the end of the month
 */
export const getEndOfMonth = (date = new Date()) => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return endOfMonth(dateObj);
  } catch (error) {
    console.error('Error getting end of month:', error);
    return null;
  }
};

/**
 * Check if a date is within a date range
 * @param {string|Date} date - The date to check
 * @param {string|Date} startDate - The start date of the range
 * @param {string|Date} endDate - The end date of the range
 * @returns {boolean} True if the date is within the range
 */
export const isDateInRange = (date, startDate, endDate) => {
  if (!date || !startDate || !endDate) return false;
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
    const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
    
    return isWithinInterval(dateObj, { start, end });
  } catch (error) {
    console.error('Error checking if date is in range:', error);
    return false;
  }
};

/**
 * Get date ranges for common time periods
 * @param {string} period - The time period ('today', 'week', 'month', 'year')
 * @returns {Object} Object with start and end dates
 */
export const getDateRangeForPeriod = (period) => {
  const now = new Date();
  
  switch (period) {
    case 'today':
      return {
        start: getStartOfDay(now),
        end: getEndOfDay(now)
      };
    case 'week':
      return {
        start: getStartOfWeek(now),
        end: getEndOfWeek(now)
      };
    case 'month':
      return {
        start: getStartOfMonth(now),
        end: getEndOfMonth(now)
      };
    case 'year':
      return {
        start: new Date(now.getFullYear(), 0, 1),
        end: new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)
      };
    default:
      return {
        start: null,
        end: null
      };
  }
};

/**
 * Calculate SLA (Service Level Agreement) status based on creation date and priority
 * @param {string|Date} createdAt - When the incident was created
 * @param {string} priority - Priority level of the incident
 * @returns {Object} SLA status information
 */
export const calculateSLAStatus = (createdAt, priority) => {
  if (!createdAt || !priority) {
    return { status: 'unknown', hoursLeft: null, isBreached: false };
  }
  
  try {
    const created = typeof createdAt === 'string' ? parseISO(createdAt) : createdAt;
    const now = new Date();
    
    // Get SLA hours based on priority
    let slaHours;
    switch (priority.toLowerCase()) {
      case 'critical':
        slaHours = 4;
        break;
      case 'high':
        slaHours = 8;
        break;
      case 'medium':
        slaHours = 24;
        break;
      case 'low':
        slaHours = 48;
        break;
      default:
        slaHours = 24;
    }
    
    // Calculate SLA deadline
    const slaDeadline = addHours(created, slaHours);
    
    // Calculate hours left
    const hoursLeft = differenceInHours(slaDeadline, now);
    
    // Determine status
    let status;
    if (hoursLeft <= 0) {
      status = 'breached';
    } else if (hoursLeft <= slaHours * 0.25) {
      status = 'critical';
    } else if (hoursLeft <= slaHours * 0.5) {
      status = 'warning';
    } else {
      status = 'normal';
    }
    
    return {
      status,
      hoursLeft: hoursLeft > 0 ? hoursLeft : 0,
      isBreached: hoursLeft <= 0,
      deadline: slaDeadline
    };
  } catch (error) {
    console.error('Error calculating SLA status:', error);
    return { status: 'error', hoursLeft: null, isBreached: false };
  }
};

/**
 * Format a date range for display
 * @param {string|Date} startDate - The start date
 * @param {string|Date} endDate - The end date
 * @param {Object} options - Additional options
 * @returns {string} Formatted date range
 */
export const formatDateRange = (startDate, endDate, options = {}) => {
  if (!startDate || !endDate) return '';
  
  try {
    const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
    const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
    const { format: formatStr = 'dd.MM.yyyy', separator = ' - ', locale = DEFAULT_LOCALE } = options;
    
    return `${formatDate(start, formatStr, { locale })}${separator}${formatDate(end, formatStr, { locale })}`;
  } catch (error) {
    console.error('Error formatting date range:', error);
    return '';
  }
};

/**
 * Parse a date string into a Date object
 * @param {string} dateString - The date string to parse
 * @returns {Date|null} Parsed Date object or null if invalid
 */
export const parseDate = (dateString) => {
  if (!dateString) return null;
  
  try {
    const parsedDate = parseISO(dateString);
    return isValid(parsedDate) ? parsedDate : null;
  } catch (error) {
    console.error('Error parsing date:', error);
    return null;
  }
};

/**
 * Get the current date and time in ISO format
 * @returns {string} Current date and time in ISO format
 */
export const getCurrentISODate = () => {
  return new Date().toISOString();
};

/**
 * Get the current date in YYYY-MM-DD format
 * @returns {string} Current date in YYYY-MM-DD format
 */
export const getCurrentDateFormatted = () => {
  const now = new Date();
  return format(now, 'yyyy-MM-dd');
};

/**
 * Get the current time in HH:MM format
 * @returns {string} Current time in HH:MM format
 */
export const getCurrentTimeFormatted = () => {
  const now = new Date();
  return format(now, 'HH:mm');
};

/**
 * Get the month name from a date
 * @param {string|Date} date - The date
 * @param {Object} options - Additional options
 * @returns {string} Month name
 */
export const getMonthName = (date = new Date(), options = {}) => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const { locale = DEFAULT_LOCALE, format: formatStr = 'MMMM' } = options;
    
    return formatDate(dateObj, formatStr, { locale });
  } catch (error) {
    console.error('Error getting month name:', error);
    return '';
  }
};

/**
 * Get the day of week from a date
 * @param {string|Date} date - The date
 * @param {Object} options - Additional options
 * @returns {string} Day of week
 */
export const getDayOfWeek = (date = new Date(), options = {}) => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const { locale = DEFAULT_LOCALE, format: formatStr = 'EEEE' } = options;
    
    return formatDate(dateObj, formatStr, { locale });
  } catch (error) {
    console.error('Error getting day of week:', error);
    return '';
  }
};

export default {
  formatDate,
  formatDateTime,
  formatForAPI,
  getRelativeTime,
  getElapsedTime,
  isPast,
  isFuture,
  isToday,
  addDaysToDate,
  addHoursToDate,
  getStartOfDay,
  getEndOfDay,
  getStartOfWeek,
  getEndOfWeek,
  getStartOfMonth,
  getEndOfMonth,
  isDateInRange,
  getDateRangeForPeriod,
  calculateSLAStatus,
  formatDateRange,
  parseDate,
  getCurrentISODate,
  getCurrentDateFormatted,
  getCurrentTimeFormatted,
  getMonthName,
  getDayOfWeek
};