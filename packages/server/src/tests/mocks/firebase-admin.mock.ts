/**
 * Mock for Firebase Admin SDK for testing purposes
 */

// Mock DecodedIdToken interface
export interface MockDecodedIdToken {
  uid: string;
  email?: string;
  name?: string;
  picture?: string;
  [key: string]: any;
}

// Factory function to create a mock Auth class
const createMockAuth = () => {
  // Mock Auth class
  class MockAuth {
    private mockUsers: Record<string, MockDecodedIdToken> = {};

    // Add a mock user for testing
    addMockUser(token: string, userData: MockDecodedIdToken) {
      this.mockUsers[token] = userData;
    }

    // Clear all mock users
    clearMockUsers() {
      this.mockUsers = {};
    }

    // Mock verifyIdToken method
    async verifyIdToken(token: string): Promise<MockDecodedIdToken> {
      if (token === 'invalid_token') {
        throw new Error('Firebase ID token has been revoked');
      }

      if (token === 'expired_token') {
        throw new Error('Firebase ID token has expired');
      }

      const user = this.mockUsers[token];
      if (!user) {
        // Default test user if no mock user is set
        if (token === 'valid_token') {
          return {
            uid: 'test-uid',
            email: 'test@example.com',
            name: 'Test User',
            picture: 'https://example.com/avatar.png',
          };
        }
        throw new Error('User not found');
      }

      return user;
    }
  }

  return new MockAuth();
};

// Create the mock auth instance
export const auth = createMockAuth();

// Export the default mock
export default {
  auth
}; 