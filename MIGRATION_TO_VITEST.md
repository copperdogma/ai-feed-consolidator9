# Migration from Jest to Vitest

This document outlines the progress and plan for migrating our testing framework from Jest to Vitest.

## Rationale

Vitest offers several advantages over Jest for our project:

1. **Performance**: Vitest is significantly faster than Jest, leveraging Vite's transformation cache.
2. **ESM Support**: Vitest has better support for ES modules, which is essential as we move away from CommonJS.
3. **Developer Experience**: Vitest provides a better developer experience with features like watch mode UI and filtering.
4. **API Compatibility**: Vitest has an API almost identical to Jest, making migration easier.
5. **Reduced Memory Usage**: Vitest is more memory-efficient, which helps avoid "Double free of object" errors we've experienced with Jest.

## Current Status

- Backend tests: Migration complete
- Client tests: Partially migrated
- Configuration: Updated to support both `.test.ts` and `.vitest.ts` patterns

## Completed Steps

- [x] Created Vitest configuration files for server and client packages
- [x] Added custom mock utilities to replace `jest-mock-extended`
- [x] Removed old Jest setup files
- [x] Converted key test files to use Vitest:
  - [x] src/tests/auth/user-creation.vitest.js
  - [x] src/tests/auth/google-auth.vitest.js
- [x] Updated project documentation to reference Vitest instead of Jest
- [x] Created a new vitest.setup.ts file to replace Jest setup files
- [x] Added Vitest patterns to test configurations
- [x] Updated package.json test script to use Vitest for all tests
- [x] Replaced @testing-library/jest-dom with @testing-library/vitest-dom
- [x] Updated Babel configurations for compatibility with Vitest

## Remaining Work

- [ ] Check client-side tests are working with Vitest
- [ ] Run a full test suite to verify all tests pass with Vitest
- [ ] Remove any remaining Jest packages from package.json files
- [ ] Run npm prune to remove unused packages
- [ ] Archive README_TESTING.md to /docs/build-logs with date stamp
- [ ] Standardize file naming (consider renaming all `.vitest.ts` to `.test.ts`)

## Key Changes

### Mock Utilities

Replaced Jest's mocking capabilities with Vitest equivalents:

```typescript
// Before (Jest)
jest.mock('some-module');
jest.fn();
jest.spyOn(object, 'method');

// After (Vitest)
vi.mock('some-module');
vi.fn();
vi.spyOn(object, 'method');
```

### Test Configuration

Updated Vitest configuration to include multiple test file patterns:

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    include: [
      '**/*.test.ts', 
      '**/*.vitest.ts', 
      '**/*.vitest.js'
    ],
  },
});
```

### Package.json Updates

Simplified test scripts to use Vitest's automatic file discovery:

```json
// Before
"test": "npm run reset-test-db && vitest run src/tests/user-auth.test.ts src/tests/auth/user-creation.test.ts ..."

// After
"test": "npm run reset-test-db && vitest run"
```

### Setup Files

Converted Jest setup files to Vitest:

```typescript
// Before
jest.mock('module-name', () => { ... });

// After
import { vi } from 'vitest';
vi.mock('module-name', () => { ... });
```

## Running Tests

To run tests with Vitest:

```bash
# Run all tests
npx vitest run

# Run specific tests
npx vitest run path/to/test.vitest.js

# Run tests in watch mode
npx vitest
``` 