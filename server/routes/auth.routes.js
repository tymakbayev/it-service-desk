/**
 * IT Service Desk - Authentication Routes
 * 
 * This file defines all authentication-related routes for the application.
 * It handles user registration, login, password reset, and other auth operations.
 * 
 * @module server/routes/auth.routes
 */

'use strict';

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authMiddleware, roleMiddleware } = require('../middleware');
const validationMiddleware = require('../middleware/validation.middleware');
const { UserRole } = require('../utils/constants');

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post(
  '/register',
  validationMiddleware.validateRegister,
  authController.register
);

/**
 * @route POST /api/auth/login
 * @desc Authenticate user & get token
 * @access Public
 */
router.post(
  '/login',
  validationMiddleware.validateLogin,
  authController.login
);

/**
 * @route GET /api/auth/me
 * @desc Get current user profile
 * @access Private
 */
router.get(
  '/me',
  authMiddleware,
  authController.getCurrentUser
);

/**
 * @route PUT /api/auth/me
 * @desc Update user profile
 * @access Private
 */
router.put(
  '/me',
  authMiddleware,
  validationMiddleware.validateUpdateProfile,
  authController.updateProfile
);

/**
 * @route POST /api/auth/forgot-password
 * @desc Request password reset
 * @access Public
 */
router.post(
  '/forgot-password',
  validationMiddleware.validateEmail,
  authController.forgotPassword
);

/**
 * @route POST /api/auth/reset-password/:token
 * @desc Reset password with token
 * @access Public
 */
router.post(
  '/reset-password/:token',
  validationMiddleware.validateResetPassword,
  authController.resetPassword
);

/**
 * @route PUT /api/auth/change-password
 * @desc Change password (when logged in)
 * @access Private
 */
router.put(
  '/change-password',
  authMiddleware,
  validationMiddleware.validateChangePassword,
  authController.changePassword
);

/**
 * @route POST /api/auth/logout
 * @desc Logout user / invalidate token
 * @access Private
 */
router.post(
  '/logout',
  authMiddleware,
  authController.logout
);

/**
 * @route GET /api/auth/refresh-token
 * @desc Refresh JWT token
 * @access Public (with refresh token)
 */
router.get(
  '/refresh-token',
  authController.refreshToken
);

/**
 * @route GET /api/auth/verify-email/:token
 * @desc Verify user email with token
 * @access Public
 */
router.get(
  '/verify-email/:token',
  authController.verifyEmail
);

/**
 * @route POST /api/auth/resend-verification
 * @desc Resend email verification
 * @access Private
 */
router.post(
  '/resend-verification',
  authMiddleware,
  authController.resendVerification
);

/**
 * Admin routes for user management
 * These routes are protected by both auth and admin role middleware
 */

/**
 * @route GET /api/auth/users
 * @desc Get all users (admin only)
 * @access Private/Admin
 */
router.get(
  '/users',
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  authController.getAllUsers
);

/**
 * @route GET /api/auth/users/:id
 * @desc Get user by ID (admin only)
 * @access Private/Admin
 */
router.get(
  '/users/:id',
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  authController.getUserById
);

/**
 * @route POST /api/auth/users
 * @desc Create a new user (admin only)
 * @access Private/Admin
 */
router.post(
  '/users',
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  validationMiddleware.validateCreateUser,
  authController.createUser
);

/**
 * @route PUT /api/auth/users/:id
 * @desc Update user (admin only)
 * @access Private/Admin
 */
router.put(
  '/users/:id',
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  validationMiddleware.validateUpdateUser,
  authController.updateUser
);

/**
 * @route DELETE /api/auth/users/:id
 * @desc Delete user (admin only)
 * @access Private/Admin
 */
router.delete(
  '/users/:id',
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  authController.deleteUser
);

/**
 * @route PUT /api/auth/users/:id/role
 * @desc Update user role (admin only)
 * @access Private/Admin
 */
router.put(
  '/users/:id/role',
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  validationMiddleware.validateUpdateRole,
  authController.updateUserRole
);

/**
 * @route PUT /api/auth/users/:id/status
 * @desc Update user status (active/inactive) (admin only)
 * @access Private/Admin
 */
router.put(
  '/users/:id/status',
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  validationMiddleware.validateUpdateStatus,
  authController.updateUserStatus
);

/**
 * @route GET /api/auth/roles
 * @desc Get all available roles
 * @access Private
 */
router.get(
  '/roles',
  authMiddleware,
  authController.getRoles
);

/**
 * @route GET /api/auth/activity-log
 * @desc Get user activity log (admin or self)
 * @access Private
 */
router.get(
  '/activity-log',
  authMiddleware,
  authController.getActivityLog
);

/**
 * @route GET /api/auth/sessions
 * @desc Get active user sessions
 * @access Private
 */
router.get(
  '/sessions',
  authMiddleware,
  authController.getActiveSessions
);

/**
 * @route DELETE /api/auth/sessions/:sessionId
 * @desc Terminate a specific session
 * @access Private
 */
router.delete(
  '/sessions/:sessionId',
  authMiddleware,
  authController.terminateSession
);

/**
 * @route DELETE /api/auth/sessions
 * @desc Terminate all sessions except current
 * @access Private
 */
router.delete(
  '/sessions',
  authMiddleware,
  authController.terminateAllSessions
);

module.exports = router;