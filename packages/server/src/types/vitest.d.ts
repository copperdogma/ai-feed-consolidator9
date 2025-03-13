/**
 * Type declaration file for Vitest
 * This is needed because we're using both Jest and Vitest in the project,
 * and we need to make TypeScript aware of Vitest's types.
 */

declare module 'vitest' {
  import { expect as jestExpect } from '@jest/globals';
  
  // Re-export types from Jest that Vitest uses
  export const describe: typeof global.describe;
  export const it: typeof global.it;
  export const test: typeof global.test;
  export const expect: typeof jestExpect;
  export const beforeEach: typeof global.beforeEach;
  export const afterEach: typeof global.afterEach;
  export const beforeAll: typeof global.beforeAll;
  export const afterAll: typeof global.afterAll;
  
  // Vitest specific functions
  export const vi: {
    fn: typeof jest.fn;
    mock: typeof jest.mock;
    clearAllMocks: () => void;
    useFakeTimers: () => void;
    useRealTimers: () => void;
    advanceTimersByTime: (ms: number) => void;
  };
} 