/**
 * NotificationTypes.js
 * 
 * Определяет типы и интерфейсы для системы уведомлений в приложении IT Service Desk.
 * Этот файл содержит константы, перечисления и типы данных, используемые для
 * работы с уведомлениями во всем приложении.
 */

// Перечисление типов уведомлений
const NotificationType = {
  // Общие типы уведомлений
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  
  // Типы уведомлений, связанные с инцидентами
  INCIDENT_CREATED: 'incident_created',
  INCIDENT_ASSIGNED: 'incident_assigned',
  INCIDENT_STATUS_CHANGED: 'incident_status_changed',
  INCIDENT_PRIORITY_CHANGED: 'incident_priority_changed',
  INCIDENT_COMMENT_ADDED: 'incident_comment_added',
  INCIDENT_RESOLVED: 'incident_resolved',
  INCIDENT_REOPENED: 'incident_reopened',
  INCIDENT_DUE_SOON: 'incident_due_soon',
  INCIDENT_OVERDUE: 'incident_overdue',
  
  // Типы уведомлений, связанные с оборудованием
  EQUIPMENT_ADDED: 'equipment_added',
  EQUIPMENT_UPDATED: 'equipment_updated',
  EQUIPMENT_STATUS_CHANGED: 'equipment_status_changed',
  EQUIPMENT_ASSIGNED: 'equipment_assigned',
  EQUIPMENT_MAINTENANCE_DUE: 'equipment_maintenance_due',
  EQUIPMENT_WARRANTY_EXPIRING: 'equipment_warranty_expiring',
  
  // Типы уведомлений, связанные с пользователями
  USER_ACCOUNT_CREATED: 'user_account_created',
  USER_ROLE_CHANGED: 'user_role_changed',
  USER_PASSWORD_RESET: 'user_password_reset',
  USER_LOGIN_FAILED: 'user_login_failed',
  
  // Типы уведомлений, связанные с системой
  SYSTEM_MAINTENANCE: 'system_maintenance',
  SYSTEM_UPDATE: 'system_update',
  SYSTEM_ERROR: 'system_error'
};

// Приоритеты уведомлений
const NotificationPriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// Статусы уведомлений
const NotificationStatus = {
  UNREAD: 'unread',
  READ: 'read',
  ARCHIVED: 'archived'
};

// Каналы доставки уведомлений
const NotificationChannel = {
  IN_APP: 'in_app',
  EMAIL: 'email',
  SMS: 'sms',
  PUSH: 'push'
};

/**
 * Получает иконку для типа уведомления
 * @param {string} type - Тип уведомления
 * @returns {string} - Название иконки из библиотеки react-icons
 */
const getNotificationIcon = (type) => {
  switch (type) {
    case NotificationType.INFO:
      return 'FiInfo';
    case NotificationType.SUCCESS:
      return 'FiCheckCircle';
    case NotificationType.WARNING:
      return 'FiAlertTriangle';
    case NotificationType.ERROR:
      return 'FiAlertOctagon';
    case NotificationType.INCIDENT_CREATED:
    case NotificationType.INCIDENT_ASSIGNED:
    case NotificationType.INCIDENT_STATUS_CHANGED:
    case NotificationType.INCIDENT_PRIORITY_CHANGED:
    case NotificationType.INCIDENT_COMMENT_ADDED:
    case NotificationType.INCIDENT_RESOLVED:
    case NotificationType.INCIDENT_REOPENED:
      return 'FiFileText';
    case NotificationType.INCIDENT_DUE_SOON:
    case NotificationType.INCIDENT_OVERDUE:
      return 'FiClock';
    case NotificationType.EQUIPMENT_ADDED:
    case NotificationType.EQUIPMENT_UPDATED:
    case NotificationType.EQUIPMENT_STATUS_CHANGED:
    case NotificationType.EQUIPMENT_ASSIGNED:
      return 'FiMonitor';
    case NotificationType.EQUIPMENT_MAINTENANCE_DUE:
    case NotificationType.EQUIPMENT_WARRANTY_EXPIRING:
      return 'FiTool';
    case NotificationType.USER_ACCOUNT_CREATED:
    case NotificationType.USER_ROLE_CHANGED:
    case NotificationType.USER_PASSWORD_RESET:
    case NotificationType.USER_LOGIN_FAILED:
      return 'FiUser';
    case NotificationType.SYSTEM_MAINTENANCE:
    case NotificationType.SYSTEM_UPDATE:
    case NotificationType.SYSTEM_ERROR:
      return 'FiSettings';
    default:
      return 'FiBell';
  }
};

/**
 * Получает цвет для типа уведомления
 * @param {string} type - Тип уведомления
 * @returns {string} - Код цвета в формате HEX
 */
const getNotificationColor = (type) => {
  switch (type) {
    case NotificationType.INFO:
      return '#3498db';
    case NotificationType.SUCCESS:
      return '#2ecc71';
    case NotificationType.WARNING:
      return '#f39c12';
    case NotificationType.ERROR:
    case NotificationType.SYSTEM_ERROR:
    case NotificationType.USER_LOGIN_FAILED:
      return '#e74c3c';
    case NotificationType.INCIDENT_CREATED:
    case NotificationType.INCIDENT_ASSIGNED:
      return '#9b59b6';
    case NotificationType.INCIDENT_RESOLVED:
      return '#27ae60';
    case NotificationType.INCIDENT_DUE_SOON:
    case NotificationType.INCIDENT_OVERDUE:
    case NotificationType.EQUIPMENT_MAINTENANCE_DUE:
    case NotificationType.EQUIPMENT_WARRANTY_EXPIRING:
      return '#e67e22';
    default:
      return '#34495e';
  }
};

