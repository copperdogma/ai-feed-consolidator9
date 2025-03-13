import { PrismaClient } from "@prisma/client";
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config({ path: '../../.env' });

async function testConnection() {
  // Use the DATABASE_URL from environment or fall back to a default
  const databaseUrl = process.env.DATABASE_URL || 
    "postgresql://admin:password@host.docker.internal:5432/ai-feed-consolidator-dev?connect_timeout=100";
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl
      }
    }
  });

  try {
    console.log("Testing database connection...");
    console.log(`Using database URL: ${databaseUrl.replace(/\/\/.*:.*@/, '//***:***@')}`); // Hide credentials in logs
    
    const result = await prisma.$queryRaw`SELECT 1 as connected`;
    console.log("Connection successful:", result);
    
    const userCount = await prisma.user.count();
    console.log("User count:", userCount);
    
    const dbName = databaseUrl.split('/').pop().split('?')[0];
    console.log(`Connected to database: ${dbName}`);
  } catch (error) {
    console.error("Connection failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
