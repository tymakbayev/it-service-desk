const mongoose = require('mongoose');
const config = require('../config/config');

/**
 * Equipment Schema
 * Defines the structure for equipment documents in the database
 */
const equipmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Equipment name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  type: {
    type: String,
    required: [true, 'Equipment type is required'],
    enum: ['COMPUTER', 'LAPTOP', 'SERVER', 'PRINTER', 'SCANNER', 'NETWORK_DEVICE', 'PERIPHERAL', 'MOBILE_DEVICE', 'OTHER'],
    index: true
  },
  serialNumber: {
    type: String,
    trim: true,
    unique: true,
    sparse: true, // Allows multiple null values
    maxlength: [100, 'Serial number cannot exceed 100 characters']
  },
  inventoryNumber: {
    type: String,
    trim: true,
    unique: true,
    sparse: true,
    maxlength: [50, 'Inventory number cannot exceed 50 characters']
  },
  manufacturer: {
    type: String,
    trim: true,
    maxlength: [100, 'Manufacturer name cannot exceed 100 characters']
  },
  model: {
    type: String,
    trim: true,
    maxlength: [100, 'Model name cannot exceed 100 characters']
  },
  purchaseDate: {
    type: Date,
    default: null
  },
  warrantyExpiryDate: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'REPAIR', 'DECOMMISSIONED', 'RESERVED', 'LOST'],
    default: 'ACTIVE',
    index: true
  },
  location: {
    building: {
      type: String,
      trim: true,
      maxlength: [100, 'Building name cannot exceed 100 characters']
    },
    floor: {
      type: String,
      trim: true,
      maxlength: [20, 'Floor cannot exceed 20 characters']
    },
    room: {
      type: String,
      trim: true,
      maxlength: [50, 'Room cannot exceed 50 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Location description cannot exceed 200 characters']
    }
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },
  department: {
    type: String,
    trim: true,
    maxlength: [100, 'Department name cannot exceed 100 characters'],
    index: true
  },
  ipAddress: {
    type: String,
    trim: true,
    match: [/^(\d{1,3}\.){3}\d{1,3}$/, 'Please provide a valid IP address'],
    sparse: true,
    unique: true
  },
  macAddress: {
    type: String,
    trim: true,
    match: [/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/, 'Please provide a valid MAC address'],
    sparse: true,
    unique: true
  },
  operatingSystem: {
    name: {
      type: String,
      trim: true,
      maxlength: [50, 'OS name cannot exceed 50 characters']
    },
    version: {
      type: String,
      trim: true,
      maxlength: [50, 'OS version cannot exceed 50 characters']
    },
    licenseKey: {
      type: String,
      trim: true,
      maxlength: [100, 'License key cannot exceed 100 characters']
    },
    licenseExpiryDate: {
      type: Date,
      default: null
    }
  },
  specifications: {
    cpu: {
      type: String,
      trim: true,
      maxlength: [100, 'CPU specification cannot exceed 100 characters']
    },
    ram: {
      type: String,
      trim: true,
      maxlength: [50, 'RAM specification cannot exceed 50 characters']
    },
    storage: {
      type: String,
      trim: true,
      maxlength: [100, 'Storage specification cannot exceed 100 characters']
    },
    graphicsCard: {
      type: String,
      trim: true,
      maxlength: [100, 'Graphics card specification cannot exceed 100 characters']
    },
    additionalDetails: {
      type: String,
      trim: true,
      maxlength: [500, 'Additional details cannot exceed 500 characters']
    }
  },
  purchaseInfo: {
    vendor: {
      type: String,
      trim: true,
      maxlength: [100, 'Vendor name cannot exceed 100 characters']
    },
    cost: {
      type: Number,
      min: [0, 'Cost cannot be negative']
    },
    currency: {
      type: String,
      trim: true,
      maxlength: [10, 'Currency cannot exceed 10 characters'],
      default: 'USD'
    },
    orderNumber: {
      type: String,
      trim: true,
      maxlength: [50, 'Order number cannot exceed 50 characters']
    },
    purchaseOrderNumber: {
      type: String,
      trim: true,
      maxlength: [50, 'Purchase order number cannot exceed 50 characters']
    },
    invoiceNumber: {
      type: String,
      trim: true,
      maxlength: [50, 'Invoice number cannot exceed 50 characters']
    }
  },
  maintenanceSchedule: [{
    type: {
      type: String,
      enum: ['PREVENTIVE', 'CORRECTIVE', 'UPGRADE', 'INSPECTION', 'OTHER'],
      required: true
    },
    scheduledDate: {
      type: Date,
      required: true
    },
    completedDate: {
      type: Date,
      default: null
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Maintenance description cannot exceed 500 characters']
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    cost: {
      type: Number,
      min: [0, 'Cost cannot be negative'],
      default: 0
    },
    status: {
      type: String,
      enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED', 'POSTPONED'],
      default: 'SCHEDULED'
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters']
    }
  }],
  attachments: [{
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Attachment name cannot exceed 100 characters']
    },
    path: {
      type: String,
      required: true,
      trim: true
    },
    mimeType: {
      type: String,
      required: true,
      trim: true
    },
    size: {
      type: Number,
      required: true,
      min: [0, 'Size cannot be negative']
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters']
    }
  }],
  notes: [{
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1000, 'Note cannot exceed 1000 characters']
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
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
  installedSoftware: [{
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Software name cannot exceed 100 characters']
    },
    version: {
      type: String,
      trim: true,
      maxlength: [50, 'Version cannot exceed 50 characters']
    },
    licenseKey: {
      type: String,
      trim: true,
      maxlength: [100, 'License key cannot exceed 100 characters']
    },
    licenseExpiryDate: {
      type: Date,
      default: null
    },
    installationDate: {
      type: Date,
      default: Date.now
    },
    installedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  }],
  networkInfo: {
    hostname: {
      type: String,
      trim: true,
      maxlength: [100, 'Hostname cannot exceed 100 characters']
    },
    domain: {
      type: String,
      trim: true,
      maxlength: [100, 'Domain cannot exceed 100 characters']
    },
    subnet: {
      type: String,
      trim: true,
      maxlength: [50, 'Subnet cannot exceed 50 characters']
    },
    gateway: {
      type: String,
      trim: true,
      match: [/^(\d{1,3}\.){3}\d{1,3}$/, 'Please provide a valid gateway IP address']
    },
    dns: [{
      type: String,
      trim: true,
      match: [/^(\d{1,3}\.){3}\d{1,3}$/, 'Please provide a valid DNS IP address']
    }]
  },
  customFields: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  decommissionInfo: {
    date: {
      type: Date,
      default: null
    },
    reason: {
      type: String,
      trim: true,
      maxlength: [500, 'Decommission reason cannot exceed 500 characters']
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    disposalMethod: {
      type: String,
      enum: ['RECYCLED', 'DONATED', 'SOLD', 'DESTROYED', 'RETURNED', 'OTHER'],
      default: null
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters']
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

/**
 * Virtual for equipment age in days
 */
equipmentSchema.virtual('ageInDays').get(function() {
  if (!this.purchaseDate) return null;
  const now = new Date();
  const diffTime = Math.abs(now - this.purchaseDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

/**
 * Virtual for warranty status
 */
equipmentSchema.virtual('warrantyStatus').get(function() {
  if (!this.warrantyExpiryDate) return 'UNKNOWN';
  const now = new Date();
  if (now > this.warrantyExpiryDate) return 'EXPIRED';
  
  // Calculate days remaining in warranty
  const diffTime = Math.abs(this.warrantyExpiryDate - now);
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (daysRemaining <= 30) return 'EXPIRING_SOON';
  return 'ACTIVE';
});

/**
 * Virtual for related incidents
 */
equipmentSchema.virtual('relatedIncidents', {
  ref: 'Incident',
  localField: '_id',
  foreignField: 'relatedEquipment'
});

/**
 * Indexes for better query performance
 */
equipmentSchema.index({ name: 'text', serialNumber: 'text', inventoryNumber: 'text', manufacturer: 'text', model: 'text' });
equipmentSchema.index({ 'location.building': 1, 'location.floor': 1, 'location.room': 1 });
equipmentSchema.index({ purchaseDate: 1, warrantyExpiryDate: 1 });
equipmentSchema.index({ 'tags': 1 });

/**
 * Pre-save middleware to handle equipment status changes
 */
equipmentSchema.pre('save', function(next) {
  // If equipment is being decommissioned, update isActive flag
  if (this.isModified('status') && this.status === 'DECOMMISSIONED') {
    this.isActive = false;
    
    // If decommission date is not set, set it to current date
    if (!this.decommissionInfo.date) {
      this.decommissionInfo.date = new Date();
    }
  }
  
  next();
});

/**
 * Static method to find equipment by search term
 * @param {string} searchTerm - Term to search for
 * @returns {Promise<Array>} - Array of matching equipment
 */
equipmentSchema.statics.search = function(searchTerm) {
  return this.find(
    { $text: { $search: searchTerm } },
    { score: { $meta: 'textScore' } }
  ).sort({ score: { $meta: 'textScore' } });
};

/**
 * Static method to find equipment with expiring warranty
 * @param {number} daysThreshold - Number of days threshold
 * @returns {Promise<Array>} - Array of equipment with warranty expiring soon
 */
equipmentSchema.statics.findWithExpiringWarranty = function(daysThreshold = 30) {
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);
  
  return this.find({
    warrantyExpiryDate: {
      $ne: null,
      $lte: thresholdDate,
      $gte: new Date()
    }
  }).sort({ warrantyExpiryDate: 1 });
};

/**
 * Static method to find equipment by department
 * @param {string} department - Department name
 * @returns {Promise<Array>} - Array of equipment in the department
 */
equipmentSchema.statics.findByDepartment = function(department) {
  return this.find({ department: department }).sort({ name: 1 });
};

/**
 * Static method to find equipment by type
 * @param {string} type - Equipment type
 * @returns {Promise<Array>} - Array of equipment of the specified type
 */
equipmentSchema.statics.findByType = function(type) {
  return this.find({ type: type }).sort({ name: 1 });
};

/**
 * Static method to find equipment by status
 * @param {string} status - Equipment status
 * @returns {Promise<Array>} - Array of equipment with the specified status
 */
equipmentSchema.statics.findByStatus = function(status) {
  return this.find({ status: status }).sort({ name: 1 });
};

/**
 * Static method to find equipment assigned to a user
 * @param {ObjectId} userId - User ID
 * @returns {Promise<Array>} - Array of equipment assigned to the user
 */
equipmentSchema.statics.findByAssignedUser = function(userId) {
  return this.find({ assignedTo: userId }).sort({ name: 1 });
};

/**
 * Create the Equipment model
 */
const Equipment = mongoose.model('Equipment', equipmentSchema);

module.exports = Equipment;