/**
 * Authentication Utilities
 * 
 * This file contains utility functions for handling authentication-related tasks
 * such as token management, user session handling, and role-based access control.
 */

import jwtDecode from 'jwt-decode';
import { UserRole } from '../modules/auth/authTypes';

/**
 * Sets the authentication token in localStorage and in axios headers
 * @param {string} token - JWT token
 */
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
    // Note: Axios headers are set in apiClient interceptors
  } else {
    removeAuthToken();
  }
};

/**
 * Removes the authentication token from localStorage and axios headers
 */
export const removeAuthToken = () => {
  localStorage.removeItem('token');
  // Note: Axios headers are cleared in apiClient interceptors
};

/**
 * Gets the current authentication token from localStorage
 * @returns {string|null} The JWT token or null if not found
 */
export const getAuthToken = () => {
  return localStorage.getItem('token');
};

/**
 * Checks if the user is authenticated
 * @returns {boolean} True if the user is authenticated, false otherwise
 */
export const isAuthenticated = () => {
  const token = getAuthToken();
  if (!token) return false;
  
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    
    // Check if token is expired
    if (decoded.exp < currentTime) {
      removeAuthToken();
      return false;
    }
    
    return true;
  } catch (error) {
    removeAuthToken();
    return false;
  }
};

/**
 * Gets the current user from the JWT token
 * @returns {Object|null} The user object or null if not authenticated
 */
export const getCurrentUser = () => {
  const token = getAuthToken();
  if (!token) return null;
  
  try {
    const decoded = jwtDecode(token);
    return decoded.user;
  } catch (error) {
    return null;
  }
};

/**
 * Checks if the current user has the specified role
 * @param {UserRole|UserRole[]} roles - The role(s) to check
 * @returns {boolean} True if the user has the specified role, false otherwise
 */
export const hasRole = (roles) => {
  const user = getCurrentUser();
  if (!user) return false;
  
  if (Array.isArray(roles)) {
    return roles.includes(user.role);
  }
  
  return user.role === roles;
};

/**
 * Checks if the current user is an admin
 * @returns {boolean} True if the user is an admin, false otherwise
 */
export const isAdmin = () => {
  return hasRole(UserRole.ADMIN);
};

/**
 * Checks if the current user is a technician
 * @returns {boolean} True if the user is a technician, false otherwise
 */
export const isTechnician = () => {
  return hasRole([UserRole.TECHNICIAN, UserRole.ADMIN]);
};

/**
 * Checks if the token is about to expire
 * @param {number} thresholdMinutes - Minutes threshold before expiration to consider token as expiring soon
 * @returns {boolean} True if the token is about to expire, false otherwise
 */
export const isTokenExpiringSoon = (thresholdMinutes = 5) => {
  const token = getAuthToken();
  if (!token) return false;
  
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    const thresholdSeconds = thresholdMinutes * 60;
    
    return decoded.exp - currentTime < thresholdSeconds;
  } catch (error) {
    return false;
  }
};

/**
 * Gets the token expiration time in milliseconds
 * @returns {number|null} The token expiration time in milliseconds or null if not authenticated
 */
export const getTokenExpirationTime = () => {
  const token = getAuthToken();
  if (!token) return null;
  
  try {
    const decoded = jwtDecode(token);
    return decoded.exp * 1000; // Convert to milliseconds
  } catch (error) {
    return null;
  }
};

/**
 * Parses the JWT token without validation
 * @param {string} token - JWT token
 * @returns {Object|null} The decoded token or null if invalid
 */
export const parseToken = (token) => {
  try {
    return jwtDecode(token);
  } catch (error) {
    return null;
  }
};

/**
 * Redirects to login page with return URL
 * @param {Object} history - React Router history object
 * @param {string} currentPath - Current path to redirect back to after login
 */
export const redirectToLogin = (history, currentPath = window.location.pathname) => {
  history.push(`/login?returnUrl=${encodeURIComponent(currentPath)}`);
};

/**
 * Gets the return URL from query parameters
 * @param {Object} location - React Router location object
 * @returns {string} The return URL or default path
 */
export const getReturnUrl = (location) => {
  const searchParams = new URLSearchParams(location.search);
  return searchParams.get('returnUrl') || '/dashboard';
};

export default {
  setAuthToken,
  removeAuthToken,
  getAuthToken,
  isAuthenticated,
  getCurrentUser,
  hasRole,
  isAdmin,
  isTechnician,
  isTokenExpiringSoon,
  getTokenExpirationTime,
  parseToken,
  redirectToLogin,
  getReturnUrl
};