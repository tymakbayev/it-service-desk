/**
 * IT Service Desk - Notification Routes
 * 
 * This file defines all notification-related routes for the application.
 * It handles notification creation, retrieval, marking as read, and other notification operations.
 * 
 * @module server/routes/notification.routes
 */

'use strict';

const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { authMiddleware, roleMiddleware } = require('../middleware');
const validationMiddleware = require('../middleware/validation.middleware');
const { UserRole } = require('../utils/constants');

/**
 * @route GET /api/notifications
 * @desc Get all notifications for the current user
 * @access Private
 */
router.get(
  '/',
  notificationController.getUserNotifications
);

/**
 * @route GET /api/notifications/unread
 * @desc Get unread notifications count for the current user
 * @access Private
 */
router.get(
  '/unread',
  notificationController.getUnreadCount
);

/**
 * @route GET /api/notifications/:id
 * @desc Get notification by ID
 * @access Private
 */
router.get(
  '/:id',
  validationMiddleware.validateObjectId('id'),
  notificationController.getNotificationById
);

/**
 * @route PUT /api/notifications/:id/read
 * @desc Mark notification as read
 * @access Private
 */
router.put(
  '/:id/read',
  validationMiddleware.validateObjectId('id'),
  notificationController.markAsRead
);

/**
 * @route PUT /api/notifications/read-all
 * @desc Mark all notifications as read for the current user
 * @access Private
 */
router.put(
  '/read-all',
  notificationController.markAllAsRead
);

/**
 * @route DELETE /api/notifications/:id
 * @desc Delete notification
 * @access Private
 */
router.delete(
  '/:id',
  validationMiddleware.validateObjectId('id'),
  notificationController.deleteNotification
);

/**
 * @route DELETE /api/notifications
 * @desc Delete all notifications for the current user
 * @access Private
 */
router.delete(
  '/',
  notificationController.deleteAllUserNotifications
);

/**
 * Admin routes for notification management
 * These routes are protected by both auth and admin role middleware
 */

/**
 * @route POST /api/notifications
 * @desc Create a new notification (admin only)
 * @access Private/Admin
 */
router.post(
  '/',
  roleMiddleware([UserRole.ADMIN]),
  validationMiddleware.validateCreateNotification,
  notificationController.createNotification
);

/**
 * @route POST /api/notifications/broadcast
 * @desc Broadcast notification to all users or specific role (admin only)
 * @access Private/Admin
 */
router.post(
  '/broadcast',
  roleMiddleware([UserRole.ADMIN]),
  validationMiddleware.validateBroadcastNotification,
  notificationController.broadcastNotification
);

/**
 * @route GET /api/notifications/system
 * @desc Get all system notifications (admin only)
 * @access Private/Admin
 */
router.get(
  '/system',
  roleMiddleware([UserRole.ADMIN]),
  notificationController.getSystemNotifications
);

/**
 * @route PUT /api/notifications/settings
 * @desc Update notification settings for current user
 * @access Private
 */
router.put(
  '/settings',
  validationMiddleware.validateNotificationSettings,
  notificationController.updateNotificationSettings
);

/**
 * @route GET /api/notifications/settings
 * @desc Get notification settings for current user
 * @access Private
 */
router.get(
  '/settings',
  notificationController.getNotificationSettings
);

/**
 * @route GET /api/notifications/types
 * @desc Get all notification types
 * @access Private
 */
router.get(
  '/types',
  notificationController.getNotificationTypes
);

/**
 * @route POST /api/notifications/test
 * @desc Send test notification to current user (for debugging)
 * @access Private/Admin
 */
router.post(
  '/test',
  roleMiddleware([UserRole.ADMIN]),
  notificationController.sendTestNotification
);

/**
 * @route GET /api/notifications/user/:userId
 * @desc Get notifications for a specific user (admin only)
 * @access Private/Admin
 */
router.get(
  '/user/:userId',
  validationMiddleware.validateObjectId('userId'),
  roleMiddleware([UserRole.ADMIN]),
  notificationController.getUserNotificationsById
);

module.exports = router;