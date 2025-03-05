const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

/**
 * User Schema
 * Defines the structure for user documents in the database
 */
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false // Don't return password by default in queries
  },
  firstName: {
    type: String,
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  role: {
    type: String,
    enum: Object.values(config.ROLES),
    default: config.ROLES.USER
  },
  department: {
    type: String,
    trim: true,
    maxlength: [100, 'Department name cannot exceed 100 characters']
  },
  position: {
    type: String,
    trim: true,
    maxlength: [100, 'Position name cannot exceed 100 characters']
  },
  phoneNumber: {
    type: String,
    trim: true,
    maxlength: [20, 'Phone number cannot exceed 20 characters']
  },
  profileImage: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  passwordChangedAt: Date,
  refreshToken: String,
  refreshTokenExpires: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

/**
 * Virtual for user's full name
 */
userSchema.virtual('fullName').get(function() {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  if (this.firstName) return this.firstName;
  if (this.lastName) return this.lastName;
  return this.username;
});

/**
 * Virtual to get assigned incidents
 */
userSchema.virtual('assignedIncidents', {
  ref: 'Incident',
  localField: '_id',
  foreignField: 'assignedTo'
});

/**
 * Virtual to get reported incidents
 */
userSchema.virtual('reportedIncidents', {
  ref: 'Incident',
  localField: '_id',
  foreignField: 'reportedBy'
});

/**
 * Virtual to get assigned equipment
 */
userSchema.virtual('assignedEquipment', {
  ref: 'Equipment',
  localField: '_id',
  foreignField: 'assignedTo'
});

/**
 * Pre-save middleware to hash password before saving
 */
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Generate a salt
    const salt = await bcrypt.genSalt(config.BCRYPT_SALT_ROUNDS);
    
    // Hash the password with the salt
    this.password = await bcrypt.hash(this.password, salt);
    
    // Update passwordChangedAt field if password is changed
    if (!this.isNew) {
      this.passwordChangedAt = Date.now() - 1000; // Subtract 1 second to ensure token is created after password change
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Compare provided password with stored hashed password
 * @param {string} candidatePassword - The password to check
 * @returns {Promise<boolean>} - True if passwords match, false otherwise
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Generate JWT token for authentication
 * @returns {string} JWT token
 */
userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { 
      id: this._id,
      role: this.role,
      email: this.email
    },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRES_IN }
  );
};

/**
 * Generate refresh token
 * @returns {string} Refresh token
 */
userSchema.methods.generateRefreshToken = function() {
  const refreshToken = jwt.sign(
    { id: this._id },
    config.JWT_REFRESH_SECRET,
    { expiresIn: config.JWT_REFRESH_EXPIRES_IN }
  );
  
  // Save refresh token and expiry to user document
  this.refreshToken = refreshToken;
  this.refreshTokenExpires = new Date(
    Date.now() + parseInt(config.JWT_REFRESH_EXPIRES_IN) * 1000
  );
  
  return refreshToken;
};

/**
 * Check if password was changed after token was issued
 * @param {number} JWTTimestamp - Timestamp when JWT was issued
 * @returns {boolean} - True if password was changed after token issue
 */
userSchema.methods.passwordChangedAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

/**
 * Generate password reset token
 * @returns {string} Password reset token
 */
userSchema.methods.createPasswordResetToken = function() {
  // Generate random token
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  // Hash token and save to user document
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  // Set expiry time (10 minutes)
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  
  return resetToken;
};

/**
 * Check if user has permission for a specific action
 * @param {string[]} allowedRoles - Array of roles allowed to perform the action
 * @returns {boolean} - True if user has permission
 */
userSchema.methods.hasPermission = function(allowedRoles) {
  return allowedRoles.includes(this.role);
};

/**
 * Get user profile data (safe to send to client)
 * @returns {Object} User profile data
 */
userSchema.methods.getProfile = function() {
  return {
    id: this._id,
    username: this.username,
    email: this.email,
    firstName: this.firstName,
    lastName: this.lastName,
    fullName: this.fullName,
    role: this.role,
    department: this.department,
    position: this.position,
    profileImage: this.profileImage,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

/**
 * Static method to find user by email
 * @param {string} email - User email
 * @returns {Promise<User>} User document
 */
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email });
};

/**
 * Static method to find user by username
 * @param {string} username - Username
 * @returns {Promise<User>} User document
 */
userSchema.statics.findByUsername = function(username) {
  return this.findOne({ username });
};

/**
 * Static method to find active users by role
 * @param {string} role - User role
 * @returns {Promise<User[]>} Array of user documents
 */
userSchema.statics.findActiveByRole = function(role) {
  return this.find({ role, isActive: true });
};

/**
 * Static method to find users by department
 * @param {string} department - Department name
 * @returns {Promise<User[]>} Array of user documents
 */
userSchema.statics.findByDepartment = function(department) {
  return this.find({ department });
};

/**
 * Create User model from schema
 */
const User = mongoose.model('User', userSchema);

module.exports = User;