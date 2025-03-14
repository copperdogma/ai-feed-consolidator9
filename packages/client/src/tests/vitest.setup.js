/**
 * Test Setup for Client Tests with Vitest
 * 
 * This file runs before Vitest tests to configure the test environment.
 */

import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Make sure fetch is available globally
global.fetch = vi.fn(() => 
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
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

global.sessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Mock Vite environment variables (properly for Vitest)
import.meta.env = {
  VITE_APP_API_URL: 'http://localhost:3001/trpc',
  VITE_FIREBASE_API_KEY: 'mock-firebase-api-key',
  VITE_FIREBASE_AUTH_DOMAIN: 'mock-firebase-auth-domain',
  VITE_FIREBASE_PROJECT_ID: 'mock-firebase-project-id',
  MODE: 'test',
  DEV: true,
};

// Mock ResizeObserver which isn't available in JSDOM
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock console methods to make tests cleaner
const originalConsoleError = console.error;
console.error = (...args) => {
  // Skip React-specific errors that we don't care about in tests
  if (args[0]?.includes?.('React does not recognize')) return;
  if (args[0]?.includes?.('Invalid prop')) return;
  originalConsoleError(...args);
}; 