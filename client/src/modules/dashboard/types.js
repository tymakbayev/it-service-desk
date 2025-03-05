/**
 * Dashboard Types
 * 
 * This file defines TypeScript interfaces and enums for the dashboard module.
 * These types are used throughout the dashboard module for type safety and
 * better developer experience.
 */

/**
 * Main dashboard statistics overview
 */
export interface DashboardStatistics {
  totalEquipment: number;
  availableEquipment: number;
  assignedEquipment: number;
  inRepairEquipment: number;
  decommissionedEquipment: number;
  totalIncidents: number;
  openIncidents: number;
  resolvedIncidents: number;
  pendingIncidents: number;
  averageResolutionTime: number; // in hours
  mttr: number; // Mean Time To Resolution (in hours)
  mtbf: number; // Mean Time Between Failures (in days)
}

/**
 * Equipment distribution by type
 */
export interface EquipmentTypeDistribution {
  type: string;
  count: number;
  percentage?: number;
}

/**
 * Incidents grouped by priority
 */
export interface IncidentsByPriority {
  priority: string;
  count: number;
  percentage?: number;
}

/**
 * Incidents grouped by status
 */
export interface IncidentsByStatus {
  status: string;
  count: number;
  percentage?: number;
}

/**
 * Incidents grouped by category
 */
export interface IncidentsByCategory {
  category: string;
  count: number;
  percentage?: number;
}

/**
 * Incident trend data for time-series charts
 */
export interface IncidentTrend {
  date: string;
  opened: number;
  resolved: number;
  pending: number;
}

/**
 * Equipment age distribution for charts
 */
export interface EquipmentAgeDistribution {
  ageRange: string;
  count: number;
  percentage?: number;
}

/**
 * Top issue categories for reporting
 */
export interface TopIssueCategories {
  category: string;
  count: number;
  percentage?: number;
}

/**
 * User performance metrics
 */
export interface UserPerformanceMetrics {
  userId: string;
  username: string;
  assignedIncidents: number;
  resolvedIncidents: number;
  averageResolutionTime: number;
  satisfactionScore?: number;
}

/**
 * Location-based incident distribution
 */
export interface LocationIncidentDistribution {
  location: string;
  count: number;
  percentage?: number;
}

/**
 * Complete dashboard data object containing all dashboard components
 */
export interface DashboardData {
  statistics: DashboardStatistics;
  equipmentTypeDistribution: EquipmentTypeDistribution[];
  incidentsByPriority: IncidentsByPriority[];
  incidentsByStatus: IncidentsByStatus[];
  incidentsByCategory: IncidentsByCategory[];
  incidentTrends: IncidentTrend[];
  equipmentAgeDistribution: EquipmentAgeDistribution[];
  topIssueCategories: TopIssueCategories[];
  userPerformanceMetrics?: UserPerformanceMetrics[];
  locationIncidentDistribution?: LocationIncidentDistribution[];
}

/**
 * Dashboard filter options
 */
export interface DashboardFilters {
  startDate?: string;
  endDate?: string;
  equipmentTypes?: string[];
  incidentPriorities?: string[];
  incidentStatuses?: string[];
  locations?: string[];
  assignedToUsers?: string[];
  timeFrame?: TimeFrame;
}

/**
 * Time frame options for dashboard data filtering
 */
export enum TimeFrame {
  TODAY = 'TODAY',
  YESTERDAY = 'YESTERDAY',
  THIS_WEEK = 'THIS_WEEK',
  LAST_WEEK = 'LAST_WEEK',
  THIS_MONTH = 'THIS_MONTH',
  LAST_MONTH = 'LAST_MONTH',
  THIS_QUARTER = 'THIS_QUARTER',
  LAST_QUARTER = 'LAST_QUARTER',
  THIS_YEAR = 'THIS_YEAR',
  LAST_YEAR = 'LAST_YEAR',
  CUSTOM = 'CUSTOM'
}

/**
 * Report generation options
 */
export interface ReportOptions {
  startDate: string;
  endDate: string;
  reportType: ReportType;
  format: ReportFormat;
  title?: string;
  description?: string;
  filters?: {
    equipmentType?: string[];
    incidentPriority?: string[];
    incidentStatus?: string[];
    location?: string[];
    assignedTo?: string[];
  };
  includeCharts?: boolean;
  includeTables?: boolean;
}

/**
 * Types of reports that can be generated
 */
export enum ReportType {
  EQUIPMENT_INVENTORY = 'EQUIPMENT_INVENTORY',
  INCIDENT_SUMMARY = 'INCIDENT_SUMMARY',
  EQUIPMENT_ASSIGNMENT = 'EQUIPMENT_ASSIGNMENT',
  RESOLUTION_TIME = 'RESOLUTION_TIME',
  USER_ACTIVITY = 'USER_ACTIVITY',
  COMPREHENSIVE = 'COMPREHENSIVE'
}

/**
 * Available report output formats
 */
export enum ReportFormat {
  PDF = 'PDF',
  EXCEL = 'EXCEL',
  CSV = 'CSV',
  HTML = 'HTML'
}

/**
 * Chart configuration options
 */
export interface ChartOptions {
  title?: string;
  colors?: string[];
  showLegend?: boolean;
  height?: number;
  width?: number;
  animate?: boolean;
  showDataLabels?: boolean;
  showGrid?: boolean;
  stacked?: boolean;
  responsive?: boolean;
  tooltips?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
}

/**
 * Dashboard widget configuration
 */
export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  size: WidgetSize;
  position: number;
  dataSource: string;
  chartType?: ChartType;
  chartOptions?: ChartOptions;
  visible: boolean;
  refreshInterval?: number; // in seconds
}

/**
 * Types of widgets available on the dashboard
 */
export enum WidgetType {
  STATISTIC = 'STATISTIC',
  CHART = 'CHART',
  TABLE = 'TABLE',
  LIST = 'LIST',
  CUSTOM = 'CUSTOM'
}

/**
 * Widget size options
 */
export enum WidgetSize {
  SMALL = 'SMALL',
  MEDIUM = 'MEDIUM',
  LARGE = 'LARGE',
  EXTRA_LARGE = 'EXTRA_LARGE'
}

/**
 * Chart types available for visualization
 */
export enum ChartType {
  BAR = 'BAR',
  LINE = 'LINE',
  PIE = 'PIE',
  DOUGHNUT = 'DOUGHNUT',
  AREA = 'AREA',
  SCATTER = 'SCATTER',
  RADAR = 'RADAR',
  POLAR = 'POLAR',
  BUBBLE = 'BUBBLE',
  HEATMAP = 'HEATMAP'
}

/**
 * Dashboard layout configuration
 */
export interface DashboardLayout {
  id: string;
  name: string;
  isDefault: boolean;
  userId?: string;
  widgets: DashboardWidget[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Dashboard API response format
 */
export interface DashboardResponse {
  data: DashboardData;
  message?: string;
  timestamp: string;
}

/**
 * Dashboard export options
 */
export interface DashboardExportOptions {
  format: ReportFormat;
  widgets: string[]; // IDs of widgets to include
  includeFilters: boolean;
  fileName?: string;
}