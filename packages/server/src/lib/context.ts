import { inferAsyncReturnType } from '@trpc/server'
import * as trpcExpress from '@trpc/server/adapters/express'
import { auth } from './firebase-admin'
import prisma from 'sdks/prisma'

// Check if we're running in development mode
const isDevelopment = process.env.ENVIRONMENT === 'development';

export const createContext = async ({
  req,
  res
}: trpcExpress.CreateExpressContextOptions) => {
  // Log all requests to help with debugging
  console.log(`[REQUEST] ${req.method} ${req.path}`);
  console.log(`[HEADERS] Authorization: ${req.headers.authorization ? 'Bearer ***' : 'None'}`);
  console.log(`[COOKIES] ${JSON.stringify(req.cookies)}`);
  
  async function getUser() {
    // Get the bearer token from the authorization header
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
    
    console.log(`[DEBUG] Request path: ${req.path}`);
    console.log(`[DEBUG] Authorization header exists: ${!!req.headers.authorization}`);
    console.log(`[DEBUG] Token exists: ${!!token}`);
    
    // Do not check for user if the request is for signing in or signing up
    if (token && !['/auth.signUp', '/auth.signIn'].includes(req.path)) {
      console.log(`[DEBUG] Processing authentication for path: ${req.path}`);
      try {
        // Verify the token with Firebase Admin (real or mock)
        const decodedToken = await auth.verifyIdToken(token);
        console.log('[DEBUG] Token verification successful:', { 
          uid: decodedToken.uid,
          email: decodedToken.email
        });
        
        // Get the user from the database, or create if they don't exist
        console.log('[DEBUG] Looking for user in database with firebaseUid:', decodedToken.uid);
        let user = await prisma.user.findUnique({
          where: { firebaseUid: decodedToken.uid }
        });
        
        if (!user) {
          // Create a new user in the database if they don't exist
          console.log('[DEBUG] User not found. Creating new user in database:', {
            firebaseUid: decodedToken.uid,
            email: decodedToken.email
          });
          
          try {
            user = await prisma.user.create({
              data: {
                firebaseUid: decodedToken.uid,
                email: decodedToken.email || 'unknown@example.com',
                name: decodedToken.name || decodedToken.email?.split('@')[0] || 'Unknown User',
                avatar: decodedToken.picture || '',
              }
            });
            console.log('[DEBUG] User created successfully:', user);
          } catch (createError) {
            // Check if the error is due to a duplicate
            if (createError instanceof Error && createError.message.includes('Unique constraint')) {
              console.log('[DEBUG] User already exists (race condition). Trying to fetch again...');
              user = await prisma.user.findUnique({
                where: { firebaseUid: decodedToken.uid }
              });
              if (!user) {
                console.error('[DEBUG] Still could not find user after retry');
                throw createError;
              }
            } else {
              console.error('[DEBUG] Error creating user:', createError);
              throw createError;
            }
          }
        } else {
          console.log('[DEBUG] User found in database:', user);
          // Update user info if Firebase has newer information
          const needsUpdate = (
            (decodedToken.name && user.name !== decodedToken.name) ||
            (decodedToken.email && user.email !== decodedToken.email) ||
            (decodedToken.picture && user.avatar !== decodedToken.picture)
          );
          
          if (needsUpdate) {
            // Update user with new information from Firebase
            console.log('[DEBUG] Updating user with new information');
            await prisma.user.update({
              where: { id: user.id },
              data: {
                name: decodedToken.name || undefined,
                email: decodedToken.email || undefined,
                avatar: decodedToken.picture || undefined,
              }
            });
            
            // Fetch the updated user
            user = await prisma.user.findUnique({
              where: { id: user.id }
            }) || user;
            console.log('[DEBUG] User updated successfully:', user);
          }
        }
        
        return user;
      } catch (error) {
        console.error('[DEBUG] Error verifying token:', error);
        // Clear the token cookie if there was an error
        res.clearCookie('accessToken');
      }
    } else {
      console.log(`[DEBUG] Skipping authentication for path: ${req.path} (token exists: ${!!token})`);
    }
    return null;
  }

  const user = await getUser();
  console.log('[DEBUG] Context created with user:', user);
  return { req, res, user, prisma };
}

export type Context = inferAsyncReturnType<typeof createContext>
