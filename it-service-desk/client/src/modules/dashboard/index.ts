import dashboardService from './dashboardService';
import dashboardReducer, {
  fetchDashboardData,
  fetchStatistics,
  generateReport,
  setDateRange,
  resetDateRange,
  clearDashboardData
} from './dashboardSlice';
import {
  preparePieChartData,
  prepareBarChartData,
  prepareLineChartData,
  getChartOptions,
  formatNumber,
  formatDuration,
  defaultColors
} from './chartUtils';
import {
  DashboardData,
  DashboardStatistics,
  ReportOptions,
  ReportType,
  ReportFormat,
  ChartOptions
} from './types';

export {
  dashboardService,
  fetchDashboardData,
  fetchStatistics,
  generateReport,
  setDateRange,
  resetDateRange,
  clearDashboardData,
  preparePieChartData,
  prepareBarChartData,
  prepareLineChartData,
  getChartOptions,
  formatNumber,
  formatDuration,
  defaultColors,
  ReportType,
  ReportFormat
};

export type {
  DashboardData,
  DashboardStatistics,
  ReportOptions,
  ChartOptions
};

export default dashboardReducer;