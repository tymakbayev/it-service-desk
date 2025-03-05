/**
 * Dashboard API Service
 * Handles all dashboard-related API requests for analytics and statistics
 */
import apiClient from './apiClient';

/**
 * Dashboard API endpoints
 */
const DASHBOARD_ENDPOINTS = {
  SUMMARY: '/dashboard/summary',
  INCIDENTS_STATS: '/dashboard/incidents/stats',
  INCIDENTS_BY_STATUS: '/dashboard/incidents/by-status',
  INCIDENTS_BY_PRIORITY: '/dashboard/incidents/by-priority',
  INCIDENTS_BY_CATEGORY: '/dashboard/incidents/by-category',
  INCIDENTS_TREND: '/dashboard/incidents/trend',
  EQUIPMENT_STATS: '/dashboard/equipment/stats',
  EQUIPMENT_BY_STATUS: '/dashboard/equipment/by-status',
  EQUIPMENT_BY_TYPE: '/dashboard/equipment/by-type',
  PERFORMANCE_METRICS: '/dashboard/performance-metrics',
  RECENT_INCIDENTS: '/dashboard/recent-incidents',
  RECENT_EQUIPMENT: '/dashboard/recent-equipment',
  USER_STATS: '/dashboard/users/stats',
  RESPONSE_TIME: '/dashboard/response-time',
  RESOLUTION_TIME: '/dashboard/resolution-time',
  CUSTOM_REPORT: '/dashboard/custom-report',
};

/**
 * Dashboard summary response
 * @typedef {Object} DashboardSummary
 * @property {number} totalIncidents - Total number of incidents
 * @property {number} openIncidents - Number of open incidents
 * @property {number} resolvedIncidents - Number of resolved incidents
 * @property {number} totalEquipment - Total number of equipment
 * @property {number} activeEquipment - Number of active equipment
 * @property {number} maintenanceEquipment - Number of equipment in maintenance
 * @property {number} pendingRequests - Number of pending requests
 * @property {number} totalUsers - Total number of users
 */

/**
 * Incidents statistics response
 * @typedef {Object} IncidentsStats
 * @property {number} total - Total number of incidents
 * @property {number} open - Number of open incidents
 * @property {number} inProgress - Number of in-progress incidents
 * @property {number} resolved - Number of resolved incidents
 * @property {number} closed - Number of closed incidents
 * @property {number} highPriority - Number of high priority incidents
 * @property {number} mediumPriority - Number of medium priority incidents
 * @property {number} lowPriority - Number of low priority incidents
 * @property {number} avgResolutionTime - Average resolution time in hours
 */

/**
 * Equipment statistics response
 * @typedef {Object} EquipmentStats
 * @property {number} total - Total number of equipment
 * @property {number} active - Number of active equipment
 * @property {number} maintenance - Number of equipment in maintenance
 * @property {number} retired - Number of retired equipment
 * @property {number} laptops - Number of laptops
 * @property {number} desktops - Number of desktops
 * @property {number} servers - Number of servers
 * @property {number} networking - Number of networking equipment
 * @property {number} peripherals - Number of peripherals
 */

/**
 * Performance metrics response
 * @typedef {Object} PerformanceMetrics
 * @property {number} avgResponseTime - Average response time in hours
 * @property {number} avgResolutionTime - Average resolution time in hours
 * @property {number} slaComplianceRate - SLA compliance rate in percentage
 * @property {number} firstContactResolution - First contact resolution rate in percentage
 * @property {number} reopenRate - Reopen rate in percentage
 * @property {number} customerSatisfaction - Customer satisfaction score
 */

/**
 * Time period filter for dashboard queries
 * @typedef {Object} TimePeriodFilter
 * @property {string} [startDate] - Start date in ISO format
 * @property {string} [endDate] - End date in ISO format
 * @property {string} [period] - Predefined period ('day', 'week', 'month', 'quarter', 'year')
 */

/**
 * Dashboard API service
 */
