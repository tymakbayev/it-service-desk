// client/src/modules/example/exampleThunks.js

import { createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../services/api/apiClient';
import { toast } from 'react-toastify';

/**
 * Async thunk for fetching all examples
 * @param {Object} params - Query parameters for filtering, pagination, etc.
 * @returns {Promise<Array>} - Array of example objects
 */
export const fetchExamples = createAsyncThunk(
  'examples/fetchExamples',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/api/examples', { params });
      return response.data;
    } catch (error) {
      toast.error(`Failed to fetch examples: ${error.response?.data?.message || error.message}`);
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

/**
 * Async thunk for fetching a single example by ID
 * @param {string} id - Example ID
 * @returns {Promise<Object>} - Example object
 */
export const fetchExampleById = createAsyncThunk(
  'examples/fetchExampleById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/api/examples/${id}`);
      return response.data;
    } catch (error) {
      toast.error(`Failed to fetch example: ${error.response?.data?.message || error.message}`);
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

/**
 * Async thunk for creating a new example
 * @param {Object} exampleData - Example data to create
 * @returns {Promise<Object>} - Created example object
 */
export const createExample = createAsyncThunk(
  'examples/createExample',
  async (exampleData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/api/examples', exampleData);
      toast.success('Example created successfully');
      return response.data;
    } catch (error) {
      toast.error(`Failed to create example: ${error.response?.data?.message || error.message}`);
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

/**
 * Async thunk for updating an existing example
 * @param {Object} params - Object containing id and data
 * @param {string} params.id - Example ID
 * @param {Object} params.data - Updated example data
 * @returns {Promise<Object>} - Updated example object
 */
export const updateExample = createAsyncThunk(
  'examples/updateExample',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/api/examples/${id}`, data);
      toast.success('Example updated successfully');
      return response.data;
    } catch (error) {
      toast.error(`Failed to update example: ${error.response?.data?.message || error.message}`);
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

/**
 * Async thunk for deleting an example
 * @param {string} id - Example ID to delete
 * @returns {Promise<Object>} - Deleted example ID
 */
export const deleteExample = createAsyncThunk(
  'examples/deleteExample',
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/api/examples/${id}`);
      toast.success('Example deleted successfully');
      return id;
    } catch (error) {
      toast.error(`Failed to delete example: ${error.response?.data?.message || error.message}`);
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

/**
 * Async thunk for bulk operations on examples
 * @param {Object} params - Parameters for bulk operation
 * @param {string} params.action - Action to perform ('delete', 'update', etc.)
 * @param {Array<string>} params.ids - Array of example IDs
 * @param {Object} [params.data] - Data for update operation
 * @returns {Promise<Object>} - Result of bulk operation
 */
export const bulkExampleOperation = createAsyncThunk(
  'examples/bulkOperation',
  async ({ action, ids, data }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/api/examples/bulk', { action, ids, data });
      toast.success(`Bulk ${action} operation completed successfully`);
      return response.data;
    } catch (error) {
      toast.error(`Failed to perform bulk operation: ${error.response?.data?.message || error.message}`);
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

/**
 * Async thunk for exporting examples to different formats
 * @param {Object} params - Export parameters
 * @param {string} params.format - Export format ('pdf', 'csv', 'excel')
 * @param {Object} params.filters - Filters to apply before export
 * @returns {Promise<Blob>} - Exported file as blob
 */
export const exportExamples = createAsyncThunk(
  'examples/export',
  async ({ format, filters = {} }, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/api/examples/export', {
        params: { format, ...filters },
        responseType: 'blob'
      });
      
      // Create a download link and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `examples-export.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success(`Examples exported to ${format.toUpperCase()} successfully`);
      return { success: true, format };
    } catch (error) {
      toast.error(`Failed to export examples: ${error.message}`);
      return rejectWithValue({ message: error.message });
    }
  }
);

/**
 * Async thunk for importing examples from a file
 * @param {FormData} formData - Form data containing the file to import
 * @returns {Promise<Object>} - Import result
 */
export const importExamples = createAsyncThunk(
  'examples/import',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/api/examples/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success('Examples imported successfully');
      return response.data;
    } catch (error) {
      toast.error(`Failed to import examples: ${error.response?.data?.message || error.message}`);
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

/**
 * Async thunk for searching examples
 * @param {string} query - Search query
 * @returns {Promise<Array>} - Search results
 */
export const searchExamples = createAsyncThunk(
  'examples/search',
  async (query, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/api/examples/search', {
        params: { query }
      });
      return response.data;
    } catch (error) {
      toast.error(`Search failed: ${error.response?.data?.message || error.message}`);
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);