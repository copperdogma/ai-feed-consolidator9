import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { RssFeedService } from '../services/rss-feed.service';
import { FeedValidationResult, FeedRefreshResult, FeedDiscoveryResult } from '../services/rss-feed.types';
import RepositoryFactory from '../repositories/repository-factory';

/**
 * Router for feed-related operations
 */
export const feedRouter = router({
  /**
   * Validate an RSS feed URL
   */
  validateFeedUrl: protectedProcedure
    .input(
      z.object({
        url: z.string().min(1, "URL is required")
      })
    )
    .mutation(async ({ ctx, input }): Promise<FeedValidationResult> => {
      const sourceRepository = RepositoryFactory.getSourceRepository();
      const contentRepository = RepositoryFactory.getContentRepository();
      const feedService = new RssFeedService(sourceRepository, contentRepository);

      const result = await feedService.validateFeedUrl(input.url);
      return result;
    }),

  /**
   * Discover feeds from a website URL
   */
  discoverFeeds: protectedProcedure
    .input(
      z.object({
        url: z.string().min(1, "URL is required")
      })
    )
    .mutation(async ({ ctx, input }): Promise<FeedDiscoveryResult> => {
      const sourceRepository = RepositoryFactory.getSourceRepository();
      const contentRepository = RepositoryFactory.getContentRepository();
      const feedService = new RssFeedService(sourceRepository, contentRepository);

      const result = await feedService.discoverFeeds(input.url);
      return result;
    }),

  /**
   * Add a new feed source
   */
  addFeedSource: protectedProcedure
    .input(
      z.object({
        url: z.string().url(),
        name: z.string().optional(),
        refreshRate: z.number().min(5).max(1440).optional(), // Between 5 mins and 24 hours
        settings: z.record(z.any()).optional()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const sourceRepository = RepositoryFactory.getSourceRepository();
      const contentRepository = RepositoryFactory.getContentRepository();
      const feedService = new RssFeedService(sourceRepository, contentRepository);

      const source = await feedService.addFeedSource({
        url: input.url,
        userId: ctx.user.id,
        name: input.name,
        refreshRate: input.refreshRate,
        settings: input.settings
      });

      return source;
    }),

  /**
   * List all feed sources for the current user
   */
  listFeedSources: protectedProcedure
    .query(async ({ ctx }) => {
      const sourceRepository = RepositoryFactory.getSourceRepository();
      
      const sources = await sourceRepository.findByUserId(ctx.user.id);
      return sources;
    }),

  /**
   * Get a specific feed source by ID
   */
  getFeedSource: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid()
      })
    )
    .query(async ({ ctx, input }) => {
      const sourceRepository = RepositoryFactory.getSourceRepository();
      
      const source = await sourceRepository.findById(input.id);
      
      // Ensure the user can only access their own sources
      if (source && source.userId !== ctx.user.id) {
        throw new Error('Access denied');
      }
      
      return source;
    }),

  /**
   * Update a feed source
   */
  updateFeedSource: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().optional(),
        isActive: z.boolean().optional(),
        refreshRate: z.number().min(5).max(1440).optional(),
        settings: z.record(z.any()).optional()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const sourceRepository = RepositoryFactory.getSourceRepository();
      
      // Ensure the user owns this source
      const source = await sourceRepository.findById(input.id);
      if (!source) {
        throw new Error('Source not found');
      }
      if (source.userId !== ctx.user.id) {
        throw new Error('Access denied');
      }
      
      // Update the source
      const { id, ...updateData } = input;
      const updatedSource = await sourceRepository.update(id, updateData);
      
      return updatedSource;
    }),

  /**
   * Delete a feed source
   */
  deleteFeedSource: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const sourceRepository = RepositoryFactory.getSourceRepository();
      
      // Ensure the user owns this source
      const source = await sourceRepository.findById(input.id);
      if (!source) {
        throw new Error('Source not found');
      }
      if (source.userId !== ctx.user.id) {
        throw new Error('Access denied');
      }
      
      // Delete the source (related content will be cascade deleted)
      const result = await sourceRepository.delete(input.id);
      
      return { success: result };
    }),

  /**
   * Manually refresh a feed source
   */
  refreshFeed: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid()
      })
    )
    .mutation(async ({ ctx, input }): Promise<FeedRefreshResult> => {
      const sourceRepository = RepositoryFactory.getSourceRepository();
      const contentRepository = RepositoryFactory.getContentRepository();
      const feedService = new RssFeedService(sourceRepository, contentRepository);
      
      // Ensure the user owns this source
      const source = await sourceRepository.findById(input.id);
      if (!source) {
        throw new Error('Source not found');
      }
      if (source.userId !== ctx.user.id) {
        throw new Error('Access denied');
      }
      
      // Refresh the feed
      const result = await feedService.fetchFeedContent(input.id);
      
      return result;
    }),
}); 