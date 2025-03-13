import { Alert, Box, Typography } from '@mui/material';
import { useState, useEffect } from 'react';

interface ConnectionErrorNotificationProps {
  url: string;
}

const ConnectionErrorNotification = ({ url }: ConnectionErrorNotificationProps) => {
  const [isConnected, setIsConnected] = useState(true);
  const [lastChecked, setLastChecked] = useState(Date.now());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const checkConnection = async () => {
    try {
      console.log(`Checking connection to ${url}...`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(url, { 
        method: 'HEAD',
        signal: controller.signal,
        credentials: 'include'
      });
      
      clearTimeout(timeoutId);
      setIsConnected(response.ok || response.status === 204);
      setErrorMessage(null);
      console.log(`Connection check result: ${response.ok || response.status === 204 ? 'Success' : 'Failed'}`);
    } catch (error) {
      console.error('Connection check failed:', error);
      setIsConnected(false);
      setErrorMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setLastChecked(Date.now());
    }
  };

  useEffect(() => {
    // Check connection immediately
    checkConnection();
    
    // Then check every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    
    return () => clearInterval(interval);
  }, [url]);

  if (isConnected) {
    return null;
  }

  return (
    <Box position="fixed" top={16} left="50%" sx={{ transform: 'translateX(-50%)', zIndex: 9999, width: '80%', maxWidth: '600px' }}>
      <Alert 
        severity="error" 
        variant="filled"
        sx={{ 
          boxShadow: 6,
          '& .MuiAlert-message': { fontWeight: 'bold' }
        }}
      >
        <Typography variant="body1" fontWeight="bold">
          Unable to connect to the server at {url.split('/')[2]}
        </Typography>
        
        <Typography variant="body2" sx={{ mt: 1 }}>
          {errorMessage && `Error: ${errorMessage}`}
        </Typography>
        
        <Typography variant="body2" sx={{ mt: 1 }}>
          The browser cannot reach the API. Please verify:
        </Typography>
        <ul>
          <li>Server is running on port 3001</li>
          <li>API URL in .env file is correctly set to http://localhost:3001/trpc</li>
          <li>Not using 'server:3001' which only works within Docker network</li>
        </ul>
        
        <Box mt={1} display="flex" justifyContent="flex-end">
          <button 
            onClick={checkConnection}
            style={{
              padding: '8px 16px',
              background: 'white',
              color: '#d32f2f',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Retry Connection
          </button>
        </Box>
      </Alert>
    </Box>
  );
};

export default ConnectionErrorNotification; 