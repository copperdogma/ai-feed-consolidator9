/**
 * Tests for the TransactionService
 * 
 * This approach focuses on behavioral testing rather than implementation testing,
 * since mocking the Prisma client has proven challenging with ESM modules.
 */
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { PrismaClient, Prisma } from '@prisma/client';

// Import the service
import transactionService from '../../services/transaction.service';

// Type definition for transaction callback
type TransactionCallback = (tx: Prisma.TransactionClient) => Promise<any>;

// Create a simplified mock transaction function for testing
const mockCallback: TransactionCallback = jest.fn(async () => ({ success: true, data: 'test-data' }));
const mockErrorCallback: TransactionCallback = jest.fn(async () => {
  throw new Error('Callback error');
});

describe('TransactionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('executeTransaction', () => {
    it('should execute callback and return result', async () => {
      // Call the method with our mock callback
      const result = await transactionService.executeTransaction(mockCallback);
      
      // Verify the mock was called and result returned correctly
      expect(mockCallback).toHaveBeenCalled();
      expect(result).toEqual({ success: true, data: 'test-data' });
    });

    it('should propagate errors from the callback', async () => {
      // Verify the service propagates errors from the callback
      await expect(transactionService.executeTransaction(mockErrorCallback))
        .rejects.toThrow('Callback error');
      
      // Verify mock was called
      expect(mockErrorCallback).toHaveBeenCalled();
    });
  });

  describe('getPrismaClient', () => {
    it('should return a PrismaClient instance', () => {
      // Call the method
      const result = transactionService.getPrismaClient();
      
      // Verify result is a PrismaClient
      expect(result).toBeDefined();
      expect(typeof result.$connect).toBe('function');
      expect(typeof result.$transaction).toBe('function');
    });
  });
}); 