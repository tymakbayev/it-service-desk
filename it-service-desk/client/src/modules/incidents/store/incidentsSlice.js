/**
 * IT Service Desk - Incidents Slice
 * 
 * This Redux slice manages the state for incidents in the application.
 * It includes actions for fetching, creating, updating, and deleting incidents,
 * as well as filtering and pagination functionality.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { incidentsApi } from '../../../services/api/incidentsApi';
import { formatErrorMessage } from '../../../utils/formatters';
import { toast } from 'react-toastify';

// Define initial state
const initialState = {
  incidents: [],
  incident: null,
  loading: false,
  error: null,
  success: false,
  totalCount: 0,
  page: 1,
  limit: 10,
  filters: {
    status: null,
    priority: null,
    assignedTo: null,
    createdBy: null,
    dateFrom: null,
    dateTo: null,
    searchQuery: '',
    equipmentId: null,
  },
  sortBy: 'createdAt',
  sortDirection: 'desc',
  comments: [],
  commentsLoading: false,
  attachments: [],
  attachmentsLoading: false,
  history: [],
  historyLoading: false,
};

// Async thunks for API calls
export const fetchIncidents = createAsyncThunk(
  'incidents/fetchIncidents',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { incidents } = getState();
      const { page, limit, filters, sortBy, sortDirection } = incidents;
      
      const response = await incidentsApi.getIncidents({
        page,
        limit,
        ...filters,
        sortBy,
        sortDirection,
      });
      
      return response.data;
    } catch (error) {
      return rejectWithValue(formatErrorMessage(error));
    }
  }
);

export const fetchIncidentById = createAsyncThunk(
  'incidents/fetchIncidentById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await incidentsApi.getIncidentById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(formatErrorMessage(error));
    }
  }
);

export const createIncident = createAsyncThunk(
  'incidents/createIncident',
  async (incidentData, { rejectWithValue }) => {
    try {
      const response = await incidentsApi.createIncident(incidentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(formatErrorMessage(error));
    }
  }
);

export const updateIncident = createAsyncThunk(
  'incidents/updateIncident',
  async ({ id, incidentData }, { rejectWithValue }) => {
    try {
      const response = await incidentsApi.updateIncident(id, incidentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(formatErrorMessage(error));
    }
  }
);

export const deleteIncident = createAsyncThunk(
  'incidents/deleteIncident',
  async (id, { rejectWithValue }) => {
    try {
      await incidentsApi.deleteIncident(id);
      return id;
    } catch (error) {
      return rejectWithValue(formatErrorMessage(error));
    }
  }
);

export const updateIncidentStatus = createAsyncThunk(
  'incidents/updateIncidentStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await incidentsApi.updateIncidentStatus(id, status);
      return response.data;
    } catch (error) {
      return rejectWithValue(formatErrorMessage(error));
    }
  }
);

export const assignIncident = createAsyncThunk(
  'incidents/assignIncident',
  async ({ id, technicianId }, { rejectWithValue }) => {
    try {
      const response = await incidentsApi.assignIncident(id, technicianId);
      return response.data;
    } catch (error) {
      return rejectWithValue(formatErrorMessage(error));
    }
  }
);

export const addIncidentComment = createAsyncThunk(
  'incidents/addIncidentComment',
  async ({ id, comment }, { rejectWithValue }) => {
    try {
      const response = await incidentsApi.addIncidentComment(id, comment);
      return response.data;
    } catch (error) {
      return rejectWithValue(formatErrorMessage(error));
    }
  }
);

export const fetchIncidentComments = createAsyncThunk(
  'incidents/fetchIncidentComments',
  async (id, { rejectWithValue }) => {
    try {
      const response = await incidentsApi.getIncidentComments(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(formatErrorMessage(error));
    }
  }
);

export const uploadIncidentAttachment = createAsyncThunk(
  'incidents/uploadIncidentAttachment',
  async ({ id, file }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await incidentsApi.uploadIncidentAttachment(id, formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(formatErrorMessage(error));
    }
  }
);

export const fetchIncidentAttachments = createAsyncThunk(
  'incidents/fetchIncidentAttachments',
  async (id, { rejectWithValue }) => {
    try {
      const response = await incidentsApi.getIncidentAttachments(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(formatErrorMessage(error));
    }
  }
);

export const deleteIncidentAttachment = createAsyncThunk(
  'incidents/deleteIncidentAttachment',
  async ({ incidentId, attachmentId }, { rejectWithValue }) => {
    try {
      await incidentsApi.deleteIncidentAttachment(incidentId, attachmentId);
      return attachmentId;
    } catch (error) {
      return rejectWithValue(formatErrorMessage(error));
    }
  }
);

export const fetchIncidentHistory = createAsyncThunk(
  'incidents/fetchIncidentHistory',
  async (id, { rejectWithValue }) => {
    try {
      const response = await incidentsApi.getIncidentHistory(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(formatErrorMessage(error));
    }
  }
);

export const escalateIncident = createAsyncThunk(
  'incidents/escalateIncident',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const response = await incidentsApi.escalateIncident(id, reason);
      return response.data;
    } catch (error) {
      return rejectWithValue(formatErrorMessage(error));
    }
  }
);

const incidentsSlice = createSlice({
  name: 'incidents',
  initialState,
  reducers: {
    resetIncidentState: (state) => {
      state.incident = null;
      state.error = null;
      state.success = false;
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
    setLimit: (state, action) => {
      state.limit = action.payload;
      state.page = 1; // Reset to first page when changing limit
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.page = 1; // Reset to first page when applying filters
    },
    resetFilters: (state) => {
      state.filters = {
        status: null,
        priority: null,
        assignedTo: null,
        createdBy: null,
        dateFrom: null,
        dateTo: null,
        searchQuery: '',
        equipmentId: null,
      };
      state.page = 1;
    },
    setSorting: (state, action) => {
      const { sortBy, sortDirection } = action.payload;
      state.sortBy = sortBy;
      state.sortDirection = sortDirection;
    },
    clearIncident: (state) => {
      state.incident = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch incidents
      .addCase(fetchIncidents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchIncidents.fulfilled, (state, action) => {
        state.loading = false;
        state.incidents = action.payload.incidents;
        state.totalCount = action.payload.totalCount;
        state.success = true;
      })
      .addCase(fetchIncidents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(`Failed to fetch incidents: ${action.payload}`);
      })
      
      // Fetch incident by ID
      .addCase(fetchIncidentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchIncidentById.fulfilled, (state, action) => {
        state.loading = false;
        state.incident = action.payload;
        state.success = true;
      })
      .addCase(fetchIncidentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(`Failed to fetch incident: ${action.payload}`);
      })
      
      // Create incident
      .addCase(createIncident.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createIncident.fulfilled, (state, action) => {
        state.loading = false;
        state.incidents.unshift(action.payload);
        state.totalCount += 1;
        state.success = true;
        toast.success('Incident created successfully');
      })
      .addCase(createIncident.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
        toast.error(`Failed to create incident: ${action.payload}`);
      })
      
      // Update incident
      .addCase(updateIncident.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateIncident.fulfilled, (state, action) => {
        state.loading = false;
        state.incident = action.payload;
        
        // Update in the list if present
        const index = state.incidents.findIndex(inc => inc._id === action.payload._id);
        if (index !== -1) {
          state.incidents[index] = action.payload;
        }
        
        state.success = true;
        toast.success('Incident updated successfully');
      })
      .addCase(updateIncident.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
        toast.error(`Failed to update incident: ${action.payload}`);
      })
      
      // Delete incident
      .addCase(deleteIncident.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteIncident.fulfilled, (state, action) => {
        state.loading = false;
        state.incidents = state.incidents.filter(incident => incident._id !== action.payload);
        state.totalCount -= 1;
        state.success = true;
        toast.success('Incident deleted successfully');
      })
      .addCase(deleteIncident.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(`Failed to delete incident: ${action.payload}`);
      })
      
      // Update incident status
      .addCase(updateIncidentStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateIncidentStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.incident = action.payload;
        
        // Update in the list if present
        const index = state.incidents.findIndex(inc => inc._id === action.payload._id);
        if (index !== -1) {
          state.incidents[index] = action.payload;
        }
        
        state.success = true;
        toast.success(`Incident status updated to ${action.payload.status}`);
      })
      .addCase(updateIncidentStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(`Failed to update incident status: ${action.payload}`);
      })
      
      // Assign incident
      .addCase(assignIncident.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(assignIncident.fulfilled, (state, action) => {
        state.loading = false;
        state.incident = action.payload;
        
        // Update in the list if present
        const index = state.incidents.findIndex(inc => inc._id === action.payload._id);
        if (index !== -1) {
          state.incidents[index] = action.payload;
        }
        
        state.success = true;
        toast.success('Incident assigned successfully');
      })
      .addCase(assignIncident.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(`Failed to assign incident: ${action.payload}`);
      })
      
      // Add incident comment
      .addCase(addIncidentComment.pending, (state) => {
        state.commentsLoading = true;
        state.error = null;
      })
      .addCase(addIncidentComment.fulfilled, (state, action) => {
        state.commentsLoading = false;
        state.comments.push(action.payload);
        state.success = true;
        toast.success('Comment added successfully');
      })
      .addCase(addIncidentComment.rejected, (state, action) => {
        state.commentsLoading = false;
        state.error = action.payload;
        toast.error(`Failed to add comment: ${action.payload}`);
      })
      
      // Fetch incident comments
      .addCase(fetchIncidentComments.pending, (state) => {
        state.commentsLoading = true;
        state.error = null;
      })
      .addCase(fetchIncidentComments.fulfilled, (state, action) => {
        state.commentsLoading = false;
        state.comments = action.payload;
        state.success = true;
      })
      .addCase(fetchIncidentComments.rejected, (state, action) => {
        state.commentsLoading = false;
        state.error = action.payload;
        toast.error(`Failed to fetch comments: ${action.payload}`);
      })
      
      // Upload incident attachment
      .addCase(uploadIncidentAttachment.pending, (state) => {
        state.attachmentsLoading = true;
        state.error = null;
      })
      .addCase(uploadIncidentAttachment.fulfilled, (state, action) => {
        state.attachmentsLoading = false;
        state.attachments.push(action.payload);
        state.success = true;
        toast.success('Attachment uploaded successfully');
      })
      .addCase(uploadIncidentAttachment.rejected, (state, action) => {
        state.attachmentsLoading = false;
        state.error = action.payload;
        toast.error(`Failed to upload attachment: ${action.payload}`);
      })
      
      // Fetch incident attachments
      .addCase(fetchIncidentAttachments.pending, (state) => {
        state.attachmentsLoading = true;
        state.error = null;
      })
      .addCase(fetchIncidentAttachments.fulfilled, (state, action) => {
        state.attachmentsLoading = false;
        state.attachments = action.payload;
        state.success = true;
      })
      .addCase(fetchIncidentAttachments.rejected, (state, action) => {
        state.attachmentsLoading = false;
        state.error = action.payload;
        toast.error(`Failed to fetch attachments: ${action.payload}`);
      })
      
      // Delete incident attachment
      .addCase(deleteIncidentAttachment.pending, (state) => {
        state.attachmentsLoading = true;
        state.error = null;
      })
      .addCase(deleteIncidentAttachment.fulfilled, (state, action) => {
        state.attachmentsLoading = false;
        state.attachments = state.attachments.filter(
          attachment => attachment._id !== action.payload
        );
        state.success = true;
        toast.success('Attachment deleted successfully');
      })
      .addCase(deleteIncidentAttachment.rejected, (state, action) => {
        state.attachmentsLoading = false;
        state.error = action.payload;
        toast.error(`Failed to delete attachment: ${action.payload}`);
      })
      
      // Fetch incident history
      .addCase(fetchIncidentHistory.pending, (state) => {
        state.historyLoading = true;
        state.error = null;
      })
      .addCase(fetchIncidentHistory.fulfilled, (state, action) => {
        state.historyLoading = false;
        state.history = action.payload;
        state.success = true;
      })
      .addCase(fetchIncidentHistory.rejected, (state, action) => {
        state.historyLoading = false;
        state.error = action.payload;
        toast.error(`Failed to fetch incident history: ${action.payload}`);
      })
      
      // Escalate incident
      .addCase(escalateIncident.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(escalateIncident.fulfilled, (state, action) => {
        state.loading = false;
        state.incident = action.payload;
        
        // Update in the list if present
        const index = state.incidents.findIndex(inc => inc._id === action.payload._id);
        if (index !== -1) {
          state.incidents[index] = action.payload;
        }
        
        state.success = true;
        toast.success('Incident escalated successfully');
      })
      .addCase(escalateIncident.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(`Failed to escalate incident: ${action.payload}`);
      });
  },
});

export const { 
  resetIncidentState, 
  setPage, 
  setLimit, 
  setFilters, 
  resetFilters, 
  setSorting,
  clearIncident
} = incidentsSlice.actions;

// Selectors
export const selectIncidents = (state) => state.incidents.incidents;
export const selectIncident = (state) => state.incidents.incident;
export const selectIncidentsLoading = (state) => state.incidents.loading;
export const selectIncidentsError = (state) => state.incidents.error;
export const selectIncidentsSuccess = (state) => state.incidents.success;
export const selectIncidentsTotalCount = (state) => state.incidents.totalCount;
export const selectIncidentsPage = (state) => state.incidents.page;
export const selectIncidentsLimit = (state) => state.incidents.limit;
export const selectIncidentsFilters = (state) => state.incidents.filters;
export const selectIncidentsSortBy = (state) => state.incidents.sortBy;
export const selectIncidentsSortDirection = (state) => state.incidents.sortDirection;
export const selectIncidentComments = (state) => state.incidents.comments;
export const selectIncidentCommentsLoading = (state) => state.incidents.commentsLoading;
export const selectIncidentAttachments = (state) => state.incidents.attachments;
export const selectIncidentAttachmentsLoading = (state) => state.incidents.attachmentsLoading;
export const selectIncidentHistory = (state) => state.incidents.history;
export const selectIncidentHistoryLoading = (state) => state.incidents.historyLoading;

export default incidentsSlice.reducer;