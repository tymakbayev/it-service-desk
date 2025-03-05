const mongoose = require('mongoose');
const config = require('../config/config');

/**
 * Notification Schema
 * Defines the structure for notification documents in the database
 * Used for system notifications, alerts, and user-to-user messages
 */
const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    trim: true,
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  type: {
    type: String,
    enum: ['SYSTEM', 'INCIDENT', 'EQUIPMENT', 'USER', 'REPORT', 'ALERT'],
    default: 'SYSTEM',
    required: [true, 'Notification type is required']
  },
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'MEDIUM'
  },
  status: {
    type: String,
    enum: ['UNREAD', 'READ', 'ARCHIVED'],
    default: 'UNREAD'
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Notification recipient is required']
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  isSystemGenerated: {
    type: Boolean,
    default: true
  },
  relatedEntity: {
    entityType: {
      type: String,
      enum: ['INCIDENT', 'EQUIPMENT', 'USER', 'REPORT', null],
      default: null
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'relatedEntity.entityType',
      default: null
    }
  },
  link: {
    type: String,
    default: null
  },
  expiresAt: {
    type: Date,
    default: function() {
      // Default expiration is 30 days from creation
      const now = new Date();
      return new Date(now.setDate(now.getDate() + 30));
    }
  },
  readAt: {
    type: Date,
    default: null
  },
  deliveryStatus: {
    type: String,
    enum: ['PENDING', 'DELIVERED', 'FAILED'],
    default: 'PENDING'
  },
  deliveryMethod: {
    type: String,
    enum: ['IN_APP', 'EMAIL', 'SMS', 'PUSH'],
    default: 'IN_APP'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  actions: [{
    label: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    method: {
      type: String,
      enum: ['GET', 'POST', 'PUT', 'DELETE'],
      default: 'GET'
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

/**
 * Indexes for optimizing queries
 */
notificationSchema.index({ recipient: 1, status: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ 'relatedEntity.entityType': 1, 'relatedEntity.entityId': 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for automatic deletion

/**
 * Virtual for checking if notification is expired
 */
notificationSchema.virtual('isExpired').get(function() {
  return this.expiresAt && this.expiresAt < new Date();
});

/**
 * Virtual for checking if notification is read
 */
notificationSchema.virtual('isRead').get(function() {
  return this.status === 'READ';
});

/**
 * Virtual for time elapsed since notification was created
 */
notificationSchema.virtual('timeElapsed').get(function() {
  const now = new Date();
  const created = this.createdAt;
  const diffMs = now - created;
  
  // Convert to appropriate time unit
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return `${diffSec} seconds ago`;
  
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} minutes ago`;
  
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} hours ago`;
  
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 30) return `${diffDay} days ago`;
  
  const diffMonth = Math.floor(diffDay / 30);
  if (diffMonth < 12) return `${diffMonth} months ago`;
  
  const diffYear = Math.floor(diffMonth / 12);
  return `${diffYear} years ago`;
});

/**
 * Method to mark notification as read
 */
notificationSchema.methods.markAsRead = function() {
  this.status = 'READ';
  this.readAt = new Date();
  return this.save();
};

/**
 * Method to archive notification
 */
notificationSchema.methods.archive = function() {
  this.status = 'ARCHIVED';
  return this.save();
};

/**
 * Static method to create a system notification
 * @param {Object} notificationData - Notification data
 * @returns {Promise<Object>} Created notification
 */
notificationSchema.statics.createSystemNotification = async function(notificationData) {
  const notification = new this({
    ...notificationData,
    isSystemGenerated: true,
    sender: null,
    type: 'SYSTEM'
  });
  
  return notification.save();
};

/**
 * Static method to get unread notifications for a user
 * @param {String} userId - User ID
 * @returns {Promise<Array>} Array of unread notifications
 */
notificationSchema.statics.getUnreadByUser = function(userId) {
  return this.find({
    recipient: userId,
    status: 'UNREAD'
  })
  .sort({ createdAt: -1 })
  .populate('sender', 'username firstName lastName profileImage')
  .populate('relatedEntity.entityId');
};

/**
 * Static method to count unread notifications for a user
 * @param {String} userId - User ID
 * @returns {Promise<Number>} Count of unread notifications
 */
notificationSchema.statics.countUnreadByUser = function(userId) {
  return this.countDocuments({
    recipient: userId,
    status: 'UNREAD'
  });
};

/**
 * Static method to mark all notifications as read for a user
 * @param {String} userId - User ID
 * @returns {Promise<Object>} Update result
 */
notificationSchema.statics.markAllAsReadForUser = function(userId) {
  return this.updateMany(
    { recipient: userId, status: 'UNREAD' },
    { 
      status: 'READ',
      readAt: new Date()
    }
  );
};

/**
 * Pre-save middleware to validate notification data
 */
notificationSchema.pre('save', function(next) {
  // If notification is related to an entity, both entityType and entityId must be provided
  if ((this.relatedEntity.entityType && !this.relatedEntity.entityId) || 
      (!this.relatedEntity.entityType && this.relatedEntity.entityId)) {
    return next(new Error('Both entityType and entityId must be provided for related entity'));
  }
  
  // Ensure expiresAt is in the future
  if (this.expiresAt && this.expiresAt < new Date()) {
    return next(new Error('Expiration date must be in the future'));
  }
  
  next();
});

/**
 * Create the Notification model
 */
const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;