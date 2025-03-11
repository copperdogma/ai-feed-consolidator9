/**
 * Tests for the user authentication flow in context.ts
 */
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { createContext } from '../lib/context.js';
import { auth } from '../lib/firebase-admin.js';

// Create explicit mocks
const mockAuthVerifyIdToken = jest.fn();
auth.verifyIdToken = mockAuthVerifyIdToken;

// Create a mock implementation of the Firebase token verification
mockAuthVerifyIdToken.mockImplementation(async (token) => {
  console.log('Mock verifyIdToken called with token:', token);
  
  if (token === 'invalid_token') {
    throw new Error('Firebase ID token has been revoked');
  }

  // Return test user data
  return {
    uid: 'test-uid',
    email: 'test@example.com',
    name: 'Test User',
    picture: 'https://example.com/avatar.png',
  };
});

// Import the real prisma module 
import prisma from '../sdks/prisma.js';

// Create mock implementation for prisma.user methods
prisma.user = {
  findUnique: jest.fn(),
  create: jest.fn(),
  update: jest.fn()
};

describe('Authentication Context', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Reset our specific mocks
    prisma.user.findUnique.mockReset();
    prisma.user.create.mockReset();
    prisma.user.update.mockReset();
  });

  it('should return null user for requests without auth header', async () => {
    // Setup: Create request without auth header
    const req = { headers: {}, path: '/some/path' };
    const res = { clearCookie: jest.fn() };

    // Execute
    const context = await createContext({ req, res });

    // Verify
    expect(context.user).toBeNull();
    expect(res.clearCookie).not.toHaveBeenCalled();
  });

  it('should return null user for auth/sign paths even with valid token', async () => {
    // Setup: Create request with auth header but path is for signin
    const req = {
      headers: {
        authorization: 'Bearer valid_token'
      },
      path: '/auth.signIn'
    };
    const res = { clearCookie: jest.fn() };

    // Execute
    const context = await createContext({ req, res });

    // Verify
    expect(context.user).toBeNull();
    expect(res.clearCookie).not.toHaveBeenCalled();
  });

  it('should create a new user when valid token but user not in database', async () => {
    // Setup: Create a new user that will be created and returned
    const newUser = {
      id: 'generated-id',
      firebaseUid: 'test-uid',
      email: 'test@example.com',
      name: 'Test User',
      avatar: 'https://example.com/avatar.png',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Mock Prisma to return null for findUnique (user not found)
    // Then mock create to return our new user
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue(newUser);

    // Create request with auth header
    const req = {
      headers: {
        authorization: 'Bearer valid_token'
      },
      path: '/some/path'
    };
    const res = { clearCookie: jest.fn() };

    // Execute
    console.log('Before createContext call');
    const context = await createContext({ req, res });
    console.log('After createContext call, context.user:', context.user);

    // Verify
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { firebaseUid: 'test-uid' } 
    });
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        firebaseUid: 'test-uid',
        email: 'test@example.com',
        name: 'Test User',
        avatar: 'https://example.com/avatar.png'
      })
    });
    expect(context.user).toEqual(newUser);
  });

  it('should update user when Firebase has newer information', async () => {
    // Setup: Existing user in database but with outdated information
    const existingUser = {
      id: 'existing-user-id',
      firebaseUid: 'test-uid',
      email: 'old@example.com',
      name: 'Old Name',
      avatar: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const updatedUser = {
      ...existingUser,
      email: 'test@example.com',
      name: 'Test User',
      avatar: 'https://example.com/avatar.png',
      updatedAt: new Date()
    };

    // Mock Prisma to handle our update scenario
    prisma.user.findUnique.mockImplementation((args) => {
      // First call finds the user by firebaseUid, second call returns the updated user
      const isFirstCall = args && args.where && args.where.firebaseUid === 'test-uid';
      if (isFirstCall) {
        return Promise.resolve(existingUser);
      }
      // Second findUnique call is to fetch the updated user
      return Promise.resolve(updatedUser);
    });
    
    prisma.user.update.mockResolvedValue(updatedUser);

    const req = {
      headers: {
        authorization: 'Bearer valid_token'
      },
      path: '/some/path'
    };
    const res = { clearCookie: jest.fn() };

    // Execute
    console.log('Before createContext call');
    const context = await createContext({ req, res });
    console.log('After createContext call, context.user:', context.user);

    // Verify
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { firebaseUid: 'test-uid' }
    });
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: existingUser.id },
      data: expect.objectContaining({
        email: 'test@example.com',
        name: 'Test User',
        avatar: 'https://example.com/avatar.png'
      })
    });
    expect(context.user).toEqual(updatedUser);
  });

  it('should handle invalid tokens and clear cookies', async () => {
    // Setup: Create request with invalid token
    const req = {
      headers: {
        authorization: 'Bearer invalid_token'
      },
      path: '/some/path'
    };
    const res = { clearCookie: jest.fn() };

    // Execute
    console.log('Before createContext call');
    const context = await createContext({ req, res });
    console.log('After createContext call, context.user:', context.user);

    // Verify
    expect(context.user).toBeNull();
    expect(res.clearCookie).toHaveBeenCalledWith('accessToken');
  });
}); 