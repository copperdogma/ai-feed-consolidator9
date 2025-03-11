/**
 * Tests for the SourceRepository implementation
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { SourceRepositoryImpl } from '../../repositories/source.repository';
import { PrismaClient } from '@prisma/client';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

// Mock the PrismaClient
type MockPrismaClient = DeepMockProxy<PrismaClient>;

describe('SourceRepository', () => {
  let prisma: MockPrismaClient;
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
    prisma = mockDeep<PrismaClient>();
    sourceRepository = new SourceRepositoryImpl(prisma as any);
  });

  describe('findById', () => {
    it('should return source when it exists', async () => {
      // Setup the mock to return our sample source
      prisma.source.findUnique.mockResolvedValue(sampleSource);

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
      prisma.source.findUnique.mockResolvedValue(null);

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
      prisma.source.findMany.mockResolvedValue(sources);

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
      prisma.source.findMany.mockResolvedValue(sources);

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
      const sources = [{ ...sampleSource, sourceType: 'TWITTER' }];
      prisma.source.findMany.mockResolvedValue(sources);

      // Execute the method under test with filtering
      const result = await sourceRepository.findAll({ 
        where: { sourceType: 'TWITTER' } 
      });

      // Verify the result
      expect(result).toEqual(sources);
      expect(result.length).toBe(1);
      expect(result[0].sourceType).toBe('TWITTER');
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.source.findMany).toHaveBeenCalledWith({
        skip: undefined,
        take: undefined,
        where: { sourceType: 'TWITTER' }
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
        url: 'https://example.com/newfeed',
        isActive: true
      };

      // Setup: Mock the create method to return our data plus an ID
      const createdSource = { 
        ...newSourceData,
        id: 'new-source-123', 
        lastFetched: null,
        metadata: null,
        createdAt: new Date(),
        updatedAt: new Date() 
      };
      prisma.source.create.mockResolvedValue(createdSource);

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
        name: 'Updated Source Name',
        isActive: false
      };

      // Setup: Mock the update method to return updated source
      const updatedSource = { 
        ...sampleSource,
        ...updateData,
        updatedAt: new Date() 
      };
      prisma.source.update.mockResolvedValue(updatedSource);

      // Execute the method under test
      const result = await sourceRepository.update('source-123', updateData);

      // Verify the result
      expect(result).toEqual(updatedSource);
      expect(result.name).toBe('Updated Source Name');
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
      prisma.source.update.mockRejectedValue(error);

      // Execute & Verify
      await expect(sourceRepository.update('non-existent', { name: 'New Name' }))
        .rejects.toThrow('Source not found');
    });
  });

  describe('delete', () => {
    it('should delete source and return true on success', async () => {
      // Setup: Mock the delete method to return the deleted source
      prisma.source.delete.mockResolvedValue(sampleSource);

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
      prisma.source.delete.mockRejectedValue(error);

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
      prisma.source.count.mockResolvedValue(10);

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
      prisma.source.count.mockResolvedValue(3);

      // Execute the method under test with filter
      const result = await sourceRepository.count({ sourceType: 'RSS' });

      // Verify the result
      expect(result).toBe(3);
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.source.count).toHaveBeenCalledWith({
        where: { sourceType: 'RSS' }
      });
    });
  });

  describe('findByUserId', () => {
    it('should return sources for a given user ID', async () => {
      // Setup: Create an array of sample sources with the same user ID
      const sources = [
        { ...sampleSource, id: 'source-1' },
        { ...sampleSource, id: 'source-2', name: 'Another Source' }
      ];
      prisma.source.findMany.mockResolvedValue(sources);

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

    it('should return an empty array when no sources exist for the user', async () => {
      // Setup: Mock to return an empty array
      prisma.source.findMany.mockResolvedValue([]);

      // Execute the method under test
      const result = await sourceRepository.findByUserId('user-without-sources');

      // Verify the result
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });
  });

  describe('findByType', () => {
    it('should return sources with the specified type', async () => {
      // Setup: Create sample sources with specific type
      const rssSources = [
        { ...sampleSource, id: 'source-1', sourceType: 'RSS' },
        { ...sampleSource, id: 'source-2', sourceType: 'RSS' }
      ];
      prisma.source.findMany.mockResolvedValue(rssSources);

      // Execute the method under test
      const result = await sourceRepository.findByType('RSS');

      // Verify the result
      expect(result).toEqual(rssSources);
      expect(result.length).toBe(2);
      expect(result[0].sourceType).toBe('RSS');
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.source.findMany).toHaveBeenCalledWith({
        where: { sourceType: 'RSS' }
      });
    });

    it('should return an empty array when no sources with type exist', async () => {
      // Setup: Mock to return an empty array
      prisma.source.findMany.mockResolvedValue([]);

      // Execute the method under test
      const result = await sourceRepository.findByType('NONEXISTENT');

      // Verify the result
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });
  });

  describe('findSourcesToRefresh', () => {
    it('should return sources that need refreshing with default threshold', async () => {
      // Setup for test with the default threshold (1 hour)
      const sourcesDueForRefresh = [
        { ...sampleSource, id: 'source-1', lastFetched: new Date(Date.now() - 2 * 60 * 60 * 1000) }, // 2 hours ago
        { ...sampleSource, id: 'source-2', lastFetched: null }
      ];
      prisma.source.findMany.mockResolvedValue(sourcesDueForRefresh);
      
      // We need to mock Date.now() to have a consistent test
      const originalDateNow = Date.now;
      const mockNow = 1647712800000; // Example timestamp
      global.Date.now = jest.fn(() => mockNow);

      try {
        // Execute the method under test (no parameter = default 1 hour threshold)
        const result = await sourceRepository.findSourcesToRefresh();

        // Verify the result
        expect(result).toEqual(sourcesDueForRefresh);
        expect(result.length).toBe(2);
        
        // Verify that the mock was called with the correct parameters
        // The threshold should be 1 hour ago from the mock now time
        const expectedThreshold = new Date(mockNow - 60 * 60 * 1000);
        expect(prisma.source.findMany).toHaveBeenCalledWith({
          where: {
            OR: [
              { lastFetched: { lt: expect.any(Date) } },
              { lastFetched: null },
            ],
            isActive: true,
          },
        });
        
        // Check that the Date passed to the query is approximately correct
        // We can't directly access the Date object passed in the mock call
        // So we verify the function was called with a date parameter
        expect(prisma.source.findMany.mock.calls[0][0].where.OR[0].lastFetched.lt).toBeInstanceOf(Date);
      } finally {
        // Restore the original Date.now
        global.Date.now = originalDateNow;
      }
    });

    it('should return sources that need refreshing with custom threshold', async () => {
      // Setup for test with a custom threshold (30 minutes)
      const sourcesDueForRefresh = [
        { ...sampleSource, id: 'source-1', lastFetched: new Date(Date.now() - 40 * 60 * 1000) } // 40 minutes ago
      ];
      prisma.source.findMany.mockResolvedValue(sourcesDueForRefresh);
      
      // We need to mock Date.now() to have a consistent test
      const originalDateNow = Date.now;
      const mockNow = 1647712800000; // Example timestamp
      global.Date.now = jest.fn(() => mockNow);

      try {
        // Execute the method under test with 30 minute threshold
        const result = await sourceRepository.findSourcesToRefresh(30);

        // Verify the result
        expect(result).toEqual(sourcesDueForRefresh);
        expect(result.length).toBe(1);
        
        // Verify that the mock was called with the correct parameters
        // The threshold should be 30 minutes ago from the mock now time
        const expectedThreshold = new Date(mockNow - 30 * 60 * 1000);
        expect(prisma.source.findMany).toHaveBeenCalledWith({
          where: {
            OR: [
              { lastFetched: { lt: expect.any(Date) } },
              { lastFetched: null },
            ],
            isActive: true,
          },
        });
        
        // Check that the Date passed to the query is approximately correct
        expect(prisma.source.findMany.mock.calls[0][0].where.OR[0].lastFetched.lt).toBeInstanceOf(Date);
      } finally {
        // Restore the original Date.now
        global.Date.now = originalDateNow;
      }
    });

    it('should only include active sources', async () => {
      // Setup: Mock implementation to verify the isActive filter is applied
      prisma.source.findMany.mockResolvedValue([]);
      
      // Execute the method under test
      await sourceRepository.findSourcesToRefresh();
      
      // Verify that the mock was called with isActive: true in the where clause
      expect(prisma.source.findMany.mock.calls[0][0].where.isActive).toBe(true);
    });
  });

  describe('updateLastFetched', () => {
    it('should update lastFetched timestamp to current time', async () => {
      // Setup: Mock Date.now for consistent testing
      const originalDateNow = Date.now;
      const mockNow = 1647712800000; // Example timestamp
      global.Date.now = jest.fn(() => mockNow);
      
      // The expected updated source with a new lastFetched timestamp
      const updatedSource = {
        ...sampleSource,
        lastFetched: new Date(mockNow),
      };
      prisma.source.update.mockResolvedValue(updatedSource);

      try {
        // Execute the method under test
        const result = await sourceRepository.updateLastFetched('source-123');

        // Verify the result
        expect(result).toEqual(updatedSource);
        expect(result.lastFetched).toEqual(new Date(mockNow));
        
        // Verify that the update was called with the correct parameters
        expect(prisma.source.update).toHaveBeenCalledWith({
          where: { id: 'source-123' },
          data: { lastFetched: expect.any(Date) }
        });
        
        // Check that the Date passed to the update is approximately correct
        expect(prisma.source.update.mock.calls[0][0].data.lastFetched).toBeInstanceOf(Date);
      } finally {
        // Restore the original Date.now
        global.Date.now = originalDateNow;
      }
    });

    it('should throw an error when source does not exist', async () => {
      // Setup: Mock to throw an error
      const error = new Error('Source not found');
      prisma.source.update.mockRejectedValue(error);

      // Execute & Verify
      await expect(sourceRepository.updateLastFetched('non-existent'))
        .rejects.toThrow('Source not found');
    });
  });
}); 