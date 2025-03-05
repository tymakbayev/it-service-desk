const Incident = require('../models/incident.model');
const Equipment = require('../models/equipment.model');
const User = require('../models/user.model');

class DashboardController {
  /**
   * Get general statistics for dashboard
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getStatistics(req, res) {
    try {
      // Get counts for various entities
      const totalIncidents = await Incident.countDocuments();
      const openIncidents = await Incident.countDocuments({ status: { $in: ['open', 'in-progress'] } });
      const resolvedIncidents = await Incident.countDocuments({ status: 'resolved' });
      const totalEquipment = await Equipment.countDocuments();
      const availableEquipment = await Equipment.countDocuments({ status: 'available' });
      const assignedEquipment = await Equipment.countDocuments({ status: 'assigned' });
      const totalUsers = await User.countDocuments();
      
      // Get average resolution time for incidents
      const resolvedIncidentsData = await Incident.find(
        { status: 'resolved', resolvedAt: { $exists: true }, createdAt: { $exists: true } },
        { resolvedAt: 1, createdAt: 1 }
      );
      
      let totalResolutionTime = 0;
      resolvedIncidentsData.forEach(incident => {
        const resolutionTime = incident.resolvedAt - incident.createdAt;
        totalResolutionTime += resolutionTime;
      });
      
      const avgResolutionTime = resolvedIncidentsData.length > 0 
        ? Math.floor(totalResolutionTime / resolvedIncidentsData.length / (1000 * 60 * 60)) // in hours
        : 0;
      
      // Get recent incidents
      const recentIncidents = await Incident.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('reportedBy', 'firstName lastName')
        .populate('assignedTo', 'firstName lastName');
      
      return res.status(200).json({
        success: true,
        data: {
          incidents: {
            total: totalIncidents,
            open: openIncidents,
            resolved: resolvedIncidents,
            avgResolutionTime
          },
          equipment: {
            total: totalEquipment,
            available: availableEquipment,
            assigned: assignedEquipment
          },
          users: {
            total: totalUsers
          },
          recentIncidents
        }
      });
    } catch (error) {
      console.error('Error fetching dashboard statistics:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard statistics',
        error: error.message
      });
    }
  }
  
  /**
   * Get incidents grouped by status
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getIncidentsByStatus(req, res) {
    try {
      const { period = '30days' } = req.query;
      
      // Calculate date range based on period
      const endDate = new Date();
      let startDate = new Date();
      
      switch (period) {
        case '7days':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30days':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90days':
          startDate.setDate(startDate.getDate() - 90);
          break;
        case '1year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        default:
          startDate.setDate(startDate.getDate() - 30);
      }
      
      // Aggregate incidents by status
      const incidentsByStatus = await Incident.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]);
      
      // Format the response
      const formattedData = {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: []
        }]
      };
      
      // Color mapping for different statuses
      const colorMap = {
        'open': '#FF6384',
        'in-progress': '#36A2EB',
        'resolved': '#4BC0C0',
        'closed': '#9966FF',
        'pending': '#FFCE56'
      };
      
      incidentsByStatus.forEach(item => {
        formattedData.labels.push(item._id);
        formattedData.datasets[0].data.push(item.count);
        formattedData.datasets[0].backgroundColor.push(colorMap[item._id] || '#CCCCCC');
      });
      
      return res.status(200).json({
        success: true,
        period,
        data: formattedData
      });
    } catch (error) {
      console.error('Error fetching incidents by status:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch incidents by status',
        error: error.message
      });
    }
  }
  
  /**
   * Get incidents grouped by priority
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getIncidentsByPriority(req, res) {
    try {
      const { period = '30days' } = req.query;
      
      // Calculate date range based on period
      const endDate = new Date();
      let startDate = new Date();
      
      switch (period) {
        case '7days':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30days':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90days':
          startDate.setDate(startDate.getDate() - 90);
          break;
        case '1year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        default:
          startDate.setDate(startDate.getDate() - 30);
      }
      
      // Aggregate incidents by priority
      const incidentsByPriority = await Incident.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: '$priority',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]);
      
      // Format the response
      const formattedData = {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: []
        }]
      };
      
      // Color mapping for different priorities
      const colorMap = {
        'low': '#4BC0C0',
        'medium': '#FFCE56',
        'high': '#FF6384',
        'critical': '#FF0000'
      };
      
      incidentsByPriority.forEach(item => {
        formattedData.labels.push(item._id);
        formattedData.datasets[0].data.push(item.count);
        formattedData.datasets[0].backgroundColor.push(colorMap[item._id] || '#CCCCCC');
      });
      
      return res.status(200).json({
        success: true,
        period,
        data: formattedData
      });
    } catch (error) {
      console.error('Error fetching incidents by priority:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch incidents by priority',
        error: error.message
      });
    }
  }
  
  /**
   * Get equipment statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getEquipmentStats(req, res) {
    try {
      // Get equipment by status
      const equipmentByStatus = await Equipment.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]);
      
      // Get equipment by type
      const equipmentByType = await Equipment.aggregate([
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        },
        {
          $limit: 5
        }
      ]);
      
      // Get recently added equipment
      const recentEquipment = await Equipment.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('assignedTo', 'firstName lastName');
      
      // Format status data for charts
      const statusData = {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: []
        }]
      };
      
      const statusColorMap = {
        'available': '#4BC0C0',
        'assigned': '#36A2EB',
        'maintenance': '#FFCE56',
        'retired': '#9966FF',
        'broken': '#FF6384'
      };
      
      equipmentByStatus.forEach(item => {
        statusData.labels.push(item._id);
        statusData.datasets[0].data.push(item.count);
        statusData.datasets[0].backgroundColor.push(statusColorMap[item._id] || '#CCCCCC');
      });
      
      // Format type data for charts
      const typeData = {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
        }]
      };
      
      equipmentByType.forEach(item => {
        typeData.labels.push(item._id);
        typeData.datasets[0].data.push(item.count);
      });
      
      return res.status(200).json({
        success: true,
        data: {
          statusDistribution: statusData,
          typeDistribution: typeData,
          recentEquipment
        }
      });
    } catch (error) {
      console.error('Error fetching equipment statistics:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch equipment statistics',
        error: error.message
      });
    }
  }
}

module.exports = new DashboardController();