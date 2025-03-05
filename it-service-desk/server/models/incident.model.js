const mongoose = require('mongoose');
const config = require('../config/config');

/**
 * Incident Schema
 * Defines the structure for incident documents in the database
 */
const incidentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Incident title is required'],
    trim: true,
    minlength: [5, 'Title must be at least 5 characters long'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Incident description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters long'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  status: {
    type: String,
    enum: ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD', 'RESOLVED', 'CLOSED', 'CANCELLED'],
    default: 'NEW'
  },
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'MEDIUM'
  },
  category: {
    type: String,
    enum: ['HARDWARE', 'SOFTWARE', 'NETWORK', 'SECURITY', 'ACCESS', 'EMAIL', 'OTHER'],
    required: [true, 'Incident category is required']
  },
  subcategory: {
    type: String,
    trim: true,
    maxlength: [50, 'Subcategory cannot exceed 50 characters']
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User who reported the incident is required']
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  relatedEquipment: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipment'
  }],
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  department: {
    type: String,
    trim: true,
    maxlength: [100, 'Department cannot exceed 100 characters']
  },
  impact: {
    type: String,
    enum: ['INDIVIDUAL', 'DEPARTMENT', 'ORGANIZATION'],
    default: 'INDIVIDUAL'
  },
  resolutionSummary: {
    type: String,
    trim: true,
    maxlength: [2000, 'Resolution summary cannot exceed 2000 characters']
  },
  resolutionDate: {
    type: Date,
    default: null
  },
  dueDate: {
    type: Date,
    default: null
  },
  estimatedTime: {
    type: Number, // in minutes
    default: null
  },
  actualTime: {
    type: Number, // in minutes
    default: null
  },
  attachments: [{
    name: String,
    path: String,
    mimeType: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  comments: [{
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    isInternal: {
      type: Boolean,
      default: false
    },
    attachments: [{
      name: String,
      path: String,
      mimeType: String,
      size: Number
    }]
  }],
  history: [{
    field: {
      type: String,
      required: true
    },
    oldValue: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    newValue: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    changedAt: {
      type: Date,
      default: Date.now
    }
  }],
  sla: {
    responseTime: {
      target: Number, // in minutes
      actual: Number, // in minutes
      breached: {
        type: Boolean,
        default: false
      }
    },
    resolutionTime: {
      target: Number, // in minutes
      actual: Number, // in minutes
      breached: {
        type: Boolean,
        default: false
      }
    }
  },
  isEscalated: {
    type: Boolean,
    default: false
  },
  escalationReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Escalation reason cannot exceed 500 characters']
  },
  escalatedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  escalatedAt: {
    type: Date,
    default: null
  },
  reopenCount: {
    type: Number,
    default: 0
  },
  lastReopenedAt: {
    type: Date,
    default: null
  },
  lastReopenedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  satisfactionRating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  satisfactionComment: {
    type: String,
    trim: true,
    maxlength: [500, 'Satisfaction comment cannot exceed 500 characters']
  },
  tags: [{
    type: String,
    trim: true
  }],
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

/**
 * Indexes for optimizing queries
 */
incidentSchema.index({ status: 1 });
incidentSchema.index({ priority: 1 });
incidentSchema.index({ category: 1 });
incidentSchema.index({ reportedBy: 1 });
incidentSchema.index({ assignedTo: 1 });
incidentSchema.index({ createdAt: -1 });
incidentSchema.index({ isDeleted: 1 });
incidentSchema.index({ 'sla.responseTime.breached': 1 });
incidentSchema.index({ 'sla.resolutionTime.breached': 1 });

/**
 * Virtual for incident age in days
 */
incidentSchema.virtual('ageInDays').get(function() {
  const now = new Date();
  const created = this.createdAt;
  const diffTime = Math.abs(now - created);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

/**
 * Virtual for incident resolution time in hours
 */
incidentSchema.virtual('resolutionTimeInHours').get(function() {
  if (!this.resolutionDate) return null;
  
  const created = this.createdAt;
  const resolved = this.resolutionDate;
  const diffTime = Math.abs(resolved - created);
  const diffHours = Math.round((diffTime / (1000 * 60 * 60)) * 10) / 10; // Round to 1 decimal place
  return diffHours;
});

/**
 * Pre-save middleware to set SLA targets based on priority
 */
incidentSchema.pre('save', function(next) {
  // Only set SLA targets if this is a new incident or priority has changed
  if (this.isNew || this.isModified('priority')) {
    // Set SLA targets based on priority
    switch (this.priority) {
      case 'CRITICAL':
        this.sla.responseTime.target = config.SLA.CRITICAL.responseTime;
        this.sla.resolutionTime.target = config.SLA.CRITICAL.resolutionTime;
        break;
      case 'HIGH':
        this.sla.responseTime.target = config.SLA.HIGH.responseTime;
        this.sla.resolutionTime.target = config.SLA.HIGH.resolutionTime;
        break;
      case 'MEDIUM':
        this.sla.responseTime.target = config.SLA.MEDIUM.responseTime;
        this.sla.resolutionTime.target = config.SLA.MEDIUM.resolutionTime;
        break;
      case 'LOW':
        this.sla.responseTime.target = config.SLA.LOW.responseTime;
        this.sla.resolutionTime.target = config.SLA.LOW.resolutionTime;
        break;
      default:
        this.sla.responseTime.target = config.SLA.MEDIUM.responseTime;
        this.sla.resolutionTime.target = config.SLA.MEDIUM.resolutionTime;
    }
  }

  // If status is changing to RESOLVED or CLOSED, set resolution date
  if (this.isModified('status') && (this.status === 'RESOLVED' || this.status === 'CLOSED')) {
    if (!this.resolutionDate) {
      this.resolutionDate = new Date();
    }
    
    // Calculate actual resolution time in minutes
    const resolutionTimeInMinutes = Math.round((this.resolutionDate - this.createdAt) / (1000 * 60));
    this.sla.resolutionTime.actual = resolutionTimeInMinutes;
    
    // Check if SLA was breached
    if (this.sla.resolutionTime.target && resolutionTimeInMinutes > this.sla.resolutionTime.target) {
      this.sla.resolutionTime.breached = true;
    }
  }

  // If status is changing to ASSIGNED or IN_PROGRESS for the first time, calculate response time
  if (this.isModified('status') && 
      (this.status === 'ASSIGNED' || this.status === 'IN_PROGRESS') && 
      !this.sla.responseTime.actual) {
    
    const responseTimeInMinutes = Math.round((Date.now() - this.createdAt) / (1000 * 60));
    this.sla.responseTime.actual = responseTimeInMinutes;
    
    // Check if response SLA was breached
    if (this.sla.responseTime.target && responseTimeInMinutes > this.sla.responseTime.target) {
      this.sla.responseTime.breached = true;
    }
  }

  // If status is changing from RESOLVED or CLOSED to another status, increment reopenCount
  if (this.isModified('status') && 
      ['RESOLVED', 'CLOSED'].includes(this._oldStatus) && 
      !['RESOLVED', 'CLOSED'].includes(this.status)) {
    
    this.reopenCount += 1;
    this.lastReopenedAt = new Date();
    // lastReopenedBy should be set by the controller
  }

  next();
});

/**
 * Pre-update middleware to track status changes
 */
incidentSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  
  // If status is being updated, store the old status for comparison
  if (update && update.status) {
    this.findOne().then(doc => {
      if (doc) {
        doc._oldStatus = doc.status;
        doc.save();
      }
      next();
    }).catch(err => next(err));
  } else {
    next();
  }
});

/**
 * Static method to find incidents with breached SLAs
 */
incidentSchema.statics.findBreachedSLAs = function() {
  return this.find({
    $or: [
      { 'sla.responseTime.breached': true },
      { 'sla.resolutionTime.breached': true }
    ],
    status: { $nin: ['RESOLVED', 'CLOSED', 'CANCELLED'] },
    isDeleted: false
  });
};

/**
 * Static method to find incidents by priority
 */
incidentSchema.statics.findByPriority = function(priority) {
  return this.find({
    priority,
    isDeleted: false
  });
};

/**
 * Static method to find incidents by status
 */
incidentSchema.statics.findByStatus = function(status) {
  return this.find({
    status,
    isDeleted: false
  });
};

/**
 * Static method to find incidents assigned to a specific user
 */
incidentSchema.statics.findByAssignee = function(userId) {
  return this.find({
    assignedTo: userId,
    isDeleted: false
  });
};

/**
 * Static method to find incidents reported by a specific user
 */
incidentSchema.statics.findByReporter = function(userId) {
  return this.find({
    reportedBy: userId,
    isDeleted: false
  });
};

/**
 * Static method to find incidents related to specific equipment
 */
incidentSchema.statics.findByEquipment = function(equipmentId) {
  return this.find({
    relatedEquipment: equipmentId,
    isDeleted: false
  });
};

/**
 * Static method to get incident statistics
 */
incidentSchema.statics.getStatistics = async function() {
  return this.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        new: { $sum: { $cond: [{ $eq: ['$status', 'NEW'] }, 1, 0] } },
        assigned: { $sum: { $cond: [{ $eq: ['$status', 'ASSIGNED'] }, 1, 0] } },
        inProgress: { $sum: { $cond: [{ $eq: ['$status', 'IN_PROGRESS'] }, 1, 0] } },
        onHold: { $sum: { $cond: [{ $eq: ['$status', 'ON_HOLD'] }, 1, 0] } },
        resolved: { $sum: { $cond: [{ $eq: ['$status', 'RESOLVED'] }, 1, 0] } },
        closed: { $sum: { $cond: [{ $eq: ['$status', 'CLOSED'] }, 1, 0] } },
        cancelled: { $sum: { $cond: [{ $eq: ['$status', 'CANCELLED'] }, 1, 0] } },
        critical: { $sum: { $cond: [{ $eq: ['$priority', 'CRITICAL'] }, 1, 0] } },
        high: { $sum: { $cond: [{ $eq: ['$priority', 'HIGH'] }, 1, 0] } },
        medium: { $sum: { $cond: [{ $eq: ['$priority', 'MEDIUM'] }, 1, 0] } },
        low: { $sum: { $cond: [{ $eq: ['$priority', 'LOW'] }, 1, 0] } },
        slaBreached: { 
          $sum: { 
            $cond: [
              { 
                $or: [
                  { $eq: ['$sla.responseTime.breached', true] },
                  { $eq: ['$sla.resolutionTime.breached', true] }
                ] 
              }, 
              1, 
              0
            ] 
          } 
        },
        avgResolutionTime: { $avg: '$sla.resolutionTime.actual' }
      }
    }
  ]);
};

