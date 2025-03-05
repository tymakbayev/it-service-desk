import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import equipmentService from './equipmentService';
import {
  Equipment,
  EquipmentFilters,
  AddEquipmentPayload,
  UpdateEquipmentPayload,
  AssignEquipmentPayload,
  EquipmentListResponse
} from './types';

interface EquipmentState {
  items: Equipment[];
  selectedEquipment: Equipment | null;
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
  filters: EquipmentFilters;
}

const initialState: EquipmentState = {
  items: [],
  selectedEquipment: null,
  loading: false,
  error: null,
  total: 0,
  page: 1,
  limit: 10,
  filters: {}
};

// Async thunks
export const fetchEquipmentList = createAsyncThunk(
  'equipment/fetchList',
  async ({ page, limit, filters }: { page: number; limit: number; filters?: EquipmentFilters }, { rejectWithValue }) => {
    try {
      return await equipmentService.listEquipment(page, limit, filters);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch equipment list');
    }
  }
);

export const fetchEquipmentDetails = createAsyncThunk(
  'equipment/fetchDetails',
  async (id: string, { rejectWithValue }) => {
    try {
      return await equipmentService.getEquipmentDetails(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch equipment details');
    }
  }
);

export const addNewEquipment = createAsyncThunk(
  'equipment/add',
  async (payload: AddEquipmentPayload, { rejectWithValue }) => {
    try {
      const response = await equipmentService.addEquipment(payload);
      return response.equipment;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add equipment');
    }
  }
);

export const updateExistingEquipment = createAsyncThunk(
  'equipment/update',
  async (payload: UpdateEquipmentPayload, { rejectWithValue }) => {
    try {
      const response = await equipmentService.updateEquipment(payload);
      return response.equipment;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update equipment');
    }
  }
);

export const assignEquipmentToUser = createAsyncThunk(
  'equipment/assign',
  async (payload: AssignEquipmentPayload, { rejectWithValue }) => {
    try {
      const response = await equipmentService.assignEquipment(payload);
      return response.equipment;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to assign equipment');
    }
  }
);

export const unassignEquipmentFromUser = createAsyncThunk(
  'equipment/unassign',
  async (equipmentId: string, { rejectWithValue }) => {
    try {
      const response = await equipmentService.unassignEquipment(equipmentId);
      return response.equipment;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to unassign equipment');
    }
  }
);

const equipmentSlice = createSlice({
  name: 'equipment',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<EquipmentFilters>) => {
      state.filters = action.payload;
    },
    clearSelectedEquipment: (state) => {
      state.selectedEquipment = null;
    },
    resetFilters: (state) => {
      state.filters = {};
    }
  },
  extraReducers: (builder) => {
    // Fetch equipment list
    builder.addCase(fetchEquipmentList.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchEquipmentList.fulfilled, (state, action: PayloadAction<EquipmentListResponse>) => {
      state.loading = false;
      state.items = action.payload.equipment;
      state.total = action.payload.total;
      state.page = action.payload.page;
      state.limit = action.payload.limit;
    });
    builder.addCase(fetchEquipmentList.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch equipment details
    builder.addCase(fetchEquipmentDetails.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchEquipmentDetails.fulfilled, (state, action: PayloadAction<Equipment>) => {
      state.loading = false;
      state.selectedEquipment = action.payload;
    });
    builder.addCase(fetchEquipmentDetails.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Add new equipment
    builder.addCase(addNewEquipment.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(addNewEquipment.fulfilled, (state, action: PayloadAction<Equipment>) => {
      state.loading = false;
      state.items.push(action.payload);
      state.total += 1;
    });
    builder.addCase(addNewEquipment.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update equipment
    builder.addCase(updateExistingEquipment.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateExistingEquipment.fulfilled, (state, action: PayloadAction<Equipment>) => {
      state.loading = false;
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
      if (state.selectedEquipment?.id === action.payload.id) {
        state.selectedEquipment = action.payload;
      }
    });
    builder.addCase(updateExistingEquipment.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Assign equipment
    builder.addCase(assignEquipmentToUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(assignEquipmentToUser.fulfilled, (state, action: PayloadAction<Equipment>) => {
      state.loading = false;
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
      if (state.selectedEquipment?.id === action.payload.id) {
        state.selectedEquipment = action.payload;
      }
    });
    builder.addCase(assignEquipmentToUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Unassign equipment
    builder.addCase(unassignEquipmentFromUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(unassignEquipmentFromUser.fulfilled, (state, action: PayloadAction<Equipment>) => {
      state.loading = false;
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
      if (state.selectedEquipment?.id === action.payload.id) {
        state.selectedEquipment = action.payload;
      }
    });
    builder.addCase(unassignEquipmentFromUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  }
});

export const { setFilters, clearSelectedEquipment, resetFilters } = equipmentSlice.actions;
export default equipmentSlice.reducer;