const dashboardApi = {
  /**
   * Get dashboard summary statistics
   * @param {TimePeriodFilter} [filter] - Optional time period filter
   * @returns {Promise<DashboardSummary>} Dashboard summary data
   */
  getSummary: async (filter = {}) => {
    try {
      return await apiClient.get(DASHBOARD_ENDPOINTS.SUMMARY, { params: filter });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get detailed incidents statistics
   * @param {TimePeriodFilter} [filter] - Optional time period filter
   * @returns {Promise<IncidentsStats>} Incidents statistics
   */
  getIncidentsStats: async (filter = {}) => {
    try {
      return await apiClient.get(DASHBOARD_ENDPOINTS.INCIDENTS_STATS, { params: filter });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get incidents grouped by status
   * @param {TimePeriodFilter} [filter] - Optional time period filter
   * @returns {Promise<Object>} Incidents count by status
   */
  getIncidentsByStatus: async (filter = {}) => {
    try {
      return await apiClient.get(DASHBOARD_ENDPOINTS.INCIDENTS_BY_STATUS, { params: filter });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get incidents grouped by priority
   * @param {TimePeriodFilter} [filter] - Optional time period filter
   * @returns {Promise<Object>} Incidents count by priority
   */
  getIncidentsByPriority: async (filter = {}) => {
    try {
      return await apiClient.get(DASHBOARD_ENDPOINTS.INCIDENTS_BY_PRIORITY, { params: filter });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get incidents grouped by category
   * @param {TimePeriodFilter} [filter] - Optional time period filter
   * @returns {Promise<Object>} Incidents count by category
   */
  getIncidentsByCategory: async (filter = {}) => {
    try {
      return await apiClient.get(DASHBOARD_ENDPOINTS.INCIDENTS_BY_CATEGORY, { params: filter });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get incidents trend over time
   * @param {TimePeriodFilter & {interval: string}} filter - Time period filter with interval ('day', 'week', 'month')
   * @returns {Promise<Array>} Incidents trend data
   */
  getIncidentsTrend: async (filter = { interval: 'day' }) => {
    try {
      return await apiClient.get(DASHBOARD_ENDPOINTS.INCIDENTS_TREND, { params: filter });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get detailed equipment statistics
   * @param {TimePeriodFilter} [filter] - Optional time period filter
   * @returns {Promise<EquipmentStats>} Equipment statistics
   */
  getEquipmentStats: async (filter = {}) => {
    try {
      return await apiClient.get(DASHBOARD_ENDPOINTS.EQUIPMENT_STATS, { params: filter });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get equipment grouped by status
   * @param {TimePeriodFilter} [filter] - Optional time period filter
   * @returns {Promise<Object>} Equipment count by status
   */
  getEquipmentByStatus: async (filter = {}) => {
    try {
      return await apiClient.get(DASHBOARD_ENDPOINTS.EQUIPMENT_BY_STATUS, { params: filter });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get equipment grouped by type
   * @param {TimePeriodFilter} [filter] - Optional time period filter
   * @returns {Promise<Object>} Equipment count by type
   */
  getEquipmentByType: async (filter = {}) => {
    try {
      return await apiClient.get(DASHBOARD_ENDPOINTS.EQUIPMENT_BY_TYPE, { params: filter });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get performance metrics
   * @param {TimePeriodFilter} [filter] - Optional time period filter
   * @returns {Promise<PerformanceMetrics>} Performance metrics data
   */
  getPerformanceMetrics: async (filter = {}) => {
    try {
      return await apiClient.get(DASHBOARD_ENDPOINTS.PERFORMANCE_METRICS, { params: filter });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get recent incidents for dashboard display
   * @param {Object} options - Query options
   * @param {number} [options.limit=5] - Number of incidents to return
   * @returns {Promise<Array>} List of recent incidents
   */
  getRecentIncidents: async (options = { limit: 5 }) => {
    try {
      return await apiClient.get(DASHBOARD_ENDPOINTS.RECENT_INCIDENTS, { params: options });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get recent equipment changes for dashboard display
   * @param {Object} options - Query options
   * @param {number} [options.limit=5] - Number of equipment items to return
   * @returns {Promise<Array>} List of recent equipment changes
   */
  getRecentEquipment: async (options = { limit: 5 }) => {
    try {
      return await apiClient.get(DASHBOARD_ENDPOINTS.RECENT_EQUIPMENT, { params: options });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get user statistics
   * @param {TimePeriodFilter} [filter] - Optional time period filter
   * @returns {Promise<Object>} User statistics
   */
  getUserStats: async (filter = {}) => {
    try {
      return await apiClient.get(DASHBOARD_ENDPOINTS.USER_STATS, { params: filter });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get average response time statistics
   * @param {TimePeriodFilter & {groupBy: string}} filter - Filter with optional groupBy parameter
   * @returns {Promise<Array>} Response time statistics
   */
  getResponseTimeStats: async (filter = {}) => {
    try {
      return await apiClient.get(DASHBOARD_ENDPOINTS.RESPONSE_TIME, { params: filter });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get average resolution time statistics
   * @param {TimePeriodFilter & {groupBy: string}} filter - Filter with optional groupBy parameter
   * @returns {Promise<Array>} Resolution time statistics
   */
  getResolutionTimeStats: async (filter = {}) => {
    try {
      return await apiClient.get(DASHBOARD_ENDPOINTS.RESOLUTION_TIME, { params: filter });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Generate custom report based on specified parameters
   * @param {Object} params - Report parameters
   * @param {string[]} params.metrics - Metrics to include in the report
   * @param {string} params.groupBy - How to group the data
   * @param {TimePeriodFilter} params.timeFilter - Time period filter
   * @param {Object} [params.additionalFilters] - Additional filters to apply
   * @returns {Promise<Object>} Custom report data
   */
  generateCustomReport: async (params) => {
    try {
      return await apiClient.post(DASHBOARD_ENDPOINTS.CUSTOM_REPORT, params);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Export dashboard data to CSV format
   * @param {string} endpoint - Dashboard endpoint to export
   * @param {Object} params - Query parameters
   * @returns {Promise<Blob>} CSV file as blob
   */
  exportToCsv: async (endpoint, params = {}) => {
    try {
      const response = await apiClient.get(`${endpoint}/export`, {
        params,
        responseType: 'blob',
        headers: {
          Accept: 'text/csv',
        },
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Export dashboard data to Excel format
   * @param {string} endpoint - Dashboard endpoint to export
   * @param {Object} params - Query parameters
   * @returns {Promise<Blob>} Excel file as blob
   */
  exportToExcel: async (endpoint, params = {}) => {
    try {
      const response = await apiClient.get(`${endpoint}/export`, {
        params,
        responseType: 'blob',
        headers: {
          Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Export dashboard data to PDF format
   * @param {string} endpoint - Dashboard endpoint to export
   * @param {Object} params - Query parameters
   * @returns {Promise<Blob>} PDF file as blob
   */
  exportToPdf: async (endpoint, params = {}) => {
    try {
      const response = await apiClient.get(`${endpoint}/export`, {
        params,
        responseType: 'blob',
        headers: {
          Accept: 'application/pdf',
        },
      });
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default dashboardApi;