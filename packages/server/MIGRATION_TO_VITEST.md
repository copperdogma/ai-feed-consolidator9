# Migration from Jest to Vitest

This document outlines the completed migration of our testing framework from Jest to Vitest.

## Rationale

We standardized on Vitest for the following reasons:

1. **Better ESM Support**: Native support for ES Modules without configuration hacks, which is especially important as our project uses `"type": "module"` in package.json.
2. **Performance**: Vitest is typically 10-20x faster than Jest due to its Vite-based architecture.
3. **TypeScript Integration**: Vitest offers seamless TypeScript integration without transpilation.
4. **API Compatibility**: Vitest has an API almost identical to Jest, making migration easier.
5. **Modern Features**: Better watch mode, more developer-friendly error messages, and better support for modern JavaScript features.

## Current Status

✅ **Migration Complete!** All tests have been successfully migrated from Jest to Vitest.

- Total tests: 198
- All tests passing: Yes
- Jest dependencies removed: Yes
- Jest configuration files removed: Yes

## Migration Summary

The following test files were migrated:

### Library Tests
- ✅ `context.test.js` → `context.vitest.ts`
- ✅ `firebase-admin.test.js` → `firebase-admin.vitest.ts`

### Authentication Tests
- ✅ `user-auth.test.js` → `user-auth.vitest.ts`
- ✅ `auth/user-creation.test.js` → `user-creation.vitest.ts`

### Router Tests
- ✅ `router/auth.router.test.js` → `auth.router.vitest.ts`
- ✅ `router/user.router.test.js` → `user.router.vitest.ts`
- ✅ `router/feed.router.test.js` → `feed.router.vitest.ts`
- ✅ `router/admin.router.test.js` → `admin.router.vitest.ts`
- ✅ `router/feed-discovery.router.test.js` → `feed-discovery.router.vitest.ts`

### Repository Tests
- ✅ `repositories/repository-factory.test.js` → `repository-factory.vitest.ts`
- ✅ `repositories/user.repository.test.js` → `user.repository.vitest.ts`
- ✅ `repositories/source.repository.test.js` → `source.repository.vitest.ts`
- ✅ `repositories/content.repository.test.js` → `content.repository.vitest.ts`
- ✅ `repositories/content-topic.repository.test.js` → `content-topic.repository.vitest.ts`
- ✅ `repositories/activity.repository.test.js` → `activity.repository.vitest.ts`
- ✅ `repositories/topic.repository.test.js` → `topic.repository.vitest.ts`
- ✅ `repositories/summary.repository.test.js` → `summary.repository.vitest.ts`

### Service Tests
- ✅ `services/transaction.service.test.js` → `transaction.service.test.ts` (kept same extension since it was already working)

### Miscellaneous Tests
- ✅ `relationship-tests.ts` → `relationship-tests.vitest.ts`

## Key Migration Challenges and Solutions

### 1. Mocking Issues

**Challenge**: Mocking in Vitest works differently than in Jest, particularly for ES modules.

**Solution**: 
- Used `vi.mock()` with proper module paths
- Implemented proper setup and teardown procedures with `beforeEach` and `afterEach`
- Used `vi.fn()` and `vi.spyOn()` for function mocking

### 2. Firebase Admin Mocking

**Challenge**: The Firebase Admin SDK was particularly challenging to mock correctly.

**Solution**:
- Created comprehensive mocks for Firebase Admin functions
- Implemented proper environment variable handling
- Added detailed test cases for different initialization scenarios

### 3. Prisma Schema Compatibility

**Challenge**: Some tests were failing due to changes in the Prisma schema, particularly around unique constraints.

**Solution**:
- Updated tests to align with current schema constraints
- Modified assertions to reflect that URL uniqueness is no longer enforced for sources
- Fixed null checking issues in relation tests

## Configuration Updates

- ✅ Updated `vitest.config.ts` to ensure it covers all test patterns
- ✅ Updated npm scripts to use Vitest instead of Jest
- ✅ Removed Jest dependencies from package.json
- ✅ Removed Jest configuration files (jest.config.js, babel.config.cjs)

## Package.json Script Changes

```json
"scripts": {
  "test": "npm run reset-test-db && vitest run src/tests/...",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage"
}
```

## Cleanup Completed

- ✅ Removed Jest dependencies from package.json
- ✅ Removed Jest configuration files (jest.config.js, babel.config.cjs)
- ✅ Updated documentation to reference Vitest only
- ✅ Removed duplicated test files

## Benefits Realized

1. **Faster Test Execution**: Tests now run significantly faster
2. **Better Developer Experience**: Improved error messages and watch mode
3. **Simplified Configuration**: No more transpilation or module transformation hacks
4. **Better TypeScript Integration**: Native TypeScript support without additional configuration
5. **Consistent Testing Framework**: All tests now use the same framework and patterns

## Next Steps

- [x] Update CI/CD pipeline to use Vitest (verification completed; no actual pipeline exists yet, only documentation)
- [ ] Consider renaming all `.vitest.ts` files to `.test.ts` once the migration is fully stabilized
- [ ] Explore additional Vitest features like UI mode for interactive debugging 

## CI/CD Pipeline Notes

The project doesn't currently have an actual CI/CD pipeline implementation. When implementing a GitHub Actions workflow in the future, use the following updated template (already configured for Vitest):

```yaml
name: Testing Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_USER: admin
          POSTGRES_PASSWORD: password
          POSTGRES_DB: ai_feed_consolidator_test
        ports:
          - 5432:5432
        options: --health-cmd pg_isready --health-interval 10s --health-timeout 5s --health-retries 5
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install Server Dependencies
      run: cd packages/server && npm install
    
    - name: Run Server Tests (using Vitest)
      run: cd packages/server && npm test
    
    - name: Install Client Dependencies
      run: cd packages/client && npm install
    
    - name: Run Client Tests
      run: cd packages/client && npm test
``` 