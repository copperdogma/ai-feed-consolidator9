/**
 * Type declaration file for Vitest
 * This ensures TypeScript is aware of Vitest's types.
 */

declare module 'vitest' {
  // Vitest global types
  export const describe: Function;
  export const it: Function;
  export const test: Function;
  export const expect: Function;
  export const beforeEach: Function;
  export const afterEach: Function;
  export const beforeAll: Function;
  export const afterAll: Function;
  
  // Vitest specific functions
  export const vi: {
    fn: () => any;
    mock: (path: string, factory?: () => any) => any;
    clearAllMocks: () => void;
    useFakeTimers: () => void;
    useRealTimers: () => void;
    advanceTimersByTime: (ms: number) => void;
  };
} 