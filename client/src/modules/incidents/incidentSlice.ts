import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  Incident, 
  IncidentState, 
  IncidentFilters, 
  CreateIncidentDto, 
  UpdateIncidentDto, 
  AddCommentDto,
  IncidentComment,
  IncidentStatus
} from './IncidentTypes';
import apiClient from '../../services/api/apiClient';

const initialState: IncidentState = {
  incidents: [],
  currentIncident: null,
  loading: false,
  error: null,
  totalCount: 0,
  page: 1,
  pageSize: 10,
  filters: {}
};

export const fetchIncidents = createAsyncThunk(
  'incidents/fetchIncidents',
  async ({ page = 1, pageSize = 10, filters = {} }: { page?: number; pageSize?: number; filters?: IncidentFilters }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', page.toString());
      queryParams.append('pageSize', pageSize.toString());
      
      // Добавляем фильтры в запрос
      if (filters.status?.length) {
        filters.status.forEach(status => queryParams.append('status', status));
      }
      
      if (filters.priority?.length) {
        filters.priority.forEach(priority => queryParams.append('priority', priority));
      }
      
      if (filters.category?.length) {
        filters.category.forEach(category => queryParams.append('category', category));
      }
      
      if (filters.assigneeId) {
        queryParams.append('assigneeId', filters.assigneeId);
      }
      
      if (filters.reporterId) {
        queryParams.append('reporterId', filters.reporterId);
      }
      
      if (filters.dateFrom) {
        queryParams.append('dateFrom', filters.dateFrom.toISOString());
      }
      
      if (filters.dateTo) {
        queryParams.append('dateTo', filters.dateTo.toISOString());
      }
      
      if (filters.searchQuery) {
        queryParams.append('search', filters.searchQuery);
      }
      
      const response = await apiClient.get(`/incidents?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch incidents');
    }
  }
);

export const fetchIncidentById = createAsyncThunk(
  'incidents/fetchIncidentById',
  async (incidentId: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/incidents/${incidentId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch incident details');
    }
  }
);

export const createIncident = createAsyncThunk(
  'incidents/createIncident',
  async (incidentData: CreateIncidentDto, { rejectWithValue }) => {
    try {
      // Если есть вложения, используем FormData
      if (incidentData.attachments && incidentData.attachments.length > 0) {
        const formData = new FormData();
        
        // Добавляем все поля в FormData
        Object.entries(incidentData).forEach(([key, value]) => {
          if (key !== 'attachments') {
            formData.append(key, value as string);
          }
        });
        
        // Добавляем вложения
        incidentData.attachments.forEach(file => {
          formData.append('attachments', file);
        });
        
        const response = await apiClient.post('/incidents', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        return response.data;
      } else {
        // Обычный JSON запрос без вложений
        const response = await apiClient.post('/incidents', incidentData);
        return response.data;
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create incident');
    }
  }
);

export const updateIncident = createAsyncThunk(
  'incidents/updateIncident',
  async ({ incidentId, updateData }: { incidentId: string; updateData: UpdateIncidentDto }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/incidents/${incidentId}`, updateData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update incident');
    }
  }
);

export const assignIncident = createAsyncThunk(
  'incidents/assignIncident',
  async ({ incidentId, assigneeId }: { incidentId: string; assigneeId: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/incidents/${incidentId}/assign`, { assigneeId });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to assign incident');
    }
  }
);

export const changeIncidentStatus = createAsyncThunk(
  'incidents/changeIncidentStatus',
  async ({ incidentId, status }: { incidentId: string; status: IncidentStatus }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/incidents/${incidentId}/status`, { status });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to change incident status');
    }
  }
);

export const addComment = createAsyncThunk(
  'incidents/addComment',
  async (commentData: AddCommentDto, { rejectWithValue }) => {
    try {
      // Если есть вложения, используем FormData
      if (commentData.attachments && commentData.attachments.length > 0) {
        const formData = new FormData();
        
        // Добавляем все поля в FormData
        Object.entries(commentData).forEach(([key, value]) => {
          if (key !== 'attachments') {
            formData.append(key, value as string);
          }
        });
        
        // Добавляем вложения
        commentData.attachments.forEach(file => {
          formData.append('attachments', file);
        });
        
        const response = await apiClient.post(`/incidents/${commentData.incidentId}/comments`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        return response.data;
      } else {
        // Обычный JSON запрос без вложений
        const response = await apiClient.post(`/incidents/${commentData.incidentId}/comments`, {
          content: commentData.content,
          isInternal: commentData.isInternal
        });
        return response.data;
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add comment');
    }
  }
);

const incidentSlice = createSlice({
  name: 'incidents',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<IncidentFilters>) => {
      state.filters = action.payload;
      state.page = 1; // Сбрасываем страницу при изменении фильтров
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
      state.page = 1; // Сбрасываем страницу при изменении размера страницы
    },
    clearCurrentIncident: (state) => {
      state.currentIncident = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Обработка fetchIncidents
      .addCase(fetchIncidents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchIncidents.fulfilled, (state, action) => {
        state.loading = false;
        state.incidents = action.payload.incidents;
        state.totalCount = action.payload.totalCount;
        state.page = action.payload.page;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(fetchIncidents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Обработка fetchIncidentById
      .addCase(fetchIncidentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchIncidentById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentIncident = action.payload;
      })
      .addCase(fetchIncidentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Обработка createIncident
      .addCase(createIncident.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createIncident.fulfilled, (state, action) => {
        state.loading = false;
        state.incidents.unshift(action.payload);
        state.totalCount += 1;
      })
      .addCase(createIncident.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Обработка updateIncident
      .addCase(updateIncident.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateIncident.fulfilled, (state, action) => {
        state.loading = false;
        
        // Обновляем инцидент в списке
        const index = state.incidents.findIndex(incident => incident.id === action.payload.id);
        if (index !== -1) {
          state.incidents[index] = action.payload;
        }
        
        // Обновляем текущий инцидент, если он открыт
        if (state.currentIncident && state.currentIncident.id === action.payload.id) {
          state.currentIncident = action.payload;
        }
      })
      .addCase(updateIncident.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Обработка assignIncident
      .addCase(assignIncident.fulfilled, (state, action) => {
        // Обновляем инцидент в списке
        const index = state.incidents.findIndex(incident => incident.id === action.payload.id);
        if (index !== -1) {
          state.incidents[index] = action.payload;
        }
        
        // Обновляем текущий инцидент, если он открыт
        if (state.currentIncident && state.currentIncident.id === action.payload.id) {
          state.currentIncident = action.payload;
        }
      })
      
      // Обработка changeIncidentStatus
      .addCase(changeIncidentStatus.fulfilled, (state, action) => {
        // Обновляем инцидент в списке
        const index = state.incidents.findIndex(incident => incident.id === action.payload.id);
        if (index !== -1) {
          state.incidents[index] = action.payload;
        }
        
        // Обновляем текущий инцидент, если он открыт
        if (state.currentIncident && state.currentIncident.id === action.payload.id) {
          state.currentIncident = action.payload;
        }
      })
      
      // Обработка addComment
      .addCase(addComment.fulfilled, (state, action) => {
        // Добавляем комментарий к текущему инциденту, если он открыт
        if (state.currentIncident && state.currentIncident.id === action.payload.incidentId) {
          if (!state.currentIncident.comments) {
            state.currentIncident.comments = [];
          }
          state.currentIncident.comments.push(action.payload);
        }
      });
  }
});

export const { setFilters, setPage, setPageSize, clearCurrentIncident } = incidentSlice.actions;
export default incidentSlice.reducer;
