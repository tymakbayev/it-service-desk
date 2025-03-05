const mongoose = require('mongoose');
const config = require('../config/config');

/**
 * Role Schema
 * Defines the structure for role documents in the database
 * This model manages user roles and their associated permissions
 */
const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Role name is required'],
    unique: true,
    trim: true,
    uppercase: true,
    enum: Object.values(config.ROLES),
    maxlength: [50, 'Role name cannot exceed 50 characters']
  },
  description: {
    type: String,
    required: [true, 'Role description is required'],
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  permissions: [{
    resource: {
      type: String,
      required: true,
      enum: ['INCIDENTS', 'EQUIPMENT', 'USERS', 'REPORTS', 'DASHBOARD', 'NOTIFICATIONS', 'SETTINGS'],
      trim: true
    },
    actions: [{
      type: String,
      required: true,
      enum: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'EXPORT', 'IMPORT', 'ASSIGN', 'APPROVE'],
      trim: true
    }]
  }],
  isDefault: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  priority: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

/**
 * Virtual for users with this role
 */
roleSchema.virtual('users', {
  ref: 'User',
  localField: 'name',
  foreignField: 'role'
});

/**
 * Indexes for optimizing queries
 */
roleSchema.index({ name: 1 }, { unique: true });
roleSchema.index({ isDefault: 1 });
roleSchema.index({ isActive: 1 });

/**
 * Static method to get the default role
 * @returns {Promise<Object>} Default role document
 */
roleSchema.statics.getDefaultRole = async function() {
  return this.findOne({ isDefault: true });
};

/**
 * Static method to get role by name
 * @param {string} roleName - The name of the role to find
 * @returns {Promise<Object>} Role document
 */
roleSchema.statics.findByName = async function(roleName) {
  return this.findOne({ name: roleName.toUpperCase() });
};

/**
 * Method to check if role has specific permission
 * @param {string} resource - The resource to check permission for
 * @param {string} action - The action to check permission for
 * @returns {boolean} True if role has permission, false otherwise
 */
roleSchema.methods.hasPermission = function(resource, action) {
  const permission = this.permissions.find(p => p.resource === resource);
  if (!permission) return false;
  return permission.actions.includes(action);
};

/**
 * Method to add permission to role
 * @param {string} resource - The resource to add permission for
 * @param {string} action - The action to add permission for
 * @returns {Object} Updated role document
 */
roleSchema.methods.addPermission = function(resource, action) {
  const permission = this.permissions.find(p => p.resource === resource);
  
  if (permission) {
    if (!permission.actions.includes(action)) {
      permission.actions.push(action);
    }
  } else {
    this.permissions.push({
      resource,
      actions: [action]
    });
  }
  
  return this;
};

/**
 * Method to remove permission from role
 * @param {string} resource - The resource to remove permission for
 * @param {string} action - The action to remove permission for
 * @returns {Object} Updated role document
 */
roleSchema.methods.removePermission = function(resource, action) {
  const permission = this.permissions.find(p => p.resource === resource);
  
  if (permission) {
    permission.actions = permission.actions.filter(a => a !== action);
    
    // Remove the resource if no actions remain
    if (permission.actions.length === 0) {
      this.permissions = this.permissions.filter(p => p.resource !== resource);
    }
  }
  
  return this;
};

/**
 * Pre-save middleware to ensure system roles cannot be modified
 */
roleSchema.pre('save', function(next) {
  // Prevent modification of system roles (ADMIN, TECHNICIAN, USER)
  if (this.isModified('name') && this._id) {
    const systemRoles = [config.ROLES.ADMIN, config.ROLES.TECHNICIAN, config.ROLES.USER];
    const originalRole = this.constructor.findById(this._id);
    
    if (originalRole && systemRoles.includes(originalRole.name)) {
      return next(new Error('System roles cannot be modified'));
    }
  }
  
  next();
});

/**
 * Pre-remove middleware to prevent deletion of system roles
 */
roleSchema.pre('remove', function(next) {
  const systemRoles = [config.ROLES.ADMIN, config.ROLES.TECHNICIAN, config.ROLES.USER];
  
  if (systemRoles.includes(this.name)) {
    return next(new Error('System roles cannot be deleted'));
  }
  
  next();
});

/**
 * Create default roles if they don't exist
 */
roleSchema.statics.createDefaultRoles = async function() {
  const roles = [
    {
      name: config.ROLES.ADMIN,
      description: 'Administrator with full access to all system features',
      permissions: [
        { resource: 'INCIDENTS', actions: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'EXPORT', 'IMPORT', 'ASSIGN', 'APPROVE'] },
        { resource: 'EQUIPMENT', actions: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'EXPORT', 'IMPORT', 'ASSIGN'] },
        { resource: 'USERS', actions: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'EXPORT', 'IMPORT'] },
        { resource: 'REPORTS', actions: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'EXPORT'] },
        { resource: 'DASHBOARD', actions: ['READ'] },
        { resource: 'NOTIFICATIONS', actions: ['CREATE', 'READ', 'UPDATE', 'DELETE'] },
        { resource: 'SETTINGS', actions: ['READ', 'UPDATE'] }
      ],
      isDefault: false,
      isActive: true,
      priority: 100
    },
    {
      name: config.ROLES.TECHNICIAN,
      description: 'IT support technician with access to manage incidents and equipment',
      permissions: [
        { resource: 'INCIDENTS', actions: ['CREATE', 'READ', 'UPDATE', 'ASSIGN'] },
        { resource: 'EQUIPMENT', actions: ['CREATE', 'READ', 'UPDATE', 'ASSIGN'] },
        { resource: 'USERS', actions: ['READ'] },
        { resource: 'REPORTS', actions: ['READ', 'EXPORT'] },
        { resource: 'DASHBOARD', actions: ['READ'] },
        { resource: 'NOTIFICATIONS', actions: ['READ'] }
      ],
      isDefault: false,
      isActive: true,
      priority: 50
    },
    {
      name: config.ROLES.USER,
      description: 'Regular user with limited access to report incidents and view assigned equipment',
      permissions: [
        { resource: 'INCIDENTS', actions: ['CREATE', 'READ'] },
        { resource: 'EQUIPMENT', actions: ['READ'] },
        { resource: 'NOTIFICATIONS', actions: ['READ'] }
      ],
      isDefault: true,
      isActive: true,
      priority: 10
    }
  ];

  for (const role of roles) {
    await this.findOneAndUpdate(
      { name: role.name },
      role,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
};

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;