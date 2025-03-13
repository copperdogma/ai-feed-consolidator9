/**
 * Test Database Setup Script
 * 
 * This script prepares the test database for running tests.
 * It performs the following actions:
 * 1. Uses the TEST_DATABASE_URL from .env 
 * 2. Applies the latest schema migrations
 * 3. Wipes existing data to ensure a clean test environment
 * 
 * Usage: 
 * - Run before your test suite: `node scripts/setup-test-db.js`
 * - Or as part of your test script in package.json
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables from .env file in the project root
dotenv.config({ path: path.resolve(__dirname, '../../..', '.env') });

// Get test database URL
const testDatabaseUrl = process.env.TEST_DATABASE_URL;

if (!testDatabaseUrl) {
  console.error('ERROR: TEST_DATABASE_URL environment variable is not defined');
  process.exit(1);
}

console.log('Setting up test database...');

try {
  // Create temporary .env.test file
  const envTestPath = path.resolve(__dirname, '../.env.test');
  fs.writeFileSync(envTestPath, `DATABASE_URL=${testDatabaseUrl}\n`);
  
  console.log('Created temporary .env.test file');
  console.log('Using test database URL:', testDatabaseUrl);
  
  // First, try to push the schema to create/update the database
  console.log('Setting up test database schema...');
  execSync('npx prisma db push --schema=./prisma/schema.prisma --accept-data-loss', {
    env: { ...process.env, DATABASE_URL: testDatabaseUrl },
    stdio: 'inherit',
  });
  
  // Clear all data from the test database
  console.log('Cleaning test database data...');
  const prismaClient = require('@prisma/client');
  const { PrismaClient } = prismaClient;
  
  const prisma = new PrismaClient({ 
    datasources: { db: { url: testDatabaseUrl } } 
  });
  
  async function clearDatabase() {
    try {
      // Define the deletion order based on foreign key constraints
      // Note: this order matters to avoid constraint violations
      const tables = [
        'ContentTopic',
        'Activity',
        'Summary',
        'Content',
        'Source',
        'Topic',
        'User'
      ];
      
      console.log('Deleting data from tables in order:', tables.join(', '));
      
      // Delete all records from each table in order
      for (const table of tables) {
        console.log(`Deleting all records from ${table}...`);
        const deleteResult = await prisma.$executeRawUnsafe(`DELETE FROM "${table}";`);
        console.log(`Deleted records from ${table}`);
      }
      
      console.log('Database cleared successfully');
    } catch (error) {
      console.error('Error clearing database:', error);
    } finally {
      await prisma.$disconnect();
    }
  }
  
  // Run the async function to clear the database
  clearDatabase().then(() => {
    // Clean up the temporary file
    fs.unlinkSync(envTestPath);
    console.log('Test database setup complete!');
  }).catch(err => {
    console.error('Error during database cleanup:', err);
    process.exit(1);
  });
  
} catch (error) {
  console.error('Error setting up test database:', error);
  process.exit(1);
} 