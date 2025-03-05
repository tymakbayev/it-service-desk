/**
 * Equipment API Service
 * Handles all equipment-related API requests
 */
import apiClient from './apiClient';

/**
 * Equipment API endpoints
 */
const EQUIPMENT_ENDPOINTS = {
  GET_ALL: '/equipment',
  GET_BY_ID: (id) => `/equipment/${id}`,
  CREATE: '/equipment',
  UPDATE: (id) => `/equipment/${id}`,
  DELETE: (id) => `/equipment/${id}`,
  ASSIGN: (id) => `/equipment/${id}/assign`,
  UNASSIGN: (id) => `/equipment/${id}/unassign`,
  GET_HISTORY: (id) => `/equipment/${id}/history`,
  GET_TYPES: '/equipment/types',
  GET_STATUSES: '/equipment/statuses',
  SEARCH: '/equipment/search',
  BULK_IMPORT: '/equipment/import',
  BULK_EXPORT: '/equipment/export',
  GET_BY_USER: (userId) => `/equipment/user/${userId}`,
  GET_MAINTENANCE: (id) => `/equipment/${id}/maintenance`,
  ADD_MAINTENANCE: (id) => `/equipment/${id}/maintenance`,
};

/**
 * Equipment data structure
 * @typedef {Object} Equipment
 * @property {string} _id - Equipment ID
 * @property {string} name - Equipment name
 * @property {string} type - Equipment type
 * @property {string} serialNumber - Serial number
 * @property {string} inventoryNumber - Inventory number
 * @property {string} status - Current status
 * @property {string} [location] - Physical location
 * @property {string} [department] - Department
 * @property {Object} [assignedTo] - User the equipment is assigned to
 * @property {Date} purchaseDate - Date of purchase
 * @property {Date} [warrantyExpiration] - Warranty expiration date
 * @property {string} [manufacturer] - Manufacturer
 * @property {string} [model] - Model
 * @property {Object} [specifications] - Technical specifications
 * @property {string} [notes] - Additional notes
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 */

/**
 * Equipment filter parameters
 * @typedef {Object} EquipmentFilterParams
 * @property {string} [search] - Search term for name, serial number, or inventory number
 * @property {string} [type] - Filter by equipment type
 * @property {string} [status] - Filter by status
 * @property {string} [department] - Filter by department
 * @property {string} [assignedTo] - Filter by assigned user ID
 * @property {string} [location] - Filter by location
 * @property {string} [manufacturer] - Filter by manufacturer
 * @property {Date} [purchaseDateFrom] - Filter by purchase date (from)
 * @property {Date} [purchaseDateTo] - Filter by purchase date (to)
 * @property {boolean} [inWarranty] - Filter by warranty status
 * @property {number} [page] - Page number for pagination
 * @property {number} [limit] - Items per page for pagination
 * @property {string} [sortBy] - Field to sort by
 * @property {string} [sortOrder] - Sort order (asc or desc)
 */

/**
 * Equipment maintenance record
 * @typedef {Object} MaintenanceRecord
 * @property {string} _id - Record ID
 * @property {string} equipmentId - Equipment ID
 * @property {string} type - Maintenance type
 * @property {Date} date - Maintenance date
 * @property {string} performedBy - Person who performed maintenance
 * @property {string} description - Description of maintenance
 * @property {string} [outcome] - Outcome of maintenance
 * @property {string} [cost] - Cost of maintenance
 * @property {Date} nextScheduledDate - Next scheduled maintenance date
 */

/**
 * Equipment API service
 */
