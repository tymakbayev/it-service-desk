const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/user.model');

class WebSocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // Map of userId -> socketId
    this.userRoles = new Map(); // Map of userId -> role
  }

  /**
   * Initialize WebSocket server
   * @param {Object} server - HTTP server instance
   */
  initialize(server) {
    this.io = socketIO(server, {
      cors: {
        origin: config.corsOrigin || '*',
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.query.token;
        
        if (!token) {
          return next(new Error('Authentication error: Token not provided'));
        }
        
        // Verify JWT token
        const decoded = jwt.verify(token, config.jwtSecret);
        
        // Get user from database to ensure they exist and get their role
        const user = await User.findById(decoded.id).select('role');
        
        if (!user) {
          return next(new Error('Authentication error: User not found'));
        }
        
        // Attach user data to socket
        socket.userId = decoded.id;
        socket.userRole = user.role;
        
        next();
      } catch (error) {
        console.error('WebSocket authentication error:', error);
        next(new Error('Authentication error: ' + error.message));
      }
    });

    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.userId} (${socket.userRole})`);
      
      // Store user connection
      this.connectedUsers.set(socket.userId, socket.id);
      this.userRoles.set(socket.userId, socket.userRole);
      
      // Join room based on role
      socket.join(`role:${socket.userRole}`);
      
      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.userId}`);
        this.connectedUsers.delete(socket.userId);
        this.userRoles.delete(socket.userId);
      });
      
      // Handle client subscribing to specific incident updates
      socket.on('subscribe:incident', (incidentId) => {
        socket.join(`incident:${incidentId}`);
        console.log(`User ${socket.userId} subscribed to incident ${incidentId}`);
      });
      
      // Handle client unsubscribing from specific incident updates
      socket.on('unsubscribe:incident', (incidentId) => {
        socket.leave(`incident:${incidentId}`);
        console.log(`User ${socket.userId} unsubscribed from incident ${incidentId}`);
      });
    });

    console.log('WebSocket server initialized');
  }

  /**
   * Broadcast message to a specific user
   * @param {string} userId - User ID to send message to
   * @param {Object} data - Data to send
   */
  broadcastToUser(userId, data) {
    try {
      const socketId = this.connectedUsers.get(userId);
      
      if (socketId) {
        this.io.to(socketId).emit('notification', {
          ...data,
          timestamp: new Date()
        });
        return true;
      }
      
      return false; // User not connected
    } catch (error) {
      console.error('Error broadcasting to user:', error);
      return false;
    }
  }

  /**
   * Broadcast message to users with specific role(s)
   * @param {string|string[]} roles - Role or array of roles to send message to
   * @param {Object} data - Data to send
   */
  broadcastToRole(roles, data) {
    try {
      const roleArray = Array.isArray(roles) ? roles : [roles];
      
      roleArray.forEach(role => {
        this.io.to(`role:${role}`).emit('notification', {
          ...data,
          timestamp: new Date()
        });
      });
      
      return true;
    } catch (error) {
      console.error('Error broadcasting to role:', error);
      return false;
    }
  }

  /**
   * Broadcast message to all connected users
   * @param {Object} data - Data to send
   */
  broadcastToAll(data) {
    try {
      this.io.emit('notification', {
        ...data,
        timestamp: new Date()
      });
      
      return true;
    } catch (error) {
      console.error('Error broadcasting to all users:', error);
      return false;
    }
  }
  
  /**
   * Broadcast incident update to subscribers
   * @param {string} incidentId - ID of the incident
   * @param {Object} data - Data to send
   */
  broadcastIncidentUpdate(incidentId, data) {
    try {
      this.io.to(`incident:${incidentId}`).emit('incident:update', {
        ...data,
        incidentId,
        timestamp: new Date()
      });
      
      return true;
    } catch (error) {
      console.error('Error broadcasting incident update:', error);
      return false;
    }
  }
  
  /**
   * Get count of online users
   * @returns {Object} Count of users by role
   */
  getOnlineUsersCount() {
    const counts = {
      total: this.connectedUsers.size,
      byRole: {}
    };
    
    // Count users by role
    for (const role of this.userRoles.values()) {
      counts.byRole[role] = (counts.byRole[role] || 0) + 1;
    }
    
    return counts;
  }
}

// Create singleton instance
const websocketService = new WebSocketService();

module.exports = { websocketService };