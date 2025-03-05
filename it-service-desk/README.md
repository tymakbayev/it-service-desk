# IT Service Desk

IT Service Desk — это полнофункциональное веб-приложение для управления инцидентами и оборудованием в IT-инфраструктуре организации. Система предоставляет комплексное решение для отслеживания инцидентов, управления оборудованием, генерации отчетов и аналитики.

![IT Service Desk](https://via.placeholder.com/800x400?text=IT+Service+Desk)

## Основные возможности

- **Система ролей и авторизации**: Три уровня доступа (Администратор, Техник, Пользователь)
- **Управление инцидентами**: Создание, отслеживание и разрешение IT-инцидентов
- **Учет оборудования**: Полный контроль над IT-активами организации
- **Аналитическая панель**: Визуализация ключевых метрик и показателей
- **Система уведомлений**: Мгновенные уведомления о важных событиях
- **Генерация отчетов**: Создание отчетов в различных форматах (PDF, Excel, CSV)
- **Безопасная аутентификация**: JWT-токены для защиты API

## Технологический стек

### Frontend
- React.js
- Redux Toolkit для управления состоянием
- React Router для навигации
- Axios для HTTP-запросов
- Socket.io-client для веб-сокетов
- Chart.js для визуализации данных
- Formik и Yup для валидации форм
- Styled-components для стилизации

### Backend
- Node.js с Express
- MongoDB с Mongoose ORM
- JWT для аутентификации
- Socket.io для реального времени
- Winston для логирования
- Nodemailer для отправки email
- PDFKit и XLSX для генерации отчетов
- Jest для тестирования

## Требования

- Node.js 14.x или выше
- MongoDB 4.x или выше
- npm 6.x или выше

## Установка и настройка

### Клонирование репозитория

```bash
git clone https://github.com/yourusername/it-service-desk.git
cd it-service-desk
```

### Настройка переменных окружения

1. Создайте файлы `.env` в директориях `server` и `client` на основе предоставленных примеров:

```bash
cp .env.example .env
cp server/.env.example server/.env
cp client/.env.example client/.env
```

2. Отредактируйте файлы `.env` в соответствии с вашей конфигурацией

#### Пример содержимого `server/.env`:

```
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/it-service-desk

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASS=your_email_password
EMAIL_FROM=support@it-service-desk.com

# WebSocket Configuration
WS_PORT=5001
```

#### Пример содержимого `client/.env`:

```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_WS_URL=http://localhost:5001
REACT_APP_VERSION=$npm_package_version
```

### Установка зависимостей

```bash
# Установка зависимостей для корневого проекта
npm install

# Установка зависимостей для серверной части
cd server
npm install

# Установка зависимостей для клиентской части
cd ../client
npm install
```

### Запуск приложения

#### Режим разработки

```bash
# Запуск серверной части
cd server
npm run dev

# Запуск клиентской части (в отдельном терминале)
cd client
npm start
```

#### Режим производства

```bash
# Сборка клиентской части
cd client
npm run build

# Запуск серверной части в производственном режиме
cd ../server
npm start
```

### Запуск с использованием Docker

```bash
# Сборка и запуск контейнеров
docker-compose up -d

# Остановка контейнеров
docker-compose down
```

## Структура проекта

```
it-service-desk/
├── client/                     # Клиентская часть (React)
│   ├── public/                 # Статические файлы
│   └── src/                    # Исходный код React
│       ├── assets/             # Изображения, шрифты и т.д.
│       ├── components/         # Общие компоненты
│       │   └── common/         # Переиспользуемые UI компоненты
│       ├── hooks/              # Пользовательские React хуки
│       ├── modules/            # Модули приложения
│       │   ├── auth/           # Модуль аутентификации
│       │   ├── dashboard/      # Модуль дашборда
│       │   ├── equipment/      # Модуль оборудования
│       │   ├── incidents/      # Модуль инцидентов
│       │   ├── notifications/  # Модуль уведомлений
│       │   └── reports/        # Модуль отчетов
│       ├── services/           # Сервисы
│       │   ├── api/            # API клиенты
│       │   └── websocket/      # WebSocket клиенты
│       ├── store/              # Redux хранилище
│       └── utils/              # Утилиты и хелперы
├── server/                     # Серверная часть (Node.js)
│   ├── config/                 # Конфигурация сервера
│   ├── controllers/            # Контроллеры API
│   ├── middleware/             # Промежуточные обработчики
│   ├── models/                 # Mongoose модели
│   ├── routes/                 # Маршруты API
│   ├── services/               # Бизнес-логика
│   ├── tests/                  # Тесты
│   └── utils/                  # Утилиты и хелперы
└── docker-compose.yml          # Docker Compose конфигурация
```

## API Документация

### Аутентификация

#### Регистрация пользователя
```
POST /api/auth/register
```

**Тело запроса:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "username": "johndoe",
  "firstName": "John",
  "lastName": "Doe",
  "role": "USER",
  "department": "IT",
  "position": "Developer"
}
```

**Ответ:**
```json
{
  "user": {
    "id": "60d21b4667d0d8992e610c85",
    "email": "user@example.com",
    "username": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "role": "USER",
    "department": "IT",
    "position": "Developer",
    "createdAt": "2023-06-22T10:00:00.000Z",
    "updatedAt": "2023-06-22T10:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Вход в систему
```
POST /api/auth/login
```

**Тело запроса:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Ответ:**
```json
{
  "user": {
    "id": "60d21b4667d0d8992e610c85",
    "email": "user@example.com",
    "username": "johndoe",
    "role": "USER",
    "firstName": "John",
    "lastName": "Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Получение данных текущего пользователя
```
GET /api/auth/me
```

**Заголовки:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Ответ:**
```json
{
  "user": {
    "id": "60d21b4667d0d8992e610c85",
    "email": "user@example.com",
    "username": "johndoe",
    "role": "USER",
    "firstName": "John",
    "lastName": "Doe",
    "department": "IT",
    "position": "Developer"
  }
}
```

### Инциденты

#### Получение списка инцидентов
```
GET /api/incidents
```

**Параметры запроса:**
```
status=OPEN,IN_PROGRESS
priority=HIGH,MEDIUM
page=1
limit=10
sortBy=createdAt
sortOrder=desc
```

**Ответ:**
```json
{
  "incidents": [
    {
      "id": "60d21b4667d0d8992e610c85",
      "title": "Network connectivity issue",
      "description": "Unable to connect to the internet",
      "status": "OPEN",
      "priority": "HIGH",
      "assignedTo": {
        "id": "60d21b4667d0d8992e610c86",
        "username": "techsupport"
      },
      "createdBy": {
        "id": "60d21b4667d0d8992e610c87",
        "username": "johndoe"
      },
      "createdAt": "2023-06-22T10:00:00.000Z",
      "updatedAt": "2023-06-22T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 10,
    "pages": 5
  }
}
```

#### Создание инцидента
```
POST /api/incidents
```

**Тело запроса:**
```json
{
  "title": "Software installation request",
  "description": "Need to install Adobe Photoshop on my workstation",
  "priority": "MEDIUM",
  "equipmentId": "60d21b4667d0d8992e610c88",
  "attachments": []
}
```

**Ответ:**
```json
{
  "id": "60d21b4667d0d8992e610c89",
  "title": "Software installation request",
  "description": "Need to install Adobe Photoshop on my workstation",
  "status": "OPEN",
  "priority": "MEDIUM",
  "equipmentId": "60d21b4667d0d8992e610c88",
  "createdBy": {
    "id": "60d21b4667d0d8992e610c87",
    "username": "johndoe"
  },
  "createdAt": "2023-06-22T10:00:00.000Z",
  "updatedAt": "2023-06-22T10:00:00.000Z"
}
```

### Оборудование

#### Получение списка оборудования
```
GET /api/equipment
```

**Параметры запроса:**
```
type=LAPTOP,DESKTOP
status=ACTIVE,MAINTENANCE
department=IT,MARKETING
page=1
limit=10
```

**Ответ:**
```json
{
  "equipment": [
    {
      "id": "60d21b4667d0d8992e610c90",
      "name": "Dell XPS 15",
      "type": "LAPTOP",
      "serialNumber": "DXPS15-2023-001",
      "status": "ACTIVE",
      "purchaseDate": "2022-01-15T00:00:00.000Z",
      "assignedTo": {
        "id": "60d21b4667d0d8992e610c87",
        "username": "johndoe"
      },
      "department": "IT",
      "location": "HQ - Floor 2",
      "specifications": {
        "cpu": "Intel i7-11800H",
        "ram": "32GB",
        "storage": "1TB SSD",
        "os": "Windows 11 Pro"
      },
      "createdAt": "2023-06-22T10:00:00.000Z",
      "updatedAt": "2023-06-22T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 120,
    "page": 1,
    "limit": 10,
    "pages": 12
  }
}
```

### Отчеты

#### Генерация отчета
```
POST /api/reports/generate
```

**Тело запроса:**
```json
{
  "type": "incidents",
  "format": "pdf",
  "title": "Monthly Incident Report",
  "filters": {
    "startDate": "2023-06-01",
    "endDate": "2023-06-30",
    "status": ["OPEN", "IN_PROGRESS", "RESOLVED"],
    "priority": ["HIGH", "MEDIUM"]
  },
  "includeCharts": true,
  "groupBy": "status"
}
```

**Ответ:**
```json
{
  "reportUrl": "/api/reports/download/report-60d21b4667d0d8992e610c91.pdf",
  "reportOptions": {
    "type": "incidents",
    "format": "pdf",
    "title": "Monthly Incident Report",
    "filters": {
      "startDate": "2023-06-01",
      "endDate": "2023-06-30",
      "status": ["OPEN", "IN_PROGRESS", "RESOLVED"],
      "priority": ["HIGH", "MEDIUM"]
    },
    "includeCharts": true,
    "groupBy": "status"
  }
}
```

### Дашборд

#### Получение статистики
```
GET /api/dashboard/statistics
```

**Ответ:**
```json
{
  "incidents": {
    "total": 145,
    "open": 35,
    "inProgress": 42,
    "resolved": 68,
    "byPriority": {
      "HIGH": 28,
      "MEDIUM": 67,
      "LOW": 50
    }
  },
  "equipment": {
    "total": 230,
    "active": 198,
    "maintenance": 22,
    "retired": 10,
    "byType": {
      "LAPTOP": 120,
      "DESKTOP": 80,
      "PRINTER": 15,
      "SERVER": 10,
      "NETWORK": 5
    }
  },
  "performance": {
    "averageResolutionTime": 18.5,
    "resolutionTimeByPriority": {
      "HIGH": 8.2,
      "MEDIUM": 24.7,
      "LOW": 36.3
    }
  }
}
```

## Примеры использования

### Аутентификация пользователя

```javascript
import { useDispatch } from 'react-redux';
import { AuthModule } from './modules/auth';
import { useState } from 'react';

const LoginPage = () => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await dispatch(AuthModule.login(email, password));
      // Перенаправление на дашборд после успешной авторизации
      window.location.href = '/dashboard';
    } catch (err) {
      setError('Неверные учетные данные');
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <div>
        <label>Email:</label>
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
      </div>
      <div>
        <label>Password:</label>
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
      </div>
      {error && <div className="error">{error}</div>}
      <button type="submit">Login</button>
    </form>
  );
};
```

### Создание инцидента

```javascript
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createIncident } from './modules/incidents/incidentThunks';

const CreateIncidentForm = () => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    equipmentId: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(createIncident(formData));
      alert('Инцидент успешно создан!');
      // Сброс формы
      setFormData({
        title: '',
        description: '',
        priority: 'MEDIUM',
        equipmentId: '',
      });
    } catch (error) {
      alert('Ошибка при создании инцидента');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Заголовок:</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Описание:</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Приоритет:</label>
        <select
          name="priority"
          value={formData.priority}
          onChange={handleChange}
        >
          <option value="LOW">Низкий</option>
          <option value="MEDIUM">Средний</option>
          <option value="HIGH">Высокий</option>
        </select>
      </div>
      <div>
        <label>ID оборудования (опционально):</label>
        <input
          type="text"
          name="equipmentId"
          value={formData.equipmentId}
          onChange={handleChange}
        />
      </div>
      <button type="submit">Создать инцидент</button>
    </form>
  );
};
```

### Генерация отчета

```javascript
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { ReportModule } from './modules/reports';
import { ReportType, ReportFormat } from './modules/reports/reportTypes';

