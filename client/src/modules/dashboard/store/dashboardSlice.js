import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import dashboardApi from '../../../services/api/dashboardApi';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

// Define initial state
const initialState = {
  statistics: {
    totalIncidents: 0,
    openIncidents: 0,
    resolvedIncidents: 0,
    totalEquipment: 0,
    availableEquipment: 0,
    inUseEquipment: 0,
    averageResolutionTime: 0,
    incidentsByPriority: {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0
    },
    incidentsByStatus: {
      open: 0,
      inProgress: 0,
      resolved: 0,
      closed: 0
    },
    incidentsByCategory: {}
  },
  incidentTrends: {
    daily: [],
    weekly: [],
    monthly: []
  },
  equipmentStatus: {
    available: 0,
    inUse: 0,
    underMaintenance: 0,
    retired: 0
  },
  recentIncidents: [],
  topUsers: [],
  performanceMetrics: {
    averageResponseTime: 0,
    averageResolutionTime: 0,
    slaComplianceRate: 0
  },
  dateRange: {
    startDate: null,
    endDate: null
  },
  loading: false,
  error: null,
  generatingReport: false,
  reportError: null
};

// Helper to get default date range (last 30 days)
export const getDefaultDateRange = () => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  };
};

// Async thunks
export const fetchDashboardStatistics = createAsyncThunk(
  'dashboard/fetchStatistics',
  async ({ startDate, endDate } = {}, { rejectWithValue }) => {
    try {
      const dateParams = {};
      if (startDate) dateParams.startDate = startDate;
      if (endDate) dateParams.endDate = endDate;
      
      const response = await dashboardApi.getStatistics(dateParams);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard statistics');
    }
  }
);

export const fetchIncidentTrends = createAsyncThunk(
  'dashboard/fetchIncidentTrends',
  async ({ period = 'monthly', startDate, endDate } = {}, { rejectWithValue }) => {
    try {
      const params = { period };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const response = await dashboardApi.getIncidentTrends(params);
      return { period, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch incident trends');
    }
  }
);

export const fetchEquipmentStatus = createAsyncThunk(
  'dashboard/fetchEquipmentStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getEquipmentStatus();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch equipment status');
    }
  }
);

export const fetchRecentIncidents = createAsyncThunk(
  'dashboard/fetchRecentIncidents',
  async ({ limit = 5 } = {}, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getRecentIncidents(limit);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch recent incidents');
    }
  }
);

export const fetchTopUsers = createAsyncThunk(
  'dashboard/fetchTopUsers',
  async ({ limit = 5 } = {}, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getTopUsers(limit);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch top users');
    }
  }
);

export const fetchPerformanceMetrics = createAsyncThunk(
  'dashboard/fetchPerformanceMetrics',
  async ({ startDate, endDate } = {}, { rejectWithValue }) => {
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const response = await dashboardApi.getPerformanceMetrics(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch performance metrics');
    }
  }
);

export const generateDashboardReport = createAsyncThunk(
  'dashboard/generateReport',
  async ({ reportType, format, dateRange, filters }, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.generateReport({
        reportType,
        format,
        startDate: dateRange?.startDate,
        endDate: dateRange?.endDate,
        ...filters
      }, { responseType: 'blob' });
      
      // Create a download link and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Set filename based on report type and format
      const dateStr = format(new Date(), 'yyyy-MM-dd');
      link.download = `${reportType.toLowerCase()}_report_${dateStr}.${format.toLowerCase()}`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Report generated successfully');
      return true;
    } catch (error) {
      toast.error('Failed to generate report');
      return rejectWithValue(error.response?.data?.message || 'Failed to generate report');
    }
  }
);

