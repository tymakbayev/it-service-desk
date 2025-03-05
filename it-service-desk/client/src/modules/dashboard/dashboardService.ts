import apiClient from '../../services/api/apiClient';
import {
  DashboardData,
  ReportOptions,
  DashboardStatistics
} from './types';

class DashboardService {
  private baseUrl = '/dashboard';

  public async getStatistics(startDate?: string, endDate?: string): Promise<DashboardStatistics> {
    const queryParams = new URLSearchParams();
    
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);
    
    const url = queryParams.toString() 
      ? `${this.baseUrl}/statistics?${queryParams.toString()}` 
      : `${this.baseUrl}/statistics`;
      
    return apiClient.get<DashboardStatistics>(url);
  }

  public async getDashboardData(startDate?: string, endDate?: string): Promise<DashboardData> {
    const queryParams = new URLSearchParams();
    
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);
    
    const url = queryParams.toString() 
      ? `${this.baseUrl}?${queryParams.toString()}` 
      : this.baseUrl;
      
    return apiClient.get<DashboardData>(url);
  }

  public async generateReport(options: ReportOptions): Promise<Blob> {
    return apiClient.post<Blob>(`${this.baseUrl}/reports`, options, {
      responseType: 'blob'
    });
  }

  public async exportReports(options: ReportOptions): Promise<Blob> {
    return this.generateReport(options);
  }

  public async getEquipmentTypeDistribution(): Promise<any> {
    return apiClient.get<any>(`${this.baseUrl}/equipment-distribution`);
  }

  public async getIncidentsByPriority(): Promise<any> {
    return apiClient.get<any>(`${this.baseUrl}/incidents-by-priority`);
  }

  public async getIncidentsByStatus(): Promise<any> {
    return apiClient.get<any>(`${this.baseUrl}/incidents-by-status`);
  }

  public async getIncidentTrends(period: 'week' | 'month' | 'year' = 'month'): Promise<any> {
    return apiClient.get<any>(`${this.baseUrl}/incident-trends?period=${period}`);
  }

  public async getEquipmentAgeDistribution(): Promise<any> {
    return apiClient.get<any>(`${this.baseUrl}/equipment-age`);
  }

  public async getTopIssueCategories(limit: number = 5): Promise<any> {
    return apiClient.get<any>(`${this.baseUrl}/top-issues?limit=${limit}`);
  }
}

const dashboardService = new DashboardService();
export default dashboardService;