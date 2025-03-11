/**
 * Tests for Firebase Admin initialization
 */
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';

// Create mock functions to use with our mocks
const initializeAppMock = jest.fn();
const certMock = jest.fn();
const authMock = jest.fn().mockReturnValue({ verifyIdToken: jest.fn() });
const getEnvMock = jest.fn();

// Mock firebase-admin before importing
jest.mock('firebase-admin', () => ({
  initializeApp: initializeAppMock,
  apps: [],
  credential: {
    cert: certMock
  },
  auth: authMock
}));

// Mock env-var before importing
jest.mock('env-var', () => ({
  get: getEnvMock
}));

describe('Firebase Admin Initialization', () => {
  // Store original console methods
  const originalConsoleLog = console.log;
  
  beforeEach(() => {
    // Clear all mocks and reset modules
    jest.clearAllMocks();
    jest.resetModules();
    
    // Setup default env-var behavior
    getEnvMock.mockImplementation((key) => ({
      asString: jest.fn().mockReturnValue('development'),
      required: jest.fn().mockReturnThis()
    }));
    
    // Mock console
    console.log = jest.fn();
  });
  
  afterEach(() => {
    console.log = originalConsoleLog;
  });
  
  describe('Development Environment', () => {
    it('should initialize with mock configuration in development environment', async () => {
      // Reset apps to simulate fresh initialization
      jest.resetModules();
      
      // Import the module to trigger initialization
      await import('../../lib/firebase-admin');
      
      // Verify it was initialized with mock config
      expect(initializeAppMock).toHaveBeenCalledWith({
        projectId: 'demo-project'
      });
      
      expect(console.log).toHaveBeenCalledWith(
        'Firebase Admin initialized in development mode with mock configuration'
      );
    });
  });
  
  describe('Production Environment', () => {
    it('should initialize with real credentials in production environment', async () => {
      // Mock environment variables for production
      getEnvMock.mockImplementation((key) => {
        if (key === 'ENVIRONMENT') {
          return {
            asString: jest.fn().mockReturnValue('production'),
            required: jest.fn().mockReturnThis()
          };
        }
        if (key === 'FIREBASE_PROJECT_ID') {
          return {
            asString: jest.fn().mockReturnValue('test-project-id'),
            required: jest.fn().mockReturnThis()
          };
        }
        if (key === 'FIREBASE_CLIENT_EMAIL') {
          return {
            asString: jest.fn().mockReturnValue('test-email@example.com'),
            required: jest.fn().mockReturnThis()
          };
        }
        if (key === 'FIREBASE_PRIVATE_KEY') {
          return {
            asString: jest.fn().mockReturnValue('test-private-key'),
            required: jest.fn().mockReturnThis()
          };
        }
        return {
          asString: jest.fn().mockReturnValue(''),
          required: jest.fn().mockReturnThis()
        };
      });
      
      // Setup cert to return a mock value
      certMock.mockReturnValue('mock-cert-result');
      
      // Reset modules to simulate fresh initialization
      jest.resetModules();
      
      // Import the module to trigger initialization
      await import('../../lib/firebase-admin');
      
      // Verify credential cert was called with correct params
      expect(certMock).toHaveBeenCalledWith({
        projectId: 'test-project-id',
        clientEmail: 'test-email@example.com',
        privateKey: 'test-private-key'
      });
      
      // Verify app was initialized with the cert
      expect(initializeAppMock).toHaveBeenCalledWith({
        credential: 'mock-cert-result'
      });
      
      expect(console.log).toHaveBeenCalledWith(
        'Firebase Admin initialized with production credentials'
      );
    });
    
    it('should throw an error if required environment variables are missing', async () => {
      // Mock environment to production but make a required var throw
      getEnvMock.mockImplementation((key) => {
        if (key === 'ENVIRONMENT') {
          return {
            asString: jest.fn().mockReturnValue('production'),
            required: jest.fn().mockReturnThis()
          };
        }
        if (key === 'FIREBASE_PROJECT_ID') {
          return {
            asString: jest.fn(),
            required: jest.fn().mockImplementation(() => {
              throw new Error('Environment variable "FIREBASE_PROJECT_ID" is required');
            })
          };
        }
        return {
          asString: jest.fn().mockReturnValue(''),
          required: jest.fn().mockReturnThis()
        };
      });
      
      // Reset modules to simulate fresh initialization
      jest.resetModules();
      
      // The import should throw
      await expect(import('../../lib/firebase-admin')).rejects.toThrow(
        'Environment variable "FIREBASE_PROJECT_ID" is required'
      );
    });
    
    it('should throw an error if Firebase initialization fails', async () => {
      // Mock environment to production
      getEnvMock.mockImplementation((key) => {
        if (key === 'ENVIRONMENT') {
          return {
            asString: jest.fn().mockReturnValue('production'),
            required: jest.fn().mockReturnThis()
          };
        }
        // All other env vars return a default valid value
        return {
          asString: jest.fn().mockReturnValue('test-value'),
          required: jest.fn().mockReturnThis()
        };
      });
      
      // Make cert throw to simulate an initialization error
      certMock.mockImplementation(() => {
        throw new Error('Invalid credential format');
      });
      
      // Reset modules to simulate fresh initialization
      jest.resetModules();
      
      // The import should throw
      await expect(import('../../lib/firebase-admin')).rejects.toThrow(
        'Invalid credential format'
      );
      
      // Verify cert was called (attempt was made)
      expect(certMock).toHaveBeenCalled();
    });
  });
}); 