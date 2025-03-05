/**
 * Auth module type definitions
 * This file contains all type definitions related to authentication and user management
 */

// User roles enum
export const UserRoles = {
  ADMIN: 'ADMIN',
  TECHNICIAN: 'TECHNICIAN',
  USER: 'USER'
};

// Permission levels
export const Permissions = {
  READ: 'read',
  WRITE: 'write',
  DELETE: 'delete',
  MANAGE_USERS: 'manage_users',
  GENERATE_REPORTS: 'generate_reports',
  ASSIGN_INCIDENTS: 'assign_incidents',
  MANAGE_EQUIPMENT: 'manage_equipment'
};

// Role to permissions mapping
export const RolePermissions = {
  [UserRoles.ADMIN]: [
    Permissions.READ,
    Permissions.WRITE,
    Permissions.DELETE,
    Permissions.MANAGE_USERS,
    Permissions.GENERATE_REPORTS,
    Permissions.ASSIGN_INCIDENTS,
    Permissions.MANAGE_EQUIPMENT
  ],
  [UserRoles.TECHNICIAN]: [
    Permissions.READ,
    Permissions.WRITE,
    Permissions.ASSIGN_INCIDENTS,
    Permissions.MANAGE_EQUIPMENT,
    Permissions.GENERATE_REPORTS
  ],
  [UserRoles.USER]: [
    Permissions.READ,
    Permissions.WRITE
  ]
};

/**
 * User interface
 * @typedef {Object} User
 * @property {string} id - User ID
 * @property {string} username - Username
 * @property {string} email - User email
 * @property {string} role - User role (ADMIN, TECHNICIAN, USER)
 * @property {string} [firstName] - User first name (optional)
 * @property {string} [lastName] - User last name (optional)
 * @property {string} [department] - User department (optional)
 * @property {string} [position] - User position (optional)
 * @property {string} [avatar] - User avatar URL (optional)
 * @property {string} createdAt - User creation date
 * @property {string} updatedAt - User last update date
 */

/**
 * Authentication state interface
 * @typedef {Object} AuthState
 * @property {User|null} user - Current user data
 * @property {string|null} token - JWT token
 * @property {boolean} isAuthenticated - Authentication status
 * @property {boolean} loading - Loading status
 * @property {string|null} error - Error message
 * @property {string|null} successMessage - Success message
 * @property {string|null} passwordResetToken - Password reset token
 * @property {string|null} passwordResetEmail - Email for password reset
 * @property {Array<string>} roles - Available roles
 * @property {Array<string>} permissions - User permissions
 */

/**
 * Login credentials interface
 * @typedef {Object} LoginCredentials
 * @property {string} email - User email
 * @property {string} password - User password
 * @property {boolean} [rememberMe] - Remember user session
 */

/**
 * Registration data interface
 * @typedef {Object} RegisterData
 * @property {string} email - User email
 * @property {string} password - User password
 * @property {string} username - Username
 * @property {string} [firstName] - User first name (optional)
 * @property {string} [lastName] - User last name (optional)
 * @property {string} [role] - User role (optional, defaults to USER)
 * @property {string} [department] - User department (optional)
 * @property {string} [position] - User position (optional)
 */

/**
 * Password change data interface
 * @typedef {Object} PasswordChangeData
 * @property {string} currentPassword - Current password
 * @property {string} newPassword - New password
 * @property {string} confirmPassword - Confirm new password
 */

/**
 * Password reset data interface
 * @typedef {Object} PasswordResetData
 * @property {string} token - Reset token
 * @property {string} password - New password
 * @property {string} confirmPassword - Confirm new password
 */

/**
 * Profile update data interface
 * @typedef {Object} ProfileUpdateData
 * @property {string} [firstName] - User first name
 * @property {string} [lastName] - User last name
 * @property {string} [department] - User department
 * @property {string} [position] - User position
 * @property {string} [avatar] - User avatar URL
 */

/**
 * Authentication response interface
 * @typedef {Object} AuthResponse
 * @property {User} user - User data
 * @property {string} token - JWT token
 * @property {Array<string>} [permissions] - User permissions
 */

/**
 * Forgot password request interface
 * @typedef {Object} ForgotPasswordRequest
 * @property {string} email - User email
 */

/**
 * Forgot password response interface
 * @typedef {Object} ForgotPasswordResponse
 * @property {boolean} success - Success status
 * @property {string} message - Response message
 * @property {string} [token] - Reset token (for development only)
 */

/**
 * Verify email request interface
 * @typedef {Object} VerifyEmailRequest
 * @property {string} token - Verification token
 */

/**
 * Verify email response interface
 * @typedef {Object} VerifyEmailResponse
 * @property {boolean} success - Success status
 * @property {string} message - Response message
 */

/**
 * User session interface
 * @typedef {Object} UserSession
 * @property {string} id - Session ID
 * @property {string} userId - User ID
 * @property {string} userAgent - User agent
 * @property {string} ipAddress - IP address
 * @property {string} lastActive - Last active timestamp
 * @property {boolean} isActive - Session active status
 */

// Export all types for use in other modules
export default {
  UserRoles,
  Permissions,
  RolePermissions
};