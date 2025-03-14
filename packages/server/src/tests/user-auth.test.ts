/**
 * Tests for the user authentication flow in context.ts
 * (Migrated from Jest to Vitest)
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';

// Mock dependencies before importing them
vi.mock('../lib/firebase-admin', () => ({
  auth: {
    verifyIdToken: vi.fn()
  }
}));

vi.mock('../sdks/prisma', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn()
    },
    $connect: vi.fn(),
    $disconnect: vi.fn()
  }
}));

// Now import the mocked modules
import { createContext } from '../lib/context';
import { auth } from '../lib/firebase-admin';
import prisma from '../sdks/prisma';

// Get typed references to mock functions
const mockAuthVerifyIdToken = auth.verifyIdToken as ReturnType<typeof vi.fn>;
const mockFindUnique = prisma.user.findUnique as ReturnType<typeof vi.fn>;
const mockCreate = prisma.user.create as ReturnType<typeof vi.fn>;
const mockUpdate = prisma.user.update as ReturnType<typeof vi.fn>;

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

describe('Authentication Context', () => {
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
  });

  it('should return null user for requests without auth header', async () => {
    // Setup: Create request without auth header
    const req = { 
      headers: {}, 
      path: '/some/path',
      cookies: {},
      method: 'GET'
    } as unknown as Request;
    const res = { clearCookie: vi.fn() } as unknown as Response;

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
      path: '/auth.signIn',
      cookies: {},
      method: 'GET'
    } as unknown as Request;
    const res = { clearCookie: vi.fn() } as unknown as Response;

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
    mockFindUnique.mockResolvedValue(null);
    mockCreate.mockResolvedValue(newUser);

    // Create request with auth header
    const req = {
      headers: {
        authorization: 'Bearer valid_token'
      },
      path: '/some/path',
      cookies: {},
      method: 'GET'
    } as unknown as Request;
    const res = { clearCookie: vi.fn() } as unknown as Response;

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
    mockFindUnique.mockImplementation((args: any) => {
      // First call finds the user by firebaseUid, second call returns the updated user
      const isFirstCall = args && args.where && args.where.firebaseUid === 'test-uid';
      if (isFirstCall) {
        return Promise.resolve(existingUser);
      }
      // Second findUnique call is to fetch the updated user
      return Promise.resolve(updatedUser);
    });
    
    mockUpdate.mockResolvedValue(updatedUser);

    const req = {
      headers: {
        authorization: 'Bearer valid_token'
      },
      path: '/some/path',
      cookies: {},
      method: 'GET'
    } as unknown as Request;
    const res = { clearCookie: vi.fn() } as unknown as Response;

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
      path: '/some/path',
      cookies: {},
      method: 'GET'
    } as unknown as Request;
    const res = { clearCookie: vi.fn() } as unknown as Response;

    // Execute
    console.log('Before createContext call');
    const context = await createContext({ req, res });
    console.log('After createContext call, context.user:', context.user);

    // Verify
    expect(context.user).toBeNull();
    expect(res.clearCookie).toHaveBeenCalledWith('accessToken');
  });
}); 