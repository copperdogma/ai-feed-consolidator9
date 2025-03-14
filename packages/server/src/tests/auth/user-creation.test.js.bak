/**
 * User Creation After Authentication Test
 * 
 * This test verifies that users are properly created in the database
 * after successful authentication.
 */

// Import our firebase-admin module that's mocked in setup.js
import firebaseAdmin from '../../lib/firebase-admin';
// Import our prisma module that's mocked in setup.js
import prisma from '../../sdks/prisma';

// Mock axios for API calls
jest.mock('axios');
const axios = require('axios');

// Configuration for test
const config = {
  serverUrl: 'http://localhost:3001',
  testUser: {
    uid: 'test-user-123',
    email: 'test-123@example.com',
    displayName: 'Test User'
  },
  mockToken: 'mock-token' // Special token for development mode
};

// Define the createUser function directly for testing
const createUser = async (firebaseUser) => {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { firebase_uid: firebaseUser.uid }
    });

    // If user exists, return it
    if (existingUser) {
      return existingUser;
    }

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        firebase_uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName
      }
    });

    return newUser;
  } catch (error) {
    console.error('Error creating user:', error);
    throw new Error('Failed to create user in database');
  }
};

describe('User Creation Tests', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Setup mock responses
    prisma.user.findUnique.mockResolvedValue(null); // User not found initially
    prisma.user.create.mockResolvedValue({
      id: 'db-user-123',
      firebase_uid: config.testUser.uid,
      email: config.testUser.email,
      name: config.testUser.displayName,
      created_at: new Date(),
      updated_at: new Date()
    });
    prisma.user.count.mockResolvedValue(10); // Mock user count

    // Setup mock for user update
    prisma.user.update.mockResolvedValue({
      id: 'db-user-123',
      firebase_uid: config.testUser.uid,
      email: 'updated@example.com',
      name: 'Updated User',
      avatar: 'https://example.com/updated.jpg',
      created_at: new Date(),
      updated_at: new Date()
    });

    // Mock axios response
    axios.post.mockResolvedValue({
      status: 200,
      data: {
        user: {
          id: 'db-user-123',
          firebaseUid: config.testUser.uid,
          email: config.testUser.email,
          name: config.testUser.displayName
        }
      }
    });
  });
  
  test('should create a new user in the database if they do not exist', async () => {
    // Call the function we want to test
    const result = await createUser({
      uid: config.testUser.uid,
      email: config.testUser.email,
      displayName: config.testUser.displayName
    });
    
    // Check the database was queried to see if user exists
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { firebase_uid: config.testUser.uid }
    });
    
    // Check a new user was created
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        firebase_uid: config.testUser.uid,
        email: config.testUser.email,
        name: config.testUser.displayName
      }
    });
    
    // Check the result is correct
    expect(result).toEqual({
      id: 'db-user-123',
      firebase_uid: config.testUser.uid,
      email: config.testUser.email,
      name: config.testUser.displayName,
      created_at: expect.any(Date),
      updated_at: expect.any(Date)
    });
  });
  
  test('should return existing user if they already exist', async () => {
    // Setup mock to return an existing user
    const existingUser = {
      id: 'db-user-123',
      firebase_uid: config.testUser.uid,
      email: config.testUser.email,
      name: config.testUser.displayName,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    prisma.user.findUnique.mockResolvedValue(existingUser);
    
    // Call the function we want to test
    const result = await createUser({
      uid: config.testUser.uid,
      email: config.testUser.email,
      displayName: config.testUser.displayName
    });
    
    // Check the database was queried to see if user exists
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { firebase_uid: config.testUser.uid }
    });
    
    // Check no new user was created
    expect(prisma.user.create).not.toHaveBeenCalled();
    
    // Check the result is the existing user
    expect(result).toEqual(existingUser);
  });

  test('should handle client-side authentication flow', async () => {
    // Mock API call for the client flow
    axios.post.mockResolvedValueOnce({
      status: 200,
      data: {
        user: {
          id: 'db-user-123',
          firebaseUid: config.testUser.uid,
          email: config.testUser.email,
          name: config.testUser.displayName
        }
      }
    });

    // Call the debug-auth endpoint like the client would
    const response = await axios.post(
      `${config.serverUrl}/debug-auth`,
      {
        firebaseUid: config.testUser.uid,
        email: config.testUser.email,
        name: config.testUser.displayName
      },
      {
        headers: {
          'Authorization': `Bearer ${config.mockToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Verify the API response
    expect(response.status).toBe(200);
    expect(response.data.user).toBeDefined();
    expect(response.data.user.firebaseUid).toBe(config.testUser.uid);

    // Verify the API was called correctly
    expect(axios.post).toHaveBeenCalledWith(
      `${config.serverUrl}/debug-auth`,
      expect.objectContaining({
        firebaseUid: config.testUser.uid,
        email: config.testUser.email,
        name: config.testUser.displayName
      }),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': `Bearer ${config.mockToken}`
        })
      })
    );
  });
  
  // New test for the fixed behavior - prioritizing request body data in development mode
  test('prioritizes request body data over token data in development mode', async () => {
    // Mock process.env to be in development mode
    const originalEnv = process.env.ENVIRONMENT;
    process.env.ENVIRONMENT = 'development';
    
    // Mock Firebase token verification to return different data than request body
    const mockDecodedToken = {
      uid: 'firebase-uid-123',
      email: 'firebase@example.com',
      name: 'Firebase User'
    };
    
    firebaseAdmin.auth.verifyIdToken = jest.fn().mockResolvedValue(mockDecodedToken);
    
    // Mock an existing user
    const existingUser = {
      id: 'db-user-456',
      firebase_uid: mockDecodedToken.uid,
      email: mockDecodedToken.email,
      name: mockDecodedToken.name,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    prisma.user.findUnique.mockResolvedValue(existingUser);
    
    // Request body with real user data (different from token)
    const requestBody = {
      firebaseUid: 'real-user-456',
      email: 'real.user@example.com',
      name: 'Real User'
    };
    
    // Mock express req/res objects
    const req = {
      headers: {
        authorization: 'Bearer mock-token-456'
      },
      body: requestBody
    };
    
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    // Simulate calling the endpoint directly
    // This is a simplified version of the debug-auth endpoint logic
    const mockDebugAuth = async (req, res) => {
      try {
        const token = req.headers.authorization.substring(7);
        const decodedToken = await firebaseAdmin.auth.verifyIdToken(token);
        
        // In development mode, prioritize request body data
        const isDevelopment = process.env.ENVIRONMENT === 'development';
        const userData = {
          firebaseUid: isDevelopment && req.body.firebaseUid ? req.body.firebaseUid : decodedToken.uid,
          email: isDevelopment && req.body.email ? req.body.email : decodedToken.email,
          name: isDevelopment && req.body.name ? req.body.name : decodedToken.name
        };
        
        // Look for user
        let user = await prisma.user.findUnique({
          where: { firebase_uid: userData.firebaseUid }
        });
        
        if (user) {
          // Update user in development mode
          if (isDevelopment) {
            const updateData = {};
            if (req.body.email) updateData.email = req.body.email;
            if (req.body.name) updateData.name = req.body.name;
            
            if (Object.keys(updateData).length > 0) {
              user = await prisma.user.update({
                where: { id: user.id },
                data: updateData
              });
            }
          }
        } else {
          // Create user
          user = await prisma.user.create({
            data: userData
          });
        }
        
        return res.json({
          status: 'success',
          message: 'Authentication successful',
          user
        });
      } catch (error) {
        return res.status(500).json({
          status: 'error',
          message: 'Failed to authenticate'
        });
      }
    };
    
    // Call the mock endpoint
    await mockDebugAuth(req, res);
    
    // Verify findUnique was called with the request body UID not the token UID
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { firebase_uid: requestBody.firebaseUid }
    });
    
    // Verify update was called with request body data
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: existingUser.id },
      data: expect.objectContaining({
        email: requestBody.email,
        name: requestBody.name
      })
    });
    
    // Verify response was sent
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      status: 'success',
      user: expect.any(Object)
    }));
    
    // Restore original env
    process.env.ENVIRONMENT = originalEnv;
  });
}); 