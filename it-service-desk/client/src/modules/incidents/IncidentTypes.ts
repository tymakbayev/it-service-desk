export enum IncidentPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum IncidentStatus {
  NEW = 'new',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  ON_HOLD = 'on_hold',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
  CANCELLED = 'cancelled'
}

export enum IncidentCategory {
  HARDWARE = 'hardware',
  SOFTWARE = 'software',
  NETWORK = 'network',
  SECURITY = 'security',
  ACCESS = 'access',
  SERVICE_REQUEST = 'service_request',
  OTHER = 'other'
}

export interface IncidentComment {
  id: string;
  incidentId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: Date;
  isInternal: boolean;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  status: IncidentStatus;
  priority: IncidentPriority;
  category: IncidentCategory;
  reporterId: string;
  reporterName: string;
  assigneeId?: string;
  assigneeName?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  closedAt?: Date;
  dueDate?: Date;
  equipmentId?: string;
  equipmentName?: string;
  comments?: IncidentComment[];
  attachments?: string[];
  slaBreached?: boolean;
}

export interface IncidentState {
  incidents: Incident[];
  currentIncident: Incident | null;
  loading: boolean;
  error: string | null;
  totalCount: number;
  page: number;
  pageSize: number;
  filters: IncidentFilters;
}

export interface IncidentFilters {
  status?: IncidentStatus[];
  priority?: IncidentPriority[];
  category?: IncidentCategory[];
  assigneeId?: string;
  reporterId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  searchQuery?: string;
}

export interface CreateIncidentDto {
  title: string;
  description: string;
  priority: IncidentPriority;
  category: IncidentCategory;
  equipmentId?: string;
  attachments?: File[];
  dueDate?: Date;
}

export interface UpdateIncidentDto {
  title?: string;
  description?: string;
  status?: IncidentStatus;
  priority?: IncidentPriority;
  category?: IncidentCategory;
  assigneeId?: string;
  equipmentId?: string;
  dueDate?: Date;
}

export interface AddCommentDto {
  incidentId: string;
  content: string;
  isInternal?: boolean;
  attachments?: File[];
}
