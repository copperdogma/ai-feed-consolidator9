import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TRPCError } from '@trpc/server';
import { appRouter } from '../../router';
import feedRefreshService from '../../services/feed-refresh.service';

// Mock dependencies
vi.mock('../../services/feed-refresh.service', () => ({
  default: {
    getStatus: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    runRefreshCycle: vi.fn()
  }
}));

describe('Admin Router', () => {
  // Create mock for caller
  const mockCaller = (user?: any) => {
    return appRouter.createCaller({
      user: user || null,
      prisma: {} as any,
    });
  };
  
  // Mock admin user
  const adminUser = { id: 'admin-user-id', role: 'ADMIN' };
  
  // Mock regular user
  const regularUser = { id: 'regular-user-id', role: 'USER' };
  
  // Create mock refresh result
  const mockRefreshResult = {
    totalProcessed: 5,
    successfulSources: 4,
    failedSources: [{ sourceId: 'source1', error: 'Network error' }],
    newItemsCount: 10,
    updatedItemsCount: 3
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock returns
    (feedRefreshService.getStatus as any).mockReturnValue({ isRunning: false });
    (feedRefreshService.runRefreshCycle as any).mockResolvedValue(mockRefreshResult);
  });

  describe('getFeedRefreshStatus', () => {
    it('should return the current status for admin users', async () => {
      (feedRefreshService.getStatus as any).mockReturnValue({ isRunning: true });
      
      const caller = mockCaller(adminUser);
      const result = await caller.admin.getFeedRefreshStatus();
      
      expect(result).toEqual({ isRunning: true });
      expect(feedRefreshService.getStatus).toHaveBeenCalledTimes(1);
    });

    it('should throw FORBIDDEN error for non-admin users', async () => {
      const caller = mockCaller(regularUser);
      
      await expect(caller.admin.getFeedRefreshStatus())
        .rejects.toThrow(new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' }));
        
      expect(feedRefreshService.getStatus).not.toHaveBeenCalled();
    });

    it('should throw UNAUTHORIZED error for unauthenticated users', async () => {
      const caller = mockCaller();
      
      await expect(caller.admin.getFeedRefreshStatus())
        .rejects.toThrow('You need to be logged in to access this resource');
        
      expect(feedRefreshService.getStatus).not.toHaveBeenCalled();
    });
  });

  describe('startFeedRefreshService', () => {
    it('should start the service with default interval for admin users', async () => {
      const caller = mockCaller(adminUser);
      const result = await caller.admin.startFeedRefreshService({});
      
      expect(result).toEqual({ success: true, message: 'Feed refresh service started' });
      expect(feedRefreshService.start).toHaveBeenCalledWith(5); // Default interval
    });

    it('should start the service with custom interval for admin users', async () => {
      const caller = mockCaller(adminUser);
      const result = await caller.admin.startFeedRefreshService({ checkIntervalMinutes: 10 });
      
      expect(result).toEqual({ success: true, message: 'Feed refresh service started' });
      expect(feedRefreshService.start).toHaveBeenCalledWith(10);
    });

    it('should throw FORBIDDEN error for non-admin users', async () => {
      const caller = mockCaller(regularUser);
      
      await expect(caller.admin.startFeedRefreshService({}))
        .rejects.toThrow(new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' }));
        
      expect(feedRefreshService.start).not.toHaveBeenCalled();
    });
  });

  describe('stopFeedRefreshService', () => {
    it('should stop the service for admin users', async () => {
      const caller = mockCaller(adminUser);
      const result = await caller.admin.stopFeedRefreshService();
      
      expect(result).toEqual({ success: true, message: 'Feed refresh service stopped' });
      expect(feedRefreshService.stop).toHaveBeenCalledTimes(1);
    });

    it('should throw FORBIDDEN error for non-admin users', async () => {
      const caller = mockCaller(regularUser);
      
      await expect(caller.admin.stopFeedRefreshService())
        .rejects.toThrow(new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' }));
        
      expect(feedRefreshService.stop).not.toHaveBeenCalled();
    });
  });

  describe('runFeedRefreshCycle', () => {
    it('should run a refresh cycle for admin users', async () => {
      const caller = mockCaller(adminUser);
      const result = await caller.admin.runFeedRefreshCycle();
      
      expect(result).toEqual({ 
        success: true, 
        result: mockRefreshResult 
      });
      expect(feedRefreshService.runRefreshCycle).toHaveBeenCalledTimes(1);
    });

    it('should throw FORBIDDEN error for non-admin users', async () => {
      const caller = mockCaller(regularUser);
      
      await expect(caller.admin.runFeedRefreshCycle())
        .rejects.toThrow(new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' }));
        
      expect(feedRefreshService.runRefreshCycle).not.toHaveBeenCalled();
    });

    it('should propagate errors from the service', async () => {
      const error = new Error('Refresh cycle failed');
      (feedRefreshService.runRefreshCycle as any).mockRejectedValueOnce(error);
      
      const caller = mockCaller(adminUser);
      
      await expect(caller.admin.runFeedRefreshCycle())
        .rejects.toThrow('Refresh cycle failed');
    });
  });
}); 