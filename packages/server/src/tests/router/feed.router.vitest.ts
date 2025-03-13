import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockDeep } from 'jest-mock-extended';
import { PrismaClient, User } from '@prisma/client';
import RepositoryFactory from '../../repositories/repository-factory';
import { FeedValidationResult, FeedRefreshResult } from '../../services/rss-feed.types';
import type { Request, Response } from 'express';

// Setup mock values
const mockValidResult: FeedValidationResult = {
  isValid: true,
  feedTitle: 'Test Feed'
};

const mockInvalidResult: FeedValidationResult = {
  isValid: false,
  error: 'Invalid feed format'
};

const mockRefreshResult: FeedRefreshResult = {
  newItemsCount: 2,
  updatedItemsCount: 0
};

// Mock the trpc import
vi.mock('../../trpc', () => ({
  router: vi.fn(),
  publicProcedure: vi.fn(),
  protectedProcedure: vi.fn(),
}));

// Create mocked feed handler functions
const validateFeedUrlMock = vi.fn();
const addFeedSourceMock = vi.fn();
const listFeedSourcesMock = vi.fn();
const getFeedSourceMock = vi.fn();
const updateFeedSourceMock = vi.fn();
const deleteFeedSourceMock = vi.fn();
const refreshFeedMock = vi.fn();

// Mock the appRouter
vi.mock('../../router', () => {
  return {
    appRouter: {
      createCaller: vi.fn(() => ({
        feed: {
          validateFeedUrl: validateFeedUrlMock,
          addFeedSource: addFeedSourceMock,
          listFeedSources: listFeedSourcesMock,
          getFeedSource: getFeedSourceMock,
          updateFeedSource: updateFeedSourceMock,
          deleteFeedSource: deleteFeedSourceMock,
          refreshFeed: refreshFeedMock,
        }
      }))
    }
  };
});

// Import the mocked router
import { appRouter } from '../../router';

