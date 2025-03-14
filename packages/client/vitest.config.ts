import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    // Add React support
    react(),
  ],
  
  test: {
    // Use jsdom as the testing environment for client tests
    environment: 'jsdom',
    
    // Include both current Jest tests and future Vitest tests
    include: ['**/*.test.{js,jsx,ts,tsx}', '**/*.vitest.{js,jsx,ts,tsx}'],
    
    // Explicitly exclude any problematic test files
    exclude: ['**/node_modules/**'],
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/vitest.setup.ts',
        '**/*.d.ts',
      ],
      // Add thresholds to enforce minimum coverage levels
      thresholds: {
        statements: 10,
        branches: 10,
        functions: 10,
        lines: 10,
        // More specific thresholds for critical paths
        perFile: false,
        autoUpdate: false,
      },
      // Generate a detailed HTML report
      reportsDirectory: './coverage',
    },
    
    // Set longer timeout for tests that need it
    testTimeout: 10000,
    
    // Make sure globals are available in tests
    globals: true,
    
    // Setup files that should run before each test
    setupFiles: ['./src/tests/vitest.setup.js'],
  },
  
  // Resolve paths for imports
  resolve: {
    alias: {
      'src': resolve(__dirname, './src'),
      'components': resolve(__dirname, './src/components'),
      'views': resolve(__dirname, './src/views'),
      'hooks': resolve(__dirname, './src/hooks'),
      'lib': resolve(__dirname, './src/lib'),
    },
  },
}); 