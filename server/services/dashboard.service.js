const Incident = require('../models/incident.model');
const Equipment = require('../models/equipment.model');
const User = require('../models/user.model');
const { Types } = require('mongoose');

/**
 * Сервис для получения аналитических данных для дашборда
 */
class DashboardService {
  /**
   * Получает общую статистику для дашборда
   * @param {Object} options - Опции запроса
   * @param {Date} options.startDate - Начальная дата для фильтрации
   * @param {Date} options.endDate - Конечная дата для фильтрации
   * @returns {Promise<Object>} - Объект с общей статистикой
   */
  async getOverallStatistics({ startDate, endDate } = {}) {
    try {
      const dateFilter = {};
      if (startDate && endDate) {
        dateFilter.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      // Получаем статистику по инцидентам
      const incidentStats = await this.getIncidentStatistics(dateFilter);
      
      // Получаем статистику по оборудованию
      const equipmentStats = await this.getEquipmentStatistics();
      
      // Получаем статистику по пользователям
      const userStats = await this.getUserStatistics();

      return {
        incidents: incidentStats,
        equipment: equipmentStats,
        users: userStats,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error getting overall statistics:', error);
      throw error;
    }
  }

  /**
   * Получает статистику по инцидентам
   * @param {Object} dateFilter - Фильтр по дате
   * @returns {Promise<Object>} - Объект со статистикой по инцидентам
   */
  async getIncidentStatistics(dateFilter = {}) {
    try {
      // Общее количество инцидентов
      const totalIncidents = await Incident.countDocuments(dateFilter);
      
      // Количество инцидентов по статусам
      const statusCounts = await Incident.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);
      
      // Количество инцидентов по приоритетам
      const priorityCounts = await Incident.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ]);
      
      // Среднее время решения инцидентов (в часах)
      const avgResolutionTime = await Incident.aggregate([
        { 
          $match: { 
            ...dateFilter,
            status: 'closed',
            resolvedAt: { $exists: true, $ne: null }
          } 
        },
        { 
          $project: { 
            resolutionTime: { 
              $divide: [
                { $subtract: ['$resolvedAt', '$createdAt'] },
                3600000 // Конвертация миллисекунд в часы
              ]
            } 
          } 
        },
        { $group: { _id: null, avgTime: { $avg: '$resolutionTime' } } }
      ]);
      
      // Количество инцидентов по дням за последний месяц
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const incidentsByDay = await Incident.aggregate([
        { 
          $match: { 
            ...dateFilter,
            createdAt: { $gte: thirtyDaysAgo } 
          } 
        },
        {
          $project: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
          }
        },
        { $group: { _id: '$date', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]);

      // Топ-5 типов инцидентов
      const topIncidentTypes = await Incident.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]);

