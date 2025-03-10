import { Prisma } from '@prisma/client';

/**
 * Base repository interface defining common CRUD operations
 */
export interface BaseRepository<T, ID> {
  /**
   * Find a single entity by its ID
   * @param id The entity ID
   * @returns The entity or null if not found
   */
  findById(id: ID): Promise<T | null>;

  /**
   * Find all entities
   * @param options Optional pagination and filtering options
   * @returns Array of entities
   */
  findAll(options?: { skip?: number; take?: number; where?: any }): Promise<T[]>;

  /**
   * Create a new entity
   * @param data The entity data
   * @returns The created entity
   */
  create(data: any): Promise<T>;

  /**
   * Update an existing entity
   * @param id The entity ID
   * @param data The updated entity data
   * @returns The updated entity
   */
  update(id: ID, data: any): Promise<T>;

  /**
   * Delete an entity by its ID
   * @param id The entity ID
   * @returns Boolean indicating success
   */
  delete(id: ID): Promise<boolean>;

  /**
   * Count entities with optional filter
   * @param where Optional filter conditions
   * @returns Number of matching entities
   */
  count(where?: any): Promise<number>;

  /**
   * Get the repository with a transaction client
   * @param tx Transaction client
   * @returns Repository with transaction client
   */
  withTransaction(tx: Prisma.TransactionClient): BaseRepository<T, ID>;
}

/**
 * Base repository implementation with transaction support
 */
export abstract class BaseRepositoryImpl<T, ID> implements BaseRepository<T, ID> {
  abstract findById(id: ID): Promise<T | null>;
  abstract findAll(options?: { skip?: number; take?: number; where?: any }): Promise<T[]>;
  abstract create(data: any): Promise<T>;
  abstract update(id: ID, data: any): Promise<T>;
  abstract delete(id: ID): Promise<boolean>;
  abstract count(where?: any): Promise<number>;
  abstract withTransaction(tx: Prisma.TransactionClient): BaseRepository<T, ID>;
} 