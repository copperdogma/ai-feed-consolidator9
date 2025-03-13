import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { 
  User as FirebaseUser,
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  getIdToken
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { toast } from 'react-hot-toast';
import axios from 'axios';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<FirebaseUser>;
  signUp: (email: string, password: string) => Promise<FirebaseUser>;
  signInWithGoogle: () => Promise<FirebaseUser>;
  logout: () => Promise<void>;
  getToken: () => Promise<string | null>;
  testUserCreation: () => Promise<boolean>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sign in with email and password
  const signIn = async (email: string, password: string): Promise<FirebaseUser> => {
    try {
      setError(null);
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in';
      setError(errorMessage);
      throw error;
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string): Promise<FirebaseUser> => {
    try {
      setError(null);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign up';
      setError(errorMessage);
      throw error;
    }
  };

  // Sign in with Google
  const signInWithGoogle = async (): Promise<FirebaseUser> => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      console.log('Sign in successful, user:', result.user);
      
      // Get the ID token for the newly authenticated user
      const token = await getIdToken(result.user, true);
      console.log('Got token, creating user in database...');
      
      // Make request to debug-auth endpoint to create the user in the database
      try {
        const baseUrl = import.meta.env.VITE_APP_API_URL.split('/trpc')[0];
        console.log('Making request to create user in database:', {
          firebaseUid: result.user.uid,
          email: result.user.email,
          name: result.user.displayName
        });
        
        const response = await axios.post(
          `${baseUrl}/debug-auth`,
          {
            // The server expects these fields to match the decoded token fields
            // but also explicitly sending them in the request body as a fallback
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
        
        console.log('User creation response:', response.data);
        toast.success('User created in database!');
      } catch (dbError) {
        console.error('Error creating user in database:', dbError);
        toast.error('Error creating user in database. Some features may not work.');
      }
      
      toast.success('Successfully signed in with Google!');
      return result.user;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in with Google';
      setError(errorMessage);
      toast.error('Failed to sign in with Google');
      throw error;
    }
  };

  // Log out
  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      toast.success('Successfully logged out');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to log out';
      setError(errorMessage);
      toast.error('Failed to log out');
      throw error;
    }
  };

  // Get ID token
  const getToken = async (): Promise<string | null> => {
    if (!currentUser) return null;
    try {
      return await getIdToken(currentUser, true);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  };

  // Test user creation
  const testUserCreation = async (): Promise<boolean> => {
    if (!currentUser) {
      console.error('No user logged in');
      toast.error('Must be logged in to test user creation');
      return false;
    }
    
    try {
      // Get the ID token
      const token = await getIdToken(currentUser, true);
      console.log('Got token, making authenticated request...');
      
      // Make request to debug-auth endpoint
      const baseUrl = import.meta.env.VITE_APP_API_URL.split('/trpc')[0];
      const response = await axios.post(
        `${baseUrl}/debug-auth`,
        {
          firebaseUid: currentUser.uid,
          email: currentUser.email,
          name: currentUser.displayName
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );
      
      console.log('Test user creation response:', response.data);
      return response.status === 200;
    } catch (error) {
      console.error('Test user creation failed:', error);
      return false;
    }
  };

  const value: AuthContextType = {
    currentUser,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
    getToken,
    testUserCreation,
    error
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 