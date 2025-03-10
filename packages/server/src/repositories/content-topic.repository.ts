import { PrismaClient } from '@prisma/client';
import { ContentTopic } from '../generated/zod/modelSchema/ContentTopicSchema';

/**
 * Extended repository interface for ContentTopic-specific operations
 */
export interface ContentTopicRepository {
  /**
   * Find content-topic relations by content ID
   * @param contentId Content ID
   * @returns Array of ContentTopic relations
   */
  findByContentId(contentId: string): Promise<ContentTopic[]>;

  /**
   * Find content-topic relations by topic ID
   * @param topicId Topic ID
   * @returns Array of ContentTopic relations
   */
  findByTopicId(topicId: string): Promise<ContentTopic[]>;

  /**
   * Associate a content with a topic
   * @param contentId Content ID
   * @param topicId Topic ID
   * @returns Created ContentTopic relation
   */
  associate(contentId: string, topicId: string): Promise<ContentTopic>;

  /**
   * Disassociate a content from a topic
   * @param contentId Content ID
   * @param topicId Topic ID
   * @returns Boolean indicating success
   */
  disassociate(contentId: string, topicId: string): Promise<boolean>;

  /**
   * Count content-topic relations with optional filter
   * @param where Optional filter conditions
   * @returns Number of matching relations
   */
  count(where?: any): Promise<number>;
}

/**
 * ContentTopic repository implementation
 */
export class ContentTopicRepositoryImpl implements ContentTopicRepository {
  private prisma: any; // Use any type to avoid TypeScript errors

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findByContentId(contentId: string): Promise<ContentTopic[]> {
    return this.prisma.contentTopic.findMany({
      where: { contentId },
    });
  }

  async findByTopicId(topicId: string): Promise<ContentTopic[]> {
    return this.prisma.contentTopic.findMany({
      where: { topicId },
    });
  }

  async associate(contentId: string, topicId: string): Promise<ContentTopic> {
    return this.prisma.contentTopic.create({
      data: {
        contentId,
        topicId,
      },
    });
  }

  async disassociate(contentId: string, topicId: string): Promise<boolean> {
    try {
      await this.prisma.contentTopic.delete({
        where: {
          contentId_topicId: {
            contentId,
            topicId,
          },
        },
      });
      return true;
    } catch (error) {
      console.error('Error disassociating content from topic:', error);
      return false;
    }
  }

  async count(where?: any): Promise<number> {
    return this.prisma.contentTopic.count({
      where,
    });
  }
} 