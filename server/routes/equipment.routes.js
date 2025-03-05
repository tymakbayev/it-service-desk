/**
 * IT Service Desk - Equipment Routes
 * 
 * This file defines all equipment-related routes for the application.
 * It handles equipment creation, updates, status changes, assignments, and other operations.
 * 
 * @module server/routes/equipment.routes
 */

'use strict';

const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipment.controller');
const { authMiddleware, roleMiddleware } = require('../middleware');
const validationMiddleware = require('../middleware/validation.middleware');
const { UserRole } = require('../utils/constants');

/**
 * @route GET /api/equipment
 * @desc Get all equipment with filtering, sorting and pagination
 * @access Private
 */
router.get(
  '/',
  equipmentController.getEquipment
);

/**
 * @route GET /api/equipment/:id
 * @desc Get equipment by ID
 * @access Private
 */
router.get(
  '/:id',
  validationMiddleware.validateObjectId('id'),
  equipmentController.getEquipmentById
);

/**
 * @route POST /api/equipment
 * @desc Create new equipment
 * @access Private/Admin or Technician
 */
router.post(
  '/',
  validationMiddleware.validateCreateEquipment,
  roleMiddleware([UserRole.ADMIN, UserRole.TECHNICIAN]),
  equipmentController.createEquipment
);

/**
 * @route PUT /api/equipment/:id
 * @desc Update equipment
 * @access Private/Admin or Technician
 */
router.put(
  '/:id',
  validationMiddleware.validateObjectId('id'),
  validationMiddleware.validateUpdateEquipment,
  roleMiddleware([UserRole.ADMIN, UserRole.TECHNICIAN]),
  equipmentController.updateEquipment
);

/**
 * @route DELETE /api/equipment/:id
 * @desc Delete equipment
 * @access Private/Admin
 */
router.delete(
  '/:id',
  validationMiddleware.validateObjectId('id'),
  roleMiddleware([UserRole.ADMIN]),
  equipmentController.deleteEquipment
);

/**
 * @route PUT /api/equipment/:id/status
 * @desc Update equipment status
 * @access Private/Admin or Technician
 */
router.put(
  '/:id/status',
  validationMiddleware.validateObjectId('id'),
  validationMiddleware.validateUpdateEquipmentStatus,
  roleMiddleware([UserRole.ADMIN, UserRole.TECHNICIAN]),
  equipmentController.updateEquipmentStatus
);

/**
 * @route PUT /api/equipment/:id/assign
 * @desc Assign equipment to user
 * @access Private/Admin or Technician
 */
router.put(
  '/:id/assign',
  validationMiddleware.validateObjectId('id'),
  validationMiddleware.validateAssignEquipment,
  roleMiddleware([UserRole.ADMIN, UserRole.TECHNICIAN]),
  equipmentController.assignEquipment
);

/**
 * @route GET /api/equipment/types
 * @desc Get all equipment types
 * @access Private
 */
router.get(
  '/types',
  equipmentController.getEquipmentTypes
);

/**
 * @route POST /api/equipment/types
 * @desc Create new equipment type
 * @access Private/Admin
 */
router.post(
  '/types',
  validationMiddleware.validateCreateEquipmentType,
  roleMiddleware([UserRole.ADMIN]),
  equipmentController.createEquipmentType
);

/**
 * @route PUT /api/equipment/types/:id
 * @desc Update equipment type
 * @access Private/Admin
 */
router.put(
  '/types/:id',
  validationMiddleware.validateObjectId('id'),
  validationMiddleware.validateUpdateEquipmentType,
  roleMiddleware([UserRole.ADMIN]),
  equipmentController.updateEquipmentType
);

/**
 * @route DELETE /api/equipment/types/:id
 * @desc Delete equipment type
 * @access Private/Admin
 */
router.delete(
  '/types/:id',
  validationMiddleware.validateObjectId('id'),
  roleMiddleware([UserRole.ADMIN]),
  equipmentController.deleteEquipmentType
);

/**
 * @route POST /api/equipment/:id/maintenance
 * @desc Record maintenance for equipment
 * @access Private/Admin or Technician
 */
router.post(
  '/:id/maintenance',
  validationMiddleware.validateObjectId('id'),
  validationMiddleware.validateCreateMaintenance,
  roleMiddleware([UserRole.ADMIN, UserRole.TECHNICIAN]),
  equipmentController.recordMaintenance
);

