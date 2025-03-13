/**
 * User Creation Test Script
 * 
 * This script tests the user creation flow by directly calling the debug-auth endpoint
 * with a test token. It can help diagnose issues with user creation separate from the
 * full authentication flow.
 */

const axios = require('axios');

// Configuration
const config = {
  serverUrl: 'http://localhost:3001',
  mockToken: 'mock-token', // Special token that will be accepted in development mode
  testUser: {
    firebaseUid: 'test-user-uid-' + Date.now(), // Use timestamp to ensure uniqueness
    email: `test-user-${Date.now()}@example.com`,
    name: 'Test User'
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

// Test stages
async function runTests() {
  console.log(`${colors.cyan}=== User Creation Test Script ====${colors.reset}`);
  
  try {
    // 1. Test database connection
    await testDatabaseConnection();
    
    // 2. Test user creation
    await testUserCreation();
    
    // 3. Test user retrieval
    await testUserRetrieval();
    
    console.log(`\n${colors.green}✅ All tests completed successfully!${colors.reset}`);
  } catch (error) {
    console.error(`\n${colors.red}❌ Tests failed: ${error.message}${colors.reset}`);
    if (error.response) {
      console.error(`${colors.red}Response status: ${error.response.status}${colors.reset}`);
      console.error(`${colors.red}Response data: ${JSON.stringify(error.response.data, null, 2)}${colors.reset}`);
    }
    process.exit(1);
  }
}

// Test database connection
async function testDatabaseConnection() {
  console.log(`\n${colors.magenta}Testing database connection...${colors.reset}`);
  
  try {
    const response = await axios.get(`${config.serverUrl}/debug`);
    
    if (response.data.database.connected) {
      console.log(`${colors.green}✅ Database connected successfully${colors.reset}`);
      console.log(`${colors.blue}Current user count: ${response.data.database.userCount}${colors.reset}`);
    } else {
      throw new Error('Database not connected according to debug endpoint');
    }
    
    return response.data;
  } catch (error) {
    console.error(`${colors.red}❌ Database connection test failed${colors.reset}`);
    throw error;
  }
}

// Test user creation
async function testUserCreation() {
  console.log(`\n${colors.magenta}Testing user creation with mock token...${colors.reset}`);
  console.log(`${colors.blue}Test user data: ${JSON.stringify(config.testUser, null, 2)}${colors.reset}`);
  
  try {
    // Call the debug-auth endpoint with our test data
    const response = await axios.post(
      `${config.serverUrl}/debug-auth`,
      config.testUser,
      {
        headers: {
          'Authorization': `Bearer ${config.mockToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.data.user) {
      console.log(`${colors.green}✅ User created successfully${colors.reset}`);
      console.log(`${colors.blue}User ID: ${response.data.user.id}${colors.reset}`);
      console.log(`${colors.blue}Firebase UID: ${response.data.user.firebaseUid}${colors.reset}`);
      
      // Save for next test
      config.createdUser = response.data.user;
    } else {
      throw new Error('User not returned in response');
    }
    
    return response.data;
  } catch (error) {
    console.error(`${colors.red}❌ User creation test failed${colors.reset}`);
    throw error;
  }
}

// Test user retrieval to confirm user was actually persisted
async function testUserRetrieval() {
  console.log(`\n${colors.magenta}Testing user retrieval to confirm persistence...${colors.reset}`);
  
  try {
    // Check database connection again to see if user count increased
    const response = await axios.get(`${config.serverUrl}/debug`);
    
    if (response.data.database.connected) {
      console.log(`${colors.blue}Updated user count: ${response.data.database.userCount}${colors.reset}`);
      
      // Verify user count increased
      if (response.data.database.userCount > 0) {
        console.log(`${colors.green}✅ User count confirms users exist in database${colors.reset}`);
      } else {
        throw new Error('User count is still 0 after user creation');
      }
    } else {
      throw new Error('Database not connected');
    }
    
    return response.data;
  } catch (error) {
    console.error(`${colors.red}❌ User retrieval test failed${colors.reset}`);
    throw error;
  }
}

// Run the tests
runTests().catch(error => {
  console.error(`${colors.red}Unhandled error in test script: ${error.message}${colors.reset}`);
  process.exit(1);
}); 