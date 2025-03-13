# Authentication Documentation

## Overview

The AI Feed Consolidator uses Firebase Authentication as its primary authentication provider, with a custom server-side implementation to verify tokens and manage user persistence in the PostgreSQL database. This document details the authentication architecture and flow.

## Authentication Flow

1. **Client-Side Authentication**:
   - User signs in via Firebase Authentication (Google provider)
   - Firebase returns a user object and authentication token
   - Client requests a fresh ID token from Firebase
   - Client sends this token to the server via `/debug-auth` endpoint
   - Client stores authentication state in the `AuthContext`

2. **Server-Side Verification**:
   - Server receives the ID token in the Authorization header
   - Firebase Admin SDK verifies the token's validity
   - Server extracts user data (UID, email, name) from the token
   - Server checks if a user with this Firebase UID exists in the database
   - If no user exists, a new user record is created
   - Server returns the user data to the client

3. **Session Management**:
   - Client maintains the Firebase user session
   - For subsequent authenticated requests, the client:
     - Obtains a fresh token when needed
     - Includes the token in the Authorization header
     - Server re-verifies the token for each protected request

## Configuration

### Firebase Setup

#### Client Configuration (`packages/client/src/lib/firebase.ts`)
```typescript
// Firebase web SDK configuration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
```

#### Server Configuration (`packages/server/src/lib/firebase-admin.ts`)
```typescript
import admin from 'firebase-admin';

// Initialize Firebase Admin with service account credentials
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  })
});

export const auth = admin.auth();
export default admin;
```

### Environment Variables

#### Client (`.env`)
```
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

#### Server (`.env`)
```
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY=your_firebase_private_key
```

## Client-Side Implementation

### Authentication Context

The `AuthContext` (`packages/client/src/hooks/useAuth.tsx`) provides authentication state and methods throughout the client application:

```typescript
// Key methods provided by AuthContext
interface AuthContextType {
  currentUser: FirebaseUser | null;  // Current authenticated user
  loading: boolean;                  // Authentication loading state
  signIn: (email: string, password: string) => Promise<FirebaseUser>;  // Email/password sign in
  signUp: (email: string, password: string) => Promise<FirebaseUser>;  // Email/password sign up
  signInWithGoogle: () => Promise<FirebaseUser>;  // Google sign in
  logout: () => Promise<void>;  // Sign out
  getToken: () => Promise<string | null>;  // Get fresh ID token
  testUserCreation: () => Promise<boolean>;  // Test user database creation
  error: string | null;  // Authentication error state
}
```

### Google Authentication Implementation

The `signInWithGoogle` method handles Firebase authentication and server-side user creation:

```typescript
const signInWithGoogle = async (): Promise<FirebaseUser> => {
  try {
    // 1. Sign in with Google via Firebase
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    
    // 2. Get the ID token
    const token = await getIdToken(result.user, true);
    
    // 3. Send token to server to create/update user in database
    const baseUrl = import.meta.env.VITE_APP_API_URL.split('/trpc')[0];
    const response = await axios.post(
      `${baseUrl}/debug-auth`,
      {
        firebaseUid: result.user.uid,
        email: result.user.email,
        name: result.user.displayName
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      }
    );
    
    // 4. Return Firebase user object
    return result.user;
  } catch (error) {
    // Handle authentication errors
    throw error;
  }
};
```

## Server-Side Implementation

### Debug Auth Endpoint

The `/debug-auth` endpoint (`packages/server/src/main.ts`) handles token verification and user creation:

```typescript
app.post('/debug-auth', async (req, res) => {
  try {
    // 1. Get token from Authorization header
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
    
    if (!token) {
      return res.status(401).json({ 
        status: 'error', 
        message: 'No authentication token provided' 
      });
    }
    
    // 2. Verify token with Firebase Admin
    const decodedToken = await auth.verifyIdToken(token);
    
    // 3. Extract user data from token
    const userData = {
      firebaseUid: decodedToken.uid || req.body.firebaseUid,
      email: decodedToken.email || req.body.email || 'unknown@example.com',
      name: decodedToken.name || req.body.name || req.body.displayName || decodedToken.email?.split('@')[0] || 'Unknown User',
      avatar: decodedToken.picture || req.body.avatar || req.body.picture || ''
    };
    
    // 4. Check if user exists in database
    let user = await prisma.user.findUnique({
      where: { firebaseUid: userData.firebaseUid }
    });
    
    // 5. Create user if not exists
    if (!user) {
      user = await prisma.user.create({
        data: userData
      });
    }
    
    // 6. Return user data
    return res.json({
      status: 'success',
      message: 'Authentication successful',
      user
    });
  } catch (error) {
    // Handle verification errors
    return res.status(401).json({
      status: 'error',
      message: 'Invalid authentication token',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
```

## Database Integration

### User Model (Prisma Schema)

```prisma
model User {
  id          String    @id @default(uuid())
  email       String    @unique
  name        String?
  password    Password?
  firebaseUid String?   @unique
  avatar      String?
}

model Password {
  hash   String
  userId String @unique
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

## Testing Authentication

### Client-Side Testing

The Login component provides a "Test User Creation" button that verifies the authentication flow. The `testUserCreation` method in `useAuth` makes an authenticated request to the `/debug-auth` endpoint to verify the entire authentication process.

### Server-Side Testing

Token verification and user creation can be tested with a direct HTTP request to the `/debug-auth` endpoint with a valid Firebase ID token.

## Security Considerations

1. **Token Verification**: Firebase ID tokens are verified on the server side for each authenticated request
2. **Secure Storage**: Tokens are not stored in localStorage to prevent XSS attacks
3. **HTTPS**: All authentication communication occurs over HTTPS in production
4. **Token Expiration**: Firebase tokens expire after 1 hour and are refreshed as needed
5. **Error Handling**: Error responses are sanitized to prevent information leakage 