/**
 * Tests for the ContentRepository implementation
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ContentRepositoryImpl } from '../../repositories/content.repository';
import { PrismaClient } from '@prisma/client';
import { mockPrisma } from '../utils/mock-utils';

describe('ContentRepository', () => {
  let prisma: any;
  let contentRepository: ContentRepositoryImpl;
  
  // Sample content data for testing - only using the fields we need for testing
  const sampleContent = {
    id: 'content-123',
    title: 'Test Content',
    sourceId: 'source-123',
    url: 'https://example.com/content',
    contentText: 'Test content text',
    contentHtml: '<p>Test content html</p>',
    status: 'UNREAD',
    priority: 'MEDIUM',
    author: null,
    publishedAt: new Date(),
    acquiredAt: new Date(),
    lastAccessedAt: null,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    // Create a fresh mock for each test
    prisma = mockPrisma();
    contentRepository = new ContentRepositoryImpl(prisma);
  });

  describe('findById', () => {
    it('should return content when it exists', async () => {
      // Setup the mock to return our sample content
      prisma.content.findUnique.mockResolvedValue(sampleContent);

      // Execute the method under test
      const result = await contentRepository.findById('content-123');

      // Verify the result
      expect(result).toEqual(sampleContent);
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.content.findUnique).toHaveBeenCalledWith({
        where: { id: 'content-123' }
      });
    });

    it('should return null when content does not exist', async () => {
      // Setup the mock to return null
      prisma.content.findUnique.mockResolvedValue(null);

      // Execute the method under test
      const result = await contentRepository.findById('non-existent');

      // Verify the result
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create and return new content', async () => {
      // Setup: The data we want to create
      const newContentData = {
        title: 'New Content',
        sourceId: 'source-123',
        status: 'UNREAD',
        priority: 'LOW',
        url: null,
        contentText: null,
        contentHtml: null,
        author: null,
        publishedAt: new Date(),
        acquiredAt: new Date(),
        lastAccessedAt: null
      };

      // Setup: Mock the create method to return our data plus an ID
      const createdContent = { 
        ...newContentData,
        id: 'new-content-123', 
        createdAt: new Date(),
        updatedAt: new Date() 
      };
      prisma.content.create.mockResolvedValue(createdContent);

      // Execute the method under test
      const result = await contentRepository.create(newContentData);

      // Verify the result
      expect(result).toEqual(createdContent);
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.content.create).toHaveBeenCalledWith({
        data: newContentData
      });
    });
  });

  describe('findBySourceId', () => {
    it('should return content items for a given source ID', async () => {
      // Setup: Create an array of sample content items with the same source ID
      const contentItems = [
        { ...sampleContent, id: 'content-1' },
        { ...sampleContent, id: 'content-2' }
      ];
      prisma.content.findMany.mockResolvedValue(contentItems);

      // Execute the method under test
      const result = await contentRepository.findBySourceId('source-123');

      // Verify the result
      expect(result).toEqual(contentItems);
      expect(result.length).toBe(2);
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.content.findMany).toHaveBeenCalledWith({
        where: { sourceId: 'source-123' }
      });
    });

    it('should return an empty array when no content exists for the source', async () => {
      // Setup: Mock to return an empty array
      prisma.content.findMany.mockResolvedValue([]);

      // Execute the method under test
      const result = await contentRepository.findBySourceId('non-existent-source');

      // Verify the result
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });
  });

  describe('findByStatus', () => {
    it('should return content items with the specified status', async () => {
      // Setup: Create sample content items with specific status
      const unreadItems = [
        { ...sampleContent, id: 'content-1', status: 'UNREAD' },
        { ...sampleContent, id: 'content-2', status: 'UNREAD' }
      ];
      prisma.content.findMany.mockResolvedValue(unreadItems);

      // Execute the method under test
      const result = await contentRepository.findByStatus('UNREAD');

      // Verify the result
      expect(result).toEqual(unreadItems);
      expect(result.length).toBe(2);
      expect(result[0].status).toBe('UNREAD');
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.content.findMany).toHaveBeenCalledWith({
        where: { status: 'UNREAD' }
      });
    });

    it('should return an empty array when no content with status exists', async () => {
      // Setup: Mock to return an empty array
      prisma.content.findMany.mockResolvedValue([]);

      // Execute the method under test
      const result = await contentRepository.findByStatus('ARCHIVED');

      // Verify the result
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });
  });

  describe('findByPriority', () => {
    it('should return content items with the specified priority', async () => {
      // Setup: Create sample content items with specific priority
      const highPriorityItems = [
        { ...sampleContent, id: 'content-1', priority: 'HIGH' },
        { ...sampleContent, id: 'content-2', priority: 'HIGH' }
      ];
      prisma.content.findMany.mockResolvedValue(highPriorityItems);

      // Execute the method under test
      const result = await contentRepository.findByPriority('HIGH');

      // Verify the result
      expect(result).toEqual(highPriorityItems);
      expect(result.length).toBe(2);
      expect(result[0].priority).toBe('HIGH');
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.content.findMany).toHaveBeenCalledWith({
        where: { priority: 'HIGH' }
      });
    });

    it('should return an empty array when no content with priority exists', async () => {
      // Setup: Mock to return an empty array
      prisma.content.findMany.mockResolvedValue([]);

      // Execute the method under test
      const result = await contentRepository.findByPriority('URGENT');

      // Verify the result
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });
  });

  describe('updateStatus', () => {
    it('should update content status and return the updated content', async () => {
      // Setup: Create updated content with new status
      const updatedContent = { 
        ...sampleContent, 
        status: 'READ' 
      };
      prisma.content.update.mockResolvedValue(updatedContent);

      // Execute the method under test
      const result = await contentRepository.updateStatus('content-123', 'READ');

      // Verify the result
      expect(result).toEqual(updatedContent);
      expect(result.status).toBe('READ');
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.content.update).toHaveBeenCalledWith({
        where: { id: 'content-123' },
        data: { status: 'READ' }
      });
    });

    it('should throw an error when content does not exist', async () => {
      // Setup: Mock to throw an error
      const error = new Error('Content not found');
      prisma.content.update.mockRejectedValue(error);

      // Execute & Verify
      await expect(contentRepository.updateStatus('non-existent', 'READ'))
        .rejects.toThrow('Content not found');
    });
  });

  describe('updatePriority', () => {
    it('should update content priority and return the updated content', async () => {
      // Setup: Create updated content with new priority
      const updatedContent = { 
        ...sampleContent, 
        priority: 'HIGH' 
      };
      prisma.content.update.mockResolvedValue(updatedContent);

      // Execute the method under test
      const result = await contentRepository.updatePriority('content-123', 'HIGH');

      // Verify the result
      expect(result).toEqual(updatedContent);
      expect(result.priority).toBe('HIGH');
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.content.update).toHaveBeenCalledWith({
        where: { id: 'content-123' },
        data: { priority: 'HIGH' }
      });
    });

    it('should throw an error when content does not exist', async () => {
      // Setup: Mock to throw an error
      const error = new Error('Content not found');
      prisma.content.update.mockRejectedValue(error);

      // Execute & Verify
      await expect(contentRepository.updatePriority('non-existent', 'HIGH'))
        .rejects.toThrow('Content not found');
    });
  });

  describe('search', () => {
    it('should return content items matching the search term in title or content', async () => {
      // Setup: Create sample search results
      const searchResults = [
        { ...sampleContent, id: 'content-1', title: 'Test search term' },
        { ...sampleContent, id: 'content-2', contentText: 'Some text with search term in it' }
      ];
      prisma.content.findMany.mockResolvedValue(searchResults);

      // Execute the method under test
      const result = await contentRepository.search('search term');

      // Verify the result
      expect(result).toEqual(searchResults);
      expect(result.length).toBe(2);
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.content.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { title: { contains: 'search term', mode: 'insensitive' } },
            { contentText: { contains: 'search term', mode: 'insensitive' } },
          ],
        }
      });
    });

    it('should return an empty array when no matching content exists', async () => {
      // Setup: Mock to return an empty array
      prisma.content.findMany.mockResolvedValue([]);

      // Execute the method under test
      const result = await contentRepository.search('non-existent-term');

      // Verify the result
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });
  });

  describe('withTransaction', () => {
    it('should return a new repository instance with transaction client', () => {
      // Setup: Create a mock transaction client
      const mockTx = mockPrisma();
      
      // Execute the method under test
      const txRepository = contentRepository.withTransaction(mockTx);
      
      // Verify the result
      expect(txRepository).toBeInstanceOf(ContentRepositoryImpl);
      // Note: We cannot easily test the internal state (that it's using the tx client)
      // without exposing internal details
    });
  });

  // Add missing tests for findAll method
  describe('findAll', () => {
    it('should return all content items', async () => {
      // Setup: Create an array of sample content items
      const contentItems = [
        { ...sampleContent, id: 'content-1' },
        { ...sampleContent, id: 'content-2' }
      ];
      prisma.content.findMany.mockResolvedValue(contentItems);

      // Execute the method under test
      const result = await contentRepository.findAll();

      // Verify the result
      expect(result).toEqual(contentItems);
      expect(result.length).toBe(2);
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.content.findMany).toHaveBeenCalledWith({
        skip: undefined,
        take: undefined,
        where: undefined
      });
    });

    it('should return content items with pagination', async () => {
      // Setup: Create an array of sample content items
      const contentItems = [{ ...sampleContent, id: 'content-2' }];
      prisma.content.findMany.mockResolvedValue(contentItems);

      // Execute the method under test with pagination
      const result = await contentRepository.findAll({ skip: 1, take: 1 });

      // Verify the result
      expect(result).toEqual(contentItems);
      expect(result.length).toBe(1);
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.content.findMany).toHaveBeenCalledWith({
        skip: 1,
        take: 1,
        where: undefined
      });
    });

    it('should return filtered content items', async () => {
      // Setup: Create filtered content items
      const contentItems = [
        { ...sampleContent, status: 'READ' }
      ];
      prisma.content.findMany.mockResolvedValue(contentItems);

      // Execute the method under test with filtering
      const result = await contentRepository.findAll({ 
        where: { status: 'READ' } 
      });

      // Verify the result
      expect(result).toEqual(contentItems);
      expect(result.length).toBe(1);
      expect(result[0].status).toBe('READ');
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.content.findMany).toHaveBeenCalledWith({
        skip: undefined,
        take: undefined,
        where: { status: 'READ' }
      });
    });
  });
  
  // Add missing tests for update method
  describe('update', () => {
    it('should update content and return the updated content', async () => {
      // Setup: The data we want to update
      const updateData = {
        title: 'Updated Content Title',
        contentText: 'Updated content text'
      };

      // Setup: Create updated content with new data
      const updatedContent = { 
        ...sampleContent,
        ...updateData,
        updatedAt: new Date()
      };
      prisma.content.update.mockResolvedValue(updatedContent);

      // Execute the method under test
      const result = await contentRepository.update('content-123', updateData);

      // Verify the result
      expect(result).toEqual(updatedContent);
      expect(result.title).toBe('Updated Content Title');
      expect(result.contentText).toBe('Updated content text');
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.content.update).toHaveBeenCalledWith({
        where: { id: 'content-123' },
        data: updateData
      });
    });

    it('should throw an error when content does not exist', async () => {
      // Setup: Mock to throw an error
      const error = new Error('Content not found');
      prisma.content.update.mockRejectedValue(error);

      // Execute & Verify
      await expect(contentRepository.update('non-existent', { title: 'New Title' }))
        .rejects.toThrow('Content not found');
    });
  });
  
  // Add missing tests for delete method
  describe('delete', () => {
    it('should delete content and return true on success', async () => {
      // Setup: Mock the delete method to return the deleted content
      prisma.content.delete.mockResolvedValue(sampleContent);

      // Execute the method under test
      const result = await contentRepository.delete('content-123');

      // Verify the result
      expect(result).toBe(true);
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.content.delete).toHaveBeenCalledWith({
        where: { id: 'content-123' }
      });
    });

    it('should return false when deletion fails', async () => {
      // Setup: Mock to throw an error
      const error = new Error('Content not found');
      prisma.content.delete.mockRejectedValue(error);

      // Execute the method under test
      const result = await contentRepository.delete('non-existent');

      // Verify the result
      expect(result).toBe(false);
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.content.delete).toHaveBeenCalledWith({
        where: { id: 'non-existent' }
      });
    });
  });
  
  // Add missing tests for count method
  describe('count', () => {
    it('should return the number of content items', async () => {
      // Setup: Mock to return a count
      prisma.content.count.mockResolvedValue(10);

      // Execute the method under test
      const result = await contentRepository.count();

      // Verify the result
      expect(result).toBe(10);
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.content.count).toHaveBeenCalledWith({
        where: undefined
      });
    });

    it('should return the number of filtered content items', async () => {
      // Setup: Mock to return a filtered count
      prisma.content.count.mockResolvedValue(5);

      // Execute the method under test with filtering
      const result = await contentRepository.count({ status: 'READ' });

      // Verify the result
      expect(result).toBe(5);
      
      // Verify that the mock was called with the correct parameters
      expect(prisma.content.count).toHaveBeenCalledWith({
        where: { status: 'READ' }
      });
    });
  });
}); 