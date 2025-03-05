const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../app');
const Report = require('../models/report.model');
const User = require('../models/user.model');
const Incident = require('../models/incident.model');
const Equipment = require('../models/equipment.model');
const Role = require('../models/role.model');
const config = require('../config/config');
const database = require('../config/database');
const { REPORT_TYPES } = require('../utils/constants');
const reportService = require('../services/report.service');

// Mock services
jest.mock('../services/notification.service');
jest.mock('../services/email.service');
jest.mock('../services/websocket.service');

// Mock report generation functions
jest.mock('../services/report.service', () => ({
  generatePdfReport: jest.fn().mockResolvedValue(Buffer.from('mock-pdf-content')),
  generateExcelReport: jest.fn().mockResolvedValue(Buffer.from('mock-excel-content')),
  generateIncidentReport: jest.fn().mockResolvedValue({
    data: [{ id: 'incident-1', title: 'Test Incident' }],
    summary: { total: 1, open: 1, closed: 0 }
  }),
  generateEquipmentReport: jest.fn().mockResolvedValue({
    data: [{ id: 'equipment-1', name: 'Test Equipment' }],
    summary: { total: 1, active: 1, maintenance: 0 }
  }),
  generateUserActivityReport: jest.fn().mockResolvedValue({
    data: [{ id: 'user-1', username: 'testuser', activityCount: 5 }],
    summary: { totalUsers: 1, totalActivities: 5 }
  })
}));

