/**
 * Tests for Firebase Admin initialization
 * (Migrated from Jest to Vitest)
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { App } from 'firebase-admin/app';

// Define types for our mocks
interface MockApp extends Partial<App> {}

// Mock firebase-admin module
vi.mock('firebase-admin', () => {
  const mockVerifyIdToken = vi.fn();
  const mockInitializeApp = vi.fn().mockReturnValue({} as MockApp);
  const mockCert = vi.fn().mockReturnValue('mock-cert');
  const mockAuth = vi.fn().mockReturnValue({ verifyIdToken: mockVerifyIdToken });
  
  // Create a mock apps array that we can manipulate in tests
  const mockApps: MockApp[] = [];
  
  return {
    default: {
      apps: mockApps,
      initializeApp: mockInitializeApp,
      credential: {
        cert: mockCert
      },
      auth: mockAuth
    },
    apps: mockApps,
    initializeApp: mockInitializeApp,
    credential: {
      cert: mockCert
    },
    auth: mockAuth
  };
});

// Import the mocked firebase-admin so we can access the mock functions
import admin from 'firebase-admin';

describe('Firebase Admin Initialization', () => {
  // Store original environment and console methods
  const originalEnv = { ...process.env };
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;
  
  // Before each test, reset mocks and environment
  beforeEach(() => {
    // Reset environment variables
    process.env = { ...originalEnv };
    process.env.ENVIRONMENT = 'development';
    
    // Mock console methods
    console.log = vi.fn();
    console.error = vi.fn();
    
    // Clear mock functions
    vi.clearAllMocks();
    
    // Reset apps array
    admin.apps.length = 0;
    
    // Use try/catch for resetModules since it might not exist in all versions
    try {
      // @ts-ignore - resetModules is available in Vitest but TypeScript may not recognize it
      vi.resetModules();
    } catch (error) {
      // Ignore if not available
    }
  });
  
  // After each test, restore originals
  afterEach(() => {
    // Restore console methods
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    
    // Restore environment
    process.env = { ...originalEnv };
  });

  it('initializes Firebase Admin in development mode with mock config when credentials are missing', async () => {
    // Clear credentials
    delete process.env.FIREBASE_PROJECT_ID;
    delete process.env.FIREBASE_CLIENT_EMAIL;
    delete process.env.FIREBASE_PRIVATE_KEY;
    
    // Import module to trigger initialization
    await import('../../lib/firebase-admin');
    
    // Verify initializeApp was called with mock config
    expect(admin.initializeApp).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: 'mock-project-id'
      })
    );
    
    // Verify console output
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('mock configuration')
    );
  });

  it('initializes Firebase Admin in development mode with real credentials when available', async () => {
    // Set test credentials
    process.env.FIREBASE_PROJECT_ID = 'test-project-id';
    process.env.FIREBASE_CLIENT_EMAIL = 'test-client-email';
    process.env.FIREBASE_PRIVATE_KEY = 'test-private-key';
    
    // Import module to trigger initialization
    await import('../../lib/firebase-admin');
    
    // Verify cert was called with credentials
    expect(admin.credential.cert).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: 'test-project-id',
        clientEmail: 'test-client-email',
        privateKey: 'test-private-key'
      })
    );
    
    // Verify initializeApp was called with credential
    expect(admin.initializeApp).toHaveBeenCalledWith(
      expect.objectContaining({
        credential: 'mock-cert'
      })
    );
    
    // Verify console output
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('real credentials')
    );
  });

  it('does not reinitialize Firebase if apps are already initialized', async () => {
    // Make it appear as if Firebase is already initialized
    // @ts-ignore - we're intentionally pushing a partial mock
    admin.apps.push({});
    
    // Import module which should check apps.length
    await import('../../lib/firebase-admin');
    
    // Verify initializeApp was not called
    expect(admin.initializeApp).not.toHaveBeenCalled();
  });

  it('handles initialization errors gracefully in development mode', async () => {
    // Set up to throw error on first initialization attempt
    // @ts-ignore - we know this is a mock function that has mockImplementationOnce
    admin.initializeApp.mockImplementationOnce(() => {
      throw new Error('Test initialization error');
    });
    
    // Set credentials to trigger the real credential path
    process.env.FIREBASE_PROJECT_ID = 'test-project-id';
    process.env.FIREBASE_CLIENT_EMAIL = 'test-client-email';
    process.env.FIREBASE_PRIVATE_KEY = 'test-private-key';
    
    // Import module to trigger initialization with error
    await import('../../lib/firebase-admin');
    
    // Verify error was logged
    expect(console.error).toHaveBeenCalledWith(
      'Error initializing Firebase Admin:',
      expect.any(Error)
    );
    
    // Verify fallback initialization was attempted
    expect(admin.initializeApp).toHaveBeenCalledTimes(2);
    expect(admin.initializeApp).toHaveBeenLastCalledWith(
      expect.objectContaining({
        projectId: 'mock-project-id-fallback'
      })
    );
    
    // Verify fallback message was logged
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('fallback after error')
    );
  });
}); 