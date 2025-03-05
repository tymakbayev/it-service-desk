/**
 * IT Service Desk - Dashboard Routes
 * 
 * This file defines all dashboard-related routes for the application.
 * It handles analytics, statistics, metrics, and other dashboard data operations.
 * 
 * @module server/routes/dashboard.routes
 */

'use strict';

const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { authMiddleware, roleMiddleware } = require('../middleware');
const validationMiddleware = require('../middleware/validation.middleware');
const { UserRole } = require('../utils/constants');

/**
 * @route GET /api/dashboard/summary
 * @desc Get dashboard summary statistics
 * @access Private
 */
router.get(
  '/summary',
  dashboardController.getDashboardSummary
);

/**
 * @route GET /api/dashboard/incidents/stats
 * @desc Get incident statistics
 * @access Private
 */
router.get(
  '/incidents/stats',
  dashboardController.getIncidentStatistics
);

/**
 * @route GET /api/dashboard/incidents/by-status
 * @desc Get incidents grouped by status
 * @access Private
 */
router.get(
  '/incidents/by-status',
  dashboardController.getIncidentsByStatus
);

/**
 * @route GET /api/dashboard/incidents/by-priority
 * @desc Get incidents grouped by priority
 * @access Private
 */
router.get(
  '/incidents/by-priority',
  dashboardController.getIncidentsByPriority
);

/**
 * @route GET /api/dashboard/incidents/by-category
 * @desc Get incidents grouped by category
 * @access Private
 */
router.get(
  '/incidents/by-category',
  dashboardController.getIncidentsByCategory
);

/**
 * @route GET /api/dashboard/incidents/recent
 * @desc Get recent incidents
 * @access Private
 */
router.get(
  '/incidents/recent',
  dashboardController.getRecentIncidents
);

/**
 * @route GET /api/dashboard/incidents/trend
 * @desc Get incident trend over time
 * @access Private
 */
router.get(
  '/incidents/trend',
  validationMiddleware.validateDateRange,
  dashboardController.getIncidentTrend
);

/**
 * @route GET /api/dashboard/equipment/stats
 * @desc Get equipment statistics
 * @access Private
 */
router.get(
  '/equipment/stats',
  dashboardController.getEquipmentStatistics
);

/**
 * @route GET /api/dashboard/equipment/by-status
 * @desc Get equipment grouped by status
 * @access Private
 */
router.get(
  '/equipment/by-status',
  dashboardController.getEquipmentByStatus
);

/**
 * @route GET /api/dashboard/equipment/by-type
 * @desc Get equipment grouped by type
 * @access Private
 */
router.get(
  '/equipment/by-type',
  dashboardController.getEquipmentByType
);

/**
 * @route GET /api/dashboard/performance/resolution-time
 * @desc Get average incident resolution time
 * @access Private
 */
router.get(
  '/performance/resolution-time',
  validationMiddleware.validateDateRange,
  dashboardController.getResolutionTimeMetrics
);

/**
 * @route GET /api/dashboard/performance/response-time
 * @desc Get average incident response time
 * @access Private
 */
router.get(
  '/performance/response-time',
  validationMiddleware.validateDateRange,
  dashboardController.getResponseTimeMetrics
);

/**
 * @route GET /api/dashboard/performance/technician
 * @desc Get technician performance metrics
 * @access Private/Admin or Technician
 */
router.get(
  '/performance/technician',
  roleMiddleware([UserRole.ADMIN, UserRole.TECHNICIAN]),
  dashboardController.getTechnicianPerformance
);

/**
 * @route GET /api/dashboard/performance/sla
 * @desc Get SLA compliance metrics
 * @access Private/Admin or Technician
 */
router.get(
  '/performance/sla',
  roleMiddleware([UserRole.ADMIN, UserRole.TECHNICIAN]),
  dashboardController.getSLAComplianceMetrics
);

/**
 * @route GET /api/dashboard/user-activity
 * @desc Get user activity statistics
 * @access Private/Admin
 */
router.get(
  '/user-activity',
  roleMiddleware([UserRole.ADMIN]),
  dashboardController.getUserActivityStats
);

/**
 * @route GET /api/dashboard/notifications/unread-count
 * @desc Get unread notifications count
 * @access Private
 */
router.get(
  '/notifications/unread-count',
  dashboardController.getUnreadNotificationsCount
);

/**
 * @route GET /api/dashboard/custom
 * @desc Get custom dashboard data based on user preferences
 * @access Private
 */
router.get(
  '/custom',
  dashboardController.getCustomDashboard
);

/**
 * @route POST /api/dashboard/custom
 * @desc Save custom dashboard preferences
 * @access Private
 */
router.post(
  '/custom',
  validationMiddleware.validateDashboardPreferences,
  dashboardController.saveCustomDashboard
);

/**
 * @route GET /api/dashboard/export
 * @desc Export dashboard data
 * @access Private/Admin
 */
router.get(
  '/export',
  roleMiddleware([UserRole.ADMIN]),
  validationMiddleware.validateExportFormat,
  dashboardController.exportDashboardData
);

module.exports = router;