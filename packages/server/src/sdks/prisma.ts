import { PrismaClient } from '@prisma/client'

// Create a Prisma client instance with explicit options to prevent database creation
// Note: We can only connect to existing databases
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Set errorFormat to minimal to reduce noise in logs
  errorFormat: 'minimal',
  // Log queries in development mode
  log: process.env.ENVIRONMENT === 'development' ? ['query'] : [],
})

// Handle connection errors gracefully
prisma.$connect()
  .then(() => console.log('Successfully connected to database'))
  .catch((error: unknown) => {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error connecting to database:', errorMessage);
    // Don't crash the server on connection error, just log it
  });

export default prisma
