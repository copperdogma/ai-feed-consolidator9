// Simple script to test the debug-auth endpoint
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function main() {
  try {
    console.log('Calling debug-auth endpoint...');
    
    // Create a mock token (this would normally come from Firebase)
    const mockToken = 'mock-token';
    
    // Call the debug-auth endpoint
    const response = await fetch('http://localhost:3001/debug-auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mockToken}`
      },
      body: JSON.stringify({
        email: 'mock@example.com',
        name: 'Mock User',
        uid: 'mock-user-uid'
      })
    });
    
    console.log(`Response status: ${response.status}`);
    const data = await response.json();
    console.log(`Response data: ${JSON.stringify(data, null, 2)}`);
    
    if (response.status === 200) {
      console.log('✅ User created/verified successfully!');
      
      // Now test the user profile endpoint
      console.log('\nTesting user profile endpoint...');
      const profileResponse = await fetch('http://localhost:3001/trpc/user.getProfile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${mockToken}`
        }
      });
      
      console.log(`Profile response status: ${profileResponse.status}`);
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        console.log(`Profile data: ${JSON.stringify(profileData, null, 2)}`);
        console.log('✅ Profile retrieved successfully!');
      } else {
        console.log('❌ Failed to retrieve profile');
        try {
          const errorData = await profileResponse.json();
          console.log(`Error: ${JSON.stringify(errorData, null, 2)}`);
        } catch (e) {
          console.log(`Error: ${profileResponse.statusText}`);
        }
      }
    } else {
      console.log('❌ User creation/verification failed');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

main(); 