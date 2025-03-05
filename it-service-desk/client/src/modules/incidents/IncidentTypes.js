/**
 * @fileoverview Определения типов для модуля инцидентов
 * Этот файл содержит все типы данных, перечисления и интерфейсы,
 * используемые в модуле управления инцидентами IT Service Desk.
 */

/**
 * Перечисление приоритетов инцидента
 * @enum {string}
 */
export const IncidentPriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

/**
 * Перечисление статусов инцидента
 * @enum {string}
 */
export const IncidentStatus = {
  NEW: 'new',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  ON_HOLD: 'on_hold',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
  CANCELLED: 'cancelled'
};

/**
 * Перечисление категорий инцидента
 * @enum {string}
 */
export const IncidentCategory = {
  HARDWARE: 'hardware',
  SOFTWARE: 'software',
  NETWORK: 'network',
  SECURITY: 'security',
  ACCESS: 'access',
  SERVICE_REQUEST: 'service_request',
  OTHER: 'other'
};

/**
 * Отображаемые названия приоритетов для UI
 * @type {Object.<string, string>}
 */
export const PriorityLabels = {
  [IncidentPriority.LOW]: 'Низкий',
  [IncidentPriority.MEDIUM]: 'Средний',
  [IncidentPriority.HIGH]: 'Высокий',
  [IncidentPriority.CRITICAL]: 'Критический'
};

/**
 * Отображаемые названия статусов для UI
 * @type {Object.<string, string>}
 */
export const StatusLabels = {
  [IncidentStatus.NEW]: 'Новый',
  [IncidentStatus.ASSIGNED]: 'Назначен',
  [IncidentStatus.IN_PROGRESS]: 'В работе',
  [IncidentStatus.ON_HOLD]: 'Приостановлен',
  [IncidentStatus.RESOLVED]: 'Решен',
  [IncidentStatus.CLOSED]: 'Закрыт',
  [IncidentStatus.CANCELLED]: 'Отменен'
};

/**
 * Отображаемые названия категорий для UI
 * @type {Object.<string, string>}
 */
export const CategoryLabels = {
  [IncidentCategory.HARDWARE]: 'Оборудование',
  [IncidentCategory.SOFTWARE]: 'Программное обеспечение',
  [IncidentCategory.NETWORK]: 'Сеть',
  [IncidentCategory.SECURITY]: 'Безопасность',
  [IncidentCategory.ACCESS]: 'Доступ',
  [IncidentCategory.SERVICE_REQUEST]: 'Запрос на обслуживание',
  [IncidentCategory.OTHER]: 'Другое'
};

/**
 * Цвета для отображения приоритетов в UI
 * @type {Object.<string, string>}
 */
export const PriorityColors = {
  [IncidentPriority.LOW]: '#28a745',
  [IncidentPriority.MEDIUM]: '#ffc107',
  [IncidentPriority.HIGH]: '#fd7e14',
  [IncidentPriority.CRITICAL]: '#dc3545'
};

/**
 * Цвета для отображения статусов в UI
 * @type {Object.<string, string>}
 */
export const StatusColors = {
  [IncidentStatus.NEW]: '#17a2b8',
  [IncidentStatus.ASSIGNED]: '#6f42c1',
  [IncidentStatus.IN_PROGRESS]: '#007bff',
  [IncidentStatus.ON_HOLD]: '#ffc107',
  [IncidentStatus.RESOLVED]: '#28a745',
  [IncidentStatus.CLOSED]: '#6c757d',
  [IncidentStatus.CANCELLED]: '#dc3545'
};

/**
 * Иконки для отображения категорий в UI
 * @type {Object.<string, string>}
 */
export const CategoryIcons = {
  [IncidentCategory.HARDWARE]: 'computer',
  [IncidentCategory.SOFTWARE]: 'code',
  [IncidentCategory.NETWORK]: 'wifi',
  [IncidentCategory.SECURITY]: 'security',
  [IncidentCategory.ACCESS]: 'vpn_key',
  [IncidentCategory.SERVICE_REQUEST]: 'build',
  [IncidentCategory.OTHER]: 'help'
};

/**
 * Допустимые переходы статусов инцидента
 * Ключ - текущий статус, значение - массив статусов, в которые можно перейти
 * @type {Object.<string, Array<string>>}
 */
export const StatusTransitions = {
  [IncidentStatus.NEW]: [
    IncidentStatus.ASSIGNED,
    IncidentStatus.IN_PROGRESS,
    IncidentStatus.CANCELLED
  ],
  [IncidentStatus.ASSIGNED]: [
    IncidentStatus.IN_PROGRESS,
    IncidentStatus.ON_HOLD,
    IncidentStatus.CANCELLED
  ],
  [IncidentStatus.IN_PROGRESS]: [
    IncidentStatus.ON_HOLD,
    IncidentStatus.RESOLVED,
    IncidentStatus.CANCELLED
  ],
  [IncidentStatus.ON_HOLD]: [
    IncidentStatus.IN_PROGRESS,
    IncidentStatus.CANCELLED
  ],
  [IncidentStatus.RESOLVED]: [
    IncidentStatus.CLOSED,
    IncidentStatus.IN_PROGRESS
  ],
  [IncidentStatus.CLOSED]: [],
  [IncidentStatus.CANCELLED]: []
};

