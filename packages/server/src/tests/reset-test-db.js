/**
 * Reset Test Database Script
 * 
 * This script is used to reset the test database before running tests.
 * It drops all tables and recreates them using Prisma.
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverRoot = path.resolve(__dirname, '../../');

// Set environment variables for the test database
process.env.DATABASE_URL = 'postgresql://admin:password@localhost:5432/ai-feed-consolidator-test';
process.env.ENVIRONMENT = 'development';

console.log('Resetting test database...');

try {
  // Change to the server root directory where prisma is located
  process.chdir(serverRoot);
  
  // Run prisma db push with force flag to reset the database
  execSync('npx prisma db push --force-reset', { stdio: 'inherit' });
  
  console.log('Test database reset successfully!');
} catch (error) {
  console.error('Error resetting test database:', error);
  process.exit(1);
} 