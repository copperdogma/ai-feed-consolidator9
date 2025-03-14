import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    // Use Node.js as the test environment
    environment: 'node',
    
    // Target test files (include both original and migrated patterns)
    include: [
      '**/*.test.js', 
      '**/*.test.ts',
      '**/*.vitest.js', 
      '**/*.vitest.ts'
    ],
    
    // Exclude node_modules and other non-test directories
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/bak/**'
    ],
    
    // Setup file for test environment
    setupFiles: ['./vitest.setup.ts'],
    
    // Make sure hooks like beforeEach are called with the right context
    globals: true,
    
    // Set longer timeout for tests that need it
    testTimeout: 10000,
  },
  
  // Resolve paths for imports
  resolve: {
    alias: {
      'src': resolve(__dirname, '../'),
      'lib': resolve(__dirname, '../lib'),
      'sdks': resolve(__dirname, '../sdks'),
      'services': resolve(__dirname, '../services'),
    },
  },
}); 