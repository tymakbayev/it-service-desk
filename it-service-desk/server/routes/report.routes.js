/**
 * IT Service Desk - Report Routes
 * 
 * This file defines all report-related routes for the application.
 * It handles report generation, scheduling, exporting, and other report operations.
 * 
 * @module server/routes/report.routes
 */

'use strict';

const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { authMiddleware, roleMiddleware } = require('../middleware');
const validationMiddleware = require('../middleware/validation.middleware');
const { UserRole } = require('../utils/constants');

/**
 * @route GET /api/reports
 * @desc Get all reports with filtering, sorting and pagination
 * @access Private
 */
router.get(
  '/',
  reportController.getReports
);

/**
 * @route GET /api/reports/:id
 * @desc Get report by ID
 * @access Private
 */
router.get(
  '/:id',
  validationMiddleware.validateObjectId('id'),
  reportController.getReportById
);

/**
 * @route POST /api/reports
 * @desc Generate a new report
 * @access Private/Admin or Technician
 */
router.post(
  '/',
  validationMiddleware.validateCreateReport,
  roleMiddleware([UserRole.ADMIN, UserRole.TECHNICIAN]),
  reportController.createReport
);

/**
 * @route DELETE /api/reports/:id
 * @desc Delete report
 * @access Private/Admin or Technician
 */
router.delete(
  '/:id',
  validationMiddleware.validateObjectId('id'),
  roleMiddleware([UserRole.ADMIN, UserRole.TECHNICIAN]),
  reportController.deleteReport
);

/**
 * @route GET /api/reports/:id/download
 * @desc Download report in specified format (PDF, CSV, Excel)
 * @access Private
 */
router.get(
  '/:id/download',
  validationMiddleware.validateObjectId('id'),
  validationMiddleware.validateReportDownload,
  reportController.downloadReport
);

/**
 * @route GET /api/reports/types
 * @desc Get available report types
 * @access Private
 */
router.get(
  '/types',
  reportController.getReportTypes
);

/**
 * @route POST /api/reports/incidents
 * @desc Generate incident report with filters
 * @access Private/Admin or Technician
 */
router.post(
  '/incidents',
  validationMiddleware.validateIncidentReport,
  roleMiddleware([UserRole.ADMIN, UserRole.TECHNICIAN]),
  reportController.generateIncidentReport
);

/**
 * @route POST /api/reports/equipment
 * @desc Generate equipment report with filters
 * @access Private/Admin or Technician
 */
router.post(
  '/equipment',
  validationMiddleware.validateEquipmentReport,
  roleMiddleware([UserRole.ADMIN, UserRole.TECHNICIAN]),
  reportController.generateEquipmentReport
);

/**
 * @route POST /api/reports/performance
 * @desc Generate performance metrics report
 * @access Private/Admin
 */
router.post(
  '/performance',
  validationMiddleware.validatePerformanceReport,
  roleMiddleware([UserRole.ADMIN]),
  reportController.generatePerformanceReport
);

/**
 * @route POST /api/reports/user-activity
 * @desc Generate user activity report
 * @access Private/Admin
 */
router.post(
  '/user-activity',
  validationMiddleware.validateUserActivityReport,
  roleMiddleware([UserRole.ADMIN]),
  reportController.generateUserActivityReport
);

/**
 * @route POST /api/reports/schedule
 * @desc Schedule a recurring report
 * @access Private/Admin
 */
router.post(
  '/schedule',
  validationMiddleware.validateScheduleReport,
  roleMiddleware([UserRole.ADMIN]),
  reportController.scheduleReport
);

/**
 * @route GET /api/reports/scheduled
 * @desc Get all scheduled reports
 * @access Private/Admin
 */
router.get(
  '/scheduled',
  roleMiddleware([UserRole.ADMIN]),
  reportController.getScheduledReports
);

/**
 * @route DELETE /api/reports/scheduled/:id
 * @desc Delete a scheduled report
 * @access Private/Admin
 */
router.delete(
  '/scheduled/:id',
  validationMiddleware.validateObjectId('id'),
  roleMiddleware([UserRole.ADMIN]),
  reportController.deleteScheduledReport
);

/**
 * @route PUT /api/reports/scheduled/:id
 * @desc Update a scheduled report
 * @access Private/Admin
 */
router.put(
  '/scheduled/:id',
  validationMiddleware.validateObjectId('id'),
  validationMiddleware.validateUpdateScheduledReport,
  roleMiddleware([UserRole.ADMIN]),
  reportController.updateScheduledReport
);

/**
 * @route POST /api/reports/email
 * @desc Email a report to specified recipients
 * @access Private/Admin or Technician
 */
router.post(
  '/email',
  validationMiddleware.validateEmailReport,
  roleMiddleware([UserRole.ADMIN, UserRole.TECHNICIAN]),
  reportController.emailReport
);

/**
 * @route GET /api/reports/templates
 * @desc Get all report templates
 * @access Private/Admin or Technician
 */
router.get(
  '/templates',
  roleMiddleware([UserRole.ADMIN, UserRole.TECHNICIAN]),
  reportController.getReportTemplates
);

/**
 * @route POST /api/reports/templates
 * @desc Create a new report template
 * @access Private/Admin
 */
router.post(
  '/templates',
  validationMiddleware.validateCreateReportTemplate,
  roleMiddleware([UserRole.ADMIN]),
  reportController.createReportTemplate
);

/**
 * @route PUT /api/reports/templates/:id
 * @desc Update a report template
 * @access Private/Admin
 */
router.put(
  '/templates/:id',
  validationMiddleware.validateObjectId('id'),
  validationMiddleware.validateUpdateReportTemplate,
  roleMiddleware([UserRole.ADMIN]),
  reportController.updateReportTemplate
);

/**
 * @route DELETE /api/reports/templates/:id
 * @desc Delete a report template
 * @access Private/Admin
 */
router.delete(
  '/templates/:id',
  validationMiddleware.validateObjectId('id'),
  roleMiddleware([UserRole.ADMIN]),
  reportController.deleteReportTemplate
);

/**
 * @route POST /api/reports/export-all
 * @desc Export all reports data
 * @access Private/Admin
 */
router.post(
  '/export-all',
  validationMiddleware.validateExportAllReports,
  roleMiddleware([UserRole.ADMIN]),
  reportController.exportAllReports
);

/**
 * @route GET /api/reports/statistics
 * @desc Get report generation statistics
 * @access Private/Admin
 */
router.get(
  '/statistics',
  roleMiddleware([UserRole.ADMIN]),
  reportController.getReportStatistics
);

/**
 * @route POST /api/reports/custom
 * @desc Generate custom report with specified fields and filters
 * @access Private/Admin
 */
router.post(
  '/custom',
  validationMiddleware.validateCustomReport,
  roleMiddleware([UserRole.ADMIN]),
  reportController.generateCustomReport
);

module.exports = router;