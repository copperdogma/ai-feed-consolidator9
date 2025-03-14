/**
 * User Creation Tests
 * 
 * Tests the server-side user creation flow from Firebase auth to database
 */

// Import Firebase admin (the import will use our mocked version from setup.ts)
import firebaseAdmin from '../../lib/firebase-admin';
import prisma from '../../sdks/prisma';

// Import the function we want to test
import { createUser } from '../../services/auth.service';

describe('User Creation Flow', () => {
  beforeEach(() => {
    // Reset all mock functions before each test
    jest.clearAllMocks();
    
    // Set up mock data
    prisma.user.findUnique.mockResolvedValue(null); // No existing user
    prisma.user.create.mockResolvedValue({
      id: 'db-user-123',
      firebase_uid: 'test-uid',
      email: 'test@example.com',
      name: 'Test User',
      created_at: new Date(),
      updated_at: new Date()
    });
  });
  
  test('should create a new user in the database if they do not exist', async () => {
    // Set up test data
    const firebaseUser = {
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User'
    };
    
    // Call the function we want to test
    const result = await createUser(firebaseUser);
    
    // Check the database was queried to see if user exists
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { firebase_uid: firebaseUser.uid }
    });
    
    // Check a new user was created
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        firebase_uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName
      }
    });
    
    // Check the result is correct
    expect(result).toEqual({
      id: 'db-user-123',
      firebase_uid: 'test-uid',
      email: 'test@example.com',
      name: 'Test User',
      created_at: expect.any(Date),
      updated_at: expect.any(Date)
    });
  });
  
  test('should return existing user if they already exist', async () => {
    // Set up test data
    const existingUser = {
      id: 'db-user-123',
      firebase_uid: 'test-uid',
      email: 'test@example.com',
      name: 'Test User',
      created_at: new Date(),
      updated_at: new Date()
    };
    
    // Mock the database to return an existing user
    prisma.user.findUnique.mockResolvedValue(existingUser);
    
    // Call the function we want to test
    const result = await createUser({
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User'
    });
    
    // Check the database was queried to see if user exists
    expect(prisma.user.findUnique).toHaveBeenCalled();
    
    // Check no new user was created
    expect(prisma.user.create).not.toHaveBeenCalled();
    
    // Check the result is the existing user
    expect(result).toEqual(existingUser);
  });
}); 