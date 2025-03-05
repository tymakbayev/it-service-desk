const Joi = require('joi');
const { ValidationError } = require('../utils/errors');
const constants = require('../utils/constants');

/**
 * Middleware для валидации данных запроса с использованием Joi схем
 * 
 * @param {Object} schema - Объект с Joi схемами для различных частей запроса
 * @param {Object} schema.body - Joi схема для валидации req.body
 * @param {Object} schema.query - Joi схема для валидации req.query
 * @param {Object} schema.params - Joi схема для валидации req.params
 * @param {Object} options - Опции валидации
 * @param {boolean} options.stripUnknown - Удалять неизвестные поля (по умолчанию true)
 * @param {boolean} options.abortEarly - Прерывать валидацию при первой ошибке (по умолчанию false)
 * @returns {Function} Express middleware функция
 */
const validate = (schema, options = {}) => {
  // Настройки валидации по умолчанию
  const validationOptions = {
    stripUnknown: true,
    abortEarly: false,
    ...options
  };

  return (req, res, next) => {
    const validationErrors = {};
    let hasError = false;

    // Валидация тела запроса (req.body)
    if (schema.body) {
      const { error, value } = schema.body.validate(req.body, validationOptions);
      if (error) {
        hasError = true;
        validationErrors.body = formatJoiErrors(error);
      } else {
        req.body = value;
      }
    }

    // Валидация параметров запроса (req.params)
    if (schema.params) {
      const { error, value } = schema.params.validate(req.params, validationOptions);
      if (error) {
        hasError = true;
        validationErrors.params = formatJoiErrors(error);
      } else {
        req.params = value;
      }
    }

    // Валидация строки запроса (req.query)
    if (schema.query) {
      const { error, value } = schema.query.validate(req.query, validationOptions);
      if (error) {
        hasError = true;
        validationErrors.query = formatJoiErrors(error);
      } else {
        req.query = value;
      }
    }

    // Валидация файлов (req.files или req.file)
    if (schema.files && req.files) {
      const { error, value } = schema.files.validate(req.files, validationOptions);
      if (error) {
        hasError = true;
        validationErrors.files = formatJoiErrors(error);
      }
    } else if (schema.file && req.file) {
      const { error, value } = schema.file.validate(req.file, validationOptions);
      if (error) {
        hasError = true;
        validationErrors.file = formatJoiErrors(error);
      }
    }

    // Если есть ошибки валидации, возвращаем ответ с ошибками
    if (hasError) {
      return res.status(constants.HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          message: 'Ошибка валидации данных',
          details: validationErrors
        }
      });
    }

    // Если валидация прошла успешно, продолжаем выполнение запроса
    next();
  };
};

/**
 * Форматирует ошибки валидации Joi в более удобный для клиента формат
 * 
 * @param {Object} error - Объект ошибки Joi
 * @returns {Object} Отформатированные ошибки
 */
