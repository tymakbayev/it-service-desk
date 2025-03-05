import { createAsyncThunk } from '@reduxjs/toolkit';
import { authStart, authSuccess, authFailure, logoutSuccess } from './authSlice';
import { LoginCredentials, RegisterData, AuthResponse } from './authTypes';
import apiClient from '../../services/apiClient';

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { dispatch }) => {
    try {
      dispatch(authStart());
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      localStorage.setItem('token', response.data.token);
      dispatch(authSuccess(response.data));
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Authentication failed';
      dispatch(authFailure(message));
      throw new Error(message);
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData: RegisterData, { dispatch }) => {
    try {
      dispatch(authStart());
      const response = await apiClient.post<AuthResponse>('/auth/register', userData);
      localStorage.setItem('token', response.data.token);
      dispatch(authSuccess(response.data));
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed';
      dispatch(authFailure(message));
      throw new Error(message);
    }
  }
);

export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { dispatch }) => {
    try {
      dispatch(authStart());
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No token found');
      }
      
      const response = await apiClient.get<AuthResponse>('/auth/me');
      dispatch(authSuccess({ user: response.data.user, token }));
      return response.data;
    } catch (error: any) {
      localStorage.removeItem('token');
      dispatch(authFailure('Session expired. Please login again.'));
      throw new Error('Authentication check failed');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    try {
      await apiClient.post('/auth/logout');
      localStorage.removeItem('token');
      dispatch(logoutSuccess());
    } catch (error) {
      // Even if the server-side logout fails, we still want to clear the local state
      localStorage.removeItem('token');
      dispatch(logoutSuccess());
    }
  }
);
