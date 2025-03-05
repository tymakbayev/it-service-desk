import apiClient from '../../services/api/apiClient';
import {
  Equipment,
  EquipmentFilters,
  AddEquipmentPayload,
  UpdateEquipmentPayload,
  AssignEquipmentPayload,
  EquipmentResponse,
  EquipmentListResponse
} from './types';

class EquipmentService {
  private baseUrl = '/equipment';

  public async addEquipment(payload: AddEquipmentPayload): Promise<EquipmentResponse> {
    return apiClient.post<EquipmentResponse>(this.baseUrl, payload);
  }

  public async updateEquipment(payload: UpdateEquipmentPayload): Promise<EquipmentResponse> {
    return apiClient.put<EquipmentResponse>(`${this.baseUrl}/${payload.id}`, payload);
  }

  public async listEquipment(
    page: number = 1,
    limit: number = 10,
    filters?: EquipmentFilters
  ): Promise<EquipmentListResponse> {
    const queryParams = new URLSearchParams();
    
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    return apiClient.get<EquipmentListResponse>(`${this.baseUrl}?${queryParams.toString()}`);
  }

  public async getEquipmentDetails(id: string): Promise<Equipment> {
    return apiClient.get<Equipment>(`${this.baseUrl}/${id}`);
  }

  public async assignEquipment(payload: AssignEquipmentPayload): Promise<EquipmentResponse> {
    return apiClient.post<EquipmentResponse>(`${this.baseUrl}/${payload.equipmentId}/assign`, {
      userId: payload.userId,
      notes: payload.notes
    });
  }

  public async unassignEquipment(equipmentId: string): Promise<EquipmentResponse> {
    return apiClient.post<EquipmentResponse>(`${this.baseUrl}/${equipmentId}/unassign`);
  }

  public async getEquipmentHistory(equipmentId: string): Promise<any> {
    return apiClient.get<any>(`${this.baseUrl}/${equipmentId}/history`);
  }

  public async exportEquipmentList(filters?: EquipmentFilters): Promise<Blob> {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    return apiClient.get<Blob>(`${this.baseUrl}/export?${queryParams.toString()}`, {
      responseType: 'blob'
    });
  }
}

const equipmentService = new EquipmentService();
export default equipmentService;