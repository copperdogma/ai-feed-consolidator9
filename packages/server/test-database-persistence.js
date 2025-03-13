/**
 * Database Persistence Test
 * 
 * This script connects directly to the database to check if users are actually being persisted.
 * It bypasses the API and works directly with Prisma to query the database.
 */

// Import Prisma Client
import { PrismaClient } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient();

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Main test function
async function runTests() {
  console.log(`${colors.cyan}=== Database Persistence Test ====${colors.reset}`);
  
  try {
    console.log(`\n${colors.magenta}Testing database connection...${colors.reset}`);
    await prisma.$connect();
    console.log(`${colors.green}✅ Connected to database${colors.reset}`);
    
    // Count users
    const userCount = await prisma.user.count();
    console.log(`${colors.blue}User count: ${userCount}${colors.reset}`);
    
    // Print first 10 users
    const users = await prisma.user.findMany({
      take: 10
    });
    
    if (users.length === 0) {
      console.log(`${colors.yellow}No users found in the database${colors.reset}`);
    } else {
      console.log(`${colors.green}Found ${users.length} users:${colors.reset}`);
      users.forEach((user, index) => {
        console.log(`\n${colors.blue}User ${index + 1}:${colors.reset}`);
        console.log(`  ID: ${user.id}`);
        console.log(`  Firebase UID: ${user.firebaseUid}`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Name: ${user.name}`);
      });
    }
    
    // Try creating a test user
    const testUser = {
      firebaseUid: `test-uid-${Date.now()}`,
      email: `test-${Date.now()}@example.com`,
      name: 'Test User',
      avatar: null
    };
    
    console.log(`\n${colors.magenta}Attempting to create a test user directly in database...${colors.reset}`);
    console.log(`${colors.blue}Test user data:${colors.reset}`, testUser);
    
    const createdUser = await prisma.user.create({
      data: testUser
    });
    
    console.log(`${colors.green}✅ Created test user:${colors.reset}`, createdUser);
    
    // Count users again
    const newUserCount = await prisma.user.count();
    console.log(`${colors.blue}New user count: ${newUserCount}${colors.reset}`);
    
    if (newUserCount > userCount) {
      console.log(`${colors.green}✅ User count increased, confirming database persistence is working${colors.reset}`);
    } else {
      console.error(`${colors.red}❌ User count did not increase. There may be issues with database persistence.${colors.reset}`);
    }
    
  } catch (error) {
    console.error(`${colors.red}❌ Error: ${error.message}${colors.reset}`);
    if (error.code) {
      console.error(`${colors.red}Error code: ${error.code}${colors.reset}`);
    }
  } finally {
    await prisma.$disconnect();
    console.log(`\n${colors.blue}Disconnected from database${colors.reset}`);
  }
}

// Run the tests
runTests().catch(error => {
  console.error(`${colors.red}Unhandled error: ${error}${colors.reset}`);
}); 