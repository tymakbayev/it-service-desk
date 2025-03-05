/**
 * Incidents API Service
 * Handles all incident-related API requests
 */
import apiClient from './apiClient';

/**
 * Incident API endpoints
 */
const INCIDENT_ENDPOINTS = {
  GET_ALL: '/incidents',
  GET_BY_ID: (id) => `/incidents/${id}`,
  CREATE: '/incidents',
  UPDATE: (id) => `/incidents/${id}`,
  DELETE: (id) => `/incidents/${id}`,
  ASSIGN: (id) => `/incidents/${id}/assign`,
  CHANGE_STATUS: (id) => `/incidents/${id}/status`,
  ADD_COMMENT: (id) => `/incidents/${id}/comments`,
  GET_COMMENTS: (id) => `/incidents/${id}/comments`,
  UPLOAD_ATTACHMENT: (id) => `/incidents/${id}/attachments`,
  GET_ATTACHMENTS: (id) => `/incidents/${id}/attachments`,
  GET_HISTORY: (id) => `/incidents/${id}/history`,
  GET_STATS: '/incidents/stats',
  GET_BY_EQUIPMENT: (equipmentId) => `/incidents/equipment/${equipmentId}`,
  GET_BY_USER: (userId) => `/incidents/user/${userId}`,
};

/**
 * Incident priority levels
 * @enum {string}
 */
export const INCIDENT_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

/**
 * Incident status types
 * @enum {string}
 */
export const INCIDENT_STATUS = {
  NEW: 'new',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  ON_HOLD: 'on_hold',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
  REOPENED: 'reopened',
};

/**
 * Incident type categories
 * @enum {string}
 */
export const INCIDENT_CATEGORY = {
  HARDWARE: 'hardware',
  SOFTWARE: 'software',
  NETWORK: 'network',
  SECURITY: 'security',
  ACCESS: 'access',
  EMAIL: 'email',
  OTHER: 'other',
};

/**
 * Incident data structure
 * @typedef {Object} Incident
 * @property {string} _id - Incident ID
 * @property {string} title - Incident title
 * @property {string} description - Detailed description
 * @property {string} status - Current status
 * @property {string} priority - Priority level
 * @property {string} category - Incident category
 * @property {string} reportedBy - User ID who reported the incident
 * @property {string} [assignedTo] - User ID of assignee
 * @property {string} [equipmentId] - Related equipment ID
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 * @property {Date} [resolvedAt] - Resolution timestamp
 * @property {Date} [dueDate] - Due date for resolution
 * @property {string} [resolutionSummary] - Summary of resolution
 * @property {Array} [tags] - Tags associated with the incident
 */

/**
 * Incident filter parameters
 * @typedef {Object} IncidentFilter
 * @property {string} [status] - Filter by status
 * @property {string} [priority] - Filter by priority
 * @property {string} [category] - Filter by category
 * @property {string} [assignedTo] - Filter by assignee
 * @property {string} [reportedBy] - Filter by reporter
 * @property {string} [equipmentId] - Filter by equipment
 * @property {string} [searchTerm] - Search in title and description
 * @property {Date} [startDate] - Filter by creation date range start
 * @property {Date} [endDate] - Filter by creation date range end
 * @property {string} [sortBy] - Field to sort by
 * @property {string} [sortOrder] - Sort order (asc/desc)
 */

/**
 * Pagination parameters
 * @typedef {Object} PaginationParams
 * @property {number} page - Page number (1-based)
 * @property {number} limit - Items per page
 */

/**
 * Comment data structure
 * @typedef {Object} Comment
 * @property {string} _id - Comment ID
 * @property {string} incidentId - Related incident ID
 * @property {string} userId - User who created the comment
 * @property {string} text - Comment text
 * @property {Date} createdAt - Creation timestamp
 */

/**
 * Attachment data structure
 * @typedef {Object} Attachment
 * @property {string} _id - Attachment ID
 * @property {string} incidentId - Related incident ID
 * @property {string} fileName - Original file name
 * @property {string} fileType - MIME type
 * @property {number} fileSize - File size in bytes
 * @property {string} uploadedBy - User who uploaded the file
 * @property {Date} uploadedAt - Upload timestamp
 * @property {string} fileUrl - URL to access the file
 */

