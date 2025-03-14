# Test Utilities

This directory contains utility functions to help with testing across the codebase.

## Migration from Jest to Vitest

The project has been migrated from using Jest (and jest-mock-extended) to fully use Vitest. This migration addressed memory issues that occurred when running all tests together, particularly related to the "Double free of object" error.

### Key Changes

1. Replaced `jest-mock-extended` with a custom `mockDeep` implementation using Vitest's mocking capabilities
2. Updated test files to use the new mock utilities
3. Fixed type issues and ensured consistent mocking behavior across tests

### Using the Mock Utilities

The `mock-utils.ts` file provides functions to create deep mocks that are compatible with Vitest:

```typescript
import { mockDeep } from '../utils/mock-utils';

// Mock a complex interface or type
const mockPrismaClient = mockDeep<PrismaClient>();

// Use in tests
mockPrismaClient.user.findUnique.mockResolvedValue({
  id: '123',
  email: 'test@example.com',
  // ... other properties
});
```

## Why the Custom Implementation?

While Vitest provides built-in mocking functionality, it doesn't have a direct equivalent to `jest-mock-extended`'s deep mocking functionality. Our custom implementation bridges this gap, allowing for easier mocking of complex interfaces like Prisma clients.

The implementation handles:
- Deep mocking of all properties and methods
- Automatic promise resolution for method calls
- Proper typing for TypeScript 