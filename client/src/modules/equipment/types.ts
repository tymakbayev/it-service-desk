export interface Equipment {
  id: string;
  name: string;
  type: EquipmentType;
  serialNumber: string;
  purchaseDate: string;
  warrantyEndDate: string;
  status: EquipmentStatus;
  location: string;
  assignedTo?: string;
  assignedToName?: string;
  notes?: string;
  lastMaintenance?: string;
  createdAt: string;
  updatedAt: string;
}

export enum EquipmentType {
  LAPTOP = 'LAPTOP',
  DESKTOP = 'DESKTOP',
  MONITOR = 'MONITOR',
  PRINTER = 'PRINTER',
  SERVER = 'SERVER',
  NETWORK = 'NETWORK',
  PERIPHERAL = 'PERIPHERAL',
  OTHER = 'OTHER'
}

export enum EquipmentStatus {
  AVAILABLE = 'AVAILABLE',
  ASSIGNED = 'ASSIGNED',
  IN_REPAIR = 'IN_REPAIR',
  DECOMMISSIONED = 'DECOMMISSIONED',
  LOST = 'LOST'
}

export interface EquipmentFilters {
  type?: EquipmentType;
  status?: EquipmentStatus;
  location?: string;
  assignedTo?: string;
  search?: string;
}

export interface AddEquipmentPayload {
  name: string;
  type: EquipmentType;
  serialNumber: string;
  purchaseDate: string;
  warrantyEndDate?: string;
  status: EquipmentStatus;
  location: string;
  assignedTo?: string;
  notes?: string;
}

export interface UpdateEquipmentPayload extends Partial<AddEquipmentPayload> {
  id: string;
}

export interface AssignEquipmentPayload {
  equipmentId: string;
  userId: string;
  notes?: string;
}

export interface EquipmentResponse {
  equipment: Equipment;
  message: string;
}

export interface EquipmentListResponse {
  equipment: Equipment[];
  total: number;
  page: number;
  limit: number;
}