import { describe, it, expect, vi, beforeEach } from 'vitest';
import { appRouter } from '../../router';
import { RssFeedService } from '../../services/rss-feed.service';
import { FeedDiscoveryResult } from '../../services/rss-feed.types';
import { TRPCError } from '@trpc/server';
import RepositoryFactory from '../../repositories/repository-factory';
import { PrismaClient, User } from '@prisma/client';
import { mockDeep } from '../utils/mock-utils';

// Mock the repository factory and RssFeedService
vi.mock('../../repositories/repository-factory');
vi.mock('../../services/rss-feed.service');

describe('Feed Router - Discover Feeds', () => {
  // Mock RssFeedService instance
  let mockRssFeedService: any;
  
  // Mock user
  const mockUser: Partial<User> = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    firebaseUid: 'firebase-123',
    avatar: null
  };

  // Create mock for caller with proper context
  const mockCaller = (user?: any) => {
    return appRouter.createCaller({
      user: user || null,
      prisma: mockDeep<PrismaClient>(),
      req: {} as any,
      res: {} as any
    });
  };

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    // Set up the mock RssFeedService
    mockRssFeedService = {
      validateFeedUrl: vi.fn(),
      addFeedSource: vi.fn(),
      fetchFeedContent: vi.fn(),
      getSourceById: vi.fn(),
      listSources: vi.fn(),
      updateSource: vi.fn(),
      deleteSource: vi.fn(),
      refreshSource: vi.fn(),
      discoverFeeds: vi.fn(),
    };

    // Mock the constructor to return our mock instance
    (RssFeedService as any).mockImplementation(() => mockRssFeedService);
  });

  it('should discover feeds when given a valid URL', async () => {
    // Prepare mock response
    const mockDiscoveryResult: FeedDiscoveryResult = {
      success: true,
      discoveredFeeds: [
        { url: 'https://example.com/feed.xml', title: 'Example Feed' },
        { url: 'https://example.com/atom.xml', title: 'Example Atom Feed' }
      ]
    };

    // Setup the mock
    mockRssFeedService.discoverFeeds.mockResolvedValue(mockDiscoveryResult);

    // Call the procedure with authenticated user
    const caller = mockCaller(mockUser);
    const result = await caller.feed.discoverFeeds({
      url: 'https://example.com'
    });

    // Assertions
    expect(mockRssFeedService.discoverFeeds).toHaveBeenCalledWith('https://example.com');
    expect(result).toEqual(mockDiscoveryResult);
    expect(result.success).toBe(true);
    expect(result.discoveredFeeds).toHaveLength(2);
  });

  it('should return error result when no feeds are found', async () => {
    // Prepare mock error response
    const mockErrorResult: FeedDiscoveryResult = {
      success: false,
      error: 'No valid RSS/Atom feeds found on the website'
    };

    // Setup the mock
    mockRssFeedService.discoverFeeds.mockResolvedValue(mockErrorResult);

    // Call the procedure with authenticated user
    const caller = mockCaller(mockUser);
    const result = await caller.feed.discoverFeeds({
      url: 'https://example.com/no-feeds'
    });

    // Assertions
    expect(mockRssFeedService.discoverFeeds).toHaveBeenCalledWith('https://example.com/no-feeds');
    expect(result).toEqual(mockErrorResult);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should handle invalid URL format', async () => {
    // Prepare mock error response
    const mockErrorResult: FeedDiscoveryResult = {
      success: false,
      error: 'Invalid URL format'
    };

    // Setup the mock
    mockRssFeedService.discoverFeeds.mockResolvedValue(mockErrorResult);

    // Call the procedure with authenticated user
    const caller = mockCaller(mockUser);
    const result = await caller.feed.discoverFeeds({
      url: 'not-a-url'
    });

    // Assertions
    expect(mockRssFeedService.discoverFeeds).toHaveBeenCalledWith('not-a-url');
    expect(result).toEqual(mockErrorResult);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid URL format');
  });

  it('should throw UNAUTHORIZED error for unauthenticated users', async () => {
    // Call the procedure with unauthenticated caller
    const unauthenticatedCaller = mockCaller();
    await expect(unauthenticatedCaller.feed.discoverFeeds({
      url: 'https://example.com'
    })).rejects.toThrow('You need to be logged in to access this resource');

    // Verify service was not called
    expect(mockRssFeedService.discoverFeeds).not.toHaveBeenCalled();
  });

  it('should handle service-level exceptions', async () => {
    // Setup the mock to throw an error
    mockRssFeedService.discoverFeeds.mockRejectedValue(new Error('Service error'));

    // Call the procedure with authenticated user
    const caller = mockCaller(mockUser);
    await expect(caller.feed.discoverFeeds({
      url: 'https://example.com'
    })).rejects.toThrow();
  });

  it('should propagate TRPCError from service level', async () => {
    // Create a TRPC error
    const trpcError = new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Invalid request'
    });

    // Setup the mock to throw the TRPC error
    mockRssFeedService.discoverFeeds.mockRejectedValue(trpcError);

    // Call the procedure with authenticated user
    const caller = mockCaller(mockUser);
    await expect(caller.feed.discoverFeeds({
      url: 'https://example.com'
    })).rejects.toThrow(trpcError);
  });
}); 