import { PrismaClient, Prisma } from '@prisma/client';
import prisma from '../sdks/prisma';

/**
 * Transaction service for managing database transactions across repositories
 */
class TransactionService {
  /**
   * Execute a transaction with the provided callback
   * @param callback Function to execute within the transaction
   * @returns Result of the callback
   */
  async executeTransaction<T>(
    callback: (tx: Prisma.TransactionClient) => Promise<T>
  ): Promise<T> {
    return prisma.$transaction(async (tx) => {
      return callback(tx);
    });
  }

  /**
   * Get the Prisma client
   * @returns Prisma client instance
   */
  getPrismaClient(): PrismaClient {
    return prisma;
  }
}

// Singleton instance
const transactionService = new TransactionService();

export default transactionService; 