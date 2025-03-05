// client/src/mocks/server.js
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { handlers } from './handlers';

/**
 * Mock Service Worker server for testing
 * 
 * This server intercepts API requests during tests and provides mock responses
 * based on the defined handlers. It allows testing components that make API calls
 * without actually hitting the backend.
 */

// Create the mock server instance with our request handlers
export const server = setupServer(...handlers);

// Start the server before all tests
beforeAll(() => {
  // Enable request interception
  server.listen({
    onUnhandledRequest: 'warn',
  });
  console.log('🔶 Mock server started');
});

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests
afterEach(() => {
  server.resetHandlers();
});

// Clean up after all tests are done
afterAll(() => {
  // Close the server and restore original behavior
  server.close();
  console.log('🔶 Mock server stopped');
});

// Helper function to add runtime request handlers during tests
export const addMockHandlers = (...handlers) => {
  server.use(...handlers);
};

// Helper function to simulate server errors
export const simulateServerError = (url, statusCode = 500, errorMessage = 'Internal Server Error') => {
  server.use(
    rest.get(url, (req, res, ctx) => {
      return res(
        ctx.status(statusCode),
        ctx.json({
          message: errorMessage,
          status: 'error'
        })
      );
    }),
    rest.post(url, (req, res, ctx) => {
      return res(
        ctx.status(statusCode),
        ctx.json({
          message: errorMessage,
          status: 'error'
        })
      );
    }),
    rest.put(url, (req, res, ctx) => {
      return res(
        ctx.status(statusCode),
        ctx.json({
          message: errorMessage,
          status: 'error'
        })
      );
    }),
    rest.delete(url, (req, res, ctx) => {
      return res(
        ctx.status(statusCode),
        ctx.json({
          message: errorMessage,
          status: 'error'
        })
      );
    })
  );
};

// Helper function to simulate network errors
export const simulateNetworkError = (url) => {
  server.use(
    rest.get(url, (req, res) => {
      return res.networkError('Failed to connect');
    }),
    rest.post(url, (req, res) => {
      return res.networkError('Failed to connect');
    }),
    rest.put(url, (req, res) => {
      return res.networkError('Failed to connect');
    }),
    rest.delete(url, (req, res) => {
      return res.networkError('Failed to connect');
    })
  );
};

// Helper function to simulate delayed responses
export const simulateDelay = (url, delayMs = 1500) => {
  server.use(
    rest.get(url, async (req, res, ctx) => {
      await new Promise(resolve => setTimeout(resolve, delayMs));
      return res(
        ctx.status(200),
        ctx.json({ message: 'Delayed response' })
      );
    }),
    rest.post(url, async (req, res, ctx) => {
      await new Promise(resolve => setTimeout(resolve, delayMs));
      return res(
        ctx.status(200),
        ctx.json({ message: 'Delayed response' })
      );
    })
  );
};

// Export all utilities for use in tests
export const mockUtils = {
  addMockHandlers,
  simulateServerError,
  simulateNetworkError,
  simulateDelay
};

export default server;