/**
 * Интерфейс комментария к инциденту
 * @typedef {Object} IncidentComment
 * @property {string} id - Уникальный идентификатор комментария
 * @property {string} incidentId - ID инцидента, к которому относится комментарий
 * @property {string} userId - ID пользователя, оставившего комментарий
 * @property {string} userName - Имя пользователя, оставившего комментарий
 * @property {string} content - Содержание комментария
 * @property {Date} createdAt - Дата и время создания комментария
 * @property {boolean} isInternal - Флаг, указывающий является ли комментарий внутренним (видимым только для сотрудников)
 * @property {Array<string>} [attachments] - Массив URL-адресов прикрепленных файлов
 */

/**
 * Интерфейс инцидента
 * @typedef {Object} Incident
 * @property {string} id - Уникальный идентификатор инцидента
 * @property {string} title - Заголовок инцидента
 * @property {string} description - Описание инцидента
 * @property {string} status - Статус инцидента (из IncidentStatus)
 * @property {string} priority - Приоритет инцидента (из IncidentPriority)
 * @property {string} category - Категория инцидента (из IncidentCategory)
 * @property {string} reporterId - ID пользователя, создавшего инцидент
 * @property {string} reporterName - Имя пользователя, создавшего инцидент
 * @property {string} [assigneeId] - ID пользователя, назначенного на инцидент
 * @property {string} [assigneeName] - Имя пользователя, назначенного на инцидент
 * @property {Date} createdAt - Дата и время создания инцидента
 * @property {Date} updatedAt - Дата и время последнего обновления инцидента
 * @property {Date} [resolvedAt] - Дата и время решения инцидента
 * @property {Date} [closedAt] - Дата и время закрытия инцидента
 * @property {Date} [dueDate] - Срок выполнения инцидента
 * @property {string} [equipmentId] - ID связанного оборудования
 * @property {string} [equipmentName] - Название связанного оборудования
 * @property {Array<IncidentComment>} [comments] - Массив комментариев к инциденту
 * @property {Array<string>} [attachments] - Массив URL-адресов прикрепленных файлов
 * @property {boolean} [slaBreached] - Флаг, указывающий на нарушение SLA
 * @property {number} [responseTime] - Время первого ответа в минутах
 * @property {number} [resolutionTime] - Время решения в минутах
 */

/**
 * Интерфейс состояния инцидентов в Redux store
 * @typedef {Object} IncidentState
 * @property {Array<Incident>} incidents - Массив инцидентов
 * @property {Incident|null} currentIncident - Текущий выбранный инцидент
 * @property {boolean} loading - Флаг загрузки
 * @property {string|null} error - Сообщение об ошибке
 * @property {number} totalCount - Общее количество инцидентов
 * @property {number} page - Текущая страница
 * @property {number} pageSize - Размер страницы
 * @property {IncidentFilters} filters - Фильтры для списка инцидентов
 */

/**
 * Интерфейс фильтров инцидентов
 * @typedef {Object} IncidentFilters
 * @property {Array<string>} [status] - Массив статусов для фильтрации
 * @property {Array<string>} [priority] - Массив приоритетов для фильтрации
 * @property {Array<string>} [category] - Массив категорий для фильтрации
 * @property {string} [assigneeId] - ID назначенного пользователя
 * @property {string} [reporterId] - ID создателя инцидента
 * @property {Date} [dateFrom] - Начальная дата для фильтрации
 * @property {Date} [dateTo] - Конечная дата для фильтрации
 * @property {string} [searchQuery] - Строка поиска
 * @property {string} [equipmentId] - ID связанного оборудования
 */

/**
 * Интерфейс DTO для создания инцидента
 * @typedef {Object} CreateIncidentDto
 * @property {string} title - Заголовок инцидента
 * @property {string} description - Описание инцидента
 * @property {string} priority - Приоритет инцидента (из IncidentPriority)
 * @property {string} category - Категория инцидента (из IncidentCategory)
 * @property {string} [equipmentId] - ID связанного оборудования
 * @property {Array<File>} [attachments] - Массив файлов для прикрепления
 * @property {Date} [dueDate] - Срок выполнения инцидента
 */

/**
 * Интерфейс DTO для обновления инцидента
 * @typedef {Object} UpdateIncidentDto
 * @property {string} [title] - Заголовок инцидента
 * @property {string} [description] - Описание инцидента
 * @property {string} [status] - Статус инцидента (из IncidentStatus)
 * @property {string} [priority] - Приоритет инцидента (из IncidentPriority)
 * @property {string} [category] - Категория инцидента (из IncidentCategory)
 * @property {string} [assigneeId] - ID назначенного пользователя
 * @property {string} [equipmentId] - ID связанного оборудования
 * @property {Date} [dueDate] - Срок выполнения инцидента
 */

