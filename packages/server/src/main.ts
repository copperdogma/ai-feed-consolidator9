import 'module-alias/register'

import express from 'express'
import cors from 'cors'
import * as trpcExpress from '@trpc/server/adapters/express'
import { createContext } from 'lib/context'
import { appRouter } from 'router'
import cookieParser from 'cookie-parser'
import prisma from 'sdks/prisma'
import { auth } from './lib/firebase-admin'
import { AppStartupService } from './services/app-startup.service'
import { logger } from './lib/logger'

const VITE_APP_URL = process.env.VITE_APP_URL
const PORT: number = Number(process.env.SERVER_PORT) || 3001

// Log CORS settings for debugging
console.log('CORS setup with origin:', VITE_APP_URL);

const app = express()

// Set up CORS with more permissive settings for debugging
const corsOptions = {
  origin: function(origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow any origin during development
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
};

console.log('Setting up CORS with very permissive settings for debugging');
app.use(cors(corsOptions));

app.use(cookieParser())
app.use(express.json())

// Add a simpler endpoint that just returns the request info
app.all('/echo', (req, res) => {
  console.log('[ECHO] Received request:', {
    method: req.method,
    path: req.path,
    query: req.query,
    body: req.body,
    headers: {
      ...req.headers,
      authorization: req.headers.authorization ? 'Bearer ***' : undefined
    }
  });
  
  res.json({
    success: true,
    message: 'Echo endpoint working',
    requestInfo: {
      method: req.method,
      path: req.path,
      query: req.query,
      headers: Object.keys(req.headers),
      bodyKeys: req.body ? Object.keys(req.body) : []
    }
  });
});

// Simple auth echo endpoint - doesn't validate the token, just echoes it back
app.post('/auth-echo', (req, res) => {
  console.log('[AUTH-ECHO] Received auth echo request:', {
    method: req.method,
    path: req.path,
    body: req.body,
    headers: {
      ...req.headers,
      authorization: req.headers.authorization ? 'Bearer ***' : undefined
    }
  });
  
  // Extract token without validating
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(0, 20) + '...' : null;
  
  res.json({
    success: true,
    message: 'Auth echo endpoint working',
    hasToken: !!token,
    tokenPrefix: token,
    requestInfo: {
      method: req.method,
      path: req.path,
      headers: Object.keys(req.headers),
      bodyKeys: req.body ? Object.keys(req.body) : []
    }
  });
});

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('[REQUEST] Headers:', JSON.stringify({
    ...req.headers,
    authorization: req.headers.authorization ? 'Bearer ***' : undefined
  }));
  
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('[REQUEST] Body:', JSON.stringify(req.body));
  }
  
  // Track response
  const originalSend = res.send;
  res.send = function(body) {
    console.log(`[${new Date().toISOString()}] Response ${res.statusCode}`);
    return originalSend.call(this, body);
  };
  
  next();
});

app.get('/healthcheck', (_req, res) => {
  res.send({ status: 'ok' })
})

