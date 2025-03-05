/**
 * @file exampleTypes.js
 * @description Типы данных и интерфейсы для модуля примера
 * 
 * Этот файл содержит определения типов данных, интерфейсов и констант,
 * используемых в модуле примера. Он служит центральным местом для всех
 * типов данных, обеспечивая согласованность и типобезопасность.
 */

// Перечисление статусов примера
export const ExampleStatus = {
  DRAFT: 'draft',
  PENDING: 'pending',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ARCHIVED: 'archived',
};

// Перечисление приоритетов примера
export const ExamplePriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

// Перечисление типов примера
export const ExampleType = {
  TYPE_A: 'type_a',
  TYPE_B: 'type_b',
  TYPE_C: 'type_c',
  TYPE_D: 'type_d',
};

// Перечисление категорий примера
export const ExampleCategory = {
  CATEGORY_1: 'category_1',
  CATEGORY_2: 'category_2',
  CATEGORY_3: 'category_3',
  CATEGORY_4: 'category_4',
};

/**
 * Интерфейс для объекта примера
 * @typedef {Object} Example
 * @property {string} id - Уникальный идентификатор примера
 * @property {string} title - Название примера
 * @property {string} description - Описание примера
 * @property {string} status - Статус примера (из ExampleStatus)
 * @property {string} priority - Приоритет примера (из ExamplePriority)
 * @property {string} type - Тип примера (из ExampleType)
 * @property {string} category - Категория примера (из ExampleCategory)
 * @property {string} assignedTo - ID пользователя, которому назначен пример
 * @property {string} createdBy - ID пользователя, создавшего пример
 * @property {Date} createdAt - Дата создания примера
 * @property {Date} updatedAt - Дата последнего обновления примера
 * @property {Date} dueDate - Срок выполнения примера
 * @property {Array<string>} tags - Массив тегов, связанных с примером
 * @property {Array<Comment>} comments - Массив комментариев к примеру
 * @property {Array<Attachment>} attachments - Массив вложений к примеру
 * @property {Object} metadata - Дополнительные метаданные примера
 */

/**
 * Интерфейс для комментария к примеру
 * @typedef {Object} Comment
 * @property {string} id - Уникальный идентификатор комментария
 * @property {string} text - Текст комментария
 * @property {string} authorId - ID автора комментария
 * @property {Date} createdAt - Дата создания комментария
 * @property {Date} updatedAt - Дата последнего обновления комментария
 */

/**
 * Интерфейс для вложения к примеру
 * @typedef {Object} Attachment
 * @property {string} id - Уникальный идентификатор вложения
 * @property {string} filename - Имя файла
 * @property {string} originalName - Оригинальное имя файла
 * @property {string} path - Путь к файлу
 * @property {string} mimeType - MIME-тип файла
 * @property {number} size - Размер файла в байтах
 * @property {string} uploadedBy - ID пользователя, загрузившего файл
 * @property {Date} uploadedAt - Дата загрузки файла
 */

/**
 * Интерфейс для параметров фильтрации примеров
 * @typedef {Object} ExampleFilterParams
 * @property {string} [search] - Строка поиска
 * @property {string} [status] - Фильтр по статусу
 * @property {string} [priority] - Фильтр по приоритету
 * @property {string} [type] - Фильтр по типу
 * @property {string} [category] - Фильтр по категории
 * @property {string} [assignedTo] - Фильтр по назначенному пользователю
 * @property {string} [createdBy] - Фильтр по создателю
 * @property {Date} [createdFrom] - Фильтр по дате создания (от)
 * @property {Date} [createdTo] - Фильтр по дате создания (до)
 * @property {Date} [dueFrom] - Фильтр по сроку выполнения (от)
 * @property {Date} [dueTo] - Фильтр по сроку выполнения (до)
 * @property {Array<string>} [tags] - Фильтр по тегам
 */

/**
 * Интерфейс для параметров сортировки примеров
 * @typedef {Object} ExampleSortParams
 * @property {string} field - Поле для сортировки
 * @property {string} direction - Направление сортировки ('asc' или 'desc')
 */

/**
 * Интерфейс для параметров пагинации примеров
 * @typedef {Object} ExamplePaginationParams
 * @property {number} page - Номер страницы
 * @property {number} limit - Количество элементов на странице
 */

/**
 * Интерфейс для запроса на создание примера
 * @typedef {Object} CreateExampleRequest
 * @property {string} title - Название примера
 * @property {string} description - Описание примера
 * @property {string} status - Статус примера
 * @property {string} priority - Приоритет примера
 * @property {string} type - Тип примера
 * @property {string} category - Категория примера
 * @property {string} assignedTo - ID пользователя, которому назначен пример
 * @property {Date} dueDate - Срок выполнения примера
 * @property {Array<string>} tags - Массив тегов, связанных с примером
 * @property {Object} metadata - Дополнительные метаданные примера
 */

/**
 * Интерфейс для запроса на обновление примера
 * @typedef {Object} UpdateExampleRequest
 * @property {string} [title] - Название примера
 * @property {string} [description] - Описание примера
 * @property {string} [status] - Статус примера
 * @property {string} [priority] - Приоритет примера
 * @property {string} [type] - Тип примера
 * @property {string} [category] - Категория примера
 * @property {string} [assignedTo] - ID пользователя, которому назначен пример
 * @property {Date} [dueDate] - Срок выполнения примера
 * @property {Array<string>} [tags] - Массив тегов, связанных с примером
 * @property {Object} [metadata] - Дополнительные метаданные примера
 */