/**
 * History entry data structure
 * @typedef {Object} HistoryEntry
 * @property {string} _id - History entry ID
 * @property {string} incidentId - Related incident ID
 * @property {string} userId - User who made the change
 * @property {string} action - Type of action performed
 * @property {Object} changes - Changes made (before/after)
 * @property {Date} timestamp - When the change occurred
 */

/**
 * Incident statistics data structure
 * @typedef {Object} IncidentStats
 * @property {Object} byStatus - Count of incidents by status
 * @property {Object} byPriority - Count of incidents by priority
 * @property {Object} byCategory - Count of incidents by category
 * @property {Object} byTimeframe - Incidents over time periods
 * @property {Object} performance - Resolution time metrics
 */

/**
 * Incidents API service
 */
const incidentsApi = {
  /**
   * Get all incidents with optional filtering and pagination
   * 
   * @param {IncidentFilter} [filters={}] - Filter parameters
   * @param {PaginationParams} [pagination={ page: 1, limit: 10 }] - Pagination parameters
   * @returns {Promise<{ incidents: Incident[], total: number, page: number, limit: number }>} Paginated incidents
   */
  getAllIncidents: async (filters = {}, pagination = { page: 1, limit: 10 }) => {
    try {
      const { page, limit } = pagination;
      
      // Build query parameters
      const queryParams = new URLSearchParams({
        page,
        limit,
        ...filters
      });
      
      // Handle date ranges properly
      if (filters.startDate) {
        queryParams.set('startDate', filters.startDate.toISOString());
      }
      
      if (filters.endDate) {
        queryParams.set('endDate', filters.endDate.toISOString());
      }
      
      const response = await apiClient.get(`${INCIDENT_ENDPOINTS.GET_ALL}?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching incidents:', error);
      throw error;
    }
  },

  /**
   * Get a single incident by ID
   * 
   * @param {string} id - Incident ID
   * @returns {Promise<Incident>} Incident details
   */
  getIncidentById: async (id) => {
    try {
      const response = await apiClient.get(INCIDENT_ENDPOINTS.GET_BY_ID(id));
      return response.data;
    } catch (error) {
      console.error(`Error fetching incident ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new incident
   * 
   * @param {Object} incidentData - New incident data
   * @returns {Promise<Incident>} Created incident
   */
  createIncident: async (incidentData) => {
    try {
      const response = await apiClient.post(INCIDENT_ENDPOINTS.CREATE, incidentData);
      return response.data;
    } catch (error) {
      console.error('Error creating incident:', error);
      throw error;
    }
  },

  /**
   * Update an existing incident
   * 
   * @param {string} id - Incident ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Incident>} Updated incident
   */
  updateIncident: async (id, updateData) => {
    try {
      const response = await apiClient.put(INCIDENT_ENDPOINTS.UPDATE(id), updateData);
      return response.data;
    } catch (error) {
      console.error(`Error updating incident ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete an incident
   * 
   * @param {string} id - Incident ID
   * @returns {Promise<{ success: boolean, message: string }>} Deletion result
   */
  deleteIncident: async (id) => {
    try {
      const response = await apiClient.delete(INCIDENT_ENDPOINTS.DELETE(id));
      return response.data;
    } catch (error) {
      console.error(`Error deleting incident ${id}:`, error);
      throw error;
    }
  },

  /**
   * Assign an incident to a user
   * 
   * @param {string} id - Incident ID
   * @param {string} userId - User ID to assign the incident to
   * @returns {Promise<Incident>} Updated incident
   */
  assignIncident: async (id, userId) => {
    try {
      const response = await apiClient.post(INCIDENT_ENDPOINTS.ASSIGN(id), { userId });
      return response.data;
    } catch (error) {
      console.error(`Error assigning incident ${id}:`, error);
      throw error;
    }
  },

  /**
   * Change the status of an incident
   * 
   * @param {string} id - Incident ID
   * @param {string} status - New status
   * @param {string} [comment] - Optional comment about the status change
   * @returns {Promise<Incident>} Updated incident
   */
  changeIncidentStatus: async (id, status, comment) => {
    try {
      const payload = { status };
      if (comment) {
        payload.comment = comment;
      }
      
      const response = await apiClient.patch(INCIDENT_ENDPOINTS.CHANGE_STATUS(id), payload);
      return response.data;
    } catch (error) {
      console.error(`Error changing status for incident ${id}:`, error);
      throw error;
    }
  },

  /**
   * Add a comment to an incident
   * 
   * @param {string} id - Incident ID
   * @param {string} text - Comment text
   * @returns {Promise<Comment>} Created comment
   */
  addComment: async (id, text) => {
    try {
      const response = await apiClient.post(INCIDENT_ENDPOINTS.ADD_COMMENT(id), { text });
      return response.data;
    } catch (error) {
      console.error(`Error adding comment to incident ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get all comments for an incident
   * 
   * @param {string} id - Incident ID
   * @returns {Promise<Comment[]>} List of comments
   */
  getComments: async (id) => {
    try {
      const response = await apiClient.get(INCIDENT_ENDPOINTS.GET_COMMENTS(id));
      return response.data;
    } catch (error) {
      console.error(`Error fetching comments for incident ${id}:`, error);
      throw error;
    }
  },

  /**
   * Upload an attachment to an incident
   * 
   * @param {string} id - Incident ID
   * @param {File} file - File to upload
   * @returns {Promise<Attachment>} Uploaded attachment details
   */
  uploadAttachment: async (id, file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiClient.post(
        INCIDENT_ENDPOINTS.UPLOAD_ATTACHMENT(id), 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error(`Error uploading attachment to incident ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get all attachments for an incident
   * 
   * @param {string} id - Incident ID
   * @returns {Promise<Attachment[]>} List of attachments
   */
  getAttachments: async (id) => {
    try {
      const response = await apiClient.get(INCIDENT_ENDPOINTS.GET_ATTACHMENTS(id));
      return response.data;
    } catch (error) {
      console.error(`Error fetching attachments for incident ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get the history of changes for an incident
   * 
   * @param {string} id - Incident ID
   * @returns {Promise<HistoryEntry[]>} History of changes
   */
  getIncidentHistory: async (id) => {
    try {
      const response = await apiClient.get(INCIDENT_ENDPOINTS.GET_HISTORY(id));
      return response.data;
    } catch (error) {
      console.error(`Error fetching history for incident ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get incident statistics
   * 
   * @param {Object} [params] - Optional parameters for filtering statistics
   * @param {string} [params.timeframe='month'] - Time period ('day', 'week', 'month', 'year')
   * @param {Date} [params.startDate] - Start date for custom timeframe
   * @param {Date} [params.endDate] - End date for custom timeframe
   * @returns {Promise<IncidentStats>} Incident statistics
   */
  getIncidentStats: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params);
      
      // Handle date objects
      if (params.startDate) {
        queryParams.set('startDate', params.startDate.toISOString());
      }
      
      if (params.endDate) {
        queryParams.set('endDate', params.endDate.toISOString());
      }
      
      const response = await apiClient.get(`${INCIDENT_ENDPOINTS.GET_STATS}?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching incident statistics:', error);
      throw error;
    }
  },

  /**
   * Get incidents related to specific equipment
   * 
   * @param {string} equipmentId - Equipment ID
   * @param {PaginationParams} [pagination={ page: 1, limit: 10 }] - Pagination parameters
   * @returns {Promise<{ incidents: Incident[], total: number, page: number, limit: number }>} Paginated incidents
   */
  getIncidentsByEquipment: async (equipmentId, pagination = { page: 1, limit: 10 }) => {
    try {
      const { page, limit } = pagination;
      const queryParams = new URLSearchParams({ page, limit });
      
      const response = await apiClient.get(
        `${INCIDENT_ENDPOINTS.GET_BY_EQUIPMENT(equipmentId)}?${queryParams}`
      );
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching incidents for equipment ${equipmentId}:`, error);
      throw error;
    }
  },

  /**
   * Get incidents reported by or assigned to a specific user
   * 
   * @param {string} userId - User ID
   * @param {Object} [options] - Additional options
   * @param {boolean} [options.reported=true] - Get incidents reported by user
   * @param {boolean} [options.assigned=false] - Get incidents assigned to user
   * @param {PaginationParams} [pagination={ page: 1, limit: 10 }] - Pagination parameters
   * @returns {Promise<{ incidents: Incident[], total: number, page: number, limit: number }>} Paginated incidents
   */
  getIncidentsByUser: async (userId, options = { reported: true, assigned: false }, pagination = { page: 1, limit: 10 }) => {
    try {
      const { page, limit } = pagination;
      const queryParams = new URLSearchParams({
        page,
        limit,
        ...options
      });
      
      const response = await apiClient.get(
        `${INCIDENT_ENDPOINTS.GET_BY_USER(userId)}?${queryParams}`
      );
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching incidents for user ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Bulk update multiple incidents
   * 
   * @param {string[]} incidentIds - Array of incident IDs to update
   * @param {Object} updateData - Data to update on all selected incidents
   * @returns {Promise<{ success: boolean, count: number, message: string }>} Update result
   */
  bulkUpdateIncidents: async (incidentIds, updateData) => {
    try {
      const response = await apiClient.patch(INCIDENT_ENDPOINTS.GET_ALL, {
        ids: incidentIds,
        data: updateData
      });
      
      return response.data;
    } catch (error) {
      console.error('Error performing bulk update on incidents:', error);
      throw error;
    }
  },

  /**
   * Export incidents to a specific format
   * 
   * @param {IncidentFilter} [filters={}] - Filter parameters
   * @param {string} [format='csv'] - Export format ('csv', 'xlsx', 'pdf')
   * @returns {Promise<Blob>} File blob for download
   */
  exportIncidents: async (filters = {}, format = 'csv') => {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams({
        ...filters,
        format
      });
      
      // Handle date ranges properly
      if (filters.startDate) {
        queryParams.set('startDate', filters.startDate.toISOString());
      }
      
      if (filters.endDate) {
        queryParams.set('endDate', filters.endDate.toISOString());
      }
      
      const response = await apiClient.get(`${INCIDENT_ENDPOINTS.GET_ALL}/export?${queryParams}`, {
        responseType: 'blob'
      });
      
      return response.data;
    } catch (error) {
      console.error('Error exporting incidents:', error);
      throw error;
    }
  },

  /**
   * Resolve an incident with resolution details
   * 
   * @param {string} id - Incident ID
   * @param {Object} resolutionData - Resolution details
   * @param {string} resolutionData.summary - Resolution summary
   * @param {string} [resolutionData.rootCause] - Root cause analysis
   * @param {string} [resolutionData.solution] - Solution applied
   * @param {boolean} [resolutionData.preventable=false] - Whether incident was preventable
   * @returns {Promise<Incident>} Resolved incident
   */
  resolveIncident: async (id, resolutionData) => {
    try {
      const response = await apiClient.post(`${INCIDENT_ENDPOINTS.GET_BY_ID(id)}/resolve`, resolutionData);
      return response.data;
    } catch (error) {
      console.error(`Error resolving incident ${id}:`, error);
      throw error;
    }
  },

  /**
   * Reopen a previously resolved or closed incident
   * 
   * @param {string} id - Incident ID
   * @param {string} reason - Reason for reopening
   * @returns {Promise<Incident>} Reopened incident
   */
  reopenIncident: async (id, reason) => {
    try {
      const response = await apiClient.post(`${INCIDENT_ENDPOINTS.GET_BY_ID(id)}/reopen`, { reason });
      return response.data;
    } catch (error) {
      console.error(`Error reopening incident ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get similar incidents based on title and description
   * 
   * @param {string} title - Incident title
   * @param {string} description - Incident description
   * @param {number} [limit=5] - Maximum number of similar incidents to return
   * @returns {Promise<Incident[]>} List of similar incidents
   */
  getSimilarIncidents: async (title, description, limit = 5) => {
    try {
      const queryParams = new URLSearchParams({
        title,
        description,
        limit
      });
      
      const response = await apiClient.get(`${INCIDENT_ENDPOINTS.GET_ALL}/similar?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching similar incidents:', error);
      throw error;
    }
  }
};

export default incidentsApi;