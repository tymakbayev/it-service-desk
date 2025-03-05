/**
 * Authentication API Service
 * Handles all authentication-related API requests
 */
import apiClient from './apiClient';
import { toast } from 'react-toastify';

/**
 * Authentication API endpoints
 */
const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh-token',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  VERIFY_EMAIL: '/auth/verify-email',
  CHANGE_PASSWORD: '/auth/change-password',
  GET_PROFILE: '/auth/profile',
  UPDATE_PROFILE: '/auth/profile',
};

/**
 * Response type for authentication requests
 * @typedef {Object} AuthResponse
 * @property {string} token - JWT token
 * @property {Object} user - User information
 * @property {string} refreshToken - Refresh token (optional)
 * @property {string} message - Success message
 */

/**
 * User login credentials
 * @typedef {Object} LoginCredentials
 * @property {string} email - User email
 * @property {string} password - User password
 */

/**
 * User registration data
 * @typedef {Object} RegistrationData
 * @property {string} email - User email
 * @property {string} password - User password
 * @property {string} firstName - User first name
 * @property {string} lastName - User last name
 * @property {string} [department] - User department
 * @property {string} [phone] - User phone number
 */

/**
 * Authentication API service
 */
const authApi = {
  /**
   * Login user with email and password
   * @param {LoginCredentials} credentials - User login credentials
   * @returns {Promise<AuthResponse>} Authentication response with token and user data
   */
  login: async (credentials) => {
    try {
      const { data } = await apiClient.post(AUTH_ENDPOINTS.LOGIN, credentials);
      
      // Store token in localStorage and set in API client
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        apiClient.setAuthToken(data.token);
      }
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  /**
   * Register a new user
   * @param {RegistrationData} userData - User registration data
   * @returns {Promise<AuthResponse>} Authentication response with token and user data
   */
  register: async (userData) => {
    try {
      const { data } = await apiClient.post(AUTH_ENDPOINTS.REGISTER, userData);
      
      // Store token in localStorage and set in API client if auto-login is enabled
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        apiClient.setAuthToken(data.token);
      }
      
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  /**
   * Logout current user
   * @returns {Promise<{message: string}>} Success message
   */
  logout: async () => {
    try {
      // Call logout endpoint to invalidate token on server
      const { data } = await apiClient.post(AUTH_ENDPOINTS.LOGOUT);
      
      // Clear local storage and auth headers
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      apiClient.setAuthToken(null);
      
      return data;
    } catch (error) {
      // Even if server request fails, clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      apiClient.setAuthToken(null);
      console.error('Logout error:', error);
      throw error;
    }
  },

  /**
   * Refresh authentication token
   * @param {string} refreshToken - Current refresh token
   * @returns {Promise<AuthResponse>} New authentication token and refresh token
   */
  refreshToken: async (refreshToken) => {
    try {
      const { data } = await apiClient.post(AUTH_ENDPOINTS.REFRESH_TOKEN, { refreshToken });
      
      if (data.token) {
        localStorage.setItem('token', data.token);
        apiClient.setAuthToken(data.token);
      }
      
      return data;
    } catch (error) {
      // If refresh token is invalid, logout user
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        apiClient.setAuthToken(null);
        
        // Redirect to login page if not already there
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
      console.error('Token refresh error:', error);
      throw error;
    }
  },

  /**
   * Request password reset email
   * @param {string} email - User email
   * @returns {Promise<{message: string}>} Success message
   */
  forgotPassword: async (email) => {
    try {
      const { data } = await apiClient.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, { email });
      toast.success('Password reset instructions sent to your email');
      return data;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  },

  /**
   * Reset password with token
   * @param {Object} resetData - Password reset data
   * @param {string} resetData.token - Reset token from email
   * @param {string} resetData.password - New password
   * @param {string} resetData.confirmPassword - Confirm new password
   * @returns {Promise<{message: string}>} Success message
   */
  resetPassword: async (resetData) => {
    try {
      const { data } = await apiClient.post(AUTH_ENDPOINTS.RESET_PASSWORD, resetData);
      toast.success('Password has been reset successfully');
      return data;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  },

  /**
   * Verify user email with token
   * @param {string} token - Email verification token
   * @returns {Promise<{message: string}>} Success message
   */
  verifyEmail: async (token) => {
    try {
      const { data } = await apiClient.post(AUTH_ENDPOINTS.VERIFY_EMAIL, { token });
      toast.success('Email verified successfully');
      return data;
    } catch (error) {
      console.error('Email verification error:', error);
      throw error;
    }
  },

  /**
   * Change user password
   * @param {Object} passwordData - Password change data
   * @param {string} passwordData.currentPassword - Current password
   * @param {string} passwordData.newPassword - New password
   * @param {string} passwordData.confirmPassword - Confirm new password
   * @returns {Promise<{message: string}>} Success message
   */
  changePassword: async (passwordData) => {
    try {
      const { data } = await apiClient.post(AUTH_ENDPOINTS.CHANGE_PASSWORD, passwordData);
      toast.success('Password changed successfully');
      return data;
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  },

  /**
   * Get current user profile
   * @returns {Promise<Object>} User profile data
   */
  getProfile: async () => {
    try {
      const { data } = await apiClient.get(AUTH_ENDPOINTS.GET_PROFILE);
      return data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  /**
   * Update user profile
   * @param {Object} profileData - Updated profile data
   * @returns {Promise<Object>} Updated user profile
   */
  updateProfile: async (profileData) => {
    try {
      const { data } = await apiClient.put(AUTH_ENDPOINTS.UPDATE_PROFILE, profileData);
      
      // Update stored user data
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...currentUser, ...data.user };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      toast.success('Profile updated successfully');
      return data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!token;
  },

  /**
   * Get current user data from localStorage
   * @returns {Object|null} User data or null if not authenticated
   */
  getCurrentUser: () => {
    try {
      const userString = localStorage.getItem('user');
      return userString ? JSON.parse(userString) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  },

  /**
   * Get user role
   * @returns {string|null} User role or null if not authenticated
   */
  getUserRole: () => {
    const user = authApi.getCurrentUser();
    return user ? user.role : null;
  },

  /**
   * Check if user has specific role
   * @param {string|string[]} roles - Role or array of roles to check
   * @returns {boolean} Whether user has the specified role
   */
  hasRole: (roles) => {
    const userRole = authApi.getUserRole();
    if (!userRole) return false;
    
    if (Array.isArray(roles)) {
      return roles.includes(userRole);
    }
    
    return roles === userRole;
  }
};

export default authApi;