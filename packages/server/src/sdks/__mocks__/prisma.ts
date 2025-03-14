/**
 * Mock implementation of the Prisma client for testing
 * This follows the standard Vitest mocking pattern
 */
import { PrismaClient } from '@prisma/client';
import { mockDeep } from '../../tests/utils/mock-utils';
import { beforeEach, vi } from 'vitest';

// Create a mockDeep instance of PrismaClient
export const prismaMock = mockDeep<PrismaClient>();

// Reset all mocks between tests
beforeEach(() => {
  vi.clearAllMocks();
  
  // We need to explicitly mock the $transaction method for our tests
  (prismaMock.$transaction as any).mockImplementation(async (callback: any) => {
    if (typeof callback === 'function') {
      return callback(prismaMock);
    }
    return callback;
  });
});

// Export the mock client as default (matching the original)
export default prismaMock; 