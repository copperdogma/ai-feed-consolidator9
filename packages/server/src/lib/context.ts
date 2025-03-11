import { inferAsyncReturnType } from '@trpc/server'
import * as trpcExpress from '@trpc/server/adapters/express'
import { auth } from './firebase-admin'
import prisma from 'sdks/prisma'

export const createContext = async ({
  req,
  res
}: trpcExpress.CreateExpressContextOptions) => {
  async function getUser() {
    // Get the bearer token from the authorization header
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
    
    // Do not check for user if the request is for signing in or signing up
    if (token && !['/auth.signUp', '/auth.signIn'].includes(req.path)) {
      try {
        // Verify the token with Firebase Admin
        const decodedToken = await auth.verifyIdToken(token);
        
        // Get the user from the database, or create if they don't exist
        let user = await prisma.user.findUnique({
          where: { firebaseUid: decodedToken.uid }
        });
        
        if (!user) {
          // Create a new user in the database if they don't exist
          user = await prisma.user.create({
            data: {
              firebaseUid: decodedToken.uid,
              email: decodedToken.email || '',
              name: decodedToken.name || decodedToken.email?.split('@')[0] || '',
              avatar: decodedToken.picture || null,
            }
          });
        } else {
          // Update user info if Firebase has newer information
          const needsUpdate = (
            (decodedToken.name && user.name !== decodedToken.name) ||
            (decodedToken.email && user.email !== decodedToken.email) ||
            (decodedToken.picture && user.avatar !== decodedToken.picture)
          );
          
          if (needsUpdate) {
            // Update user with new information from Firebase
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
          }
        }
        
        return user;
      } catch (error) {
        console.error('Error verifying token:', error);
        // Clear the token cookie if there was an error
        res.clearCookie('accessToken');
      }
    }
    return null;
  }

  const user = await getUser();
  return { req, res, user };
}

export type Context = inferAsyncReturnType<typeof createContext>