const equipmentApi = {
  /**
   * Get all equipment with optional filtering
   * @param {EquipmentFilterParams} params - Filter parameters
   * @returns {Promise<{equipment: Equipment[], total: number, page: number, limit: number}>} Paginated equipment list
   */
  getAllEquipment: async (params = {}) => {
    try {
      const response = await apiClient.get(EQUIPMENT_ENDPOINTS.GET_ALL, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get equipment by ID
   * @param {string} id - Equipment ID
   * @returns {Promise<Equipment>} Equipment details
   */
  getEquipmentById: async (id) => {
    try {
      const response = await apiClient.get(EQUIPMENT_ENDPOINTS.GET_BY_ID(id));
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create new equipment
   * @param {Equipment} equipmentData - Equipment data
   * @returns {Promise<Equipment>} Created equipment
   */
  createEquipment: async (equipmentData) => {
    try {
      const response = await apiClient.post(EQUIPMENT_ENDPOINTS.CREATE, equipmentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update equipment
   * @param {string} id - Equipment ID
   * @param {Partial<Equipment>} equipmentData - Updated equipment data
   * @returns {Promise<Equipment>} Updated equipment
   */
  updateEquipment: async (id, equipmentData) => {
    try {
      const response = await apiClient.put(EQUIPMENT_ENDPOINTS.UPDATE(id), equipmentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete equipment
   * @param {string} id - Equipment ID
   * @returns {Promise<{success: boolean, message: string}>} Deletion result
   */
  deleteEquipment: async (id) => {
    try {
      const response = await apiClient.delete(EQUIPMENT_ENDPOINTS.DELETE(id));
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Assign equipment to a user
   * @param {string} equipmentId - Equipment ID
   * @param {string} userId - User ID
   * @param {Object} [assignmentData] - Additional assignment data
   * @returns {Promise<Equipment>} Updated equipment
   */
  assignEquipment: async (equipmentId, userId, assignmentData = {}) => {
    try {
      const response = await apiClient.post(EQUIPMENT_ENDPOINTS.ASSIGN(equipmentId), {
        userId,
        ...assignmentData
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Unassign equipment from a user
   * @param {string} equipmentId - Equipment ID
   * @param {Object} [unassignmentData] - Additional unassignment data
   * @returns {Promise<Equipment>} Updated equipment
   */
  unassignEquipment: async (equipmentId, unassignmentData = {}) => {
    try {
      const response = await apiClient.post(EQUIPMENT_ENDPOINTS.UNASSIGN(equipmentId), unassignmentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get equipment history
   * @param {string} equipmentId - Equipment ID
   * @param {Object} [params] - Query parameters
   * @returns {Promise<Array>} Equipment history
   */
  getEquipmentHistory: async (equipmentId, params = {}) => {
    try {
      const response = await apiClient.get(EQUIPMENT_ENDPOINTS.GET_HISTORY(equipmentId), { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get all equipment types
   * @returns {Promise<string[]>} List of equipment types
   */
  getEquipmentTypes: async () => {
    try {
      const response = await apiClient.get(EQUIPMENT_ENDPOINTS.GET_TYPES);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get all equipment statuses
   * @returns {Promise<string[]>} List of equipment statuses
   */
  getEquipmentStatuses: async () => {
    try {
      const response = await apiClient.get(EQUIPMENT_ENDPOINTS.GET_STATUSES);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Search equipment
   * @param {string} query - Search query
   * @param {Object} [params] - Additional search parameters
   * @returns {Promise<Equipment[]>} Search results
   */
  searchEquipment: async (query, params = {}) => {
    try {
      const response = await apiClient.get(EQUIPMENT_ENDPOINTS.SEARCH, {
        params: {
          q: query,
          ...params
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Import equipment in bulk
   * @param {File} file - CSV or Excel file with equipment data
   * @returns {Promise<{success: boolean, imported: number, errors: Array}>} Import results
   */
  bulkImportEquipment: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post(EQUIPMENT_ENDPOINTS.BULK_IMPORT, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Export equipment data
   * @param {string} format - Export format (csv, xlsx, pdf)
   * @param {EquipmentFilterParams} [filters] - Filters to apply before export
   * @returns {Promise<Blob>} File blob
   */
  exportEquipment: async (format = 'xlsx', filters = {}) => {
    try {
      const response = await apiClient.get(EQUIPMENT_ENDPOINTS.BULK_EXPORT, {
        params: {
          format,
          ...filters
        },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get equipment assigned to a specific user
   * @param {string} userId - User ID
   * @param {Object} [params] - Additional query parameters
   * @returns {Promise<Equipment[]>} List of equipment assigned to the user
   */
  getEquipmentByUser: async (userId, params = {}) => {
    try {
      const response = await apiClient.get(EQUIPMENT_ENDPOINTS.GET_BY_USER(userId), { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get maintenance records for equipment
   * @param {string} equipmentId - Equipment ID
   * @param {Object} [params] - Query parameters
   * @returns {Promise<MaintenanceRecord[]>} Maintenance records
   */
  getMaintenanceRecords: async (equipmentId, params = {}) => {
    try {
      const response = await apiClient.get(EQUIPMENT_ENDPOINTS.GET_MAINTENANCE(equipmentId), { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Add maintenance record for equipment
   * @param {string} equipmentId - Equipment ID
   * @param {MaintenanceRecord} maintenanceData - Maintenance record data
   * @returns {Promise<MaintenanceRecord>} Created maintenance record
   */
  addMaintenanceRecord: async (equipmentId, maintenanceData) => {
    try {
      const response = await apiClient.post(EQUIPMENT_ENDPOINTS.ADD_MAINTENANCE(equipmentId), maintenanceData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get equipment statistics
   * @returns {Promise<Object>} Equipment statistics
   */
  getEquipmentStatistics: async () => {
    try {
      const response = await apiClient.get(`${EQUIPMENT_ENDPOINTS.GET_ALL}/statistics`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Check if serial number is unique
   * @param {string} serialNumber - Serial number to check
   * @param {string} [excludeId] - Equipment ID to exclude from check
   * @returns {Promise<{isUnique: boolean}>} Result indicating if serial number is unique
   */
  checkSerialNumberUnique: async (serialNumber, excludeId = null) => {
    try {
      const params = { serialNumber };
      if (excludeId) {
        params.excludeId = excludeId;
      }
      
      const response = await apiClient.get(`${EQUIPMENT_ENDPOINTS.GET_ALL}/check-serial`, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Check if inventory number is unique
   * @param {string} inventoryNumber - Inventory number to check
   * @param {string} [excludeId] - Equipment ID to exclude from check
   * @returns {Promise<{isUnique: boolean}>} Result indicating if inventory number is unique
   */
  checkInventoryNumberUnique: async (inventoryNumber, excludeId = null) => {
    try {
      const params = { inventoryNumber };
      if (excludeId) {
        params.excludeId = excludeId;
      }
      
      const response = await apiClient.get(`${EQUIPMENT_ENDPOINTS.GET_ALL}/check-inventory`, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default equipmentApi;