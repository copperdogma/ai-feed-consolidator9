/**
 * Mock implementation of the Prisma client for testing
 * This follows the standard Jest mocking pattern with __mocks__ directory
 */
import { PrismaClient, Prisma } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import { beforeEach } from '@jest/globals';

// Create a mockDeep instance of PrismaClient
export const prismaMock = mockDeep<PrismaClient>();

// Reset all mocks between tests
beforeEach(() => {
  mockReset(prismaMock);
  
  // We need to explicitly mock the $transaction method for our tests
  prismaMock.$transaction.mockImplementation(async (callback: any) => {
    if (typeof callback === 'function') {
      return callback(prismaMock);
    }
    return callback;
  });
});

// Export the mock client as default (matching the original)
export default prismaMock; 