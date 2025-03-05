/**
 * Dashboard API Service
 * Handles all dashboard-related API requests for analytics and statistics
 */
import apiClient from '../../../services/api/apiClient';

/**
 * Dashboard API endpoints
 */
const DASHBOARD_ENDPOINTS = {
  SUMMARY: '/api/dashboard/summary',
  INCIDENTS_STATS: '/api/dashboard/incidents/stats',
  INCIDENTS_BY_STATUS: '/api/dashboard/incidents/by-status',
  INCIDENTS_BY_PRIORITY: '/api/dashboard/incidents/by-priority',
  INCIDENTS_BY_CATEGORY: '/api/dashboard/incidents/by-category',
  INCIDENTS_TREND: '/api/dashboard/incidents/trend',
  EQUIPMENT_STATS: '/api/dashboard/equipment/stats',
  EQUIPMENT_BY_STATUS: '/api/dashboard/equipment/by-status',
  EQUIPMENT_BY_TYPE: '/api/dashboard/equipment/by-type',
  PERFORMANCE_METRICS: '/api/dashboard/performance-metrics',
  RECENT_INCIDENTS: '/api/dashboard/recent-incidents',
  RECENT_EQUIPMENT: '/api/dashboard/recent-equipment',
  USER_STATS: '/api/dashboard/users/stats',
  RESPONSE_TIME: '/api/dashboard/response-time',
  RESOLUTION_TIME: '/api/dashboard/resolution-time',
  CUSTOM_REPORT: '/api/dashboard/custom-report',
};

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
   * @returns {Promise<Object>} Dashboard summary data
   */
  getSummary: async (filter = {}) => {
    try {
      const response = await apiClient.get(DASHBOARD_ENDPOINTS.SUMMARY, { params: filter });
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      throw error;
    }
  },

  /**
   * Get incidents statistics
   * @param {TimePeriodFilter} [filter] - Optional time period filter
   * @returns {Promise<Object>} Incidents statistics
   */
  getIncidentsStats: async (filter = {}) => {
    try {
      const response = await apiClient.get(DASHBOARD_ENDPOINTS.INCIDENTS_STATS, { params: filter });
      return response.data;
    } catch (error) {
      console.error('Error fetching incidents statistics:', error);
      throw error;
    }
  },

  /**
   * Get incidents grouped by status
   * @param {TimePeriodFilter} [filter] - Optional time period filter
   * @returns {Promise<Object>} Incidents by status
   */
  getIncidentsByStatus: async (filter = {}) => {
    try {
      const response = await apiClient.get(DASHBOARD_ENDPOINTS.INCIDENTS_BY_STATUS, { params: filter });
      return response.data;
    } catch (error) {
      console.error('Error fetching incidents by status:', error);
      throw error;
    }
  },

  /**
   * Get incidents grouped by priority
   * @param {TimePeriodFilter} [filter] - Optional time period filter
   * @returns {Promise<Object>} Incidents by priority
   */
  getIncidentsByPriority: async (filter = {}) => {
    try {
      const response = await apiClient.get(DASHBOARD_ENDPOINTS.INCIDENTS_BY_PRIORITY, { params: filter });
      return response.data;
    } catch (error) {
      console.error('Error fetching incidents by priority:', error);
      throw error;
    }
  },

  /**
   * Get incidents grouped by category
   * @param {TimePeriodFilter} [filter] - Optional time period filter
   * @returns {Promise<Object>} Incidents by category
   */
  getIncidentsByCategory: async (filter = {}) => {
    try {
      const response = await apiClient.get(DASHBOARD_ENDPOINTS.INCIDENTS_BY_CATEGORY, { params: filter });
      return response.data;
    } catch (error) {
      console.error('Error fetching incidents by category:', error);
      throw error;
    }
  },

  /**
   * Get incidents trend over time
   * @param {TimePeriodFilter & {interval: string}} filter - Time period filter with interval ('day', 'week', 'month')
   * @returns {Promise<Object>} Incidents trend data
   */
  getIncidentsTrend: async (filter = { interval: 'day' }) => {
    try {
      const response = await apiClient.get(DASHBOARD_ENDPOINTS.INCIDENTS_TREND, { params: filter });
      return response.data;
    } catch (error) {
      console.error('Error fetching incidents trend:', error);
      throw error;
    }
  },

  /**
   * Get equipment statistics
   * @param {TimePeriodFilter} [filter] - Optional time period filter
   * @returns {Promise<Object>} Equipment statistics
   */
  getEquipmentStats: async (filter = {}) => {
    try {
      const response = await apiClient.get(DASHBOARD_ENDPOINTS.EQUIPMENT_STATS, { params: filter });
      return response.data;
    } catch (error) {
      console.error('Error fetching equipment statistics:', error);
      throw error;
    }
  },

  /**
   * Get equipment grouped by status
   * @param {TimePeriodFilter} [filter] - Optional time period filter
   * @returns {Promise<Object>} Equipment by status
   */
  getEquipmentByStatus: async (filter = {}) => {
    try {
      const response = await apiClient.get(DASHBOARD_ENDPOINTS.EQUIPMENT_BY_STATUS, { params: filter });
      return response.data;
    } catch (error) {
      console.error('Error fetching equipment by status:', error);
      throw error;
    }
  },

  /**
   * Get equipment grouped by type
   * @param {TimePeriodFilter} [filter] - Optional time period filter
   * @returns {Promise<Object>} Equipment by type
   */
  getEquipmentByType: async (filter = {}) => {
    try {
      const response = await apiClient.get(DASHBOARD_ENDPOINTS.EQUIPMENT_BY_TYPE, { params: filter });
      return response.data;
    } catch (error) {
      console.error('Error fetching equipment by type:', error);
      throw error;
    }
  },

  /**
   * Get performance metrics
   * @param {TimePeriodFilter} [filter] - Optional time period filter
   * @returns {Promise<Object>} Performance metrics
   */
  getPerformanceMetrics: async (filter = {}) => {
    try {
      const response = await apiClient.get(DASHBOARD_ENDPOINTS.PERFORMANCE_METRICS, { params: filter });
      return response.data;
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      throw error;
    }
  },

  /**
   * Get recent incidents
   * @param {Object} options - Query options
   * @param {number} [options.limit=5] - Number of incidents to retrieve
   * @returns {Promise<Object>} Recent incidents
   */
  getRecentIncidents: async (options = { limit: 5 }) => {
    try {
      const response = await apiClient.get(DASHBOARD_ENDPOINTS.RECENT_INCIDENTS, { params: options });
      return response.data;
    } catch (error) {
      console.error('Error fetching recent incidents:', error);
      throw error;
    }
  },

  /**
   * Get recent equipment
   * @param {Object} options - Query options
   * @param {number} [options.limit=5] - Number of equipment items to retrieve
   * @returns {Promise<Object>} Recent equipment
   */
  getRecentEquipment: async (options = { limit: 5 }) => {
    try {
      const response = await apiClient.get(DASHBOARD_ENDPOINTS.RECENT_EQUIPMENT, { params: options });
      return response.data;
    } catch (error) {
      console.error('Error fetching recent equipment:', error);
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
      const response = await apiClient.get(DASHBOARD_ENDPOINTS.USER_STATS, { params: filter });
      return response.data;
    } catch (error) {
      console.error('Error fetching user statistics:', error);
      throw error;
    }
  },

  /**
   * Get response time statistics
   * @param {TimePeriodFilter & {groupBy: string}} filter - Time period filter with groupBy parameter
   * @returns {Promise<Object>} Response time statistics
   */
  getResponseTimeStats: async (filter = { groupBy: 'day' }) => {
    try {
      const response = await apiClient.get(DASHBOARD_ENDPOINTS.RESPONSE_TIME, { params: filter });
      return response.data;
    } catch (error) {
      console.error('Error fetching response time statistics:', error);
      throw error;
    }
  },

  /**
   * Get resolution time statistics
   * @param {TimePeriodFilter & {groupBy: string}} filter - Time period filter with groupBy parameter
   * @returns {Promise<Object>} Resolution time statistics
   */
  getResolutionTimeStats: async (filter = { groupBy: 'day' }) => {
    try {
      const response = await apiClient.get(DASHBOARD_ENDPOINTS.RESOLUTION_TIME, { params: filter });
      return response.data;
    } catch (error) {
      console.error('Error fetching resolution time statistics:', error);
      throw error;
    }
  },

  /**
   * Generate a custom report based on specified parameters
   * @param {Object} params - Report parameters
   * @param {string[]} params.metrics - Metrics to include in the report
   * @param {string[]} params.dimensions - Dimensions to group by
   * @param {TimePeriodFilter} params.timeFilter - Time period filter
   * @param {Object} params.filters - Additional filters
   * @returns {Promise<Object>} Custom report data
   */
  generateCustomReport: async (params) => {
    try {
      const response = await apiClient.post(DASHBOARD_ENDPOINTS.CUSTOM_REPORT, params);
      return response.data;
    } catch (error) {
      console.error('Error generating custom report:', error);
      throw error;
    }
  },

  /**
   * Export dashboard data to specified format
   * @param {string} endpoint - Dashboard endpoint to export
   * @param {Object} params - Query parameters
   * @param {string} format - Export format ('csv', 'xlsx', 'pdf')
   * @returns {Promise<Blob>} Exported file as blob
   */
  exportData: async (endpoint, params = {}, format = 'xlsx') => {
    try {
      const response = await apiClient.get(`${endpoint}/export`, {
        params: { ...params, format },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error(`Error exporting data from ${endpoint}:`, error);
      throw error;
    }
  }
};

export default dashboardApi;