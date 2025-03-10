import { PrismaClient } from '@prisma/client';
import { BaseRepository, BaseRepositoryImpl } from './base.repository';
import { Summary } from '../generated/zod/modelSchema/SummarySchema';

/**
 * Extended repository interface for Summary-specific operations
 */
export interface SummaryRepository extends BaseRepository<Summary, string> {
  /**
   * Find a summary by content ID
   * @param contentId Content ID
   * @returns The summary or null if not found
   */
  findByContentId(contentId: string): Promise<Summary | null>;
}

/**
 * Summary repository implementation
 */
export class SummaryRepositoryImpl extends BaseRepositoryImpl<Summary, string> implements SummaryRepository {
  private prisma: any; // Use any type to avoid TypeScript errors

  constructor(prisma: PrismaClient) {
    super();
    this.prisma = prisma;
  }

  async findById(id: string): Promise<Summary | null> {
    return this.prisma.summary.findUnique({
      where: { id },
    });
  }

  async findAll(options?: { skip?: number; take?: number; where?: any }): Promise<Summary[]> {
    return this.prisma.summary.findMany({
      skip: options?.skip,
      take: options?.take,
      where: options?.where,
    });
  }

  async create(data: any): Promise<Summary> {
    return this.prisma.summary.create({
      data,
    });
  }

  async update(id: string, data: any): Promise<Summary> {
    return this.prisma.summary.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.summary.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      console.error('Error deleting summary:', error);
      return false;
    }
  }

  async count(where?: any): Promise<number> {
    return this.prisma.summary.count({
      where,
    });
  }

  async findByContentId(contentId: string): Promise<Summary | null> {
    return this.prisma.summary.findUnique({
      where: { contentId },
    });
  }
} 