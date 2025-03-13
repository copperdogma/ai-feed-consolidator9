import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/tests/**/*.test.ts', 'src/tests/**/*.vitest.ts'],
    alias: {
      // Add path aliases for imports
      '@server': resolve(__dirname, 'src'),
      '@tests': resolve(__dirname, 'src/tests'),
      'trpc': resolve(__dirname, 'src/trpc'),
    },
  },
}); 