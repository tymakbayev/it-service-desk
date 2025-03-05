/**
 * Dashboard Service
 * 
 * This service handles all API requests related to the dashboard functionality.
 * It provides methods to fetch dashboard statistics, charts data, and generate reports.
 */
import axios from 'axios';
import apiClient from '../../services/api/apiClient';

/**
 * Dashboard service class for handling all dashboard-related API requests
 */
class DashboardService {
  /**
   * Base URL for dashboard endpoints
   * @private
   */
  constructor() {
    this.baseUrl = '/api/dashboard';
  }

  /**
   * Fetches dashboard statistics data
   * 
   * @param {Object} params - Query parameters
   * @param {string} [params.startDate] - Start date for filtering data (ISO format)
   * @param {string} [params.endDate] - End date for filtering data (ISO format)
   * @returns {Promise<Object>} Dashboard statistics data
   */
  async getStatistics(params = {}) {
    const { startDate, endDate } = params;
    const queryParams = new URLSearchParams();
    
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);
    
    const url = queryParams.toString() 
      ? `${this.baseUrl}/statistics?${queryParams.toString()}` 
      : `${this.baseUrl}/statistics`;
      
    try {
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard statistics:', error);
      throw error;
    }
  }

  /**
   * Fetches complete dashboard data including all charts and statistics
   * 
   * @param {Object} params - Query parameters
   * @param {string} [params.startDate] - Start date for filtering data (ISO format)
   * @param {string} [params.endDate] - End date for filtering data (ISO format)
   * @returns {Promise<Object>} Complete dashboard data
   */
  async getDashboardData(params = {}) {
    const { startDate, endDate } = params;
    const queryParams = new URLSearchParams();
    
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);
    
    const url = queryParams.toString() 
      ? `${this.baseUrl}?${queryParams.toString()}` 
      : this.baseUrl;
      
    try {
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }

  /**
   * Fetches incident trends data for charts
   * 
   * @param {string} period - Time period for trends ('day', 'week', 'month', 'year')
   * @returns {Promise<Object>} Incident trends data
   */
  async getIncidentTrends(period = 'month') {
    try {
      const response = await apiClient.get(`${this.baseUrl}/incident-trends?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching incident trends:', error);
      throw error;
    }
  }

  /**
   * Fetches incidents grouped by priority
   * 
   * @returns {Promise<Object>} Incidents by priority data
   */
  async getIncidentsByPriority() {
    try {
      const response = await apiClient.get(`${this.baseUrl}/incidents-by-priority`);
      return response.data;
    } catch (error) {
      console.error('Error fetching incidents by priority:', error);
      throw error;
    }
  }

  /**
   * Fetches incidents grouped by status
   * 
   * @returns {Promise<Object>} Incidents by status data
   */
  async getIncidentsByStatus() {
    try {
      const response = await apiClient.get(`${this.baseUrl}/incidents-by-status`);
      return response.data;
    } catch (error) {
      console.error('Error fetching incidents by status:', error);
      throw error;
    }
  }

  /**
   * Fetches equipment distribution by type
   * 
   * @returns {Promise<Object>} Equipment distribution data
   */
  async getEquipmentTypeDistribution() {
    try {
      const response = await apiClient.get(`${this.baseUrl}/equipment-distribution`);
      return response.data;
    } catch (error) {
      console.error('Error fetching equipment distribution:', error);
      throw error;
    }
  }

  /**
   * Fetches equipment age distribution
   * 
   * @returns {Promise<Object>} Equipment age distribution data
   */
  async getEquipmentAgeDistribution() {
    try {
      const response = await apiClient.get(`${this.baseUrl}/equipment-age`);
      return response.data;
    } catch (error) {
      console.error('Error fetching equipment age distribution:', error);
      throw error;
    }
  }

  /**
   * Fetches top issue categories
   * 
   * @param {number} limit - Maximum number of categories to return
   * @returns {Promise<Array>} Top issue categories
   */
  async getTopIssueCategories(limit = 5) {
    try {
      const response = await apiClient.get(`${this.baseUrl}/top-issues?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching top issue categories:', error);
      throw error;
    }
  }

  /**
   * Fetches performance metrics for technicians
   * 
   * @param {Object} params - Query parameters
   * @param {string} [params.startDate] - Start date for filtering data (ISO format)
   * @param {string} [params.endDate] - End date for filtering data (ISO format)
   * @returns {Promise<Object>} Performance metrics data
   */
  async getPerformanceMetrics(params = {}) {
    const { startDate, endDate } = params;
    const queryParams = new URLSearchParams();
    
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);
    
    const url = queryParams.toString() 
      ? `${this.baseUrl}/performance-metrics?${queryParams.toString()}` 
      : `${this.baseUrl}/performance-metrics`;
      
    try {
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      throw error;
    }
  }

  /**
   * Generates a report based on provided options
   * 
   * @param {Object} options - Report generation options
   * @param {string} options.type - Report type ('incidents', 'equipment', 'performance')
   * @param {string} options.format - Report format ('pdf', 'excel', 'csv')
   * @param {string} [options.startDate] - Start date for report data (ISO format)
   * @param {string} [options.endDate] - End date for report data (ISO format)
   * @param {Array<string>} [options.fields] - Specific fields to include in the report
   * @param {Object} [options.filters] - Additional filters for the report data
   * @returns {Promise<Blob>} Report file as a Blob
   */
  async generateReport(options) {
    try {
      const response = await apiClient.post(`${this.baseUrl}/reports`, options, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }

  /**
   * Exports dashboard data to a file
   * 
   * @param {Object} options - Export options
   * @param {string} options.format - Export format ('pdf', 'excel', 'csv')
   * @param {string} [options.startDate] - Start date for export data (ISO format)
   * @param {string} [options.endDate] - End date for export data (ISO format)
   * @param {Array<string>} [options.charts] - Specific charts to include in the export
   * @returns {Promise<Blob>} Exported file as a Blob
   */
  async exportDashboard(options) {
    try {
      const response = await apiClient.post(`${this.baseUrl}/export`, options, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting dashboard:', error);
      throw error;
    }
  }

  /**
   * Fetches recent incidents for dashboard display
   * 
   * @param {number} limit - Maximum number of incidents to return
   * @returns {Promise<Array>} Recent incidents
   */
  async getRecentIncidents(limit = 5) {
    try {
      const response = await apiClient.get(`${this.baseUrl}/recent-incidents?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching recent incidents:', error);
      throw error;
    }
  }

  /**
   * Fetches summary statistics for dashboard cards
   * 
   * @returns {Promise<Object>} Summary statistics
   */
  async getSummaryStatistics() {
    try {
      const response = await apiClient.get(`${this.baseUrl}/summary`);
      return response.data;
    } catch (error) {
      console.error('Error fetching summary statistics:', error);
      throw error;
    }
  }

  /**
   * Fetches resolution time metrics
   * 
   * @param {string} period - Time period for metrics ('day', 'week', 'month', 'year')
   * @returns {Promise<Object>} Resolution time metrics
   */
  async getResolutionTimeMetrics(period = 'month') {
    try {
      const response = await apiClient.get(`${this.baseUrl}/resolution-time?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching resolution time metrics:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const dashboardService = new DashboardService();
export default dashboardService;