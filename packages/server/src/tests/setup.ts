/**
 * Jest setup file for ESM
 */
import { jest, beforeEach, afterEach } from '@jest/globals';

// Make jest available globally with proper types
declare global {
  // Using any to avoid TypeScript namespace errors
  var jestGlobal: typeof jest;
}

// Set jest globally in a way that works with ESM
globalThis.jestGlobal = jest;

// Set up any global mocks or test configuration here
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
});

afterEach(() => {
  // Additional cleanup after each test if needed
});

// Silence console errors during tests to keep output clean
// But keep a reference in case we need to restore it
const originalConsoleError = console.error;
console.error = jest.fn();

// Make sure we can restore console if needed
export const restoreConsole = () => {
  console.error = originalConsoleError;
};

// ESM requires a default export
export default {}; 