import { PrismaClient } from '@prisma/client';
import { BaseRepository, BaseRepositoryImpl } from './base.repository';
import { Source } from '../generated/zod/modelSchema/SourceSchema';

/**
 * Extended repository interface for Source-specific operations
 */
export interface SourceRepository extends BaseRepository<Source, string> {
  /**
   * Find sources by user ID
   * @param userId User ID
   * @returns Array of sources
   */
  findByUserId(userId: string): Promise<Source[]>;

  /**
   * Find sources by type
   * @param sourceType Source type
   * @returns Array of sources
   */
  findByType(sourceType: string): Promise<Source[]>;

  /**
   * Find sources that need to be refreshed
   * @param olderThanMinutes Only include sources not refreshed in this many minutes
   * @returns Array of sources
   */
  findSourcesToRefresh(olderThanMinutes?: number): Promise<Source[]>;

  /**
   * Update last fetched timestamp for a source
   * @param id Source ID
   * @returns Updated source
   */
  updateLastFetched(id: string): Promise<Source>;
}

/**
 * Source repository implementation
 */
export class SourceRepositoryImpl extends BaseRepositoryImpl<Source, string> implements SourceRepository {
  private prisma: any; // Use any type to avoid TypeScript errors

  constructor(prisma: PrismaClient) {
    super();
    this.prisma = prisma;
  }

  async findById(id: string): Promise<Source | null> {
    return this.prisma.source.findUnique({
      where: { id },
    });
  }

  async findAll(options?: { skip?: number; take?: number; where?: any }): Promise<Source[]> {
    return this.prisma.source.findMany({
      skip: options?.skip,
      take: options?.take,
      where: options?.where,
    });
  }

  async create(data: any): Promise<Source> {
    return this.prisma.source.create({
      data,
    });
  }

  async update(id: string, data: any): Promise<Source> {
    return this.prisma.source.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.source.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      console.error('Error deleting source:', error);
      return false;
    }
  }

  async count(where?: any): Promise<number> {
    return this.prisma.source.count({
      where,
    });
  }

  async findByUserId(userId: string): Promise<Source[]> {
    return this.prisma.source.findMany({
      where: { userId },
    });
  }

  async findByType(sourceType: string): Promise<Source[]> {
    return this.prisma.source.findMany({
      where: { sourceType },
    });
  }

  async findSourcesToRefresh(olderThanMinutes?: number): Promise<Source[]> {
    const threshold = olderThanMinutes ? new Date(Date.now() - olderThanMinutes * 60 * 1000) : new Date(Date.now() - 60 * 60 * 1000); // Default: 1 hour ago
    
    return this.prisma.source.findMany({
      where: {
        OR: [
          { lastFetched: { lt: threshold } },
          { lastFetched: null },
        ],
        isActive: true,
      },
    });
  }

  async updateLastFetched(id: string): Promise<Source> {
    return this.prisma.source.update({
      where: { id },
      data: { lastFetched: new Date() },
    });
  }
} 