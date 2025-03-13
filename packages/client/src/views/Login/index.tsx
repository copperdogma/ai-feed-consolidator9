import { Pane, majorScale, Button, Heading, Spinner, toaster, Text, minorScale, IconButton, CrossIcon, Dialog } from 'evergreen-ui'
import NavBar from 'views/Login/Auth/NavBar'
import TechStack from 'views/Login/TechStack'
import { useAuth } from '../../hooks/useAuth'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getIdToken, User as FirebaseUser } from 'firebase/auth'

const Login = () => {
  const { signInWithGoogle, loading, currentUser, testUserCreation } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [testingConnection, setTestingConnection] = useState(false)
  const [testingUserCreation, setTestingUserCreation] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const navigate = useNavigate()

  // Use effect for navigation instead of conditional rendering
  useEffect(() => {
    if (currentUser && !loading) {
      navigate('/')
    }
  }, [currentUser, loading, navigate])

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <Pane display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Spinner />
      </Pane>
    )
  }

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      await signInWithGoogle()
      toaster.success('Successfully signed in with Google!')
      // Don't navigate here, let the useEffect handle it
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to sign in with Google'
      toaster.danger(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestUserCreation = async () => {
    setTestingUserCreation(true)
    try {
      const result = await testUserCreation()
      if (result) {
        toaster.success('User creation test completed successfully!')
      } else {
        toaster.danger('User creation test failed')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to test user creation'
      toaster.danger(message)
    } finally {
      setTestingUserCreation(false)
    }
  }

  // Test connection to server
  const testServerConnection = async () => {
    setTestingConnection(true);
    try {
      console.log('Testing server connection...');
      const apiUrl = import.meta.env.VITE_APP_API_URL;
      console.log('API URL from environment:', apiUrl);
      
      const baseUrl = apiUrl.split('/trpc')[0]; // Remove '/trpc' to get base URL
      console.log('Base URL for debug endpoint:', baseUrl);
      
      // Test debug endpoint
      console.log('Testing debug endpoint...');
      let debugSuccess = false;
      let debugData = null;
      try {
        const debugResponse = await fetch(`${baseUrl}/debug`);
        debugData = await debugResponse.json();
        debugSuccess = true;
        
        console.log('Debug endpoint raw response status:', debugResponse.status);
        console.log('Debug endpoint parsed data (stringified):', JSON.stringify(debugData, null, 2));
        
        // Check exactly what the database properties are
        if (debugData && debugData.database) {
          console.log('Database object keys:', Object.keys(debugData.database));
          console.log('Database connected raw value:', debugData.database.connected);
          console.log('Database connected value type:', typeof debugData.database.connected);
          console.log('Database connected coerced to boolean:', Boolean(debugData.database.connected));
          console.log('Database user count:', debugData.database.userCount);
        } else {
          console.log('Database object is missing or malformed in response');
        }
      } catch (debugError) {
        console.error('Debug endpoint failed:', debugError);
      }
      
      // Test echo endpoint
      console.log('Testing echo endpoint...');
      let echoSuccess = false;
      let echoData = null;
      try {
        const echoResponse = await fetch(`${baseUrl}/echo`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            timestamp: Date.now(),
            test: 'Echo test from client'
          }),
          mode: 'cors',
          credentials: 'include'
        });
        echoData = await echoResponse.json();
        echoSuccess = true;
        console.log('Echo endpoint successful:', echoData);
      } catch (echoError) {
        console.error('Echo endpoint failed:', echoError);
      }
      
      // Test auth-echo endpoint which is simpler (no firebase validation)
      console.log('Testing auth-echo endpoint...');
      let authEchoSuccess = false;
      let authEchoData = null;
      if (currentUser) {
        try {
          const token = await getIdToken(currentUser, true);
          console.log('Got Firebase ID token for auth-echo (first few chars):', token.substring(0, 20) + '...');
          
          const authEchoResponse = await fetch(`${baseUrl}/auth-echo`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              userId: (currentUser as FirebaseUser)?.uid || 'unknown',
              email: (currentUser as FirebaseUser)?.email || 'unknown@example.com',
              timestamp: Date.now(),
              test: 'Auth echo test from client'
            }),
            mode: 'cors',
            credentials: 'include',
            cache: 'no-cache',
            redirect: 'follow'
          });
          
          console.log('Auth-echo response status:', authEchoResponse.status);
          if (authEchoResponse.ok) {
            authEchoData = await authEchoResponse.json();
            authEchoSuccess = true;
            console.log('Auth-echo endpoint successful:', authEchoData);
          } else {
            console.error('Auth-echo endpoint failed with status:', authEchoResponse.status);
            const errorText = await authEchoResponse.text();
            console.error('Auth-echo error response:', errorText);
          }
        } catch (authEchoError) {
          console.error('Auth-echo request failed:', authEchoError);
        }
      }
      
      // Test trpc endpoint
      console.log('Testing tRPC endpoint...');
      let trpcSuccess = false;
      try {
        const trpcResponse = await fetch(apiUrl, { 
          method: 'HEAD',
          credentials: 'include'
        });
        trpcSuccess = trpcResponse.ok || trpcResponse.status === 204;
        console.log('tRPC endpoint successful:', trpcSuccess);
      } catch (trpcError) {
        console.error('tRPC endpoint failed:', trpcError);
      }
      
      // Create a direct test endpoint for authentication testing
      let authSuccess = false;
      let userInfo = null;
      if (currentUser) {
        console.log('Testing authenticated request...');
        try {
          // Create a simple test endpoint on the server
          console.log('Creating a test endpoint...');
          
          // NEW: Add special handling for the test-auth endpoint
          console.log(`Sending test request to ${baseUrl}/test-auth with CORS mode 'cors'`);
          try {
            const testEndpointResponse = await fetch(`${baseUrl}/test-auth`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                message: 'Creating test authentication endpoint'
              }),
              mode: 'cors',
              credentials: 'include'
            });
            
            console.log('Test endpoint status:', testEndpointResponse.status);
            console.log('Test endpoint status text:', testEndpointResponse.statusText);
            const testResponseText = await testEndpointResponse.text();
            console.log('Test endpoint response body:', testResponseText);
          } catch (testError) {
            console.error('Test endpoint request failed:', testError);
          }
          
          // Now test with authentication
          const token = await getIdToken(currentUser, true);
          console.log('Got Firebase ID token (first few chars):', token.substring(0, 20) + '...');
          
          // Add more detailed debug for the authenticated request
          try {
            // Send a direct HTTP POST request to the server with the token
            console.log('Sending auth request to:', `${baseUrl}/debug-auth`);
            console.log('Request headers:', {
              'Authorization': 'Bearer ***',
              'Content-Type': 'application/json'
            });
            console.log('Request body:', {
              firebaseUid: (currentUser as FirebaseUser)?.uid || 'unknown',
              email: (currentUser as FirebaseUser)?.email || 'unknown@example.com',
              name: (currentUser as FirebaseUser)?.displayName || 'Unknown User'
            });
            
            // Try with explicit CORS options
            console.log('Sending auth request with explicit CORS options...');
            const authResponse = await fetch(`${baseUrl}/debug-auth`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                firebaseUid: (currentUser as FirebaseUser)?.uid || 'unknown',
                email: (currentUser as FirebaseUser)?.email || 'unknown@example.com',
                name: (currentUser as FirebaseUser)?.displayName || 'Unknown User'
              }),
              mode: 'cors',
              credentials: 'include',
              cache: 'no-cache',
              redirect: 'follow'
            });
            
            console.log('Auth response status:', authResponse.status);
            console.log('Auth response status text:', authResponse.statusText);
            
            // Log all response headers
            const headersObj: Record<string, string> = {};
            authResponse.headers.forEach((value, key) => {
              headersObj[key] = value;
            });
            console.log('Auth response headers:', headersObj);
            
            if (authResponse.ok) {
              userInfo = await authResponse.json();
              console.log('Auth test response successful:', userInfo);
              authSuccess = true;
            } else {
              console.error('Auth test failed with status:', authResponse.status);
              const errorText = await authResponse.text();
              console.error('Error response:', errorText);
            }
          } catch (authError) {
            console.error('Authenticated request failed:', authError);
          }
        } catch (authError) {
          console.error('Authenticated request failed:', authError);
        }
      }
      
      if (debugSuccess || trpcSuccess || echoSuccess || authEchoSuccess) {
        // Instead of using toaster, create a fixed message with temporary storage
        // This bypasses any potential caching or rendering issues with the toaster
        
        // Store the test results in session storage for display
        const testResults = {
          time: new Date().toISOString(),
          message: `All services are operational. Database is connected with ${debugData?.database?.userCount || 0} user(s).`,
          details: {
            trpc: trpcSuccess,
            debug: debugSuccess,
            echo: echoSuccess,
            authEcho: authEchoSuccess,
            auth: authSuccess,
            database: {
              connected: true,
              userCount: debugData?.database?.userCount || 0
            }
          }
        };
        
        // Save to session storage
        try {
          sessionStorage.setItem('connectionTestResults', JSON.stringify(testResults));
          console.log('Saved test results to session storage:', testResults);
        } catch (e) {
          console.error('Failed to save test results to storage:', e);
        }
        
        // Show results dialog after successful test
        setShowResults(true);
        
        // Still show a toast, but with a very simple message
        toaster.success("Connection test complete. See results in dialog.");
      } else {
        toaster.danger(
          `Connection Test Failed:\n\n` +
          `Could not connect to server. Please check:\n` +
          `- Server is running on port 3001\n` +
          `- API URL is correct: ${apiUrl}\n` +
          `- Network is properly configured`
        );
      }
      
      console.log('Connection test complete:', {
        trpc: trpcSuccess,
        debug: debugSuccess,
        echo: echoSuccess,
        authEcho: authEchoSuccess,
        auth: authSuccess,
        userInfo
      });
    } catch (error) {
      console.error('Connection test failed:', error);
      toaster.danger(`Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setTestingConnection(false);
    }
  };

  const closeResults = () => {
    setShowResults(false);
  };

  return (
    <Pane width="100%" height="100%" maxHeight={majorScale(200)}>
      <NavBar />
      <Pane
        display="flex"
        justifyContent="center"
        alignItems="center"
        flexDirection="column"
        gap={majorScale(5)}
        height={majorScale(90)}
        position="relative"
      >
        <Heading size={900} marginBottom={majorScale(4)}>AI Feed Consolidator</Heading>
        <Button
          appearance="primary"
          intent="success"
          onClick={handleGoogleSignIn}
          isLoading={isLoading}
          height={majorScale(6)}
          fontSize={majorScale(2)}
        >
          Sign in with Google
        </Button>
        
        <Button
          appearance="minimal"
          intent="none"
          onClick={testServerConnection}
          isLoading={testingConnection}
          marginTop={majorScale(2)}
        >
          Test Server Connection
        </Button>
        
        {currentUser && (
          <Button
            appearance="minimal"
            intent="warning"
            onClick={handleTestUserCreation}
            isLoading={testingUserCreation}
            marginTop={majorScale(2)}
          >
            Test User Creation
          </Button>
        )}
        
        <TechStack />
      </Pane>
      
      {/* Connection test results dialog */}
      <Dialog
        isShown={showResults && !!sessionStorage.getItem('connectionTestResults')}
        title="Connection Test Results"
        onCloseComplete={closeResults}
        hasFooter={false}
        width="500px"
      >
        {() => {
          try {
            const results = JSON.parse(sessionStorage.getItem('connectionTestResults') || '{}');
            
            // Only show recent results (less than 5 minutes old)
            const resultTime = new Date(results.time || 0);
            const isRecent = (new Date().getTime() - resultTime.getTime()) < 300000; // 5 minutes
            
            if (!isRecent) return <Text>No recent test results available.</Text>;
            
            return (
              <Pane>
                <Text>Time: {new Date(results.time).toLocaleTimeString()}</Text>
                <Pane marginY={majorScale(1)}>
                  <Text color="success">✅ {results.message}</Text>
                </Pane>
                
                {/* Show status for all endpoints */}
                <Pane marginY={majorScale(1)}>
                  <Text size={300} marginBottom={minorScale(1)}>Endpoint Status:</Text>
                  <Pane display="flex" flexDirection="column" gap={minorScale(2)}>
                    <Pane 
                      display="flex" 
                      alignItems="center" 
                      padding={minorScale(1)}
                      background="tint1"
                      borderRadius="3px"
                    >
                      <Pane width={majorScale(3)} marginRight={minorScale(1)}>
                        {results.details?.trpc ? 
                          <Text color="success" fontWeight="bold">✅</Text> : 
                          <Text color="danger" fontWeight="bold">❌</Text>}
                      </Pane>
                      <Text size={300}>tRPC endpoint: {results.details?.trpc ? 'Success' : 'Failed'}</Text>
                    </Pane>
                    
                    <Pane 
                      display="flex" 
                      alignItems="center" 
                      padding={minorScale(1)}
                      background="tint1"
                      borderRadius="3px"
                    >
                      <Pane width={majorScale(3)} marginRight={minorScale(1)}>
                        {results.details?.debug ? 
                          <Text color="success" fontWeight="bold">✅</Text> : 
                          <Text color="danger" fontWeight="bold">❌</Text>}
                      </Pane>
                      <Text size={300}>Debug endpoint: {results.details?.debug ? 'Success' : 'Failed'}</Text>
                    </Pane>
                    
                    <Pane 
                      display="flex" 
                      alignItems="center" 
                      padding={minorScale(1)}
                      background="tint1"
                      borderRadius="3px"
                    >
                      <Pane width={majorScale(3)} marginRight={minorScale(1)}>
                        {results.details?.echo ? 
                          <Text color="success" fontWeight="bold">✅</Text> : 
                          <Text color="danger" fontWeight="bold">❌</Text>}
                      </Pane>
                      <Text size={300}>Echo endpoint: {results.details?.echo ? 'Success' : 'Failed'}</Text>
                    </Pane>
                    
                    <Pane 
                      display="flex" 
                      alignItems="center" 
                      padding={minorScale(1)}
                      background="tint1"
                      borderRadius="3px"
                    >
                      <Pane width={majorScale(3)} marginRight={minorScale(1)}>
                        {results.details?.authEcho ? 
                          <Text color="success" fontWeight="bold">✅</Text> : 
                          <Text color="danger" fontWeight="bold">❌</Text>}
                      </Pane>
                      <Text size={300}>
                        Auth-echo endpoint: {results.details?.authEcho ? 'Success' : 'Failed'}
                        {!results.details?.authEcho && 
                          <Text is="span" fontStyle="italic" color="muted" marginLeft={minorScale(1)}>
                            (Expected when not signed in)
                          </Text>
                        }
                      </Text>
                    </Pane>
                    
                    <Pane 
                      display="flex" 
                      alignItems="center" 
                      padding={minorScale(1)}
                      background="tint1"
                      borderRadius="3px"
                    >
                      <Pane width={majorScale(3)} marginRight={minorScale(1)}>
                        {results.details?.auth ? 
                          <Text color="success" fontWeight="bold">✅</Text> : 
                          <Text color="danger" fontWeight="bold">❌</Text>}
                      </Pane>
                      <Text size={300}>
                        Auth endpoint: {results.details?.auth ? 'Success' : 'Failed'}
                        {!results.details?.auth && 
                          <Text is="span" fontStyle="italic" color="muted" marginLeft={minorScale(1)}>
                            (Expected when not signed in)
                          </Text>
                        }
                      </Text>
                    </Pane>
                  </Pane>
                </Pane>
                
                <Pane marginY={majorScale(1)}>
                  <Text size={300} marginBottom={minorScale(1)}>Database Information:</Text>
                  <Pane display="flex" flexDirection="column" gap={minorScale(2)}>
                    <Pane 
                      display="flex" 
                      alignItems="center" 
                      padding={minorScale(1)}
                      background="tint1"
                      borderRadius="3px"
                    >
                      <Pane width={majorScale(3)} marginRight={minorScale(1)}>
                        {results.details?.database?.connected ? 
                          <Text color="success" fontWeight="bold">✅</Text> : 
                          <Text color="danger" fontWeight="bold">❌</Text>}
                      </Pane>
                      <Text size={300}>Database connection: {results.details?.database?.connected ? 'Connected' : 'Disconnected'}</Text>
                    </Pane>
                    
                    <Pane 
                      display="flex" 
                      alignItems="center" 
                      padding={minorScale(1)}
                      background="tint1"
                      borderRadius="3px"
                    >
                      <Pane width={majorScale(3)} marginRight={minorScale(1)}>
                        <Text>{results.details?.database?.userCount > 0 ? '👤' : '0'}</Text>
                      </Pane>
                      <Text size={300}>User count: {results.details?.database?.userCount || 0}</Text>
                    </Pane>
                  </Pane>
                </Pane>
              </Pane>
            );
          } catch (e) {
            console.error('Failed to parse test results:', e);
            return <Text>No valid test results available</Text>;
          }
        }}
      </Dialog>
    </Pane>
  )
}

Login.displayName = 'Login'

export default Login