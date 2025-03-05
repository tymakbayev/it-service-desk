import axios from 'axios';
import { toast } from 'react-toastify';

/**
 * API Client for handling HTTP requests
 * Provides methods for making API calls with proper error handling and authentication
 */
class ApiClient {
  /**
   * Creates an instance of the API client
   */
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    this.instance = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 15000, // 15 seconds timeout
    });

    this.setupInterceptors();
    this.initializeAuthToken();
  }

  /**
   * Initialize auth token from localStorage if available
   */
  initializeAuthToken() {
    const token = localStorage.getItem('token');
    if (token) {
      this.setAuthToken(token);
    }
  }

  /**
   * Configure request and response interceptors
   */
  setupInterceptors() {
    // Request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        // Add request timestamp for performance monitoring
        config.metadata = { startTime: new Date() };
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response) => {
        // Calculate request duration for performance monitoring
        const endTime = new Date();
        const startTime = response.config.metadata.startTime;
        const duration = endTime - startTime;
        
        // Log long-running requests (over 1 second) in development
        if (process.env.NODE_ENV === 'development' && duration > 1000) {
          console.warn(`Request to ${response.config.url} took ${duration}ms`);
        }
        
        return response;
      },
      (error) => {
        // Handle different error scenarios
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          const { status, data } = error.response;
          
          switch (status) {
            case 400:
              toast.error(data.message || 'Invalid request');
              break;
            case 401:
              // Unauthorized - clear token and redirect to login
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              
              // Only redirect if not already on login page to prevent redirect loops
              if (!window.location.pathname.includes('/login')) {
                toast.error('Your session has expired. Please log in again.');
                window.location.href = '/login';
              }
              break;
            case 403:
              toast.error('You do not have permission to perform this action');
              break;
            case 404:
              toast.error(data.message || 'Resource not found');
              break;
            case 422:
              // Validation errors
              if (data.errors) {
                Object.values(data.errors).forEach(error => {
                  toast.error(error);
                });
              } else {
                toast.error(data.message || 'Validation failed');
              }
              break;
            case 429:
              toast.error('Too many requests. Please try again later');
              break;
            case 500:
            case 502:
            case 503:
            case 504:
              toast.error('Server error. Our team has been notified');
              // In a production app, you might want to log this to a service like Sentry
              console.error('Server error:', error);
              break;
            default:
              toast.error(data.message || 'An unexpected error occurred');
              break;
          }
        } else if (error.request) {
          // The request was made but no response was received
          toast.error('Network error. Please check your connection.');
          console.error('Network error:', error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          toast.error('Application error. Please try again later.');
          console.error('Request setup error:', error.message);
        }
        
        return Promise.reject(error);
      }
    );
  }

  /**
   * Set the authentication token for API requests
   * @param {string} token - JWT token
   */
  setAuthToken(token) {
    if (token) {
      this.instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete this.instance.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  }

  /**
   * Clear the authentication token
   */
  clearAuthToken() {
    delete this.instance.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  /**
   * Make a GET request
   * @param {string} url - API endpoint
   * @param {Object} params - URL parameters
   * @param {Object} config - Additional axios config
   * @returns {Promise} - Promise with response data
   */
  async get(url, params = {}, config = {}) {
    try {
      const response = await this.instance.get(url, { 
        params,
        ...config 
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Make a POST request
   * @param {string} url - API endpoint
   * @param {Object} data - Request payload
   * @param {Object} config - Additional axios config
   * @returns {Promise} - Promise with response data
   */
  async post(url, data = {}, config = {}) {
    try {
      const response = await this.instance.post(url, data, config);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Make a PUT request
   * @param {string} url - API endpoint
   * @param {Object} data - Request payload
   * @param {Object} config - Additional axios config
   * @returns {Promise} - Promise with response data
   */
  async put(url, data = {}, config = {}) {
    try {
      const response = await this.instance.put(url, data, config);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Make a PATCH request
   * @param {string} url - API endpoint
   * @param {Object} data - Request payload
   * @param {Object} config - Additional axios config
   * @returns {Promise} - Promise with response data
   */
  async patch(url, data = {}, config = {}) {
    try {
      const response = await this.instance.patch(url, data, config);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Make a DELETE request
   * @param {string} url - API endpoint
   * @param {Object} config - Additional axios config
   * @returns {Promise} - Promise with response data
   */
  async delete(url, config = {}) {
    try {
      const response = await this.instance.delete(url, config);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Upload a file
   * @param {string} url - API endpoint
   * @param {FormData} formData - Form data with file
   * @param {Function} onUploadProgress - Progress callback
   * @returns {Promise} - Promise with response data
   */
  async uploadFile(url, formData, onUploadProgress = null) {
    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };
      
      if (onUploadProgress) {
        config.onUploadProgress = (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onUploadProgress(percentCompleted);
        };
      }
      
      const response = await this.instance.post(url, formData, config);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Download a file
   * @param {string} url - API endpoint
   * @param {Object} params - URL parameters
   * @param {string} filename - Name to save the file as
   * @param {Function} onDownloadProgress - Progress callback
   * @returns {Promise} - Promise that resolves when download is complete
   */
  async downloadFile(url, params = {}, filename = null, onDownloadProgress = null) {
    try {
      const config = {
        responseType: 'blob',
        params,
      };
      
      if (onDownloadProgress) {
        config.onDownloadProgress = (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onDownloadProgress(percentCompleted);
        };
      }
      
      const response = await this.instance.get(url, config);
      
      // Create a download link and trigger the download
      const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      // Use the filename from Content-Disposition header if available and not provided
      if (!filename) {
        const contentDisposition = response.headers['content-disposition'];
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="(.+)"/);
          if (filenameMatch.length === 2) {
            filename = filenameMatch[1];
          }
        }
      }
      
      // Fallback filename if still not available
      if (!filename) {
        filename = 'download';
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return true;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Handle API errors consistently
   * @param {Error} error - The error object
   */
  handleError(error) {
    // Log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', error);
    }
    
    // Additional error handling can be added here
    // For example, you might want to log errors to a monitoring service
  }

  /**
   * Get the base URL
   * @returns {string} The base URL
   */
  getBaseUrl() {
    return this.baseURL;
  }

  /**
   * Get the axios instance for advanced usage
   * @returns {AxiosInstance} The axios instance
   */
  getInstance() {
    return this.instance;
  }
}

// Create a singleton instance
const apiClient = new ApiClient();

export default apiClient;