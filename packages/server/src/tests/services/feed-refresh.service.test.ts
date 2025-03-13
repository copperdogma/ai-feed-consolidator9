import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FeedRefreshService } from '../../services/feed-refresh.service';
import { RssFeedService } from '../../services/rss-feed.service';
import RepositoryFactory from '../../repositories/repository-factory';
import { logger } from '../../lib/logger';

// Mock dependencies
vi.mock('../../repositories/repository-factory', () => ({
  default: {
    getSourceRepository: vi.fn(),
    getContentRepository: vi.fn()
  }
}));

vi.mock('../../services/rss-feed.service', () => ({
  RssFeedService: vi.fn()
}));

vi.mock('../../lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }
}));

describe('FeedRefreshService', () => {
  let feedRefreshService: FeedRefreshService;
  let mockRssFeedService: any;

  const mockRefreshResult = {
    totalProcessed: 5,
    successfulSources: 4,
    failedSources: [{ sourceId: 'source1', error: 'Network error' }],
    newItemsCount: 10,
    updatedItemsCount: 3
  };

  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks();
    
    // Setup mock RSS feed service
    mockRssFeedService = {
      refreshAllFeeds: vi.fn().mockResolvedValue(mockRefreshResult)
    };
    
    (RssFeedService as any).mockImplementation(() => mockRssFeedService);
    
    // Create fresh instance for each test
    feedRefreshService = new FeedRefreshService();
    
    // Mock out setInterval/clearInterval
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('start', () => {
    it('should start the refresh service with default interval', async () => {
      feedRefreshService.start();
      
      expect(feedRefreshService.getStatus().isRunning).toBe(true);
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Starting feed refresh service with 5 minute interval'));
      
      // Should run immediately on start
      expect(mockRssFeedService.refreshAllFeeds).toHaveBeenCalledTimes(1);
    });

    it('should start the refresh service with custom interval', () => {
      feedRefreshService.start(10);
      
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Starting feed refresh service with 10 minute interval'));
    });

    it('should not start if already running', () => {
      feedRefreshService.start();
      vi.clearAllMocks();
      
      feedRefreshService.start();
      
      expect(logger.warn).toHaveBeenCalledWith('Feed refresh service is already running');
    });

    it('should run refresh on the defined interval', () => {
      feedRefreshService.start(1);
      vi.clearAllMocks();
      
      // Fast forward 1 minute
      vi.advanceTimersByTime(60 * 1000);
      
      expect(mockRssFeedService.refreshAllFeeds).toHaveBeenCalledTimes(1);
      
      // Fast forward another minute
      vi.advanceTimersByTime(60 * 1000);
      
      expect(mockRssFeedService.refreshAllFeeds).toHaveBeenCalledTimes(2);
    });
  });

  describe('stop', () => {
    it('should stop the refresh service', () => {
      feedRefreshService.start();
      feedRefreshService.stop();
      
      expect(feedRefreshService.getStatus().isRunning).toBe(false);
      expect(logger.info).toHaveBeenCalledWith('Feed refresh service stopped');
    });

    it('should warn if service is not running', () => {
      feedRefreshService.stop();
      
      expect(logger.warn).toHaveBeenCalledWith('Feed refresh service is not running');
    });

    it('should not run scheduled refreshes after stopping', () => {
      feedRefreshService.start(1);
      vi.clearAllMocks();
      
      feedRefreshService.stop();
      
      // Fast forward 1 minute
      vi.advanceTimersByTime(60 * 1000);
      
      expect(mockRssFeedService.refreshAllFeeds).not.toHaveBeenCalled();
    });
  });

  describe('runRefreshCycle', () => {
    it('should refresh all feeds and return results', async () => {
      const result = await feedRefreshService.runRefreshCycle();
      
      expect(mockRssFeedService.refreshAllFeeds).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockRefreshResult);
      expect(logger.info).toHaveBeenCalledWith('Starting feed refresh cycle');
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Feed refresh cycle completed'));
      expect(logger.warn).toHaveBeenCalledWith(
        'Some sources failed to refresh:',
        { failedSources: mockRefreshResult.failedSources }
      );
    });

    it('should handle errors during refresh cycle', async () => {
      const error = new Error('Refresh failed');
      mockRssFeedService.refreshAllFeeds.mockRejectedValueOnce(error);
      
      await expect(feedRefreshService.runRefreshCycle()).rejects.toThrow('Refresh failed');
      
      expect(logger.error).toHaveBeenCalledWith('Error in feed refresh cycle:', error);
    });

    it('should not log warnings if no failed sources', async () => {
      const successResult = {
        ...mockRefreshResult,
        failedSources: []
      };
      mockRssFeedService.refreshAllFeeds.mockResolvedValueOnce(successResult);
      
      await feedRefreshService.runRefreshCycle();
      
      // Find if any calls to logger.warn contain text about failed sources
      const warningCalls = (logger.warn as any).mock.calls.filter(
        call => call[0] === 'Some sources failed to refresh:'
      );
      
      expect(warningCalls.length).toBe(0);
    });
  });

  describe('getStatus', () => {
    it('should return not running by default', () => {
      expect(feedRefreshService.getStatus()).toEqual({ isRunning: false });
    });

    it('should return running status after start', () => {
      feedRefreshService.start();
      expect(feedRefreshService.getStatus()).toEqual({ isRunning: true });
    });

    it('should return not running status after stop', () => {
      feedRefreshService.start();
      feedRefreshService.stop();
      expect(feedRefreshService.getStatus()).toEqual({ isRunning: false });
    });
  });
}); 