import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import feedRefreshService from '../services/feed-refresh.service';

/**
 * Admin router for system administration tasks
 */
export const adminRouter = router({
  /**
   * Get the current status of the feed refresh service
   */
  getFeedRefreshStatus: protectedProcedure
    .query(async ({ ctx }) => {
      // Verify admin rights
      if (!isAdmin(ctx.user)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Admin access required',
        });
      }

      return feedRefreshService.getStatus();
    }),

  /**
   * Start the feed refresh service
   */
  startFeedRefreshService: protectedProcedure
    .input(
      z.object({
        checkIntervalMinutes: z.number().int().min(1).max(60).default(5),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify admin rights
      if (!isAdmin(ctx.user)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Admin access required',
        });
      }

      feedRefreshService.start(input.checkIntervalMinutes);
      return { success: true, message: 'Feed refresh service started' };
    }),

  /**
   * Stop the feed refresh service
   */
  stopFeedRefreshService: protectedProcedure
    .mutation(async ({ ctx }) => {
      // Verify admin rights
      if (!isAdmin(ctx.user)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Admin access required',
        });
      }

      feedRefreshService.stop();
      return { success: true, message: 'Feed refresh service stopped' };
    }),

  /**
   * Run a manual feed refresh cycle
   */
  runFeedRefreshCycle: protectedProcedure
    .mutation(async ({ ctx }) => {
      // Verify admin rights
      if (!isAdmin(ctx.user)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Admin access required',
        });
      }

      const result = await feedRefreshService.runRefreshCycle();
      return { 
        success: true,
        result
      };
    }),
});

/**
 * Helper function to check if a user has admin rights
 */
function isAdmin(user: any): boolean {
  // This is a placeholder - implement your actual admin check logic
  // For example, check a role field on the user object
  return user?.role === 'ADMIN';
} 