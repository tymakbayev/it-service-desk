const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../app');
const Incident = require('../models/incident.model');
const User = require('../models/user.model');
const Equipment = require('../models/equipment.model');
const Role = require('../models/role.model');
const config = require('../config/config');
const database = require('../config/database');
const { INCIDENT_STATUS, INCIDENT_PRIORITY } = require('../utils/constants');

// Mock services
jest.mock('../services/notification.service');
jest.mock('../services/email.service');
jest.mock('../services/websocket.service');

describe('Incident API', () => {
  let adminUser;
  let technicianUser;
  let regularUser;
  let adminToken;
  let technicianToken;
  let regularToken;
  let testEquipment;
  let testIncident;

  // Setup database connection before all tests
  beforeAll(async () => {
    await database.connect();
    
    // Clear collections
    await Incident.deleteMany({});
    await User.deleteMany({});
    await Equipment.deleteMany({});
    
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
      type: 'Laptop',
      serialNumber: 'SN12345678',
      model: 'ThinkPad X1',
      manufacturer: 'Lenovo',
      purchaseDate: new Date('2022-01-15'),
      warrantyExpiryDate: new Date('2025-01-15'),
      status: 'Active',
      location: 'Main Office',
      assignedTo: regularUser._id,
      specs: {
        cpu: 'Intel i7',
        ram: '16GB',
        storage: '512GB SSD',
        os: 'Windows 11'
      }
    });
    
    // Create test incident
    testIncident = await Incident.create({
      title: 'Test Incident',
      description: 'This is a test incident description',
      status: INCIDENT_STATUS.OPEN,
      priority: INCIDENT_PRIORITY.MEDIUM,
      reportedBy: regularUser._id,
      assignedTo: technicianUser._id,
      relatedEquipment: testEquipment._id,
      category: 'Hardware',
      subcategory: 'Laptop',
      location: 'Main Office',
      resolutionNotes: '',
      attachments: []
    });
  });
  
  // Close database connection after all tests
  afterAll(async () => {
    await Incident.deleteMany({});
    await User.deleteMany({});
    await Equipment.deleteMany({});
    await database.disconnect();
  });
  
  describe('GET /api/v1/incidents', () => {
    it('should return all incidents for admin user', async () => {
      const response = await request(app)
        .get('/api/v1/incidents')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('incidents');
      expect(response.body).toHaveProperty('totalCount');
      expect(Array.isArray(response.body.incidents)).toBe(true);
      expect(response.body.incidents.length).toBeGreaterThan(0);
    });
    
    it('should return assigned incidents for technician user', async () => {
      const response = await request(app)
        .get('/api/v1/incidents')
        .set('Authorization', `Bearer ${technicianToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('incidents');
      expect(Array.isArray(response.body.incidents)).toBe(true);
      
      // Technicians should see incidents assigned to them
      response.body.incidents.forEach(incident => {
        if (incident.assignedTo) {
          expect(incident.assignedTo._id.toString()).toBe(technicianUser._id.toString());
        }
      });
    });
    
    it('should return reported incidents for regular user', async () => {
      const response = await request(app)
        .get('/api/v1/incidents')
        .set('Authorization', `Bearer ${regularToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('incidents');
      expect(Array.isArray(response.body.incidents)).toBe(true);
      
      // Regular users should only see incidents they reported
      response.body.incidents.forEach(incident => {
        expect(incident.reportedBy._id.toString()).toBe(regularUser._id.toString());
      });
    });
    
    it('should filter incidents by status', async () => {
      const response = await request(app)
        .get(`/api/v1/incidents?status=${INCIDENT_STATUS.OPEN}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.incidents.every(incident => incident.status === INCIDENT_STATUS.OPEN)).toBe(true);
    });
    
    it('should filter incidents by priority', async () => {
      const response = await request(app)
        .get(`/api/v1/incidents?priority=${INCIDENT_PRIORITY.MEDIUM}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.incidents.every(incident => incident.priority === INCIDENT_PRIORITY.MEDIUM)).toBe(true);
    });
    
    it('should paginate results', async () => {
      const page = 1;
      const limit = 10;
      
      const response = await request(app)
        .get(`/api/v1/incidents?page=${page}&limit=${limit}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('incidents');
      expect(response.body).toHaveProperty('totalCount');
      expect(response.body).toHaveProperty('page', page);
      expect(response.body).toHaveProperty('limit', limit);
      expect(response.body.incidents.length).toBeLessThanOrEqual(limit);
    });
    
    it('should return 401 if not authenticated', async () => {
      const response = await request(app)
        .get('/api/v1/incidents');
      
      expect(response.status).toBe(401);
    });
  });
  
  describe('GET /api/v1/incidents/:id', () => {
    it('should return a specific incident by ID', async () => {
      const response = await request(app)
        .get(`/api/v1/incidents/${testIncident._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('_id', testIncident._id.toString());
      expect(response.body).toHaveProperty('title', testIncident.title);
      expect(response.body).toHaveProperty('description', testIncident.description);
      expect(response.body).toHaveProperty('status', testIncident.status);
      expect(response.body).toHaveProperty('priority', testIncident.priority);
    });
    
    it('should populate related fields', async () => {
      const response = await request(app)
        .get(`/api/v1/incidents/${testIncident._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('reportedBy');
      expect(response.body.reportedBy).toHaveProperty('_id', regularUser._id.toString());
      expect(response.body).toHaveProperty('assignedTo');
      expect(response.body.assignedTo).toHaveProperty('_id', technicianUser._id.toString());
      expect(response.body).toHaveProperty('relatedEquipment');
      expect(response.body.relatedEquipment).toHaveProperty('_id', testEquipment._id.toString());
    });
    
    it('should return 404 for non-existent incident', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/v1/incidents/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(404);
    });
    
    it('should return 401 if not authenticated', async () => {
      const response = await request(app)
        .get(`/api/v1/incidents/${testIncident._id}`);
      
      expect(response.status).toBe(401);
    });
    
    it('should return 403 if regular user tries to access another user\'s incident', async () => {
      // Create another user's incident
      const anotherUser = await User.create({
        username: 'another',
        email: 'another@example.com',
        password: 'hashedPassword123',
        firstName: 'Another',
        lastName: 'User',
        role: await Role.findOne({ name: config.ROLES.USER })._id,
        department: 'Finance',
        position: 'Accountant'
      });
      
      const anotherIncident = await Incident.create({
        title: 'Another Incident',
        description: 'This is another test incident',
        status: INCIDENT_STATUS.OPEN,
        priority: INCIDENT_PRIORITY.LOW,
        reportedBy: anotherUser._id,
        category: 'Software',
        subcategory: 'Email',
        location: 'Branch Office'
      });
      
      const response = await request(app)
        .get(`/api/v1/incidents/${anotherIncident._id}`)
        .set('Authorization', `Bearer ${regularToken}`);
      
      expect(response.status).toBe(403);
      
      // Clean up
      await Incident.findByIdAndDelete(anotherIncident._id);
      await User.findByIdAndDelete(anotherUser._id);
    });
  });
  
  describe('POST /api/v1/incidents', () => {
    it('should create a new incident', async () => {
      const newIncident = {
        title: 'New Test Incident',
        description: 'This is a new test incident description',
        priority: INCIDENT_PRIORITY.HIGH,
        category: 'Software',
        subcategory: 'Operating System',
        location: 'Remote Office',
        relatedEquipment: testEquipment._id
      };
      
      const response = await request(app)
        .post('/api/v1/incidents')
        .set('Authorization', `Bearer ${regularToken}`)
        .send(newIncident);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('title', newIncident.title);
      expect(response.body).toHaveProperty('description', newIncident.description);
      expect(response.body).toHaveProperty('status', INCIDENT_STATUS.OPEN); // Default status
      expect(response.body).toHaveProperty('priority', newIncident.priority);
      expect(response.body).toHaveProperty('reportedBy', regularUser._id.toString());
      
      // Clean up
      await Incident.findByIdAndDelete(response.body._id);
    });
    
    it('should return 400 for invalid incident data', async () => {
      const invalidIncident = {
        // Missing required title
        description: 'This is an invalid incident',
        priority: 'INVALID_PRIORITY', // Invalid priority
        category: 'Software'
      };
      
      const response = await request(app)
        .post('/api/v1/incidents')
        .set('Authorization', `Bearer ${regularToken}`)
        .send(invalidIncident);
      
      expect(response.status).toBe(400);
    });
    
    it('should return 401 if not authenticated', async () => {
      const newIncident = {
        title: 'Unauthenticated Incident',
        description: 'This should not be created',
        priority: INCIDENT_PRIORITY.MEDIUM,
        category: 'Hardware'
      };
      
      const response = await request(app)
        .post('/api/v1/incidents')
        .send(newIncident);
      
      expect(response.status).toBe(401);
    });
  });
  
  describe('PUT /api/v1/incidents/:id', () => {
    it('should update an existing incident', async () => {
      const updatedData = {
        title: 'Updated Incident Title',
        description: 'This is an updated description',
        status: INCIDENT_STATUS.IN_PROGRESS,
        priority: INCIDENT_PRIORITY.HIGH
      };
      
      const response = await request(app)
        .put(`/api/v1/incidents/${testIncident._id}`)
        .set('Authorization', `Bearer ${technicianToken}`)
        .send(updatedData);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('_id', testIncident._id.toString());
      expect(response.body).toHaveProperty('title', updatedData.title);
      expect(response.body).toHaveProperty('description', updatedData.description);
      expect(response.body).toHaveProperty('status', updatedData.status);
      expect(response.body).toHaveProperty('priority', updatedData.priority);
      
      // Verify the update in the database
      const updatedIncident = await Incident.findById(testIncident._id);
      expect(updatedIncident.title).toBe(updatedData.title);
      expect(updatedIncident.status).toBe(updatedData.status);
    });
    
    it('should allow admin to update any incident', async () => {
      const updatedData = {
        title: 'Admin Updated Title',
        status: INCIDENT_STATUS.RESOLVED,
        resolutionNotes: 'Resolved by admin'
      };
      
      const response = await request(app)
        .put(`/api/v1/incidents/${testIncident._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updatedData);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('title', updatedData.title);
      expect(response.body).toHaveProperty('status', updatedData.status);
      expect(response.body).toHaveProperty('resolutionNotes', updatedData.resolutionNotes);
    });
    
    it('should allow reporter to update only certain fields', async () => {
      // First, create an incident reported by regularUser
      const userIncident = await Incident.create({
        title: 'User Reported Incident',
        description: 'This is a user reported incident',
        status: INCIDENT_STATUS.OPEN,
        priority: INCIDENT_PRIORITY.LOW,
        reportedBy: regularUser._id,
        category: 'Software',
        subcategory: 'Application',
        location: 'Main Office'
      });
      
      // User should be able to update description but not status
      const updatedData = {
        description: 'Updated by user',
        status: INCIDENT_STATUS.RESOLVED // This should be ignored
      };
      
      const response = await request(app)
        .put(`/api/v1/incidents/${userIncident._id}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .send(updatedData);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('description', updatedData.description);
      expect(response.body).toHaveProperty('status', INCIDENT_STATUS.OPEN); // Status should not change
      
      // Clean up
      await Incident.findByIdAndDelete(userIncident._id);
    });
    
    it('should return 404 for non-existent incident', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/api/v1/incidents/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Updated Title' });
      
      expect(response.status).toBe(404);
    });
    
    it('should return 403 if regular user tries to update another user\'s incident', async () => {
      // Create another user's incident
      const anotherUser = await User.create({
        username: 'another2',
        email: 'another2@example.com',
        password: 'hashedPassword123',
        firstName: 'Another',
        lastName: 'User2',
        role: await Role.findOne({ name: config.ROLES.USER })._id,
        department: 'Finance',
        position: 'Accountant'
      });
      
      const anotherIncident = await Incident.create({
        title: 'Another Incident 2',
        description: 'This is another test incident',
        status: INCIDENT_STATUS.OPEN,
        priority: INCIDENT_PRIORITY.LOW,
        reportedBy: anotherUser._id,
        category: 'Software',
        subcategory: 'Email',
        location: 'Branch Office'
      });
      
      const response = await request(app)
        .put(`/api/v1/incidents/${anotherIncident._id}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .send({ description: 'Trying to update' });
      
      expect(response.status).toBe(403);
      
      // Clean up
      await Incident.findByIdAndDelete(anotherIncident._id);
      await User.findByIdAndDelete(anotherUser._id);
    });
  });
  
  describe('DELETE /api/v1/incidents/:id', () => {
    it('should allow admin to delete an incident', async () => {
      // Create a test incident to delete
      const incidentToDelete = await Incident.create({
        title: 'Incident to Delete',
        description: 'This incident will be deleted',
        status: INCIDENT_STATUS.OPEN,
        priority: INCIDENT_PRIORITY.LOW,
        reportedBy: regularUser._id,
        category: 'Hardware',
        subcategory: 'Printer',
        location: 'Main Office'
      });
      
      const response = await request(app)
        .delete(`/api/v1/incidents/${incidentToDelete._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Incident deleted successfully');
      
      // Verify the incident was deleted
      const deletedIncident = await Incident.findById(incidentToDelete._id);
      expect(deletedIncident).toBeNull();
    });
    
    it('should not allow technician to delete an incident', async () => {
      // Create a test incident
      const incidentToDelete = await Incident.create({
        title: 'Incident Technician Cannot Delete',
        description: 'This incident should not be deleted by technician',
        status: INCIDENT_STATUS.OPEN,
        priority: INCIDENT_PRIORITY.MEDIUM,
        reportedBy: regularUser._id,
        assignedTo: technicianUser._id,
        category: 'Software',
        subcategory: 'Email',
        location: 'Main Office'
      });
      
      const response = await request(app)
        .delete(`/api/v1/incidents/${incidentToDelete._id}`)
        .set('Authorization', `Bearer ${technicianToken}`);
      
      expect(response.status).toBe(403);
      
      // Verify the incident was not deleted
      const incident = await Incident.findById(incidentToDelete._id);
      expect(incident).not.toBeNull();
      
      // Clean up
      await Incident.findByIdAndDelete(incidentToDelete._id);
    });
    
    it('should not allow regular user to delete an incident', async () => {
      // Create a test incident
      const incidentToDelete = await Incident.create({
        title: 'Incident User Cannot Delete',
        description: 'This incident should not be deleted by user',
        status: INCIDENT_STATUS.OPEN,
        priority: INCIDENT_PRIORITY.LOW,
        reportedBy: regularUser._id,
        category: 'Hardware',
        subcategory: 'Monitor',
        location: 'Main Office'
      });
      
      const response = await request(app)
        .delete(`/api/v1/incidents/${incidentToDelete._id}`)
        .set('Authorization', `Bearer ${regularToken}`);
      
      expect(response.status).toBe(403);
      
      // Verify the incident was not deleted
      const incident = await Incident.findById(incidentToDelete._id);
      expect(incident).not.toBeNull();
      
      // Clean up
      await Incident.findByIdAndDelete(incidentToDelete._id);
    });
    
    it('should return 404 for non-existent incident', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/v1/incidents/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(404);
    });
  });
  
  describe('POST /api/v1/incidents/:id/assign', () => {
    it('should allow admin to assign an incident to a technician', async () => {
      const response = await request(app)
        .post(`/api/v1/incidents/${testIncident._id}/assign`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ assignedTo: technicianUser._id });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('assignedTo');
      expect(response.body.assignedTo).toHaveProperty('_id', technicianUser._id.toString());
      expect(response.body).toHaveProperty('status', INCIDENT_STATUS.ASSIGNED);
    });
    
    it('should allow technician to self-assign an incident', async () => {
      // Create a new unassigned incident
      const unassignedIncident = await Incident.create({
        title: 'Unassigned Incident',
        description: 'This incident is not assigned to anyone',
        status: INCIDENT_STATUS.OPEN,
        priority: INCIDENT_PRIORITY.MEDIUM,
        reportedBy: regularUser._id,
        category: 'Software',
        subcategory: 'Database',
        location: 'Main Office'
      });
      
      const response = await request(app)
        .post(`/api/v1/incidents/${unassignedIncident._id}/assign`)
        .set('Authorization', `Bearer ${technicianToken}`)
        .send({ assignedTo: technicianUser._id });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('assignedTo');
      expect(response.body.assignedTo).toHaveProperty('_id', technicianUser._id.toString());
      expect(response.body).toHaveProperty('status', INCIDENT_STATUS.ASSIGNED);
      
      // Clean up
      await Incident.findByIdAndDelete(unassignedIncident._id);
    });
    
    it('should not allow regular user to assign an incident', async () => {
      const response = await request(app)
        .post(`/api/v1/incidents/${testIncident._id}/assign`)
        .set('Authorization', `Bearer ${regularToken}`)
        .send({ assignedTo: technicianUser._id });
      
      expect(response.status).toBe(403);
    });
    
    it('should return 400 if assignedTo is missing', async () => {
      const response = await request(app)
        .post(`/api/v1/incidents/${testIncident._id}/assign`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});
      
      expect(response.status).toBe(400);
    });
    
    it('should return 404 for non-existent incident', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .post(`/api/v1/incidents/${nonExistentId}/assign`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ assignedTo: technicianUser._id });
      
      expect(response.status).toBe(404);
    });
  });
  
  describe('POST /api/v1/incidents/:id/status', () => {
    it('should allow admin to update incident status', async () => {
      const response = await request(app)
        .post(`/api/v1/incidents/${testIncident._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: INCIDENT_STATUS.RESOLVED, resolutionNotes: 'Issue resolved by admin' });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', INCIDENT_STATUS.RESOLVED);
      expect(response.body).toHaveProperty('resolutionNotes', 'Issue resolved by admin');
    });
    
    it('should allow assigned technician to update incident status', async () => {
      // First, update the incident back to IN_PROGRESS
      await Incident.findByIdAndUpdate(testIncident._id, {
        status: INCIDENT_STATUS.IN_PROGRESS,
        assignedTo: technicianUser._id
      });
      
      const response = await request(app)
        .post(`/api/v1/incidents/${testIncident._id}/status`)
        .set('Authorization', `Bearer ${technicianToken}`)
        .send({ status: INCIDENT_STATUS.RESOLVED, resolutionNotes: 'Fixed by technician' });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', INCIDENT_STATUS.RESOLVED);
      expect(response.body).toHaveProperty('resolutionNotes', 'Fixed by technician');
    });
    
    it('should not allow unassigned technician to update incident status', async () => {
      // Create another technician
      const anotherTechnician = await User.create({
        username: 'tech2',
        email: 'tech2@example.com',
        password: 'hashedPassword123',
        firstName: 'Another',
        lastName: 'Technician',
        role: await Role.findOne({ name: config.ROLES.TECHNICIAN })._id,
        department: 'IT',
        position: 'Support Specialist'
      });
      
      const anotherTechToken = jwt.sign(
        { id: anotherTechnician._id, role: config.ROLES.TECHNICIAN },
        config.JWT_SECRET,
        { expiresIn: config.JWT_EXPIRES_IN }
      );
      
      // Reset the incident status and assign to original technician
      await Incident.findByIdAndUpdate(testIncident._id, {
        status: INCIDENT_STATUS.IN_PROGRESS,
        assignedTo: technicianUser._id
      });
      
      const response = await request(app)
        .post(`/api/v1/incidents/${testIncident._id}/status`)
        .set('Authorization', `Bearer ${anotherTechToken}`)
        .send({ status: INCIDENT_STATUS.RESOLVED });
      
      expect(response.status).toBe(403);
      
      // Clean up
      await User.findByIdAndDelete(anotherTechnician._id);
    });
    
    it('should not allow regular user to update incident status', async () => {
      const response = await request(app)
        .post(`/api/v1/incidents/${testIncident._id}/status`)
        .set('Authorization', `Bearer ${regularToken}`)
        .send({ status: INCIDENT_STATUS.RESOLVED });
      
      expect(response.status).toBe(403);
    });
    
    it('should return 400 for invalid status', async () => {
      const response = await request(app)
        .post(`/api/v1/incidents/${testIncident._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'INVALID_STATUS' });
      
      expect(response.status).toBe(400);
    });
    
    it('should require resolution notes when resolving an incident', async () => {
      // Reset the incident status
      await Incident.findByIdAndUpdate(testIncident._id, {
        status: INCIDENT_STATUS.IN_PROGRESS,
        assignedTo: technicianUser._id
      });
      
      const response = await request(app)
        .post(`/api/v1/incidents/${testIncident._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: INCIDENT_STATUS.RESOLVED }); // Missing resolutionNotes
      
      expect(response.status).toBe(400);
    });
  });
  
  describe('GET /api/v1/incidents/stats', () => {
    it('should return incident statistics for admin', async () => {
      const response = await request(app)
        .get('/api/v1/incidents/stats')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalIncidents');
      expect(response.body).toHaveProperty('byStatus');
      expect(response.body).toHaveProperty('byPriority');
      expect(response.body).toHaveProperty('byCategory');
      expect(response.body).toHaveProperty('averageResolutionTime');
    });
    
    it('should return limited statistics for technician', async () => {
      const response = await request(app)
        .get('/api/v1/incidents/stats')
        .set('Authorization', `Bearer ${technicianToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalAssigned');
      expect(response.body).toHaveProperty('byStatus');
      expect(response.body).toHaveProperty('byPriority');
    });
    
    it('should return basic statistics for regular user', async () => {
      const response = await request(app)
        .get('/api/v1/incidents/stats')
        .set('Authorization', `Bearer ${regularToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalReported');
      expect(response.body).toHaveProperty('byStatus');
    });
    
    it('should return 401 if not authenticated', async () => {
      const response = await request(app)
        .get('/api/v1/incidents/stats');
      
      expect(response.status).toBe(401);
    });
  });
  
  describe('POST /api/v1/incidents/:id/comments', () => {
    it('should add a comment to an incident', async () => {
      const commentData = {
        content: 'This is a test comment'
      };
      
      const response = await request(app)
        .post(`/api/v1/incidents/${testIncident._id}/comments`)
        .set('Authorization', `Bearer ${technicianToken}`)
        .send(commentData);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('comments');
      expect(response.body.comments.length).toBeGreaterThan(0);
      expect(response.body.comments[0]).toHaveProperty('content', commentData.content);
      expect(response.body.comments[0]).toHaveProperty('author');
      expect(response.body.comments[0].author).toHaveProperty('_id', technicianUser._id.toString());
    });
    
    it('should allow regular user to comment on their incident', async () => {
      // Create an incident reported by regularUser
      const userIncident = await Incident.create({
        title: 'User Incident for Comment',
        description: 'This is a user incident for commenting',
        status: INCIDENT_STATUS.OPEN,
        priority: INCIDENT_PRIORITY.LOW,
        reportedBy: regularUser._id,
        category: 'Software',
        subcategory: 'Application',
        location: 'Main Office'
      });
      
      const commentData = {
        content: 'Comment from the reporter'
      };
      
      const response = await request(app)
        .post(`/api/v1/incidents/${userIncident._id}/comments`)
        .set('Authorization', `Bearer ${regularToken}`)
        .send(commentData);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('comments');
      expect(response.body.comments.length).toBe(1);
      expect(response.body.comments[0]).toHaveProperty('content', commentData.content);
      expect(response.body.comments[0]).toHaveProperty('author');
      expect(response.body.comments[0].author).toHaveProperty('_id', regularUser._id.toString());
      
      // Clean up
      await Incident.findByIdAndDelete(userIncident._id);
    });
    
    it('should return 400 for empty comment', async () => {
      const response = await request(app)
        .post(`/api/v1/incidents/${testIncident._id}/comments`)
        .set('Authorization', `Bearer ${technicianToken}`)
        .send({ content: '' });
      
      expect(response.status).toBe(400);
    });
    
    it('should return 404 for non-existent incident', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .post(`/api/v1/incidents/${nonExistentId}/comments`)
        .set('Authorization', `Bearer ${technicianToken}`)
        .send({ content: 'Test comment' });
      
      expect(response.status).toBe(404);
    });
  });
  
  describe('GET /api/v1/incidents/search', () => {
    it('should search incidents by keyword', async () => {
      const response = await request(app)
        .get('/api/v1/incidents/search?q=test')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('incidents');
      expect(Array.isArray(response.body.incidents)).toBe(true);
      
      // All returned incidents should contain the search term in title or description
      response.body.incidents.forEach(incident => {
        const matchesTitle = incident.title.toLowerCase().includes('test');
        const matchesDescription = incident.description.toLowerCase().includes('test');
        expect(matchesTitle || matchesDescription).toBe(true);
      });
    });
    
    it('should return empty array for no matches', async () => {
      const response = await request(app)
        .get('/api/v1/incidents/search?q=nonexistentterm123456789')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('incidents');
      expect(response.body.incidents).toHaveLength(0);
    });
    
    it('should filter search results by status', async () => {
      const response = await request(app)
        .get(`/api/v1/incidents/search?q=test&status=${INCIDENT_STATUS.OPEN}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('incidents');
      
      // All returned incidents should have the specified status
      response.body.incidents.forEach(incident => {
        expect(incident.status).toBe(INCIDENT_STATUS.OPEN);
      });
    });
    
    it('should limit search results for regular users to their own incidents', async () => {
      const response = await request(app)
        .get('/api/v1/incidents/search?q=test')
        .set('Authorization', `Bearer ${regularToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('incidents');
      
      // All returned incidents should be reported by the regular user
      response.body.incidents.forEach(incident => {
        expect(incident.reportedBy._id.toString()).toBe(regularUser._id.toString());
      });
    });
  });
});