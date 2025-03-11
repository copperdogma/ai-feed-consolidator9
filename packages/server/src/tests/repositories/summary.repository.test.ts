/**
 * Tests for the SummaryRepository implementation
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { SummaryRepositoryImpl } from '../../repositories/summary.repository';
import { PrismaClient } from '@prisma/client';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

// Mock the PrismaClient
type MockPrismaClient = DeepMockProxy<PrismaClient>;

describe('SummaryRepository', () => {
  let prisma: MockPrismaClient;
  let summaryRepository: SummaryRepositoryImpl;
  
  // Sample summary data for testing
  const sampleSummary = {
    id: 'summary-123',
    contentId: 'content-123',
    summary: 'This is a test summary',
    keyPoints: ['Point 1', 'Point 2', 'Point 3'],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    // Create a fresh mock for each test
    prisma = mockDeep<PrismaClient>();
    summaryRepository = new SummaryRepositoryImpl(prisma as any);
  });

  describe('findById', () => {
    it('should return summary when it exists', async () => {
      // Setup the mock to return our sample summary
      prisma.summary.findUnique.mockResolvedValue(sampleSummary);

      // Execute the method under test
      const result = await summaryRepository.findById('summary-123');

      // Verify the result
      expect(result).toEqual(sampleSummary);
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.summary.findUnique).toHaveBeenCalledWith({
        where: { id: 'summary-123' }
      });
    });

    it('should return null when summary does not exist', async () => {
      // Setup the mock to return null
      prisma.summary.findUnique.mockResolvedValue(null);

      // Execute the method under test
      const result = await summaryRepository.findById('non-existent');

      // Verify the result
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all summaries', async () => {
      // Setup: Create an array of sample summaries
      const summaries = [
        { ...sampleSummary, id: 'summary-1' },
        { ...sampleSummary, id: 'summary-2', summary: 'Another summary' }
      ];
      prisma.summary.findMany.mockResolvedValue(summaries);

      // Execute the method under test
      const result = await summaryRepository.findAll();

      // Verify the result
      expect(result).toEqual(summaries);
      expect(result.length).toBe(2);
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.summary.findMany).toHaveBeenCalledWith({
        skip: undefined,
        take: undefined,
        where: undefined
      });
    });

    it('should return summaries with pagination', async () => {
      // Setup: Create an array of sample summaries
      const summaries = [{ ...sampleSummary, id: 'summary-2' }];
      prisma.summary.findMany.mockResolvedValue(summaries);

      // Execute the method under test with pagination
      const result = await summaryRepository.findAll({ skip: 1, take: 1 });

      // Verify the result
      expect(result).toEqual(summaries);
      expect(result.length).toBe(1);
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.summary.findMany).toHaveBeenCalledWith({
        skip: 1,
        take: 1,
        where: undefined
      });
    });

    it('should return summaries with filtering', async () => {
      // Setup: Create filtered summaries
      const summaries = [{ ...sampleSummary, contentId: 'specific-content-id' }];
      prisma.summary.findMany.mockResolvedValue(summaries);

      // Execute the method under test with filtering
      const result = await summaryRepository.findAll({ 
        where: { contentId: 'specific-content-id' } 
      });

      // Verify the result
      expect(result).toEqual(summaries);
      expect(result.length).toBe(1);
      expect(result[0].contentId).toBe('specific-content-id');
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.summary.findMany).toHaveBeenCalledWith({
        skip: undefined,
        take: undefined,
        where: { contentId: 'specific-content-id' }
      });
    });
  });

  describe('create', () => {
    it('should create and return a new summary', async () => {
      // Setup: The data we want to create
      const newSummaryData = {
        contentId: 'content-456',
        summary: 'New summary text',
        keyPoints: ['New point 1', 'New point 2']
      };

      // Setup: Mock the create method to return our data plus an ID
      const createdSummary = { 
        ...newSummaryData,
        id: 'new-summary-123', 
        createdAt: new Date(),
        updatedAt: new Date() 
      };
      prisma.summary.create.mockResolvedValue(createdSummary);

      // Execute the method under test
      const result = await summaryRepository.create(newSummaryData);

      // Verify the result
      expect(result).toEqual(createdSummary);
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.summary.create).toHaveBeenCalledWith({
        data: newSummaryData
      });
    });
  });

  describe('update', () => {
    it('should update and return the summary', async () => {
      // Setup: The data we want to update
      const updateData = {
        summary: 'Updated summary text',
        keyPoints: ['Updated point 1', 'Updated point 2', 'Updated point 3']
      };

      // Setup: Mock the update method to return updated summary
      const updatedSummary = { 
        ...sampleSummary,
        ...updateData,
        updatedAt: new Date() 
      };
      prisma.summary.update.mockResolvedValue(updatedSummary);

      // Execute the method under test
      const result = await summaryRepository.update('summary-123', updateData);

      // Verify the result
      expect(result).toEqual(updatedSummary);
      expect(result.summary).toBe('Updated summary text');
      expect(result.keyPoints).toEqual(['Updated point 1', 'Updated point 2', 'Updated point 3']);
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.summary.update).toHaveBeenCalledWith({
        where: { id: 'summary-123' },
        data: updateData
      });
    });

    it('should throw an error when summary does not exist', async () => {
      // Setup: Mock to throw an error
      const error = new Error('Summary not found');
      prisma.summary.update.mockRejectedValue(error);

      // Execute & Verify
      await expect(summaryRepository.update('non-existent', { summary: 'New text' }))
        .rejects.toThrow('Summary not found');
    });
  });

  describe('delete', () => {
    it('should delete summary and return true on success', async () => {
      // Setup: Mock the delete method to return the deleted summary
      prisma.summary.delete.mockResolvedValue(sampleSummary);

      // Execute the method under test
      const result = await summaryRepository.delete('summary-123');

      // Verify the result
      expect(result).toBe(true);
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.summary.delete).toHaveBeenCalledWith({
        where: { id: 'summary-123' }
      });
    });

    it('should return false when deletion fails', async () => {
      // Setup: Mock to throw an error
      const error = new Error('Summary not found');
      prisma.summary.delete.mockRejectedValue(error);

      // Execute the method under test
      const result = await summaryRepository.delete('non-existent');

      // Verify the result
      expect(result).toBe(false);
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.summary.delete).toHaveBeenCalledWith({
        where: { id: 'non-existent' }
      });
    });
  });

  describe('count', () => {
    it('should return the number of summaries', async () => {
      // Setup: Mock to return a count
      prisma.summary.count.mockResolvedValue(10);

      // Execute the method under test
      const result = await summaryRepository.count();

      // Verify the result
      expect(result).toBe(10);
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.summary.count).toHaveBeenCalledWith({
        where: undefined
      });
    });

    it('should return the number of filtered summaries', async () => {
      // Setup: Mock to return a filtered count
      prisma.summary.count.mockResolvedValue(3);

      // Execute the method under test with filter
      const result = await summaryRepository.count({ contentId: 'content-123' });

      // Verify the result
      expect(result).toBe(3);
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.summary.count).toHaveBeenCalledWith({
        where: { contentId: 'content-123' }
      });
    });
  });

  describe('findByContentId', () => {
    it('should return summary when content ID exists', async () => {
      // Setup the mock to return our sample summary
      prisma.summary.findUnique.mockResolvedValue(sampleSummary);

      // Execute the method under test
      const result = await summaryRepository.findByContentId('content-123');

      // Verify the result
      expect(result).toEqual(sampleSummary);
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.summary.findUnique).toHaveBeenCalledWith({
        where: { contentId: 'content-123' }
      });
    });

    it('should return null when content ID does not exist', async () => {
      // Setup the mock to return null
      prisma.summary.findUnique.mockResolvedValue(null);

      // Execute the method under test
      const result = await summaryRepository.findByContentId('non-existent-content');

      // Verify the result
      expect(result).toBeNull();
    });
  });
}); 