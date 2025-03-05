/**
 * IT Service Desk - Test Suite
 * 
 * This file contains comprehensive test suites for both client and server components
 * of the IT Service Desk application. It includes unit tests, integration tests,
 * and utility functions for testing.
 * 
 * The tests cover:
 * - Authentication flows
 * - Incident management
 * - Equipment tracking
 * - Dashboard functionality
 * - Notification system
 * - Report generation
 * 
 * @module test
 */

// Import testing libraries
const { describe, it, beforeEach, afterEach, beforeAll, afterAll, expect, jest } = require('@jest/globals');
const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

// Import server components for testing
const app = require('./server/app');
const config = require('./server/config/config');
const database = require('./server/config/database');
const User = require('./server/models/user.model');
const Role = require('./server/models/role.model');
const Incident = require('./server/models/incident.model');
const Equipment = require('./server/models/equipment.model');
const Notification = require('./server/models/notification.model');
const Report = require('./server/models/report.model');

// Mock services
jest.mock('./server/services/email.service');
jest.mock('./server/services/notification.service');
jest.mock('./server/services/websocket.service');

// Test data
const testUsers = {
  admin: {
    username: 'admin_test',
    email: 'admin_test@example.com',
    password: 'Password123!',
    firstName: 'Admin',
    lastName: 'Test',
    department: 'IT',
    position: 'System Administrator'
  },
  technician: {
    username: 'tech_test',
    email: 'tech_test@example.com',
    password: 'Password123!',
    firstName: 'Tech',
    lastName: 'Test',
    department: 'IT',
    position: 'Support Specialist'
  },
  user: {
    username: 'user_test',
    email: 'user_test@example.com',
    password: 'Password123!',
    firstName: 'User',
    lastName: 'Test',
    department: 'Marketing',
    position: 'Marketing Specialist'
  }
};

const testIncident = {
  title: 'Test Incident',
  description: 'This is a test incident',
  priority: 'medium',
  status: 'open',
  category: 'hardware'
};

const testEquipment = {
  name: 'Test Laptop',
  type: 'laptop',
  serialNumber: 'TEST123456',
  model: 'Test Model X1',
  manufacturer: 'Test Manufacturer',
  purchaseDate: new Date('2023-01-01'),
  warrantyExpiration: new Date('2026-01-01'),
  status: 'active',
  location: 'Main Office',
  notes: 'Test equipment for testing purposes'
};

// Helper functions
async function setupTestDatabase() {
  await database.connect();
  
  // Clear collections
  await User.deleteMany({});
  await Role.deleteMany({});
  await Incident.deleteMany({});
  await Equipment.deleteMany({});
  await Notification.deleteMany({});
  await Report.deleteMany({});
  
  // Create roles
  const roles = [
    { name: config.ROLES.ADMIN, description: 'Administrator with full access' },
    { name: config.ROLES.TECHNICIAN, description: 'IT support technician' },
    { name: config.ROLES.USER, description: 'Regular user' }
  ];
  
  const createdRoles = {};
  
  for (const role of roles) {
    const createdRole = await Role.create(role);
    createdRoles[role.name] = createdRole;
  }
  
  // Create test users
  const createdUsers = {};
  
  for (const [key, userData] of Object.entries(testUsers)) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const roleName = key === 'admin' ? config.ROLES.ADMIN : 
                    key === 'technician' ? config.ROLES.TECHNICIAN : 
                    config.ROLES.USER;
    
    const user = await User.create({
      ...userData,
      password: hashedPassword,
      role: createdRoles[roleName]._id
    });
    
    createdUsers[key] = user;
  }
  
  return { roles: createdRoles, users: createdUsers };
}

async function generateAuthToken(user, role) {
  return jwt.sign(
    { id: user._id, role },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRES_IN }
  );
}

async function teardownTestDatabase() {
  await User.deleteMany({});
  await Role.deleteMany({});
  await Incident.deleteMany({});
  await Equipment.deleteMany({});
  await Notification.deleteMany({});
  await Report.deleteMany({});
  await database.disconnect();
}

