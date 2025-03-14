/**
 * Tests for the ActivityRepository implementation
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ActivityRepositoryImpl } from '../../repositories/activity.repository';
import { PrismaClient } from '@prisma/client';
import { mockPrisma } from '../utils/mock-utils';

describe('ActivityRepository', () => {
  let prisma: any;
  let activityRepository: ActivityRepositoryImpl;
  
  // Sample activity data for testing
  const sampleActivity = {
    id: 'activity-123',
    userId: 'user-123',
    contentId: 'content-123',
    action: 'READ',
    metadata: null,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    // Create a fresh mock for each test
    prisma = mockPrisma();
    activityRepository = new ActivityRepositoryImpl(prisma);
  });

  describe('findById', () => {
    it('should return activity when it exists', async () => {
      // Setup the mock to return our sample activity
      prisma.activity.findUnique.mockResolvedValue(sampleActivity);

      // Execute the method under test
      const result = await activityRepository.findById('activity-123');

      // Verify the result
      expect(result).toEqual(sampleActivity);
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.activity.findUnique).toHaveBeenCalledWith({
        where: { id: 'activity-123' }
      });
    });

    it('should return null when activity does not exist', async () => {
      // Setup the mock to return null
      prisma.activity.findUnique.mockResolvedValue(null);

      // Execute the method under test
      const result = await activityRepository.findById('non-existent');

      // Verify the result
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all activities', async () => {
      // Setup: Create an array of sample activities
      const activities = [
        { ...sampleActivity, id: 'activity-1' },
        { ...sampleActivity, id: 'activity-2', action: 'LIKE' }
      ];
      prisma.activity.findMany.mockResolvedValue(activities);

      // Execute the method under test
      const result = await activityRepository.findAll();

      // Verify the result
      expect(result).toEqual(activities);
      expect(result.length).toBe(2);
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.activity.findMany).toHaveBeenCalledWith({
        skip: undefined,
        take: undefined,
        where: undefined
      });
    });

    it('should return activities with pagination', async () => {
      // Setup: Create an array of sample activities
      const activities = [{ ...sampleActivity, id: 'activity-2' }];
      prisma.activity.findMany.mockResolvedValue(activities);

      // Execute the method under test with pagination
      const result = await activityRepository.findAll({ skip: 1, take: 1 });

      // Verify the result
      expect(result).toEqual(activities);
      expect(result.length).toBe(1);
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.activity.findMany).toHaveBeenCalledWith({
        skip: 1,
        take: 1,
        where: undefined
      });
    });

    it('should return activities with filtering', async () => {
      // Setup: Create filtered activities
      const activities = [{ ...sampleActivity, action: 'BOOKMARK' }];
      prisma.activity.findMany.mockResolvedValue(activities);

      // Execute the method under test with filtering
      const result = await activityRepository.findAll({ 
        where: { action: 'BOOKMARK' } 
      });

      // Verify the result
      expect(result).toEqual(activities);
      expect(result.length).toBe(1);
      expect(result[0].action).toBe('BOOKMARK');
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.activity.findMany).toHaveBeenCalledWith({
        skip: undefined,
        take: undefined,
        where: { action: 'BOOKMARK' }
      });
    });
  });

  describe('create', () => {
    it('should create and return a new activity', async () => {
      // Setup: The data we want to create
      const newActivityData = {
        userId: 'user-123',
        contentId: 'content-123',
        action: 'LIKE',
        metadata: { rating: 5 }
      };

      // Setup: Mock the create method to return our data plus an ID
      const createdActivity = { 
        ...newActivityData,
        id: 'new-activity-123', 
        createdAt: new Date(),
        updatedAt: new Date() 
      };
      prisma.activity.create.mockResolvedValue(createdActivity);

      // Execute the method under test
      const result = await activityRepository.create(newActivityData);

      // Verify the result
      expect(result).toEqual(createdActivity);
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.activity.create).toHaveBeenCalledWith({
        data: newActivityData
      });
    });
  });

  describe('update', () => {
    it('should update and return the activity', async () => {
      // Setup: The data we want to update
      const updateData = {
        action: 'SHARE',
        metadata: { platform: 'twitter' }
      };

      // Setup: Mock the update method to return updated activity
      const updatedActivity = { 
        ...sampleActivity,
        ...updateData,
        updatedAt: new Date() 
      };
      prisma.activity.update.mockResolvedValue(updatedActivity);

      // Execute the method under test
      const result = await activityRepository.update('activity-123', updateData);

      // Verify the result
      expect(result).toEqual(updatedActivity);
      expect(result.action).toBe('SHARE');
      expect(result.metadata).toEqual({ platform: 'twitter' });
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.activity.update).toHaveBeenCalledWith({
        where: { id: 'activity-123' },
        data: updateData
      });
    });

    it('should throw an error when activity does not exist', async () => {
      // Setup: Mock to throw an error
      const error = new Error('Activity not found');
      prisma.activity.update.mockRejectedValue(error);

      // Execute & Verify
      await expect(activityRepository.update('non-existent', { action: 'LIKE' }))
        .rejects.toThrow('Activity not found');
    });
  });

  describe('delete', () => {
    it('should delete activity and return true on success', async () => {
      // Setup: Mock the delete method to return the deleted activity
      prisma.activity.delete.mockResolvedValue(sampleActivity);

      // Execute the method under test
      const result = await activityRepository.delete('activity-123');

      // Verify the result
      expect(result).toBe(true);
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.activity.delete).toHaveBeenCalledWith({
        where: { id: 'activity-123' }
      });
    });

    it('should return false when deletion fails', async () => {
      // Setup: Mock to throw an error
      const error = new Error('Activity not found');
      prisma.activity.delete.mockRejectedValue(error);

      // Execute the method under test
      const result = await activityRepository.delete('non-existent');

      // Verify the result
      expect(result).toBe(false);
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.activity.delete).toHaveBeenCalledWith({
        where: { id: 'non-existent' }
      });
    });
  });

  describe('count', () => {
    it('should return the number of activities', async () => {
      // Setup: Mock to return a count
      prisma.activity.count.mockResolvedValue(10);

      // Execute the method under test
      const result = await activityRepository.count();

      // Verify the result
      expect(result).toBe(10);
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.activity.count).toHaveBeenCalledWith({
        where: undefined
      });
    });

    it('should return the number of filtered activities', async () => {
      // Setup: Mock to return a filtered count
      prisma.activity.count.mockResolvedValue(3);

      // Execute the method under test with filter
      const result = await activityRepository.count({ action: 'READ' });

      // Verify the result
      expect(result).toBe(3);
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.activity.count).toHaveBeenCalledWith({
        where: { action: 'READ' }
      });
    });
  });

  describe('findByUserId', () => {
    it('should return activities for a given user ID', async () => {
      // Setup: Create an array of activities for a specific user
      const userActivities = [
        { ...sampleActivity, id: 'activity-1' },
        { ...sampleActivity, id: 'activity-2', action: 'LIKE' }
      ];
      prisma.activity.findMany.mockResolvedValue(userActivities);

      // Execute the method under test
      const result = await activityRepository.findByUserId('user-123');

      // Verify the result
      expect(result).toEqual(userActivities);
      expect(result.length).toBe(2);
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.activity.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' }
      });
    });

    it('should return an empty array when no activities exist for the user', async () => {
      // Setup: Mock to return an empty array
      prisma.activity.findMany.mockResolvedValue([]);

      // Execute the method under test
      const result = await activityRepository.findByUserId('user-without-activities');

      // Verify the result
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });
  });

  describe('findByContentId', () => {
    it('should return activities for a given content ID', async () => {
      // Setup: Create an array of activities for a specific content
      const contentActivities = [
        { ...sampleActivity, id: 'activity-1', userId: 'user-1' },
        { ...sampleActivity, id: 'activity-2', userId: 'user-2', action: 'LIKE' }
      ];
      prisma.activity.findMany.mockResolvedValue(contentActivities);

      // Execute the method under test
      const result = await activityRepository.findByContentId('content-123');

      // Verify the result
      expect(result).toEqual(contentActivities);
      expect(result.length).toBe(2);
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.activity.findMany).toHaveBeenCalledWith({
        where: { contentId: 'content-123' }
      });
    });

    it('should return an empty array when no activities exist for the content', async () => {
      // Setup: Mock to return an empty array
      prisma.activity.findMany.mockResolvedValue([]);

      // Execute the method under test
      const result = await activityRepository.findByContentId('content-without-activities');

      // Verify the result
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });
  });

  describe('findByAction', () => {
    it('should return activities with the specified action', async () => {
      // Setup: Create an array of activities with a specific action
      const actionActivities = [
        { ...sampleActivity, id: 'activity-1', userId: 'user-1' },
        { ...sampleActivity, id: 'activity-2', userId: 'user-2', contentId: 'content-2' }
      ];
      prisma.activity.findMany.mockResolvedValue(actionActivities);

      // Execute the method under test
      const result = await activityRepository.findByAction('READ');

      // Verify the result
      expect(result).toEqual(actionActivities);
      expect(result.length).toBe(2);
      expect(result[0].action).toBe('READ');
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.activity.findMany).toHaveBeenCalledWith({
        where: { action: 'READ' }
      });
    });

    it('should return an empty array when no activities with the action exist', async () => {
      // Setup: Mock to return an empty array
      prisma.activity.findMany.mockResolvedValue([]);

      // Execute the method under test
      const result = await activityRepository.findByAction('NONEXISTENT_ACTION');

      // Verify the result
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });
  });
}); 