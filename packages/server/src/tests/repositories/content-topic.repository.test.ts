/**
 * Tests for the ContentTopicRepository implementation
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ContentTopicRepositoryImpl } from '../../repositories/content-topic.repository';
import { PrismaClient } from '@prisma/client';
import { mockPrisma } from '../utils/mock-utils';

describe('ContentTopicRepository', () => {
  let prisma: any;
  let contentTopicRepository: ContentTopicRepositoryImpl;
  
  // Sample content-topic relation data for testing
  const sampleContentTopic = {
    contentId: 'content-123',
    topicId: 'topic-123',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    // Create a fresh mock for each test
    prisma = mockPrisma();
    contentTopicRepository = new ContentTopicRepositoryImpl(prisma);
  });

  describe('findByContentId', () => {
    it('should return content-topic relations for a given content ID', async () => {
      // Setup: Create an array of sample content-topic relations
      const contentTopics = [
        { ...sampleContentTopic },
        { ...sampleContentTopic, topicId: 'topic-456' }
      ];
      prisma.contentTopic.findMany.mockResolvedValue(contentTopics);

      // Execute the method under test
      const result = await contentTopicRepository.findByContentId('content-123');

      // Verify the result
      expect(result).toEqual(contentTopics);
      expect(result.length).toBe(2);
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.contentTopic.findMany).toHaveBeenCalledWith({
        where: { contentId: 'content-123' }
      });
    });

    it('should return an empty array when no relations exist for the content', async () => {
      // Setup: Mock to return an empty array
      prisma.contentTopic.findMany.mockResolvedValue([]);

      // Execute the method under test
      const result = await contentTopicRepository.findByContentId('content-without-topics');

      // Verify the result
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });
  });

  describe('findByTopicId', () => {
    it('should return content-topic relations for a given topic ID', async () => {
      // Setup: Create an array of sample content-topic relations
      const contentTopics = [
        { ...sampleContentTopic },
        { ...sampleContentTopic, contentId: 'content-456' }
      ];
      prisma.contentTopic.findMany.mockResolvedValue(contentTopics);

      // Execute the method under test
      const result = await contentTopicRepository.findByTopicId('topic-123');

      // Verify the result
      expect(result).toEqual(contentTopics);
      expect(result.length).toBe(2);
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.contentTopic.findMany).toHaveBeenCalledWith({
        where: { topicId: 'topic-123' }
      });
    });

    it('should return an empty array when no relations exist for the topic', async () => {
      // Setup: Mock to return an empty array
      prisma.contentTopic.findMany.mockResolvedValue([]);

      // Execute the method under test
      const result = await contentTopicRepository.findByTopicId('topic-without-content');

      // Verify the result
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });
  });

  describe('associate', () => {
    it('should create and return a new content-topic relation', async () => {
      // Setup: Mock the create method to return our sample relation
      prisma.contentTopic.create.mockResolvedValue(sampleContentTopic);

      // Execute the method under test
      const result = await contentTopicRepository.associate('content-123', 'topic-123');

      // Verify the result
      expect(result).toEqual(sampleContentTopic);
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.contentTopic.create).toHaveBeenCalledWith({
        data: {
          contentId: 'content-123',
          topicId: 'topic-123'
        }
      });
    });

    it('should throw an error when the relation already exists', async () => {
      // Setup: Mock to throw a unique constraint error
      const error = new Error('Unique constraint violation');
      prisma.contentTopic.create.mockRejectedValue(error);

      // Execute & Verify
      await expect(contentTopicRepository.associate('content-123', 'topic-123'))
        .rejects.toThrow();
    });
  });

  describe('disassociate', () => {
    it('should delete the relation and return true on success', async () => {
      // Setup: Mock the delete method to return the deleted relation
      prisma.contentTopic.delete.mockResolvedValue(sampleContentTopic);

      // Execute the method under test
      const result = await contentTopicRepository.disassociate('content-123', 'topic-123');

      // Verify the result
      expect(result).toBe(true);
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.contentTopic.delete).toHaveBeenCalledWith({
        where: {
          contentId_topicId: {
            contentId: 'content-123',
            topicId: 'topic-123'
          }
        }
      });
    });

    it('should return false when deletion fails', async () => {
      // Setup: Mock to throw an error
      const error = new Error('Relation not found');
      prisma.contentTopic.delete.mockRejectedValue(error);

      // Execute the method under test
      const result = await contentTopicRepository.disassociate('content-123', 'topic-123');

      // Verify the result
      expect(result).toBe(false);
    });
  });

  describe('count', () => {
    it('should return the number of content-topic relations', async () => {
      // Setup: Mock to return a count
      prisma.contentTopic.count.mockResolvedValue(10);

      // Execute the method under test
      const result = await contentTopicRepository.count();

      // Verify the result
      expect(result).toBe(10);
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.contentTopic.count).toHaveBeenCalledWith({
        where: undefined
      });
    });

    it('should return the number of filtered relations', async () => {
      // Setup: Mock to return a filtered count
      prisma.contentTopic.count.mockResolvedValue(3);

      // Execute the method under test with filter
      const result = await contentTopicRepository.count({ contentId: 'content-123' });

      // Verify the result
      expect(result).toBe(3);
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.contentTopic.count).toHaveBeenCalledWith({
        where: { contentId: 'content-123' }
      });
    });
  });
}); 