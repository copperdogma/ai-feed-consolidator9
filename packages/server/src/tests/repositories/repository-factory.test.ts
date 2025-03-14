/**
 * Tests for the RepositoryFactory
 * (Migrated from Jest to Vitest)
 */
import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';
import { PrismaClient } from '@prisma/client';

// Import the factory and repositories directly
import RepositoryFactory from '../../repositories/repository-factory';
import { UserRepositoryImpl } from '../../repositories/user.repository';
import { SourceRepositoryImpl } from '../../repositories/source.repository';
import { ContentRepositoryImpl } from '../../repositories/content.repository';
import { SummaryRepositoryImpl } from '../../repositories/summary.repository';
import { TopicRepositoryImpl } from '../../repositories/topic.repository';
import { ActivityRepositoryImpl } from '../../repositories/activity.repository';
import { ContentTopicRepositoryImpl } from '../../repositories/content-topic.repository';

// Import the actual prisma instance
import prisma from '../../sdks/prisma';

describe('RepositoryFactory', () => {
  // Mock the actual prisma.$transaction function
  const originalTransaction = prisma.$transaction;
  
  // Clean up the static instances between tests and restore the original transaction
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset static instances
    (RepositoryFactory as any).userRepository = undefined;
    (RepositoryFactory as any).sourceRepository = undefined;
    (RepositoryFactory as any).contentRepository = undefined;
    (RepositoryFactory as any).summaryRepository = undefined;
    (RepositoryFactory as any).topicRepository = undefined;
    (RepositoryFactory as any).activityRepository = undefined;
    (RepositoryFactory as any).contentTopicRepository = undefined;
    
    // Mock transaction for each test
    prisma.$transaction = vi.fn();
  });
  
  // Restore original transaction after tests
  afterAll(() => {
    prisma.$transaction = originalTransaction;
  });

  describe('Repository Instance Creation', () => {
    it('should create a UserRepository instance when first called', () => {
      // Get the repository
      const userRepo = RepositoryFactory.getUserRepository();
      
      // Check that it's the correct type
      expect(userRepo).toBeInstanceOf(UserRepositoryImpl);
      
      // Get it again to test singleton pattern
      const userRepo2 = RepositoryFactory.getUserRepository();
      
      // Check that it's the same instance
      expect(userRepo2).toBe(userRepo);
    });

    it('should create a SourceRepository instance when first called', () => {
      // Get the repository
      const sourceRepo = RepositoryFactory.getSourceRepository();
      
      // Check that it's the correct type
      expect(sourceRepo).toBeInstanceOf(SourceRepositoryImpl);
      
      // Get it again to test singleton pattern
      const sourceRepo2 = RepositoryFactory.getSourceRepository();
      
      // Check that it's the same instance
      expect(sourceRepo2).toBe(sourceRepo);
    });

    it('should create a ContentRepository instance when first called', () => {
      // Get the repository
      const contentRepo = RepositoryFactory.getContentRepository();
      
      // Check that it's the correct type
      expect(contentRepo).toBeInstanceOf(ContentRepositoryImpl);
      
      // Get it again to test singleton pattern
      const contentRepo2 = RepositoryFactory.getContentRepository();
      
      // Check that it's the same instance
      expect(contentRepo2).toBe(contentRepo);
    });

    it('should create a SummaryRepository instance when first called', () => {
      // Get the repository
      const summaryRepo = RepositoryFactory.getSummaryRepository();
      
      // Check that it's the correct type
      expect(summaryRepo).toBeInstanceOf(SummaryRepositoryImpl);
      
      // Get it again to test singleton pattern
      const summaryRepo2 = RepositoryFactory.getSummaryRepository();
      
      // Check that it's the same instance
      expect(summaryRepo2).toBe(summaryRepo);
    });

    it('should create a TopicRepository instance when first called', () => {
      // Get the repository
      const topicRepo = RepositoryFactory.getTopicRepository();
      
      // Check that it's the correct type
      expect(topicRepo).toBeInstanceOf(TopicRepositoryImpl);
      
      // Get it again to test singleton pattern
      const topicRepo2 = RepositoryFactory.getTopicRepository();
      
      // Check that it's the same instance
      expect(topicRepo2).toBe(topicRepo);
    });

    it('should create an ActivityRepository instance when first called', () => {
      // Get the repository
      const activityRepo = RepositoryFactory.getActivityRepository();
      
      // Check that it's the correct type
      expect(activityRepo).toBeInstanceOf(ActivityRepositoryImpl);
      
      // Get it again to test singleton pattern
      const activityRepo2 = RepositoryFactory.getActivityRepository();
      
      // Check that it's the same instance
      expect(activityRepo2).toBe(activityRepo);
    });

    it('should create a ContentTopicRepository instance when first called', () => {
      // Get the repository
      const contentTopicRepo = RepositoryFactory.getContentTopicRepository();
      
      // Check that it's the correct type
      expect(contentTopicRepo).toBeInstanceOf(ContentTopicRepositoryImpl);
      
      // Get it again to test singleton pattern
      const contentTopicRepo2 = RepositoryFactory.getContentTopicRepository();
      
      // Check that it's the same instance
      expect(contentTopicRepo2).toBe(contentTopicRepo);
    });
  });

  describe('Transaction Execution', () => {
    it('should execute a transaction with transaction-specific repositories', async () => {
      // Mock the transaction implementation
      (prisma.$transaction as any).mockImplementation(async (cb: any) => {
        return cb(prisma);
      });

      // Mock callback for the transaction
      const mockCallback = vi.fn().mockResolvedValue({ success: true });

      // Execute the transaction
      const result = await RepositoryFactory.executeTransaction(mockCallback);

      // Check that the transaction was executed
      expect(prisma.$transaction).toHaveBeenCalled();
      
      // Check that our callback was called
      expect(mockCallback).toHaveBeenCalled();
      
      // Check that the callback received repositories (by spot checking)
      const callArgs = mockCallback.mock.calls[0][0];
      expect(callArgs).toHaveProperty('userRepository');
      expect(callArgs).toHaveProperty('contentRepository');
      expect(callArgs).toHaveProperty('topicRepository');
      
      // Check that the result is correct
      expect(result).toEqual({ success: true });
    });

    it('should propagate errors from the transaction', async () => {
      // Mock the transaction implementation
      (prisma.$transaction as any).mockImplementation(async (cb: any) => {
        return cb(prisma);
      });
      
      // Create an error to throw
      const mockError = new Error('Transaction error');
      
      // Mock the callback to throw an error
      const mockCallback = vi.fn().mockImplementation(() => {
        throw mockError;
      });
      
      // Execute & Verify: Error should be propagated
      await expect(RepositoryFactory.executeTransaction(mockCallback))
        .rejects.toThrow('Transaction error');
      
      // Check that the transaction was attempted
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should propagate errors from the Prisma transaction', async () => {
      // Create an error to throw
      const mockError = new Error('Prisma error');
      
      // Mock transaction to throw an error
      (prisma.$transaction as any).mockRejectedValue(mockError);
      
      // Mock the callback (which won't be executed)
      const mockCallback = vi.fn();
      
      // Execute & Verify: Error should be propagated
      await expect(RepositoryFactory.executeTransaction(mockCallback))
        .rejects.toThrow('Prisma error');
      
      // Check that the transaction was attempted
      expect(prisma.$transaction).toHaveBeenCalled();
      
      // Check that our callback was not called
      expect(mockCallback).not.toHaveBeenCalled();
    });
  });
}); 