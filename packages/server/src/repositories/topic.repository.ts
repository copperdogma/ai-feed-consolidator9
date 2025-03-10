import { PrismaClient } from '@prisma/client';
import { BaseRepository, BaseRepositoryImpl } from './base.repository';
import { Topic } from '../generated/zod/modelSchema/TopicSchema';

/**
 * Extended repository interface for Topic-specific operations
 */
export interface TopicRepository extends BaseRepository<Topic, string> {
  /**
   * Find a topic by name
   * @param name Topic name
   * @returns The topic or null if not found
   */
  findByName(name: string): Promise<Topic | null>;

  /**
   * Find topics associated with a content item
   * @param contentId Content ID
   * @returns Array of topics
   */
  findByContentId(contentId: string): Promise<Topic[]>;
}

/**
 * Topic repository implementation
 */
export class TopicRepositoryImpl extends BaseRepositoryImpl<Topic, string> implements TopicRepository {
  private prisma: any; // Use any type to avoid TypeScript errors

  constructor(prisma: PrismaClient) {
    super();
    this.prisma = prisma;
  }

  async findById(id: string): Promise<Topic | null> {
    return this.prisma.topic.findUnique({
      where: { id },
    });
  }

  async findAll(options?: { skip?: number; take?: number; where?: any }): Promise<Topic[]> {
    return this.prisma.topic.findMany({
      skip: options?.skip,
      take: options?.take,
      where: options?.where,
    });
  }

  async create(data: any): Promise<Topic> {
    return this.prisma.topic.create({
      data,
    });
  }

  async update(id: string, data: any): Promise<Topic> {
    return this.prisma.topic.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.topic.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      console.error('Error deleting topic:', error);
      return false;
    }
  }

  async count(where?: any): Promise<number> {
    return this.prisma.topic.count({
      where,
    });
  }

  async findByName(name: string): Promise<Topic | null> {
    return this.prisma.topic.findUnique({
      where: { name },
    });
  }

  async findByContentId(contentId: string): Promise<Topic[]> {
    return this.prisma.topic.findMany({
      where: {
        contentTopics: {
          some: {
            contentId,
          },
        },
      },
    });
  }
} 