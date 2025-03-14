/**
 * Tests for the TopicRepository implementation
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TopicRepositoryImpl } from '../../repositories/topic.repository';
import { PrismaClient } from '@prisma/client';
import { mockPrisma } from '../utils/mock-utils';

describe('TopicRepository', () => {
  let prisma: any;
  let topicRepository: TopicRepositoryImpl;
  
  // Sample topic data for testing
  const sampleTopic = {
    id: 'topic-123',
    name: 'Test Topic',
    description: 'This is a test topic',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    // Create a fresh mock for each test
    prisma = mockPrisma();
    topicRepository = new TopicRepositoryImpl(prisma);
  });

  describe('findById', () => {
    it('should return topic when it exists', async () => {
      // Setup the mock to return our sample topic
      prisma.topic.findUnique.mockResolvedValue(sampleTopic);

      // Execute the method under test
      const result = await topicRepository.findById('topic-123');

      // Verify the result
      expect(result).toEqual(sampleTopic);
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.topic.findUnique).toHaveBeenCalledWith({
        where: { id: 'topic-123' }
      });
    });

    it('should return null when topic does not exist', async () => {
      // Setup the mock to return null
      prisma.topic.findUnique.mockResolvedValue(null);

      // Execute the method under test
      const result = await topicRepository.findById('non-existent');

      // Verify the result
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all topics', async () => {
      // Setup: Create an array of sample topics
      const topics = [
        { ...sampleTopic, id: 'topic-1' },
        { ...sampleTopic, id: 'topic-2', name: 'Another Topic' }
      ];
      prisma.topic.findMany.mockResolvedValue(topics);

      // Execute the method under test
      const result = await topicRepository.findAll();

      // Verify the result
      expect(result).toEqual(topics);
      expect(result.length).toBe(2);
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.topic.findMany).toHaveBeenCalledWith({
        skip: undefined,
        take: undefined,
        where: undefined
      });
    });

    it('should return topics with pagination', async () => {
      // Setup: Create an array of sample topics
      const topics = [{ ...sampleTopic, id: 'topic-2' }];
      prisma.topic.findMany.mockResolvedValue(topics);

      // Execute the method under test with pagination
      const result = await topicRepository.findAll({ skip: 1, take: 1 });

      // Verify the result
      expect(result).toEqual(topics);
      expect(result.length).toBe(1);
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.topic.findMany).toHaveBeenCalledWith({
        skip: 1,
        take: 1,
        where: undefined
      });
    });

    it('should return topics with filtering', async () => {
      // Setup: Create filtered topics
      const topics = [{ ...sampleTopic, name: 'Specific Topic' }];
      prisma.topic.findMany.mockResolvedValue(topics);

      // Execute the method under test with filtering
      const result = await topicRepository.findAll({ 
        where: { name: 'Specific Topic' } 
      });

      // Verify the result
      expect(result).toEqual(topics);
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('Specific Topic');
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.topic.findMany).toHaveBeenCalledWith({
        skip: undefined,
        take: undefined,
        where: { name: 'Specific Topic' }
      });
    });
  });

  describe('create', () => {
    it('should create and return a new topic', async () => {
      // Setup: The data we want to create
      const newTopicData = {
        name: 'New Topic',
        description: 'A new topic for testing'
      };

      // Setup: Mock the create method to return our data plus an ID
      const createdTopic = { 
        ...newTopicData,
        id: 'new-topic-123', 
        createdAt: new Date(),
        updatedAt: new Date() 
      };
      prisma.topic.create.mockResolvedValue(createdTopic);

      // Execute the method under test
      const result = await topicRepository.create(newTopicData);

      // Verify the result
      expect(result).toEqual(createdTopic);
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.topic.create).toHaveBeenCalledWith({
        data: newTopicData
      });
    });
  });

  describe('update', () => {
    it('should update and return the topic', async () => {
      // Setup: The data we want to update
      const updateData = {
        name: 'Updated Topic Name',
        description: 'Updated description'
      };

      // Setup: Mock the update method to return updated topic
      const updatedTopic = { 
        ...sampleTopic,
        ...updateData,
        updatedAt: new Date() 
      };
      prisma.topic.update.mockResolvedValue(updatedTopic);

      // Execute the method under test
      const result = await topicRepository.update('topic-123', updateData);

      // Verify the result
      expect(result).toEqual(updatedTopic);
      expect(result.name).toBe('Updated Topic Name');
      expect(result.description).toBe('Updated description');
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.topic.update).toHaveBeenCalledWith({
        where: { id: 'topic-123' },
        data: updateData
      });
    });

    it('should throw an error when topic does not exist', async () => {
      // Setup: Mock to throw an error
      const error = new Error('Topic not found');
      prisma.topic.update.mockRejectedValue(error);

      // Execute & Verify
      await expect(topicRepository.update('non-existent', { name: 'New Name' }))
        .rejects.toThrow('Topic not found');
    });
  });

  describe('delete', () => {
    it('should delete topic and return true on success', async () => {
      // Setup: Mock the delete method to return the deleted topic
      prisma.topic.delete.mockResolvedValue(sampleTopic);

      // Execute the method under test
      const result = await topicRepository.delete('topic-123');

      // Verify the result
      expect(result).toBe(true);
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.topic.delete).toHaveBeenCalledWith({
        where: { id: 'topic-123' }
      });
    });

    it('should return false when deletion fails', async () => {
      // Setup: Mock to throw an error
      const error = new Error('Topic not found');
      prisma.topic.delete.mockRejectedValue(error);

      // Execute the method under test
      const result = await topicRepository.delete('non-existent');

      // Verify the result
      expect(result).toBe(false);
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.topic.delete).toHaveBeenCalledWith({
        where: { id: 'non-existent' }
      });
    });
  });

  describe('count', () => {
    it('should return the number of topics', async () => {
      // Setup: Mock to return a count
      prisma.topic.count.mockResolvedValue(10);

      // Execute the method under test
      const result = await topicRepository.count();

      // Verify the result
      expect(result).toBe(10);
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.topic.count).toHaveBeenCalledWith({
        where: undefined
      });
    });

    it('should return the number of filtered topics', async () => {
      // Setup: Mock to return a filtered count
      prisma.topic.count.mockResolvedValue(3);

      // Execute the method under test with filter
      const result = await topicRepository.count({ name: { contains: 'AI' } });

      // Verify the result
      expect(result).toBe(3);
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.topic.count).toHaveBeenCalledWith({
        where: { name: { contains: 'AI' } }
      });
    });
  });

  describe('findByName', () => {
    it('should return topic when name exists', async () => {
      // Setup the mock to return our sample topic
      prisma.topic.findUnique.mockResolvedValue(sampleTopic);

      // Execute the method under test
      const result = await topicRepository.findByName('Test Topic');

      // Verify the result
      expect(result).toEqual(sampleTopic);
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.topic.findUnique).toHaveBeenCalledWith({
        where: { name: 'Test Topic' }
      });
    });

    it('should return null when name does not exist', async () => {
      // Setup the mock to return null
      prisma.topic.findUnique.mockResolvedValue(null);

      // Execute the method under test
      const result = await topicRepository.findByName('Non-existent Topic');

      // Verify the result
      expect(result).toBeNull();
    });
  });

  describe('findByContentId', () => {
    it('should return topics associated with a content ID', async () => {
      // Setup: Create sample topics associated with a content ID
      const contentTopics = [
        { ...sampleTopic, id: 'topic-1' },
        { ...sampleTopic, id: 'topic-2', name: 'Another Topic' }
      ];
      prisma.topic.findMany.mockResolvedValue(contentTopics);

      // Execute the method under test
      const result = await topicRepository.findByContentId('content-123');

      // Verify the result
      expect(result).toEqual(contentTopics);
      expect(result.length).toBe(2);
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.topic.findMany).toHaveBeenCalledWith({
        where: {
          contentTopics: {
            some: {
              contentId: 'content-123',
            },
          },
        },
      });
    });

    it('should return an empty array when no topics are associated with the content ID', async () => {
      // Setup: Mock to return an empty array
      prisma.topic.findMany.mockResolvedValue([]);

      // Execute the method under test
      const result = await topicRepository.findByContentId('content-without-topics');

      // Verify the result
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });
  });
}); 