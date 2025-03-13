/**
 * Test Setup for Server Tests
 * 
 * This file runs before Jest tests to configure the testing environment.
 */

// Mock environment variables for testing
process.env.FIREBASE_PROJECT_ID = 'test-project-id';
process.env.FIREBASE_CLIENT_EMAIL = 'test-client-email@example.com';
process.env.FIREBASE_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\nMIITest==\n-----END PRIVATE KEY-----\n';
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/ai-feed-consolidator-test';
process.env.NODE_ENV = 'test';

// Mock Firebase Admin
jest.mock('firebase-admin', () => {
  const authMock = {
    verifyIdToken: jest.fn(() => Promise.resolve({
      uid: 'test-uid',
      email: 'test@example.com',
      name: 'Test User'
    })),
    getUser: jest.fn(() => Promise.resolve({
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User'
    })),
    createUser: jest.fn(() => Promise.resolve({
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User'
    }))
  };

  return {
    initializeApp: jest.fn(),
    credential: {
      cert: jest.fn()
    },
    auth: jest.fn(() => authMock)
  };
});

// Mock database
jest.mock('../sdks/prisma', () => {
  return {
    __esModule: true,
    default: {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn()
      },
      $connect: jest.fn(),
      $disconnect: jest.fn()
    }
  };
});

// Global setup
beforeAll(() => {
  // Global setup before tests run
});

// Cleanup after each test
afterEach(() => {
  // Additional cleanup after each test if needed
});

// Global teardown
afterAll(() => {
  // Global teardown after all tests complete
}); 