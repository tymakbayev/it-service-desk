/**
 * Reports API Service
 * Handles all report-related API requests
 */
import apiClient from './apiClient';

/**
 * Reports API endpoints
 */
const REPORTS_ENDPOINTS = {
  GET_ALL: '/reports',
  GET_BY_ID: '/reports/:id',
  CREATE: '/reports',
  UPDATE: '/reports/:id',
  DELETE: '/reports/:id',
  GENERATE: '/reports/generate',
  DOWNLOAD: '/reports/:id/download',
  EXPORT_INCIDENTS: '/reports/export/incidents',
  EXPORT_EQUIPMENT: '/reports/export/equipment',
  GET_TEMPLATES: '/reports/templates',
  SAVE_TEMPLATE: '/reports/templates',
  DELETE_TEMPLATE: '/reports/templates/:id',
};

/**
 * Report data structure
 * @typedef {Object} Report
 * @property {string} _id - Report ID
 * @property {string} title - Report title
 * @property {string} description - Report description
 * @property {string} type - Report type (incidents, equipment, performance, etc.)
 * @property {Object} parameters - Report parameters used for generation
 * @property {string} format - Report format (PDF, XLSX, CSV)
 * @property {string} status - Report status (pending, completed, failed)
 * @property {string} fileUrl - URL to download the report file
 * @property {string} createdBy - ID of the user who created the report
 * @property {Date} createdAt - Creation date
 * @property {Date} updatedAt - Last update date
 */

/**
 * Report template data structure
 * @typedef {Object} ReportTemplate
 * @property {string} _id - Template ID
 * @property {string} name - Template name
 * @property {string} description - Template description
 * @property {string} type - Report type this template is for
 * @property {Object} parameters - Default parameters for this template
 * @property {string} format - Default format (PDF, XLSX, CSV)
 * @property {boolean} isSystem - Whether this is a system template (cannot be deleted)
 * @property {string} createdBy - ID of the user who created the template
 * @property {Date} createdAt - Creation date
 * @property {Date} updatedAt - Last update date
 */

/**
 * Report generation parameters
 * @typedef {Object} ReportGenerationParams
 * @property {string} type - Report type (incidents, equipment, performance, etc.)
 * @property {string} title - Report title
 * @property {string} description - Report description
 * @property {string} format - Report format (PDF, XLSX, CSV)
 * @property {Date} startDate - Start date for report data
 * @property {Date} endDate - End date for report data
 * @property {Array<string>} [categories] - Categories to include
 * @property {Array<string>} [statuses] - Statuses to include
 * @property {Array<string>} [priorities] - Priorities to include
 * @property {Array<string>} [departments] - Departments to include
 * @property {Array<string>} [assignees] - Assignees to include
 * @property {boolean} [includeCharts] - Whether to include charts in the report
 * @property {boolean} [includeRawData] - Whether to include raw data in the report
 * @property {Object} [additionalFilters] - Any additional filters
 */

/**
 * Reports API service
 */
