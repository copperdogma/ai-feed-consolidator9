/**
 * Vitest setup file
 * This file runs before all tests to set up the test environment
 */
import { vi, beforeEach, afterAll } from 'vitest';

// Set environment variables for testing
process.env.ENVIRONMENT = 'test';
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/test_db';

// Set up mock data and global variables needed for tests
vi.mock('sdks/prisma', async () => {
  const { mockDeep, mockReset } = await import('vitest-mock-extended');
  
  // Create a mock PrismaClient for tests
  const mockPrisma = mockDeep();
  
  // Reset all mocks between tests
  beforeEach(() => {
    mockReset(mockPrisma);
  });
  
  return {
    default: mockPrisma,
  };
});

// Add any cleanup tasks to run after tests
afterAll(() => {
  // Clean up any resources, connections, etc.
  console.log('Test suite completed - cleaning up');
});

// Add a global function to help with testing async errors
// Add the type declaration for the global function
declare global {
  var catchError: <T>(promise: Promise<T>) => Promise<Error>;
}

global.catchError = async <T>(promise: Promise<T>): Promise<Error> => {
  try {
    await promise;
    throw new Error('Expected promise to reject');
  } catch (error) {
    return error as Error;
  }
}; 