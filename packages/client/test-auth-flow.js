/**
 * Client Authentication Flow Test
 * 
 * This script tests the authentication flow by simulating Google sign-in
 * and verifying that the user is created in the database.
 * 
 * To run:
 * 1. Ensure your local development environment is running
 * 2. Run this script with Node.js: node test-auth-flow.js
 */

// Using CommonJS modules
const axios = require('axios');

// Configuration
const config = {
  serverUrl: 'http://localhost:3001',
  mockToken: 'mock-token', // Special token that will be accepted in development mode
  testUser: {
    uid: 'google-user-uid-' + Date.now(), // Use timestamp to ensure uniqueness
    email: `google-user-${Date.now()}@example.com`,
    displayName: 'Google Test User',
    photoURL: 'https://example.com/photo.jpg'
  }
};

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
  console.log(`${colors.cyan}=== Client Authentication Flow Test ====${colors.reset}`);
  
  try {
    // 1. Test database connection
    await testDatabaseConnection();
    
    // 2. Capture initial user count
    const initialCount = await getUserCount();
    console.log(`${colors.blue}Initial user count: ${initialCount}${colors.reset}`);
    
    // 3. Test simulated Google sign-in
    await testGoogleSignIn();
    
    // 4. Check that user count increased
    const finalCount = await getUserCount();
    console.log(`${colors.blue}Final user count: ${finalCount}${colors.reset}`);
    
    if (finalCount > initialCount) {
      console.log(`${colors.green}✅ User count increased, confirming user was added to database${colors.reset}`);
    } else {
      console.error(`${colors.red}❌ User count did not increase. User may not have been added to database.${colors.reset}`);
    }
    
    console.log(`\n${colors.green}✅ All tests completed!${colors.reset}`);
  } catch (error) {
    console.error(`\n${colors.red}❌ Tests failed: ${error.message}${colors.reset}`);
    if (error.response) {
      console.error(`${colors.red}Response status: ${error.response.status}${colors.reset}`);
      console.error(`${colors.red}Response data:${colors.reset}`, error.response.data);
    }
  }
}

// Test database connection
async function testDatabaseConnection() {
  console.log(`\n${colors.magenta}Testing database connection...${colors.reset}`);
  
  try {
    const response = await axios.get(`${config.serverUrl}/debug`);
    
    if (response.data.database.connected) {
      console.log(`${colors.green}✅ Database connected successfully${colors.reset}`);
    } else {
      throw new Error('Database not connected according to debug endpoint');
    }
    
    return response.data;
  } catch (error) {
    console.error(`${colors.red}❌ Database connection test failed${colors.reset}`);
    throw error;
  }
}

// Get current user count from database
async function getUserCount() {
  const response = await axios.get(`${config.serverUrl}/debug`);
  return response.data.database.userCount;
}

// Test simulated Google sign-in
async function testGoogleSignIn() {
  console.log(`\n${colors.magenta}Testing Google sign-in flow...${colors.reset}`);
  console.log(`${colors.blue}Test user:${colors.reset}`, config.testUser);
  
  // First step: Create a user in Firebase (simulated)
  console.log(`\n${colors.yellow}Step 1: Simulating successful Firebase authentication${colors.reset}`);
  
  // Second step: Call the debug-auth endpoint with the user info
  console.log(`\n${colors.yellow}Step 2: Calling debug-auth endpoint to create user in database${colors.reset}`);
  
  try {
    const response = await axios.post(
      `${config.serverUrl}/debug-auth`,
      {
        firebaseUid: config.testUser.uid,
        email: config.testUser.email,
        name: config.testUser.displayName,
        avatar: config.testUser.photoURL
      },
      {
        headers: {
          'Authorization': `Bearer ${config.mockToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.data.user) {
      console.log(`${colors.green}✅ User creation response successful${colors.reset}`);
      console.log(`${colors.blue}User data:${colors.reset}`, response.data.user);
      return response.data.user;
    } else {
      throw new Error('User not returned in response');
    }
  } catch (error) {
    console.error(`${colors.red}❌ User creation failed${colors.reset}`);
    throw error;
  }
}

// Run the tests
runTests().catch(error => {
  console.error(`${colors.red}Unhandled error: ${error}${colors.reset}`);
}); 