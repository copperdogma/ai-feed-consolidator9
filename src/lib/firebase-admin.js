/**
 * Firebase Admin SDK setup
 * 
 * Initializes the Firebase Admin SDK for server-side operations
 */

import * as firebaseAdmin from 'firebase-admin';

// Initialize the app if it hasn't been initialized yet
if (!firebaseAdmin.apps.length) {
  firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // The private key needs to have newlines replaced
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    databaseURL: process.env.DATABASE_URL,
  });
}

export default firebaseAdmin; 