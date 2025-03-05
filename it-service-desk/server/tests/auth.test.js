const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const app = require('../app');
const User = require('../models/user.model');
const Role = require('../models/role.model');
const config = require('../config/config');
const database = require('../config/database');

// Mock services
jest.mock('../services/email.service');
jest.mock('../services/notification.service');

describe('Authentication API', () => {
  let adminUser;
  let technicianUser;
  let regularUser;
  let adminToken;
  let technicianToken;
  let regularToken;

  // Setup database connection before all tests
  beforeAll(async () => {
    await database.connect();
    
    // Clear users collection
    await User.deleteMany({});
    
    // Create test roles if they don't exist
    const roles = [
      { name: config.ROLES.ADMIN, description: 'Administrator with full access' },
      { name: config.ROLES.TECHNICIAN, description: 'IT support technician' },
      { name: config.ROLES.USER, description: 'Regular user' }
    ];
    
    for (const role of roles) {
      await Role.findOneAndUpdate(
        { name: role.name },
        role,
        { upsert: true, new: true }
      );
    }
    
    // Create test users
    const adminRole = await Role.findOne({ name: config.ROLES.ADMIN });
    const technicianRole = await Role.findOne({ name: config.ROLES.TECHNICIAN });
    const userRole = await Role.findOne({ name: config.ROLES.USER });
    
    const hashedPassword = await bcrypt.hash('Password123!', 10);
    
    adminUser = await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: adminRole._id,
      department: 'IT',
      position: 'System Administrator'
    });
    
    technicianUser = await User.create({
      username: 'technician',
      email: 'tech@example.com',
      password: hashedPassword,
      firstName: 'Tech',
      lastName: 'Support',
      role: technicianRole._id,
      department: 'IT',
      position: 'Support Specialist'
    });
    
    regularUser = await User.create({
      username: 'user',
      email: 'user@example.com',
      password: hashedPassword,
      firstName: 'Regular',
      lastName: 'User',
      role: userRole._id,
      department: 'Marketing',
      position: 'Marketing Specialist'
    });
    
    // Generate tokens for test users
    adminToken = jwt.sign(
      { id: adminUser._id, role: config.ROLES.ADMIN },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN }
    );
    
    technicianToken = jwt.sign(
      { id: technicianUser._id, role: config.ROLES.TECHNICIAN },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN }
    );
    
    regularToken = jwt.sign(
      { id: regularUser._id, role: config.ROLES.USER },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN }
    );
  });
  
  // Close database connection after all tests
  afterAll(async () => {
    await User.deleteMany({});
    await database.disconnect();
  });
  
  describe('POST /api/v1/auth/login', () => {
    it('should login with valid credentials and return token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'user@example.com',
          password: 'Password123!'
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', 'user@example.com');
      expect(response.body.user).not.toHaveProperty('password');
    });
    
    it('should return 401 with invalid email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123!'
        });
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Invalid credentials');
    });
    
    it('should return 401 with invalid password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'user@example.com',
          password: 'WrongPassword123!'
        });
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Invalid credentials');
    });
    
    it('should return 400 with missing email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          password: 'Password123!'
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
    
    it('should return 400 with missing password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'user@example.com'
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
    
    it('should return 400 with invalid email format', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'invalid-email',
          password: 'Password123!'
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });
  
  describe('POST /api/v1/auth/register', () => {
    it('should register a new user with valid data', async () => {
      const newUser = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'Password123!',
        firstName: 'New',
        lastName: 'User',
        department: 'Finance',
        position: 'Accountant'
      };
      
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(newUser);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', newUser.email);
      expect(response.body.user).toHaveProperty('username', newUser.username);
      expect(response.body.user).not.toHaveProperty('password');
      expect(response.body).toHaveProperty('token');
      
      // Verify user was created in database
      const createdUser = await User.findOne({ email: newUser.email });
      expect(createdUser).toBeTruthy();
      expect(createdUser.username).toBe(newUser.username);
    });
    
    it('should return 400 when registering with existing email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: 'anotheruser',
          email: 'user@example.com', // Already exists
          password: 'Password123!',
          firstName: 'Another',
          lastName: 'User'
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Email already in use');
    });
    
    it('should return 400 when registering with existing username', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: 'user', // Already exists
          email: 'different@example.com',
          password: 'Password123!',
          firstName: 'Different',
          lastName: 'User'
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Username already in use');
    });
    
    it('should return 400 when registering with weak password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: 'weakpassuser',
          email: 'weak@example.com',
          password: 'weak', // Too weak
          firstName: 'Weak',
          lastName: 'Password'
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Password');
    });
    
    it('should return 400 when registering with invalid email format', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: 'invalidemail',
          email: 'not-an-email',
          password: 'Password123!',
          firstName: 'Invalid',
          lastName: 'Email'
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('email');
    });
    
    it('should return 400 when missing required fields', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: 'missingfields',
          // Missing email and password
          firstName: 'Missing',
          lastName: 'Fields'
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });
  
  describe('POST /api/v1/auth/forgot-password', () => {
    it('should send reset password email for valid user', async () => {
      const response = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({
          email: 'user@example.com'
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('reset link');
    });
    
    it('should return 200 even for non-existent email for security', async () => {
      const response = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({
          email: 'nonexistent@example.com'
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('reset link');
    });
    
    it('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({
          email: 'not-an-email'
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });
  
  describe('POST /api/v1/auth/reset-password', () => {
    let resetToken;
    
    beforeEach(async () => {
      // Generate a valid reset token for testing
      resetToken = jwt.sign(
        { id: regularUser._id, purpose: 'password-reset' },
        config.JWT_SECRET,
        { expiresIn: '1h' }
      );
      
      // Save reset token to user
      await User.findByIdAndUpdate(regularUser._id, {
        resetPasswordToken: resetToken,
        resetPasswordExpires: Date.now() + 3600000 // 1 hour
      });
    });
    
    it('should reset password with valid token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({
          token: resetToken,
          password: 'NewPassword123!'
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('successfully');
      
      // Verify password was updated
      const updatedUser = await User.findById(regularUser._id);
      const passwordMatches = await bcrypt.compare('NewPassword123!', updatedUser.password);
      expect(passwordMatches).toBe(true);
      expect(updatedUser.resetPasswordToken).toBeUndefined();
      expect(updatedUser.resetPasswordExpires).toBeUndefined();
    });
    
    it('should return 400 with invalid token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({
          token: 'invalid-token',
          password: 'NewPassword123!'
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Invalid or expired');
    });
    
    it('should return 400 with expired token', async () => {
      // Set token as expired
      await User.findByIdAndUpdate(regularUser._id, {
        resetPasswordExpires: Date.now() - 3600000 // 1 hour ago
      });
      
      const response = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({
          token: resetToken,
          password: 'NewPassword123!'
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Invalid or expired');
    });
    
    it('should return 400 with weak password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({
          token: resetToken,
          password: 'weak'
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Password');
    });
  });
  
  describe('GET /api/v1/auth/me', () => {
    it('should return user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${regularToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', regularUser._id.toString());
      expect(response.body).toHaveProperty('email', regularUser.email);
      expect(response.body).toHaveProperty('username', regularUser.username);
      expect(response.body).not.toHaveProperty('password');
    });
    
    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me');
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('No auth token');
    });
    
    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid-token');
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Invalid token');
    });
  });
  
  describe('PUT /api/v1/auth/me', () => {
    it('should update user profile with valid data', async () => {
      const updatedData = {
        firstName: 'Updated',
        lastName: 'Name',
        department: 'Updated Department',
        position: 'Updated Position'
      };
      
      const response = await request(app)
        .put('/api/v1/auth/me')
        .set('Authorization', `Bearer ${regularToken}`)
        .send(updatedData);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('firstName', updatedData.firstName);
      expect(response.body).toHaveProperty('lastName', updatedData.lastName);
      expect(response.body).toHaveProperty('department', updatedData.department);
      expect(response.body).toHaveProperty('position', updatedData.position);
      
      // Verify database was updated
      const updatedUser = await User.findById(regularUser._id);
      expect(updatedUser.firstName).toBe(updatedData.firstName);
      expect(updatedUser.lastName).toBe(updatedData.lastName);
    });
    
    it('should not allow updating email to an existing one', async () => {
      const response = await request(app)
        .put('/api/v1/auth/me')
        .set('Authorization', `Bearer ${regularToken}`)
        .send({
          email: 'admin@example.com' // Already exists
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Email already in use');
    });
    
    it('should not allow updating username to an existing one', async () => {
      const response = await request(app)
        .put('/api/v1/auth/me')
        .set('Authorization', `Bearer ${regularToken}`)
        .send({
          username: 'admin' // Already exists
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Username already in use');
    });
    
    it('should return 401 without token', async () => {
      const response = await request(app)
        .put('/api/v1/auth/me')
        .send({
          firstName: 'Updated'
        });
      
      expect(response.status).toBe(401);
    });
  });
  
  describe('PUT /api/v1/auth/change-password', () => {
    it('should change password with valid current password', async () => {
      const response = await request(app)
        .put('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${regularToken}`)
        .send({
          currentPassword: 'Password123!',
          newPassword: 'NewPassword456!'
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('successfully');
      
      // Verify password was updated
      const updatedUser = await User.findById(regularUser._id);
      const passwordMatches = await bcrypt.compare('NewPassword456!', updatedUser.password);
      expect(passwordMatches).toBe(true);
    });
    
    it('should return 400 with incorrect current password', async () => {
      const response = await request(app)
        .put('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${regularToken}`)
        .send({
          currentPassword: 'WrongPassword!',
          newPassword: 'NewPassword456!'
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Current password is incorrect');
    });
    
    it('should return 400 with weak new password', async () => {
      const response = await request(app)
        .put('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${regularToken}`)
        .send({
          currentPassword: 'Password123!',
          newPassword: 'weak'
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Password');
    });
    
    it('should return 401 without token', async () => {
      const response = await request(app)
        .put('/api/v1/auth/change-password')
        .send({
          currentPassword: 'Password123!',
          newPassword: 'NewPassword456!'
        });
      
      expect(response.status).toBe(401);
    });
  });
  
  describe('GET /api/v1/auth/users', () => {
    it('should return all users for admin', async () => {
      const response = await request(app)
        .get('/api/v1/auth/users')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('email');
      expect(response.body[0]).not.toHaveProperty('password');
    });
    
    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .get('/api/v1/auth/users')
        .set('Authorization', `Bearer ${regularToken}`);
      
      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('not authorized');
    });
    
    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/v1/auth/users?page=1&limit=2')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.users)).toBe(true);
      expect(response.body.users.length).toBeLessThanOrEqual(2);
      expect(response.body).toHaveProperty('totalPages');
      expect(response.body).toHaveProperty('currentPage', 1);
      expect(response.body).toHaveProperty('totalUsers');
    });
    
    it('should support filtering by role', async () => {
      const response = await request(app)
        .get(`/api/v1/auth/users?role=${config.ROLES.ADMIN}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.users)).toBe(true);
      expect(response.body.users.length).toBeGreaterThan(0);
      expect(response.body.users[0].role.name).toBe(config.ROLES.ADMIN);
    });
  });
  
  describe('GET /api/v1/auth/users/:id', () => {
    it('should return user by id for admin', async () => {
      const response = await request(app)
        .get(`/api/v1/auth/users/${regularUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('email', regularUser.email);
      expect(response.body).toHaveProperty('username', regularUser.username);
      expect(response.body).not.toHaveProperty('password');
    });
    
    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .get(`/api/v1/auth/users/${adminUser._id}`)
        .set('Authorization', `Bearer ${regularToken}`);
      
      expect(response.status).toBe(403);
    });
    
    it('should return 404 for non-existent user', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/v1/auth/users/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('not found');
    });
  });
  
  describe('PUT /api/v1/auth/users/:id', () => {
    it('should update user by id for admin', async () => {
      const updatedData = {
        firstName: 'Admin Updated',
        lastName: 'User Updated',
        department: 'Updated Department',
        position: 'Updated Position'
      };
      
      const response = await request(app)
        .put(`/api/v1/auth/users/${regularUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updatedData);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('firstName', updatedData.firstName);
      expect(response.body).toHaveProperty('lastName', updatedData.lastName);
      expect(response.body).toHaveProperty('department', updatedData.department);
      expect(response.body).toHaveProperty('position', updatedData.position);
      
      // Verify database was updated
      const updatedUser = await User.findById(regularUser._id);
      expect(updatedUser.firstName).toBe(updatedData.firstName);
      expect(updatedUser.lastName).toBe(updatedData.lastName);
    });
    
    it('should allow admin to change user role', async () => {
      const technicianRole = await Role.findOne({ name: config.ROLES.TECHNICIAN });
      
      const response = await request(app)
        .put(`/api/v1/auth/users/${regularUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          role: technicianRole._id
        });
      
      expect(response.status).toBe(200);
      expect(response.body.role.name).toBe(config.ROLES.TECHNICIAN);
      
      // Verify database was updated
      const updatedUser = await User.findById(regularUser._id).populate('role');
      expect(updatedUser.role.name).toBe(config.ROLES.TECHNICIAN);
    });
    
    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .put(`/api/v1/auth/users/${adminUser._id}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .send({
          firstName: 'Should Not Update'
        });
      
      expect(response.status).toBe(403);
    });
    
    it('should return 404 for non-existent user', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/api/v1/auth/users/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          firstName: 'Should Not Update'
        });
      
      expect(response.status).toBe(404);
    });
  });
  
  describe('DELETE /api/v1/auth/users/:id', () => {
    let userToDelete;
    
    beforeEach(async () => {
      // Create a user to delete
      const userRole = await Role.findOne({ name: config.ROLES.USER });
      const hashedPassword = await bcrypt.hash('Password123!', 10);
      
      userToDelete = await User.create({
        username: 'todelete',
        email: 'delete@example.com',
        password: hashedPassword,
        firstName: 'To',
        lastName: 'Delete',
        role: userRole._id
      });
    });
    
    it('should delete user by id for admin', async () => {
      const response = await request(app)
        .delete(`/api/v1/auth/users/${userToDelete._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('successfully deleted');
      
      // Verify user was deleted
      const deletedUser = await User.findById(userToDelete._id);
      expect(deletedUser).toBeNull();
    });
    
    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .delete(`/api/v1/auth/users/${userToDelete._id}`)
        .set('Authorization', `Bearer ${regularToken}`);
      
      expect(response.status).toBe(403);
      
      // Verify user was not deleted
      const notDeletedUser = await User.findById(userToDelete._id);
      expect(notDeletedUser).toBeTruthy();
    });
    
    it('should return 404 for non-existent user', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/v1/auth/users/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(404);
    });
    
    it('should not allow deleting the last admin user', async () => {
      // Try to delete the admin user
      const response = await request(app)
        .delete(`/api/v1/auth/users/${adminUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Cannot delete the last admin');
      
      // Verify admin was not deleted
      const notDeletedAdmin = await User.findById(adminUser._id);
      expect(notDeletedAdmin).toBeTruthy();
    });
  });
  
  describe('POST /api/v1/auth/logout', () => {
    it('should successfully logout user', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${regularToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('successfully');
    });
    
    it('should return 200 even without token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout');
      
      expect(response.status).toBe(200);
    });
  });
  
  describe('POST /api/v1/auth/refresh-token', () => {
    let refreshToken;
    
    beforeEach(async () => {
      // Generate a valid refresh token for testing
      refreshToken = jwt.sign(
        { id: regularUser._id, tokenType: 'refresh' },
        config.JWT_REFRESH_SECRET,
        { expiresIn: config.JWT_REFRESH_EXPIRES_IN }
      );
      
      // Save refresh token to user
      await User.findByIdAndUpdate(regularUser._id, {
        refreshToken: refreshToken
      });
    });
    
    it('should issue new access token with valid refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({
          refreshToken: refreshToken
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.id).toBe(regularUser._id.toString());
    });
    
    it('should return 401 with invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({
          refreshToken: 'invalid-token'
        });
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Invalid refresh token');
    });
    
    it('should return 401 with expired refresh token', async () => {
      // Create an expired token
      const expiredToken = jwt.sign(
        { id: regularUser._id, tokenType: 'refresh' },
        config.JWT_REFRESH_SECRET,
        { expiresIn: '0s' }
      );
      
      // Wait for token to expire
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const response = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({
          refreshToken: expiredToken
        });
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('token');
    });
    
    it('should return 400 with missing refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({});
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('required');
    });
  });
});