const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../app');
const User = require('../models/user.model');
const Incident = require('../models/incident.model');
const Equipment = require('../models/equipment.model');
const Role = require('../models/role.model');
const config = require('../config/config');
const database = require('../config/database');
const dashboardService = require('../services/dashboard.service');
const { INCIDENT_STATUS, INCIDENT_PRIORITY, EQUIPMENT_STATUS } = require('../utils/constants');

// Mock services
jest.mock('../services/notification.service');
jest.mock('../services/websocket.service');

describe('Dashboard API', () => {
  let adminUser;
  let technicianUser;
  let regularUser;
  let adminToken;
  let technicianToken;
  let regularToken;
  let testIncidents = [];
  let testEquipment = [];

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
    const equipmentData = [
      {
        name: 'Laptop 1',
        type: 'Laptop',
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
        }
      },
      {
        name: 'Desktop 1',
        type: 'Desktop',
        serialNumber: 'SN87654321',
        model: 'OptiPlex 7080',
        manufacturer: 'Dell',
        purchaseDate: new Date('2021-05-10'),
        warrantyExpiryDate: new Date('2024-05-10'),
        status: EQUIPMENT_STATUS.ACTIVE,
        location: 'Main Office',
        assignedTo: technicianUser._id,
        specs: {
          cpu: 'Intel i5',
          ram: '8GB',
          storage: '256GB SSD',
          os: 'Windows 10'
        }
      },
      {
        name: 'Printer 1',
        type: 'Printer',
        serialNumber: 'PR123456',
        model: 'LaserJet Pro',
        manufacturer: 'HP',
        purchaseDate: new Date('2020-11-20'),
        warrantyExpiryDate: new Date('2023-11-20'),
        status: EQUIPMENT_STATUS.MAINTENANCE,
        location: 'Marketing Department',
        assignedTo: null,
        specs: {
          type: 'Laser',
          color: true,
          duplexPrinting: true
        }
      },
      {
        name: 'Server 1',
        type: 'Server',
        serialNumber: 'SRV987654',
        model: 'PowerEdge R740',
        manufacturer: 'Dell',
        purchaseDate: new Date('2021-02-05'),
        warrantyExpiryDate: new Date('2026-02-05'),
        status: EQUIPMENT_STATUS.ACTIVE,
        location: 'Server Room',
        assignedTo: null,
        specs: {
          cpu: 'Intel Xeon',
          ram: '64GB',
          storage: '4TB RAID',
          os: 'Ubuntu Server'
        }
      },
      {
        name: 'Monitor 1',
        type: 'Monitor',
        serialNumber: 'MON123456',
        model: 'UltraSharp 27',
        manufacturer: 'Dell',
        purchaseDate: new Date('2022-03-15'),
        warrantyExpiryDate: new Date('2025-03-15'),
        status: EQUIPMENT_STATUS.INACTIVE,
        location: 'Storage',
        assignedTo: null,
        specs: {
          size: '27 inch',
          resolution: '4K',
          refreshRate: '60Hz'
        }
      }
    ];
    
    for (const equipment of equipmentData) {
      testEquipment.push(await Equipment.create(equipment));
    }
    
    // Create test incidents
    const incidentData = [
      {
        title: 'Software Installation Issue',
        description: 'Need help installing design software on my laptop',
        status: INCIDENT_STATUS.OPEN,
        priority: INCIDENT_PRIORITY.MEDIUM,
        reportedBy: regularUser._id,
        assignedTo: technicianUser._id,
        equipment: testEquipment[0]._id,
        category: 'Software',
        comments: [
          {
            text: 'I will look into this today',
            user: technicianUser._id,
            createdAt: new Date('2023-05-10T10:30:00Z')
          }
        ]
      },
      {
        title: 'Network Connectivity Problem',
        description: 'Cannot connect to the company network from my desk',
        status: INCIDENT_STATUS.IN_PROGRESS,
        priority: INCIDENT_PRIORITY.HIGH,
        reportedBy: regularUser._id,
        assignedTo: technicianUser._id,
        equipment: null,
        category: 'Network',
        comments: [
          {
            text: 'I will check the network switch',
            user: technicianUser._id,
            createdAt: new Date('2023-05-11T09:15:00Z')
          },
          {
            text: 'Switch has been reset, please check now',
            user: technicianUser._id,
            createdAt: new Date('2023-05-11T10:30:00Z')
          }
        ]
      },
      {
        title: 'Printer Not Working',
        description: 'Marketing department printer is showing error code E04',
        status: INCIDENT_STATUS.RESOLVED,
        priority: INCIDENT_PRIORITY.MEDIUM,
        reportedBy: regularUser._id,
        assignedTo: technicianUser._id,
        equipment: testEquipment[2]._id,
        category: 'Hardware',
        resolution: 'Replaced toner cartridge and reset printer',
        resolvedAt: new Date('2023-05-09T14:45:00Z'),
        comments: [
          {
            text: 'Will check the printer this afternoon',
            user: technicianUser._id,
            createdAt: new Date('2023-05-09T11:00:00Z')
          },
          {
            text: 'Issue resolved - replaced toner',
            user: technicianUser._id,
            createdAt: new Date('2023-05-09T14:45:00Z')
          }
        ]
      },
      {
        title: 'Email Access Issue',
        description: 'Cannot access my company email from my phone',
        status: INCIDENT_STATUS.CLOSED,
        priority: INCIDENT_PRIORITY.LOW,
        reportedBy: regularUser._id,
        assignedTo: technicianUser._id,
        equipment: null,
        category: 'Email',
        resolution: 'Reconfigured email client settings on mobile device',
        resolvedAt: new Date('2023-05-08T16:30:00Z'),
        closedAt: new Date('2023-05-08T16:35:00Z'),
        comments: [
          {
            text: 'Please try the new settings I emailed you',
            user: technicianUser._id,
            createdAt: new Date('2023-05-08T15:00:00Z')
          },
          {
            text: 'Settings applied and working now, thanks!',
            user: regularUser._id,
            createdAt: new Date('2023-05-08T16:25:00Z')
          }
        ]
      },
      {
        title: 'Server Maintenance',
        description: 'Scheduled maintenance for file server',
        status: INCIDENT_STATUS.SCHEDULED,
        priority: INCIDENT_PRIORITY.LOW,
        reportedBy: adminUser._id,
        assignedTo: technicianUser._id,
        equipment: testEquipment[3]._id,
        category: 'Maintenance',
        scheduledFor: new Date('2023-05-15T22:00:00Z'),
        comments: [
          {
            text: 'Maintenance scheduled for Sunday night',
            user: adminUser._id,
            createdAt: new Date('2023-05-07T09:00:00Z')
          }
        ]
      }
    ];
    
    for (const incident of incidentData) {
      testIncidents.push(await Incident.create(incident));
    }
  });
  
  // Close database connection after all tests
  afterAll(async () => {
    await Incident.deleteMany({});
    await Equipment.deleteMany({});
    await User.deleteMany({});
    await database.disconnect();
  });
  
  describe('GET /api/v1/dashboard/summary', () => {
    it('should return dashboard summary for admin users', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/summary')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('incidentStats');
      expect(response.body).toHaveProperty('equipmentStats');
      expect(response.body).toHaveProperty('recentIncidents');
      expect(response.body).toHaveProperty('performanceMetrics');
      
      // Verify incident stats
      expect(response.body.incidentStats).toHaveProperty('total');
      expect(response.body.incidentStats).toHaveProperty('byStatus');
      expect(response.body.incidentStats).toHaveProperty('byPriority');
      
      // Verify equipment stats
      expect(response.body.equipmentStats).toHaveProperty('total');
      expect(response.body.equipmentStats).toHaveProperty('byStatus');
      expect(response.body.equipmentStats).toHaveProperty('byType');
      
      // Verify recent incidents
      expect(Array.isArray(response.body.recentIncidents)).toBe(true);
      
      // Verify performance metrics
      expect(response.body.performanceMetrics).toHaveProperty('averageResolutionTime');
      expect(response.body.performanceMetrics).toHaveProperty('resolvedLastWeek');
      expect(response.body.performanceMetrics).toHaveProperty('openByTechnician');
    });
    
    it('should return dashboard summary for technician users', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/summary')
        .set('Authorization', `Bearer ${technicianToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('incidentStats');
      expect(response.body).toHaveProperty('equipmentStats');
      expect(response.body).toHaveProperty('recentIncidents');
      expect(response.body).toHaveProperty('performanceMetrics');
    });
    
    it('should return limited dashboard summary for regular users', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/summary')
        .set('Authorization', `Bearer ${regularToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('incidentStats');
      expect(response.body).toHaveProperty('recentIncidents');
      
      // Regular users should only see their own incidents
      response.body.recentIncidents.forEach(incident => {
        expect(incident.reportedBy._id.toString()).toBe(regularUser._id.toString());
      });
      
      // Regular users should not see performance metrics
      expect(response.body).not.toHaveProperty('performanceMetrics');
    });
    
    it('should return 401 for unauthenticated requests', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/summary');
      
      expect(response.status).toBe(401);
    });
  });
  
  describe('GET /api/v1/dashboard/incidents-by-status', () => {
    it('should return incidents grouped by status', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/incidents-by-status')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      
      // Verify structure of returned data
      const statusData = response.body.data;
      expect(statusData.length).toBeGreaterThan(0);
      
      statusData.forEach(item => {
        expect(item).toHaveProperty('status');
        expect(item).toHaveProperty('count');
      });
      
      // Verify all statuses are represented
      const statuses = statusData.map(item => item.status);
      expect(statuses).toContain(INCIDENT_STATUS.OPEN);
      expect(statuses).toContain(INCIDENT_STATUS.IN_PROGRESS);
      expect(statuses).toContain(INCIDENT_STATUS.RESOLVED);
    });
    
    it('should return 401 for unauthenticated requests', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/incidents-by-status');
      
      expect(response.status).toBe(401);
    });
  });
  
  describe('GET /api/v1/dashboard/incidents-by-priority', () => {
    it('should return incidents grouped by priority', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/incidents-by-priority')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      
      // Verify structure of returned data
      const priorityData = response.body.data;
      expect(priorityData.length).toBeGreaterThan(0);
      
      priorityData.forEach(item => {
        expect(item).toHaveProperty('priority');
        expect(item).toHaveProperty('count');
      });
      
      // Verify all priorities are represented
      const priorities = priorityData.map(item => item.priority);
      expect(priorities).toContain(INCIDENT_PRIORITY.HIGH);
      expect(priorities).toContain(INCIDENT_PRIORITY.MEDIUM);
      expect(priorities).toContain(INCIDENT_PRIORITY.LOW);
    });
    
    it('should return 401 for unauthenticated requests', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/incidents-by-priority');
      
      expect(response.status).toBe(401);
    });
  });
  
  describe('GET /api/v1/dashboard/equipment-by-status', () => {
    it('should return equipment grouped by status', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/equipment-by-status')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      
      // Verify structure of returned data
      const statusData = response.body.data;
      expect(statusData.length).toBeGreaterThan(0);
      
      statusData.forEach(item => {
        expect(item).toHaveProperty('status');
        expect(item).toHaveProperty('count');
      });
      
      // Verify all statuses are represented
      const statuses = statusData.map(item => item.status);
      expect(statuses).toContain(EQUIPMENT_STATUS.ACTIVE);
      expect(statuses).toContain(EQUIPMENT_STATUS.MAINTENANCE);
      expect(statuses).toContain(EQUIPMENT_STATUS.INACTIVE);
    });
    
    it('should return 401 for unauthenticated requests', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/equipment-by-status');
      
      expect(response.status).toBe(401);
    });
    
    it('should return 403 for regular users', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/equipment-by-status')
        .set('Authorization', `Bearer ${regularToken}`);
      
      expect(response.status).toBe(403);
    });
  });
  
  describe('GET /api/v1/dashboard/equipment-by-type', () => {
    it('should return equipment grouped by type', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/equipment-by-type')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      
      // Verify structure of returned data
      const typeData = response.body.data;
      expect(typeData.length).toBeGreaterThan(0);
      
      typeData.forEach(item => {
        expect(item).toHaveProperty('type');
        expect(item).toHaveProperty('count');
      });
      
      // Verify equipment types are represented
      const types = typeData.map(item => item.type);
      expect(types).toContain('Laptop');
      expect(types).toContain('Desktop');
      expect(types).toContain('Printer');
      expect(types).toContain('Server');
      expect(types).toContain('Monitor');
    });
    
    it('should return 401 for unauthenticated requests', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/equipment-by-type');
      
      expect(response.status).toBe(401);
    });
    
    it('should return 403 for regular users', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/equipment-by-type')
        .set('Authorization', `Bearer ${regularToken}`);
      
      expect(response.status).toBe(403);
    });
  });
  
  describe('GET /api/v1/dashboard/incidents-over-time', () => {
    it('should return incidents created over time', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/incidents-over-time')
        .query({ period: 'month' })
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      
      // Verify structure of returned data
      const timeData = response.body.data;
      
      timeData.forEach(item => {
        expect(item).toHaveProperty('date');
        expect(item).toHaveProperty('count');
      });
    });
    
    it('should accept different period parameters', async () => {
      const periods = ['week', 'month', 'quarter', 'year'];
      
      for (const period of periods) {
        const response = await request(app)
          .get('/api/v1/dashboard/incidents-over-time')
          .query({ period })
          .set('Authorization', `Bearer ${adminToken}`);
        
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('data');
      }
    });
    
    it('should return 400 for invalid period parameter', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/incidents-over-time')
        .query({ period: 'invalid' })
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(400);
    });
    
    it('should return 401 for unauthenticated requests', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/incidents-over-time')
        .query({ period: 'month' });
      
      expect(response.status).toBe(401);
    });
  });
  
  describe('GET /api/v1/dashboard/performance-metrics', () => {
    it('should return performance metrics for admin users', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/performance-metrics')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('averageResolutionTime');
      expect(response.body).toHaveProperty('resolvedLastWeek');
      expect(response.body).toHaveProperty('openByTechnician');
      
      // Verify structure of technician data
      expect(Array.isArray(response.body.openByTechnician)).toBe(true);
      if (response.body.openByTechnician.length > 0) {
        const technicianData = response.body.openByTechnician[0];
        expect(technicianData).toHaveProperty('technician');
        expect(technicianData).toHaveProperty('count');
        expect(technicianData.technician).toHaveProperty('_id');
        expect(technicianData.technician).toHaveProperty('firstName');
        expect(technicianData.technician).toHaveProperty('lastName');
      }
    });
    
    it('should return performance metrics for technician users', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/performance-metrics')
        .set('Authorization', `Bearer ${technicianToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('averageResolutionTime');
      expect(response.body).toHaveProperty('resolvedLastWeek');
      
      // Technicians should only see their own metrics
      expect(response.body).toHaveProperty('personalMetrics');
      expect(response.body.personalMetrics).toHaveProperty('openIncidents');
      expect(response.body.personalMetrics).toHaveProperty('resolvedLastWeek');
      expect(response.body.personalMetrics).toHaveProperty('averageResolutionTime');
    });
    
    it('should return 403 for regular users', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/performance-metrics')
        .set('Authorization', `Bearer ${regularToken}`);
      
      expect(response.status).toBe(403);
    });
    
    it('should return 401 for unauthenticated requests', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/performance-metrics');
      
      expect(response.status).toBe(401);
    });
  });
  
  describe('GET /api/v1/dashboard/recent-incidents', () => {
    it('should return recent incidents for admin users', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/recent-incidents')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('incidents');
      expect(Array.isArray(response.body.incidents)).toBe(true);
      
      if (response.body.incidents.length > 0) {
        const incident = response.body.incidents[0];
        expect(incident).toHaveProperty('_id');
        expect(incident).toHaveProperty('title');
        expect(incident).toHaveProperty('status');
        expect(incident).toHaveProperty('priority');
        expect(incident).toHaveProperty('reportedBy');
        expect(incident).toHaveProperty('createdAt');
      }
    });
    
    it('should return only assigned incidents for technician users', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/recent-incidents')
        .set('Authorization', `Bearer ${technicianToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('incidents');
      
      // All incidents should be assigned to the technician
      response.body.incidents.forEach(incident => {
        if (incident.assignedTo) {
          expect(incident.assignedTo._id.toString()).toBe(technicianUser._id.toString());
        }
      });
    });
    
    it('should return only user incidents for regular users', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/recent-incidents')
        .set('Authorization', `Bearer ${regularToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('incidents');
      
      // All incidents should be reported by the user
      response.body.incidents.forEach(incident => {
        expect(incident.reportedBy._id.toString()).toBe(regularUser._id.toString());
      });
    });
    
    it('should return 401 for unauthenticated requests', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/recent-incidents');
      
      expect(response.status).toBe(401);
    });
  });
  
  describe('Dashboard Service Unit Tests', () => {
    it('should calculate average resolution time correctly', async () => {
      const avgTime = await dashboardService.calculateAverageResolutionTime();
      expect(typeof avgTime).toBe('number');
    });
    
    it('should count resolved incidents in last week correctly', async () => {
      const count = await dashboardService.countResolvedIncidentsLastWeek();
      expect(typeof count).toBe('number');
    });
    
    it('should get incidents by status correctly', async () => {
      const statusData = await dashboardService.getIncidentsByStatus();
      expect(Array.isArray(statusData)).toBe(true);
      
      if (statusData.length > 0) {
        expect(statusData[0]).toHaveProperty('status');
        expect(statusData[0]).toHaveProperty('count');
      }
    });
    
    it('should get incidents by priority correctly', async () => {
      const priorityData = await dashboardService.getIncidentsByPriority();
      expect(Array.isArray(priorityData)).toBe(true);
      
      if (priorityData.length > 0) {
        expect(priorityData[0]).toHaveProperty('priority');
        expect(priorityData[0]).toHaveProperty('count');
      }
    });
    
    it('should get equipment by status correctly', async () => {
      const statusData = await dashboardService.getEquipmentByStatus();
      expect(Array.isArray(statusData)).toBe(true);
      
      if (statusData.length > 0) {
        expect(statusData[0]).toHaveProperty('status');
        expect(statusData[0]).toHaveProperty('count');
      }
    });
    
    it('should get equipment by type correctly', async () => {
      const typeData = await dashboardService.getEquipmentByType();
      expect(Array.isArray(typeData)).toBe(true);
      
      if (typeData.length > 0) {
        expect(typeData[0]).toHaveProperty('type');
        expect(typeData[0]).toHaveProperty('count');
      }
    });
    
    it('should get open incidents by technician correctly', async () => {
      const technicianData = await dashboardService.getOpenIncidentsByTechnician();
      expect(Array.isArray(technicianData)).toBe(true);
      
      if (technicianData.length > 0) {
        expect(technicianData[0]).toHaveProperty('technician');
        expect(technicianData[0]).toHaveProperty('count');
      }
    });
    
    it('should get incidents over time correctly', async () => {
      const timeData = await dashboardService.getIncidentsOverTime('month');
      expect(Array.isArray(timeData)).toBe(true);
      
      if (timeData.length > 0) {
        expect(timeData[0]).toHaveProperty('date');
        expect(timeData[0]).toHaveProperty('count');
      }
    });
    
    it('should get technician performance metrics correctly', async () => {
      const metrics = await dashboardService.getTechnicianPerformanceMetrics(technicianUser._id);
      expect(metrics).toHaveProperty('openIncidents');
      expect(metrics).toHaveProperty('resolvedLastWeek');
      expect(metrics).toHaveProperty('averageResolutionTime');
    });
  });
});