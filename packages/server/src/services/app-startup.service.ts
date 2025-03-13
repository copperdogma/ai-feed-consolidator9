import { logger } from '../lib/logger';
import feedRefreshService from './feed-refresh.service';

/**
 * Service responsible for application startup tasks
 * This centralizes initialization of background services
 * and other startup processes
 */
export class AppStartupService {
  /**
   * Initialize all application services on startup
   * @param options Startup configuration options
   */
  public static async initialize(options: StartupOptions = {}): Promise<void> {
    logger.info('Starting application services...');
    
    try {
      // Start feed refresh service if configured to do so
      if (options.startFeedRefreshService) {
        logger.info('Initializing feed refresh service...');
        
        const interval = options.feedRefreshIntervalMinutes || 5;
        feedRefreshService.start(interval);
        
        logger.info(`Feed refresh service started with ${interval} minute interval`);
      }
      
      logger.info('Application services started successfully');
    } catch (error) {
      logger.error('Error starting application services:', error);
      throw error;
    }
  }
  
  /**
   * Shutdown all application services gracefully
   */
  public static async shutdown(): Promise<void> {
    logger.info('Shutting down application services...');
    
    try {
      // Stop feed refresh service
      feedRefreshService.stop();
      
      logger.info('Application services shut down successfully');
    } catch (error) {
      logger.error('Error shutting down application services:', error);
      throw error;
    }
  }
}

/**
 * Configuration options for application startup
 */
export interface StartupOptions {
  /**
   * Whether to start the feed refresh service on startup
   */
  startFeedRefreshService?: boolean;
  
  /**
   * Interval in minutes between feed refresh cycles
   */
  feedRefreshIntervalMinutes?: number;
} 