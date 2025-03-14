/**
 * Mock for Prisma Client for testing purposes
 */

import { PrismaClient } from '@prisma/client';
import { mockDeep } from '../utils/mock-utils';
import { vi } from 'vitest';

// Define a type for our mock Prisma client
export type MockPrismaClient = {
  [K in keyof PrismaClient]: PrismaClient[K] extends (...args: any[]) => any
    ? ReturnType<typeof vi.fn>
    : MockPrismaClient;
} & PrismaClient;

// Create a factory function for the mock
const createPrismaMock = () => {
  return mockDeep<PrismaClient>() as unknown as MockPrismaClient;
};

// Create the deep mock of the Prisma client
export const prismaMock = createPrismaMock();

// Reset all mocks between tests
export const resetPrismaMocks = () => {
  vi.clearAllMocks();
};

// Create a simple in-memory user store for tests that need it
export class InMemoryUserStore {
  private users: any[] = [];

  // Add a user to the store
  addUser(user: any) {
    this.users.push(user);
    return user;
  }

  // Find a user by id
  findUnique(args: { where: { id?: string, email?: string, firebaseUid?: string } }) {
    if (args.where.id) {
      return this.users.find(user => user.id === args.where.id) || null;
    }
    if (args.where.email) {
      return this.users.find(user => user.email === args.where.email) || null;
    }
    if (args.where.firebaseUid) {
      return this.users.find(user => user.firebaseUid === args.where.firebaseUid) || null;
    }
    return null;
  }

  // Update a user
  update(args: { where: { id: string }, data: any }) {
    const index = this.users.findIndex(user => user.id === args.where.id);
    if (index === -1) return null;
    
    this.users[index] = { ...this.users[index], ...args.data };
    return this.users[index];
  }

  // Create a user
  create(args: { data: any }) {
    const user = { ...args.data };
    this.users.push(user);
    return user;
  }

  // Clear all users
  clear() {
    this.users = [];
  }
}

// Export a default instance
export default prismaMock; 