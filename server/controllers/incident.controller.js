const IncidentModel = require('../models/incident.model');
const UserModel = require('../models/user.model');
const NotificationService = require('../services/notification.service');
const { validationResult } = require('express-validator');

class IncidentController {
  /**
   * Создает новый инцидент
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, description, priority, equipmentId, category } = req.body;
      const reporterId = req.user.id;

      const incident = await IncidentModel.create({
        title,
        description,
        priority,
        equipmentId,
        category,
        reporterId,
        status: 'new',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Находим всех IT-специалистов для уведомления о новом инциденте
      const itSpecialists = await UserModel.find({ role: 'specialist' });
      
      // Отправляем уведомления IT-специалистам
      for (const specialist of itSpecialists) {
        await NotificationService.sendNotification({
          userId: specialist._id,
          type: 'incident_created',
          message: `Новый инцидент: ${title}`,
          data: { incidentId: incident._id }
        });
      }

      return res.status(201).json(incident);
    } catch (error) {
      console.error('Error creating incident:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Обновляет существующий инцидент
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  async update(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { title, description, priority, category } = req.body;

      const incident = await IncidentModel.findById(id);
      if (!incident) {
        return res.status(404).json({ message: 'Incident not found' });
      }

      // Проверка прав доступа (только создатель, назначенный специалист или админ)
      const userId = req.user.id;
      const userRole = req.user.role;
      
      if (userRole !== 'admin' && 
          incident.reporterId.toString() !== userId && 
          (incident.assigneeId && incident.assigneeId.toString() !== userId)) {
        return res.status(403).json({ message: 'Access denied' });
      }

      // Обновляем инцидент
      incident.title = title || incident.title;
      incident.description = description || incident.description;
      incident.priority = priority || incident.priority;
      incident.category = category || incident.category;
      incident.updatedAt = new Date();

      await incident.save();

      // Отправляем уведомления заинтересованным сторонам
      const notifyUsers = new Set();
      notifyUsers.add(incident.reporterId.toString());
      if (incident.assigneeId) {
        notifyUsers.add(incident.assigneeId.toString());
      }

      // Не отправляем уведомление пользователю, который сделал изменения
      notifyUsers.delete(userId);

      for (const notifyUserId of notifyUsers) {
        await NotificationService.sendNotification({
          userId: notifyUserId,
          type: 'incident_updated',
          message: `Инцидент обновлен: ${incident.title}`,
          data: { incidentId: incident._id }
        });
      }

      return res.json(incident);
    } catch (error) {
      console.error('Error updating incident:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Получает все инциденты с фильтрацией и пагинацией
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  async getAll(req, res) {
    try {
      const { 
        status, priority, category, 
        reporterId, assigneeId, equipmentId,
        search, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' 
      } = req.query;

      const query = {};
      
      // Применяем фильтры, если они указаны
      if (status) query.status = status;
      if (priority) query.priority = priority;
      if (category) query.category = category;
      if (reporterId) query.reporterId = reporterId;
      if (assigneeId) query.assigneeId = assigneeId;
      if (equipmentId) query.equipmentId = equipmentId;
      
      // Поиск по заголовку или описанию
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      // Ограничение доступа для обычных пользователей (не админов и не специалистов)
      if (req.user.role === 'user') {
        query.reporterId = req.user.id;
      }

      const skip = (page - 1) * limit;
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const incidents = await IncidentModel.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('reporterId', 'name email')
        .populate('assigneeId', 'name email')
        .populate('equipmentId', 'name type serialNumber');

      const total = await IncidentModel.countDocuments(query);

      return res.json({
        incidents,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error getting incidents:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Получает инцидент по ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  async getById(req, res) {
    try {
      const { id } = req.params;

      const incident = await IncidentModel.findById(id)
        .populate('reporterId', 'name email')
        .populate('assigneeId', 'name email')
        .populate('equipmentId', 'name type serialNumber');

      if (!incident) {
        return res.status(404).json({ message: 'Incident not found' });
      }

      // Проверка прав доступа для обычных пользователей
      if (req.user.role === 'user' && incident.reporterId._id.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }

      return res.json(incident);
    } catch (error) {
      console.error('Error getting incident:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Назначает инцидент специалисту
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  async assign(req, res) {
    try {
      const { id } = req.params;
      const { assigneeId } = req.body;

      // Проверяем, что назначаемый пользователь существует и является специалистом
      const specialist = await UserModel.findById(assigneeId);
      if (!specialist || specialist.role !== 'specialist') {
        return res.status(400).json({ message: 'Invalid assignee' });
      }

      const incident = await IncidentModel.findById(id);
      if (!incident) {
        return res.status(404).json({ message: 'Incident not found' });
      }

      // Проверка прав доступа (только админ или специалист может назначать)
      if (req.user.role !== 'admin' && req.user.role !== 'specialist') {
        return res.status(403).json({ message: 'Access denied' });
      }

      // Обновляем инцидент
      incident.assigneeId = assigneeId;
      incident.status = 'assigned';
      incident.updatedAt = new Date();

      await incident.save();

      // Отправляем уведомление назначенному специалисту
      await NotificationService.sendNotification({
        userId: assigneeId,
        type: 'incident_assigned',
        message: `Вам назначен инцидент: ${incident.title}`,
        data: { incidentId: incident._id }
      });

      // Отправляем уведомление создателю инцидента
      await NotificationService.sendNotification({
        userId: incident.reporterId,
        type: 'incident_assigned',
        message: `На ваш инцидент назначен специалист: ${specialist.name}`,
        data: { incidentId: incident._id }
      });

      return res.json(incident);
    } catch (error) {
      console.error('Error assigning incident:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Изменяет статус инцидента
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  async changeStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, resolution } = req.body;

      // Проверяем валидность статуса
      const validStatuses = ['new', 'assigned', 'in_progress', 'resolved', 'closed', 'reopened'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }

      const incident = await IncidentModel.findById(id);
      if (!incident) {
        return res.status(404).json({ message: 'Incident not found' });
      }

      // Проверка прав доступа
      const userId = req.user.id;
      const userRole = req.user.role;
      
      // Только назначенный специалист или админ может менять статус
      // Исключение: создатель может закрыть или переоткрыть инцидент
      if (userRole !== 'admin' && 
          (incident.assigneeId && incident.assigneeId.toString() !== userId) && 
          !(incident.reporterId.toString() === userId && ['closed', 'reopened'].includes(status))) {
        return res.status(403).json({ message: 'Access denied' });
      }

      // Обновляем инцидент
      incident.status = status;
      incident.updatedAt = new Date();

      // Если статус resolved или closed, добавляем резолюцию
      if (['resolved', 'closed'].includes(status) && resolution) {
        incident.resolution = resolution;
        incident.resolvedAt = new Date();
      }

      // Если статус reopened, сбрасываем резолюцию
      if (status === 'reopened') {
        incident.resolution = '';
        incident.resolvedAt = null;
      }

      await incident.save();

      // Отправляем уведомления заинтересованным сторонам
      const notifyUsers = new Set();
      notifyUsers.add(incident.reporterId.toString());
      if (incident.assigneeId) {
        notifyUsers.add(incident.assigneeId.toString());
      }

      // Не отправляем уведомление пользователю, который сделал изменения
      notifyUsers.delete(userId);

      for (const notifyUserId of notifyUsers) {
        await NotificationService.sendNotification({
          userId: notifyUserId,
          type: 'incident_status_changed',
          message: `Статус инцидента изменен на ${status}: ${incident.title}`,
          data: { incidentId: incident._id, status }
        });
      }

      return res.json(incident);
    } catch (error) {
      console.error('Error changing incident status:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}

module.exports = new IncidentController();