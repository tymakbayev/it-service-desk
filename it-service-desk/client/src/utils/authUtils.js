/**
 * Authentication Utilities
 * 
 * This file contains utility functions for handling authentication-related tasks
 * such as token management, user session handling, and role-based access control.
 */

import jwtDecode from 'jwt-decode';
import { UserRole } from '../modules/auth/authTypes';
import apiClient from '../services/api/apiClient';

/**
 * Sets the authentication token in localStorage and in axios headers
 * @param {string} token - JWT token
 */
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    removeAuthToken();
  }
};

/**
 * Removes the authentication token from localStorage and axios headers
 */
export const removeAuthToken = () => {
  localStorage.removeItem('token');
  delete apiClient.defaults.headers.common['Authorization'];
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
 * Gets the user ID from the JWT token
 * @returns {string|null} The user ID or null if not authenticated
 */
export const getUserId = () => {
  const user = getCurrentUser();
  return user ? user.id : null;
};

/**
 * Gets the username from the JWT token
 * @returns {string|null} The username or null if not authenticated
 */
export const getUsername = () => {
  const user = getCurrentUser();
  return user ? user.username : null;
};

/**
 * Gets the user's role from the JWT token
 * @returns {UserRole|null} The user role or null if not authenticated
 */
export const getUserRole = () => {
  const user = getCurrentUser();
  return user ? user.role : null;
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
 * Checks if the current user is a regular user
 * @returns {boolean} True if the user is a regular user, false otherwise
 */
export const isUser = () => {
  return hasRole(UserRole.USER);
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
 * Calculates the time remaining until token expiration
 * @returns {number|null} The time remaining in milliseconds or null if not authenticated
 */
export const getTokenTimeRemaining = () => {
  const expirationTime = getTokenExpirationTime();
  if (!expirationTime) return null;
  
  return expirationTime - Date.now();
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
    console.error('Error parsing token:', error);
    return null;
  }
};

/**
 * Initializes the authentication state from localStorage
 * This should be called when the application starts
 */
export const initializeAuth = () => {
  const token = getAuthToken();
  if (token && isAuthenticated()) {
    setAuthToken(token);
  } else {
    removeAuthToken();
  }
};

/**
 * Checks if the user has permission to access a specific resource
 * @param {string} resourceId - The ID of the resource
 * @param {string} resourceType - The type of resource (e.g., 'incident', 'equipment')
 * @returns {boolean} True if the user has permission, false otherwise
 */
export const hasPermission = (resourceId, resourceType) => {
  const user = getCurrentUser();
  if (!user) return false;
  
  // Admins have access to everything
  if (user.role === UserRole.ADMIN) return true;
  
  // For other roles, we would need to check specific permissions
  // This would typically involve checking if the user owns the resource
  // or if they have been assigned to it
  
  // This is a simplified implementation
  // In a real application, you would likely need to make an API call
  // to check permissions or have a more sophisticated permission system
  
  return false;
};

/**
 * Stores additional user data in localStorage
 * @param {Object} userData - User data to store
 */
export const storeUserData = (userData) => {
  if (userData) {
    localStorage.setItem('userData', JSON.stringify(userData));
  }
};

/**
 * Retrieves stored user data from localStorage
 * @returns {Object|null} The user data or null if not found
 */
export const getUserData = () => {
  const userData = localStorage.getItem('userData');
  if (!userData) return null;
  
  try {
    return JSON.parse(userData);
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

/**
 * Clears all authentication-related data from localStorage
 */
export const clearAuthData = () => {
  removeAuthToken();
  localStorage.removeItem('userData');
  // Clear any other auth-related items here
};

/**
 * Refreshes the authentication token
 * @returns {Promise<string|null>} A promise that resolves to the new token or null if refresh failed
 */
export const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return null;
    
    const response = await apiClient.post('/api/auth/refresh-token', { refreshToken });
    const { token, refreshToken: newRefreshToken } = response.data;
    
    setAuthToken(token);
    localStorage.setItem('refreshToken', newRefreshToken);
    
    return token;
  } catch (error) {
    console.error('Error refreshing token:', error);
    clearAuthData();
    return null;
  }
};

export default {
  setAuthToken,
  removeAuthToken,
  getAuthToken,
  isAuthenticated,
  getCurrentUser,
  getUserId,
  getUsername,
  getUserRole,
  hasRole,
  isAdmin,
  isTechnician,
  isUser,
  isTokenExpiringSoon,
  getTokenExpirationTime,
  getTokenTimeRemaining,
  parseToken,
  initializeAuth,
  hasPermission,
  storeUserData,
  getUserData,
  clearAuthData,
  refreshToken
};