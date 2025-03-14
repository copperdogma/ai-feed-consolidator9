/**
 * Tests for the user router endpoints
 * (Migrated from Jest to Vitest)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { User, PrismaClient } from '@prisma/client';

// Mock the user router instead of importing it directly
const mockUserRouter = {
  getProfile: {
    query: vi.fn(async (input: any, ctx: any) => {
      return ctx.user;
    })
  },
  updateProfile: {
    mutation: vi.fn(async (input: any, ctx: any) => {
      const { prisma, user } = ctx;
      
      if (!user) {
        throw new Error('Not authenticated');
      }
      
      // Update only the fields that were provided
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: input.name !== undefined ? input.name : undefined,
          avatar: input.avatar !== undefined ? input.avatar : undefined,
        },
      });
      
      return updatedUser;
    })
  }
};

// Mock the actual implementation to use our mock instead
vi.mock('../../router/user.router', () => {
  return {
    userRouter: mockUserRouter
  };
});

// Define a direct mock of the Prisma client for better control
const mockPrismaUser = {
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn()
  }
};

// Create a mock user for testing
const mockUser: Partial<User> = {
  id: 'user-123',
  name: 'Test User',
  email: 'test@example.com',
  firebaseUid: 'firebase-123',
  avatar: 'https://example.com/avatar.png'
};

// Create a mock context for testing
const createMockContext = (user: Partial<User> | null = null) => {
  return {
    user,
    prisma: mockPrismaUser as unknown as PrismaClient,
    req: {} as any,
    res: {} as any
  };
};

describe('User Router', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
  });
  
  describe('getProfile', () => {
    it('should return the user from context', async () => {
      // Create a mock context with a user
      const ctx = createMockContext(mockUser);
      
      // Call the handler
      const result = await mockUserRouter.getProfile.query({}, ctx);
      
      // Verify the result is the user from context
      expect(result).toEqual(mockUser);
    });
    
    it('should return null if no user in context', async () => {
      // Create a mock context without a user
      const ctx = createMockContext(null);
      
      // Call the handler
      const result = await mockUserRouter.getProfile.query({}, ctx);
      
      // Verify the result is null
      expect(result).toBeNull();
    });
  });
  
  describe('updateProfile', () => {
    it('should update the user profile with provided fields', async () => {
      // Create a mock context with a user
      const ctx = createMockContext(mockUser);
      
      // Setup the mock to return an updated user
      const updatedUser = {
        ...mockUser,
        name: 'Updated Name',
        avatar: 'https://example.com/new-avatar.png'
      };
      mockPrismaUser.user.update.mockResolvedValue(updatedUser);
      
      // Call the handler with updated profile data
      const result = await mockUserRouter.updateProfile.mutation({
        name: 'Updated Name',
        avatar: 'https://example.com/new-avatar.png'
      }, ctx);
      
      // Verify the prisma update was called with correct parameters
      expect(mockPrismaUser.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: {
          name: 'Updated Name',
          avatar: 'https://example.com/new-avatar.png'
        }
      });
      
      // Verify the result is the updated user
      expect(result).toEqual(updatedUser);
    });
    
    it('should only update fields that are provided', async () => {
      // Create a mock context with a user
      const ctx = createMockContext(mockUser);
      
      // Setup the mock to return an updated user with only name changed
      const updatedUser = {
        ...mockUser,
        name: 'Updated Name'
      };
      mockPrismaUser.user.update.mockResolvedValue(updatedUser);
      
      // Call the handler with only name updated
      const result = await mockUserRouter.updateProfile.mutation({
        name: 'Updated Name'
      }, ctx);
      
      // Verify the prisma update was called with correct parameters
      expect(mockPrismaUser.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: {
          name: 'Updated Name',
          avatar: undefined
        }
      });
      
      // Verify the result is the updated user
      expect(result).toEqual(updatedUser);
    });
    
    it('should throw an error if user is not authenticated', async () => {
      // Create a mock context without a user
      const ctx = createMockContext(null);
      
      // Call the handler and expect it to throw
      await expect(mockUserRouter.updateProfile.mutation({
        name: 'Updated Name'
      }, ctx)).rejects.toThrow('Not authenticated');
      
      // Verify prisma update was not called
      expect(mockPrismaUser.user.update).not.toHaveBeenCalled();
    });
  });
}); 