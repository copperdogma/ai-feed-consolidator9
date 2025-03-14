/**
 * Test Setup for Client Tests
 * 
 * This file runs before Jest tests to configure the test environment.
 */

// Make sure fetch is available globally
global.fetch = jest.fn(() => 
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(""),
    status: 200,
    statusText: "OK",
    headers: new Headers()
  })
);

// Mock browser storage APIs
global.localStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

global.sessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// Mock Vite environment variables
global.import = { meta: { env: {} } };
global.import.meta.env = {
  VITE_APP_API_URL: 'http://localhost:3001/trpc',
  VITE_FIREBASE_API_KEY: 'mock-firebase-api-key',
  VITE_FIREBASE_AUTH_DOMAIN: 'mock-firebase-auth-domain',
  VITE_FIREBASE_PROJECT_ID: 'mock-firebase-project-id',
  MODE: 'test',
  DEV: true,
  // Add any other environment variables used in your app
};

// Mock ResizeObserver which isn't available in JSDOM
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock console methods to make tests cleaner
const originalConsoleError = console.error;
console.error = (...args) => {
  // Skip React-specific errors that we don't care about in tests
  if (args[0]?.includes?.('React does not recognize')) return;
  if (args[0]?.includes?.('Invalid prop')) return;
  originalConsoleError(...args);
};

// Setup custom jest matchers
require('@testing-library/jest-dom'); 