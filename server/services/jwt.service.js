const jwt = require('jsonwebtoken');
const config = require('../config/config');

/**
 * Service for handling JWT token operations
 */
class JWTService {
  /**
   * Generate JWT access and refresh tokens for a user
   * @param {Object} user - User object containing user information
   * @param {String} user._id - User ID
   * @param {String} user.email - User email
   * @param {String} user.role - User role (admin, technician, user)
   * @returns {Object} Object containing access and refresh tokens
   */
  generateToken(user) {
    try {
      // Payload for the token
      const payload = {
        sub: user._id,
        email: user.email,
        role: user.role
      };

      // Generate access token with shorter expiration
      const accessToken = jwt.sign(
        payload,
        config.jwt.accessTokenSecret,
        { expiresIn: config.jwt.accessTokenExpiry }
      );

      // Generate refresh token with longer expiration
      const refreshToken = jwt.sign(
        { sub: user._id },
        config.jwt.refreshTokenSecret,
        { expiresIn: config.jwt.refreshTokenExpiry }
      );

      return {
        accessToken,
        refreshToken
      };
    } catch (error) {
      console.error('Error generating JWT token:', error);
      throw new Error('Failed to generate authentication tokens');
    }
  }

  /**
   * Verify and decode a JWT token
   * @param {String} token - JWT token to verify
   * @param {Boolean} isRefreshToken - Whether the token is a refresh token
   * @returns {Object} Decoded token payload
   * @throws {Error} If token is invalid or expired
   */
  verifyToken(token, isRefreshToken = false) {
    try {
      const secret = isRefreshToken 
        ? config.jwt.refreshTokenSecret 
        : config.jwt.accessTokenSecret;
      
      const decoded = jwt.verify(token, secret);
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token has expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token');
      } else {
        console.error('Error verifying token:', error);
        throw new Error('Failed to verify token');
      }
    }
  }

  /**
   * Generate new access token using refresh token
   * @param {String} refreshToken - Refresh token
   * @param {Object} user - User object with updated information
   * @returns {Object} Object containing new access token
   * @throws {Error} If refresh token is invalid or expired
   */
  async refreshToken(refreshToken, user) {
    try {
      // Verify the refresh token
      const decoded = this.verifyToken(refreshToken, true);
      
      // Check if the user ID in the token matches the provided user
      if (decoded.sub !== user._id.toString()) {
        throw new Error('Invalid refresh token for this user');
      }
      
      // Generate a new access token
      const payload = {
        sub: user._id,
        email: user.email,
        role: user.role
      };
      
      const accessToken = jwt.sign(
        payload,
        config.jwt.accessTokenSecret,
        { expiresIn: config.jwt.accessTokenExpiry }
      );
      
      return { accessToken };
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
  }

  /**
   * Extract token from authorization header
   * @param {Object} req - Express request object
   * @returns {String|null} Extracted token or null if not found
   */
  extractTokenFromHeader(req) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    return authHeader.substring(7); // Remove 'Bearer ' prefix
  }
}

module.exports = new JWTService();