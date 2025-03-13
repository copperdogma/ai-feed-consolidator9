/**
 * RSS Feed Service Type Definitions
 */

/**
 * Interface for feed validation result
 */
export interface FeedValidationResult {
  isValid: boolean;
  feedTitle?: string;
  error?: string;
}

/**
 * Interface for feed discovery result
 */
export interface FeedDiscoveryResult {
  success: boolean;
  discoveredFeeds?: {
    url: string;
    title: string | null;
  }[];
  error?: string;
}

/**
 * Interface for feed source creation params
 */
export interface AddFeedSourceParams {
  url: string;
  userId: string;
  name?: string;
  refreshRate?: number;
  settings?: Record<string, any>;
}

/**
 * Interface for feed refresh result
 */
export interface FeedRefreshResult {
  newItemsCount: number;
  updatedItemsCount: number;
}

/**
 * Interface for bulk feed refresh result
 */
export interface BulkFeedRefreshResult {
  totalProcessed: number;
  successfulSources: number;
  failedSources: { id: string; error: string }[];
  newItemsCount: number;
  updatedItemsCount: number;
} 