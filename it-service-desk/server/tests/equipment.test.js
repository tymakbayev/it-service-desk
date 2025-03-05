const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../app');
const Equipment = require('../models/equipment.model');
const User = require('../models/user.model');
const Role = require('../models/role.model');
const config = require('../config/config');
const database = require('../config/database');
const { EQUIPMENT_STATUS, EQUIPMENT_TYPES } = require('../utils/constants');

// Mock services
jest.mock('../services/notification.service');
jest.mock('../services/email.service');
jest.mock('../services/websocket.service');

describe('Equipment API', () => {
  let adminUser;
  let technicianUser;
  let regularUser;
  let adminToken;
  let technicianToken;
  let regularToken;
  let testEquipment;

  // Setup database connection before all tests
  beforeAll(async () => {
    await database.connect();
    
    // Clear collections
    await Equipment.deleteMany({});
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
    
    adminUser = await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: 'hashedPassword123',
      firstName: 'Admin',
      lastName: 'User',
      role: adminRole._id,
      department: 'IT',
      position: 'System Administrator'
    });
    
    technicianUser = await User.create({
      username: 'technician',
      email: 'tech@example.com',
      password: 'hashedPassword123',
      firstName: 'Tech',
      lastName: 'Support',
      role: technicianRole._id,
      department: 'IT',
      position: 'Support Specialist'
    });
    
    regularUser = await User.create({
      username: 'user',
      email: 'user@example.com',
      password: 'hashedPassword123',
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
    
    // Create test equipment
    testEquipment = await Equipment.create({
      name: 'Test Laptop',
      type: EQUIPMENT_TYPES.LAPTOP,
      serialNumber: 'SN12345678',
      model: 'ThinkPad X1',
      manufacturer: 'Lenovo',
      purchaseDate: new Date('2022-01-15'),
      warrantyExpiryDate: new Date('2025-01-15'),
      status: EQUIPMENT_STATUS.ACTIVE,
      location: 'Main Office',
      assignedTo: regularUser._id,
      specs: {
        cpu: 'Intel i7',
        ram: '16GB',
        storage: '512GB SSD',
        os: 'Windows 11'
      },
      notes: 'Company laptop for general use',
      lastMaintenanceDate: new Date('2023-01-15')
    });
  });
  
  // Close database connection after all tests
  afterAll(async () => {
    await Equipment.deleteMany({});
    await User.deleteMany({});
    await database.disconnect();
  });
  
  describe('GET /api/v1/equipment', () => {
    it('should return all equipment for admin users', async () => {
      const response = await request(app)
        .get('/api/v1/equipment')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body).toHaveProperty('pagination');
    });
    
    it('should return equipment with pagination', async () => {
      const response = await request(app)
        .get('/api/v1/equipment?page=1&limit=10')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination).toHaveProperty('totalItems');
      expect(response.body.pagination).toHaveProperty('totalPages');
      expect(response.body.pagination).toHaveProperty('currentPage', 1);
      expect(response.body.pagination).toHaveProperty('limit', 10);
    });
    
    it('should filter equipment by type', async () => {
      const response = await request(app)
        .get(`/api/v1/equipment?type=${EQUIPMENT_TYPES.LAPTOP}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.data.every(item => item.type === EQUIPMENT_TYPES.LAPTOP)).toBe(true);
    });
    
    it('should filter equipment by status', async () => {
      const response = await request(app)
        .get(`/api/v1/equipment?status=${EQUIPMENT_STATUS.ACTIVE}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.data.every(item => item.status === EQUIPMENT_STATUS.ACTIVE)).toBe(true);
    });
    
    it('should search equipment by name or serial number', async () => {
      const response = await request(app)
        .get('/api/v1/equipment?search=Test Laptop')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.data.some(item => item.name.includes('Test Laptop'))).toBe(true);
    });
    
    it('should return 401 if not authenticated', async () => {
      const response = await request(app)
        .get('/api/v1/equipment');
      
      expect(response.status).toBe(401);
    });
  });
  
  describe('GET /api/v1/equipment/:id', () => {
    it('should return equipment by id', async () => {
      const response = await request(app)
        .get(`/api/v1/equipment/${testEquipment._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('_id', testEquipment._id.toString());
      expect(response.body).toHaveProperty('name', testEquipment.name);
      expect(response.body).toHaveProperty('serialNumber', testEquipment.serialNumber);
    });
    
    it('should populate assignedTo field with user details', async () => {
      const response = await request(app)
        .get(`/api/v1/equipment/${testEquipment._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('assignedTo');
      expect(response.body.assignedTo).toHaveProperty('_id', regularUser._id.toString());
      expect(response.body.assignedTo).toHaveProperty('firstName', regularUser.firstName);
      expect(response.body.assignedTo).toHaveProperty('lastName', regularUser.lastName);
    });
    
    it('should return 404 for non-existent equipment', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/v1/equipment/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(404);
    });
    
    it('should return 401 if not authenticated', async () => {
      const response = await request(app)
        .get(`/api/v1/equipment/${testEquipment._id}`);
      
      expect(response.status).toBe(401);
    });
  });
  
  describe('POST /api/v1/equipment', () => {
    it('should create new equipment when admin', async () => {
      const newEquipment = {
        name: 'New Desktop',
        type: EQUIPMENT_TYPES.DESKTOP,
        serialNumber: 'SN87654321',
        model: 'OptiPlex 7090',
        manufacturer: 'Dell',
        purchaseDate: '2023-01-15',
        warrantyExpiryDate: '2026-01-15',
        status: EQUIPMENT_STATUS.ACTIVE,
        location: 'Branch Office',
        assignedTo: technicianUser._id.toString(),
        specs: {
          cpu: 'Intel i9',
          ram: '32GB',
          storage: '1TB SSD',
          os: 'Windows 11 Pro'
        },
        notes: 'High-performance workstation'
      };
      
      const response = await request(app)
        .post('/api/v1/equipment')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newEquipment);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('name', newEquipment.name);
      expect(response.body).toHaveProperty('serialNumber', newEquipment.serialNumber);
      expect(response.body).toHaveProperty('type', newEquipment.type);
      
      // Verify equipment was created in database
      const createdEquipment = await Equipment.findById(response.body._id);
      expect(createdEquipment).toBeTruthy();
      expect(createdEquipment.name).toBe(newEquipment.name);
    });
    
    it('should create new equipment when technician', async () => {
      const newEquipment = {
        name: 'New Monitor',
        type: EQUIPMENT_TYPES.MONITOR,
        serialNumber: 'MON123456',
        model: 'UltraSharp U2720Q',
        manufacturer: 'Dell',
        purchaseDate: '2023-02-15',
        warrantyExpiryDate: '2026-02-15',
        status: EQUIPMENT_STATUS.ACTIVE,
        location: 'Main Office',
        specs: {
          resolution: '3840x2160',
          size: '27 inch',
          refreshRate: '60Hz'
        }
      };
      
      const response = await request(app)
        .post('/api/v1/equipment')
        .set('Authorization', `Bearer ${technicianToken}`)
        .send(newEquipment);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('name', newEquipment.name);
    });
    
    it('should return 403 when regular user tries to create equipment', async () => {
      const newEquipment = {
        name: 'Unauthorized Equipment',
        type: EQUIPMENT_TYPES.PRINTER,
        serialNumber: 'PR123456',
        model: 'LaserJet Pro',
        manufacturer: 'HP',
        status: EQUIPMENT_STATUS.ACTIVE
      };
      
      const response = await request(app)
        .post('/api/v1/equipment')
        .set('Authorization', `Bearer ${regularToken}`)
        .send(newEquipment);
      
      expect(response.status).toBe(403);
    });
    
    it('should return 400 for invalid equipment data', async () => {
      const invalidEquipment = {
        // Missing required fields
        type: EQUIPMENT_TYPES.DESKTOP,
        manufacturer: 'Dell'
      };
      
      const response = await request(app)
        .post('/api/v1/equipment')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidEquipment);
      
      expect(response.status).toBe(400);
    });
    
    it('should return 400 for duplicate serial number', async () => {
      const duplicateEquipment = {
        name: 'Duplicate Serial Number',
        type: EQUIPMENT_TYPES.LAPTOP,
        serialNumber: 'SN12345678', // Same as testEquipment
        model: 'XPS 15',
        manufacturer: 'Dell',
        status: EQUIPMENT_STATUS.ACTIVE
      };
      
      const response = await request(app)
        .post('/api/v1/equipment')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(duplicateEquipment);
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('duplicate');
    });
  });
  
  describe('PUT /api/v1/equipment/:id', () => {
    it('should update equipment when admin', async () => {
      const updateData = {
        name: 'Updated Test Laptop',
        status: EQUIPMENT_STATUS.MAINTENANCE,
        notes: 'Sent for maintenance due to battery issues',
        lastMaintenanceDate: new Date().toISOString()
      };
      
      const response = await request(app)
        .put(`/api/v1/equipment/${testEquipment._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', updateData.name);
      expect(response.body).toHaveProperty('status', updateData.status);
      expect(response.body).toHaveProperty('notes', updateData.notes);
      
      // Verify equipment was updated in database
      const updatedEquipment = await Equipment.findById(testEquipment._id);
      expect(updatedEquipment.name).toBe(updateData.name);
      expect(updatedEquipment.status).toBe(updateData.status);
    });
    
    it('should update equipment when technician', async () => {
      const updateData = {
        location: 'IT Department',
        assignedTo: technicianUser._id.toString()
      };
      
      const response = await request(app)
        .put(`/api/v1/equipment/${testEquipment._id}`)
        .set('Authorization', `Bearer ${technicianToken}`)
        .send(updateData);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('location', updateData.location);
      expect(response.body).toHaveProperty('assignedTo', updateData.assignedTo);
    });
    
    it('should return 403 when regular user tries to update equipment', async () => {
      const updateData = {
        name: 'Unauthorized Update',
        status: EQUIPMENT_STATUS.INACTIVE
      };
      
      const response = await request(app)
        .put(`/api/v1/equipment/${testEquipment._id}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .send(updateData);
      
      expect(response.status).toBe(403);
    });
    
    it('should return 404 for non-existent equipment', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const updateData = {
        name: 'Non-existent Equipment',
        status: EQUIPMENT_STATUS.ACTIVE
      };
      
      const response = await request(app)
        .put(`/api/v1/equipment/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);
      
      expect(response.status).toBe(404);
    });
    
    it('should return 400 for invalid update data', async () => {
      const invalidUpdateData = {
        status: 'INVALID_STATUS' // Invalid status value
      };
      
      const response = await request(app)
        .put(`/api/v1/equipment/${testEquipment._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidUpdateData);
      
      expect(response.status).toBe(400);
    });
  });
  
  describe('DELETE /api/v1/equipment/:id', () => {
    let equipmentToDelete;
    
    beforeEach(async () => {
      // Create equipment to delete in each test
      equipmentToDelete = await Equipment.create({
        name: 'Equipment To Delete',
        type: EQUIPMENT_TYPES.PRINTER,
        serialNumber: `DELETE-${Date.now()}`,
        model: 'LaserJet Pro',
        manufacturer: 'HP',
        status: EQUIPMENT_STATUS.INACTIVE
      });
    });
    
    it('should delete equipment when admin', async () => {
      const response = await request(app)
        .delete(`/api/v1/equipment/${equipmentToDelete._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('deleted');
      
      // Verify equipment was deleted from database
      const deletedEquipment = await Equipment.findById(equipmentToDelete._id);
      expect(deletedEquipment).toBeNull();
    });
    
    it('should return 403 when technician tries to delete equipment', async () => {
      const response = await request(app)
        .delete(`/api/v1/equipment/${equipmentToDelete._id}`)
        .set('Authorization', `Bearer ${technicianToken}`);
      
      expect(response.status).toBe(403);
      
      // Verify equipment was not deleted
      const notDeletedEquipment = await Equipment.findById(equipmentToDelete._id);
      expect(notDeletedEquipment).toBeTruthy();
    });
    
    it('should return 403 when regular user tries to delete equipment', async () => {
      const response = await request(app)
        .delete(`/api/v1/equipment/${equipmentToDelete._id}`)
        .set('Authorization', `Bearer ${regularToken}`);
      
      expect(response.status).toBe(403);
    });
    
    it('should return 404 for non-existent equipment', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .delete(`/api/v1/equipment/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(404);
    });
  });
  
  describe('GET /api/v1/equipment/assigned-to/:userId', () => {
    beforeEach(async () => {
      // Create additional equipment assigned to users
      await Equipment.create({
        name: 'Regular User Laptop',
        type: EQUIPMENT_TYPES.LAPTOP,
        serialNumber: `USER-${Date.now()}`,
        model: 'MacBook Pro',
        manufacturer: 'Apple',
        status: EQUIPMENT_STATUS.ACTIVE,
        assignedTo: regularUser._id
      });
      
      await Equipment.create({
        name: 'Regular User Phone',
        type: EQUIPMENT_TYPES.MOBILE,
        serialNumber: `PHONE-${Date.now()}`,
        model: 'iPhone 13',
        manufacturer: 'Apple',
        status: EQUIPMENT_STATUS.ACTIVE,
        assignedTo: regularUser._id
      });
    });
    
    it('should return equipment assigned to specific user', async () => {
      const response = await request(app)
        .get(`/api/v1/equipment/assigned-to/${regularUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body.every(item => 
        item.assignedTo && item.assignedTo.toString() === regularUser._id.toString()
      )).toBe(true);
    });
    
    it('should allow users to view their own assigned equipment', async () => {
      const response = await request(app)
        .get(`/api/v1/equipment/assigned-to/${regularUser._id}`)
        .set('Authorization', `Bearer ${regularToken}`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
    
    it('should return 403 when regular user tries to view another user\'s equipment', async () => {
      const response = await request(app)
        .get(`/api/v1/equipment/assigned-to/${technicianUser._id}`)
        .set('Authorization', `Bearer ${regularToken}`);
      
      expect(response.status).toBe(403);
    });
    
    it('should return empty array for user with no assigned equipment', async () => {
      // Create a new user with no equipment
      const newUser = await User.create({
        username: 'noequipment',
        email: 'noequipment@example.com',
        password: 'hashedPassword123',
        firstName: 'No',
        lastName: 'Equipment',
        role: (await Role.findOne({ name: config.ROLES.USER }))._id
      });
      
      const response = await request(app)
        .get(`/api/v1/equipment/assigned-to/${newUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });
  
  describe('GET /api/v1/equipment/stats', () => {
    it('should return equipment statistics for admin', async () => {
      const response = await request(app)
        .get('/api/v1/equipment/stats')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalCount');
      expect(response.body).toHaveProperty('byStatus');
      expect(response.body).toHaveProperty('byType');
      expect(response.body).toHaveProperty('recentlyAdded');
      expect(response.body).toHaveProperty('needingMaintenance');
    });
    
    it('should return equipment statistics for technician', async () => {
      const response = await request(app)
        .get('/api/v1/equipment/stats')
        .set('Authorization', `Bearer ${technicianToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalCount');
    });
    
    it('should return 403 for regular users', async () => {
      const response = await request(app)
        .get('/api/v1/equipment/stats')
        .set('Authorization', `Bearer ${regularToken}`);
      
      expect(response.status).toBe(403);
    });
  });
  
  describe('POST /api/v1/equipment/:id/maintenance', () => {
    it('should record maintenance for equipment', async () => {
      const maintenanceData = {
        date: new Date().toISOString(),
        description: 'Regular maintenance check',
        performedBy: technicianUser._id.toString(),
        cost: 150.00,
        notes: 'Replaced battery and cleaned fans'
      };
      
      const response = await request(app)
        .post(`/api/v1/equipment/${testEquipment._id}/maintenance`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(maintenanceData);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('maintenanceHistory');
      expect(Array.isArray(response.body.maintenanceHistory)).toBe(true);
      expect(response.body.maintenanceHistory.length).toBeGreaterThan(0);
      
      const latestMaintenance = response.body.maintenanceHistory[response.body.maintenanceHistory.length - 1];
      expect(latestMaintenance).toHaveProperty('description', maintenanceData.description);
      expect(latestMaintenance).toHaveProperty('performedBy');
      expect(latestMaintenance).toHaveProperty('cost', maintenanceData.cost);
      
      // Verify lastMaintenanceDate was updated
      expect(response.body).toHaveProperty('lastMaintenanceDate');
      const lastMaintenanceDate = new Date(response.body.lastMaintenanceDate);
      const now = new Date();
      expect(lastMaintenanceDate.getDate()).toBe(now.getDate());
    });
    
    it('should allow technicians to record maintenance', async () => {
      const maintenanceData = {
        date: new Date().toISOString(),
        description: 'Software update',
        performedBy: technicianUser._id.toString(),
        notes: 'Updated OS and drivers'
      };
      
      const response = await request(app)
        .post(`/api/v1/equipment/${testEquipment._id}/maintenance`)
        .set('Authorization', `Bearer ${technicianToken}`)
        .send(maintenanceData);
      
      expect(response.status).toBe(200);
    });
    
    it('should return 403 when regular user tries to record maintenance', async () => {
      const maintenanceData = {
        date: new Date().toISOString(),
        description: 'Unauthorized maintenance',
        notes: 'This should not be allowed'
      };
      
      const response = await request(app)
        .post(`/api/v1/equipment/${testEquipment._id}/maintenance`)
        .set('Authorization', `Bearer ${regularToken}`)
        .send(maintenanceData);
      
      expect(response.status).toBe(403);
    });
    
    it('should return 400 for invalid maintenance data', async () => {
      const invalidMaintenanceData = {
        // Missing required description field
        date: new Date().toISOString()
      };
      
      const response = await request(app)
        .post(`/api/v1/equipment/${testEquipment._id}/maintenance`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidMaintenanceData);
      
      expect(response.status).toBe(400);
    });
    
    it('should return 404 for non-existent equipment', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const maintenanceData = {
        date: new Date().toISOString(),
        description: 'Maintenance for non-existent equipment'
      };
      
      const response = await request(app)
        .post(`/api/v1/equipment/${nonExistentId}/maintenance`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(maintenanceData);
      
      expect(response.status).toBe(404);
    });
  });
  
  describe('GET /api/v1/equipment/search', () => {
    it('should search equipment by various criteria', async () => {
      const response = await request(app)
        .get('/api/v1/equipment/search?query=Laptop')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.some(item => 
        item.name.includes('Laptop') || 
        item.type === EQUIPMENT_TYPES.LAPTOP
      )).toBe(true);
    });
    
    it('should search by serial number', async () => {
      const response = await request(app)
        .get(`/api/v1/equipment/search?query=${testEquipment.serialNumber}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.some(item => item.serialNumber === testEquipment.serialNumber)).toBe(true);
    });
    
    it('should search by manufacturer', async () => {
      const response = await request(app)
        .get('/api/v1/equipment/search?query=Lenovo')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.some(item => item.manufacturer === 'Lenovo')).toBe(true);
    });
    
    it('should return empty array for no matches', async () => {
      const response = await request(app)
        .get('/api/v1/equipment/search?query=NonExistentEquipment123456789')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
    
    it('should return 401 if not authenticated', async () => {
      const response = await request(app)
        .get('/api/v1/equipment/search?query=Laptop');
      
      expect(response.status).toBe(401);
    });
  });
  
  describe('PATCH /api/v1/equipment/:id/assign', () => {
    it('should assign equipment to a user', async () => {
      const assignData = {
        userId: technicianUser._id.toString(),
        notes: 'Assigned to IT technician for testing'
      };
      
      const response = await request(app)
        .patch(`/api/v1/equipment/${testEquipment._id}/assign`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(assignData);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('assignedTo', technicianUser._id.toString());
      expect(response.body).toHaveProperty('notes', assignData.notes);
      
      // Verify assignment history was updated
      expect(response.body).toHaveProperty('assignmentHistory');
      expect(Array.isArray(response.body.assignmentHistory)).toBe(true);
      expect(response.body.assignmentHistory.length).toBeGreaterThan(0);
      
      const latestAssignment = response.body.assignmentHistory[response.body.assignmentHistory.length - 1];
      expect(latestAssignment).toHaveProperty('assignedTo', technicianUser._id.toString());
      expect(latestAssignment).toHaveProperty('assignedBy');
      expect(latestAssignment).toHaveProperty('notes', assignData.notes);
    });
    
    it('should allow technicians to assign equipment', async () => {
      const assignData = {
        userId: regularUser._id.toString()
      };
      
      const response = await request(app)
        .patch(`/api/v1/equipment/${testEquipment._id}/assign`)
        .set('Authorization', `Bearer ${technicianToken}`)
        .send(assignData);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('assignedTo', regularUser._id.toString());
    });
    
    it('should return 403 when regular user tries to assign equipment', async () => {
      const assignData = {
        userId: regularUser._id.toString()
      };
      
      const response = await request(app)
        .patch(`/api/v1/equipment/${testEquipment._id}/assign`)
        .set('Authorization', `Bearer ${regularToken}`)
        .send(assignData);
      
      expect(response.status).toBe(403);
    });
    
    it('should return 400 for invalid assignment data', async () => {
      const invalidAssignData = {
        // Missing required userId field
        notes: 'Invalid assignment'
      };
      
      const response = await request(app)
        .patch(`/api/v1/equipment/${testEquipment._id}/assign`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidAssignData);
      
      expect(response.status).toBe(400);
    });
    
    it('should return 404 for non-existent equipment', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const assignData = {
        userId: regularUser._id.toString()
      };
      
      const response = await request(app)
        .patch(`/api/v1/equipment/${nonExistentId}/assign`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(assignData);
      
      expect(response.status).toBe(404);
    });
    
    it('should return 404 for non-existent user', async () => {
      const nonExistentUserId = new mongoose.Types.ObjectId();
      const assignData = {
        userId: nonExistentUserId.toString()
      };
      
      const response = await request(app)
        .patch(`/api/v1/equipment/${testEquipment._id}/assign`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(assignData);
      
      expect(response.status).toBe(404);
      expect(response.body.message).toContain('User not found');
    });
  });
  
  describe('PATCH /api/v1/equipment/:id/unassign', () => {
    it('should unassign equipment from a user', async () => {
      // First ensure equipment is assigned
      await Equipment.findByIdAndUpdate(testEquipment._id, {
        assignedTo: regularUser._id
      });
      
      const unassignData = {
        notes: 'Equipment returned to inventory'
      };
      
      const response = await request(app)
        .patch(`/api/v1/equipment/${testEquipment._id}/unassign`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(unassignData);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('assignedTo', null);
      expect(response.body).toHaveProperty('notes', unassignData.notes);
      
      // Verify assignment history was updated
      expect(response.body).toHaveProperty('assignmentHistory');
      expect(Array.isArray(response.body.assignmentHistory)).toBe(true);
      
      const latestAssignment = response.body.assignmentHistory[response.body.assignmentHistory.length - 1];
      expect(latestAssignment).toHaveProperty('unassignedAt');
      expect(latestAssignment).toHaveProperty('unassignedBy');
      expect(latestAssignment).toHaveProperty('notes', unassignData.notes);
    });
    
    it('should return 400 if equipment is not assigned', async () => {
      // First ensure equipment is not assigned
      await Equipment.findByIdAndUpdate(testEquipment._id, {
        assignedTo: null
      });
      
      const response = await request(app)
        .patch(`/api/v1/equipment/${testEquipment._id}/unassign`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('not assigned');
    });
    
    it('should allow technicians to unassign equipment', async () => {
      // First ensure equipment is assigned
      await Equipment.findByIdAndUpdate(testEquipment._id, {
        assignedTo: regularUser._id
      });
      
      const response = await request(app)
        .patch(`/api/v1/equipment/${testEquipment._id}/unassign`)
        .set('Authorization', `Bearer ${technicianToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('assignedTo', null);
    });
    
    it('should return 403 when regular user tries to unassign equipment', async () => {
      const response = await request(app)
        .patch(`/api/v1/equipment/${testEquipment._id}/unassign`)
        .set('Authorization', `Bearer ${regularToken}`);
      
      expect(response.status).toBe(403);
    });
  });
  
  describe('GET /api/v1/equipment/:id/history', () => {
    it('should return equipment history', async () => {
      const response = await request(app)
        .get(`/api/v1/equipment/${testEquipment._id}/history`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('maintenanceHistory');
      expect(response.body).toHaveProperty('assignmentHistory');
      expect(response.body).toHaveProperty('statusHistory');
      expect(Array.isArray(response.body.maintenanceHistory)).toBe(true);
      expect(Array.isArray(response.body.assignmentHistory)).toBe(true);
      expect(Array.isArray(response.body.statusHistory)).toBe(true);
    });
    
    it('should allow technicians to view equipment history', async () => {
      const response = await request(app)
        .get(`/api/v1/equipment/${testEquipment._id}/history`)
        .set('Authorization', `Bearer ${technicianToken}`);
      
      expect(response.status).toBe(200);
    });
    
    it('should return 403 when regular user tries to view equipment history', async () => {
      const response = await request(app)
        .get(`/api/v1/equipment/${testEquipment._id}/history`)
        .set('Authorization', `Bearer ${regularToken}`);
      
      expect(response.status).toBe(403);
    });
    
    it('should return 404 for non-existent equipment', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .get(`/api/v1/equipment/${nonExistentId}/history`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(404);
    });
  });
});