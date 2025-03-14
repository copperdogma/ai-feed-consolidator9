# Test Mocks

This directory contains mock utilities for testing components that use external dependencies.

## TRPCProvider

A simple mock implementation of the TRPCProvider for tests. This provider doesn't do any actual data fetching but allows components that require the TRPCProvider to render correctly in tests.

## trpcMock

Utilities for mocking tRPC hooks in tests. These utilities help create type-safe mocks for tRPC queries and mutations.

### Usage

#### Mocking a tRPC Mutation Hook

```typescript
import { createMockMutation } from '../../../tests/mocks/trpcMock';

// Create typed mock mutations
const validateFeedUrlMock = createMockMutation<'feed.validateFeedUrl'>();

// Mock the trpc module
vi.mock('../../lib/trpc', () => ({
  trpc: {
    feed: {
      validateFeedUrl: {
        useMutation: (options) => validateFeedUrlMock(options)
      }
    }
  }
}));

// In your test
it('should handle validation success', async () => {
  // Render your component
  render(<YourComponent />);
  
  // Trigger some action that causes the mutation to be called
  fireEvent.click(screen.getByText('Validate'));
  
  // Simulate a successful response
  await validateFeedUrlMock.mockSuccess({
    isValid: true,
    feedTitle: 'Example Feed'
  });
  
  // Assert that your component handled the success properly
  expect(screen.getByText('Feed is valid')).toBeInTheDocument();
});

it('should handle validation error', async () => {
  // Render your component
  render(<YourComponent />);
  
  // Trigger some action that causes the mutation to be called
  fireEvent.click(screen.getByText('Validate'));
  
  // Simulate an error response
  await validateFeedUrlMock.mockError(new Error('Invalid feed URL'));
  
  // Assert that your component handled the error properly
  expect(screen.getByText('Error: Invalid feed URL')).toBeInTheDocument();
});
```

#### Mocking a tRPC Query Hook

```typescript
import { createMockQuery } from '../../../tests/mocks/trpcMock';

// Create typed mock query
const getFeedsMock = createMockQuery<'feed.getFeeds'>();

// Mock the trpc module
vi.mock('../../lib/trpc', () => ({
  trpc: {
    feed: {
      getFeeds: {
        useQuery: () => getFeedsMock()
      }
    }
  }
}));

// In your test
it('should display feeds when loaded', async () => {
  // Set the mock data before rendering
  getFeedsMock.setData([
    { id: '1', name: 'Feed 1', url: 'https://example.com/feed1' },
    { id: '2', name: 'Feed 2', url: 'https://example.com/feed2' }
  ]);
  
  // Render your component
  render(<FeedList />);
  
  // Assert that the feeds are displayed
  expect(screen.getByText('Feed 1')).toBeInTheDocument();
  expect(screen.getByText('Feed 2')).toBeInTheDocument();
});
```

### Benefits

- **Type Safety**: The mock utilities are fully typed using TypeScript, ensuring that the mock data matches the expected shape.
- **React Integration**: The mock utilities automatically wrap callbacks in React's `act()` function to prevent test warnings.
- **Simpler Tests**: No need to manually create and manage complex mock objects.
- **Consistent Mocking**: Provides a standard approach to mocking tRPC across all tests.

### Best Practices

1. Always use `await` when calling `mockSuccess`, `mockError`, `setData`, or `setError` since they return promises.
2. Reset mocks before each test using `vi.clearAllMocks()` in a `beforeEach` block.
3. When checking if a mutation was called, use `mutationMock._mutateMock.toHaveBeenCalled()` instead of checking the returned object.
4. For more complex scenarios, you can provide a custom implementation to the `createMockMutation` function. 