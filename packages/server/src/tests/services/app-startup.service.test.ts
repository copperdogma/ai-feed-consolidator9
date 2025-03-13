import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AppStartupService } from '../../services/app-startup.service';
import feedRefreshService from '../../services/feed-refresh.service';
import { logger } from '../../lib/logger';

// Mock dependencies
vi.mock('../../services/feed-refresh.service', () => ({
  default: {
    start: vi.fn(),
    stop: vi.fn()
  }
}));

vi.mock('../../lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn()
  }
}));

describe('AppStartupService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initialize', () => {
    it('should start the feed refresh service when configured to do so', async () => {
      await AppStartupService.initialize({
        startFeedRefreshService: true,
        feedRefreshIntervalMinutes: 10
      });
      
      expect(feedRefreshService.start).toHaveBeenCalledWith(10);
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Feed refresh service started with 10 minute interval'));
    });

    it('should use default interval when not specified', async () => {
      await AppStartupService.initialize({
        startFeedRefreshService: true
      });
      
      expect(feedRefreshService.start).toHaveBeenCalledWith(5);
    });

    it('should not start feed refresh service when not configured', async () => {
      await AppStartupService.initialize({
        startFeedRefreshService: false
      });
      
      expect(feedRefreshService.start).not.toHaveBeenCalled();
    });

    it('should not start feed refresh service by default', async () => {
      await AppStartupService.initialize();
      
      expect(feedRefreshService.start).not.toHaveBeenCalled();
    });

    it('should handle errors during initialization', async () => {
      const error = new Error('Service startup failed');
      (feedRefreshService.start as any).mockImplementationOnce(() => {
        throw error;
      });
      
      await expect(AppStartupService.initialize({
        startFeedRefreshService: true
      })).rejects.toThrow('Service startup failed');
      
      expect(logger.error).toHaveBeenCalledWith('Error starting application services:', error);
    });
  });

  describe('shutdown', () => {
    it('should stop the feed refresh service', async () => {
      await AppStartupService.shutdown();
      
      expect(feedRefreshService.stop).toHaveBeenCalledTimes(1);
      expect(logger.info).toHaveBeenCalledWith('Application services shut down successfully');
    });

    it('should handle errors during shutdown', async () => {
      const error = new Error('Service shutdown failed');
      (feedRefreshService.stop as any).mockImplementationOnce(() => {
        throw error;
      });
      
      await expect(AppStartupService.shutdown()).rejects.toThrow('Service shutdown failed');
      
      expect(logger.error).toHaveBeenCalledWith('Error shutting down application services:', error);
    });
  });
}); 