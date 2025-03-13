import { RssFeedService } from './rss-feed.service';
import RepositoryFactory from '../repositories/repository-factory';
import { BulkFeedRefreshResult } from './rss-feed.types';
import { logger } from '../lib/logger';

/**
 * Background feed refresh service
 * Handles automatic refreshing of feeds based on their refresh rate
 */
export class FeedRefreshService {
  private isRunning: boolean = false;
  private scheduleTimeout: NodeJS.Timeout | null = null;
  private rssFeedService: RssFeedService;

  constructor() {
    const sourceRepository = RepositoryFactory.getSourceRepository();
    const contentRepository = RepositoryFactory.getContentRepository();
    this.rssFeedService = new RssFeedService(sourceRepository, contentRepository);
  }

  /**
   * Start the background refresh service
   * @param checkIntervalMinutes How often to check for feeds to refresh (in minutes)
   */
  public start(checkIntervalMinutes: number = 5): void {
    if (this.isRunning) {
      logger.warn('Feed refresh service is already running');
      return;
    }

    this.isRunning = true;
    logger.info(`Starting feed refresh service with ${checkIntervalMinutes} minute interval`);
    
    // Run immediately on start
    this.runRefreshCycle();
    
    // Schedule regular runs
    const intervalMs = checkIntervalMinutes * 60 * 1000;
    this.scheduleTimeout = setInterval(() => this.runRefreshCycle(), intervalMs);
  }

  /**
   * Stop the background refresh service
   */
  public stop(): void {
    if (!this.isRunning) {
      logger.warn('Feed refresh service is not running');
      return;
    }

    if (this.scheduleTimeout) {
      clearInterval(this.scheduleTimeout);
      this.scheduleTimeout = null;
    }

    this.isRunning = false;
    logger.info('Feed refresh service stopped');
  }

  /**
   * Execute a single refresh cycle
   * @returns Results of the refresh operation
   */
  public async runRefreshCycle(): Promise<BulkFeedRefreshResult> {
    logger.info('Starting feed refresh cycle');
    
    try {
      // Refresh all feeds that haven't been refreshed recently
      // We don't specify olderThanMinutes here to let the repository determine
      // which feeds need refreshing based on their individual refresh rates
      const result = await this.rssFeedService.refreshAllFeeds();
      
      logger.info(`Feed refresh cycle completed: ${result.successfulSources} sources refreshed successfully, ${result.failedSources.length} failures, ${result.newItemsCount} new items`);
      
      if (result.failedSources.length > 0) {
        logger.warn('Some sources failed to refresh:', { failedSources: result.failedSources });
      }
      
      return result;
    } catch (error) {
      logger.error('Error in feed refresh cycle:', error);
      throw error;
    }
  }

  /**
   * Get the current status of the refresh service
   * @returns Object with status information
   */
  public getStatus(): { isRunning: boolean } {
    return { isRunning: this.isRunning };
  }
}

// Singleton instance
const feedRefreshService = new FeedRefreshService();
export default feedRefreshService; 