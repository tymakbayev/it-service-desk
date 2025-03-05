const mongoose = require('mongoose');
const config = require('../config/config');

/**
 * Report Schema
 * Defines the structure for report documents in the database
 */
const reportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Report title is required'],
    trim: true,
    minlength: [5, 'Title must be at least 5 characters long'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  type: {
    type: String,
    enum: ['INCIDENT', 'EQUIPMENT', 'PERFORMANCE', 'AUDIT', 'SLA', 'CUSTOM'],
    required: [true, 'Report type is required']
  },
  format: {
    type: String,
    enum: ['PDF', 'EXCEL', 'CSV', 'HTML'],
    default: 'PDF'
  },
  dateRange: {
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required']
    }
  },
  filters: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User who created the report is required']
  },
  schedule: {
    isScheduled: {
      type: Boolean,
      default: false
    },
    frequency: {
      type: String,
      enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY'],
      default: null
    },
    nextRunDate: {
      type: Date,
      default: null
    },
    recipients: [{
      type: String,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide valid email addresses']
    }]
  },
  lastGeneratedAt: {
    type: Date,
    default: null
  },
  generatedReports: [{
    fileName: {
      type: String,
      required: true
    },
    filePath: {
      type: String,
      required: true
    },
    fileSize: {
      type: Number,
      required: true
    },
    format: {
      type: String,
      enum: ['PDF', 'EXCEL', 'CSV', 'HTML'],
      required: true
    },
    generatedAt: {
      type: Date,
      default: Date.now
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    dateRange: {
      startDate: Date,
      endDate: Date
    },
    isPublic: {
      type: Boolean,
      default: false
    },
    accessToken: {
      type: String,
      default: null
    },
    accessTokenExpires: {
      type: Date,
      default: null
    }
  }],
  charts: [{
    type: {
      type: String,
      enum: ['BAR', 'LINE', 'PIE', 'DOUGHNUT', 'RADAR', 'POLAR', 'SCATTER', 'BUBBLE'],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    dataSource: {
      type: String,
      required: true
    },
    options: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    position: {
      x: Number,
      y: Number,
      width: Number,
      height: Number
    }
  }],
  tables: [{
    title: {
      type: String,
      required: true
    },
    dataSource: {
      type: String,
      required: true
    },
    columns: [{
      field: String,
      header: String,
      width: Number,
      sortable: Boolean,
      filterable: Boolean
    }],
    options: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  }],
  metrics: [{
    name: {
      type: String,
      required: true
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    unit: String,
    trend: {
      type: String,
      enum: ['UP', 'DOWN', 'STABLE', 'NONE'],
      default: 'NONE'
    },
    trendValue: Number,
    color: String
  }],
  template: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ReportTemplate',
    default: null
  },
  isTemplate: {
    type: Boolean,
    default: false
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  accessPermissions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['VIEWER', 'EDITOR', 'OWNER'],
      default: 'VIEWER'
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED', 'GENERATING', 'ERROR'],
    default: 'DRAFT'
  },
  errorDetails: {
    message: String,
    stack: String,
    timestamp: Date
  },
  customHeader: {
    enabled: {
      type: Boolean,
      default: false
    },
    logo: String,
    title: String,
    subtitle: String,
    backgroundColor: String,
    textColor: String
  },
  customFooter: {
    enabled: {
      type: Boolean,
      default: false
    },
    text: String,
    includePageNumbers: {
      type: Boolean,
      default: true
    },
    includeDateGenerated: {
      type: Boolean,
      default: true
    }
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

/**
 * Virtual for report URL
 */
reportSchema.virtual('url').get(function() {
  return `/reports/${this._id}`;
});

/**
 * Virtual for download URL of the latest generated report
 */
reportSchema.virtual('downloadUrl').get(function() {
  if (this.generatedReports && this.generatedReports.length > 0) {
    const latestReport = this.generatedReports[this.generatedReports.length - 1];
    return `/reports/download/${this._id}/${latestReport._id}`;
  }
  return null;
});

/**
 * Pre-save middleware to validate date range
 */
reportSchema.pre('save', function(next) {
  // Validate date range
  if (this.dateRange.startDate && this.dateRange.endDate) {
    if (this.dateRange.startDate > this.dateRange.endDate) {
      return next(new Error('Start date cannot be after end date'));
    }
  }
  
  // Set next run date for scheduled reports
  if (this.schedule && this.schedule.isScheduled && !this.schedule.nextRunDate) {
    this.setNextRunDate();
  }
  
  next();
});

/**
 * Set the next run date based on frequency
 */
reportSchema.methods.setNextRunDate = function() {
  const now = new Date();
  
  switch (this.schedule.frequency) {
    case 'DAILY':
      this.schedule.nextRunDate = new Date(now.setDate(now.getDate() + 1));
      break;
    case 'WEEKLY':
      this.schedule.nextRunDate = new Date(now.setDate(now.getDate() + 7));
      break;
    case 'MONTHLY':
      this.schedule.nextRunDate = new Date(now.setMonth(now.getMonth() + 1));
      break;
    case 'QUARTERLY':
      this.schedule.nextRunDate = new Date(now.setMonth(now.getMonth() + 3));
      break;
    default:
      this.schedule.nextRunDate = null;
  }
  
  return this.schedule.nextRunDate;
};

/**
 * Generate a unique access token for public reports
 */
reportSchema.methods.generateAccessToken = function() {
  const token = Math.random().toString(36).substring(2, 15) + 
                Math.random().toString(36).substring(2, 15);
  
  // Set expiration to 30 days from now
  const expires = new Date();
  expires.setDate(expires.getDate() + 30);
  
  return {
    token,
    expires
  };
};

/**
 * Check if a user has access to this report
 * @param {ObjectId} userId - The user ID to check
 * @param {String} requiredRole - The minimum role required (VIEWER, EDITOR, OWNER)
 * @returns {Boolean} - Whether the user has access
 */
reportSchema.methods.hasUserAccess = function(userId, requiredRole = 'VIEWER') {
  // If report is public, everyone has VIEWER access
  if (this.isPublic && requiredRole === 'VIEWER') {
    return true;
  }
  
  // Check if user is the creator (always has OWNER access)
  if (this.createdBy.toString() === userId.toString()) {
    return true;
  }
  
  // Check access permissions
  const roleHierarchy = {
    'VIEWER': 1,
    'EDITOR': 2,
    'OWNER': 3
  };
  
  const requiredRoleLevel = roleHierarchy[requiredRole];
  
  const userPermission = this.accessPermissions.find(
    permission => permission.user.toString() === userId.toString()
  );
  
  if (userPermission) {
    const userRoleLevel = roleHierarchy[userPermission.role];
    return userRoleLevel >= requiredRoleLevel;
  }
  
  return false;
};

/**
 * Static method to find reports that need to be generated based on schedule
 * @returns {Promise<Array>} - Array of reports that need to be generated
 */
reportSchema.statics.findScheduledReports = function() {
  const now = new Date();
  
  return this.find({
    'schedule.isScheduled': true,
    'schedule.nextRunDate': { $lte: now },
    'status': { $nin: ['ARCHIVED', 'GENERATING'] }
  });
};

/**
 * Create a duplicate of this report
 * @param {Object} overrides - Properties to override in the duplicate
 * @returns {Promise<Document>} - The new report document
 */
reportSchema.methods.duplicate = async function(overrides = {}) {
  const Report = mongoose.model('Report');
  
  // Create a plain object from the document
  const reportObj = this.toObject();
  
  // Remove fields that should not be duplicated
  delete reportObj._id;
  delete reportObj.id;
  delete reportObj.createdAt;
  delete reportObj.updatedAt;
  delete reportObj.generatedReports;
  delete reportObj.lastGeneratedAt;
  
  // Apply overrides
  Object.assign(reportObj, overrides);
  
  // Set a default title if not provided in overrides
  if (!overrides.title) {
    reportObj.title = `${reportObj.title} (Copy)`;
  }
  
  // Create and return the new report
  return await Report.create(reportObj);
};

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;