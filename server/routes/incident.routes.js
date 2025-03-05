/**
 * IT Service Desk - Incident Routes
 * 
 * This file defines all incident-related routes for the application.
 * It handles incident creation, updates, status changes, assignments, and other operations.
 * 
 * @module server/routes/incident.routes
 */

'use strict';

const express = require('express');
const router = express.Router();
const incidentController = require('../controllers/incident.controller');
const { authMiddleware, roleMiddleware } = require('../middleware');
const validationMiddleware = require('../middleware/validation.middleware');
const { UserRole } = require('../utils/constants');

/**
 * @route GET /api/incidents
 * @desc Get all incidents with filtering, sorting and pagination
 * @access Private
 */
router.get(
  '/',
  incidentController.getIncidents
);

/**
 * @route GET /api/incidents/:id
 * @desc Get incident by ID
 * @access Private
 */
router.get(
  '/:id',
  validationMiddleware.validateObjectId('id'),
  incidentController.getIncidentById
);

/**
 * @route POST /api/incidents
 * @desc Create a new incident
 * @access Private
 */
router.post(
  '/',
  validationMiddleware.validateCreateIncident,
  incidentController.createIncident
);

/**
 * @route PUT /api/incidents/:id
 * @desc Update incident
 * @access Private
 */
router.put(
  '/:id',
  validationMiddleware.validateObjectId('id'),
  validationMiddleware.validateUpdateIncident,
  incidentController.updateIncident
);

/**
 * @route DELETE /api/incidents/:id
 * @desc Delete incident
 * @access Private/Admin or Technician
 */
router.delete(
  '/:id',
  validationMiddleware.validateObjectId('id'),
  roleMiddleware([UserRole.ADMIN, UserRole.TECHNICIAN]),
  incidentController.deleteIncident
);

/**
 * @route PUT /api/incidents/:id/status
 * @desc Update incident status
 * @access Private/Admin or Technician
 */
router.put(
  '/:id/status',
  validationMiddleware.validateObjectId('id'),
  validationMiddleware.validateUpdateIncidentStatus,
  roleMiddleware([UserRole.ADMIN, UserRole.TECHNICIAN]),
  incidentController.updateIncidentStatus
);

/**
 * @route PUT /api/incidents/:id/priority
 * @desc Update incident priority
 * @access Private/Admin or Technician
 */
router.put(
  '/:id/priority',
  validationMiddleware.validateObjectId('id'),
  validationMiddleware.validateUpdateIncidentPriority,
  roleMiddleware([UserRole.ADMIN, UserRole.TECHNICIAN]),
  incidentController.updateIncidentPriority
);

/**
 * @route PUT /api/incidents/:id/assign
 * @desc Assign incident to technician
 * @access Private/Admin or Technician
 */
router.put(
  '/:id/assign',
  validationMiddleware.validateObjectId('id'),
  validationMiddleware.validateAssignIncident,
  roleMiddleware([UserRole.ADMIN, UserRole.TECHNICIAN]),
  incidentController.assignIncident
);

/**
 * @route POST /api/incidents/:id/comments
 * @desc Add comment to incident
 * @access Private
 */
router.post(
  '/:id/comments',
  validationMiddleware.validateObjectId('id'),
  validationMiddleware.validateAddComment,
  incidentController.addComment
);

/**
 * @route GET /api/incidents/:id/comments
 * @desc Get all comments for an incident
 * @access Private
 */
router.get(
  '/:id/comments',
  validationMiddleware.validateObjectId('id'),
  incidentController.getIncidentComments
);

/**
 * @route DELETE /api/incidents/:id/comments/:commentId
 * @desc Delete comment from incident
 * @access Private
 */
router.delete(
  '/:id/comments/:commentId',
  validationMiddleware.validateObjectId('id'),
  validationMiddleware.validateObjectId('commentId'),
  incidentController.deleteComment
);

/**
 * @route POST /api/incidents/:id/attachments
 * @desc Upload attachment to incident
 * @access Private
 */
router.post(
  '/:id/attachments',
  validationMiddleware.validateObjectId('id'),
  incidentController.uploadAttachment
);

/**
 * @route GET /api/incidents/:id/attachments
 * @desc Get all attachments for an incident
 * @access Private
 */
router.get(
  '/:id/attachments',
  validationMiddleware.validateObjectId('id'),
  incidentController.getIncidentAttachments
);

/**
 * @route GET /api/incidents/:id/attachments/:attachmentId
 * @desc Download attachment
 * @access Private
 */
router.get(
  '/:id/attachments/:attachmentId',
  validationMiddleware.validateObjectId('id'),
  validationMiddleware.validateObjectId('attachmentId'),
  incidentController.downloadAttachment
);

/**
 * @route DELETE /api/incidents/:id/attachments/:attachmentId
 * @desc Delete attachment from incident
 * @access Private
 */
router.delete(
  '/:id/attachments/:attachmentId',
  validationMiddleware.validateObjectId('id'),
  validationMiddleware.validateObjectId('attachmentId'),
  incidentController.deleteAttachment
);

