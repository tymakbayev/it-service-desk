import axios from 'axios';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../../utils/constants';

/**
 * Service for handling equipment-related API operations
 */
class EquipmentService {
  /**
   * Base URL for equipment endpoints
   * @private
   */
  _baseUrl = `${API_BASE_URL}/equipment`;

  /**
   * Default headers for API requests
   * @private
   */
  _getHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    };
  }

  /**
   * Fetch all equipment with optional filtering, pagination and sorting
   * 
   * @param {Object} options - Request options
   * @param {number} options.page - Page number for pagination
   * @param {number} options.limit - Number of items per page
   * @param {Object} options.filters - Filter criteria
   * @param {string} options.sortBy - Field to sort by
   * @param {string} options.sortOrder - Sort order ('asc' or 'desc')
   * @returns {Promise<Object>} - Equipment list response with pagination metadata
   */
  async getEquipmentList({ page = 1, limit = 10, filters = {}, sortBy = 'createdAt', sortOrder = 'desc' } = {}) {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      queryParams.append('page', page.toString());
      queryParams.append('limit', limit.toString());
      queryParams.append('sortBy', sortBy);
      queryParams.append('sortOrder', sortOrder);
      
      // Add filters to query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const response = await axios.get(`${this._baseUrl}?${queryParams.toString()}`, {
        headers: this._getHeaders(),
      });

      return response.data;
    } catch (error) {
      this._handleError(error, 'Failed to fetch equipment list');
      throw error;
    }
  }

  /**
   * Get equipment by ID
   * 
   * @param {string} id - Equipment ID
   * @returns {Promise<Object>} - Equipment details
   */
  async getEquipmentById(id) {
    try {
      const response = await axios.get(`${this._baseUrl}/${id}`, {
        headers: this._getHeaders(),
      });
      return response.data;
    } catch (error) {
      this._handleError(error, 'Failed to fetch equipment details');
      throw error;
    }
  }

  /**
   * Create new equipment
   * 
   * @param {Object} equipmentData - Equipment data
   * @returns {Promise<Object>} - Created equipment
   */
  async createEquipment(equipmentData) {
    try {
      const response = await axios.post(this._baseUrl, equipmentData, {
        headers: this._getHeaders(),
      });
      toast.success('Equipment created successfully');
      return response.data;
    } catch (error) {
      this._handleError(error, 'Failed to create equipment');
      throw error;
    }
  }

  /**
   * Update existing equipment
   * 
   * @param {string} id - Equipment ID
   * @param {Object} equipmentData - Updated equipment data
   * @returns {Promise<Object>} - Updated equipment
   */
  async updateEquipment(id, equipmentData) {
    try {
      const response = await axios.put(`${this._baseUrl}/${id}`, equipmentData, {
        headers: this._getHeaders(),
      });
      toast.success('Equipment updated successfully');
      return response.data;
    } catch (error) {
      this._handleError(error, 'Failed to update equipment');
      throw error;
    }
  }

  /**
   * Delete equipment
   * 
   * @param {string} id - Equipment ID
   * @returns {Promise<Object>} - Deletion response
   */
  async deleteEquipment(id) {
    try {
      const response = await axios.delete(`${this._baseUrl}/${id}`, {
        headers: this._getHeaders(),
      });
      toast.success('Equipment deleted successfully');
      return response.data;
    } catch (error) {
      this._handleError(error, 'Failed to delete equipment');
      throw error;
    }
  }

  /**
   * Assign equipment to a user
   * 
   * @param {string} equipmentId - Equipment ID
   * @param {string} userId - User ID
   * @param {string} notes - Assignment notes
   * @returns {Promise<Object>} - Assignment response
   */
  async assignEquipment(equipmentId, userId, notes = '') {
    try {
      const response = await axios.post(
        `${this._baseUrl}/${equipmentId}/assign`,
        { userId, notes },
        { headers: this._getHeaders() }
      );
      toast.success('Equipment assigned successfully');
      return response.data;
    } catch (error) {
      this._handleError(error, 'Failed to assign equipment');
      throw error;
    }
  }

  /**
   * Unassign equipment from a user
   * 
   * @param {string} equipmentId - Equipment ID
   * @returns {Promise<Object>} - Unassignment response
   */
  async unassignEquipment(equipmentId) {
    try {
      const response = await axios.post(
        `${this._baseUrl}/${equipmentId}/unassign`,
        {},
        { headers: this._getHeaders() }
      );
      toast.success('Equipment unassigned successfully');
      return response.data;
    } catch (error) {
      this._handleError(error, 'Failed to unassign equipment');
      throw error;
    }
  }

  /**
   * Get equipment assignment history
   * 
   * @param {string} equipmentId - Equipment ID
   * @returns {Promise<Array>} - Assignment history
   */
  async getEquipmentHistory(equipmentId) {
    try {
      const response = await axios.get(`${this._baseUrl}/${equipmentId}/history`, {
        headers: this._getHeaders(),
      });
      return response.data;
    } catch (error) {
      this._handleError(error, 'Failed to fetch equipment history');
      throw error;
    }
  }

  /**
   * Change equipment status
   * 
   * @param {string} equipmentId - Equipment ID
   * @param {string} status - New status
   * @param {string} notes - Status change notes
   * @returns {Promise<Object>} - Updated equipment
   */
  async changeEquipmentStatus(equipmentId, status, notes = '') {
    try {
      const response = await axios.post(
        `${this._baseUrl}/${equipmentId}/status`,
        { status, notes },
        { headers: this._getHeaders() }
      );
      toast.success(`Equipment status changed to ${status}`);
      return response.data;
    } catch (error) {
      this._handleError(error, 'Failed to change equipment status');
      throw error;
    }
  }

  /**
   * Export equipment list to CSV/Excel
   * 
   * @param {Object} filters - Filter criteria
   * @param {string} format - Export format ('csv' or 'excel')
   * @returns {Promise<Blob>} - File blob
   */
  async exportEquipment(filters = {}, format = 'csv') {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      queryParams.append('format', format);
      
      // Add filters to query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const response = await axios.get(`${this._baseUrl}/export?${queryParams.toString()}`, {
        headers: this._getHeaders(),
        responseType: 'blob',
      });
      
      return response.data;
    } catch (error) {
      this._handleError(error, 'Failed to export equipment data');
      throw error;
    }
  }

  /**
   * Get equipment statistics
   * 
   * @returns {Promise<Object>} - Equipment statistics
   */
  async getEquipmentStats() {
    try {
      const response = await axios.get(`${this._baseUrl}/stats`, {
        headers: this._getHeaders(),
      });
      return response.data;
    } catch (error) {
      this._handleError(error, 'Failed to fetch equipment statistics');
      throw error;
    }
  }

  /**
   * Upload equipment image
   * 
   * @param {string} equipmentId - Equipment ID
   * @param {File} imageFile - Image file
   * @returns {Promise<Object>} - Upload response
   */
  async uploadEquipmentImage(equipmentId, imageFile) {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const headers = this._getHeaders();
      delete headers['Content-Type']; // Let browser set content type for form data

      const response = await axios.post(
        `${this._baseUrl}/${equipmentId}/image`,
        formData,
        { 
          headers: {
            ...headers,
          }
        }
      );
      
      toast.success('Image uploaded successfully');
      return response.data;
    } catch (error) {
      this._handleError(error, 'Failed to upload equipment image');
      throw error;
    }
  }

  /**
   * Bulk import equipment from CSV/Excel
   * 
   * @param {File} file - CSV/Excel file
   * @returns {Promise<Object>} - Import results
   */
  async bulkImportEquipment(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const headers = this._getHeaders();
      delete headers['Content-Type']; // Let browser set content type for form data

      const response = await axios.post(
        `${this._baseUrl}/import`,
        formData,
        { 
          headers: {
            ...headers,
          }
        }
      );
      
      toast.success('Equipment data imported successfully');
      return response.data;
    } catch (error) {
      this._handleError(error, 'Failed to import equipment data');
      throw error;
    }
  }

  /**
   * Handle API errors
   * 
   * @private
   * @param {Error} error - Error object
   * @param {string} defaultMessage - Default error message
   */
  _handleError(error, defaultMessage = 'An error occurred') {
    const errorMessage = 
      error.response?.data?.message || 
      error.message || 
      defaultMessage;
    
    toast.error(errorMessage);
    
    // Log error for debugging
    console.error('Equipment service error:', error);
  }
}

// Create and export a singleton instance
const equipmentService = new EquipmentService();
export default equipmentService;