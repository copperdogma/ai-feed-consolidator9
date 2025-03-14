// Minimal setup file for Jest tests

// Configure environment variables for testing
process.env.ENVIRONMENT = 'development';
process.env.DATABASE_URL = 'postgresql://admin:password@localhost:5432/ai-feed-consolidator-test';

// Mock Firebase Admin
jest.mock('../lib/firebase-admin', () => {
  const authMock = {
    verifyIdToken: jest.fn().mockResolvedValue({
      uid: 'test-uid',
      email: 'test@example.com',
      name: 'Test User'
    }),
    getUser: jest.fn().mockResolvedValue({
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User'
    }),
    createUser: jest.fn().mockResolvedValue({
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User'
    })
  };

  return {
    initializeApp: jest.fn(),
    credential: {
      cert: jest.fn()
    },
    auth: jest.fn().mockReturnValue(authMock),
    apps: []
  };
});

// Mock Prisma
jest.mock('../sdks/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn()
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $queryRaw: jest.fn()
  }
})); 