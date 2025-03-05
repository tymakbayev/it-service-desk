/**
 * React.js
 * 
 * Comprehensive guide to React implementation in the IT Service Desk application.
 * This file documents React patterns, best practices, and implementation details
 * used throughout the frontend codebase.
 */

// Core React imports and hooks
import React, { 
  useState, 
  useEffect, 
  useCallback, 
  useMemo, 
  useRef, 
  useContext,
  createContext,
  Suspense,
  lazy
} from 'react';

// React Router for navigation
import { 
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
  useParams,
  Link,
  NavLink,
  Outlet
} from 'react-router-dom';

// Redux for state management
import { 
  Provider, 
  useSelector, 
  useDispatch, 
  connect 
} from 'react-redux';
import { configureStore, createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Form handling and validation
import { Formik, Form, Field, ErrorMessage, useFormik } from 'formik';
import * as Yup from 'yup';

// HTTP client
import axios from 'axios';

// WebSocket client
import io from 'socket.io-client';

// Date handling
import { format, parseISO, differenceInDays, addDays } from 'date-fns';

// UI components and styling
import styled from 'styled-components';
import { toast, ToastContainer } from 'react-toastify';
import { 
  FaUser, 
  FaCog, 
  FaSignOutAlt, 
  FaBell, 
  FaExclamationTriangle,
  FaCheckCircle,
  FaInfoCircle,
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaDownload,
  FaFilter,
  FaSort,
  FaEye
} from 'react-icons/fa';

// Charts
import { Chart, registerables } from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
Chart.register(...registerables);

/**
 * Application Architecture
 * 
 * The IT Service Desk frontend follows a modular architecture with the following key patterns:
 * 
 * 1. Component Structure:
 *    - Atomic Design: Atoms, Molecules, Organisms, Templates, Pages
 *    - Common components in shared directory
 *    - Feature-specific components in module directories
 * 
 * 2. State Management:
 *    - Redux Toolkit for global state
 *    - React hooks for local component state
 *    - Context API for theme, notifications, and other cross-cutting concerns
 * 
 * 3. Routing:
 *    - React Router v6 with nested routes
 *    - Protected routes with role-based access control
 *    - Lazy-loaded components for code splitting
 * 
 * 4. API Communication:
 *    - Axios for HTTP requests
 *    - Socket.io for real-time updates
 *    - Custom hooks for data fetching and caching
 * 
 * 5. Form Handling:
 *    - Formik for form state management
 *    - Yup for schema validation
 *    - Custom form components for reusability
 */

/**
 * Component Patterns
 */

// 1. Functional Components with Hooks
const FunctionalComponent = ({ prop1, prop2 }) => {
  const [state, setState] = useState(initialState);
  
  useEffect(() => {
    // Side effect code
    return () => {
      // Cleanup code
    };
  }, [dependencies]);
  
  const handleEvent = useCallback(() => {
    // Event handler logic
  }, [dependencies]);
  
  const memoizedValue = useMemo(() => {
    // Compute derived value
    return computedValue;
  }, [dependencies]);
  
  return (
    <div>
      {/* JSX content */}
    </div>
  );
};

// 2. Custom Hooks
const useCustomHook = (param) => {
  const [state, setState] = useState(initialState);
  
  useEffect(() => {
    // Hook logic
  }, [param]);
  
  const doSomething = useCallback(() => {
    // Method logic
  }, [dependencies]);
  
  return {
    state,
    doSomething
  };
};

// 3. Context Provider Pattern
const MyContext = createContext();

const MyContextProvider = ({ children }) => {
  const [contextState, setContextState] = useState(initialState);
  
  const contextValue = useMemo(() => ({
    contextState,
    setContextState,
    // Other values and methods
  }), [contextState]);
  
  return (
    <MyContext.Provider value={contextValue}>
      {children}
    </MyContext.Provider>
  );
};

const useMyContext = () => {
  const context = useContext(MyContext);
  if (!context) {
    throw new Error('useMyContext must be used within a MyContextProvider');
  }
  return context;
};

// 4. Higher-Order Components (HOC)
const withAuth = (Component) => {
  return (props) => {
    const { isAuthenticated, userRole } = useSelector(state => state.auth);
    const navigate = useNavigate();
    
    useEffect(() => {
      if (!isAuthenticated) {
        navigate('/login', { replace: true });
      }
    }, [isAuthenticated, navigate]);
    
    if (!isAuthenticated) {
      return null;
    }
    
    return <Component {...props} userRole={userRole} />;
  };
};

// 5. Protected Route Component
const ProtectedRoute = ({ element, allowedRoles }) => {
  const { isAuthenticated, userRole } = useSelector(state => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return element;
};

/**
 * Styling Patterns
 */

// 1. Styled Components
const StyledButton = styled.button`
  background-color: ${props => props.primary ? '#4a90e2' : '#f5f5f5'};
  color: ${props => props.primary ? 'white' : '#333'};
  padding: 10px 15px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.primary ? '#357ae8' : '#e5e5e5'};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

// 2. Theme Provider
const theme = {
  colors: {
    primary: '#4a90e2',
    secondary: '#50e3c2',
    danger: '#e74c3c',
    warning: '#f39c12',
    success: '#2ecc71',
    info: '#3498db',
    light: '#f5f5f5',
    dark: '#333333',
    text: '#2d3436',
    background: '#ffffff',
  },
  fonts: {
    body: "'Roboto', sans-serif",
    heading: "'Montserrat', sans-serif",
  },
  fontSizes: {
    small: '12px',
    medium: '14px',
    large: '16px',
    xlarge: '18px',
    xxlarge: '24px',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  breakpoints: {
    xs: '0px',
    sm: '576px',
    md: '768px',
    lg: '992px',
    xl: '1200px',
    xxl: '1400px',
  },
};

/**
 * Form Handling Patterns
 */

// 1. Formik with Yup Validation
const FormExample = () => {
  const initialValues = {
    email: '',
    password: '',
  };
  
  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .required('Password is required'),
  });
  
  const handleSubmit = (values, { setSubmitting }) => {
    // Submit logic
    setSubmitting(false);
  };
  
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting }) => (
        <Form>
          <div>
            <label htmlFor="email">Email</label>
            <Field type="email" name="email" />
            <ErrorMessage name="email" component="div" className="error" />
          </div>
          
          <div>
            <label htmlFor="password">Password</label>
            <Field type="password" name="password" />
            <ErrorMessage name="password" component="div" className="error" />
          </div>
          
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </Form>
      )}
    </Formik>
  );
};

// 2. Custom Form Hook
const useForm = (initialValues, validate, onSubmit) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (isSubmitting) {
      const noErrors = Object.keys(errors).length === 0;
      if (noErrors) {
        onSubmit(values);
      }
      setIsSubmitting(false);
    }
  }, [errors, isSubmitting, onSubmit, values]);
  
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setValues(prevValues => ({
      ...prevValues,
      [name]: value
    }));
  }, []);
  
  const handleSubmit = useCallback((e) => {
    if (e) e.preventDefault();
    setErrors(validate(values));
    setIsSubmitting(true);
  }, [validate, values]);
  
  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit
  };
};

/**
 * API Communication Patterns
 */

// 1. Axios Instance
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    
    // Handle token expiration
    if (response && response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    // Handle server errors
    if (response && response.status >= 500) {
      toast.error('Server error. Please try again later.');
    }
    
    return Promise.reject(error);
  }
);

// 2. API Service
const authApi = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  register: (userData) => apiClient.post('/auth/register', userData),
  forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => apiClient.post('/auth/reset-password', { token, password }),
  getCurrentUser: () => apiClient.get('/auth/me'),
  updateProfile: (userData) => apiClient.put('/auth/profile', userData),
};

const incidentsApi = {
  getAll: (params) => apiClient.get('/incidents', { params }),
  getById: (id) => apiClient.get(`/incidents/${id}`),
  create: (incident) => apiClient.post('/incidents', incident),
  update: (id, incident) => apiClient.put(`/incidents/${id}`, incident),
  delete: (id) => apiClient.delete(`/incidents/${id}`),
  changeStatus: (id, status) => apiClient.patch(`/incidents/${id}/status`, { status }),
  assignTechnician: (id, technicianId) => apiClient.patch(`/incidents/${id}/assign`, { technicianId }),
  addComment: (id, comment) => apiClient.post(`/incidents/${id}/comments`, { comment }),
};

// 3. Custom Data Fetching Hook
const useFetch = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    let isMounted = true;
    const source = axios.CancelToken.source();
    
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(url, {
          ...options,
          cancelToken: source.token,
        });
        
        if (isMounted) {
          setData(response.data);
          setError(null);
        }
      } catch (err) {
        if (isMounted && !axios.isCancel(err)) {
          setError(err);
          setData(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    fetchData();
    
    return () => {
      isMounted = false;
      source.cancel('Component unmounted');
    };
  }, [url, JSON.stringify(options)]);
  
  return { data, loading, error, refetch: () => {} };
};

// 4. WebSocket Integration
const useWebSocket = (url) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    const newSocket = io(url, {
      auth: {
        token,
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    
    newSocket.on('connect', () => {
      setConnected(true);
      setError(null);
    });
    
    newSocket.on('disconnect', () => {
      setConnected(false);
    });
    
    newSocket.on('error', (err) => {
      setError(err);
    });
    
    setSocket(newSocket);
    
    return () => {
      newSocket.disconnect();
    };
  }, [url]);
  
  const emit = useCallback((event, data, callback) => {
    if (socket && connected) {
      socket.emit(event, data, callback);
    }
  }, [socket, connected]);
  
  const on = useCallback((event, callback) => {
    if (socket) {
      socket.on(event, callback);
      return () => socket.off(event, callback);
    }
    return () => {};
  }, [socket]);
  
  return {
    socket,
    connected,
    error,
    emit,
    on,
  };
};

/**
 * Redux Integration Patterns
 */

// 1. Redux Slice
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    loading: false,
    error: null,
  },
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      localStorage.setItem('token', token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Handle async thunks
  },
});

// 2. Async Thunks
const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.getCurrentUser();
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

// 3. Custom Redux Hooks
const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  
  const loginUser = useCallback(
    (credentials) => dispatch(login(credentials)),
    [dispatch]
  );
  
  const logoutUser = useCallback(
    () => dispatch(authSlice.actions.logout()),
    [dispatch]
  );
  
  const fetchCurrentUser = useCallback(
    () => dispatch(getCurrentUser()),
    [dispatch]
  );
  
  return {
    ...auth,
    loginUser,
    logoutUser,
    fetchCurrentUser,
  };
};

/**
 * Routing Patterns
 */

// 1. Route Configuration
const routes = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { 
        path: 'dashboard', 
        element: <ProtectedRoute element={<DashboardPage />} allowedRoles={['ADMIN', 'TECHNICIAN', 'USER']} /> 
      },
      { 
        path: 'incidents', 
        element: <ProtectedRoute element={<IncidentsPage />} allowedRoles={['ADMIN', 'TECHNICIAN', 'USER']} /> 
      },
      { 
        path: 'incidents/:id', 
        element: <ProtectedRoute element={<IncidentDetailPage />} allowedRoles={['ADMIN', 'TECHNICIAN', 'USER']} /> 
      },
      { 
        path: 'incidents/new', 
        element: <ProtectedRoute element={<CreateIncidentPage />} allowedRoles={['ADMIN', 'TECHNICIAN', 'USER']} /> 
      },
      { 
        path: 'equipment', 
        element: <ProtectedRoute element={<EquipmentPage />} allowedRoles={['ADMIN', 'TECHNICIAN']} /> 
      },
      { 
        path: 'equipment/:id', 
        element: <ProtectedRoute element={<EquipmentDetailPage />} allowedRoles={['ADMIN', 'TECHNICIAN']} /> 
      },
      { 
        path: 'equipment/new', 
        element: <ProtectedRoute element={<CreateEquipmentPage />} allowedRoles={['ADMIN']} /> 
      },
      { 
        path: 'reports', 
        element: <ProtectedRoute element={<ReportsPage />} allowedRoles={['ADMIN', 'TECHNICIAN']} /> 
      },
      { 
        path: 'reports/generate', 
        element: <ProtectedRoute element={<GenerateReportPage />} allowedRoles={['ADMIN']} /> 
      },
      { 
        path: 'reports/:id', 
        element: <ProtectedRoute element={<ViewReportPage />} allowedRoles={['ADMIN', 'TECHNICIAN']} /> 
      },
      { 
        path: 'notifications', 
        element: <ProtectedRoute element={<NotificationsPage />} allowedRoles={['ADMIN', 'TECHNICIAN', 'USER']} /> 
      },
      { 
        path: 'profile', 
        element: <ProtectedRoute element={<ProfilePage />} allowedRoles={['ADMIN', 'TECHNICIAN', 'USER']} /> 
      },
    ],
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { index: true, element: <Navigate to="/auth/login" replace /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'reset-password/:token', element: <ResetPasswordPage /> },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
];

// 2. Router Setup
const AppRouter = () => {
  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          {routes.map((route, index) => (
            <Route
              key={index}
              path={route.path}
              element={route.element}
            >
              {route.children && route.children.map((childRoute, childIndex) => (
                childRoute.index ? (
                  <Route
                    key={childIndex}
                    index
                    element={childRoute.element}
                  />
                ) : (
                  <Route
                    key={childIndex}
                    path={childRoute.path}
                    element={childRoute.element}
                  />
                )
              ))}
            </Route>
          ))}
        </Routes>
      </Suspense>
    </Router>
  );
};

/**
 * Performance Optimization Patterns
 */

// 1. Memoization
const MemoizedComponent = React.memo(({ prop1, prop2, onAction }) => {
  // Component implementation
  return (
    <div>
      {/* JSX content */}
    </div>
  );
});

// 2. Code Splitting with Lazy Loading
const LazyComponent = lazy(() => import('./LazyComponent'));

// 3. Virtualized Lists for Large Data Sets
const VirtualizedList = ({ items }) => {
  // Implementation using a virtualization library like react-window or react-virtualized
  return (
    <div>
      {/* Virtualized list implementation */}
    </div>
  );
};

/**
 * Error Handling Patterns
 */

// 1. Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });
    
    // Log error to monitoring service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-boundary">
          <h2>Something went wrong.</h2>
          <button onClick={() => window.location.reload()}>
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// 2. Async Error Handling
const AsyncComponent = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/some-endpoint');
      setData(response.data);
    } catch (err) {
      setError(err.message || 'An error occurred');
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, []);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>No data available</div>;
  
  return (
    <div>
      {/* Render data */}
    </div>
  );
};

/**
 * Accessibility Patterns
 */

// 1. Semantic HTML
const AccessibleComponent = () => {
  return (
    <main>
      <h1>Page Title</h1>
      <nav aria-label="Main Navigation">
        <ul>
          <li><a href="#section1">Section 1</a></li>
          <li><a href="#section2">Section 2</a></li>
        </ul>
      </nav>
      
      <section id="section1" aria-labelledby="section1-heading">
        <h2 id="section1-heading">Section 1 Heading</h2>
        <p>Content for section 1</p>
      </section>
      
      <section id="section2" aria-labelledby="section2-heading">
        <h2 id="section2-heading">Section 2 Heading</h2>
        <p>Content for section 2</p>
      </section>
      
      <button
        aria-label="Close dialog"
        onClick={() => {/* handle click */}}
      >
        <span aria-hidden="true">&times;</span>
      </button>
    </main>
  );
};

// 2. Focus Management
const FocusManagementExample = () => {
  const modalRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    if (isOpen && modalRef.current) {
      // Save previous focus
      const previousFocus = document.activeElement;
      
      // Focus the modal
      modalRef.current.focus();
      
      return () => {
        // Restore focus when component unmounts
        if (previousFocus) {
          previousFocus.focus();
        }
      };
    }
  }, [isOpen]);
  
  return (
    <div>
      <button onClick={() => setIsOpen(true)}>Open Modal</button>
      
      {isOpen && (
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          tabIndex={-1}
        >
          <h2 id="modal-title">Modal Title</h2>
          <div>Modal content</div>
          <button onClick={() => setIsOpen(false)}>Close</button>
        </div>
      )}
    </div>
  );
};

/**
 * Testing Patterns
 */

// 1. Component Testing
// Example of a component that's designed to be testable
const TestableComponent = ({ onAction, items = [] }) => {
  return (
    <div data-testid="testable-component">
      <h2>Testable Component</h2>
      <button 
        data-testid="action-button"
        onClick={onAction}
      >
        Perform Action
      </button>
      <ul data-testid="items-list">
        {items.map((item, index) => (
          <li key={index} data-testid={`item-${index}`}>{item}</li>
        ))}
      </ul>
    </div>
  );
};

// 2. Mock Service Worker for API Testing
// This would be in a separate test file, but showing the pattern here
/*
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get('/api/items', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
      ])
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('fetches items from API', async () => {
  // Test implementation
});
*/

/**
 * Internationalization (i18n) Pattern
 */

// Basic i18n setup (would typically use a library like react-i18next)
const I18nContext = createContext();

const I18nProvider = ({ children, locale, messages }) => {
  const [currentLocale, setCurrentLocale] = useState(locale);
  const [translations, setTranslations] = useState(messages);
  
  const changeLocale = useCallback((newLocale, newMessages) => {
    setCurrentLocale(newLocale);
    setTranslations(newMessages);
  }, []);
  
  const translate = useCallback((key, params = {}) => {
    let message = translations[key] || key;
    
    // Replace parameters in the message
    Object.entries(params).forEach(([param, value]) => {
      message = message.replace(`{${param}}`, value);
    });
    
    return message;
  }, [translations]);
  
  const value = useMemo(() => ({
    locale: currentLocale,
    translate,
    changeLocale,
  }), [currentLocale, translate, changeLocale]);
  
  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
};

const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
};

/**
 * Export all patterns and utilities
 */
export {
  // Component Patterns
  FunctionalComponent,
  useCustomHook,
  MyContextProvider,
  useMyContext,
  withAuth,
  ProtectedRoute,
  
  // Styling Patterns
  StyledButton,
  theme,
  
  // Form Handling
  FormExample,
  useForm,
  
  // API Communication
  apiClient,
  authApi,
  incidentsApi,
  useFetch,
  useWebSocket,
  
  // Redux Integration
  authSlice,
  login,
  getCurrentUser,
  useAuth,
  
  // Routing
  routes,
  AppRouter,
  
  // Performance Optimization
  MemoizedComponent,
  LazyComponent,
  VirtualizedList,
  
  // Error Handling
  ErrorBoundary,
  AsyncComponent,
  
  // Accessibility
  AccessibleComponent,
  FocusManagementExample,
  
  // Testing
  TestableComponent,
  
  // Internationalization
  I18nProvider,
  useTranslation,
};

// Default export for the entire module
export default {
  AppRouter,
  ErrorBoundary,
  I18nProvider,
};