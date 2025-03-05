const IncidentModel = require('../models/incident.model');
const EquipmentModel = require('../models/equipment.model');
const PDFService = require('../services/pdf.service');
const ExcelService = require('../services/excel.service');

/**
 * Controller for handling report generation requests
 */
class ReportController {
  /**
   * Generate a report for incidents based on filters
   * @param {Object} req - Express request object
   * @param {Object} req.query - Query parameters for filtering
   * @param {String} req.query.startDate - Start date for report period
   * @param {String} req.query.endDate - End date for report period
   * @param {String} req.query.status - Filter by incident status
   * @param {String} req.query.priority - Filter by incident priority
   * @param {Object} res - Express response object
   * @returns {Object} Report data or error
   */
  async generateIncidentReport(req, res) {
    try {
      const { startDate, endDate, status, priority } = req.query;
      
      // Build filter object based on provided query parameters
      const filter = {};
      
      if (startDate && endDate) {
        filter.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }
      
      if (status) {
        filter.status = status;
      }
      
      if (priority) {
        filter.priority = priority;
      }
      
      // Fetch incidents based on filter
      const incidents = await IncidentModel.find(filter)
        .populate('assignedTo', 'name email')
        .populate('reportedBy', 'name email')
        .populate('relatedEquipment', 'name type serialNumber');
      
      // Calculate statistics
      const statistics = {
        total: incidents.length,
        byStatus: {},
        byPriority: {},
        averageResolutionTime: 0
      };
      
      // Calculate status distribution
      incidents.forEach(incident => {
        // Count by status
        if (!statistics.byStatus[incident.status]) {
          statistics.byStatus[incident.status] = 0;
        }
        statistics.byStatus[incident.status]++;
        
        // Count by priority
        if (!statistics.byPriority[incident.priority]) {
          statistics.byPriority[incident.priority] = 0;
        }
        statistics.byPriority[incident.priority]++;
        
        // Calculate resolution time for resolved incidents
        if (incident.status === 'resolved' && incident.resolvedAt) {
          const resolutionTime = new Date(incident.resolvedAt) - new Date(incident.createdAt);
          statistics.averageResolutionTime += resolutionTime;
        }
      });
      
      // Calculate average resolution time in hours
      if (statistics.byStatus['resolved'] > 0) {
        statistics.averageResolutionTime = (statistics.averageResolutionTime / statistics.byStatus['resolved']) / (1000 * 60 * 60);
      }
      
      return res.status(200).json({
        success: true,
        data: {
          incidents,
          statistics
        }
      });
    } catch (error) {
      console.error('Error generating incident report:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate incident report',
        error: error.message
      });
    }
  }

  /**
   * Generate a report for equipment based on filters
   * @param {Object} req - Express request object
   * @param {Object} req.query - Query parameters for filtering
   * @param {String} req.query.type - Filter by equipment type
   * @param {String} req.query.status - Filter by equipment status
   * @param {String} req.query.location - Filter by equipment location
   * @param {Object} res - Express response object
   * @returns {Object} Report data or error
   */
  async generateEquipmentReport(req, res) {
    try {
      const { type, status, location } = req.query;
      
      // Build filter object based on provided query parameters
      const filter = {};
      
      if (type) {
        filter.type = type;
      }
      
      if (status) {
        filter.status = status;
      }
      
      if (location) {
        filter.location = location;
      }
      
      // Fetch equipment based on filter
      const equipment = await EquipmentModel.find(filter)
        .populate('assignedTo', 'name email department')
        .populate('lastMaintenance.performedBy', 'name email');
      
      // Calculate statistics
      const statistics = {
        total: equipment.length,
        byType: {},
        byStatus: {},
        byLocation: {},
        needsMaintenance: 0
      };
      
      const currentDate = new Date();
      
      equipment.forEach(item => {
        // Count by type
        if (!statistics.byType[item.type]) {
          statistics.byType[item.type] = 0;
        }
        statistics.byType[item.type]++;
        
        // Count by status
        if (!statistics.byStatus[item.status]) {
          statistics.byStatus[item.status] = 0;
        }
        statistics.byStatus[item.status]++;
        
        // Count by location
        if (!statistics.byLocation[item.location]) {
          statistics.byLocation[item.location] = 0;
        }
        statistics.byLocation[item.location]++;
        
        // Check if maintenance is needed
        if (item.nextMaintenanceDate && new Date(item.nextMaintenanceDate) <= currentDate) {
          statistics.needsMaintenance++;
        }
      });
      
      return res.status(200).json({
        success: true,
        data: {
          equipment,
          statistics
        }
      });
    } catch (error) {
      console.error('Error generating equipment report:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate equipment report',
        error: error.message
      });
    }
  }

  /**
   * Export report data to PDF format
   * @param {Object} req - Express request object
   * @param {Object} req.body - Request body containing report data
   * @param {String} req.body.reportType - Type of report (incident or equipment)
   * @param {Object} req.body.data - Report data to export
   * @param {Object} res - Express response object
   * @returns {Buffer} PDF file as download or error
   */
  async exportToPDF(req, res) {
    try {
      const { reportType, data } = req.body;
      
      if (!reportType || !data) {
        return res.status(400).json({
          success: false,
          message: 'Report type and data are required'
        });
      }
      
      // Generate PDF based on report type
      let pdfBuffer;
      if (reportType === 'incident') {
        pdfBuffer = await PDFService.generateIncidentPDF(data);
      } else if (reportType === 'equipment') {
        pdfBuffer = await PDFService.generateEquipmentPDF(data);
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid report type'
        });
      }
      
      // Set response headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${reportType}_report_${new Date().toISOString().split('T')[0]}.pdf`);
      
      // Send PDF buffer as response
      return res.send(pdfBuffer);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to export report to PDF',
        error: error.message
      });
    }
  }

  /**
   * Export report data to Excel format
   * @param {Object} req - Express request object
   * @param {Object} req.body - Request body containing report data
   * @param {String} req.body.reportType - Type of report (incident or equipment)
   * @param {Object} req.body.data - Report data to export
   * @param {Object} res - Express response object
   * @returns {Buffer} Excel file as download or error
   */
  async exportToExcel(req, res) {
    try {
      const { reportType, data } = req.body;
      
      if (!reportType || !data) {
        return res.status(400).json({
          success: false,
          message: 'Report type and data are required'
        });
      }
      
      // Generate Excel based on report type
      let excelBuffer;
      if (reportType === 'incident') {
        excelBuffer = await ExcelService.generateIncidentExcel(data);
      } else if (reportType === 'equipment') {
        excelBuffer = await ExcelService.generateEquipmentExcel(data);
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid report type'
        });
      }
      
      // Set response headers for Excel download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=${reportType}_report_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      // Send Excel buffer as response
      return res.send(excelBuffer);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to export report to Excel',
        error: error.message
      });
    }
  }
}

module.exports = new ReportController();