/**
 * Интерфейс для ответа с пагинацией примеров
 * @typedef {Object} PaginatedExamplesResponse
 * @property {Array<Example>} items - Массив примеров
 * @property {number} totalItems - Общее количество примеров
 * @property {number} totalPages - Общее количество страниц
 * @property {number} currentPage - Текущая страница
 */

/**
 * Интерфейс для статистики примеров
 * @typedef {Object} ExampleStatistics
 * @property {Object} byStatus - Статистика по статусам
 * @property {Object} byPriority - Статистика по приоритетам
 * @property {Object} byType - Статистика по типам
 * @property {Object} byCategory - Статистика по категориям
 * @property {Object} byAssignee - Статистика по назначенным пользователям
 * @property {Object} byCreator - Статистика по создателям
 * @property {Object} byTimeframe - Статистика по временным периодам
 */

/**
 * Интерфейс для состояния примера в Redux
 * @typedef {Object} ExampleState
 * @property {Array<Example>} items - Массив примеров
 * @property {Example|null} selectedExample - Выбранный пример
 * @property {boolean} loading - Флаг загрузки
 * @property {boolean} creating - Флаг создания
 * @property {boolean} updating - Флаг обновления
 * @property {boolean} deleting - Флаг удаления
 * @property {string|null} error - Ошибка
 * @property {ExampleFilterParams} filters - Параметры фильтрации
 * @property {ExampleSortParams} sort - Параметры сортировки
 * @property {ExamplePaginationParams} pagination - Параметры пагинации
 * @property {number} totalItems - Общее количество примеров
 * @property {number} totalPages - Общее количество страниц
 * @property {ExampleStatistics|null} statistics - Статистика примеров
 */

// Константы для действий Redux
export const EXAMPLE_ACTION_TYPES = {
  FETCH_EXAMPLES_REQUEST: 'example/fetchExamplesRequest',
  FETCH_EXAMPLES_SUCCESS: 'example/fetchExamplesSuccess',
  FETCH_EXAMPLES_FAILURE: 'example/fetchExamplesFailure',
  
  FETCH_EXAMPLE_REQUEST: 'example/fetchExampleRequest',
  FETCH_EXAMPLE_SUCCESS: 'example/fetchExampleSuccess',
  FETCH_EXAMPLE_FAILURE: 'example/fetchExampleFailure',
  
  CREATE_EXAMPLE_REQUEST: 'example/createExampleRequest',
  CREATE_EXAMPLE_SUCCESS: 'example/createExampleSuccess',
  CREATE_EXAMPLE_FAILURE: 'example/createExampleFailure',
  
  UPDATE_EXAMPLE_REQUEST: 'example/updateExampleRequest',
  UPDATE_EXAMPLE_SUCCESS: 'example/updateExampleSuccess',
  UPDATE_EXAMPLE_FAILURE: 'example/updateExampleFailure',
  
  DELETE_EXAMPLE_REQUEST: 'example/deleteExampleRequest',
  DELETE_EXAMPLE_SUCCESS: 'example/deleteExampleSuccess',
  DELETE_EXAMPLE_FAILURE: 'example/deleteExampleFailure',
  
  SET_EXAMPLE_FILTERS: 'example/setExampleFilters',
  SET_EXAMPLE_SORT: 'example/setExampleSort',
  SET_EXAMPLE_PAGINATION: 'example/setExamplePagination',
  
  FETCH_EXAMPLE_STATISTICS_REQUEST: 'example/fetchExampleStatisticsRequest',
  FETCH_EXAMPLE_STATISTICS_SUCCESS: 'example/fetchExampleStatisticsSuccess',
  FETCH_EXAMPLE_STATISTICS_FAILURE: 'example/fetchExampleStatisticsFailure',
  
  RESET_EXAMPLE_STATE: 'example/resetExampleState',
  CLEAR_EXAMPLE_ERROR: 'example/clearExampleError',
};

// Константы для API эндпоинтов
export const EXAMPLE_API_ENDPOINTS = {
  BASE: '/api/examples',
  BY_ID: (id) => `/api/examples/${id}`,
  STATISTICS: '/api/examples/statistics',
  COMMENTS: (id) => `/api/examples/${id}/comments`,
  ATTACHMENTS: (id) => `/api/examples/${id}/attachments`,
};

// Константы для полей сортировки
export const EXAMPLE_SORT_FIELDS = {
  TITLE: 'title',
  STATUS: 'status',
  PRIORITY: 'priority',
  TYPE: 'type',
  CATEGORY: 'category',
  CREATED_AT: 'createdAt',
  UPDATED_AT: 'updatedAt',
  DUE_DATE: 'dueDate',
};

// Константы для направлений сортировки
export const SORT_DIRECTIONS = {
  ASC: 'asc',
  DESC: 'desc',
};

// Константы для лимитов пагинации
export const PAGINATION_LIMITS = [10, 25, 50, 100];

// Экспорт всех типов и констант
export default {
  ExampleStatus,
  ExamplePriority,
  ExampleType,
  ExampleCategory,
  EXAMPLE_ACTION_TYPES,
  EXAMPLE_API_ENDPOINTS,
  EXAMPLE_SORT_FIELDS,
  SORT_DIRECTIONS,
  PAGINATION_LIMITS,
};