// Test suites
describe('IT Service Desk API Tests', () => {
  let testData;
  let adminToken, technicianToken, userToken;
  
  beforeAll(async () => {
    testData = await setupTestDatabase();
    
    // Generate tokens
    adminToken = await generateAuthToken(
      testData.users.admin, 
      config.ROLES.ADMIN
    );
    
    technicianToken = await generateAuthToken(
      testData.users.technician, 
      config.ROLES.TECHNICIAN
    );
    
    userToken = await generateAuthToken(
      testData.users.user, 
      config.ROLES.USER
    );
  });
  
  afterAll(async () => {
    await teardownTestDatabase();
  });
  
  // Authentication Tests
  describe('Authentication API', () => {
    it('should login with valid credentials and return token', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUsers.user.email,
          password: testUsers.user.password
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', testUsers.user.email);
      expect(response.body.user).not.toHaveProperty('password');
    });
    
    it('should return 401 with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUsers.user.email,
          password: 'wrongpassword'
        });
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
    });
    
    it('should register a new user with valid data', async () => {
      const newUser = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'Password123!',
        firstName: 'New',
        lastName: 'User',
        department: 'Sales',
        position: 'Sales Representative'
      };
      
      const response = await request(app)
        .post('/api/auth/register')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newUser);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', newUser.email);
      expect(response.body.user).not.toHaveProperty('password');
      
      // Verify user was created in database
      const createdUser = await User.findOne({ email: newUser.email });
      expect(createdUser).toBeTruthy();
    });
    
    it('should not allow registration with existing email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(testUsers.user);
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
    
    it('should refresh token with valid refresh token', async () => {
      // First login to get refresh token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUsers.user.email,
          password: testUsers.user.password
        });
      
      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body).toHaveProperty('refreshToken');
      
      const refreshToken = loginResponse.body.refreshToken;
      
      // Use refresh token to get new access token
      const refreshResponse = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken });
      
      expect(refreshResponse.status).toBe(200);
      expect(refreshResponse.body).toHaveProperty('token');
    });
  });
  
  // Incident Management Tests
  describe('Incident Management API', () => {
    let testIncidentId;
    
    it('should create a new incident', async () => {
      const response = await request(app)
        .post('/api/incidents')
        .set('Authorization', `Bearer ${userToken}`)
        .send(testIncident);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('incident');
      expect(response.body.incident).toHaveProperty('title', testIncident.title);
      expect(response.body.incident).toHaveProperty('status', 'open');
      expect(response.body.incident).toHaveProperty('createdBy');
      
      testIncidentId = response.body.incident._id;
    });
    
    it('should get all incidents', async () => {
      const response = await request(app)
        .get('/api/incidents')
        .set('Authorization', `Bearer ${technicianToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('incidents');
      expect(Array.isArray(response.body.incidents)).toBe(true);
      expect(response.body.incidents.length).toBeGreaterThan(0);
    });
    
    it('should get a specific incident by ID', async () => {
      const response = await request(app)
        .get(`/api/incidents/${testIncidentId}`)
        .set('Authorization', `Bearer ${technicianToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('incident');
      expect(response.body.incident).toHaveProperty('_id', testIncidentId);
    });
    
    it('should update an incident', async () => {
      const updateData = {
        status: 'in-progress',
        priority: 'high',
        assignedTo: testData.users.technician._id
      };
      
      const response = await request(app)
        .put(`/api/incidents/${testIncidentId}`)
        .set('Authorization', `Bearer ${technicianToken}`)
        .send(updateData);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('incident');
      expect(response.body.incident).toHaveProperty('status', 'in-progress');
      expect(response.body.incident).toHaveProperty('priority', 'high');
      expect(response.body.incident.assignedTo.toString()).toBe(testData.users.technician._id.toString());
    });
    
    it('should add a comment to an incident', async () => {
      const commentData = {
        text: 'This is a test comment'
      };
      
      const response = await request(app)
        .post(`/api/incidents/${testIncidentId}/comments`)
        .set('Authorization', `Bearer ${technicianToken}`)
        .send(commentData);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('incident');
      expect(response.body.incident).toHaveProperty('comments');
      expect(Array.isArray(response.body.incident.comments)).toBe(true);
      expect(response.body.incident.comments.length).toBe(1);
      expect(response.body.incident.comments[0]).toHaveProperty('text', commentData.text);
    });
    
    it('should close an incident', async () => {
      const closeData = {
        status: 'closed',
        resolution: 'Issue resolved successfully'
      };
      
      const response = await request(app)
        .put(`/api/incidents/${testIncidentId}/close`)
        .set('Authorization', `Bearer ${technicianToken}`)
        .send(closeData);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('incident');
      expect(response.body.incident).toHaveProperty('status', 'closed');
      expect(response.body.incident).toHaveProperty('resolution', closeData.resolution);
      expect(response.body.incident).toHaveProperty('closedAt');
      expect(response.body.incident).toHaveProperty('closedBy');
    });
  });
  
  // Equipment Management Tests
  describe('Equipment Management API', () => {
    let testEquipmentId;
    
    it('should create new equipment', async () => {
      const response = await request(app)
        .post('/api/equipment')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(testEquipment);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('equipment');
      expect(response.body.equipment).toHaveProperty('name', testEquipment.name);
      expect(response.body.equipment).toHaveProperty('serialNumber', testEquipment.serialNumber);
      
      testEquipmentId = response.body.equipment._id;
    });
    
    it('should get all equipment', async () => {
      const response = await request(app)
        .get('/api/equipment')
        .set('Authorization', `Bearer ${technicianToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('equipment');
      expect(Array.isArray(response.body.equipment)).toBe(true);
      expect(response.body.equipment.length).toBeGreaterThan(0);
    });
    
    it('should get a specific equipment by ID', async () => {
      const response = await request(app)
        .get(`/api/equipment/${testEquipmentId}`)
        .set('Authorization', `Bearer ${technicianToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('equipment');
      expect(response.body.equipment).toHaveProperty('_id', testEquipmentId);
    });
    
    it('should update equipment', async () => {
      const updateData = {
        status: 'maintenance',
        location: 'IT Department',
        notes: 'Equipment under maintenance'
      };
      
      const response = await request(app)
        .put(`/api/equipment/${testEquipmentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('equipment');
      expect(response.body.equipment).toHaveProperty('status', 'maintenance');
      expect(response.body.equipment).toHaveProperty('location', 'IT Department');
      expect(response.body.equipment).toHaveProperty('notes', 'Equipment under maintenance');
    });
    
    it('should assign equipment to a user', async () => {
      const assignData = {
        assignedTo: testData.users.user._id,
        notes: 'Assigned to user for testing'
      };
      
      const response = await request(app)
        .put(`/api/equipment/${testEquipmentId}/assign`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(assignData);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('equipment');
      expect(response.body.equipment.assignedTo.toString()).toBe(testData.users.user._id.toString());
      expect(response.body.equipment).toHaveProperty('assignmentHistory');
      expect(Array.isArray(response.body.equipment.assignmentHistory)).toBe(true);
      expect(response.body.equipment.assignmentHistory.length).toBeGreaterThan(0);
    });
    
    it('should unassign equipment from a user', async () => {
      const response = await request(app)
        .put(`/api/equipment/${testEquipmentId}/unassign`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ notes: 'Unassigned from user' });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('equipment');
      expect(response.body.equipment.assignedTo).toBeNull();
    });
  });
  
  // Dashboard API Tests
  describe('Dashboard API', () => {
    it('should get dashboard statistics', async () => {
      const response = await request(app)
        .get('/api/dashboard/statistics')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('statistics');
      expect(response.body.statistics).toHaveProperty('incidentStats');
      expect(response.body.statistics).toHaveProperty('equipmentStats');
      expect(response.body.statistics).toHaveProperty('userStats');
    });
    
    it('should get recent incidents', async () => {
      const response = await request(app)
        .get('/api/dashboard/recent-incidents')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('incidents');
      expect(Array.isArray(response.body.incidents)).toBe(true);
    });
    
    it('should get incident trends', async () => {
      const response = await request(app)
        .get('/api/dashboard/incident-trends')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('trends');
      expect(response.body.trends).toHaveProperty('daily');
      expect(response.body.trends).toHaveProperty('weekly');
      expect(response.body.trends).toHaveProperty('monthly');
    });
    
    it('should get equipment status distribution', async () => {
      const response = await request(app)
        .get('/api/dashboard/equipment-status')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('statusDistribution');
      expect(typeof response.body.statusDistribution).toBe('object');
    });
  });
  
  // Report Generation Tests
  describe('Report Generation API', () => {
    let testReportId;
    
    it('should generate an incident report', async () => {
      const reportData = {
        type: 'incident',
        title: 'Test Incident Report',
        dateRange: {
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
          endDate: new Date().toISOString()
        },
        filters: {
          status: ['open', 'in-progress', 'closed'],
          priority: ['low', 'medium', 'high']
        },
        format: 'pdf'
      };
      
      const response = await request(app)
        .post('/api/reports/generate')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(reportData);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('report');
      expect(response.body.report).toHaveProperty('title', reportData.title);
      expect(response.body.report).toHaveProperty('type', reportData.type);
      expect(response.body.report).toHaveProperty('createdBy');
      expect(response.body.report).toHaveProperty('fileUrl');
      
      testReportId = response.body.report._id;
    });
    
    it('should generate an equipment report', async () => {
      const reportData = {
        type: 'equipment',
        title: 'Test Equipment Report',
        filters: {
          status: ['active', 'maintenance', 'retired'],
          type: ['laptop', 'desktop', 'printer']
        },
        format: 'excel'
      };
      
      const response = await request(app)
        .post('/api/reports/generate')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(reportData);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('report');
      expect(response.body.report).toHaveProperty('title', reportData.title);
      expect(response.body.report).toHaveProperty('type', reportData.type);
    });
    
    it('should get all reports', async () => {
      const response = await request(app)
        .get('/api/reports')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('reports');
      expect(Array.isArray(response.body.reports)).toBe(true);
      expect(response.body.reports.length).toBeGreaterThan(0);
    });
    
    it('should get a specific report by ID', async () => {
      const response = await request(app)
        .get(`/api/reports/${testReportId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('report');
      expect(response.body.report).toHaveProperty('_id', testReportId);
    });
    
    it('should download a report file', async () => {
      const reportResponse = await request(app)
        .get(`/api/reports/${testReportId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      const fileUrl = reportResponse.body.report.fileUrl;
      
      const response = await request(app)
        .get(`/api/reports/download${fileUrl}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBeTruthy();
      expect(response.headers['content-disposition']).toBeTruthy();
    });
  });
  
  // Notification Tests
  describe('Notification API', () => {
    it('should get user notifications', async () => {
      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('notifications');
      expect(Array.isArray(response.body.notifications)).toBe(true);
    });
    
    it('should mark a notification as read', async () => {
      // First create a notification
      const notification = await Notification.create({
        recipient: testData.users.user._id,
        title: 'Test Notification',
        message: 'This is a test notification',
        type: 'info',
        relatedTo: { model: 'Incident', id: mongoose.Types.ObjectId() }
      });
      
      const response = await request(app)
        .put(`/api/notifications/${notification._id}/read`)
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('notification');
      expect(response.body.notification).toHaveProperty('read', true);
      expect(response.body.notification).toHaveProperty('readAt');
    });
    
    it('should mark all notifications as read', async () => {
      const response = await request(app)
        .put('/api/notifications/read-all')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      
      // Verify all notifications are marked as read
      const notifications = await Notification.find({ 
        recipient: testData.users.user._id,
        read: false
      });
      
      expect(notifications.length).toBe(0);
    });
  });
  
  // User Management Tests
  describe('User Management API', () => {
    it('should get all users (admin only)', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('users');
      expect(Array.isArray(response.body.users)).toBe(true);
      expect(response.body.users.length).toBeGreaterThan(0);
    });
    
    it('should not allow non-admins to get all users', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(403);
    });
    
    it('should get user profile', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', testUsers.user.email);
      expect(response.body.user).not.toHaveProperty('password');
    });
    
    it('should update user profile', async () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
        department: 'Updated Department'
      };
      
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('firstName', updateData.firstName);
      expect(response.body.user).toHaveProperty('lastName', updateData.lastName);
      expect(response.body.user).toHaveProperty('department', updateData.department);
    });
    
    it('should change user password', async () => {
      const passwordData = {
        currentPassword: testUsers.user.password,
        newPassword: 'NewPassword123!',
        confirmPassword: 'NewPassword123!'
      };
      
      const response = await request(app)
        .put('/api/users/change-password')
        .set('Authorization', `Bearer ${userToken}`)
        .send(passwordData);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      
      // Verify password was changed by trying to login with new password
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUsers.user.email,
          password: passwordData.newPassword
        });
      
      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body).toHaveProperty('token');
    });
  });
});

// Export the test utilities for reuse in other test files
module.exports = {
  setupTestDatabase,
  teardownTestDatabase,
  generateAuthToken,
  testUsers,
  testIncident,
  testEquipment
};