/**
 * Authentication Service
 * 
 * Handles user authentication and creation logic
 */

import prisma from '../sdks/prisma';
import firebaseAdmin from '../lib/firebase-admin';

/**
 * Creates a user in the database from a Firebase user
 * If the user already exists, it returns the existing user
 * 
 * @param {Object} firebaseUser The Firebase user object
 * @param {string} firebaseUser.uid The Firebase user ID
 * @param {string} firebaseUser.email The user's email
 * @param {string} firebaseUser.displayName The user's display name
 * @returns {Promise<Object>} The user object from the database
 */
export const createUser = async (firebaseUser) => {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { firebase_uid: firebaseUser.uid }
    });

    // If user exists, return it
    if (existingUser) {
      return existingUser;
    }

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        firebase_uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName
      }
    });

    return newUser;
  } catch (error) {
    console.error('Error creating user:', error);
    throw new Error('Failed to create user in database');
  }
};

/**
 * Verifies a Firebase ID token and returns the corresponding user
 * 
 * @param {string} idToken The Firebase ID token to verify
 * @returns {Promise<Object>} The verified token claims
 */
export const verifyIdToken = async (idToken) => {
  try {
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying ID token:', error);
    throw new Error('Invalid or expired authentication token');
  }
}; 