import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import jwt_decode from 'jwt-decode';

// Import auth actions
import { 
  login as loginAction,
  logout as logoutAction,
  register as registerAction,
  forgotPassword as forgotPasswordAction,
  resetPassword as resetPasswordAction,
  updateProfile as updateProfileAction,
  checkAuth as checkAuthAction
} from '../modules/auth/store/authSlice';

/**
 * Custom hook for authentication functionality
 * Provides methods for login, logout, registration, and other auth-related operations
 * Also provides access to the current authentication state
 * 
 * @returns {Object} Authentication methods and state
 */
const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Select auth state from Redux store
  const { 
    user, 
    token, 
    isAuthenticated, 
    isLoading, 
    error, 
    roles 
  } = useSelector((state) => state.auth);

  /**
   * Check if the user is authenticated on component mount
   */
  useEffect(() => {
    const checkAuthentication = async () => {
      // Only check if we have a token but user data might be stale
      if (token && (!isAuthenticated || !user)) {
        try {
          await dispatch(checkAuthAction()).unwrap();
        } catch (err) {
          // Token is invalid or expired, clear it
          dispatch(logoutAction());
        }
      }
    };

    checkAuthentication();
  }, [dispatch, token, isAuthenticated, user]);

  /**
   * Login user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise} Promise resolving to the login result
   */
  const login = useCallback(
    async (email, password) => {
      try {
        const result = await dispatch(loginAction({ email, password })).unwrap();
        return result;
      } catch (err) {
        throw err;
      }
    },
    [dispatch]
  );

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise} Promise resolving to the registration result
   */
  const register = useCallback(
    async (userData) => {
      try {
        const result = await dispatch(registerAction(userData)).unwrap();
        return result;
      } catch (err) {
        throw err;
      }
    },
    [dispatch]
  );

  /**
   * Logout the current user
   * @param {boolean} [redirectToLogin=true] - Whether to redirect to login page after logout
   */
  const logout = useCallback(
    (redirectToLogin = true) => {
      dispatch(logoutAction());
      if (redirectToLogin) {
        navigate('/login');
      }
    },
    [dispatch, navigate]
  );

  /**
   * Send a password reset link to the user's email
   * @param {string} email - User email
   * @returns {Promise} Promise resolving to the forgot password result
   */
  const forgotPassword = useCallback(
    async (email) => {
      try {
        const result = await dispatch(forgotPasswordAction({ email })).unwrap();
        return result;
      } catch (err) {
        throw err;
      }
    },
    [dispatch]
  );

  /**
   * Reset user password with token
   * @param {string} token - Password reset token
   * @param {string} password - New password
   * @returns {Promise} Promise resolving to the reset password result
   */
  const resetPassword = useCallback(
    async (token, password) => {
      try {
        const result = await dispatch(
          resetPasswordAction({ token, password })
        ).unwrap();
        return result;
      } catch (err) {
        throw err;
      }
    },
    [dispatch]
  );

  /**
   * Update user profile information
   * @param {Object} profileData - Updated profile data
   * @returns {Promise} Promise resolving to the update profile result
   */
  const updateProfile = useCallback(
    async (profileData) => {
      try {
        const result = await dispatch(updateProfileAction(profileData)).unwrap();
        return result;
      } catch (err) {
        throw err;
      }
    },
    [dispatch]
  );

  /**
   * Check if the current user has a specific role
   * @param {string|Array} requiredRoles - Role or array of roles to check
   * @returns {boolean} Whether the user has the required role(s)
   */
  const hasRole = useCallback(
    (requiredRoles) => {
      if (!isAuthenticated || !user || !roles || roles.length === 0) {
        return false;
      }

      if (Array.isArray(requiredRoles)) {
        return requiredRoles.some(role => roles.includes(role));
      }
      
      return roles.includes(requiredRoles);
    },
    [isAuthenticated, user, roles]
  );

  /**
   * Check if token is expired
   * @returns {boolean} Whether the token is expired
   */
  const isTokenExpired = useCallback(() => {
    if (!token) return true;
    
    try {
      const decoded = jwt_decode(token);
      const currentTime = Date.now() / 1000;
      
      return decoded.exp < currentTime;
    } catch (err) {
      console.error('Error decoding token:', err);
      return true;
    }
  }, [token]);

  /**
   * Get user information from token
   * @returns {Object|null} Decoded token payload or null if no token
   */
  const getTokenInfo = useCallback(() => {
    if (!token) return null;
    
    try {
      return jwt_decode(token);
    } catch (err) {
      console.error('Error decoding token:', err);
      return null;
    }
  }, [token]);

  return {
    // State
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    roles,
    
    // Methods
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    hasRole,
    isTokenExpired,
    getTokenInfo
  };
};

export default useAuth;