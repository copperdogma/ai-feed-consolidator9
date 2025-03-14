/**
 * Context Tests
 * 
 * Tests the server-side context creation which is responsible for 
 * authenticating users and creating/retrieving them from the database.
 * (Migrated from Jest to Vitest)
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import type { Request, Response } from 'express';

// Mock the auth module
vi.mock('../../lib/firebase-admin', () => ({
  auth: {
    verifyIdToken: vi.fn()
  }
}));

// Mock the Prisma client
vi.mock('../../sdks/prisma', () => ({
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

// Import the createContext function and mocked modules
import { createContext } from '../../lib/context';
import { auth } from '../../lib/firebase-admin';
import prisma from '../../sdks/prisma';

// Type assertion for mocked functions
const mockedVerifyIdToken = auth.verifyIdToken as ReturnType<typeof vi.fn>;
const mockedFindUnique = prisma.user.findUnique as ReturnType<typeof vi.fn>;
const mockedCreate = prisma.user.create as ReturnType<typeof vi.fn>;

describe('Context Creation', () => {
  // Setup mock request and response
  const mockReq = {
    headers: {
      authorization: 'Bearer mock-token'
    },
    cookies: {},
    path: '/some/path',
    method: 'GET'
  } as unknown as Request;
  
  const mockRes = {
    clearCookie: vi.fn()
  } as unknown as Response;
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  test('Context contains user after successful authentication', async () => {
    // Mock successful token verification
    const mockDecodedToken = {
      uid: 'mock-uid',
      email: 'test@example.com',
      name: 'Test User'
    };
    
    // Setup mock implementations
    mockedVerifyIdToken.mockResolvedValue(mockDecodedToken);
    mockedFindUnique.mockResolvedValue({
      id: 'user-1',
      firebaseUid: 'mock-uid',
      email: 'test@example.com',
      name: 'Test User',
      avatar: null
    });
    
    // Call the context creation function
    const context = await createContext({ req: mockReq, res: mockRes });
    
    // Verify token verification was called with the correct token
    expect(mockedVerifyIdToken).toHaveBeenCalledWith('mock-token');
    
    // Verify user lookup was performed
    expect(mockedFindUnique).toHaveBeenCalledWith({
      where: { firebaseUid: 'mock-uid' }
    });
    
    // Verify the context contains the user
    expect(context.user).toBeDefined();
    expect(context.user?.id).toBe('user-1');
    expect(context.user?.email).toBe('test@example.com');
    expect(context.prisma).toBeDefined();
  });
  
  test('Context creates user if not found in database', async () => {
    // Mock successful token verification
    const mockDecodedToken = {
      uid: 'new-uid',
      email: 'new@example.com',
      name: 'New User'
    };
    
    // Setup mock implementations
    mockedVerifyIdToken.mockResolvedValue(mockDecodedToken);
    mockedFindUnique.mockResolvedValue(null);
    mockedCreate.mockResolvedValue({
      id: 'new-user-1',
      firebaseUid: 'new-uid',
      email: 'new@example.com',
      name: 'New User',
      avatar: null
    });
    
    // Call the context creation function
    const context = await createContext({ req: mockReq, res: mockRes });
    
    // Verify token verification was called
    expect(mockedVerifyIdToken).toHaveBeenCalledWith('mock-token');
    
    // Verify user lookup was performed
    expect(mockedFindUnique).toHaveBeenCalledWith({
      where: { firebaseUid: 'new-uid' }
    });
    
    // Verify user creation was performed with at least the required fields
    expect(mockedCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          firebaseUid: 'new-uid',
          email: 'new@example.com',
          name: 'New User'
        })
      })
    );
    
    // Verify the context contains the user
    expect(context.user).toBeDefined();
    expect(context.user?.id).toBe('new-user-1');
    expect(context.user?.email).toBe('new@example.com');
  });
  
  test('Context has no user when no token is provided', async () => {
    // Setup request without token
    const reqWithoutToken = {
      headers: {},
      cookies: {},
      path: '/some/path',
      method: 'GET'
    } as unknown as Request;
    
    // Call the context creation function
    const context = await createContext({ req: reqWithoutToken, res: mockRes });
    
    // Verify token verification was not called
    expect(mockedVerifyIdToken).not.toHaveBeenCalled();
    
    // Verify user lookup was not performed
    expect(mockedFindUnique).not.toHaveBeenCalled();
    
    // Verify the context does not contain a user
    expect(context.user).toBeNull();
    expect(context.prisma).toBeDefined();
  });
  
  test('Context has no user when token verification fails', async () => {
    // Setup mock implementations to fail
    mockedVerifyIdToken.mockRejectedValue(new Error('Invalid token'));
    
    // Call the context creation function
    const context = await createContext({ req: mockReq, res: mockRes });
    
    // Verify token verification was called
    expect(mockedVerifyIdToken).toHaveBeenCalledWith('mock-token');
    
    // Verify user lookup was not performed
    expect(mockedFindUnique).not.toHaveBeenCalled();
    
    // Verify the context does not contain a user
    expect(context.user).toBeNull();
    expect(context.prisma).toBeDefined();
  });
}); 