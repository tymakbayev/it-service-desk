const NotificationModel = require('../models/notification.model');
const UserModel = require('../models/user.model');
const WebSocketService = require('../services/websocket.service');
const EmailService = require('../services/email.service');
const { validationResult } = require('express-validator');

/**
 * Controller for handling notification operations
 */
class NotificationController {
  /**
   * Create a new notification
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { userId, type, message, data, isRead = false } = req.body;

      // Validate user exists
      const userExists = await UserModel.exists({ _id: userId });
      if (!userExists) {
        return res.status(404).json({ message: 'User not found' });
      }

      const notification = await NotificationModel.create({
        userId,
        type,
        message,
        data,
        isRead,
        createdAt: new Date()
      });

      // Send real-time notification via WebSocket if user is online
      WebSocketService.sendNotificationToUser(userId, {
        id: notification._id,
        type,
        message,
        data,
        isRead,
        createdAt: notification.createdAt
      });

      // Send email notification for important notifications
      const user = await UserModel.findById(userId);
      if (user.emailNotificationsEnabled && ['incident_assigned', 'incident_critical', 'equipment_issue'].includes(type)) {
        await EmailService.sendNotificationEmail(user.email, {
          subject: `IT Service Desk: ${this._getNotificationSubject(type)}`,
          message,
          data
        });
      }

      return res.status(201).json(notification);
    } catch (error) {
      console.error('Error creating notification:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Get all notifications for a user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  async getUserNotifications(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10, unreadOnly = false } = req.query;

      const filter = { userId };
      if (unreadOnly === 'true') {
        filter.isRead = false;
      }

      const options = {
        sort: { createdAt: -1 },
        skip: (parseInt(page) - 1) * parseInt(limit),
        limit: parseInt(limit)
      };

      const notifications = await NotificationModel.find(filter, null, options);
      const total = await NotificationModel.countDocuments(filter);
      const unreadCount = await NotificationModel.countDocuments({ userId, isRead: false });

      return res.json({
        notifications,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        },
        unreadCount
      });
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Mark a notification as read
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  async markAsRead(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const notification = await NotificationModel.findById(id);
      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }

      // Ensure user can only mark their own notifications as read
      if (notification.userId.toString() !== userId) {
        return res.status(403).json({ message: 'Access denied' });
      }

      notification.isRead = true;
      notification.readAt = new Date();
      await notification.save();

      return res.json(notification);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Mark all notifications as read for a user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  async markAllAsRead(req, res) {
    try {
      const userId = req.user.id;
      const now = new Date();

      const result = await NotificationModel.updateMany(
        { userId, isRead: false },
        { isRead: true, readAt: now }
      );

      return res.json({
        success: true,
        message: `Marked ${result.modifiedCount} notifications as read`,
        modifiedCount: result.modifiedCount
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Delete a notification
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  async delete(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const notification = await NotificationModel.findById(id);
      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }

      // Ensure user can only delete their own notifications
      if (notification.userId.toString() !== userId) {
        return res.status(403).json({ message: 'Access denied' });
      }

      await notification.remove();

      return res.json({
        success: true,
        message: 'Notification deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Delete all notifications for a user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  async deleteAll(req, res) {
    try {
      const userId = req.user.id;

      const result = await NotificationModel.deleteMany({ userId });

      return res.json({
        success: true,
        message: `Deleted ${result.deletedCount} notifications`,
        deletedCount: result.deletedCount
      });
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Get notification statistics for a user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  async getNotificationStats(req, res) {
    try {
      const userId = req.user.id;

      const totalCount = await NotificationModel.countDocuments({ userId });
      const unreadCount = await NotificationModel.countDocuments({ userId, isRead: false });
      
      // Get counts by notification type
      const typeStats = await NotificationModel.aggregate([
        { $match: { userId: require('mongoose').Types.ObjectId(userId) } },
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      // Get notification trend (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const dailyTrend = await NotificationModel.aggregate([
        { 
          $match: { 
            userId: require('mongoose').Types.ObjectId(userId),
            createdAt: { $gte: sevenDaysAgo }
          } 
        },
        {
          $group: {
            _id: { 
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } 
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      return res.json({
        totalCount,
        unreadCount,
        readPercentage: totalCount > 0 ? ((totalCount - unreadCount) / totalCount) * 100 : 0,
        typeDistribution: typeStats.map(stat => ({
          type: stat._id,
          count: stat.count,
          percentage: (stat.count / totalCount) * 100
        })),
        dailyTrend
      });
    } catch (error) {
      console.error('Error fetching notification statistics:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Update user notification preferences
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  async updateNotificationPreferences(req, res) {
    try {
      const userId = req.user.id;
      const { emailNotificationsEnabled, pushNotificationsEnabled, notificationTypes } = req.body;

      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Update notification preferences
      if (emailNotificationsEnabled !== undefined) {
        user.emailNotificationsEnabled = emailNotificationsEnabled;
      }

      if (pushNotificationsEnabled !== undefined) {
        user.pushNotificationsEnabled = pushNotificationsEnabled;
      }

      if (notificationTypes) {
        user.notificationPreferences = notificationTypes;
      }

      await user.save();

      return res.json({
        success: true,
        message: 'Notification preferences updated successfully',
        preferences: {
          emailNotificationsEnabled: user.emailNotificationsEnabled,
          pushNotificationsEnabled: user.pushNotificationsEnabled,
          notificationTypes: user.notificationPreferences
        }
      });
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Get notification subject based on type
   * @param {String} type - Notification type
   * @returns {String} Notification subject
   * @private
   */
  _getNotificationSubject(type) {
    const subjects = {
      'incident_created': 'Новый инцидент создан',
      'incident_assigned': 'Вам назначен инцидент',
      'incident_updated': 'Инцидент обновлен',
      'incident_resolved': 'Инцидент решен',
      'incident_closed': 'Инцидент закрыт',
      'incident_critical': 'Критический инцидент требует внимания',
      'equipment_issue': 'Проблема с оборудованием',
      'equipment_maintenance': 'Плановое обслуживание оборудования',
      'report_generated': 'Отчет сгенерирован',
      'system_notification': 'Системное уведомление'
    };

    return subjects[type] || 'Уведомление IT Service Desk';
  }
}

module.exports = new NotificationController();