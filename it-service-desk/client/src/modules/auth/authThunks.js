import { createAsyncThunk } from '@reduxjs/toolkit';
import authApi from '../../services/api/authApi';
import { setAuthToken, removeAuthToken } from '../../utils/constants';
import { toast } from 'react-toastify';

/**
 * Login user
 * @param {Object} credentials - User credentials (email/username and password)
 * @returns {Object} User data and token
 */
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials);
      // Store token in localStorage
      localStorage.setItem('token', response.token);
      // Set token in axios headers
      setAuthToken(response.token);
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to login. Please try again.';
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Register new user
 * @param {Object} userData - User registration data
 * @returns {Object} User data and token
 */
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authApi.register(userData);
      // If auto-login after registration
      if (response.token) {
        localStorage.setItem('token', response.token);
        setAuthToken(response.token);
      }
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Load authenticated user data
 * @returns {Object} User data
 */
export const loadUser = createAsyncThunk(
  'auth/loadUser',
  async (_, { rejectWithValue, getState }) => {
    try {
      // Get token from state
      const token = getState().auth.token;
      
      // If no token, reject
      if (!token) {
        return rejectWithValue('No token, authorization denied');
      }
      
      // Set token in axios headers
      setAuthToken(token);
      
      // Get user data
      const response = await authApi.getCurrentUser();
      return response;
    } catch (error) {
      // Remove invalid token
      localStorage.removeItem('token');
      removeAuthToken();
      const errorMessage = error.response?.data?.message || 'Failed to load user data.';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Logout user
 * @returns {null} No return value
 */
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      // Call logout API to invalidate token on server
      await authApi.logout();
      
      // Remove token from localStorage
      localStorage.removeItem('token');
      
      // Remove token from axios headers
      removeAuthToken();
      
      return null;
    } catch (error) {
      // Even if server logout fails, we still want to remove local tokens
      localStorage.removeItem('token');
      removeAuthToken();
      
      const errorMessage = 'Logout failed on server, but you have been logged out locally';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Update user profile
 * @param {Object} profileData - Updated profile data
 * @returns {Object} Updated user data
 */
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await authApi.updateProfile(profileData);
      toast.success('Profile updated successfully');
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update profile. Please try again.';
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Change user password
 * @param {Object} passwordData - Old and new password data
 * @returns {Object} Success message
 */
export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (passwordData, { rejectWithValue }) => {
    try {
      const response = await authApi.changePassword(passwordData);
      toast.success('Password changed successfully');
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to change password. Please try again.';
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Request password reset
 * @param {Object} email - User email
 * @returns {Object} Success message and email
 */
export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await authApi.forgotPassword(email);
      toast.success('Password reset instructions sent to your email');
      return { ...response, email };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to process forgot password request.';
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Reset password with token
 * @param {Object} data - Reset token and new password
 * @returns {Object} Success message
 */
export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const response = await authApi.resetPassword(token, password);
      toast.success('Password has been reset successfully. You can now login with your new password.');
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to reset password. Please try again.';
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Verify email address
 * @param {string} token - Email verification token
 * @returns {Object} Success message
 */
export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async (token, { rejectWithValue }) => {
    try {
      const response = await authApi.verifyEmail(token);
      toast.success('Email verified successfully');
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to verify email. Please try again.';
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Refresh authentication token
 * @param {string} refreshToken - Refresh token
 * @returns {Object} New access token
 */
export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (refreshToken, { rejectWithValue }) => {
    try {
      const response = await authApi.refreshToken(refreshToken);
      localStorage.setItem('token', response.token);
      setAuthToken(response.token);
      return response;
    } catch (error) {
      // If refresh token is invalid, logout user
      localStorage.removeItem('token');
      removeAuthToken();
      const errorMessage = error.response?.data?.message || 'Session expired. Please login again.';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Get user permissions
 * @returns {Array} User permissions
 */
export const getUserPermissions = createAsyncThunk(
  'auth/getUserPermissions',
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      
      if (!token) {
        return rejectWithValue('No token, authorization denied');
      }
      
      setAuthToken(token);
      const response = await authApi.getUserPermissions();
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch user permissions.';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Check if username or email is available
 * @param {Object} data - Username or email to check
 * @returns {Object} Availability status
 */
export const checkAvailability = createAsyncThunk(
  'auth/checkAvailability',
  async (data, { rejectWithValue }) => {
    try {
      const response = await authApi.checkAvailability(data);
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to check availability.';
      return rejectWithValue(errorMessage);
    }
  }
);