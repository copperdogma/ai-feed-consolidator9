import { PrismaClient } from '@prisma/client';
import { BaseRepository, BaseRepositoryImpl } from './base.repository';
import { Content } from '../generated/zod/modelSchema/ContentSchema';
import { ContentStatusType } from '../generated/zod/inputTypeSchemas/ContentStatusSchema';
import { ContentPriorityType } from '../generated/zod/inputTypeSchemas/ContentPrioritySchema';

/**
 * Extended repository interface for Content-specific operations
 */
export interface ContentRepository extends BaseRepository<Content, string> {
  /**
   * Find content items by source ID
   * @param sourceId Source ID
   * @returns Array of content items
   */
  findBySourceId(sourceId: string): Promise<Content[]>;

  /**
   * Find content items by status
   * @param status Content status
   * @returns Array of content items
   */
  findByStatus(status: ContentStatusType): Promise<Content[]>;

  /**
   * Find content items by priority
   * @param priority Content priority
   * @returns Array of content items
   */
  findByPriority(priority: ContentPriorityType): Promise<Content[]>;

  /**
   * Update content status
   * @param id Content ID
   * @param status New status
   * @returns Updated content item
   */
  updateStatus(id: string, status: ContentStatusType): Promise<Content>;

  /**
   * Update content priority
   * @param id Content ID
   * @param priority New priority
   * @returns Updated content item
   */
  updatePriority(id: string, priority: ContentPriorityType): Promise<Content>;

  /**
   * Find content items with full-text search
   * @param searchTerm Search term
   * @returns Array of matching content items
   */
  search(searchTerm: string): Promise<Content[]>;
}

/**
 * Content repository implementation
 */
export class ContentRepositoryImpl extends BaseRepositoryImpl<Content, string> implements ContentRepository {
  private prisma: any; // Use any type to avoid TypeScript errors

  constructor(prisma: PrismaClient) {
    super();
    this.prisma = prisma;
  }

  async findById(id: string): Promise<Content | null> {
    return this.prisma.content.findUnique({
      where: { id },
    }) as Promise<Content | null>;
  }

  async findAll(options?: { skip?: number; take?: number; where?: any }): Promise<Content[]> {
    return this.prisma.content.findMany({
      skip: options?.skip,
      take: options?.take,
      where: options?.where,
    }) as Promise<Content[]>;
  }

  async create(data: any): Promise<Content> {
    return this.prisma.content.create({
      data,
    }) as Promise<Content>;
  }

  async update(id: string, data: any): Promise<Content> {
    return this.prisma.content.update({
      where: { id },
      data,
    }) as Promise<Content>;
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.content.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      console.error('Error deleting content:', error);
      return false;
    }
  }

  async count(where?: any): Promise<number> {
    return this.prisma.content.count({
      where,
    });
  }

  async findBySourceId(sourceId: string): Promise<Content[]> {
    return this.prisma.content.findMany({
      where: { sourceId },
    }) as Promise<Content[]>;
  }

  async findByStatus(status: ContentStatusType): Promise<Content[]> {
    return this.prisma.content.findMany({
      where: { status },
    }) as Promise<Content[]>;
  }

  async findByPriority(priority: ContentPriorityType): Promise<Content[]> {
    return this.prisma.content.findMany({
      where: { priority },
    }) as Promise<Content[]>;
  }

  async updateStatus(id: string, status: ContentStatusType): Promise<Content> {
    return this.prisma.content.update({
      where: { id },
      data: { status },
    }) as Promise<Content>;
  }

  async updatePriority(id: string, priority: ContentPriorityType): Promise<Content> {
    return this.prisma.content.update({
      where: { id },
      data: { priority },
    }) as Promise<Content>;
  }

  async search(searchTerm: string): Promise<Content[]> {
    // Basic search implementation - can be enhanced with PostgreSQL full-text search
    return this.prisma.content.findMany({
      where: {
        OR: [
          { title: { contains: searchTerm, mode: 'insensitive' } },
          { contentText: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
    }) as Promise<Content[]>;
  }
} 