      return {
        total: totalIncidents,
        byStatus: statusCounts.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        byPriority: priorityCounts.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        avgResolutionTime: avgResolutionTime.length > 0 ? avgResolutionTime[0].avgTime : 0,
        incidentsByDay: incidentsByDay.map(item => ({
          date: item._id,
          count: item.count
        })),
        topTypes: topIncidentTypes.map(item => ({
          type: item._id,
          count: item.count
        }))
      };
    } catch (error) {
      console.error('Error getting incident statistics:', error);
      throw error;
    }
  }

  /**
   * Получает статистику по оборудованию
   * @returns {Promise<Object>} - Объект со статистикой по оборудованию
   */
  async getEquipmentStatistics() {
    try {
      // Общее количество оборудования
      const totalEquipment = await Equipment.countDocuments();
      
      // Количество оборудования по статусам
      const statusCounts = await Equipment.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);
      
      // Количество оборудования по типам
      const typeCounts = await Equipment.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]);
      
      // Оборудование с истекающим сроком гарантии (в течение 30 дней)
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      
      const warrantyExpiringCount = await Equipment.countDocuments({
        warrantyExpires: {
          $gte: new Date(),
          $lte: thirtyDaysFromNow
        }
      });
      
      // Оборудование с истекшим сроком гарантии
      const warrantyExpiredCount = await Equipment.countDocuments({
        warrantyExpires: { $lt: new Date() }
      });
      
      // Топ-5 моделей оборудования с наибольшим количеством инцидентов
      const topProblemEquipment = await Incident.aggregate([
        { $match: { equipmentId: { $exists: true, $ne: null } } },
        { $group: { _id: '$equipmentId', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'equipment',
            localField: '_id',
            foreignField: '_id',
            as: 'equipmentInfo'
          }
        },
        { $unwind: '$equipmentInfo' },
        {
          $project: {
            _id: 1,
            count: 1,
            name: '$equipmentInfo.name',
            model: '$equipmentInfo.model',
            type: '$equipmentInfo.type'
          }
        }
      ]);

      return {
        total: totalEquipment,
        byStatus: statusCounts.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        byType: typeCounts.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        warrantyExpiring: warrantyExpiringCount,
        warrantyExpired: warrantyExpiredCount,
        topProblemEquipment: topProblemEquipment.map(item => ({
          id: item._id,
          name: item.name,
          model: item.model,
          type: item.type,
          incidentCount: item.count
        }))
      };
    } catch (error) {
      console.error('Error getting equipment statistics:', error);
      throw error;
    }
  }

  /**
   * Получает статистику по пользователям
   * @returns {Promise<Object>} - Объект со статистикой по пользователям
   */
  async getUserStatistics() {
    try {
      // Общее количество пользователей
      const totalUsers = await User.countDocuments();
      
      // Количество пользователей по ролям
      const roleCounts = await User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ]);
      
      // Топ-5 пользователей с наибольшим количеством созданных инцидентов
      const topReporters = await Incident.aggregate([
        { $group: { _id: '$createdBy', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'userInfo'
          }
        },
        { $unwind: '$userInfo' },
        {
          $project: {
            _id: 1,
            count: 1,
            name: { $concat: ['$userInfo.firstName', ' ', '$userInfo.lastName'] },
            email: '$userInfo.email'
          }
        }
      ]);
      
      // Топ-5 техников по количеству решенных инцидентов
      const topTechnicians = await Incident.aggregate([
        { $match: { status: 'closed', assignedTo: { $exists: true, $ne: null } } },
        { $group: { _id: '$assignedTo', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'userInfo'
          }
        },
        { $unwind: '$userInfo' },
        {
          $project: {
            _id: 1,
            count: 1,
            name: { $concat: ['$userInfo.firstName', ' ', '$userInfo.lastName'] },
            email: '$userInfo.email'
          }
        }
      ]);

      return {
        total: totalUsers,
        byRole: roleCounts.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        topReporters: topReporters.map(item => ({
          id: item._id,
          name: item.name,
          email: item.email,
          incidentCount: item.count
        })),
        topTechnicians: topTechnicians.map(item => ({
          id: item._id,
          name: item.name,
          email: item.email,
          resolvedCount: item.count
        }))
      };
    } catch (error) {
      console.error('Error getting user statistics:', error);
      throw error;
    }
  }

  /**
   * Получает данные для графика инцидентов по времени
   * @param {Object} options - Опции запроса
   * @param {String} options.timeframe - Временной интервал (day, week, month, year)
   * @param {Date} options.startDate - Начальная дата
   * @param {Date} options.endDate - Конечная дата
   * @returns {Promise<Array>} - Массив данных для графика
   */
  async getIncidentTimelineData({ timeframe = 'month', startDate, endDate } = {}) {
    try {
      let dateFormat;
      let groupByField;
      let dateFilter = {};
      
      // Определяем формат даты и период группировки в зависимости от timeframe
      switch (timeframe) {
        case 'day':
          dateFormat = '%Y-%m-%d %H:00';
          groupByField = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' }, hour: { $hour: '$createdAt' } };
          // Если даты не указаны, берем последние 24 часа
          if (!startDate && !endDate) {
            const oneDayAgo = new Date();
            oneDayAgo.setDate(oneDayAgo.getDate() - 1);
            dateFilter = { createdAt: { $gte: oneDayAgo } };
          }
          break;
        case 'week':
          dateFormat = '%Y-%m-%d';
          groupByField = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } };
          // Если даты не указаны, берем последние 7 дней
          if (!startDate && !endDate) {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            dateFilter = { createdAt: { $gte: oneWeekAgo } };
          }
          break;
        case 'year':
          dateFormat = '%Y-%m';
          groupByField = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } };
          // Если даты не указаны, берем последний год
          if (!startDate && !endDate) {
            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
            dateFilter = { createdAt: { $gte: oneYearAgo } };
          }
          break;
        case 'month':
        default:
          dateFormat = '%Y-%m-%d';
          groupByField = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } };
          // Если даты не указаны, берем последние 30 дней
          if (!startDate && !endDate) {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            dateFilter = { createdAt: { $gte: thirtyDaysAgo } };
          }
          break;
      }
      
      // Если указаны даты, используем их для фильтрации
      if (startDate && endDate) {
        dateFilter = {
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        };
      }
      
      // Получаем данные о созданных инцидентах
      const createdIncidents = await Incident.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: {
              ...groupByField
            },
            count: { $sum: 1 },
            date: { $first: { $dateToString: { format: dateFormat, date: '$createdAt' } } }
          }
        },
        { $sort: { 'date': 1 } },
        {
          $project: {
            _id: 0,
            date: '$date',
            count: 1,
            type: { $literal: 'created' }
          }
        }
      ]);
      
      // Получаем данные о закрытых инцидентах
      const resolvedIncidents = await Incident.aggregate([
        { 
          $match: { 
            ...dateFilter,
            status: 'closed',
            resolvedAt: { $exists: true, $ne: null }
          } 
        },
        {
          $group: {
            _id: {
              ...groupByField,
              year: { $year: '$resolvedAt' },
              month: { $month: '$resolvedAt' },
              day: timeframe !== 'year' ? { $dayOfMonth: '$resolvedAt' } : undefined,
              hour: timeframe === 'day' ? { $hour: '$resolvedAt' } : undefined
            },
            count: { $sum: 1 },
            date: { $first: { $dateToString: { format: dateFormat, date: '$resolvedAt' } } }
          }
        },
        { $sort: { 'date': 1 } },
        {
          $project: {
            _id: 0,
            date: '$date',
            count: 1,
            type: { $literal: 'resolved' }
          }
        }
      ]);
      
      // Объединяем данные
      return {
        created: createdIncidents,
        resolved: resolvedIncidents,
        timeframe
      };
    } catch (error) {
      console.error('Error getting incident timeline data:', error);
      throw error;
    }
  }

  /**
   * Получает данные о производительности техников
   * @param {Object} options - Опции запроса
   * @param {Date} options.startDate - Начальная дата
   * @param {Date} options.endDate - Конечная дата
   * @param {Number} options.limit - Ограничение количества результатов
   * @returns {Promise<Array>} - Массив данных о производительности техников
   */
  async getTechnicianPerformance({ startDate, endDate, limit = 10 } = {}) {
    try {
      const dateFilter = {};
      if (startDate && endDate) {
        dateFilter.resolvedAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }
      
      // Получаем данные о производительности техников
      const technicianPerformance = await Incident.aggregate([
        { 
          $match: { 
            ...dateFilter,
            status: 'closed',
            assignedTo: { $exists: true, $ne: null },
            resolvedAt: { $exists: true, $ne: null }
          } 
        },
        {
          $project: {
            assignedTo: 1,
            resolutionTime: {
              $divide: [
                { $subtract: ['$resolvedAt', '$createdAt'] },
                3600000 // Конвертация миллисекунд в часы
              ]
            },
            priority: 1
          }
        },
        {
          $group: {
            _id: '$assignedTo',
            avgResolutionTime: { $avg: '$resolutionTime' },
            totalResolved: { $sum: 1 },
            highPriorityResolved: {
              $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] }
            },
            mediumPriorityResolved: {
              $sum: { $cond: [{ $eq: ['$priority', 'medium'] }, 1, 0] }
            },
            lowPriorityResolved: {
              $sum: { $cond: [{ $eq: ['$priority', 'low'] }, 1, 0] }
            }
          }
        },
        { $sort: { totalResolved: -1 } },
        { $limit: limit },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'technicianInfo'
          }
        },
        { $unwind: '$technicianInfo' },
        {
          $project: {
            _id: 0,
            technicianId: '$_id',
            name: { $concat: ['$technicianInfo.firstName', ' ', '$technicianInfo.lastName'] },
            email: '$technicianInfo.email',
            avgResolutionTime: { $round: ['$avgResolutionTime', 2] },
            totalResolved: 1,
            highPriorityResolved: 1,
            mediumPriorityResolved: 1,
            lowPriorityResolved: 1
          }
        }
      ]);
      
      return technicianPerformance;
    } catch (error) {
      console.error('Error getting technician performance:', error);
      throw error;
    }
  }

  /**
   * Получает данные о недавних инцидентах для дашборда
   * @param {Number} limit - Ограничение количества результатов
   * @returns {Promise<Array>} - Массив данных о недавних инцидентах
   */
  async getRecentIncidents(limit = 5) {
    try {
      const recentIncidents = await Incident.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('createdBy', 'firstName lastName email')
        .populate('assignedTo', 'firstName lastName email')
        .populate('equipmentId', 'name model type');
      
      return recentIncidents.map(incident => ({
        id: incident._id,
        title: incident.title,
        status: incident.status,
        priority: incident.priority,
        createdAt: incident.createdAt,
        createdBy: incident.createdBy ? {
          id: incident.createdBy._id,
          name: `${incident.createdBy.firstName} ${incident.createdBy.lastName}`,
          email: incident.createdBy.email
        } : null,
        assignedTo: incident.assignedTo ? {
          id: incident.assignedTo._id,
          name: `${incident.assignedTo.firstName} ${incident.assignedTo.lastName}`,
          email: incident.assignedTo.email
        } : null,
        equipment: incident.equipmentId ? {
          id: incident.equipmentId._id,
          name: incident.equipmentId.name,
          model: incident.equipmentId.model,
          type: incident.equipmentId.type
        } : null
      }));
    } catch (error) {
      console.error('Error getting recent incidents:', error);
      throw error;
    }
  }

  /**
   * Получает данные о SLA (Service Level Agreement)
   * @param {Object} options - Опции запроса
   * @param {Date} options.startDate - Начальная дата
   * @param {Date} options.endDate - Конечная дата
   * @returns {Promise<Object>} - Объект с данными о SLA
   */
  async getSLAMetrics({ startDate, endDate } = {}) {
    try {
      const dateFilter = {};
      if (startDate && endDate) {
        dateFilter.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }
      
      // Определяем целевое время разрешения для каждого приоритета (в часах)
      const slaTargets = {
        high: 4,    // 4 часа для высокого приоритета
        medium: 24,  // 24 часа для среднего приоритета
        low: 72     // 72 часа для низкого приоритета
      };
      
      // Получаем все закрытые инциденты
      const closedIncidents = await Incident.find({
        ...dateFilter,
        status: 'closed',
        resolvedAt: { $exists: true, $ne: null }
      });
      
      // Рассчитываем метрики SLA
      const slaMetrics = {
        total: closedIncidents.length,
        withinSLA: 0,
        outsideSLA: 0,
        byPriority: {
          high: { total: 0, withinSLA: 0, outsideSLA: 0 },
          medium: { total: 0, withinSLA: 0, outsideSLA: 0 },
          low: { total: 0, withinSLA: 0, outsideSLA: 0 }
        }
      };
      
      closedIncidents.forEach(incident => {
        const priority = incident.priority;
        const resolutionTimeHours = (incident.resolvedAt - incident.createdAt) / 3600000; // в часах
        const isWithinSLA = resolutionTimeHours <= slaTargets[priority];
        
        // Обновляем общие метрики
        if (isWithinSLA) {
          slaMetrics.withinSLA++;
        } else {
          slaMetrics.outsideSLA++;
        }
        
        // Обновляем метрики по приоритету
        slaMetrics.byPriority[priority].total++;
        if (isWithinSLA) {
          slaMetrics.byPriority[priority].withinSLA++;
        } else {
          slaMetrics.byPriority[priority].outsideSLA++;
        }
      });
      
      // Рассчитываем процентные показатели
      slaMetrics.slaComplianceRate = slaMetrics.total > 0 
        ? (slaMetrics.withinSLA / slaMetrics.total) * 100 
        : 0;
      
      Object.keys(slaMetrics.byPriority).forEach(priority => {
        const priorityMetrics = slaMetrics.byPriority[priority];
        priorityMetrics.complianceRate = priorityMetrics.total > 0 
          ? (priorityMetrics.withinSLA / priorityMetrics.total) * 100 
          : 0;
      });
      
      return slaMetrics;
    } catch (error) {
      console.error('Error getting SLA metrics:', error);
      throw error;
    }
  }
}

module.exports = new DashboardService();