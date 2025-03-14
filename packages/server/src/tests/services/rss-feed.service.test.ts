import { describe, expect, it, vi, beforeEach } from 'vitest';
import { RssFeedService } from '../../services/rss-feed.service';
import { SourceRepository } from '../../repositories/source.repository';
import { ContentRepository } from '../../repositories/content.repository';
import { PrismaClient } from '@prisma/client';

// Mock repositories
vi.mock('../../repositories/source.repository');
vi.mock('../../repositories/content.repository');

describe('RssFeedService', () => {
  let rssFeedService: RssFeedService;
  let mockSourceRepository: any;
  let mockContentRepository: any;
  let mockPrismaClient: PrismaClient;

  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();

    // Create mock repositories
    mockPrismaClient = {} as PrismaClient;
    mockSourceRepository = {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      count: vi.fn(),
      findByUserId: vi.fn(),
      findByType: vi.fn(),
      findSourcesToRefresh: vi.fn(),
      updateLastFetched: vi.fn()
    };

    mockContentRepository = {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      count: vi.fn(),
      findBySourceId: vi.fn(),
      findByStatus: vi.fn(),
      findByPriority: vi.fn(),
      updateStatus: vi.fn(),
      updatePriority: vi.fn(),
      search: vi.fn(),
      withTransaction: vi.fn().mockReturnThis()
    };

    // Initialize service with mocks
    rssFeedService = new RssFeedService(mockSourceRepository, mockContentRepository);
  });

  describe('validateFeedUrl', () => {
    it('should return true for valid RSS/Atom feed URLs', async () => {
      // Mock implementation
      const mockFetchResponse = {
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue('application/rss+xml')
        },
        text: vi.fn().mockResolvedValue('<rss version="2.0"><channel><title>Test Feed</title></channel></rss>')
      };
      global.fetch = vi.fn().mockResolvedValue(mockFetchResponse);

      const result = await rssFeedService.validateFeedUrl('https://valid-feed.com/rss');
      expect(result.isValid).toBe(true);
      expect(result.feedTitle).toBe('Test Feed');
    });

    it('should return false for invalid URLs', async () => {
      // Mock fetch to throw for invalid URLs
      global.fetch = vi.fn().mockImplementation((url: string) => {
        throw new Error('Invalid URL format');
      });
      
      const result = await rssFeedService.validateFeedUrl('not-a-url');
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return false for non-feed URLs', async () => {
      // Mock implementation for non-feed response
      const mockFetchResponse = {
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue('text/html')
        },
        text: vi.fn().mockResolvedValue('<html><body>Not a feed</body></html>')
      };
      global.fetch = vi.fn().mockResolvedValue(mockFetchResponse);

      const result = await rssFeedService.validateFeedUrl('https://not-a-feed.com');
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle network errors', async () => {
      // Mock implementation for network error
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const result = await rssFeedService.validateFeedUrl('https://error-feed.com');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Network error');
    });

    it('should add https protocol to URLs without a protocol', async () => {
      // Mock fetch to return a valid RSS feed
      const mockFetchResponse = {
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue('application/rss+xml')
        },
        text: vi.fn().mockResolvedValue('<rss version="2.0"><channel><title>Test Feed</title></channel></rss>')
      };
      global.fetch = vi.fn().mockResolvedValue(mockFetchResponse);

      // Call the method with a URL that doesn't have a protocol
      const result = await rssFeedService.validateFeedUrl('example.com');

      // Verify protocol was added by checking the fetch call
      expect(global.fetch).toHaveBeenCalledWith('https://example.com');
      expect(result.isValid).toBe(true);
    });
  });

  describe('addFeedSource', () => {
    it('should add a new RSS feed source', async () => {
      // Mock validateFeedUrl to return valid
      vi.spyOn(rssFeedService, 'validateFeedUrl').mockResolvedValue({ 
        isValid: true, 
        feedTitle: 'Test Feed' 
      });

      // Mock create to return the created source
      mockSourceRepository.create.mockResolvedValue({
        id: 'source-id',
        name: 'Test Feed',
        url: 'https://test-feed.com/rss',
        sourceType: 'RSS',
        userId: 'user-id',
        isActive: true,
        refreshRate: 60,
        lastFetched: null,
        settings: { fetchFullText: false },
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const result = await rssFeedService.addFeedSource({
        url: 'https://test-feed.com/rss',
        userId: 'user-id',
        name: 'Custom Name', // Optional custom name
        refreshRate: 30 // Optional custom refresh rate
      });

      expect(mockSourceRepository.create).toHaveBeenCalled();
      expect(result.id).toBe('source-id');
      expect(result.name).toBe('Test Feed'); // Should use feed title since custom name was not provided
      expect(result.sourceType).toBe('RSS');
    });

    it('should not add an invalid feed source', async () => {
      // Mock validateFeedUrl to return invalid
      vi.spyOn(rssFeedService, 'validateFeedUrl').mockResolvedValue({ 
        isValid: false, 
        error: 'Invalid feed' 
      });

      await expect(rssFeedService.addFeedSource({
        url: 'https://invalid-feed.com',
        userId: 'user-id'
      })).rejects.toThrow('Invalid feed');

      expect(mockSourceRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('fetchFeedContent', () => {
    it('should fetch and process feed content', async () => {
      // Mock feed data
      const mockFeedData = {
        title: 'Test Feed',
        items: [
          {
            title: 'Article 1',
            link: 'https://test-feed.com/article1',
            pubDate: new Date().toISOString(),
            content: 'Article 1 content',
            contentSnippet: 'Article 1 snippet'
          },
          {
            title: 'Article 2',
            link: 'https://test-feed.com/article2',
            pubDate: new Date().toISOString(),
            content: 'Article 2 content',
            contentSnippet: 'Article 2 snippet'
          }
        ]
      };

      // Mock the feed parser
      vi.spyOn(rssFeedService as any, 'parseFeed').mockResolvedValue(mockFeedData);

      // Mock source repository
      mockSourceRepository.findById.mockResolvedValue({
        id: 'source-id',
        name: 'Test Feed',
        url: 'https://test-feed.com/rss',
        sourceType: 'RSS',
        userId: 'user-id',
        isActive: true,
        refreshRate: 60,
        lastFetched: null,
        settings: { fetchFullText: false },
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Mock content repository
      mockContentRepository.findBySourceId.mockResolvedValue([]);
      mockContentRepository.create.mockResolvedValueOnce({
        id: 'content-id-1',
        title: 'Article 1',
        url: 'https://test-feed.com/article1',
        sourceId: 'source-id',
        publishedAt: expect.any(Date),
        contentText: 'Article 1 snippet',
        contentHtml: 'Article 1 content',
        status: 'UNREAD',
        priority: 'MEDIUM',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      }).mockResolvedValueOnce({
        id: 'content-id-2',
        title: 'Article 2',
        url: 'https://test-feed.com/article2',
        sourceId: 'source-id',
        publishedAt: expect.any(Date),
        contentText: 'Article 2 snippet',
        contentHtml: 'Article 2 content',
        status: 'UNREAD',
        priority: 'MEDIUM',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      });

      const result = await rssFeedService.fetchFeedContent('source-id');

      expect(mockSourceRepository.findById).toHaveBeenCalledWith('source-id');
      expect(mockContentRepository.findBySourceId).toHaveBeenCalledWith('source-id');
      expect(mockContentRepository.create).toHaveBeenCalledTimes(2);
      expect(mockSourceRepository.updateLastFetched).toHaveBeenCalledWith('source-id');
      expect(result.newItemsCount).toBe(2);
    });

    it('should handle errors when fetching feed content', async () => {
      // Mock source repository
      mockSourceRepository.findById.mockResolvedValue({
        id: 'source-id',
        name: 'Test Feed',
        url: 'https://test-feed.com/rss',
        sourceType: 'RSS',
        userId: 'user-id',
        isActive: true,
        refreshRate: 60,
        lastFetched: null,
        settings: { fetchFullText: false },
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Mock error in feed parser
      vi.spyOn(rssFeedService as any, 'parseFeed').mockRejectedValue(new Error('Parse error'));

      await expect(rssFeedService.fetchFeedContent('source-id')).rejects.toThrow('Parse error');
      expect(mockSourceRepository.updateLastFetched).not.toHaveBeenCalled();
    });
  });

  describe('refreshAllFeeds', () => {
    it('should refresh all feeds due for refresh', async () => {
      // Mock sources that need refresh
      mockSourceRepository.findSourcesToRefresh.mockResolvedValue([
        {
          id: 'source-id-1',
          name: 'Feed 1',
          url: 'https://feed1.com/rss',
          sourceType: 'RSS',
          userId: 'user-id',
          isActive: true,
          refreshRate: 60,
          lastFetched: new Date(Date.now() - 120 * 60 * 1000), // 2 hours ago
          settings: { fetchFullText: false },
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'source-id-2',
          name: 'Feed 2',
          url: 'https://feed2.com/rss',
          sourceType: 'RSS',
          userId: 'user-id',
          isActive: true,
          refreshRate: 30,
          lastFetched: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
          settings: { fetchFullText: true },
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);

      // Mock fetchFeedContent to succeed
      vi.spyOn(rssFeedService, 'fetchFeedContent')
        .mockResolvedValueOnce({ newItemsCount: 5, updatedItemsCount: 0 })
        .mockResolvedValueOnce({ newItemsCount: 3, updatedItemsCount: 0 });

      const result = await rssFeedService.refreshAllFeeds();

      expect(mockSourceRepository.findSourcesToRefresh).toHaveBeenCalled();
      expect(rssFeedService.fetchFeedContent).toHaveBeenCalledTimes(2);
      expect(rssFeedService.fetchFeedContent).toHaveBeenCalledWith('source-id-1');
      expect(rssFeedService.fetchFeedContent).toHaveBeenCalledWith('source-id-2');
      expect(result.totalProcessed).toBe(2);
      expect(result.newItemsCount).toBe(8);
    });

    it('should handle errors in individual feed refreshes', async () => {
      // Mock sources that need refresh
      mockSourceRepository.findSourcesToRefresh.mockResolvedValue([
        { id: 'source-id-1', url: 'https://feed1.com/rss', sourceType: 'RSS' },
        { id: 'source-id-2', url: 'https://feed2.com/rss', sourceType: 'RSS' }
      ]);

      // Mock fetchFeedContent to succeed for first, fail for second
      vi.spyOn(rssFeedService, 'fetchFeedContent')
        .mockResolvedValueOnce({ newItemsCount: 5, updatedItemsCount: 0 })
        .mockRejectedValueOnce(new Error('Failed to fetch'));

      const result = await rssFeedService.refreshAllFeeds();

      expect(result.totalProcessed).toBe(1);
      expect(result.failedSources).toHaveLength(1);
      expect(result.failedSources[0].id).toBe('source-id-2');
      expect(result.newItemsCount).toBe(5);
    });
  });
}); 