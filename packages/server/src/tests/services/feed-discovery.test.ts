import { describe, expect, it, vi, beforeEach } from 'vitest';
import { RssFeedService } from '../../services/rss-feed.service';
import { SourceRepository } from '../../repositories/source.repository';
import { ContentRepository } from '../../repositories/content.repository';
import { FeedDiscoveryResult } from '../../services/rss-feed.types';

// Mock repositories
vi.mock('../../repositories/source.repository');
vi.mock('../../repositories/content.repository');

describe('RSS Feed Discovery', () => {
  let rssFeedService: RssFeedService;
  let mockSourceRepository: any;
  let mockContentRepository: any;

  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();

    // Create mock repositories
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

  describe('discoverFeeds', () => {
    it('should discover valid feeds from HTML with RSS link tags', async () => {
      // Mock HTML containing RSS link tags
      const mockHtml = `
        <html>
          <head>
            <link rel="alternate" type="application/rss+xml" title="Main Feed" href="/feed.xml" />
            <link rel="alternate" type="application/atom+xml" title="Comments Feed" href="https://example.com/comments.atom" />
          </head>
          <body>
            <p>Welcome to my website</p>
          </body>
        </html>
      `;

      // Mock fetch response for website HTML
      const mockHtmlResponse = {
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue('text/html')
        },
        text: vi.fn().mockResolvedValue(mockHtml)
      };

      // Mock validation responses for the discovered feeds
      const mockValidationResponses = [
        { isValid: true, feedTitle: 'Main Feed' },
        { isValid: true, feedTitle: 'Comments Feed' }
      ];

      // Mock the fetch and validation methods
      global.fetch = vi.fn().mockResolvedValueOnce(mockHtmlResponse);
      vi.spyOn(rssFeedService, 'validateFeedUrl')
        .mockResolvedValueOnce(mockValidationResponses[0])
        .mockResolvedValueOnce(mockValidationResponses[1]);

      const result = await rssFeedService.discoverFeeds('https://example.com');

      // Assertions
      expect(result.success).toBe(true);
      expect(result.discoveredFeeds).toHaveLength(2);
      expect(result.discoveredFeeds![0].title).toBe('Main Feed');
      expect(result.discoveredFeeds![1].title).toBe('Comments Feed');
      expect(result.discoveredFeeds![0].url).toContain('/feed.xml');
      expect(result.discoveredFeeds![1].url).toContain('/comments.atom');
    });

    it('should handle websites that are already RSS feeds', async () => {
      // Mock XML content for direct RSS feed
      const mockXml = `
        <rss version="2.0">
          <channel>
            <title>Direct Feed</title>
            <link>https://example.com</link>
            <description>A direct RSS feed</description>
            <item>
              <title>First Post</title>
              <link>https://example.com/post1</link>
            </item>
          </channel>
        </rss>
      `;

      // Mock fetch response for RSS XML
      const mockXmlResponse = {
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue('application/rss+xml')
        },
        text: vi.fn().mockResolvedValue(mockXml)
      };

      // Mock the validateFeedUrl method to return successful validation
      global.fetch = vi.fn().mockResolvedValueOnce(mockXmlResponse);
      vi.spyOn(rssFeedService, 'validateFeedUrl').mockResolvedValueOnce({
        isValid: true,
        feedTitle: 'Direct Feed'
      });

      const result = await rssFeedService.discoverFeeds('https://example.com/feed.xml');

      // Assertions
      expect(result.success).toBe(true);
      expect(result.discoveredFeeds).toHaveLength(1);
      expect(result.discoveredFeeds![0].title).toBe('Direct Feed');
      expect(result.discoveredFeeds![0].url).toBe('https://example.com/feed.xml');
    });

    it('should check common feed paths when no feed links are found', async () => {
      // Mock HTML with no feed links
      const mockHtml = `
        <html>
          <head>
            <title>My Website</title>
          </head>
          <body>
            <p>Welcome to my website</p>
          </body>
        </html>
      `;

      // Mock fetch response for website HTML
      const mockHtmlResponse = {
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue('text/html')
        },
        text: vi.fn().mockResolvedValue(mockHtml)
      };

      // Mock validation responses for common paths
      // Only one path will be valid
      vi.spyOn(rssFeedService, 'validateFeedUrl')
        .mockImplementation(async (url: string) => {
          if (url.includes('/feed')) {
            return { isValid: true, feedTitle: 'WordPress Feed' };
          }
          return { isValid: false, error: 'Not a valid RSS feed' };
        });

      global.fetch = vi.fn().mockResolvedValueOnce(mockHtmlResponse);

      const result = await rssFeedService.discoverFeeds('https://example.com');

      // Assertions
      expect(result.success).toBe(true);
      // We only care that at least one feed was found, not the exact number
      expect(result.discoveredFeeds).toBeDefined();
      expect(result.discoveredFeeds!.length).toBeGreaterThan(0);
      // Check that the WordPress feed is included in the results
      const wordpressFeed = result.discoveredFeeds!.find(feed => feed.title === 'WordPress Feed');
      expect(wordpressFeed).toBeDefined();
      expect(wordpressFeed!.url).toContain('/feed');
    });

    it('should return an error when no feeds are found', async () => {
      // Mock HTML with no feed links
      const mockHtml = `
        <html>
          <head>
            <title>My Website</title>
          </head>
          <body>
            <p>Welcome to my website</p>
          </body>
        </html>
      `;

      // Mock fetch response for website HTML
      const mockHtmlResponse = {
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue('text/html')
        },
        text: vi.fn().mockResolvedValue(mockHtml)
      };

      // Mock validation to always return invalid
      vi.spyOn(rssFeedService, 'validateFeedUrl')
        .mockResolvedValue({ isValid: false, error: 'Not a valid RSS feed' });

      global.fetch = vi.fn().mockResolvedValueOnce(mockHtmlResponse);

      const result = await rssFeedService.discoverFeeds('https://example.com');

      // Assertions
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('No valid RSS/Atom feeds found');
    });

    it('should handle invalid URLs', async () => {
      const result = await rssFeedService.discoverFeeds('not-a-url');

      // Assertions
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('Invalid URL format');
    });

    it('should handle network errors', async () => {
      // Mock fetch to throw a network error
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const result = await rssFeedService.discoverFeeds('https://example.com');

      // Assertions
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('Failed to discover feeds');
    });

    it('should handle HTTP errors', async () => {
      // Mock fetch to return a 404 error
      const mockErrorResponse = {
        ok: false,
        status: 404
      };
      global.fetch = vi.fn().mockResolvedValue(mockErrorResponse);

      const result = await rssFeedService.discoverFeeds('https://example.com');

      // Assertions
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('HTTP error: 404');
    });
  });

  describe('addFeedSource with feed discovery', () => {
    it('should automatically discover and use feed URL when given a website URL', async () => {
      // Mock discoverFeeds to return a valid feed
      vi.spyOn(rssFeedService, 'discoverFeeds').mockResolvedValue({
        success: true,
        discoveredFeeds: [{
          url: 'https://example.com/feed.xml',
          title: 'Discovered Feed'
        }]
      });

      // Mock validateFeedUrl to return valid for the discovered feed
      vi.spyOn(rssFeedService, 'validateFeedUrl').mockResolvedValue({
        isValid: true,
        feedTitle: 'Validated Feed'
      });

      // Mock create to return the created source
      mockSourceRepository.create.mockResolvedValue({
        id: 'source-id',
        name: 'Discovered Feed',
        url: 'https://example.com/feed.xml',
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
        url: 'https://example.com', // Website URL, not a direct feed URL
        userId: 'user-id'
      });

      // Assertions
      expect(rssFeedService.discoverFeeds).toHaveBeenCalledWith('https://example.com');
      expect(rssFeedService.validateFeedUrl).toHaveBeenCalledWith('https://example.com/feed.xml');
      expect(mockSourceRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        url: 'https://example.com/feed.xml', // Should use the discovered feed URL
        name: 'Discovered Feed', // Should use the discovered feed title
        userId: 'user-id'
      }));
      expect(result.url).toBe('https://example.com/feed.xml');
    });

    it('should fall back to direct validation when feed discovery fails', async () => {
      // Mock discoverFeeds to fail
      vi.spyOn(rssFeedService, 'discoverFeeds').mockResolvedValue({
        success: false,
        error: 'No feeds found'
      });

      // Mock validateFeedUrl to succeed for the direct URL
      vi.spyOn(rssFeedService, 'validateFeedUrl').mockResolvedValue({
        isValid: true,
        feedTitle: 'Direct Feed'
      });

      // Mock create to return the created source
      mockSourceRepository.create.mockResolvedValue({
        id: 'source-id',
        name: 'Direct Feed',
        url: 'https://example.com/rss',
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
        url: 'https://example.com/rss', // Direct feed URL
        userId: 'user-id'
      });

      // Assertions
      expect(rssFeedService.validateFeedUrl).toHaveBeenCalledWith('https://example.com/rss');
      expect(mockSourceRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        url: 'https://example.com/rss', // Should use the original URL
        name: 'Direct Feed',
        userId: 'user-id'
      }));
      expect(result.url).toBe('https://example.com/rss');
    });

    it('should not attempt discovery for URLs that look like feed URLs', async () => {
      // Mock validateFeedUrl to succeed
      vi.spyOn(rssFeedService, 'validateFeedUrl').mockResolvedValue({
        isValid: true,
        feedTitle: 'Direct Feed'
      });

      // We need to spy on discoverFeeds to check it's not called
      const discoverFeedsSpy = vi.spyOn(rssFeedService, 'discoverFeeds');

      // Mock create to return the created source
      mockSourceRepository.create.mockResolvedValue({
        id: 'source-id',
        name: 'Direct Feed',
        url: 'https://example.com/atom.xml',
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
        url: 'https://example.com/atom.xml', // URL with feed extension
        userId: 'user-id'
      });

      // Assertions
      expect(discoverFeedsSpy).not.toHaveBeenCalled();
      expect(rssFeedService.validateFeedUrl).toHaveBeenCalledWith('https://example.com/atom.xml');
      expect(mockSourceRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        url: 'https://example.com/atom.xml',
        name: 'Direct Feed',
        userId: 'user-id'
      }));
      expect(result.url).toBe('https://example.com/atom.xml');
    });
  });
}); 