const formatJoiErrors = (error) => {
  const formattedErrors = {};
  
  if (error.details && Array.isArray(error.details)) {
    error.details.forEach((detail) => {
      const path = detail.path.join('.');
      formattedErrors[path] = detail.message.replace(/['"]/g, '');
    });
  }
  
  return formattedErrors;
};

/**
 * Предопределенные схемы валидации для общих сценариев
 */
const schemas = {
  // Схемы для аутентификации
  auth: {
    login: Joi.object({
      email: Joi.string().email().required().messages({
        'string.email': 'Введите корректный email адрес',
        'string.empty': 'Email не может быть пустым',
        'any.required': 'Email обязателен для входа'
      }),
      password: Joi.string().min(6).required().messages({
        'string.min': 'Пароль должен содержать минимум {#limit} символов',
        'string.empty': 'Пароль не может быть пустым',
        'any.required': 'Пароль обязателен для входа'
      })
    }),
    
    register: Joi.object({
      username: Joi.string().min(3).max(30).required().messages({
        'string.min': 'Имя пользователя должно содержать минимум {#limit} символа',
        'string.max': 'Имя пользователя не должно превышать {#limit} символов',
        'string.empty': 'Имя пользователя не может быть пустым',
        'any.required': 'Имя пользователя обязательно'
      }),
      email: Joi.string().email().required().messages({
        'string.email': 'Введите корректный email адрес',
        'string.empty': 'Email не может быть пустым',
        'any.required': 'Email обязателен'
      }),
      password: Joi.string().min(6).required().messages({
        'string.min': 'Пароль должен содержать минимум {#limit} символов',
        'string.empty': 'Пароль не может быть пустым',
        'any.required': 'Пароль обязателен'
      }),
      confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
        'any.only': 'Пароли не совпадают',
        'string.empty': 'Подтверждение пароля не может быть пустым',
        'any.required': 'Подтверждение пароля обязательно'
      }),
      role: Joi.string().valid('user', 'technician', 'admin').default('user').messages({
        'any.only': 'Недопустимая роль'
      })
    }),
    
    forgotPassword: Joi.object({
      email: Joi.string().email().required().messages({
        'string.email': 'Введите корректный email адрес',
        'string.empty': 'Email не может быть пустым',
        'any.required': 'Email обязателен'
      })
    }),
    
    resetPassword: Joi.object({
      password: Joi.string().min(6).required().messages({
        'string.min': 'Пароль должен содержать минимум {#limit} символов',
        'string.empty': 'Пароль не может быть пустым',
        'any.required': 'Пароль обязателен'
      }),
      confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
        'any.only': 'Пароли не совпадают',
        'string.empty': 'Подтверждение пароля не может быть пустым',
        'any.required': 'Подтверждение пароля обязательно'
      }),
      token: Joi.string().required().messages({
        'string.empty': 'Токен сброса пароля не может быть пустым',
        'any.required': 'Токен сброса пароля обязателен'
      })
    }),
    
    updateProfile: Joi.object({
      username: Joi.string().min(3).max(30).messages({
        'string.min': 'Имя пользователя должно содержать минимум {#limit} символа',
        'string.max': 'Имя пользователя не должно превышать {#limit} символов',
        'string.empty': 'Имя пользователя не может быть пустым'
      }),
      email: Joi.string().email().messages({
        'string.email': 'Введите корректный email адрес',
        'string.empty': 'Email не может быть пустым'
      }),
      currentPassword: Joi.string().min(6).messages({
        'string.min': 'Текущий пароль должен содержать минимум {#limit} символов',
        'string.empty': 'Текущий пароль не может быть пустым'
      }),
      newPassword: Joi.string().min(6).messages({
        'string.min': 'Новый пароль должен содержать минимум {#limit} символов',
        'string.empty': 'Новый пароль не может быть пустым'
      }),
      confirmNewPassword: Joi.string().valid(Joi.ref('newPassword')).messages({
        'any.only': 'Пароли не совпадают',
        'string.empty': 'Подтверждение пароля не может быть пустым'
      })
    }).with('newPassword', ['currentPassword', 'confirmNewPassword'])
  },
  
  // Схемы для инцидентов
  incidents: {
    create: Joi.object({
      title: Joi.string().min(5).max(100).required().messages({
        'string.min': 'Заголовок должен содержать минимум {#limit} символов',
        'string.max': 'Заголовок не должен превышать {#limit} символов',
        'string.empty': 'Заголовок не может быть пустым',
        'any.required': 'Заголовок обязателен'
      }),
      description: Joi.string().min(10).max(1000).required().messages({
        'string.min': 'Описание должно содержать минимум {#limit} символов',
        'string.max': 'Описание не должно превышать {#limit} символов',
        'string.empty': 'Описание не может быть пустым',
        'any.required': 'Описание обязательно'
      }),
      priority: Joi.string().valid('low', 'medium', 'high', 'critical').required().messages({
        'any.only': 'Недопустимый приоритет',
        'string.empty': 'Приоритет не может быть пустым',
        'any.required': 'Приоритет обязателен'
      }),
      category: Joi.string().required().messages({
        'string.empty': 'Категория не может быть пустой',
        'any.required': 'Категория обязательна'
      }),
      assignedTo: Joi.string().allow(null, '').messages({
        'string.base': 'Некорректный ID назначенного сотрудника'
      }),
      equipmentId: Joi.string().allow(null, '').messages({
        'string.base': 'Некорректный ID оборудования'
      }),
      attachments: Joi.array().items(Joi.string())
    }),
    
    update: Joi.object({
      title: Joi.string().min(5).max(100).messages({
        'string.min': 'Заголовок должен содержать минимум {#limit} символов',
        'string.max': 'Заголовок не должен превышать {#limit} символов',
        'string.empty': 'Заголовок не может быть пустым'
      }),
      description: Joi.string().min(10).max(1000).messages({
        'string.min': 'Описание должно содержать минимум {#limit} символов',
        'string.max': 'Описание не должно превышать {#limit} символов',
        'string.empty': 'Описание не может быть пустым'
      }),
      priority: Joi.string().valid('low', 'medium', 'high', 'critical').messages({
        'any.only': 'Недопустимый приоритет',
        'string.empty': 'Приоритет не может быть пустым'
      }),
      status: Joi.string().valid('new', 'in_progress', 'on_hold', 'resolved', 'closed').messages({
        'any.only': 'Недопустимый статус',
        'string.empty': 'Статус не может быть пустым'
      }),
      category: Joi.string().messages({
        'string.empty': 'Категория не может быть пустой'
      }),
      assignedTo: Joi.string().allow(null, '').messages({
        'string.base': 'Некорректный ID назначенного сотрудника'
      }),
      resolution: Joi.string().allow(null, '').max(1000).messages({
        'string.max': 'Решение не должно превышать {#limit} символов'
      }),
      attachments: Joi.array().items(Joi.string())
    }),
    
    comment: Joi.object({
      text: Joi.string().min(1).max(500).required().messages({
        'string.min': 'Комментарий должен содержать минимум {#limit} символ',
        'string.max': 'Комментарий не должен превышать {#limit} символов',
        'string.empty': 'Комментарий не может быть пустым',
        'any.required': 'Текст комментария обязателен'
      }),
      attachments: Joi.array().items(Joi.string())
    }),
    
    filter: Joi.object({
      status: Joi.string().valid('new', 'in_progress', 'on_hold', 'resolved', 'closed', 'all'),
      priority: Joi.string().valid('low', 'medium', 'high', 'critical', 'all'),
      category: Joi.string(),
      assignedTo: Joi.string(),
      createdBy: Joi.string(),
      startDate: Joi.date().iso(),
      endDate: Joi.date().iso().min(Joi.ref('startDate')).messages({
        'date.min': 'Дата окончания должна быть позже даты начала'
      }),
      search: Joi.string(),
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      sortBy: Joi.string().valid('createdAt', 'updatedAt', 'priority', 'status').default('createdAt'),
      sortOrder: Joi.string().valid('asc', 'desc').default('desc')
    })
  },
  
  // Схемы для оборудования
  equipment: {
    create: Joi.object({
      name: Joi.string().min(2).max(100).required().messages({
        'string.min': 'Название должно содержать минимум {#limit} символа',
        'string.max': 'Название не должно превышать {#limit} символов',
        'string.empty': 'Название не может быть пустым',
        'any.required': 'Название обязательно'
      }),
      type: Joi.string().required().messages({
        'string.empty': 'Тип оборудования не может быть пустым',
        'any.required': 'Тип оборудования обязателен'
      }),
      serialNumber: Joi.string().allow('').max(50).messages({
        'string.max': 'Серийный номер не должен превышать {#limit} символов'
      }),
      inventoryNumber: Joi.string().max(50).messages({
        'string.empty': 'Инвентарный номер не может быть пустым',
        'string.max': 'Инвентарный номер не должен превышать {#limit} символов'
      }),
      location: Joi.string().allow('').max(100).messages({
        'string.max': 'Местоположение не должно превышать {#limit} символов'
      }),
      purchaseDate: Joi.date().iso().allow(null).messages({
        'date.base': 'Некорректная дата приобретения'
      }),
      warrantyExpiration: Joi.date().iso().allow(null).messages({
        'date.base': 'Некорректная дата окончания гарантии'
      }),
      status: Joi.string().valid('available', 'in_use', 'under_repair', 'decommissioned').default('available').messages({
        'any.only': 'Недопустимый статус оборудования'
      }),
      assignedTo: Joi.string().allow(null, '').messages({
        'string.base': 'Некорректный ID пользователя'
      }),
      specifications: Joi.object().allow(null),
      notes: Joi.string().allow('').max(1000).messages({
        'string.max': 'Примечания не должны превышать {#limit} символов'
      }),
      attachments: Joi.array().items(Joi.string())
    }),
    
    update: Joi.object({
      name: Joi.string().min(2).max(100).messages({
        'string.min': 'Название должно содержать минимум {#limit} символа',
        'string.max': 'Название не должно превышать {#limit} символов',
        'string.empty': 'Название не может быть пустым'
      }),
      type: Joi.string().messages({
        'string.empty': 'Тип оборудования не может быть пустым'
      }),
      serialNumber: Joi.string().allow('').max(50).messages({
        'string.max': 'Серийный номер не должен превышать {#limit} символов'
      }),
      inventoryNumber: Joi.string().max(50).messages({
        'string.empty': 'Инвентарный номер не может быть пустым',
        'string.max': 'Инвентарный номер не должен превышать {#limit} символов'
      }),
      location: Joi.string().allow('').max(100).messages({
        'string.max': 'Местоположение не должно превышать {#limit} символов'
      }),
      purchaseDate: Joi.date().iso().allow(null).messages({
        'date.base': 'Некорректная дата приобретения'
      }),
      warrantyExpiration: Joi.date().iso().allow(null).messages({
        'date.base': 'Некорректная дата окончания гарантии'
      }),
      status: Joi.string().valid('available', 'in_use', 'under_repair', 'decommissioned').messages({
        'any.only': 'Недопустимый статус оборудования'
      }),
      assignedTo: Joi.string().allow(null, '').messages({
        'string.base': 'Некорректный ID пользователя'
      }),
      specifications: Joi.object().allow(null),
      notes: Joi.string().allow('').max(1000).messages({
        'string.max': 'Примечания не должны превышать {#limit} символов'
      }),
      attachments: Joi.array().items(Joi.string())
    }),
    
    filter: Joi.object({
      type: Joi.string(),
      status: Joi.string().valid('available', 'in_use', 'under_repair', 'decommissioned', 'all'),
      location: Joi.string(),
      assignedTo: Joi.string(),
      search: Joi.string(),
      warrantyValid: Joi.boolean(),
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      sortBy: Joi.string().valid('name', 'type', 'status', 'purchaseDate', 'warrantyExpiration').default('name'),
      sortOrder: Joi.string().valid('asc', 'desc').default('asc')
    })
  },
  
  // Схемы для отчетов
  reports: {
    generate: Joi.object({
      type: Joi.string().valid('incidents', 'equipment', 'performance').required().messages({
        'any.only': 'Недопустимый тип отчета',
        'string.empty': 'Тип отчета не может быть пустым',
        'any.required': 'Тип отчета обязателен'
      }),
      format: Joi.string().valid('pdf', 'excel', 'csv').required().messages({
        'any.only': 'Недопустимый формат отчета',
        'string.empty': 'Формат отчета не может быть пустым',
        'any.required': 'Формат отчета обязателен'
      }),
      startDate: Joi.date().iso().required().messages({
        'date.base': 'Некорректная дата начала',
        'any.required': 'Дата начала обязательна'
      }),
      endDate: Joi.date().iso().min(Joi.ref('startDate')).required().messages({
        'date.base': 'Некорректная дата окончания',
        'date.min': 'Дата окончания должна быть позже даты начала',
        'any.required': 'Дата окончания обязательна'
      }),
      filters: Joi.object({
        status: Joi.array().items(Joi.string()),
        priority: Joi.array().items(Joi.string()),
        category: Joi.array().items(Joi.string()),
        assignedTo: Joi.array().items(Joi.string()),
        equipmentType: Joi.array().items(Joi.string()),
        location: Joi.array().items(Joi.string())
      }),
      includeCharts: Joi.boolean().default(true),
      title: Joi.string().max(100).messages({
        'string.max': 'Название отчета не должно превышать {#limit} символов'
      }),
      description: Joi.string().max(500).messages({
        'string.max': 'Описание отчета не должно превышать {#limit} символов'
      })
    })
  },
  
  // Схемы для уведомлений
  notifications: {
    update: Joi.object({
      read: Joi.boolean().required().messages({
        'boolean.base': 'Статус прочтения должен быть логическим значением',
        'any.required': 'Статус прочтения обязателен'
      })
    }),
    
    settings: Joi.object({
      email: Joi.object({
        enabled: Joi.boolean().required(),
        incidents: Joi.boolean().required(),
        equipment: Joi.boolean().required(),
        system: Joi.boolean().required()
      }).required(),
      inApp: Joi.object({
        enabled: Joi.boolean().required(),
        incidents: Joi.boolean().required(),
        equipment: Joi.boolean().required(),
        system: Joi.boolean().required()
      }).required()
    })
  },
  
  // Схемы для ID параметров
  params: {
    id: Joi.object({
      id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
        'string.pattern.base': 'Некорректный формат ID',
        'string.empty': 'ID не может быть пустым',
        'any.required': 'ID обязателен'
      })
    })
  },
  
  // Схемы для пагинации
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1).messages({
      'number.base': 'Номер страницы должен быть числом',
      'number.integer': 'Номер страницы должен быть целым числом',
      'number.min': 'Номер страницы должен быть не меньше {#limit}'
    }),
    limit: Joi.number().integer().min(1).max(100).default(10).messages({
      'number.base': 'Лимит должен быть числом',
      'number.integer': 'Лимит должен быть целым числом',
      'number.min': 'Лимит должен быть не меньше {#limit}',
      'number.max': 'Лимит не должен превышать {#limit}'
    }),
    sortBy: Joi.string().messages({
      'string.empty': 'Поле сортировки не может быть пустым'
    }),
    sortOrder: Joi.string().valid('asc', 'desc').default('asc').messages({
      'any.only': 'Порядок сортировки должен быть "asc" или "desc"'
    })
  })
};

/**
 * Создает пользовательскую ошибку валидации
 * 
 * @param {string} message - Сообщение об ошибке
 * @param {Object} details - Детали ошибки
 * @returns {Error} Объект ошибки
 */
const createValidationError = (message, details) => {
  return new ValidationError(message, details);
};

module.exports = {
  validate,
  schemas,
  createValidationError,
  formatJoiErrors
};