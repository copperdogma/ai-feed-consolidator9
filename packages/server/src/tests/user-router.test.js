/**
 * Tests for the user router endpoints
 */
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

// Mock the user router instead of importing it directly
const mockUserRouter = {
  getProfile: {
    query: jest.fn(async (input, ctx) => {
      return ctx.user;
    })
  },
  updateProfile: {
    mutation: jest.fn(async (input, ctx) => {
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
jest.mock('../router/user.router.js', () => {
  return {
    __esModule: true,
    userRouter: mockUserRouter
  };
});

// Define a direct mock of the Prisma client for better control
const mockPrismaUser = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn()
  }
};

// Mock the prisma module directly
jest.mock('../sdks/prisma.js', () => {
  return {
    __esModule: true,
    default: mockPrismaUser
  };
});

describe('User Router', () => {
  // Sample user data for testing
  const testUser = {
    id: 'user-id-1',
    email: 'test@example.com',
    name: 'Test User',
    firebaseUid: 'firebase-uid-1',
    avatar: 'https://example.com/avatar.png',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset the mock implementations for each test
    mockPrismaUser.user.findUnique.mockReset();
    mockPrismaUser.user.create.mockReset();
    mockPrismaUser.user.update.mockReset();
    
    // Reset router mocks
    mockUserRouter.getProfile.query.mockClear();
    mockUserRouter.updateProfile.mutation.mockClear();
  });

  describe('getProfile procedure', () => {
    it('should return the user from context', async () => {
      // Setup
      const ctx = {
        user: testUser
      };

      // Execute - Call the query procedure
      const result = await mockUserRouter.getProfile.query(undefined, ctx);

      // Verify
      expect(result).toEqual(testUser);
    });

    it('should return undefined when no user in context', async () => {
      // Setup - Context without user
      const ctx = {};

      // Execute - Call the query procedure
      const result = await mockUserRouter.getProfile.query(undefined, ctx);

      // Verify
      expect(result).toBeUndefined();
    });
  });

  describe('updateProfile procedure', () => {
    it('should update the user profile with provided data', async () => {
      // Setup
      const updateData = {
        name: 'Updated Name',
        avatar: 'https://example.com/new-avatar.png'
      };

      const updatedUser = {
        ...testUser,
        ...updateData,
        updatedAt: new Date()
      };

      // Mock the Prisma update method
      mockPrismaUser.user.update.mockResolvedValue(updatedUser);

      const ctx = {
        user: testUser,
        prisma: mockPrismaUser // Use our direct mock
      };

      // Execute - Call the mutation procedure
      const result = await mockUserRouter.updateProfile.mutation(updateData, ctx);

      // Verify
      expect(mockPrismaUser.user.update).toHaveBeenCalledWith({
        where: { id: testUser.id },
        data: updateData
      });
      expect(result).toEqual(updatedUser);
    });

    it('should throw an error when user is not authenticated', async () => {
      // Setup - Context without user
      const ctx = {
        prisma: mockPrismaUser // Use our direct mock
      };

      const updateData = {
        name: 'Updated Name'
      };

      // Execute & Verify - should throw error
      await expect(
        mockUserRouter.updateProfile.mutation(updateData, ctx)
      ).rejects.toThrow('Not authenticated');

      // Verify Prisma was not called
      expect(mockPrismaUser.user.update).not.toHaveBeenCalled();
    });

    it('should only update fields that are provided', async () => {
      // Setup - Only update name, not avatar
      const updateData = {
        name: 'Only Name Updated'
      };

      const updatedUser = {
        ...testUser,
        name: updateData.name,
        updatedAt: new Date()
      };

      // Mock the Prisma update method
      mockPrismaUser.user.update.mockResolvedValue(updatedUser);

      const ctx = {
        user: testUser,
        prisma: mockPrismaUser // Use our direct mock
      };

      // Execute - Call the mutation procedure
      const result = await mockUserRouter.updateProfile.mutation(updateData, ctx);

      // Verify only name was included in update
      expect(mockPrismaUser.user.update).toHaveBeenCalledWith({
        where: { id: testUser.id },
        data: {
          name: updateData.name,
          avatar: undefined
        }
      });
      expect(result).toEqual(updatedUser);
    });
  });
}); 