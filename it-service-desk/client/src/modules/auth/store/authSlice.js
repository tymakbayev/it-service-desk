import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authApi from '../../../services/api/authApi';
import { setAuthToken, removeAuthToken } from '../../../utils/authUtils';

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
  successMessage: null,
  passwordResetToken: null,
  passwordResetEmail: null,
  roles: [],
  permissions: []
};

// Async thunks
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
      return rejectWithValue(
        error.response?.data?.message || 'Failed to login. Please try again.'
      );
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authApi.register(userData);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Registration failed. Please try again.'
      );
    }
  }
);

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
      return rejectWithValue(
        error.response?.data?.message || 'Failed to load user data.'
      );
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      // Remove token from localStorage
      localStorage.removeItem('token');
      // Remove token from axios headers
      removeAuthToken();
      return null;
    } catch (error) {
      return rejectWithValue('Logout failed');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await authApi.updateProfile(profileData);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update profile. Please try again.'
      );
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (passwordData, { rejectWithValue }) => {
    try {
      const response = await authApi.changePassword(passwordData);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to change password. Please try again.'
      );
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await authApi.forgotPassword(email);
      return { ...response, email };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to process forgot password request.'
      );
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const response = await authApi.resetPassword(token, password);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to reset password. Please try again.'
      );
    }
  }
);

export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async (token, { rejectWithValue }) => {
    try {
      const response = await authApi.verifyEmail(token);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Email verification failed. Please try again.'
      );
    }
  }
);

export const getUserRoles = createAsyncThunk(
  'auth/getUserRoles',
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      if (!token) {
        return rejectWithValue('No token, authorization denied');
      }
      
      setAuthToken(token);
      const response = await authApi.getUserRoles();
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch user roles.'
      );
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
    clearAuthSuccess: (state) => {
      state.successMessage = null;
    },
    setPasswordResetToken: (state, action) => {
      state.passwordResetToken = action.payload;
    },
    clearPasswordResetData: (state) => {
      state.passwordResetToken = null;
      state.passwordResetEmail = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.roles = action.payload.user.roles || [];
        state.permissions = action.payload.user.permissions || [];
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload;
      })
      
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message || 'Registration successful. Please check your email to verify your account.';
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Load User
      .addCase(loadUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.roles = action.payload.user.roles || [];
        state.permissions = action.payload.user.permissions || [];
      })
      .addCase(loadUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.roles = [];
        state.permissions = [];
        state.error = action.payload;
      })
      
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.roles = [];
        state.permissions = [];
        state.error = null;
      })
      
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.successMessage = 'Profile updated successfully';
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Change Password
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
        state.successMessage = 'Password changed successfully';
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.passwordResetEmail = action.payload.email;
        state.successMessage = action.payload.message || 'Password reset instructions sent to your email';
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
        state.passwordResetToken = null;
        state.passwordResetEmail = null;
        state.successMessage = 'Password has been reset successfully. You can now login with your new password.';
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Verify Email
      .addCase(verifyEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state) => {
        state.loading = false;
        state.successMessage = 'Email verified successfully. You can now login.';
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get User Roles
      .addCase(getUserRoles.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = action.payload.roles || [];
        state.permissions = action.payload.permissions || [];
      })
      .addCase(getUserRoles.rejected, (state) => {
        state.loading = false;
        state.roles = [];
        state.permissions = [];
      });
  }
});

export const { 
  clearAuthError, 
  clearAuthSuccess, 
  setPasswordResetToken, 
  clearPasswordResetData 
} = authSlice.actions;

// Selectors
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectAuthSuccess = (state) => state.auth.successMessage;
export const selectUserRoles = (state) => state.auth.roles;
export const selectUserPermissions = (state) => state.auth.permissions;

// Helper function to check if user has a specific role
export const hasRole = (state, role) => {
  const roles = selectUserRoles(state);
  return roles.includes(role);
};

// Helper function to check if user has a specific permission
export const hasPermission = (state, permission) => {
  const permissions = selectUserPermissions(state);
  return permissions.includes(permission);
};

export default authSlice.reducer;