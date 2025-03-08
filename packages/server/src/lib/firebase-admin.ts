// Firebase Admin SDK initialization
import * as admin from 'firebase-admin';
import env from 'env-var';

// Check if firebase app has been initialized
if (!admin.apps.length) {
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
}

export const auth = admin.auth();
export default admin; 