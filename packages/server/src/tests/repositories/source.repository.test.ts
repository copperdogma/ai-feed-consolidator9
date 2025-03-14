/**
 * Tests for the SourceRepository implementation
 * (Migrated from Jest to Vitest)
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SourceRepositoryImpl } from '../../repositories/source.repository';
import { PrismaClient } from '@prisma/client';
import { mockPrisma } from '../utils/mock-utils';

describe('SourceRepository', () => {
  let prisma: any;
  let sourceRepository: SourceRepositoryImpl;
  
  // Sample source data for testing
  const sampleSource = {
    id: 'source-123',
    userId: 'user-123',
    name: 'Test Source',
    sourceType: 'RSS',
    url: 'https://example.com/feed',
    isActive: true,
    lastFetched: new Date(),
    metadata: null,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    // Create a fresh mock for each test
    prisma = mockPrisma();
    sourceRepository = new SourceRepositoryImpl(prisma as any);
  });

  describe('findById', () => {
    it('should return source when it exists', async () => {
      // Setup the mock to return our sample source
      (prisma.source.findUnique as any).mockResolvedValue(sampleSource);

      // Execute the method under test
      const result = await sourceRepository.findById('source-123');

      // Verify the result
      expect(result).toEqual(sampleSource);
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.source.findUnique).toHaveBeenCalledWith({
        where: { id: 'source-123' }
      });
    });

    it('should return null when source does not exist', async () => {
      // Setup the mock to return null
      (prisma.source.findUnique as any).mockResolvedValue(null);

      // Execute the method under test
      const result = await sourceRepository.findById('non-existent');

      // Verify the result
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all sources', async () => {
      // Setup: Create an array of sample sources
      const sources = [
        { ...sampleSource, id: 'source-1' },
        { ...sampleSource, id: 'source-2', name: 'Another Source' }
      ];
      (prisma.source.findMany as any).mockResolvedValue(sources);

      // Execute the method under test
      const result = await sourceRepository.findAll();

      // Verify the result
      expect(result).toEqual(sources);
      expect(result.length).toBe(2);
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.source.findMany).toHaveBeenCalledWith({
        skip: undefined,
        take: undefined,
        where: undefined
      });
    });

    it('should return sources with pagination', async () => {
      // Setup: Create an array of sample sources
      const sources = [{ ...sampleSource, id: 'source-2' }];
      (prisma.source.findMany as any).mockResolvedValue(sources);

      // Execute the method under test with pagination
      const result = await sourceRepository.findAll({ skip: 1, take: 1 });

      // Verify the result
      expect(result).toEqual(sources);
      expect(result.length).toBe(1);
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.source.findMany).toHaveBeenCalledWith({
        skip: 1,
        take: 1,
        where: undefined
      });
    });

    it('should return sources with filtering', async () => {
      // Setup: Create filtered sources
      const sources = [{ ...sampleSource, sourceType: 'ATOM' }];
      (prisma.source.findMany as any).mockResolvedValue(sources);

      // Execute the method under test with filtering
      const result = await sourceRepository.findAll({ 
        where: { sourceType: 'ATOM' } 
      });

      // Verify the result
      expect(result).toEqual(sources);
      expect(result.length).toBe(1);
      expect(result[0].sourceType).toBe('ATOM');
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.source.findMany).toHaveBeenCalledWith({
        skip: undefined,
        take: undefined,
        where: { sourceType: 'ATOM' }
      });
    });
  });

  describe('create', () => {
    it('should create and return a new source', async () => {
      // Setup: The data we want to create
      const newSourceData = {
        userId: 'user-123',
        name: 'New Source',
        sourceType: 'RSS',
        url: 'https://example.com/newfeed'
      };

      // Setup: Mock the create method to return our data plus an ID
      const createdSource = { 
        ...newSourceData,
        id: 'new-source-123', 
        isActive: true,
        lastFetched: null,
        metadata: null,
        createdAt: new Date(),
        updatedAt: new Date() 
      };
      (prisma.source.create as any).mockResolvedValue(createdSource);

      // Execute the method under test
      const result = await sourceRepository.create(newSourceData);

      // Verify the result
      expect(result).toEqual(createdSource);
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.source.create).toHaveBeenCalledWith({
        data: newSourceData
      });
    });
  });

  describe('update', () => {
    it('should update and return the source', async () => {
      // Setup: The data we want to update
      const updateData = {
        name: 'Updated Name',
        isActive: false
      };

      // Setup: Mock the update method to return updated source
      const updatedSource = { 
        ...sampleSource,
        ...updateData,
        updatedAt: new Date() 
      };
      (prisma.source.update as any).mockResolvedValue(updatedSource);

      // Execute the method under test
      const result = await sourceRepository.update('source-123', updateData);

      // Verify the result
      expect(result).toEqual(updatedSource);
      expect(result.name).toBe('Updated Name');
      expect(result.isActive).toBe(false);
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.source.update).toHaveBeenCalledWith({
        where: { id: 'source-123' },
        data: updateData
      });
    });

    it('should throw an error when source does not exist', async () => {
      // Setup: Mock to throw an error
      const error = new Error('Source not found');
      (prisma.source.update as any).mockRejectedValue(error);

      // Execute & Verify
      await expect(sourceRepository.update('non-existent', { name: 'New Name' }))
        .rejects.toThrow('Source not found');
    });
  });

  describe('delete', () => {
    it('should delete source and return true on success', async () => {
      // Setup: Mock the delete method to return the deleted source
      (prisma.source.delete as any).mockResolvedValue(sampleSource);

      // Execute the method under test
      const result = await sourceRepository.delete('source-123');

      // Verify the result
      expect(result).toBe(true);
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.source.delete).toHaveBeenCalledWith({
        where: { id: 'source-123' }
      });
    });

    it('should return false when deletion fails', async () => {
      // Setup: Mock to throw an error
      const error = new Error('Source not found');
      (prisma.source.delete as any).mockRejectedValue(error);

      // Execute the method under test
      const result = await sourceRepository.delete('non-existent');

      // Verify the result
      expect(result).toBe(false);
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.source.delete).toHaveBeenCalledWith({
        where: { id: 'non-existent' }
      });
    });
  });

  describe('count', () => {
    it('should return the number of sources', async () => {
      // Setup: Mock to return a count
      (prisma.source.count as any).mockResolvedValue(10);

      // Execute the method under test
      const result = await sourceRepository.count();

      // Verify the result
      expect(result).toBe(10);
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.source.count).toHaveBeenCalledWith({
        where: undefined
      });
    });

    it('should return the number of filtered sources', async () => {
      // Setup: Mock to return a filtered count
      (prisma.source.count as any).mockResolvedValue(2);

      // Execute the method under test with filter
      const result = await sourceRepository.count({ sourceType: 'ATOM' });

      // Verify the result
      expect(result).toBe(2);
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.source.count).toHaveBeenCalledWith({
        where: { sourceType: 'ATOM' }
      });
    });
  });

  describe('findByUserId', () => {
    it('should return sources for a specific user', async () => {
      // Setup: Create an array of sample sources for the user
      const sources = [
        { ...sampleSource, id: 'source-1' },
        { ...sampleSource, id: 'source-2', name: 'Another Source' }
      ];
      (prisma.source.findMany as any).mockResolvedValue(sources);

      // Execute the method under test
      const result = await sourceRepository.findByUserId('user-123');

      // Verify the result
      expect(result).toEqual(sources);
      expect(result.length).toBe(2);
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.source.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' }
      });
    });

    it('should return empty array when no sources exist for user', async () => {
      // Setup: Mock to return empty array
      (prisma.source.findMany as any).mockResolvedValue([]);

      // Execute the method under test
      const result = await sourceRepository.findByUserId('non-existent-user');

      // Verify the result
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });
  });

  describe('findByType', () => {
    it('should return sources of a specific type', async () => {
      // Setup: Create an array of sample sources of the specified type
      const sources = [
        { ...sampleSource, id: 'source-1', sourceType: 'ATOM' },
        { ...sampleSource, id: 'source-2', sourceType: 'ATOM', name: 'Another Source' }
      ];
      (prisma.source.findMany as any).mockResolvedValue(sources);

      // Execute the method under test
      const result = await sourceRepository.findByType('ATOM');

      // Verify the result
      expect(result).toEqual(sources);
      expect(result.length).toBe(2);
      expect(result[0].sourceType).toBe('ATOM');
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.source.findMany).toHaveBeenCalledWith({
        where: { sourceType: 'ATOM' }
      });
    });
  });

  describe('findSourcesToRefresh', () => {
    it('should return sources that need refreshing', async () => {
      // Setup: Create a date threshold
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      
      // Setup: Mock sources that need refreshing
      const sources = [
        { ...sampleSource, id: 'source-1', lastFetched: oneHourAgo },
        { ...sampleSource, id: 'source-2', lastFetched: null }
      ];
      (prisma.source.findMany as any).mockResolvedValue(sources);

      // Mock Date.now to return a fixed value for testing
      const realDateNow = Date.now;
      Date.now = vi.fn(() => now.getTime());

      // Execute the method under test
      const result = await sourceRepository.findSourcesToRefresh();

      // Verify the result
      expect(result).toEqual(sources);
      expect(result.length).toBe(2);
      
      // Verify that the mock was called with appropriate where clause
      expect(prisma.source.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { lastFetched: { lt: expect.any(Date) } },
            { lastFetched: null }
          ],
          isActive: true
        }
      });

      // Restore the original Date.now
      Date.now = realDateNow;
    });

    it('should use custom threshold when olderThanMinutes is provided', async () => {
      // Setup: Create a date threshold
      const now = new Date();
      const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
      
      // Setup: Mock sources that need refreshing
      const sources = [{ ...sampleSource, id: 'source-1', lastFetched: thirtyMinutesAgo }];
      (prisma.source.findMany as any).mockResolvedValue(sources);

      // Mock Date.now to return a fixed value for testing
      const realDateNow = Date.now;
      Date.now = vi.fn(() => now.getTime());

      // Execute the method under test with custom threshold
      const result = await sourceRepository.findSourcesToRefresh(30);

      // Verify the result
      expect(result).toEqual(sources);
      expect(result.length).toBe(1);
      
      // Verify that the mock was called with appropriate where clause
      expect(prisma.source.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { lastFetched: { lt: expect.any(Date) } },
            { lastFetched: null }
          ],
          isActive: true
        }
      });

      // Restore the original Date.now
      Date.now = realDateNow;
    });
  });

  describe('updateLastFetched', () => {
    it('should update the lastFetched timestamp', async () => {
      // Setup: Create a fixed date for testing
      const now = new Date();
      
      // Mock Date constructor to return a fixed date
      const realDate = global.Date;
      global.Date = vi.fn(() => now) as any;
      global.Date.now = realDate.now;

      // Setup: Mock the update method
      const updatedSource = { 
        ...sampleSource,
        lastFetched: now,
        updatedAt: now
      };
      (prisma.source.update as any).mockResolvedValue(updatedSource);

      // Execute the method under test
      const result = await sourceRepository.updateLastFetched('source-123');

      // Verify the result
      expect(result).toEqual(updatedSource);
      expect(result.lastFetched).toEqual(now);
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.source.update).toHaveBeenCalledWith({
        where: { id: 'source-123' },
        data: { lastFetched: now }
      });

      // Restore the original Date
      global.Date = realDate;
    });

    it('should throw an error when source does not exist', async () => {
      // Setup: Mock to throw an error
      const error = new Error('Source not found');
      (prisma.source.update as any).mockRejectedValue(error);

      // Execute & Verify
      await expect(sourceRepository.updateLastFetched('non-existent'))
        .rejects.toThrow('Source not found');
    });
  });
}); 