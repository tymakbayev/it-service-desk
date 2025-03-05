export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: Date;
  relatedEntityId?: string;
  relatedEntityType?: 'incident' | 'equipment' | 'task';
}

export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  INCIDENT_ASSIGNED = 'incident_assigned',
  INCIDENT_STATUS_CHANGED = 'incident_status_changed',
  INCIDENT_COMMENT_ADDED = 'incident_comment_added',
  EQUIPMENT_ADDED = 'equipment_added',
  EQUIPMENT_STATUS_CHANGED = 'equipment_status_changed'
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}
