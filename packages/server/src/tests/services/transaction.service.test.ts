/**
 * Tests for the TransactionService
 * 
 * This approach focuses on behavioral testing rather than implementation testing,
 * since mocking the Prisma client has proven challenging with ESM modules.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PrismaClient, Prisma } from '@prisma/client';

// Import the service
import transactionService from '../../services/transaction.service';

// Type definition for transaction callback
type TransactionCallback = (tx: Prisma.TransactionClient) => Promise<any>;

// Create a simplified mock transaction function for testing
const mockCallback: TransactionCallback = vi.fn(async () => ({ success: true, data: 'test-data' }));
const mockErrorCallback: TransactionCallback = vi.fn(async () => {
  throw new Error('Callback error');
});

describe('TransactionService', () => {
  // Reset mocks between tests
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('executeTransaction', () => {
    it('should execute a transaction and return the result', async () => {
      // Call the transaction service
      const result = await transactionService.executeTransaction(mockCallback);

      // Check that callback was called once
      expect(mockCallback).toHaveBeenCalledTimes(1);
      
      // Check the transaction was passed to the callback
      expect(mockCallback).toHaveBeenCalledWith(expect.any(Object));
      
      // Check the result
      expect(result).toEqual({ success: true, data: 'test-data' });
    });

    it('should propagate errors from the callback', async () => {
      // Expect the error to be propagated
      await expect(transactionService.executeTransaction(mockErrorCallback))
        .rejects.toThrow('Callback error');
      
      // Check that callback was called
      expect(mockErrorCallback).toHaveBeenCalledTimes(1);
    });
  });
}); 