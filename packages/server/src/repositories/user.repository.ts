import { PrismaClient, Prisma } from '@prisma/client';
import { BaseRepository, BaseRepositoryImpl } from './base.repository';
import { User } from '../generated/zod/modelSchema/UserSchema';

/**
 * Extended repository interface for User-specific operations
 */
export interface UserRepository extends BaseRepository<User, string> {
  /**
   * Find a user by email
   * @param email User's email
   * @returns The user or null if not found
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Find a user by Firebase UID
   * @param firebaseUid Firebase user ID
   * @returns The user or null if not found
   */
  findByFirebaseUid(firebaseUid: string): Promise<User | null>;

  /**
   * Update user profile information
   * @param id User ID
   * @param profileData User profile data to update
   * @returns The updated user
   */
  updateProfile(id: string, profileData: { name?: string; avatar?: string }): Promise<User>;

  /**
   * Get the repository with a transaction client
   * @param tx Transaction client
   * @returns Repository with transaction client
   */
  withTransaction(tx: Prisma.TransactionClient): UserRepository;
}

/**
 * User repository implementation
 */
export class UserRepositoryImpl extends BaseRepositoryImpl<User, string> implements UserRepository {
  private prisma: any; // Use any type to avoid TypeScript errors

  constructor(prisma: PrismaClient | Prisma.TransactionClient) {
    super();
    this.prisma = prisma;
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    }) as Promise<User | null>;
  }

  async findAll(options?: { skip?: number; take?: number; where?: any }): Promise<User[]> {
    return this.prisma.user.findMany({
      skip: options?.skip,
      take: options?.take,
      where: options?.where,
    }) as Promise<User[]>;
  }

  async create(data: any): Promise<User> {
    return this.prisma.user.create({
      data,
    }) as Promise<User>;
  }

  async update(id: string, data: any): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    }) as Promise<User>;
  }

  async delete(id: string): Promise<boolean> {
    try {
      // Hard delete for now - we can implement soft delete later
      await this.prisma.user.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  async count(where?: any): Promise<number> {
    return this.prisma.user.count({
      where,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    }) as Promise<User | null>;
  }

  async findByFirebaseUid(firebaseUid: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { firebaseUid },
    }) as Promise<User | null>;
  }

  async updateProfile(id: string, profileData: { name?: string; avatar?: string }): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: profileData,
    }) as Promise<User>;
  }

  withTransaction(tx: Prisma.TransactionClient): UserRepository {
    return new UserRepositoryImpl(tx);
  }
} 