/**
 * @route GET /api/incidents/stats/summary
 * @desc Get incident statistics summary
 * @access Private/Admin or Technician
 */
router.get(
  '/stats/summary',
  roleMiddleware([UserRole.ADMIN, UserRole.TECHNICIAN]),
  incidentController.getIncidentStatsSummary
);

/**
 * @route GET /api/incidents/stats/by-status
 * @desc Get incidents grouped by status
 * @access Private/Admin or Technician
 */
router.get(
  '/stats/by-status',
  roleMiddleware([UserRole.ADMIN, UserRole.TECHNICIAN]),
  incidentController.getIncidentsByStatus
);

/**
 * @route GET /api/incidents/stats/by-priority
 * @desc Get incidents grouped by priority
 * @access Private/Admin or Technician
 */
router.get(
  '/stats/by-priority',
  roleMiddleware([UserRole.ADMIN, UserRole.TECHNICIAN]),
  incidentController.getIncidentsByPriority
);

/**
 * @route GET /api/incidents/stats/by-category
 * @desc Get incidents grouped by category
 * @access Private/Admin or Technician
 */
router.get(
  '/stats/by-category',
  roleMiddleware([UserRole.ADMIN, UserRole.TECHNICIAN]),
  incidentController.getIncidentsByCategory
);

/**
 * @route GET /api/incidents/stats/resolution-time
 * @desc Get average resolution time statistics
 * @access Private/Admin or Technician
 */
router.get(
  '/stats/resolution-time',
  roleMiddleware([UserRole.ADMIN, UserRole.TECHNICIAN]),
  incidentController.getResolutionTimeStats
);

/**
 * @route GET /api/incidents/stats/technician-performance
 * @desc Get technician performance statistics
 * @access Private/Admin
 */
router.get(
  '/stats/technician-performance',
  roleMiddleware([UserRole.ADMIN]),
  incidentController.getTechnicianPerformance
);

/**
 * @route GET /api/incidents/stats/trend
 * @desc Get incident creation trend over time
 * @access Private/Admin or Technician
 */
router.get(
  '/stats/trend',
  roleMiddleware([UserRole.ADMIN, UserRole.TECHNICIAN]),
  incidentController.getIncidentTrend
);

/**
 * @route GET /api/incidents/user
 * @desc Get incidents created by current user
 * @access Private
 */
router.get(
  '/user/created',
  incidentController.getUserIncidents
);

/**
 * @route GET /api/incidents/technician
 * @desc Get incidents assigned to current technician
 * @access Private/Technician
 */
router.get(
  '/technician/assigned',
  roleMiddleware([UserRole.ADMIN, UserRole.TECHNICIAN]),
  incidentController.getTechnicianIncidents
);

/**
 * @route POST /api/incidents/:id/escalate
 * @desc Escalate incident to higher priority or different technician
 * @access Private/Admin or Technician
 */
router.post(
  '/:id/escalate',
  validationMiddleware.validateObjectId('id'),
  validationMiddleware.validateEscalateIncident,
  roleMiddleware([UserRole.ADMIN, UserRole.TECHNICIAN]),
  incidentController.escalateIncident
);

/**
 * @route POST /api/incidents/bulk-update
 * @desc Update multiple incidents at once
 * @access Private/Admin
 */
router.post(
  '/bulk-update',
  validationMiddleware.validateBulkUpdateIncidents,
  roleMiddleware([UserRole.ADMIN]),
  incidentController.bulkUpdateIncidents
);

/**
 * @route GET /api/incidents/export
 * @desc Export incidents to CSV/Excel
 * @access Private/Admin or Technician
 */
router.get(
  '/export',
  roleMiddleware([UserRole.ADMIN, UserRole.TECHNICIAN]),
  incidentController.exportIncidents
);

/**
 * @route POST /api/incidents/:id/resolve
 * @desc Mark incident as resolved with resolution details
 * @access Private/Admin or Technician
 */
router.post(
  '/:id/resolve',
  validationMiddleware.validateObjectId('id'),
  validationMiddleware.validateResolveIncident,
  roleMiddleware([UserRole.ADMIN, UserRole.TECHNICIAN]),
  incidentController.resolveIncident
);

/**
 * @route POST /api/incidents/:id/reopen
 * @desc Reopen a previously resolved incident
 * @access Private
 */
router.post(
  '/:id/reopen',
  validationMiddleware.validateObjectId('id'),
  validationMiddleware.validateReopenIncident,
  incidentController.reopenIncident
);

/**
 * @route GET /api/incidents/search
 * @desc Search incidents by keyword
 * @access Private
 */
router.get(
  '/search',
  validationMiddleware.validateSearchQuery,
  incidentController.searchIncidents
);

/**
 * @route GET /api/incidents/related-equipment/:equipmentId
 * @desc Get incidents related to specific equipment
 * @access Private
 */
router.get(
  '/related-equipment/:equipmentId',
  validationMiddleware.validateObjectId('equipmentId'),
  incidentController.getIncidentsByEquipment
);

module.exports = router;