describe('Report API', () => {
  let adminUser;
  let technicianUser;
  let regularUser;
  let adminToken;
  let technicianToken;
  let regularToken;
  let testReport;

  // Setup database connection before all tests
  beforeAll(async () => {
    await database.connect();
    
    // Clear collections
    await Report.deleteMany({});
    await User.deleteMany({});
    await Incident.deleteMany({});
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
    
    // Create test report
    testReport = await Report.create({
      name: 'Test Incident Report',
      type: REPORT_TYPES.INCIDENT,
      format: 'pdf',
      parameters: {
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
        status: 'all',
        priority: 'all'
      },
      createdBy: adminUser._id,
      fileUrl: '/reports/incident-report-123456.pdf',
      summary: {
        totalIncidents: 10,
        openIncidents: 3,
        closedIncidents: 7,
        highPriority: 2
      }
    });
  });
  
  // Close database connection after all tests
  afterAll(async () => {
    await Report.deleteMany({});
    await User.deleteMany({});
    await database.disconnect();
  });
  
  describe('GET /api/v1/reports', () => {
    it('should return all reports for admin user', async () => {
      const response = await request(app)
        .get('/api/v1/reports')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('name', 'Test Incident Report');
    });
    
    it('should return reports for technician user', async () => {
      const response = await request(app)
        .get('/api/v1/reports')
        .set('Authorization', `Bearer ${technicianToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
    
    it('should return 403 for regular user', async () => {
      const response = await request(app)
        .get('/api/v1/reports')
        .set('Authorization', `Bearer ${regularToken}`);
      
      expect(response.status).toBe(403);
    });
    
    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .get('/api/v1/reports');
      
      expect(response.status).toBe(401);
    });
  });
  
  describe('GET /api/v1/reports/:id', () => {
    it('should return a specific report for admin user', async () => {
      const response = await request(app)
        .get(`/api/v1/reports/${testReport._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', 'Test Incident Report');
      expect(response.body).toHaveProperty('type', REPORT_TYPES.INCIDENT);
      expect(response.body).toHaveProperty('format', 'pdf');
    });
    
    it('should return 404 for non-existent report', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/v1/reports/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(404);
    });
    
    it('should return 403 for regular user', async () => {
      const response = await request(app)
        .get(`/api/v1/reports/${testReport._id}`)
        .set('Authorization', `Bearer ${regularToken}`);
      
      expect(response.status).toBe(403);
    });
  });
  
  describe('POST /api/v1/reports', () => {
    it('should create a new incident report for admin user', async () => {
      const newReport = {
        name: 'Monthly Incident Summary',
        type: REPORT_TYPES.INCIDENT,
        format: 'pdf',
        parameters: {
          startDate: '2023-01-01',
          endDate: '2023-01-31',
          status: 'all',
          priority: 'high'
        }
      };
      
      const response = await request(app)
        .post('/api/v1/reports')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newReport);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('name', 'Monthly Incident Summary');
      expect(response.body).toHaveProperty('type', REPORT_TYPES.INCIDENT);
      expect(response.body).toHaveProperty('createdBy');
      expect(response.body.createdBy.toString()).toBe(adminUser._id.toString());
    });
    
    it('should create a new equipment report for technician user', async () => {
      const newReport = {
        name: 'Equipment Inventory',
        type: REPORT_TYPES.EQUIPMENT,
        format: 'excel',
        parameters: {
          status: 'active',
          type: 'laptop',
          department: 'all'
        }
      };
      
      const response = await request(app)
        .post('/api/v1/reports')
        .set('Authorization', `Bearer ${technicianToken}`)
        .send(newReport);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('name', 'Equipment Inventory');
      expect(response.body).toHaveProperty('type', REPORT_TYPES.EQUIPMENT);
      expect(response.body).toHaveProperty('format', 'excel');
    });
    
    it('should return 400 for invalid report data', async () => {
      const invalidReport = {
        name: '',  // Empty name
        type: 'INVALID_TYPE',  // Invalid type
        format: 'pdf'
      };
      
      const response = await request(app)
        .post('/api/v1/reports')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidReport);
      
      expect(response.status).toBe(400);
    });
    
    it('should return 403 for regular user', async () => {
      const newReport = {
        name: 'My Report',
        type: REPORT_TYPES.INCIDENT,
        format: 'pdf',
        parameters: {
          startDate: '2023-01-01',
          endDate: '2023-01-31'
        }
      };
      
      const response = await request(app)
        .post('/api/v1/reports')
        .set('Authorization', `Bearer ${regularToken}`)
        .send(newReport);
      
      expect(response.status).toBe(403);
    });
  });
  
  describe('DELETE /api/v1/reports/:id', () => {
    it('should delete a report for admin user', async () => {
      // Create a report to delete
      const reportToDelete = await Report.create({
        name: 'Report to Delete',
        type: REPORT_TYPES.EQUIPMENT,
        format: 'pdf',
        parameters: {},
        createdBy: adminUser._id,
        fileUrl: '/reports/temp-report.pdf'
      });
      
      const response = await request(app)
        .delete(`/api/v1/reports/${reportToDelete._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Report deleted successfully');
      
      // Verify report is deleted
      const deletedReport = await Report.findById(reportToDelete._id);
      expect(deletedReport).toBeNull();
    });
    
    it('should return 404 for non-existent report', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/v1/reports/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(404);
    });
    
    it('should return 403 for technician trying to delete admin report', async () => {
      const response = await request(app)
        .delete(`/api/v1/reports/${testReport._id}`)
        .set('Authorization', `Bearer ${technicianToken}`);
      
      expect(response.status).toBe(403);
    });
  });
  
  describe('GET /api/v1/reports/:id/download', () => {
    it('should download a PDF report for admin user', async () => {
      // Create a PDF report
      const pdfReport = await Report.create({
        name: 'PDF Report',
        type: REPORT_TYPES.INCIDENT,
        format: 'pdf',
        parameters: {},
        createdBy: adminUser._id,
        fileUrl: '/reports/test-pdf-report.pdf'
      });
      
      const response = await request(app)
        .get(`/api/v1/reports/${pdfReport._id}/download`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('application/pdf');
      expect(response.headers['content-disposition']).toContain('attachment');
      expect(response.headers['content-disposition']).toContain('PDF Report.pdf');
    });
    
    it('should download an Excel report for technician user', async () => {
      // Create an Excel report
      const excelReport = await Report.create({
        name: 'Excel Report',
        type: REPORT_TYPES.EQUIPMENT,
        format: 'excel',
        parameters: {},
        createdBy: technicianUser._id,
        fileUrl: '/reports/test-excel-report.xlsx'
      });
      
      const response = await request(app)
        .get(`/api/v1/reports/${excelReport._id}/download`)
        .set('Authorization', `Bearer ${technicianToken}`);
      
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      expect(response.headers['content-disposition']).toContain('attachment');
      expect(response.headers['content-disposition']).toContain('Excel Report.xlsx');
    });
    
    it('should return 404 for non-existent report', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/v1/reports/${nonExistentId}/download`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(404);
    });
    
    it('should return 403 for regular user', async () => {
      const response = await request(app)
        .get(`/api/v1/reports/${testReport._id}/download`)
        .set('Authorization', `Bearer ${regularToken}`);
      
      expect(response.status).toBe(403);
    });
  });
  
  describe('POST /api/v1/reports/generate', () => {
    it('should generate an incident report for admin user', async () => {
      const reportParams = {
        type: REPORT_TYPES.INCIDENT,
        format: 'pdf',
        parameters: {
          startDate: '2023-01-01',
          endDate: '2023-12-31',
          status: 'all',
          priority: 'all'
        },
        save: true,
        name: 'Generated Incident Report'
      };
      
      const response = await request(app)
        .post('/api/v1/reports/generate')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(reportParams);
      
      expect(response.status).toBe(200);
      expect(reportService.generatePdfReport).toHaveBeenCalled();
      expect(response.headers['content-type']).toContain('application/pdf');
      expect(response.headers['content-disposition']).toContain('attachment');
    });
    
    it('should generate an equipment report for technician user', async () => {
      const reportParams = {
        type: REPORT_TYPES.EQUIPMENT,
        format: 'excel',
        parameters: {
          status: 'active',
          type: 'all'
        },
        save: true,
        name: 'Generated Equipment Report'
      };
      
      const response = await request(app)
        .post('/api/v1/reports/generate')
        .set('Authorization', `Bearer ${technicianToken}`)
        .send(reportParams);
      
      expect(response.status).toBe(200);
      expect(reportService.generateExcelReport).toHaveBeenCalled();
      expect(response.headers['content-type']).toContain('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      expect(response.headers['content-disposition']).toContain('attachment');
    });
    
    it('should return 400 for invalid report parameters', async () => {
      const invalidParams = {
        type: 'INVALID_TYPE',
        format: 'pdf',
        parameters: {}
      };
      
      const response = await request(app)
        .post('/api/v1/reports/generate')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidParams);
      
      expect(response.status).toBe(400);
    });
    
    it('should return 403 for regular user', async () => {
      const reportParams = {
        type: REPORT_TYPES.INCIDENT,
        format: 'pdf',
        parameters: {
          startDate: '2023-01-01',
          endDate: '2023-12-31'
        }
      };
      
      const response = await request(app)
        .post('/api/v1/reports/generate')
        .set('Authorization', `Bearer ${regularToken}`)
        .send(reportParams);
      
      expect(response.status).toBe(403);
    });
  });
  
  describe('GET /api/v1/reports/types', () => {
    it('should return all available report types for admin user', async () => {
      const response = await request(app)
        .get('/api/v1/reports/types')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('types');
      expect(Array.isArray(response.body.types)).toBe(true);
      expect(response.body.types).toContain(REPORT_TYPES.INCIDENT);
      expect(response.body.types).toContain(REPORT_TYPES.EQUIPMENT);
      expect(response.body.types).toContain(REPORT_TYPES.USER_ACTIVITY);
    });
    
    it('should return report types for technician user', async () => {
      const response = await request(app)
        .get('/api/v1/reports/types')
        .set('Authorization', `Bearer ${technicianToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('types');
      expect(Array.isArray(response.body.types)).toBe(true);
    });
    
    it('should return 403 for regular user', async () => {
      const response = await request(app)
        .get('/api/v1/reports/types')
        .set('Authorization', `Bearer ${regularToken}`);
      
      expect(response.status).toBe(403);
    });
  });
  
  describe('GET /api/v1/reports/formats', () => {
    it('should return all available report formats for admin user', async () => {
      const response = await request(app)
        .get('/api/v1/reports/formats')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('formats');
      expect(Array.isArray(response.body.formats)).toBe(true);
      expect(response.body.formats).toContain('pdf');
      expect(response.body.formats).toContain('excel');
    });
    
    it('should return report formats for technician user', async () => {
      const response = await request(app)
        .get('/api/v1/reports/formats')
        .set('Authorization', `Bearer ${technicianToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('formats');
      expect(Array.isArray(response.body.formats)).toBe(true);
    });
    
    it('should return 403 for regular user', async () => {
      const response = await request(app)
        .get('/api/v1/reports/formats')
        .set('Authorization', `Bearer ${regularToken}`);
      
      expect(response.status).toBe(403);
    });
  });
});