/**
 * Test Setup for Server Tests
 * 
 * This file runs before Vitest tests to configure the testing environment.
 */

import { vi } from 'vitest';

// Mock environment variables for testing
process.env.FIREBASE_PROJECT_ID = 'test-project-id';
process.env.FIREBASE_CLIENT_EMAIL = 'test-client-email@example.com';
process.env.FIREBASE_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\nMIITest==\n-----END PRIVATE KEY-----\n';
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/ai-feed-consolidator-test';
process.env.NODE_ENV = 'test';

// Mock Firebase Admin
vi.mock('firebase-admin', () => {
  const authMock = {
    verifyIdToken: vi.fn(() => Promise.resolve({
      uid: 'test-uid',
      email: 'test@example.com',
      name: 'Test User'
    })),
    getUser: vi.fn(() => Promise.resolve({
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User'
    })),
    createUser: vi.fn(() => Promise.resolve({
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User'
    }))
  };

  return {
    initializeApp: vi.fn(),
    credential: {
      cert: vi.fn()
    },
    auth: vi.fn(() => authMock),
    apps: []
  };
});

// Mock database
vi.mock('../sdks/prisma', () => {
  return {
    __esModule: true,
    default: {
      user: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn()
      },
      $connect: vi.fn(),
      $disconnect: vi.fn()
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