/**
 * Method to add a comment to an incident
 */
incidentSchema.methods.addComment = function(comment) {
  this.comments.push(comment);
  return this.save();
};

/**
 * Method to add an attachment to an incident
 */
incidentSchema.methods.addAttachment = function(attachment) {
  this.attachments.push(attachment);
  return this.save();
};

/**
 * Method to track history changes
 */
incidentSchema.methods.trackChange = function(field, oldValue, newValue, changedBy) {
  this.history.push({
    field,
    oldValue,
    newValue,
    changedBy,
    changedAt: new Date()
  });
  return this.save();
};

/**
 * Method to escalate an incident
 */
incidentSchema.methods.escalate = function(reason, escalatedTo, escalatedBy) {
  this.isEscalated = true;
  this.escalationReason = reason;
  this.escalatedTo = escalatedTo;
  this.escalatedAt = new Date();
  
  // Track the change in history
  this.history.push({
    field: 'escalation',
    oldValue: false,
    newValue: true,
    changedBy: escalatedBy,
    changedAt: new Date()
  });
  
  return this.save();
};

/**
 * Method to resolve an incident
 */
incidentSchema.methods.resolve = function(resolutionSummary, resolvedBy) {
  const oldStatus = this.status;
  this.status = 'RESOLVED';
  this.resolutionSummary = resolutionSummary;
  this.resolutionDate = new Date();
  
  // Calculate actual resolution time in minutes
  const resolutionTimeInMinutes = Math.round((this.resolutionDate - this.createdAt) / (1000 * 60));
  this.sla.resolutionTime.actual = resolutionTimeInMinutes;
  
  // Check if SLA was breached
  if (this.sla.resolutionTime.target && resolutionTimeInMinutes > this.sla.resolutionTime.target) {
    this.sla.resolutionTime.breached = true;
  }
  
  // Track the change in history
  this.history.push({
    field: 'status',
    oldValue: oldStatus,
    newValue: 'RESOLVED',
    changedBy: resolvedBy,
    changedAt: new Date()
  });
  
  return this.save();
};