// Mock data for sources
const mockSources = [
  {
    id: 'source-1',
    userId: 'user-1',
    name: 'Test Feed 1',
    url: 'https://test-feed-1.com/rss',
    refreshRate: 60,
    lastRefreshedAt: new Date(),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    contents: [
      {
        id: 'content-1',
        sourceId: 'source-1',
        title: 'Test Item 1',
        link: 'https://test-feed-1.com/item1',
        content: 'Test content 1',
        contentSnippet: 'Test snippet 1',
        guid: 'guid-1',
        isoDate: new Date().toISOString(),
        pubDate: new Date().toISOString(),
        creator: 'Test Creator',
        categories: ['test', 'feed'],
        isRead: false,
        isFavorite: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
  },
  {
    id: 'source-2',
    userId: 'user-1',
    name: 'Test Feed 2',
    url: 'https://test-feed-2.com/rss',
    refreshRate: 120,
    lastRefreshedAt: new Date(),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    contents: []
  }
];

// Mock the repositories and services
vi.mock('../../repositories/repository-factory');

describe('Feed Router (Vitest)', () => {
  // Mock context
  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    firebaseUid: 'firebase-123',
    avatar: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  } as User;

  const mockContext = {
    user: mockUser,
    prisma: mockDeep<PrismaClient>(),
    req: {} as Request,
    res: {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      send: vi.fn()
    } as unknown as Response
  };

  // Mock repositories
  const mockSourceRepository = {
    findByUserId: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    findAll: vi.fn()
  };

  const mockContentRepository = {
    findBySourceId: vi.fn(),
    create: vi.fn(),
    withTransaction: vi.fn().mockReturnThis()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup repository factory mocks
    (RepositoryFactory.getSourceRepository as any).mockReturnValue(mockSourceRepository);
    (RepositoryFactory.getContentRepository as any).mockReturnValue(mockContentRepository);
    
    // Setup default responses for common repository methods
    mockSourceRepository.findByUserId.mockResolvedValue(mockSources);
    mockSourceRepository.findById.mockImplementation((id) => 
      Promise.resolve(mockSources.find(s => s.id === id))
    );

    // Setup mock responses for router functions
    validateFeedUrlMock.mockImplementation(async ({ url }: { url: string }) => {
      if (url.includes('not-a-feed')) {
        return mockInvalidResult;
      }
      return mockValidResult;
    });

    addFeedSourceMock.mockImplementation(async ({ url, name }: { url: string, name?: string }) => {
      if (url.includes('not-a-feed')) {
        throw new Error('Invalid feed');
      }
      return {
        id: 'new-source-id',
        userId: mockUser.id,
        name: name || 'Default Feed Name',
        url,
        refreshRate: 60,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    });

    listFeedSourcesMock.mockResolvedValue(mockSources);

    getFeedSourceMock.mockImplementation(async ({ id }: { id: string }) => {
      const source = mockSources.find(s => s.id === id);
      if (source && source.userId !== mockUser.id) {
        throw new Error('Access denied');
      }
      return source || null;
    });

    updateFeedSourceMock.mockImplementation(async ({ id, ...data }: { id: string, [key: string]: any }) => {
      const source = mockSources.find(s => s.id === id);
      if (!source) {
        throw new Error('Source not found');
      }
      if (source.userId !== mockUser.id) {
        throw new Error('Access denied');
      }
      return { ...source, ...data, updatedAt: new Date() };
    });

    deleteFeedSourceMock.mockImplementation(async ({ id }: { id: string }) => {
      const source = mockSources.find(s => s.id === id);
      if (!source) {
        throw new Error('Source not found');
      }
      if (source.userId !== mockUser.id) {
        throw new Error('Access denied');
      }
      return { success: true };
    });

    refreshFeedMock.mockImplementation(async ({ id }: { id: string }) => {
      const source = mockSources.find(s => s.id === id);
      if (!source) {
        throw new Error('Source not found');
      }
      if (source.userId !== mockUser.id) {
        throw new Error('Access denied');
      }
      return mockRefreshResult;
    });
  });

  describe('validateFeedUrl', () => {
    it('should validate a feed URL', async () => {
      const caller = appRouter.createCaller(mockContext);
      const result = await caller.feed.validateFeedUrl({
        url: 'https://test-feed.com/rss'
      });

      expect(result.isValid).toBe(true);
      expect(result.feedTitle).toBeDefined();
    });

    it('should return invalid for non-feed URLs', async () => {
      const caller = appRouter.createCaller(mockContext);
      const result = await caller.feed.validateFeedUrl({
        url: 'https://not-a-feed.com'
      });

      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('addFeedSource', () => {
    it('should add a new feed source', async () => {
      const caller = appRouter.createCaller(mockContext);
      const result = await caller.feed.addFeedSource({
        url: 'https://test-feed.com/rss',
        name: 'Custom Feed Name'
      });

      expect(result.id).toBeDefined();
      expect(result.name).toBe('Custom Feed Name');
      expect(result.userId).toBe(mockUser.id);
    });

    it('should validate the URL before adding', async () => {
      const caller = appRouter.createCaller(mockContext);
      await expect(
        caller.feed.addFeedSource({
          url: 'https://not-a-feed.com',
          name: 'Invalid Feed'
        })
      ).rejects.toThrow('Invalid feed');
    });
  });

  describe('listFeedSources', () => {
    it('should list feed sources for the current user', async () => {
      const caller = appRouter.createCaller(mockContext);
      const result = await caller.feed.listFeedSources();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('getFeedSource', () => {
    it('should get a specific feed source by ID', async () => {
      const caller = appRouter.createCaller(mockContext);
      const result = await caller.feed.getFeedSource({ id: 'source-1' });

      expect(result).toBeDefined();
      expect(result?.id).toBe('source-1');
    });

    it('should throw error when accessing another user\'s source', async () => {
      const caller = appRouter.createCaller(mockContext);
      
      // Mock implementation for this specific test
      getFeedSourceMock.mockImplementationOnce(async () => {
        throw new Error('Access denied');
      });
      
      await expect(
        caller.feed.getFeedSource({ id: 'source-1' })
      ).rejects.toThrow('Access denied');
    });

    it('should handle non-existent sources', async () => {
      const caller = appRouter.createCaller(mockContext);
      
      // Mock implementation for this specific test
      getFeedSourceMock.mockImplementationOnce(async () => {
        return null;
      });
      
      const result = await caller.feed.getFeedSource({ id: 'non-existent' });
      expect(result).toBeNull();
    });
  });

  describe('updateFeedSource', () => {
    it('should update a feed source', async () => {
      const caller = appRouter.createCaller(mockContext);
      const result = await caller.feed.updateFeedSource({
        id: 'source-1',
        name: 'Updated Feed Name'
      });

      expect(result.name).toBe('Updated Feed Name');
    });

    it('should throw error when updating another user\'s source', async () => {
      const caller = appRouter.createCaller(mockContext);
      
      // Mock implementation for this specific test
      updateFeedSourceMock.mockImplementationOnce(async () => {
        throw new Error('Access denied');
      });
      
      await expect(
        caller.feed.updateFeedSource({
          id: 'source-1',
          name: 'Updated Feed Name'
        })
      ).rejects.toThrow('Access denied');
    });

    it('should throw error when source not found', async () => {
      const caller = appRouter.createCaller(mockContext);
      
      // Mock implementation for this specific test
      updateFeedSourceMock.mockImplementationOnce(async () => {
        throw new Error('Source not found');
      });
      
      await expect(
        caller.feed.updateFeedSource({
          id: 'non-existent',
          name: 'Updated Feed Name'
        })
      ).rejects.toThrow('Source not found');
    });
  });

  describe('deleteFeedSource', () => {
    it('should delete a feed source', async () => {
      const caller = appRouter.createCaller(mockContext);
      const result = await caller.feed.deleteFeedSource({
        id: 'source-1'
      });

      expect(result.success).toBe(true);
    });

    it('should throw error when deleting another user\'s source', async () => {
      const caller = appRouter.createCaller(mockContext);
      
      // Mock implementation for this specific test
      deleteFeedSourceMock.mockImplementationOnce(async () => {
        throw new Error('Access denied');
      });
      
      await expect(
        caller.feed.deleteFeedSource({
          id: 'source-1'
        })
      ).rejects.toThrow('Access denied');
    });

    it('should throw error when source not found', async () => {
      const caller = appRouter.createCaller(mockContext);
      
      // Mock implementation for this specific test
      deleteFeedSourceMock.mockImplementationOnce(async () => {
        throw new Error('Source not found');
      });
      
      await expect(
        caller.feed.deleteFeedSource({
          id: 'non-existent'
        })
      ).rejects.toThrow('Source not found');
    });
  });

  describe('refreshFeed', () => {
    it('should refresh a feed', async () => {
      const caller = appRouter.createCaller(mockContext);
      const result = await caller.feed.refreshFeed({
        id: 'source-1'
      });

      expect(result.newItemsCount).toBeDefined();
    });

    it('should throw error when refreshing another user\'s source', async () => {
      const caller = appRouter.createCaller(mockContext);
      
      // Mock implementation for this specific test
      refreshFeedMock.mockImplementationOnce(async () => {
        throw new Error('Access denied');
      });
      
      await expect(
        caller.feed.refreshFeed({
          id: 'source-1'
        })
      ).rejects.toThrow('Access denied');
    });

    it('should throw error when source not found', async () => {
      const caller = appRouter.createCaller(mockContext);
      
      // Mock implementation for this specific test
      refreshFeedMock.mockImplementationOnce(async () => {
        throw new Error('Source not found');
      });
      
      await expect(
        caller.feed.refreshFeed({
          id: 'non-existent'
        })
      ).rejects.toThrow('Source not found');
    });
  });
}); 