export const fetchAllDashboardData = createAsyncThunk(
  'dashboard/fetchAllData',
  async ({ startDate, endDate } = {}, { dispatch }) => {
    // Set loading state
    dispatch(dashboardSlice.actions.setLoading(true));
    
    try {
      // Fetch all dashboard data in parallel
      await Promise.all([
        dispatch(fetchDashboardStatistics({ startDate, endDate })),
        dispatch(fetchIncidentTrends({ startDate, endDate })),
        dispatch(fetchEquipmentStatus()),
        dispatch(fetchRecentIncidents()),
        dispatch(fetchTopUsers()),
        dispatch(fetchPerformanceMetrics({ startDate, endDate }))
      ]);
      
      return true;
    } catch (error) {
      return false;
    } finally {
      dispatch(dashboardSlice.actions.setLoading(false));
    }
  }
);

// Create the dashboard slice
const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setDateRange: (state, action) => {
      state.dateRange = action.payload;
    },
    resetDateRange: (state) => {
      const { startDate, endDate } = getDefaultDateRange();
      state.dateRange = { startDate, endDate };
    },
    clearDashboardData: (state) => {
      state.statistics = initialState.statistics;
      state.incidentTrends = initialState.incidentTrends;
      state.equipmentStatus = initialState.equipmentStatus;
      state.recentIncidents = initialState.recentIncidents;
      state.topUsers = initialState.topUsers;
      state.performanceMetrics = initialState.performanceMetrics;
    }
  },
  extraReducers: (builder) => {
    // Handle fetchDashboardStatistics
    builder.addCase(fetchDashboardStatistics.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchDashboardStatistics.fulfilled, (state, action) => {
      state.loading = false;
      state.statistics = action.payload;
    });
    builder.addCase(fetchDashboardStatistics.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
      toast.error(`Error: ${action.payload}`);
    });

    // Handle fetchIncidentTrends
    builder.addCase(fetchIncidentTrends.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchIncidentTrends.fulfilled, (state, action) => {
      state.loading = false;
      state.incidentTrends[action.payload.period] = action.payload.data;
    });
    builder.addCase(fetchIncidentTrends.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
      toast.error(`Error: ${action.payload}`);
    });

    // Handle fetchEquipmentStatus
    builder.addCase(fetchEquipmentStatus.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchEquipmentStatus.fulfilled, (state, action) => {
      state.loading = false;
      state.equipmentStatus = action.payload;
    });
    builder.addCase(fetchEquipmentStatus.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
      toast.error(`Error: ${action.payload}`);
    });

    // Handle fetchRecentIncidents
    builder.addCase(fetchRecentIncidents.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchRecentIncidents.fulfilled, (state, action) => {
      state.loading = false;
      state.recentIncidents = action.payload;
    });
    builder.addCase(fetchRecentIncidents.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
      toast.error(`Error: ${action.payload}`);
    });

    // Handle fetchTopUsers
    builder.addCase(fetchTopUsers.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchTopUsers.fulfilled, (state, action) => {
      state.loading = false;
      state.topUsers = action.payload;
    });
    builder.addCase(fetchTopUsers.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
      toast.error(`Error: ${action.payload}`);
    });

    // Handle fetchPerformanceMetrics
    builder.addCase(fetchPerformanceMetrics.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchPerformanceMetrics.fulfilled, (state, action) => {
      state.loading = false;
      state.performanceMetrics = action.payload;
    });
    builder.addCase(fetchPerformanceMetrics.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
      toast.error(`Error: ${action.payload}`);
    });

    // Handle generateDashboardReport
    builder.addCase(generateDashboardReport.pending, (state) => {
      state.generatingReport = true;
      state.reportError = null;
    });
    builder.addCase(generateDashboardReport.fulfilled, (state) => {
      state.generatingReport = false;
    });
    builder.addCase(generateDashboardReport.rejected, (state, action) => {
      state.generatingReport = false;
      state.reportError = action.payload;
      toast.error(`Error generating report: ${action.payload}`);
    });
  }
});

// Export actions and reducer
export const { setDateRange, resetDateRange, clearDashboardData } = dashboardSlice.actions;
export default dashboardSlice.reducer;