/**
 * Method to reopen an incident
 */
incidentSchema.methods.reopen = function(reason, reopenedBy) {
  const oldStatus = this.status;
  this.status = 'IN_PROGRESS';
  this.reopenCount += 1;
  this.lastReopenedAt = new Date();
  this.lastReopenedBy = reopenedBy;
  this.resolutionDate = null;
  
  // Add comment with reason
  this.comments.push({
    text: `Incident reopened: ${reason}`,
    createdBy: reopenedBy,
    createdAt: new Date(),
    isInternal: false
  });
  
  // Track the change in history
  this.history.push({
    field: 'status',
    oldValue: oldStatus,
    newValue: 'IN_PROGRESS',
    changedBy: reopenedBy,
    changedAt: new Date()
  });
  
  return this.save();
};

/**
 * Method to assign an incident
 */
incidentSchema.methods.assign = function(assigneeId, assignedBy) {
  const oldAssignee = this.assignedTo;
  const oldStatus = this.status;
  
  this.assignedTo = assigneeId;
  
  // If status is NEW, change it to ASSIGNED
  if (this.status === 'NEW') {
    this.status = 'ASSIGNED';
    
    // Calculate response time if not already set
    if (!this.sla.responseTime.actual) {
      const responseTimeInMinutes = Math.round((Date.now() - this.createdAt) / (1000 * 60));
      this.sla.responseTime.actual = responseTimeInMinutes;
      
      // Check if response SLA was breached
      if (this.sla.responseTime.target && responseTimeInMinutes > this.sla.responseTime.target) {
        this.sla.responseTime.breached = true;
      }
    }
  }
  
  // Track assignee change in history
  this.history.push({
    field: 'assignedTo',
    oldValue: oldAssignee || 'Unassigned',
    newValue: assigneeId,
    changedBy: assignedBy,
    changedAt: new Date()
  });
  
  // Track status change in history if it changed
  if (oldStatus !== this.status) {
    this.history.push({
      field: 'status',
      oldValue: oldStatus,
      newValue: this.status,
      changedBy: assignedBy,
      changedAt: new Date()
    });
  }
  
  return this.save();
};

/**
 * Method to rate incident resolution satisfaction
 */
incidentSchema.methods.rateSatisfaction = function(rating, comment, ratedBy) {
  this.satisfactionRating = rating;
  this.satisfactionComment = comment;
  
  // Track the rating in history
  this.history.push({
    field: 'satisfactionRating',
    oldValue: null,
    newValue: rating,
    changedBy: ratedBy,
    changedAt: new Date()
  });
  
  return this.save();
};

/**
 * Create and export the Incident model
 */
const Incident = mongoose.model('Incident', incidentSchema);

module.exports = Incident;