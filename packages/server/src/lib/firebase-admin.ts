// Import firebase-admin
import admin from 'firebase-admin';

// Check if we're in development mode
const isDevelopment = process.env.ENVIRONMENT === 'development';

// Initialize Firebase Admin
if (admin.apps.length === 0) {
  try {
    if (isDevelopment) {
      // In development mode, check if we have Firebase credentials first
      const projectId = process.env.FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
      
      if (projectId && clientEmail && privateKey) {
        // If we have credentials, use them even in development
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey
          })
        });
        console.log('Firebase Admin initialized in development mode with real credentials');
      } else {
        // Otherwise, use a mock app config
        admin.initializeApp({
          projectId: 'mock-project-id',
        });
        console.log('Firebase Admin initialized in development mode with mock configuration');
      }
    } else {
      // In production, use real credentials
      const projectId = process.env.FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
      
      if (!projectId || !clientEmail || !privateKey) {
        throw new Error('Firebase credentials are required in production mode');
      }
      
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey
        })
      });
      console.log('Firebase Admin initialized with real credentials');
    }
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    
    // If we failed to initialize and it's development mode, try one more time with mock config
    if (isDevelopment && admin.apps.length === 0) {
      admin.initializeApp({
        projectId: 'mock-project-id-fallback',
      });
      console.log('Firebase Admin initialized with mock configuration (fallback after error)');
    }
  }
}

// Create a mock verifyIdToken function for development
const authInstance = admin.auth();

if (isDevelopment) {
  // Use the 'any' type to bypass TypeScript errors for this development-only mock
  const originalVerifyIdToken = authInstance.verifyIdToken;
  (authInstance as any).verifyIdToken = async (token: string) => {
    // Check if token is a special test token
    if (token === 'mock-token') {
      console.log('Using mock token verification for test token');
      // Return a mock token payload for testing
      return {
        uid: 'mock-user-uid',
        email: 'mock@example.com', 
        name: 'Mock User',
        auth_time: Math.floor(Date.now() / 1000),
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
        // Additional required fields for DecodedIdToken
        aud: 'mock-project-id',
        iss: 'https://securetoken.google.com/mock-project-id',
        sub: 'mock-user-uid',
        firebase: {
          identities: {},
          sign_in_provider: 'custom'
        }
      };
    }
    
    try {
      // First try the real verification for all other tokens
      return await originalVerifyIdToken(token);
    } catch (error: any) {
      console.log('Firebase token verification failed:', error.message || 'Unknown error');
      console.log('Using mock token verification as fallback with real user ID if available');
      
      // Try to base64 decode the token to extract user info if it's a valid JWT
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          // This looks like a JWT, try to decode payload
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
          console.log('Extracted payload from token:', {
            sub: payload.sub,
            email: payload.email,
            name: payload.name
          });
          
          // Use values from decoded token if available
          return {
            uid: payload.sub || payload.user_id || 'mock-user-uid',
            email: payload.email || 'mock@example.com',
            name: payload.name || 'Mock User',
            auth_time: Math.floor(Date.now() / 1000),
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 3600,
            // Additional required fields
            aud: 'mock-project-id',
            iss: 'https://securetoken.google.com/mock-project-id',
            sub: payload.sub || payload.user_id || 'mock-user-uid',
            firebase: {
              identities: {},
              sign_in_provider: 'custom'
            }
          };
        }
      } catch (decodeError) {
        console.log('Could not decode token payload, using default mock values');
      }
      
      // Return a mock token payload in development as fallback
      return {
        uid: 'mock-user-uid',
        email: 'mock@example.com', 
        name: 'Mock User',
        auth_time: Math.floor(Date.now() / 1000),
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
        // Additional required fields for DecodedIdToken
        aud: 'mock-project-id',
        iss: 'https://securetoken.google.com/mock-project-id',
        sub: 'mock-user-uid',
        firebase: {
          identities: {},
          sign_in_provider: 'custom'
        }
      };
    }
  };
}

export const auth = authInstance;
export default admin; 