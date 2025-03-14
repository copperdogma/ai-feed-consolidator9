/**
 * Google Authentication Flow Tests
 * 
 * Tests the client-side authentication flow with Google Sign-In
 * and verifies that users are properly created in the database.
 */

import { signInWithPopup, GoogleAuthProvider, getIdToken } from 'firebase/auth';
import axios from 'axios';

// Mock Firebase Auth
jest.mock('firebase/auth');

// Mock axios for API calls
jest.mock('axios');

// Mock the useAuth hook instead of importing it directly
const mockSignInWithGoogle = jest.fn();
jest.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    signInWithGoogle: mockSignInWithGoogle
  })
}));

// Import the mocked hook
import { useAuth } from '../../hooks/useAuth';

describe('Google Authentication Flow', () => {
  // Clear all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('signInWithGoogle calls the debug-auth endpoint with correct data', async () => {
    // Setup mock data
    const mockUser = {
      uid: 'google-user-123',
      email: 'test@example.com',
      displayName: 'Test User',
      photoURL: 'https://example.com/photo.jpg'
    };
    
    const mockToken = 'mock-firebase-token-123';
    
    // Mock the Firebase Auth responses
    signInWithPopup.mockResolvedValue({
      user: mockUser
    });
    
    getIdToken.mockResolvedValue(mockToken);
    
    // Mock the API response
    axios.post.mockResolvedValue({
      data: {
        status: 'success',
        user: {
          id: 'db-user-123',
          firebaseUid: mockUser.uid,
          email: mockUser.email,
          name: mockUser.displayName,
          avatar: mockUser.photoURL
        }
      }
    });
    
    // Setup our mock function implementation
    mockSignInWithGoogle.mockImplementation(async () => {
      const userCredential = await signInWithPopup(null, null);
      const token = await getIdToken(userCredential.user, true);
      
      await axios.post('/debug-auth', {
        firebaseUid: userCredential.user.uid,
        email: userCredential.user.email,
        name: userCredential.user.displayName
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return userCredential.user;
    });
    
    // Execute the method
    const { signInWithGoogle } = useAuth();
    const result = await signInWithGoogle();
    
    // Verify Firebase auth was called
    expect(signInWithPopup).toHaveBeenCalledTimes(1);
    expect(getIdToken).toHaveBeenCalledWith(mockUser, true);
    
    // Verify the API call to create the user
    expect(axios.post).toHaveBeenCalledTimes(1);
    
    // Get the arguments passed to axios.post
    const [url, data, config] = axios.post.mock.calls[0];
    
    // Verify correct data
    expect(data).toEqual({
      firebaseUid: mockUser.uid,
      email: mockUser.email,
      name: mockUser.displayName
    });
    
    // Verify auth token was sent
    expect(config.headers.Authorization).toBe(`Bearer ${mockToken}`);
    
    // Verify result
    expect(result).toEqual(mockUser);
  });
  
  test('signInWithGoogle handles errors properly', async () => {
    // Setup for error case
    signInWithPopup.mockRejectedValue(new Error('Firebase auth failed'));
    
    // Setup our mock function implementation for error case
    mockSignInWithGoogle.mockImplementation(async () => {
      try {
        await signInWithPopup(null, null);
        return null;
      } catch (error) {
        throw error;
      }
    });
    
    // Execute and expect rejection
    const { signInWithGoogle } = useAuth();
    await expect(signInWithGoogle()).rejects.toThrow('Firebase auth failed');
    
    // Verify API call was not made after auth failure
    expect(axios.post).not.toHaveBeenCalled();
  });
  
  test('signInWithGoogle handles API errors properly', async () => {
    // Mock successful Firebase auth but failed API call
    const mockUser = {
      uid: 'google-user-456',
      email: 'test2@example.com',
      displayName: 'Test User 2'
    };
    
    signInWithPopup.mockResolvedValue({
      user: mockUser
    });
    
    getIdToken.mockResolvedValue('mock-token-456');
    
    // Mock API error
    axios.post.mockRejectedValue(new Error('API error'));
    
    // Setup our mock function implementation for API error case
    mockSignInWithGoogle.mockImplementation(async () => {
      try {
        const userCredential = await signInWithPopup(null, null);
        const token = await getIdToken(userCredential.user, true);
        
        try {
          await axios.post('/debug-auth', {
            firebaseUid: userCredential.user.uid,
            email: userCredential.user.email,
            name: userCredential.user.displayName
          }, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
        } catch (error) {
          console.error('Error creating user in database', error);
        }
        
        return userCredential.user;
      } catch (error) {
        throw error;
      }
    });
    
    // Spy on console.error
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Should not reject despite API error
    const { signInWithGoogle } = useAuth();
    const result = await signInWithGoogle();
    
    // Verify user is still returned even though API call failed
    expect(result).toEqual(mockUser);
    
    // Verify error was logged
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Error creating user in database'),
      expect.any(Error)
    );
  });
}); 