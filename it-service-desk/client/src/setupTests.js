/**
 * IT Service Desk - Test Setup Configuration
 * 
 * This file configures the testing environment for the client application.
 * It sets up Jest with testing-library, mock implementations for browser APIs,
 * and custom test utilities.
 * 
 * @module client/src/setupTests
 */

// Import Jest DOM extensions for DOM testing
import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';
import { server } from './mocks/server';

// Configure testing library
configure({
  testIdAttribute: 'data-testid',
  // Increase the default timeout for async tests
  asyncUtilTimeout: 5000,
});

// Mock localStorage and sessionStorage
class LocalStorageMock {
  constructor() {
    this.store = {};
  }

  clear() {
    this.store = {};
  }

  getItem(key) {
    return this.store[key] || null;
  }

  setItem(key, value) {
    this.store[key] = String(value);
  }

  removeItem(key) {
    delete this.store[key];
  }

  key(index) {
    return Object.keys(this.store)[index] || null;
  }

  get length() {
    return Object.keys(this.store).length;
  }
}

// Mock IntersectionObserver
class IntersectionObserverMock {
  constructor(callback) {
    this.callback = callback;
    this.elements = new Set();
    this.thresholds = [];
  }

  observe(element) {
    this.elements.add(element);
  }

  unobserve(element) {
    this.elements.delete(element);
  }

  disconnect() {
    this.elements.clear();
  }

  // Helper method to trigger intersection
  triggerIntersection(entries) {
    this.callback(entries, this);
  }
}

// Mock ResizeObserver
class ResizeObserverMock {
  constructor(callback) {
    this.callback = callback;
    this.elements = new Set();
  }

  observe(element) {
    this.elements.add(element);
  }

  unobserve(element) {
    this.elements.delete(element);
  }

  disconnect() {
    this.elements.clear();
  }
}

// Mock WebSocket
class WebSocketMock {
  constructor(url) {
    this.url = url;
    this.readyState = WebSocket.CONNECTING;
    
    // Simulate connection after a short delay
    setTimeout(() => {
      this.readyState = WebSocket.OPEN;
      if (this.onopen) {
        this.onopen({ target: this });
      }
    }, 50);
  }

  send(data) {
    if (this.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not open');
    }
    // Mock implementation for send
  }

  close() {
    this.readyState = WebSocket.CLOSING;
    setTimeout(() => {
      this.readyState = WebSocket.CLOSED;
      if (this.onclose) {
        this.onclose({ target: this });
      }
    }, 50);
  }
}

// Define WebSocket constants
WebSocketMock.CONNECTING = 0;
WebSocketMock.OPEN = 1;
WebSocketMock.CLOSING = 2;
WebSocketMock.CLOSED = 3;

// Mock Chart.js to prevent canvas rendering issues
jest.mock('chart.js', () => ({
  Chart: class MockChart {
    constructor() {
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d');
      this.data = null;
      this.options = null;
      this.plugins = [];
    }
    
    destroy() {}
    update() {}
    render() {}
    stop() {}
    resize() {}
    clear() {}
    toBase64Image() { return ''; }
    getElementAtEvent() { return []; }
    getElementsAtEvent() { return []; }
    getDatasetAtEvent() { return []; }
  },
  registerables: [],
  register: jest.fn(),
}));

// Mock react-chartjs-2 components
jest.mock('react-chartjs-2', () => ({
  Line: (props) => <div data-testid="line-chart" data-props={JSON.stringify(props)} />,
  Bar: (props) => <div data-testid="bar-chart" data-props={JSON.stringify(props)} />,
  Pie: (props) => <div data-testid="pie-chart" data-props={JSON.stringify(props)} />,
  Doughnut: (props) => <div data-testid="doughnut-chart" data-props={JSON.stringify(props)} />,
}));

// Mock react-toastify
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
    dark: jest.fn(),
  },
  ToastContainer: () => <div data-testid="toast-container" />,
}));

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() },
    },
    defaults: {
      baseURL: '',
      headers: {
        common: {},
      },
    },
  })),
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
  interceptors: {
    request: { use: jest.fn(), eject: jest.fn() },
    response: { use: jest.fn(), eject: jest.fn() },
  },
  defaults: {
    baseURL: '',
    headers: {
      common: {},
    },
  },
}));

// Mock socket.io-client
jest.mock('socket.io-client', () => {
  const mockSocket = {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
  };
  
  return jest.fn(() => mockSocket);
});

// Mock redux-persist
jest.mock('redux-persist', () => {
  const real = jest.requireActual('redux-persist');
  return {
    ...real,
    persistReducer: jest.fn().mockImplementation((config, reducers) => reducers),
  };
});

jest.mock('redux-persist/integration/react', () => ({
  PersistGate: ({ children }) => children,
}));

// Set up global mocks
global.localStorage = new LocalStorageMock();
global.sessionStorage = new LocalStorageMock();
global.IntersectionObserver = IntersectionObserverMock;
global.ResizeObserver = ResizeObserverMock;
global.WebSocket = WebSocketMock;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock window.scrollTo
window.scrollTo = jest.fn();

// Mock window.location
const locationMock = {
  assign: jest.fn(),
  reload: jest.fn(),
  replace: jest.fn(),
  toString: jest.fn(),
  href: 'http://localhost/',
  protocol: 'http:',
  host: 'localhost',
  hostname: 'localhost',
  port: '',
  pathname: '/',
  search: '',
  hash: '',
};

Object.defineProperty(window, 'location', {
  value: locationMock,
  writable: true,
});

// Setup MSW (Mock Service Worker) for API mocking
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Global test cleanup
afterEach(() => {
  // Clear mocks
  jest.clearAllMocks();
  
  // Clear localStorage and sessionStorage
  localStorage.clear();
  sessionStorage.clear();
});

// Custom matchers
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
  
  toHaveBeenCalledWithMatch(received, expected) {
    const calls = received.mock.calls;
    const pass = calls.some(call => 
      JSON.stringify(call[0]).includes(JSON.stringify(expected))
    );
    
    if (pass) {
      return {
        message: () => `expected ${received.mock.calls} not to contain a call with ${JSON.stringify(expected)}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received.mock.calls} to contain a call with ${JSON.stringify(expected)}`,
        pass: false,
      };
    }
  },
});

// Create a directory for the mocks if it doesn't exist
// This is a placeholder for the actual MSW server implementation
// In a real project, you would have a mocks/server.js file
if (typeof window !== 'undefined' && !window.server) {
  window.server = {
    listen: jest.fn(),
    resetHandlers: jest.fn(),
    close: jest.fn(),
  };
}

// Export mock server for tests that need direct access
export { server };