const GenerateReportForm = () => {
  const dispatch = useDispatch();
  const [reportOptions, setReportOptions] = useState({
    type: ReportType.INCIDENTS,
    format: ReportFormat.PDF,
    title: 'Отчет по инцидентам',
    filters: {
      startDate: '',
      endDate: '',
      status: [],
      priority: []
    },
    includeCharts: true
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setReportOptions(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setReportOptions(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        [name]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(ReportModule.generateReport(reportOptions));
      alert('Отчет успешно сгенерирован!');
    } catch (error) {
      alert('Ошибка при генерации отчета');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Тип отчета:</label>
        <select
          name="type"
          value={reportOptions.type}
          onChange={handleChange}
        >
          <option value={ReportType.INCIDENTS}>Инциденты</option>
          <option value={ReportType.EQUIPMENT}>Оборудование</option>
          <option value={ReportType.USERS}>Пользователи</option>
          <option value={ReportType.PERFORMANCE}>Производительность</option>
        </select>
      </div>
      <div>
        <label>Формат:</label>
        <select
          name="format"
          value={reportOptions.format}
          onChange={handleChange}
        >
          <option value={ReportFormat.PDF}>PDF</option>
          <option value={ReportFormat.EXCEL}>Excel</option>
          <option value={ReportFormat.CSV}>CSV</option>
        </select>
      </div>
      <div>
        <label>Заголовок отчета:</label>
        <input
          type="text"
          name="title"
          value={reportOptions.title}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Дата начала:</label>
        <input
          type="date"
          name="startDate"
          value={reportOptions.filters.startDate}
          onChange={handleFilterChange}
        />
      </div>
      <div>
        <label>Дата окончания:</label>
        <input
          type="date"
          name="endDate"
          value={reportOptions.filters.endDate}
          onChange={handleFilterChange}
        />
      </div>
      <div>
        <label>Включить диаграммы:</label>
        <input
          type="checkbox"
          name="includeCharts"
          checked={reportOptions.includeCharts}
          onChange={(e) => setReportOptions(prev => ({
            ...prev,
            includeCharts: e.target.checked
          }))}
        />
      </div>
      <button type="submit">Сгенерировать отчет</button>
    </form>
  );
};
```

## Руководство по разработке

### Добавление нового API-эндпоинта

1. Создайте контроллер в директории `server/controllers`
2. Добавьте маршрут в соответствующий файл в директории `server/routes`
3. Зарегистрируйте маршрут в `server/routes/index.js`

Пример контроллера:

```javascript
// server/controllers/example.controller.js
const Example = require('../models/example.model');

exports.getAll = async (req, res, next) => {
  try {
    const examples = await Example.find();
    res.status(200).json({ examples });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const example = new Example(req.body);
    await example.save();
    res.status(201).json(example);
  } catch (error) {
    next(error);
  }
};
```

Пример маршрута:

```javascript
// server/routes/example.routes.js
const express = require('express');
const router = express.Router();
const exampleController = require('../controllers/example.controller');
const { authMiddleware } = require('../middleware');

router.get('/', authMiddleware, exampleController.getAll);
router.post('/', authMiddleware, exampleController.create);

module.exports = router;
```

Регистрация маршрута:

```javascript
// server/routes/index.js
const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const incidentRoutes = require('./incident.routes');
const equipmentRoutes = require('./equipment.routes');
const exampleRoutes = require('./example.routes'); // Добавлено

router.use('/auth', authRoutes);
router.use('/incidents', incidentRoutes);
router.use('/equipment', equipmentRoutes);
router.use('/examples', exampleRoutes); // Добавлено

module.exports = router;
```

### Добавление нового модуля на клиенте

1. Создайте структуру директорий в `client/src/modules/[module_name]`
2. Создайте типы, slice, thunks и компоненты
3. Добавьте reducer в корневой reducer

Пример структуры модуля:

```
client/src/modules/example/
├── components/
│   ├── ExampleForm.jsx
│   └── ExampleList.jsx
├── pages/
│   └── ExamplePage.jsx
├── store/
│   ├── exampleSlice.js
│   └── exampleThunks.js
├── exampleTypes.js
└── index.js
```

Пример slice:

```javascript
// client/src/modules/example/store/exampleSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  examples: [],
  loading: false,
  error: null
};

const exampleSlice = createSlice({
  name: 'examples',
  initialState,
  reducers: {
    fetchExamplesStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchExamplesSuccess: (state, action) => {
      state.examples = action.payload;
      state.loading = false;
    },
    fetchExamplesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    }
  }
});

export const {
  fetchExamplesStart,
  fetchExamplesSuccess,
  fetchExamplesFailure
} = exampleSlice.actions;

export default exampleSlice.reducer;
```

Добавление в корневой reducer:

```javascript
// client/src/store/rootReducer.js
import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../modules/auth/store/authSlice';
import incidentsReducer from '../modules/incidents/store/incidentsSlice';
import equipmentReducer from '../modules/equipment/store/equipmentSlice';
import exampleReducer from '../modules/example/store/exampleSlice'; // Добавлено

const rootReducer = combineReducers({
  auth: authReducer,
  incidents: incidentsReducer,
  equipment: equipmentReducer,
  examples: exampleReducer // Добавлено
});

export default rootReducer;
```

## Тестирование

### Запуск тестов

```bash
# Запуск тестов серверной части
cd server
npm test

# Запуск тестов с покрытием
npm run test:coverage

# Запуск тестов клиентской части
cd client
npm test
```

### Пример теста API

```javascript
// server/tests/auth.test.js
const request = require('supertest');
const app = require('../app');
const User = require('../models/user.model');
const mongoose = require('mongoose');

describe('Auth API', () => {
  beforeAll(async () => {
    // Подключение к тестовой базе данных
    await mongoose.connect(process.env.MONGODB_URI_TEST);
  });

  afterAll(async () => {
    // Отключение от базы данных
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Очистка коллекции пользователей перед каждым тестом
    await User.deleteMany({});
  });

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('email', 'test@example.com');
  });

  it('should login an existing user', async () => {
    // Создание пользователя
    await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser'
      });

    // Логин
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('email', 'test@example.com');
  });
});
```

## Развертывание

### Подготовка к производству

1. Соберите клиентскую часть:
```bash
cd client
npm run build
```

2. Настройте переменные окружения для производства:
```bash
# server/.env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
```

3. Запустите сервер:
```bash
cd server
npm start
```

### Развертывание с использованием Docker

1. Соберите и запустите контейнеры:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Вклад в проект

1. Форкните репозиторий
2. Создайте ветку для вашей функции (`git checkout -b feature/amazing-feature`)
3. Зафиксируйте ваши изменения (`git commit -m 'Add some amazing feature'`)
4. Отправьте ветку (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## Лицензия

Этот проект лицензирован под MIT License - см. файл [LICENSE](LICENSE) для деталей.

## Контакты

Имя Автора - [ваш-email@example.com](mailto:ваш-email@example.com)

Ссылка на проект: [https://github.com/yourusername/it-service-desk](https://github.com/yourusername/it-service-desk)