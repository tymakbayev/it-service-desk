const NotificationModel = require('../models/notification.model');
const WebSocketService = require('./websocket.service');

class NotificationService {
  /**
   * Отправляет уведомление пользователю
   * @param {Object} notification - Объект уведомления
   * @param {string} notification.userId - ID пользователя
   * @param {string} notification.type - Тип уведомления (incident_created, incident_updated, etc.)
   * @param {string} notification.message - Текст уведомления
   * @param {Object} notification.data - Дополнительные данные уведомления
   * @returns {Promise<Object>} - Созданное уведомление
   */
  async sendNotification({ userId, type, message, data = {} }) {
    try {
      // Создаем уведомление в базе данных
      const notification = await NotificationModel.create({
        userId,
        type,
        message,
        data,
        isRead: false,
        createdAt: new Date()
      });

      // Отправляем уведомление через WebSocket
      WebSocketService.sendToUser(userId, 'notification', notification);

      return notification;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  /**
   * Получает уведомления пользователя
   * @param {string} userId - ID пользователя
   * @param {Object} options - Опции запроса
   * @param {number} options.limit - Лимит уведомлений
   * @param {number} options.offset - Смещение
   * @param {boolean} options.unreadOnly - Только непрочитанные
   * @returns {Promise<Array>} - Массив уведомлений
   */
  async getNotifications(userId, { limit = 20, offset = 0, unreadOnly = false } = {}) {
    try {
      const query = { userId };
      
      if (unreadOnly) {
        query.isRead = false;
      }

      const notifications = await NotificationModel.find(query)
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit);

      const total = await NotificationModel.countDocuments(query);

      return {
        notifications,
        total,
        unread: await NotificationModel.countDocuments({ userId, isRead: false })
      };
    } catch (error) {
      console.error('Error getting notifications:', error);
      throw error;
    }
  }

  /**
   * Отмечает уведомление как прочитанное
   * @param {string} notificationId - ID уведомления
   * @param {string} userId - ID пользователя (для проверки доступа)
   * @returns {Promise<Object>} - Обновленное уведомление
   */
  async markAsRead(notificationId, userId) {
    try {
      const notification = await NotificationModel.findById(notificationId);
      
      if (!notification) {
        throw new Error('Notification not found');
      }

      if (notification.userId.toString() !== userId) {
        throw new Error('Access denied');
      }

      notification.isRead = true;
      notification.readAt = new Date();
      await notification.save();

      // Отправляем обновление через WebSocket
      WebSocketService.sendToUser(userId, 'notification_updated', notification);

      return notification;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Отмечает все уведомления пользователя как прочитанные
   * @param {string} userId - ID пользователя
   * @returns {Promise<Object>} - Результат операции
   */
  async markAllAsRead(userId) {
    try {
      const result = await NotificationModel.updateMany(
        { userId, isRead: false },
        { isRead: true, readAt: new Date() }
      );

      // Отправляем обновление через WebSocket
      WebSocketService.sendToUser(userId, 'all_notifications_read', { count: result.modifiedCount });

      return { success: true, count: result.modifiedCount };
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService();