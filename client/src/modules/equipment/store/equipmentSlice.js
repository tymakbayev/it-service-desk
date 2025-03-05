import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import equipmentApi from '../../../services/api/equipmentApi';
import { toast } from 'react-toastify';

// Initial state for equipment slice
const initialState = {
  equipment: [],
  selectedEquipment: null,
  loading: false,
  error: null,
  success: false,
  total: 0,
  page: 1,
  limit: 10,
  filters: {
    status: '',
    type: '',
    assignedTo: '',
    serialNumber: '',
    purchaseDate: '',
    searchQuery: ''
  }
};

// Async thunk for fetching equipment list
export const fetchEquipment = createAsyncThunk(
  'equipment/fetchEquipment',
  async ({ page = 1, limit = 10, filters = {} }, { rejectWithValue }) => {
    try {
      const response = await equipmentApi.getEquipmentList(page, limit, filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch equipment');
    }
  }
);

// Async thunk for fetching single equipment details
export const fetchEquipmentById = createAsyncThunk(
  'equipment/fetchEquipmentById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await equipmentApi.getEquipmentById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch equipment details');
    }
  }
);

// Async thunk for creating new equipment
export const createEquipment = createAsyncThunk(
  'equipment/createEquipment',
  async (equipmentData, { rejectWithValue }) => {
    try {
      const response = await equipmentApi.createEquipment(equipmentData);
      toast.success('Equipment created successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create equipment');
      return rejectWithValue(error.response?.data?.message || 'Failed to create equipment');
    }
  }
);

// Async thunk for updating equipment
export const updateEquipment = createAsyncThunk(
  'equipment/updateEquipment',
  async ({ id, equipmentData }, { rejectWithValue }) => {
    try {
      const response = await equipmentApi.updateEquipment(id, equipmentData);
      toast.success('Equipment updated successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update equipment');
      return rejectWithValue(error.response?.data?.message || 'Failed to update equipment');
    }
  }
);

// Async thunk for deleting equipment
export const deleteEquipment = createAsyncThunk(
  'equipment/deleteEquipment',
  async (id, { rejectWithValue }) => {
    try {
      await equipmentApi.deleteEquipment(id);
      toast.success('Equipment deleted successfully');
      return id;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete equipment');
      return rejectWithValue(error.response?.data?.message || 'Failed to delete equipment');
    }
  }
);

// Async thunk for assigning equipment to user
export const assignEquipment = createAsyncThunk(
  'equipment/assignEquipment',
  async ({ equipmentId, userId, notes }, { rejectWithValue }) => {
    try {
      const response = await equipmentApi.assignEquipment(equipmentId, userId, notes);
      toast.success('Equipment assigned successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign equipment');
      return rejectWithValue(error.response?.data?.message || 'Failed to assign equipment');
    }
  }
);

// Async thunk for unassigning equipment from user
export const unassignEquipment = createAsyncThunk(
  'equipment/unassignEquipment',
  async (equipmentId, { rejectWithValue }) => {
    try {
      const response = await equipmentApi.unassignEquipment(equipmentId);
      toast.success('Equipment unassigned successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to unassign equipment');
      return rejectWithValue(error.response?.data?.message || 'Failed to unassign equipment');
    }
  }
);

// Async thunk for bulk importing equipment
export const bulkImportEquipment = createAsyncThunk(
  'equipment/bulkImport',
  async (fileData, { rejectWithValue }) => {
    try {
      const response = await equipmentApi.bulkImportEquipment(fileData);
      toast.success(`Successfully imported ${response.data.imported} equipment items`);
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to import equipment');
      return rejectWithValue(error.response?.data?.message || 'Failed to import equipment');
    }
  }
);

// Async thunk for exporting equipment data
export const exportEquipment = createAsyncThunk(
  'equipment/export',
  async (format, { getState, rejectWithValue }) => {
    try {
      const { filters } = getState().equipment;
      const response = await equipmentApi.exportEquipment(format, filters);
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to export equipment data');
      return rejectWithValue(error.response?.data?.message || 'Failed to export equipment data');
    }
  }
);

// Equipment slice
const equipmentSlice = createSlice({
  name: 'equipment',
  initialState,
  reducers: {
    setEquipmentFilters: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload
      };
    },
    resetEquipmentFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearSelectedEquipment: (state) => {
      state.selectedEquipment = null;
    },
    setEquipmentPage: (state, action) => {
      state.page = action.payload;
    },
    setEquipmentLimit: (state, action) => {
      state.limit = action.payload;
    },
    resetEquipmentState: () => initialState
  },
  extraReducers: (builder) => {
    // Fetch equipment list
    builder
      .addCase(fetchEquipment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEquipment.fulfilled, (state, action) => {
        state.loading = false;
        state.equipment = action.payload.equipment;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
        state.success = true;
      })
      .addCase(fetchEquipment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

    // Fetch equipment by ID
      .addCase(fetchEquipmentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEquipmentById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedEquipment = action.payload;
        state.success = true;
      })
      .addCase(fetchEquipmentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

    // Create equipment
      .addCase(createEquipment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEquipment.fulfilled, (state, action) => {
        state.loading = false;
        state.equipment.unshift(action.payload);
        state.total += 1;
        state.success = true;
      })
      .addCase(createEquipment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

    // Update equipment
      .addCase(updateEquipment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEquipment.fulfilled, (state, action) => {
        state.loading = false;
        state.equipment = state.equipment.map(item => 
          item._id === action.payload._id ? action.payload : item
        );
        if (state.selectedEquipment && state.selectedEquipment._id === action.payload._id) {
          state.selectedEquipment = action.payload;
        }
        state.success = true;
      })
      .addCase(updateEquipment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

    // Delete equipment
      .addCase(deleteEquipment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteEquipment.fulfilled, (state, action) => {
        state.loading = false;
        state.equipment = state.equipment.filter(item => item._id !== action.payload);
        state.total -= 1;
        if (state.selectedEquipment && state.selectedEquipment._id === action.payload) {
          state.selectedEquipment = null;
        }
        state.success = true;
      })
      .addCase(deleteEquipment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

    // Assign equipment
      .addCase(assignEquipment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(assignEquipment.fulfilled, (state, action) => {
        state.loading = false;
        state.equipment = state.equipment.map(item => 
          item._id === action.payload._id ? action.payload : item
        );
        if (state.selectedEquipment && state.selectedEquipment._id === action.payload._id) {
          state.selectedEquipment = action.payload;
        }
        state.success = true;
      })
      .addCase(assignEquipment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

    // Unassign equipment
      .addCase(unassignEquipment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(unassignEquipment.fulfilled, (state, action) => {
        state.loading = false;
        state.equipment = state.equipment.map(item => 
          item._id === action.payload._id ? action.payload : item
        );
        if (state.selectedEquipment && state.selectedEquipment._id === action.payload._id) {
          state.selectedEquipment = action.payload;
        }
        state.success = true;
      })
      .addCase(unassignEquipment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

    // Bulk import equipment
      .addCase(bulkImportEquipment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bulkImportEquipment.fulfilled, (state, action) => {
        state.loading = false;
        // Refresh equipment list after bulk import
        state.success = true;
      })
      .addCase(bulkImportEquipment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

    // Export equipment
      .addCase(exportEquipment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(exportEquipment.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(exportEquipment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  }
});

export const { 
  setEquipmentFilters, 
  resetEquipmentFilters, 
  clearSelectedEquipment, 
  setEquipmentPage, 
  setEquipmentLimit,
  resetEquipmentState
} = equipmentSlice.actions;

export default equipmentSlice.reducer;