/**
 * @route GET /api/equipment/:id/maintenance
 * @desc Get maintenance history for equipment
 * @access Private
 */
router.get(
  '/:id/maintenance',
  validationMiddleware.validateObjectId('id'),
  equipmentController.getMaintenanceHistory
);

/**
 * @route DELETE /api/equipment/:id/maintenance/:maintenanceId
 * @desc Delete maintenance record
 * @access Private/Admin or Technician
 */
router.delete(
  '/:id/maintenance/:maintenanceId',
  validationMiddleware.validateObjectId('id'),
  validationMiddleware.validateObjectId('maintenanceId'),
  roleMiddleware([UserRole.ADMIN, UserRole.TECHNICIAN]),
  equipmentController.deleteMaintenance
);

/**
 * @route POST /api/equipment/import
 * @desc Import equipment from CSV/Excel
 * @access Private/Admin
 */
router.post(
  '/import',
  roleMiddleware([UserRole.ADMIN]),
  equipmentController.importEquipment
);

/**
 * @route GET /api/equipment/export
 * @desc Export equipment to CSV/Excel
 * @access Private/Admin or Technician
 */
router.get(
  '/export',
  roleMiddleware([UserRole.ADMIN, UserRole.TECHNICIAN]),
  equipmentController.exportEquipment
);

/**
 * @route POST /api/equipment/:id/attachments
 * @desc Upload attachment for equipment
 * @access Private/Admin or Technician
 */
router.post(
  '/:id/attachments',
  validationMiddleware.validateObjectId('id'),
  roleMiddleware([UserRole.ADMIN, UserRole.TECHNICIAN]),
  equipmentController.uploadAttachment
);

/**
 * @route GET /api/equipment/:id/attachments
 * @desc Get all attachments for equipment
 * @access Private
 */
router.get(
  '/:id/attachments',
  validationMiddleware.validateObjectId('id'),
  equipmentController.getAttachments
);

/**
 * @route DELETE /api/equipment/:id/attachments/:attachmentId
 * @desc Delete attachment from equipment
 * @access Private/Admin or Technician
 */
router.delete(
  '/:id/attachments/:attachmentId',
  validationMiddleware.validateObjectId('id'),
  validationMiddleware.validateObjectId('attachmentId'),
  roleMiddleware([UserRole.ADMIN, UserRole.TECHNICIAN]),
  equipmentController.deleteAttachment
);

/**
 * @route GET /api/equipment/categories
 * @desc Get all equipment categories
 * @access Private
 */
router.get(
  '/categories',
  equipmentController.getEquipmentCategories
);

/**
 * @route POST /api/equipment/categories
 * @desc Create new equipment category
 * @access Private/Admin
 */
router.post(
  '/categories',
  validationMiddleware.validateCreateEquipmentCategory,
  roleMiddleware([UserRole.ADMIN]),
  equipmentController.createEquipmentCategory
);

/**
 * @route PUT /api/equipment/categories/:id
 * @desc Update equipment category
 * @access Private/Admin
 */
router.put(
  '/categories/:id',
  validationMiddleware.validateObjectId('id'),
  validationMiddleware.validateUpdateEquipmentCategory,
  roleMiddleware([UserRole.ADMIN]),
  equipmentController.updateEquipmentCategory
);

/**
 * @route DELETE /api/equipment/categories/:id
 * @desc Delete equipment category
 * @access Private/Admin
 */
router.delete(
  '/categories/:id',
  validationMiddleware.validateObjectId('id'),
  roleMiddleware([UserRole.ADMIN]),
  equipmentController.deleteEquipmentCategory
);

/**
 * @route GET /api/equipment/stats
 * @desc Get equipment statistics
 * @access Private/Admin or Technician
 */
router.get(
  '/stats',
  roleMiddleware([UserRole.ADMIN, UserRole.TECHNICIAN]),
  equipmentController.getEquipmentStats
);

/**
 * @route GET /api/equipment/search
 * @desc Search equipment by various criteria
 * @access Private
 */
router.get(
  '/search',
  equipmentController.searchEquipment
);

/**
 * @route GET /api/equipment/user/:userId
 * @desc Get equipment assigned to specific user
 * @access Private
 */
router.get(
  '/user/:userId',
  validationMiddleware.validateObjectId('userId'),
  equipmentController.getEquipmentByUser
);

module.exports = router;