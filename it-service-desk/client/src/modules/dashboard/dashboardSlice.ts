import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import dashboardService from './dashboardService';
import {
  DashboardData,
  DashboardStatistics,
  ReportOptions
} from './types';

interface DashboardState {
  data: DashboardData | null;
  statistics: DashboardStatistics | null;
  loading: boolean;
  error: string | null;
  dateRange: {
    startDate: string | null;
    endDate: string | null;
  };
  generatingReport: boolean;
  reportError: string | null;
}

const initialState: DashboardState = {
  data: null,
  statistics: null,
  loading: false,
  error: null,
  dateRange: {
    startDate: null,
    endDate: null
  },
  generatingReport: false,
  reportError: null
};

// Helper to get default date range (last 30 days)
const getDefaultDateRange = () => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  };
};

// Async thunks
export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchData',
  async ({ startDate, endDate }: { startDate?: string; endDate?: string } = {}, { rejectWithValue }) => {
    try {
      return await dashboardService.getDashboardData(startDate, endDate);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard data');
    }
  }
);

export const fetchStatistics = createAsyncThunk(
  'dashboard/fetchStatistics',
  async ({ startDate, endDate }: { startDate?: string; endDate?: string } = {}, { rejectWithValue }) => {
    try {
      return await dashboardService.getStatistics(startDate, endDate);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch statistics');
    }
  }
);

export const generateReport = createAsyncThunk(
  'dashboard/generateReport',
  async (options: ReportOptions, { rejectWithValue }) => {
    try {
      const blob = await dashboardService.generateReport(options);
      
      // Create a download link and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Set filename based on report type and format
      const dateStr = new Date().toISOString().split('T')[0];
      link.download = `${options.reportType.toLowerCase()}_${dateStr}.${options.format.toLowerCase()}`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return true;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to generate report');
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setDateRange: (state, action: PayloadAction<{ startDate: string; endDate: string }>) => {
      state.dateRange = action.payload;
    },
    resetDateRange: (state) => {
      state.dateRange = getDefaultDateRange();
    },
    clearDashboardData: (state) => {
      state.data = null;
      state.statistics = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch dashboard data
    builder.addCase(fetchDashboardData.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchDashboardData.fulfilled, (state, action: PayloadAction<DashboardData>) => {
      state.loading = false;
      state.data = action.payload;
    });
    builder.addCase(fetchDashboardData.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch statistics
    builder.addCase(fetchStatistics.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchStatistics.fulfilled, (state, action: PayloadAction<DashboardStatistics>) => {
      state.loading = false;
      state.statistics = action.payload;
    });
    builder.addCase(fetchStatistics.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Generate report
    builder.addCase(generateReport.pending, (state) => {
      state.generatingReport = true;
      state.reportError = null;
    });
    builder.addCase(generateReport.fulfilled, (state) => {
      state.generatingReport = false;
    });
    builder.addCase(generateReport.rejected, (state, action) => {
      state.generatingReport = false;
      state.reportError = action.payload as string;
    });
  }
});

export const { setDateRange, resetDateRange, clearDashboardData } = dashboardSlice.actions;
export default dashboardSlice.reducer;