/**
 * Получает заголовок по умолчанию для типа уведомления
 * @param {string} type - Тип уведомления
 * @returns {string} - Заголовок уведомления
 */
const getDefaultNotificationTitle = (type) => {
  switch (type) {
    case NotificationType.INFO:
      return 'Информация';
    case NotificationType.SUCCESS:
      return 'Успешно';
    case NotificationType.WARNING:
      return 'Предупреждение';
    case NotificationType.ERROR:
      return 'Ошибка';
    case NotificationType.INCIDENT_CREATED:
      return 'Создан новый инцидент';
    case NotificationType.INCIDENT_ASSIGNED:
      return 'Инцидент назначен';
    case NotificationType.INCIDENT_STATUS_CHANGED:
      return 'Статус инцидента изменен';
    case NotificationType.INCIDENT_PRIORITY_CHANGED:
      return 'Приоритет инцидента изменен';
    case NotificationType.INCIDENT_COMMENT_ADDED:
      return 'Добавлен комментарий к инциденту';
    case NotificationType.INCIDENT_RESOLVED:
      return 'Инцидент решен';
    case NotificationType.INCIDENT_REOPENED:
      return 'Инцидент переоткрыт';
    case NotificationType.INCIDENT_DUE_SOON:
      return 'Срок решения инцидента скоро истекает';
    case NotificationType.INCIDENT_OVERDUE:
      return 'Срок решения инцидента истек';
    case NotificationType.EQUIPMENT_ADDED:
      return 'Добавлено новое оборудование';
    case NotificationType.EQUIPMENT_UPDATED:
      return 'Информация об оборудовании обновлена';
    case NotificationType.EQUIPMENT_STATUS_CHANGED:
      return 'Статус оборудования изменен';
    case NotificationType.EQUIPMENT_ASSIGNED:
      return 'Оборудование назначено';
    case NotificationType.EQUIPMENT_MAINTENANCE_DUE:
      return 'Требуется обслуживание оборудования';
    case NotificationType.EQUIPMENT_WARRANTY_EXPIRING:
      return 'Истекает гарантия на оборудование';
    case NotificationType.USER_ACCOUNT_CREATED:
      return 'Создан новый аккаунт';
    case NotificationType.USER_ROLE_CHANGED:
      return 'Роль пользователя изменена';
    case NotificationType.USER_PASSWORD_RESET:
      return 'Сброс пароля';
    case NotificationType.USER_LOGIN_FAILED:
      return 'Неудачная попытка входа';
    case NotificationType.SYSTEM_MAINTENANCE:
      return 'Плановое обслуживание системы';
    case NotificationType.SYSTEM_UPDATE:
      return 'Обновление системы';
    case NotificationType.SYSTEM_ERROR:
      return 'Системная ошибка';
    default:
      return 'Уведомление';
  }
};

/**
 * Проверяет, требует ли тип уведомления немедленного внимания
 * @param {string} type - Тип уведомления
 * @returns {boolean} - true, если требует немедленного внимания
 */
const isUrgentNotification = (type) => {
  return [
    NotificationType.ERROR,
    NotificationType.SYSTEM_ERROR,
    NotificationType.INCIDENT_OVERDUE,
    NotificationType.EQUIPMENT_MAINTENANCE_DUE
  ].includes(type);
};

/**
 * Определяет, должно ли уведомление быть постоянным (не исчезать автоматически)
 * @param {string} type - Тип уведомления
 * @returns {boolean} - true, если уведомление должно быть постоянным
 */
const isPersistentNotification = (type) => {
  return [
    NotificationType.ERROR,
    NotificationType.SYSTEM_ERROR,
    NotificationType.SYSTEM_MAINTENANCE,
    NotificationType.INCIDENT_OVERDUE,
    NotificationType.EQUIPMENT_MAINTENANCE_DUE,
    NotificationType.EQUIPMENT_WARRANTY_EXPIRING
  ].includes(type);
};

/**
 * Определяет, должно ли уведомление отправляться по электронной почте
 * @param {string} type - Тип уведомления
 * @returns {boolean} - true, если уведомление должно отправляться по email
 */
const shouldSendEmail = (type) => {
  return [
    NotificationType.INCIDENT_ASSIGNED,
    NotificationType.INCIDENT_OVERDUE,
    NotificationType.EQUIPMENT_MAINTENANCE_DUE,
    NotificationType.EQUIPMENT_WARRANTY_EXPIRING,
    NotificationType.USER_ACCOUNT_CREATED,
    NotificationType.USER_PASSWORD_RESET,
    NotificationType.SYSTEM_MAINTENANCE
  ].includes(type);
};

// Экспорт всех типов и утилит
module.exports = {
  NotificationType,
  NotificationPriority,
  NotificationStatus,
  NotificationChannel,
  getNotificationIcon,
  getNotificationColor,
  getDefaultNotificationTitle,
  isUrgentNotification,
  isPersistentNotification,
  shouldSendEmail
};