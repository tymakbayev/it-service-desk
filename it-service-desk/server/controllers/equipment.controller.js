const Equipment = require('../models/equipment.model');
const User = require('../models/user.model');
const { NotificationService } = require('../services/notification.service');

class EquipmentController {
  /**
   * Create new equipment
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async create(req, res) {
    try {
      const { name, type, serialNumber, purchaseDate, status, notes } = req.body;
      
      // Validate required fields
      if (!name || !type || !serialNumber) {
        return res.status(400).json({ message: 'Name, type and serial number are required' });
      }
      
      const newEquipment = new Equipment({
        name,
        type,
        serialNumber,
        purchaseDate,
        status: status || 'available',
        notes,
        createdBy: req.user.id
      });
      
      await newEquipment.save();
      
      // Notify admins about new equipment
      NotificationService.notifyByRole('admin', {
        type: 'EQUIPMENT_ADDED',
        message: `New equipment added: ${name}`,
        data: { equipmentId: newEquipment._id }
      });
      
      return res.status(201).json({
        success: true,
        data: newEquipment
      });
    } catch (error) {
      console.error('Error creating equipment:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create equipment',
        error: error.message
      });
    }
  }
  
  /**
   * Update existing equipment
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const equipment = await Equipment.findById(id);
      
      if (!equipment) {
        return res.status(404).json({
          success: false,
          message: 'Equipment not found'
        });
      }
      
      // Check if user has permission to update
      if (req.user.role !== 'admin' && req.user.role !== 'technician') {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update equipment'
        });
      }
      
      const updatedEquipment = await Equipment.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: Date.now() },
        { new: true, runValidators: true }
      );
      
      // If status changed, send notification
      if (updateData.status && updateData.status !== equipment.status) {
        NotificationService.notifyByRole(['admin', 'technician'], {
          type: 'EQUIPMENT_STATUS_CHANGED',
          message: `Equipment ${equipment.name} status changed to ${updateData.status}`,
          data: { equipmentId: id, oldStatus: equipment.status, newStatus: updateData.status }
        });
      }
      
      return res.status(200).json({
        success: true,
        data: updatedEquipment
      });
    } catch (error) {
      console.error('Error updating equipment:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update equipment',
        error: error.message
      });
    }
  }
  
  /**
   * Get all equipment with optional filtering
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAll(req, res) {
    try {
      const { status, type, assignedTo, page = 1, limit = 10 } = req.query;
      
      // Build filter object
      const filter = {};
      if (status) filter.status = status;
      if (type) filter.type = type;
      if (assignedTo) filter.assignedTo = assignedTo;
      
      // Calculate pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const equipment = await Equipment.find(filter)
        .populate('assignedTo', 'firstName lastName email')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });
      
      const total = await Equipment.countDocuments(filter);
      
      return res.status(200).json({
        success: true,
        count: equipment.length,
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
        currentPage: parseInt(page),
        data: equipment
      });
    } catch (error) {
      console.error('Error fetching equipment:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch equipment',
        error: error.message
      });
    }
  }
  
  /**
   * Get equipment by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      
      const equipment = await Equipment.findById(id)
        .populate('assignedTo', 'firstName lastName email department')
        .populate('createdBy', 'firstName lastName');
      
      if (!equipment) {
        return res.status(404).json({
          success: false,
          message: 'Equipment not found'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: equipment
      });
    } catch (error) {
      console.error('Error fetching equipment:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch equipment',
        error: error.message
      });
    }
  }
  
  /**
   * Assign equipment to a user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async assign(req, res) {
    try {
      const { id } = req.params;
      const { userId, notes } = req.body;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }
      
      // Check if user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Check if equipment exists and is available
      const equipment = await Equipment.findById(id);
      if (!equipment) {
        return res.status(404).json({
          success: false,
          message: 'Equipment not found'
        });
      }
      
      if (equipment.status !== 'available' && equipment.assignedTo) {
        return res.status(400).json({
          success: false,
          message: 'Equipment is not available for assignment'
        });
      }
      
      // Update equipment
      const updatedEquipment = await Equipment.findByIdAndUpdate(
        id,
        {
          assignedTo: userId,
          status: 'assigned',
          assignmentNotes: notes || '',
          assignmentDate: Date.now(),
          updatedAt: Date.now()
        },
        { new: true, runValidators: true }
      ).populate('assignedTo', 'firstName lastName email');
      
      // Send notification to the user
      NotificationService.notifyUser(userId, {
        type: 'EQUIPMENT_ASSIGNED',
        message: `Equipment ${equipment.name} has been assigned to you`,
        data: { equipmentId: id, equipmentName: equipment.name }
      });
      
      return res.status(200).json({
        success: true,
        data: updatedEquipment
      });
    } catch (error) {
      console.error('Error assigning equipment:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to assign equipment',
        error: error.message
      });
    }
  }
}

module.exports = new EquipmentController();