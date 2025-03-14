import { SourceRepository } from '../repositories/source.repository';
import { ContentRepository } from '../repositories/content.repository';
import { Content } from '../generated/zod/modelSchema/ContentSchema';
import { Source } from '../generated/zod/modelSchema/SourceSchema';
import { 
  FeedValidationResult, 
  AddFeedSourceParams, 
  FeedRefreshResult, 
  BulkFeedRefreshResult,
  FeedDiscoveryResult
} from './rss-feed.types';

// Will be installed in package.json
import Parser from 'rss-parser';

/**
 * Service for handling RSS feed operations
 */
export class RssFeedService {
  private parser: Parser;

  constructor(
    private sourceRepository: SourceRepository,
    private contentRepository: ContentRepository
  ) {
    // Initialize the RSS parser
    this.parser = new Parser({
      customFields: {
        item: [
          ['media:content', 'media'],
          ['content:encoded', 'contentEncoded']
        ]
      }
    });
  }

  /**
   * Discover RSS/Atom feeds from a website URL
   * @param url The website URL to check for feeds
   * @returns A result object with discovered feeds or error information
   */
  async discoverFeeds(url: string): Promise<FeedDiscoveryResult> {
    try {
      // Add protocol if missing
      if (!url.match(/^https?:\/\//i)) {
        url = 'https://' + url;
      }
      
      // Validate URL format
      try {
        new URL(url);
      } catch (error) {
        return {
          success: false,
          error: 'Invalid URL format'
        };
      }

      // Fetch the website content
      let response;
      try {
        response = await fetch(url);
        if (!response) {
          return {
            success: false,
            error: 'Invalid URL format or network error'
          };
        }
      } catch (error: any) {
        return {
          success: false,
          error: `Failed to discover feeds: ${error.message}`
        };
      }

      // Check if the response is OK
      if (!response.ok) {
        return {
          success: false,
          error: `HTTP error: ${response.status}`
        };
      }

      // Check if the URL is already a feed
      const contentType = response.headers.get('content-type') || '';
      const isFeed = contentType.includes('application/rss+xml') || 
                    contentType.includes('application/atom+xml') ||
                    contentType.includes('application/xml') ||
                    contentType.includes('text/xml');

      if (isFeed) {
        // Validate the feed directly
        const validationResult = await this.validateFeedUrl(url);
        if (validationResult.isValid) {
          return {
            success: true,
            discoveredFeeds: [
              {
                url: url,
                title: validationResult.feedTitle || null
              }
            ]
          };
        }
      }

      // Parse the HTML to find feed links
      const html = await response.text();
      const feedLinks = this.extractFeedLinks(html, url);

      // If we found feed links, validate them
      if (feedLinks.length > 0) {
        const validatedFeeds: Array<{ url: string, title: string | null }> = [];

        for (const feedLink of feedLinks) {
          try {
            const validationResult = await this.validateFeedUrl(feedLink.url);
            if (validationResult.isValid) {
              validatedFeeds.push({
                url: feedLink.url,
                title: feedLink.title || validationResult.feedTitle || null
              });
            }
          } catch (error) {
            console.error(`Error validating feed ${feedLink.url}:`, error);
          }
        }

        if (validatedFeeds.length > 0) {
          return {
            success: true,
            discoveredFeeds: validatedFeeds
          };
        }
      }

      // If no feeds found in HTML, try common feed paths
      const urlObj = new URL(url);
      const baseUrl = `${urlObj.protocol}//${urlObj.host}`;
      const commonPaths = [
        '/feed',
        '/rss',
        '/feed.xml',
        '/atom.xml',
        '/rss.xml'
      ];

      const validatedCommonFeeds: Array<{ url: string, title: string | null }> = [];
      for (const path of commonPaths) {
        const feedUrl = `${baseUrl}${path}`;
        try {
          const validationResult = await this.validateFeedUrl(feedUrl);
          if (validationResult.isValid) {
            validatedCommonFeeds.push({
              url: feedUrl,
              title: validationResult.feedTitle || null
            });
          }
        } catch (error: any) {
          console.error(`Error validating common feed path ${feedUrl}:`, error);
        }
      }

      if (validatedCommonFeeds.length > 0) {
        return {
          success: true,
          discoveredFeeds: validatedCommonFeeds
        };
      }

      // No valid feeds found
      return {
        success: false,
        error: 'No valid RSS/Atom feeds found on the website'
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to discover feeds: ${error.message}`
      };
    }
  }

  /**
   * Extract feed links from HTML content
   * @param html The HTML content to parse
   * @param baseUrl The base URL for resolving relative URLs
   * @returns Array of feed links with URLs and titles
   */
  private extractFeedLinks(html: string, baseUrl: string): Array<{ url: string, title: string | null }> {
    const feedLinks: Array<{ url: string, title: string | null }> = [];
    
    // Regular expression to find link tags with RSS or Atom types
    const linkRegex = /<link[^>]*rel=['"]alternate['"][^>]*type=['"]application\/(rss|atom)\+xml['"][^>]*>/gi;
    let match;
    
    while ((match = linkRegex.exec(html)) !== null) {
      const linkTag = match[0];
      
      // Extract href attribute
      const hrefMatch = linkTag.match(/href=['"]([^'"]+)['"]/i);
      if (hrefMatch && hrefMatch[1]) {
        // Extract title attribute
        const titleMatch = linkTag.match(/title=['"]([^'"]+)['"]/i);
        const title = titleMatch ? titleMatch[1] : null;
        
        // Resolve relative URL
        const url = new URL(hrefMatch[1], baseUrl).toString();
        
        feedLinks.push({ url, title });
      }
    }
    
    // Also look for links with type first (some sites have them in different order)
    const altLinkRegex = /<link[^>]*type=['"]application\/(rss|atom)\+xml['"][^>]*rel=['"]alternate['"][^>]*>/gi;
    while ((match = altLinkRegex.exec(html)) !== null) {
      const linkTag = match[0];
      
      // Extract href attribute
      const hrefMatch = linkTag.match(/href=['"]([^'"]+)['"]/i);
      if (hrefMatch && hrefMatch[1]) {
        // Extract title attribute
        const titleMatch = linkTag.match(/title=['"]([^'"]+)['"]/i);
        const title = titleMatch ? titleMatch[1] : null;
        
        // Resolve relative URL
        const url = new URL(hrefMatch[1], baseUrl).toString();
        
        // Check if we already have this URL
        if (!feedLinks.some(link => link.url === url)) {
          feedLinks.push({ url, title });
        }
      }
    }
    
    return feedLinks;
  }

  /**
   * Validate if a URL is a valid RSS/Atom feed
   * @param url URL to validate
   * @returns Object with validation result
   */
  async validateFeedUrl(url: string): Promise<FeedValidationResult> {
    try {
      // Add protocol if missing
      if (!url.match(/^https?:\/\//i)) {
        url = 'https://' + url;
      }
      
      // Basic URL validation
      try {
        new URL(url);
      } catch (error) {
        return { isValid: false, error: 'Invalid URL format' };
      }

      // Fetch the feed
      let response;
      try {
        response = await fetch(url);
        if (!response) {
          return { isValid: false, error: 'Network error or invalid URL' };
        }
      } catch (error) {
        return { isValid: false, error: `Network error: ${(error as Error).message}` };
      }
      
      if (!response.ok) {
        return { isValid: false, error: `HTTP error: ${response.status}` };
      }

      // Check content type header
      const contentType = response.headers.get('content-type') || '';
      const isXml = contentType.includes('xml') || 
                   contentType.includes('rss') || 
                   contentType.includes('atom');
      
      // If content type doesn't look like XML/RSS/Atom, try to parse it anyway
      // as some feeds might not set the correct content type
      const feedContent = await response.text();
      
      try {
        const parsedFeed = await this.parser.parseString(feedContent);
        
        // If we get here, it's likely a valid feed
        return { 
          isValid: true, 
          feedTitle: parsedFeed.title || url.split('/').pop() || 'RSS Feed'
        };
      } catch (parseError) {
        // If content type suggested XML but parsing failed, it's likely not a valid feed
        if (isXml) {
          return { isValid: false, error: 'Not a valid RSS/Atom feed format' };
        }
        
        // If content type didn't suggest XML and parsing failed, it's not a feed
        return { isValid: false, error: 'Not an RSS/Atom feed' };
      }
    } catch (error) {
      return { 
        isValid: false, 
        error: `Failed to validate feed: ${(error as Error).message}` 
      };
    }
  }

  /**
   * Add a new RSS feed source
   * @param params Source parameters including URL and user ID
   * @returns The created source
   */
  async addFeedSource(params: AddFeedSourceParams): Promise<Source> {
    let feedUrl = params.url;
    let feedTitle = '';
    
    // Try to discover feeds if the URL doesn't appear to be a direct feed URL
    const contentTypePattern = /\.(rss|xml|atom)$/i;
    if (!contentTypePattern.test(params.url)) {
      try {
        const discoveryResult = await this.discoverFeeds(params.url);
        if (discoveryResult.success && discoveryResult.discoveredFeeds && discoveryResult.discoveredFeeds.length > 0) {
          // Use the first discovered feed
          feedUrl = discoveryResult.discoveredFeeds[0].url;
          feedTitle = discoveryResult.discoveredFeeds[0].title || '';
        }
      } catch (error) {
        console.error('Feed discovery failed, falling back to direct validation', error);
      }
    }

    // Validate the feed URL (original or discovered)
    const validation = await this.validateFeedUrl(feedUrl);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Create the source
    const source = await this.sourceRepository.create({
      url: feedUrl,
      name: params.name || feedTitle || validation.feedTitle,
      sourceType: 'RSS',
      userId: params.userId,
      isActive: true,
      refreshRate: params.refreshRate || 60, // Default to 60 minutes
      settings: params.settings || { fetchFullText: false },
      lastFetched: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return source;
  }

  /**
   * Fetch and process content from an RSS feed
   * @param sourceId ID of the source to fetch
   * @returns Results of the fetch operation
   */
  async fetchFeedContent(sourceId: string): Promise<FeedRefreshResult> {
    // Get the source
    const source = await this.sourceRepository.findById(sourceId);
    if (!source) {
      throw new Error(`Source with ID ${sourceId} not found`);
    }

    // Parse the feed
    const feed = await this.parseFeed(source.url);
    if (!feed || !feed.items || !Array.isArray(feed.items)) {
      throw new Error(`Failed to parse feed from ${source.url}`);
    }

    // Get existing content items for this source to avoid duplicates
    const existingItems = await this.contentRepository.findBySourceId(sourceId);
    const existingUrls = new Set(existingItems.map(item => item.url));

    // Process feed items
    let newItemsCount = 0;
    let updatedItemsCount = 0;

    for (const item of feed.items) {
      if (!item.link) continue; // Skip items without links

      if (!existingUrls.has(item.link)) {
        // New item
        await this.contentRepository.create({
          title: item.title || 'Untitled',
          url: item.link,
          sourceId,
          publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
          contentText: item.contentSnippet || '',
          contentHtml: item.content || item.contentEncoded || '',
          author: item.creator || item.author || null,
          status: 'UNREAD',
          priority: 'MEDIUM',
          metadata: {
            // Store additional metadata
            feedItemId: item.guid || item.id || null,
            categories: item.categories || [],
            readTime: this.estimateReadTime(item.contentSnippet || ''),
          },
          createdAt: new Date(),
          updatedAt: new Date()
        });
        newItemsCount++;
      } else {
        // TODO: Handle updates to existing items if needed
        // For now, we're just counting them
        updatedItemsCount++;
      }
    }

    // Update last fetched time
    await this.sourceRepository.updateLastFetched(sourceId);

    return {
      newItemsCount,
      updatedItemsCount
    };
  }

  /**
   * Refresh all feeds that are due for refresh
   * @param olderThanMinutes Only refresh feeds not updated in this many minutes
   * @returns Results of the bulk refresh operation
   */
  async refreshAllFeeds(olderThanMinutes?: number): Promise<BulkFeedRefreshResult> {
    // Find sources that need to be refreshed
    const sources = await this.sourceRepository.findSourcesToRefresh(olderThanMinutes);
    
    // Initialize result
    const result: BulkFeedRefreshResult = {
      totalProcessed: 0,
      successfulSources: 0,
      failedSources: [],
      newItemsCount: 0,
      updatedItemsCount: 0
    };

    // Process each source
    for (const source of sources) {
      try {
        const fetchResult = await this.fetchFeedContent(source.id);
        result.newItemsCount += fetchResult.newItemsCount;
        result.updatedItemsCount += fetchResult.updatedItemsCount;
        result.successfulSources++;
        result.totalProcessed++;
      } catch (error) {
        result.failedSources.push({
          id: source.id,
          error: (error as Error).message
        });
      }
    }

    return result;
  }

  /**
   * Parse an RSS feed from a URL
   * @param url URL of the feed to parse
   * @returns Parsed feed data
   * @private
   */
  private async parseFeed(url: string): Promise<Parser.Output<any>> {
    try {
      return await this.parser.parseURL(url);
    } catch (error) {
      throw new Error(`Failed to parse feed: ${(error as Error).message}`);
    }
  }

  /**
   * Estimate reading time for content
   * @param text Text to estimate reading time for
   * @returns Estimated reading time in minutes
   * @private
   */
  private estimateReadTime(text: string): number {
    // Average reading speed is about 200-250 words per minute
    const wordsPerMinute = 230;
    const wordCount = text.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  }
} 