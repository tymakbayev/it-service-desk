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
}

export interface EquipmentTypeDistribution {
  type: string;
  count: number;
}

export interface IncidentsByPriority {
  priority: string;
  count: number;
}

export interface IncidentsByStatus {
  status: string;
  count: number;
}

export interface IncidentTrend {
  date: string;
  opened: number;
  resolved: number;
}

export interface EquipmentAgeDistribution {
  ageRange: string;
  count: number;
}

export interface TopIssueCategories {
  category: string;
  count: number;
}

export interface DashboardData {
  statistics: DashboardStatistics;
  equipmentTypeDistribution: EquipmentTypeDistribution[];
  incidentsByPriority: IncidentsByPriority[];
  incidentsByStatus: IncidentsByStatus[];
  incidentTrends: IncidentTrend[];
  equipmentAgeDistribution: EquipmentAgeDistribution[];
  topIssueCategories: TopIssueCategories[];
}

export interface ReportOptions {
  startDate: string;
  endDate: string;
  reportType: ReportType;
  format: ReportFormat;
  filters?: {
    equipmentType?: string[];
    incidentPriority?: string[];
    incidentStatus?: string[];
    location?: string[];
  };
}

export enum ReportType {
  EQUIPMENT_INVENTORY = 'EQUIPMENT_INVENTORY',
  INCIDENT_SUMMARY = 'INCIDENT_SUMMARY',
  EQUIPMENT_ASSIGNMENT = 'EQUIPMENT_ASSIGNMENT',
  RESOLUTION_TIME = 'RESOLUTION_TIME',
  USER_ACTIVITY = 'USER_ACTIVITY'
}

export enum ReportFormat {
  PDF = 'PDF',
  EXCEL = 'EXCEL',
  CSV = 'CSV'
}

export interface ChartOptions {
  title?: string;
  colors?: string[];
  showLegend?: boolean;
  height?: number;
  width?: number;
  animate?: boolean;
}