const reportsApi = {
  /**
   * Get all reports with optional filtering
   * @param {Object} params - Query parameters
   * @param {number} [params.page=1] - Page number
   * @param {number} [params.limit=10] - Items per page
   * @param {string} [params.sortBy='createdAt'] - Sort field
   * @param {string} [params.sortOrder='desc'] - Sort order
   * @param {string} [params.type] - Filter by report type
   * @param {string} [params.status] - Filter by report status
   * @param {string} [params.search] - Search term for title or description
   * @param {Date} [params.startDate] - Filter by creation date range start
   * @param {Date} [params.endDate] - Filter by creation date range end
   * @returns {Promise<{reports: Array<Report>, total: number, page: number, limit: number}>} Paginated reports
   */
  getAllReports: async (params = {}) => {
    try {
      const response = await apiClient.get(REPORTS_ENDPOINTS.GET_ALL, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching reports:', error);
      throw error;
    }
  },

  /**
   * Get a report by ID
   * @param {string} id - Report ID
   * @returns {Promise<Report>} Report details
   */
  getReportById: async (id) => {
    try {
      if (!id) {
        throw new Error('Report ID is required');
      }
      const url = REPORTS_ENDPOINTS.GET_BY_ID.replace(':id', id);
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error(`Error fetching report with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new report
   * @param {Object} reportData - Report data
   * @param {string} reportData.title - Report title
   * @param {string} reportData.description - Report description
   * @param {string} reportData.type - Report type
   * @param {Object} reportData.parameters - Report parameters
   * @param {string} reportData.format - Report format
   * @returns {Promise<Report>} Created report
   */
  createReport: async (reportData) => {
    try {
      if (!reportData.title || !reportData.type) {
        throw new Error('Report title and type are required');
      }
      const response = await apiClient.post(REPORTS_ENDPOINTS.CREATE, reportData);
      return response.data;
    } catch (error) {
      console.error('Error creating report:', error);
      throw error;
    }
  },

  /**
   * Update an existing report
   * @param {string} id - Report ID
   * @param {Object} reportData - Updated report data
   * @returns {Promise<Report>} Updated report
   */
  updateReport: async (id, reportData) => {
    try {
      if (!id) {
        throw new Error('Report ID is required');
      }
      const url = REPORTS_ENDPOINTS.UPDATE.replace(':id', id);
      const response = await apiClient.put(url, reportData);
      return response.data;
    } catch (error) {
      console.error(`Error updating report with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a report
   * @param {string} id - Report ID
   * @returns {Promise<{success: boolean, message: string}>} Deletion result
   */
  deleteReport: async (id) => {
    try {
      if (!id) {
        throw new Error('Report ID is required');
      }
      const url = REPORTS_ENDPOINTS.DELETE.replace(':id', id);
      const response = await apiClient.delete(url);
      return response.data;
    } catch (error) {
      console.error(`Error deleting report with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Generate a new report based on parameters
   * @param {ReportGenerationParams} params - Report generation parameters
   * @returns {Promise<Report>} Generated report
   */
  generateReport: async (params) => {
    try {
      if (!params.type || !params.title) {
        throw new Error('Report type and title are required');
      }
      
      // Validate date range if provided
      if (params.startDate && params.endDate) {
        const start = new Date(params.startDate);
        const end = new Date(params.endDate);
        
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          throw new Error('Invalid date format');
        }
        
        if (start > end) {
          throw new Error('Start date must be before end date');
        }
      }
      
      const response = await apiClient.post(REPORTS_ENDPOINTS.GENERATE, params);
      return response.data;
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  },

  /**
   * Download a report file
   * @param {string} id - Report ID
   * @returns {Promise<Blob>} Report file as blob
   */
  downloadReport: async (id) => {
    try {
      if (!id) {
        throw new Error('Report ID is required');
      }
      const url = REPORTS_ENDPOINTS.DOWNLOAD.replace(':id', id);
      const response = await apiClient.get(url, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/pdf, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, text/csv'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error downloading report with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Export incidents data to a file
   * @param {Object} params - Export parameters
   * @param {string} params.format - Export format (PDF, XLSX, CSV)
   * @param {Date} [params.startDate] - Start date for filtering incidents
   * @param {Date} [params.endDate] - End date for filtering incidents
   * @param {Array<string>} [params.statuses] - Incident statuses to include
   * @param {Array<string>} [params.priorities] - Incident priorities to include
   * @param {Array<string>} [params.assignees] - Assignees to include
   * @param {boolean} [params.includeCharts=true] - Whether to include charts
   * @returns {Promise<Blob>} Exported file as blob
   */
  exportIncidents: async (params) => {
    try {
      if (!params.format) {
        throw new Error('Export format is required');
      }
      
      const response = await apiClient.post(REPORTS_ENDPOINTS.EXPORT_INCIDENTS, params, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/pdf, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, text/csv'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error exporting incidents:', error);
      throw error;
    }
  },

  /**
   * Export equipment data to a file
   * @param {Object} params - Export parameters
   * @param {string} params.format - Export format (PDF, XLSX, CSV)
   * @param {Array<string>} [params.categories] - Equipment categories to include
   * @param {Array<string>} [params.statuses] - Equipment statuses to include
   * @param {Array<string>} [params.departments] - Departments to include
   * @param {boolean} [params.includeCharts=true] - Whether to include charts
   * @returns {Promise<Blob>} Exported file as blob
   */
  exportEquipment: async (params) => {
    try {
      if (!params.format) {
        throw new Error('Export format is required');
      }
      
      const response = await apiClient.post(REPORTS_ENDPOINTS.EXPORT_EQUIPMENT, params, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/pdf, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, text/csv'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error exporting equipment:', error);
      throw error;
    }
  },

  /**
   * Get all report templates
   * @param {Object} params - Query parameters
   * @param {string} [params.type] - Filter by report type
   * @param {boolean} [params.isSystem] - Filter by system template status
   * @returns {Promise<Array<ReportTemplate>>} Report templates
   */
  getReportTemplates: async (params = {}) => {
    try {
      const response = await apiClient.get(REPORTS_ENDPOINTS.GET_TEMPLATES, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching report templates:', error);
      throw error;
    }
  },

  /**
   * Save a report template
   * @param {Object} templateData - Template data
   * @param {string} templateData.name - Template name
   * @param {string} templateData.description - Template description
   * @param {string} templateData.type - Report type
   * @param {Object} templateData.parameters - Default parameters
   * @param {string} templateData.format - Default format
   * @returns {Promise<ReportTemplate>} Saved template
   */
  saveReportTemplate: async (templateData) => {
    try {
      if (!templateData.name || !templateData.type) {
        throw new Error('Template name and type are required');
      }
      
      const response = await apiClient.post(REPORTS_ENDPOINTS.SAVE_TEMPLATE, templateData);
      return response.data;
    } catch (error) {
      console.error('Error saving report template:', error);
      throw error;
    }
  },

  /**
   * Delete a report template
   * @param {string} id - Template ID
   * @returns {Promise<{success: boolean, message: string}>} Deletion result
   */
  deleteReportTemplate: async (id) => {
    try {
      if (!id) {
        throw new Error('Template ID is required');
      }
      
      const url = REPORTS_ENDPOINTS.DELETE_TEMPLATE.replace(':id', id);
      const response = await apiClient.delete(url);
      return response.data;
    } catch (error) {
      console.error(`Error deleting report template with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get available report formats
   * @returns {Array<string>} Available formats
   */
  getAvailableFormats: () => {
    return ['PDF', 'XLSX', 'CSV'];
  },

  /**
   * Get available report types
   * @returns {Array<{id: string, name: string, description: string}>} Available report types
   */
  getAvailableReportTypes: () => {
    return [
      {
        id: 'incidents',
        name: 'Incidents Report',
        description: 'Report on incident statistics and details'
      },
      {
        id: 'equipment',
        name: 'Equipment Inventory',
        description: 'Report on equipment inventory and status'
      },
      {
        id: 'performance',
        name: 'Performance Metrics',
        description: 'Report on service desk performance metrics'
      },
      {
        id: 'sla',
        name: 'SLA Compliance',
        description: 'Report on SLA compliance statistics'
      },
      {
        id: 'user',
        name: 'User Activity',
        description: 'Report on user activity and workload'
      },
      {
        id: 'custom',
        name: 'Custom Report',
        description: 'Customizable report with user-defined parameters'
      }
    ];
  }
};

export default reportsApi;