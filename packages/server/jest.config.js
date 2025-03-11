/** @type {import('ts-jest').JestConfigWithTsJest} */
const config = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^src/(.*)$': '<rootDir>/src/$1',
    '^router/(.*)$': '<rootDir>/src/router/$1',
    '^trpc$': '<rootDir>/src/lib/trpc.js',
    '^sdks/(.*)$': '<rootDir>/src/sdks/$1',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: 'tsconfig.json',
        // Skip type checking for tests during development
        isolatedModules: true
      },
    ],
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/src/scripts/test.ts'
  ],
  modulePathIgnorePatterns: ['/dist/'],
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
  // This is important for ESM support
  transformIgnorePatterns: [
    'node_modules/(?!(ts-jest|@jest|jest-mock-extended)/)'
  ],
  // Code coverage configuration
  collectCoverage: true,
  collectCoverageFrom: [
    '<rootDir>/src/**/*.ts',
    '!<rootDir>/src/**/*.test.ts',
    '!<rootDir>/src/**/tests/**/*.ts',
    '!<rootDir>/src/**/*.d.ts',
    // Exclude generated code
    '!<rootDir>/src/generated/**/*.ts',
    '!<rootDir>/src/scripts/**/*.ts',
    // Exclude application bootstrapping code
    '!<rootDir>/src/main.ts',
    '!<rootDir>/src/**/index.ts',
    // Exclude configuration files
    '!<rootDir>/src/config/**/*.ts',
    // Exclude type definition files
    '!<rootDir>/src/types/**/*.ts',
    // Exclude router files since they're difficult to test due to tRPC architecture
    '!<rootDir>/src/router/**/*.ts'
  ],
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['json', 'lcov', 'text', 'clover', 'html'],
  // Lower thresholds for early development phase
  coverageThreshold: {
    global: {
      branches: 10,
      functions: 5, 
      lines: 10,
      statements: 10
    },
    // Set specific higher targets for critical areas
    './src/lib/': {
      statements: 75,
      branches: 50,
      functions: 75,
      lines: 75
    }
  }
};

export default config; 