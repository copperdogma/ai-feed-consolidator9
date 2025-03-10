import { PrismaClient } from '@prisma/client';
import { BaseRepository, BaseRepositoryImpl } from './base.repository';
import { Activity } from '../generated/zod/modelSchema/ActivitySchema';

/**
 * Extended repository interface for Activity-specific operations
 */
export interface ActivityRepository extends BaseRepository<Activity, string> {
  /**
   * Find activities by user ID
   * @param userId User ID
   * @returns Array of activities
   */
  findByUserId(userId: string): Promise<Activity[]>;

  /**
   * Find activities by content ID
   * @param contentId Content ID
   * @returns Array of activities
   */
  findByContentId(contentId: string): Promise<Activity[]>;

  /**
   * Find activities by action type
   * @param action Action type
   * @returns Array of activities
   */
  findByAction(action: string): Promise<Activity[]>;
}

/**
 * Activity repository implementation
 */
export class ActivityRepositoryImpl extends BaseRepositoryImpl<Activity, string> implements ActivityRepository {
  private prisma: any; // Use any type to avoid TypeScript errors

  constructor(prisma: PrismaClient) {
    super();
    this.prisma = prisma;
  }

  async findById(id: string): Promise<Activity | null> {
    return this.prisma.activity.findUnique({
      where: { id },
    });
  }

  async findAll(options?: { skip?: number; take?: number; where?: any }): Promise<Activity[]> {
    return this.prisma.activity.findMany({
      skip: options?.skip,
      take: options?.take,
      where: options?.where,
    });
  }

  async create(data: any): Promise<Activity> {
    return this.prisma.activity.create({
      data,
    });
  }

  async update(id: string, data: any): Promise<Activity> {
    return this.prisma.activity.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.activity.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      console.error('Error deleting activity:', error);
      return false;
    }
  }

  async count(where?: any): Promise<number> {
    return this.prisma.activity.count({
      where,
    });
  }

  async findByUserId(userId: string): Promise<Activity[]> {
    return this.prisma.activity.findMany({
      where: { userId },
    });
  }

  async findByContentId(contentId: string): Promise<Activity[]> {
    return this.prisma.activity.findMany({
      where: { contentId },
    });
  }

  async findByAction(action: string): Promise<Activity[]> {
    return this.prisma.activity.findMany({
      where: { action },
    });
  }
} 