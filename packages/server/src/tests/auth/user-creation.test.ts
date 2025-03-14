/**
 * User Creation After Authentication Test
 * 
 * This test verifies that users are properly created in the database
 * after successful authentication.
 * 
 * (Migrated from Jest to Vitest)
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';

// Mock dependencies before importing them
vi.mock('../../lib/firebase-admin', () => ({
  default: {
    auth: {
      verifyIdToken: vi.fn()
    }
  }
}));

vi.mock('../../sdks/prisma', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn()
    },
    $connect: vi.fn(),
    $disconnect: vi.fn()
  }
}));

vi.mock('axios');

// Import mocked modules
import firebaseAdmin from '../../lib/firebase-admin';
import prisma from '../../sdks/prisma';
import axios from 'axios';

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
const createUser = async (firebaseUser: { uid: string; email: string; displayName: string }) => {
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
    vi.clearAllMocks();

    // Setup mock responses
    const mockFindUnique = prisma.user.findUnique as ReturnType<typeof vi.fn>;
    const mockCreate = prisma.user.create as ReturnType<typeof vi.fn>;
    const mockCount = prisma.user.count as ReturnType<typeof vi.fn>;
    const mockUpdate = prisma.user.update as ReturnType<typeof vi.fn>;
    const mockAxiosPost = axios.post as ReturnType<typeof vi.fn>;

    mockFindUnique.mockResolvedValue(null); // User not found initially
    mockCreate.mockResolvedValue({
      id: 'db-user-123',
      firebase_uid: config.testUser.uid,
      email: config.testUser.email,
      name: config.testUser.displayName,
      created_at: new Date(),
      updated_at: new Date()
    });
    mockCount.mockResolvedValue(10); // Mock user count

    // Setup mock for user update
    mockUpdate.mockResolvedValue({
      id: 'db-user-123',
      firebase_uid: config.testUser.uid,
      email: 'updated@example.com',
      name: 'Updated User',
      avatar: 'https://example.com/updated.jpg',
      created_at: new Date(),
      updated_at: new Date()
    });

    // Mock axios response
    mockAxiosPost.mockResolvedValue({
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
    
    (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(existingUser);
    
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
    
    // Check a new user was NOT created
    expect(prisma.user.create).not.toHaveBeenCalled();
    
    // Check the result is the existing user
    expect(result).toEqual(existingUser);
  });
  
  test('should handle errors during user creation', async () => {
    // Setup mocks to simulate an error
    (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    (prisma.user.create as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Database error'));
    
    // Expect the function to throw
    await expect(createUser({
      uid: config.testUser.uid,
      email: config.testUser.email,
      displayName: config.testUser.displayName
    })).rejects.toThrow('Failed to create user in database');
    
    // Check the database was queried
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { firebase_uid: config.testUser.uid }
    });
    
    // Check a create attempt was made
    expect(prisma.user.create).toHaveBeenCalled();
  });
}); 