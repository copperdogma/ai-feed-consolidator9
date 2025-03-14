import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    // Add support for TypeScript path aliases
    tsconfigPaths(),
  ],
  
  test: {
    // Use the same environment as Jest for consistency
    environment: 'node',
    
    // Target test files
    include: ['**/*.test.ts', '**/*.vitest.ts', '**/*.vitest.js'],
    
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
        'src/generated/**',
        'src/scripts/**',
        'src/tests/**',
        'src/main.ts',
        'src/index.ts',
        '*.js',
        '*.cjs',
        'prisma/**',
        'scripts/**',
        'src/trpc/**',
        'src/sdks/__mocks__/**',
      ],
      // Add thresholds to enforce minimum coverage levels
      thresholds: {
        statements: 75,
        branches: 65,
        functions: 75,
        lines: 75,
        // More specific thresholds for critical paths
        perFile: false,
        autoUpdate: false,
      },
      // Generate a detailed HTML report
      reportsDirectory: './coverage',
    },
    
    // Set longer timeout for tests that need it
    testTimeout: 10000,
    
    // Make sure hooks are called with the right context
    globals: true,
  },
  
  // Resolve paths for imports (additional to tsconfig paths)
  resolve: {
    alias: {
      'src': resolve(__dirname, './src'),
      'sdks/prisma': resolve(__dirname, './src/sdks/prisma'),
    },
  },
}); 