// Debug endpoint to check database connection and user count
app.get('/debug', async (_req, res) => {
  console.log('=== DEBUG ENDPOINT CALLED ===');
  try {
    const userCount = await prisma.user.count();
    console.log('=== Debug endpoint - User count:', userCount);
    
    const dbConnection = await prisma.$queryRaw`SELECT 1 as connected`;
    console.log('=== Debug endpoint - DB connection result:', JSON.stringify(dbConnection));

    // Fix: Ensure connected is a proper boolean true
    const isConnected = Array.isArray(dbConnection) && dbConnection.length > 0 && 
                         (dbConnection[0].connected === 1 || dbConnection[0].connected === true);
    console.log('=== Debug endpoint - isConnected calculated as:', isConnected, 'type:', typeof isConnected);
    
    const response = {
      status: 'ok',
      database: {
        connected: isConnected,
        userCount
      },
      server: {
        time: new Date().toISOString(),
        env: process.env.NODE_ENV || 'development'
      }
    };
    
    // Make sure connected is serialized as a true boolean
    console.log('=== Debug endpoint - Final connected value:', response.database.connected, 'type:', typeof response.database.connected);
    console.log('=== Debug endpoint - Full response after stringify:', JSON.stringify(response));
    res.json(response);
  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// Test endpoint to simulate a placeholder
app.post('/test-auth', (req, res) => {
  console.log('[TEST] Received test-auth request:', {
    body: req.body,
    headers: {
      authorization: req.headers.authorization ? 'Bearer ***' : 'None'
    }
  });
  
  res.json({
    status: 'ok',
    message: 'Test endpoint working'
  });
});

// Debug authentication endpoint
app.post('/debug-auth', async (req, res) => {
  console.log('[AUTH] Received debug-auth request');
  console.log('[AUTH] Authorization header:', req.headers.authorization ? 'Bearer ***' : 'None');
  console.log('[AUTH] Request body:', req.body);
  
  try {
    // Get the token from the authorization header
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
    
    console.log('[AUTH] Token extracted:', token ? `${token.substring(0, 20)}...` : 'No token');
    
    if (!token) {
      console.log('[AUTH] No token provided');
      return res.status(401).json({ 
        status: 'error', 
        message: 'No authentication token provided' 
      });
    }
    
    // Verify the token
    try {
      console.log('[AUTH] Verifying token...');
      console.log('[AUTH] Is development mode?', process.env.ENVIRONMENT === 'development' ? 'Yes' : 'No');
      const decodedToken = await auth.verifyIdToken(token);
      console.log('[AUTH] Token verification successful:', {
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name,
        picture: decodedToken.picture
      });
      
      // In development mode, prioritize request body data for real user testing
      const isDevelopment = process.env.ENVIRONMENT === 'development';
      const userData = {
        // In development, prioritize request body firebaseUid if provided
        firebaseUid: isDevelopment && req.body.firebaseUid ? req.body.firebaseUid : (decodedToken.uid || req.body.firebaseUid),
        
        // In development, prioritize request body email if provided
        email: isDevelopment && req.body.email ? req.body.email : (decodedToken.email || req.body.email || 'unknown@example.com'),
        
        // In development, prioritize request body name if provided
        name: isDevelopment && req.body.name ? req.body.name : (decodedToken.name || req.body.name || req.body.displayName || decodedToken.email?.split('@')[0] || 'Unknown User'),
        
        // In development, prioritize request body avatar if provided
        avatar: isDevelopment && req.body.avatar ? req.body.avatar : (decodedToken.picture || req.body.avatar || req.body.picture || '')
      };
      
      console.log('[AUTH] Combined user data for lookup/creation:', userData);
      
      // Look for user in database
      console.log('[AUTH] Looking for user in database with firebaseUid:', userData.firebaseUid);
      try {
        let user = await prisma.user.findUnique({
          where: { firebaseUid: userData.firebaseUid }
        });
        
        console.log('[AUTH] User search result:', user ? 'Found' : 'Not found');
        
        if (!user) {
          // Create user
          console.log('[AUTH] User not found. Creating new user in database with data:', userData);
          
          try {
            user = await prisma.user.create({
              data: userData
            });
            console.log('[AUTH] User created successfully:', user);
          } catch (createError) {
            console.error('[AUTH] Error creating user:', createError);
            return res.status(500).json({
              status: 'error',
              message: 'Failed to create user in database',
              error: createError instanceof Error ? createError.message : 'Unknown error'
            });
          }
        } else {
          console.log('[AUTH] User found in database:', user);
          
          // In development mode, update the user if request body contains specific data
          if (isDevelopment && (req.body.email || req.body.name || req.body.avatar)) {
            console.log('[AUTH] Development mode - updating user with request body data');
            const updateData: any = {};
            
            if (req.body.email) updateData.email = req.body.email;
            if (req.body.name) updateData.name = req.body.name;
            if (req.body.avatar || req.body.picture) updateData.avatar = req.body.avatar || req.body.picture;
            
            if (Object.keys(updateData).length > 0) {
              user = await prisma.user.update({
                where: { id: user.id },
                data: updateData
              });
              console.log('[AUTH] User updated successfully:', user);
            }
          }
        }
        
        return res.json({
          status: 'success',
          message: 'Authentication successful',
          user
        });
      } catch (dbError) {
        console.error('[AUTH] Database error during user lookup/creation:', dbError);
        return res.status(500).json({
          status: 'error',
          message: 'Database error during authentication',
          error: dbError instanceof Error ? dbError.message : 'Unknown error'
        });
      }
      
    } catch (verifyError) {
      console.error('[AUTH] Token verification failed:', verifyError);
      return res.status(401).json({
        status: 'error',
        message: 'Invalid authentication token',
        error: verifyError instanceof Error ? verifyError.message : 'Unknown error'
      });
    }
    
  } catch (error) {
    console.error('[AUTH] Debug-auth endpoint error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.use(
  '/trpc',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext
  })
)

// Server startup
const server = app.listen(PORT, async () => {
  logger.info(`🚀 Server running on Port ${PORT}`)
  logger.info(`Successfully connected to database`)
  
  try {
    // Initialize application services
    await AppStartupService.initialize({
      startFeedRefreshService: true,
      feedRefreshIntervalMinutes: 15 // Check feeds every 15 minutes
    });
    logger.info('Application services initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize application services:', error);
    // Continue running even if background services fail to start
  }
})

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received. Shutting down gracefully...');
  
  try {
    // Shutdown application services
    await AppStartupService.shutdown();
    
    // Close server
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
});