/**
 * Интерфейс DTO для добавления комментария
 * @typedef {Object} AddCommentDto
 * @property {string} incidentId - ID инцидента
 * @property {string} content - Содержание комментария
 * @property {boolean} [isInternal] - Флаг, указывающий является ли комментарий внутренним
 * @property {Array<File>} [attachments] - Массив файлов для прикрепления
 */

/**
 * Интерфейс DTO для изменения статуса инцидента
 * @typedef {Object} ChangeStatusDto
 * @property {string} incidentId - ID инцидента
 * @property {string} status - Новый статус инцидента (из IncidentStatus)
 * @property {string} [comment] - Комментарий к изменению статуса
 */

/**
 * Интерфейс DTO для назначения инцидента
 * @typedef {Object} AssignIncidentDto
 * @property {string} incidentId - ID инцидента
 * @property {string} assigneeId - ID назначаемого пользователя
 * @property {string} [comment] - Комментарий к назначению
 */

/**
 * Интерфейс для статистики инцидентов
 * @typedef {Object} IncidentStatistics
 * @property {number} total - Общее количество инцидентов
 * @property {Object.<string, number>} byStatus - Количество инцидентов по статусам
 * @property {Object.<string, number>} byPriority - Количество инцидентов по приоритетам
 * @property {Object.<string, number>} byCategory - Количество инцидентов по категориям
 * @property {number} avgResolutionTime - Среднее время решения (в минутах)
 * @property {number} avgResponseTime - Среднее время первого ответа (в минутах)
 * @property {number} slaBreachCount - Количество инцидентов с нарушением SLA
 */

/**
 * Интерфейс для SLA (Service Level Agreement)
 * @typedef {Object} SlaConfig
 * @property {Object.<string, number>} responseTime - Максимальное время первого ответа по приоритетам (в минутах)
 * @property {Object.<string, number>} resolutionTime - Максимальное время решения по приоритетам (в минутах)
 */

/**
 * Конфигурация SLA по умолчанию
 * @type {SlaConfig}
 */
export const DefaultSlaConfig = {
  responseTime: {
    [IncidentPriority.LOW]: 480, // 8 часов
    [IncidentPriority.MEDIUM]: 240, // 4 часа
    [IncidentPriority.HIGH]: 60, // 1 час
    [IncidentPriority.CRITICAL]: 30 // 30 минут
  },
  resolutionTime: {
    [IncidentPriority.LOW]: 2880, // 48 часов
    [IncidentPriority.MEDIUM]: 1440, // 24 часа
    [IncidentPriority.HIGH]: 480, // 8 часов
    [IncidentPriority.CRITICAL]: 240 // 4 часа
  }
};

/**
 * Функция для проверки нарушения SLA
 * @param {Incident} incident - Инцидент для проверки
 * @param {SlaConfig} slaConfig - Конфигурация SLA
 * @returns {boolean} Результат проверки
 */
export const checkSlaBreached = (incident, slaConfig = DefaultSlaConfig) => {
  if (incident.status === IncidentStatus.RESOLVED || incident.status === IncidentStatus.CLOSED) {
    // Проверка времени решения
    if (incident.resolvedAt && incident.createdAt) {
      const resolutionTimeMinutes = Math.floor(
        (new Date(incident.resolvedAt).getTime() - new Date(incident.createdAt).getTime()) / 60000
      );
      return resolutionTimeMinutes > slaConfig.resolutionTime[incident.priority];
    }
  } else if (incident.dueDate) {
    // Проверка срока выполнения
    return new Date() > new Date(incident.dueDate);
  }
  
  return false;
};

/**
 * Функция для расчета оставшегося времени до нарушения SLA (в минутах)
 * @param {Incident} incident - Инцидент для расчета
 * @param {SlaConfig} slaConfig - Конфигурация SLA
 * @returns {number} Оставшееся время в минутах (отрицательное значение означает нарушение)
 */
export const calculateSlaRemainingTime = (incident, slaConfig = DefaultSlaConfig) => {
  if (incident.status === IncidentStatus.RESOLVED || incident.status === IncidentStatus.CLOSED) {
    return 0;
  }
  
  const createdAt = new Date(incident.createdAt).getTime();
  const now = new Date().getTime();
  const elapsedMinutes = Math.floor((now - createdAt) / 60000);
  
  return slaConfig.resolutionTime[incident.priority] - elapsedMinutes;
};

export default {
  IncidentPriority,
  IncidentStatus,
  IncidentCategory,
  PriorityLabels,
  StatusLabels,
  CategoryLabels,
  PriorityColors,
  StatusColors,
  CategoryIcons,
  StatusTransitions,
  DefaultSlaConfig,
  checkSlaBreached,
  calculateSlaRemainingTime
};