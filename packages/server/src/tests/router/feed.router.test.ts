import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { appRouter } from '../../router';
import { mockDeep } from 'jest-mock-extended';
import { PrismaClient, User } from '@prisma/client';
import RepositoryFactory from '../../repositories/repository-factory';
import { mockSources } from '../mocks/rss-feed-mock';
import { FeedValidationResult } from '../../services/rss-feed.types';

// Mock the repositories and services
jest.mock('../../repositories/repository-factory');

describe('Feed Router', () => {
  // Mock context
  const mockUser: User = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    firebaseUid: 'firebase-123',
    avatar: null
  };

  const mockContext = {
    user: mockUser,
    prisma: mockDeep<PrismaClient>()
  };

  // Mock repositories
  const mockSourceRepository = {
    findByUserId: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    findAll: jest.fn()
  };

  const mockContentRepository = {
    findBySourceId: jest.fn(),
    create: jest.fn(),
    withTransaction: jest.fn().mockReturnThis()
  };

  // Mock RSS feed service validation result
  const mockValidationResult: FeedValidationResult = {
    isValid: true,
    feedTitle: 'Test Feed'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup repository factory mocks
    jest.mocked(RepositoryFactory.getSourceRepository).mockReturnValue(mockSourceRepository);
    jest.mocked(RepositoryFactory.getContentRepository).mockReturnValue(mockContentRepository);
    
    // Setup default responses for common repository methods
    mockSourceRepository.findByUserId.mockResolvedValue(mockSources);
    mockSourceRepository.findById.mockImplementation((id) => 
      Promise.resolve(mockSources.find(s => s.id === id))
    );
  });

  describe('validateFeedUrl', () => {
    it('should validate a feed URL', async () => {
      // Mock the feed validation to return true
      mockSourceRepository.create.mockResolvedValue(mockSources[0]);
      
      // Create our own mock for the validateFeedUrl method since we'll be using RssFeedService directly
      global.fetch = jest.fn().mockImplementation(() => 
        Promise.resolve({
          ok: true,
          headers: {
            get: () => 'application/rss+xml'
          },
          text: () => Promise.resolve('<rss version="2.0"><channel><title>Test Feed</title></channel></rss>')
        })
      );

      const result = await appRouter.feed.validateFeedUrl.mutation({
        url: 'https://test-feed.com/rss'
      }, mockContext);

      expect(result.isValid).toBe(true);
      expect(result.feedTitle).toBeDefined();
    });

    it('should return invalid for non-feed URLs', async () => {
      // Mock fetch for an HTML page
      global.fetch = jest.fn().mockImplementation(() => 
        Promise.resolve({
          ok: true,
          headers: {
            get: () => 'text/html'
          },
          text: () => Promise.resolve('<html><body>Not a feed</body></html>')
        })
      );

      const result = await appRouter.feed.validateFeedUrl.mutation({
        url: 'https://not-a-feed.com'
      }, mockContext);

      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('addFeedSource', () => {
    it('should add a new feed source', async () => {
      // Mock the source creation
      mockSourceRepository.create.mockResolvedValue({
        ...mockSources[0],
        name: 'Custom Feed Name'
      });
      
      // Mock validateFeedUrl to return true
      global.fetch = jest.fn().mockImplementation(() => 
        Promise.resolve({
          ok: true,
          headers: {
            get: () => 'application/rss+xml'
          },
          text: () => Promise.resolve('<rss version="2.0"><channel><title>Test Feed</title></channel></rss>')
        })
      );

      const result = await appRouter.feed.addFeedSource.mutation({
        url: 'https://test-feed.com/rss',
        name: 'Custom Feed Name'
      }, mockContext);

      expect(result.id).toBeDefined();
      expect(result.name).toBe('Custom Feed Name');
      expect(result.userId).toBe(mockUser.id);
      expect(mockSourceRepository.create).toHaveBeenCalled();
    });
  });

  describe('listFeedSources', () => {
    it('should list feed sources for the current user', async () => {
      const result = await appRouter.feed.listFeedSources.query(undefined, mockContext);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(mockSourceRepository.findByUserId).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('getFeedSource', () => {
    it('should get a specific feed source by ID', async () => {
      const result = await appRouter.feed.getFeedSource.query({ id: 'source-1' }, mockContext);

      expect(result).toBeDefined();
      expect(result?.id).toBe('source-1');
      expect(mockSourceRepository.findById).toHaveBeenCalledWith('source-1');
    });

    it('should throw error when accessing another user\'s source', async () => {
      // Setup a source belonging to a different user
      mockSourceRepository.findById.mockResolvedValueOnce({
        ...mockSources[0],
        userId: 'different-user-id'
      });

      await expect(
        appRouter.feed.getFeedSource.query({ id: 'source-1' }, mockContext)
      ).rejects.toThrow('Access denied');
    });
  });

  describe('updateFeedSource', () => {
    it('should update a feed source', async () => {
      const updatedSource = {
        ...mockSources[0],
        name: 'Updated Feed Name'
      };
      mockSourceRepository.update.mockResolvedValue(updatedSource);

      const result = await appRouter.feed.updateFeedSource.mutation({
        id: 'source-1',
        name: 'Updated Feed Name'
      }, mockContext);

      expect(result.name).toBe('Updated Feed Name');
      expect(mockSourceRepository.update).toHaveBeenCalledWith('source-1', expect.objectContaining({
        name: 'Updated Feed Name'
      }));
    });

    it('should throw error when updating another user\'s source', async () => {
      // Setup a source belonging to a different user
      mockSourceRepository.findById.mockResolvedValueOnce({
        ...mockSources[0],
        userId: 'different-user-id'
      });

      await expect(
        appRouter.feed.updateFeedSource.mutation({
          id: 'source-1',
          name: 'Updated Feed Name'
        }, mockContext)
      ).rejects.toThrow('Access denied');
    });
  });

  describe('deleteFeedSource', () => {
    it('should delete a feed source', async () => {
      mockSourceRepository.delete.mockResolvedValue(true);

      const result = await appRouter.feed.deleteFeedSource.mutation({
        id: 'source-1'
      }, mockContext);

      expect(result.success).toBe(true);
      expect(mockSourceRepository.delete).toHaveBeenCalledWith('source-1');
    });

    it('should throw error when deleting another user\'s source', async () => {
      // Setup a source belonging to a different user
      mockSourceRepository.findById.mockResolvedValueOnce({
        ...mockSources[0],
        userId: 'different-user-id'
      });

      await expect(
        appRouter.feed.deleteFeedSource.mutation({
          id: 'source-1'
        }, mockContext)
      ).rejects.toThrow('Access denied');
    });
  });

  describe('refreshFeed', () => {
    it('should refresh a feed', async () => {
      mockContentRepository.findBySourceId.mockResolvedValue([]);
      mockContentRepository.create.mockResolvedValue(mockSources[0].contents?.[0] || {});

      // Mock fetch for feed content
      global.fetch = jest.fn().mockImplementation(() => 
        Promise.resolve({
          ok: true,
          headers: {
            get: () => 'application/rss+xml'
          },
          text: () => Promise.resolve(
            '<rss version="2.0"><channel><title>Test Feed</title><item><title>Test Item</title><link>https://test-item.com</link></item></channel></rss>'
          )
        })
      );

      const result = await appRouter.feed.refreshFeed.mutation({
        id: 'source-1'
      }, mockContext);

      expect(result.newItemsCount).toBeGreaterThanOrEqual(0);
      expect(mockSourceRepository.findById).toHaveBeenCalledWith('source-1');
    });

    it('should throw error when refreshing another user\'s source', async () => {
      // Setup a source belonging to a different user
      mockSourceRepository.findById.mockResolvedValueOnce({
        ...mockSources[0],
        userId: 'different-user-id'
      });

      await expect(
        appRouter.feed.refreshFeed.mutation({
          id: 'source-1'
        }, mockContext)
      ).rejects.toThrow('Access denied');
    });
  });
}); 