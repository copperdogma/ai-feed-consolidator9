/**
 * Context Tests
 * 
 * Tests the server-side context creation which is responsible for 
 * authenticating users and creating/retrieving them from the database.
 */

import { createContext } from '../../lib/context';
import { auth } from '../../lib/firebase-admin';
import prisma from '../../sdks/prisma';

// Mock the auth module
jest.mock('../../lib/firebase-admin', () => ({
  auth: {
    verifyIdToken: jest.fn()
  }
}));

// Mock the Prisma client
jest.mock('../../sdks/prisma', () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn()
  },
  $connect: jest.fn(),
  $disconnect: jest.fn()
}));

describe('Context Creation', () => {
  // Setup mock request and response
  const mockReq = {
    headers: {
      authorization: 'Bearer mock-token'
    },
    cookies: {},
    path: '/some/path'
  };
  
  const mockRes = {
    clearCookie: jest.fn()
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('Context contains user after successful authentication', async () => {
    // Mock successful token verification
    const mockDecodedToken = {
      uid: 'firebase-user-123',
      email: 'test@example.com',
      name: 'Test User'
    };
    
    auth.verifyIdToken.mockResolvedValue(mockDecodedToken);
    
    // Mock user not found in database
    prisma.user.findUnique.mockResolvedValue(null);
    
    // Mock successful user creation
    const mockCreatedUser = {
      id: 'db-user-123',
      firebaseUid: mockDecodedToken.uid,
      email: mockDecodedToken.email,
      name: mockDecodedToken.name,
      avatar: null
    };
    
    prisma.user.create.mockResolvedValue(mockCreatedUser);
    
    // Call the context creator
    const context = await createContext({ req: mockReq, res: mockRes });
    
    // Verify token was verified
    expect(auth.verifyIdToken).toHaveBeenCalledWith('mock-token');
    
    // Verify database was queried
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { firebaseUid: mockDecodedToken.uid }
    });
    
    // Verify user was created
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        firebaseUid: mockDecodedToken.uid,
        email: mockDecodedToken.email
      })
    });
    
    // Verify context contains the user
    expect(context.user).toEqual(mockCreatedUser);
  });
  
  test('Context reuses existing user', async () => {
    // Mock successful token verification
    const mockDecodedToken = {
      uid: 'firebase-user-456',
      email: 'existing@example.com',
      name: 'Existing User'
    };
    
    auth.verifyIdToken.mockResolvedValue(mockDecodedToken);
    
    // Mock user found in database
    const mockExistingUser = {
      id: 'db-user-456',
      firebaseUid: mockDecodedToken.uid,
      email: mockDecodedToken.email,
      name: mockDecodedToken.name,
      avatar: null
    };
    
    prisma.user.findUnique.mockResolvedValue(mockExistingUser);
    
    // Call the context creator
    const context = await createContext({ req: mockReq, res: mockRes });
    
    // Verify token was verified
    expect(auth.verifyIdToken).toHaveBeenCalledWith('mock-token');
    
    // Verify database was queried
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { firebaseUid: mockDecodedToken.uid }
    });
    
    // Verify user was not created
    expect(prisma.user.create).not.toHaveBeenCalled();
    
    // Verify context contains the existing user
    expect(context.user).toEqual(mockExistingUser);
  });
  
  test('Context handles token verification failure', async () => {
    // Mock failed token verification
    auth.verifyIdToken.mockRejectedValue(new Error('Invalid token'));
    
    // Call the context creator
    const context = await createContext({ req: mockReq, res: mockRes });
    
    // Verify token verification was attempted
    expect(auth.verifyIdToken).toHaveBeenCalledWith('mock-token');
    
    // Verify database was not queried
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
    expect(prisma.user.create).not.toHaveBeenCalled();
    
    // Verify cookie was cleared
    expect(mockRes.clearCookie).toHaveBeenCalledWith('accessToken');
    
    // Verify context does not contain a user
    expect(context.user).toBeNull();
  });
  
  test('Context handles missing authorization header', async () => {
    // Mock request with no authorization header
    const reqWithoutAuth = {
      ...mockReq,
      headers: {}
    };
    
    // Call the context creator
    const context = await createContext({ req: reqWithoutAuth, res: mockRes });
    
    // Verify token verification was not attempted
    expect(auth.verifyIdToken).not.toHaveBeenCalled();
    
    // Verify database was not queried
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
    expect(prisma.user.create).not.toHaveBeenCalled();
    
    // Verify context does not contain a user
    expect(context.user).toBeNull();
  });
  
  test('Context handles database user creation error', async () => {
    // Mock successful token verification
    const mockDecodedToken = {
      uid: 'firebase-user-789',
      email: 'error@example.com',
      name: 'Error User'
    };
    
    auth.verifyIdToken.mockResolvedValue(mockDecodedToken);
    
    // Mock user not found in database
    prisma.user.findUnique.mockResolvedValue(null);
    
    // Mock failed user creation
    prisma.user.create.mockRejectedValue(new Error('Database error'));
    
    // Spy on console.error
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Call the context creator (should not throw despite the error)
    await expect(createContext({ req: mockReq, res: mockRes })).resolves.toEqual(
      expect.objectContaining({
        user: null
      })
    );
    
    // Verify error was logged
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Error creating user'),
      expect.any(Error)
    );
  });
}); 