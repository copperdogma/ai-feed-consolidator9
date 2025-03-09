// Firebase Admin SDK initialization
import admin from 'firebase-admin';
import env from 'env-var';

// Check if firebase app has been initialized
if (!admin.apps?.length) {
  const environment = env.get('ENVIRONMENT').asString() || 'development';
  
  if (environment === 'development') {
    // Use a mock configuration for development
    admin.initializeApp({
      projectId: 'demo-project',
    });
    console.log('Firebase Admin initialized in development mode with mock configuration');
  } else {
    // Use real credentials in production
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: env.get('FIREBASE_PROJECT_ID').required().asString(),
        clientEmail: env.get('FIREBASE_CLIENT_EMAIL').required().asString(),
        // Replace newlines in the private key
        privateKey: env.get('FIREBASE_PRIVATE_KEY').required().asString().replace(/\\n/g, '\n'),
      }),
      // If you're using other Firebase services like Firestore, Storage, etc.
      // databaseURL: env.get('FIREBASE_DATABASE_URL').asString(),
    });
    console.log('Firebase Admin initialized with production credentials');
  }
}

export const auth = admin.auth();
export default admin; 