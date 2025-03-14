// Minimal setup file for Vitest tests

import { vi } from 'vitest';

// Configure environment variables for testing
process.env.ENVIRONMENT = 'development';
process.env.DATABASE_URL = 'postgresql://admin:password@localhost:5432/ai-feed-consolidator-test';

// Mock Firebase Admin
vi.mock('../lib/firebase-admin', () => {
  const authMock = {
    verifyIdToken: vi.fn().mockResolvedValue({
      uid: 'test-uid',
      email: 'test@example.com',
      name: 'Test User'
    }),
    getUser: vi.fn().mockResolvedValue({
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User'
    }),
    createUser: vi.fn().mockResolvedValue({
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User'
    })
  };

  return {
    initializeApp: vi.fn(),
    credential: {
      cert: vi.fn()
    },
    auth: vi.fn().mockReturnValue(authMock),
    apps: []
  };
});

// Mock Prisma
vi.mock('../sdks/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn()
    },
    $connect: vi.fn(),
    $disconnect: vi.fn(),
    $queryRaw: vi.fn()
  }
})); 