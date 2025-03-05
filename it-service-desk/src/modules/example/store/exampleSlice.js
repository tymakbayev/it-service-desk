/**
 * Example Module Slice
 * 
 * This file serves as a template for creating Redux slices using Redux Toolkit.
 * It demonstrates best practices for state management including:
 * - Proper state structure
 * - Thunk creation for async operations
 * - Action creators
 * - Selectors
 * - Error handling
 * 
 * Use this as a reference when creating new feature modules.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '../../../services/api/apiClient';

// Define the initial state
const initialState = {
  items: [],
  selectedItem: null,
  isLoading: false,
  error: null,
  filters: {
    search: '',
    status: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0
  }
};

/**
 * Fetch examples with optional filtering and pagination
 */
export const fetchExamples = createAsyncThunk(
  'example/fetchExamples',
  async (params = {}, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const { filters, pagination } = state.example;
      
      // Combine default filters with any passed params
      const queryParams = {
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search,
        status: filters.status !== 'all' ? filters.status : undefined,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        ...params
      };
      
      const response = await apiClient.get('/examples', { params: queryParams });
      return {
        items: response.data.items,
        pagination: {
          page: response.data.page,
          limit: response.data.limit,
          total: response.data.total
        }
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch examples'
      );
    }
  }
);

/**
 * Fetch a single example by ID
 */
export const fetchExampleById = createAsyncThunk(
  'example/fetchExampleById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/examples/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch example details'
      );
    }
  }
);

/**
 * Create a new example
 */
export const createExample = createAsyncThunk(
  'example/createExample',
  async (exampleData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/examples', exampleData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create example'
      );
    }
  }
);

/**
 * Update an existing example
 */
export const updateExample = createAsyncThunk(
  'example/updateExample',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/examples/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update example'
      );
    }
  }
);

/**
 * Delete an example
 */
export const deleteExample = createAsyncThunk(
  'example/deleteExample',
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/examples/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete example'
      );
    }
  }
);

// Create the slice
const exampleSlice = createSlice({
  name: 'example',
  initialState,
  reducers: {
    // Synchronous actions
    setFilters: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload
      };
      // Reset to first page when filters change
      state.pagination.page = 1;
    },
    
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    
    setLimit: (state, action) => {
      state.pagination.limit = action.payload;
      // Reset to first page when limit changes
      state.pagination.page = 1;
    },
    
    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.pagination.page = 1;
    },
    
    clearSelectedExample: (state) => {
      state.selectedItem = null;
    },
    
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Handle async actions
    builder
      // fetchExamples
      .addCase(fetchExamples.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchExamples.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items;
        state.pagination = {
          ...state.pagination,
          ...action.payload.pagination
        };
      })
      .addCase(fetchExamples.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'An unknown error occurred';
      })
      
      // fetchExampleById
      .addCase(fetchExampleById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchExampleById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedItem = action.payload;
      })
      .addCase(fetchExampleById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'An unknown error occurred';
      })
      
      // createExample
      .addCase(createExample.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createExample.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items.unshift(action.payload);
        // Update total count in pagination
        state.pagination.total += 1;
      })
      .addCase(createExample.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'An unknown error occurred';
      })
      
      // updateExample
      .addCase(updateExample.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateExample.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update in items array
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        // Update selected item if it's the one being edited
        if (state.selectedItem && state.selectedItem.id === action.payload.id) {
          state.selectedItem = action.payload;
        }
      })
      .addCase(updateExample.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'An unknown error occurred';
      })
      
      // deleteExample
      .addCase(deleteExample.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteExample.fulfilled, (state, action) => {
        state.isLoading = false;
        // Remove from items array
        state.items = state.items.filter(item => item.id !== action.payload);
        // Clear selected item if it's the one being deleted
        if (state.selectedItem && state.selectedItem.id === action.payload) {
          state.selectedItem = null;
        }
        // Update total count in pagination
        state.pagination.total -= 1;
      })
      .addCase(deleteExample.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'An unknown error occurred';
      });
  }
});

// Export actions
export const {
  setFilters,
  setPage,
  setLimit,
  resetFilters,
  clearSelectedExample,
  clearError
} = exampleSlice.actions;

// Export selectors
export const selectExamples = (state) => state.example.items;
export const selectSelectedExample = (state) => state.example.selectedItem;
export const selectExampleLoading = (state) => state.example.isLoading;
export const selectExampleError = (state) => state.example.error;
export const selectExampleFilters = (state) => state.example.filters;
export const selectExamplePagination = (state) => state.example.pagination;

// Export reducer
export default exampleSlice.reducer;