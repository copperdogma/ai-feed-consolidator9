import { vi } from 'vitest';
import { act } from '@testing-library/react';
import { RouterOutput, RouterInput } from '../../lib/trpc';

/**
 * Type for tRPC mutation hook options
 */
export interface MutationOptions<TData, TError, TVariables, TContext> {
  onSuccess?: (data: TData, variables: TVariables, context: TContext) => void;
  onError?: (error: TError, variables: TVariables, context: TContext) => void;
  onSettled?: (data: TData | undefined, error: TError | undefined, variables: TVariables, context: TContext) => void;
}

/**
 * Type for tRPC query hook options
 */
export interface QueryOptions<TData, TError> {
  onSuccess?: (data: TData) => void;
  onError?: (error: TError) => void;
  onSettled?: (data: TData | undefined, error: TError | undefined) => void;
}

/**
 * Utility function to create a typed mock for a tRPC mutation hook
 * 
 * @param defaultImplementation Optional default mock implementation
 * @returns Mock mutation hook with typed methods
 */
export function createMockMutation<
  TPath extends keyof RouterInput,
  TInput = RouterInput[TPath],
  TOutput = RouterOutput[TPath],
  TError = Error,
  TContext = unknown
>(defaultImplementation?: (params: TInput) => void) {
  // Create the main mutation mock function
  const mutateMock = vi.fn(defaultImplementation || (() => {}));
  let currentOptions: MutationOptions<TOutput, TError, TInput, TContext> | undefined;
  
  // Create a mock function that stores the options for later use
  const mockFn = (options?: MutationOptions<TOutput, TError, TInput, TContext>) => {
    currentOptions = options;
    return {
      // The mutate function that will call our mock and handle callbacks
      mutate: (params: TInput) => {
        mutateMock(params);
      },
      // Additional properties that might be needed in tests
      isLoading: false,
      isError: false,
      isSuccess: false,
      reset: vi.fn(),
      mutateAsync: vi.fn().mockImplementation(async (params: TInput) => {
        mutateMock(params);
        return {} as TOutput;
      }),
      // Expose the original mock for assertions
      _mutateMock: mutateMock
    };
  };
  
  // Add helper methods directly to the mock function
  mockFn.mockSuccess = async (data: TOutput, params: TInput = {} as TInput) => {
    await act(async () => {
      if (currentOptions?.onSuccess) {
        currentOptions.onSuccess(data, params, {} as TContext);
      }
      if (currentOptions?.onSettled) {
        currentOptions.onSettled(data, undefined, params, {} as TContext);
      }
    });
  };
  
  mockFn.mockError = async (error: TError, params: TInput = {} as TInput) => {
    await act(async () => {
      if (currentOptions?.onError) {
        currentOptions.onError(error, params, {} as TContext);
      }
      if (currentOptions?.onSettled) {
        currentOptions.onSettled(undefined, error, params, {} as TContext);
      }
    });
  };
  
  mockFn._mutateMock = mutateMock;
  
  return mockFn;
}

/**
 * Utility function to create a typed mock for a tRPC query hook
 * 
 * @param defaultData Optional default data to return
 * @returns Mock query hook with typed methods
 */
export function createMockQuery<
  TPath extends keyof RouterOutput,
  TOutput = RouterOutput[TPath],
  TError = Error
>(defaultData?: TOutput) {
  // Create mock data
  let mockData: TOutput | undefined = defaultData;
  let currentOptions: QueryOptions<TOutput, TError> | undefined;
  
  // Create a mock function that stores the options for later use
  const mockFn = (options?: QueryOptions<TOutput, TError>) => {
    currentOptions = options;
    return {
      // Query data
      data: mockData,
      // Status flags
      isLoading: false,
      isError: false,
      isSuccess: !!mockData,
      // Additional methods
      refetch: vi.fn().mockImplementation(async () => ({ data: mockData })),
      reset: vi.fn()
    };
  };
  
  // Add helper methods directly to the mock function
  mockFn.setData = async (data: TOutput) => {
    await act(async () => {
      mockData = data;
      if (currentOptions?.onSuccess) {
        currentOptions.onSuccess(data);
      }
      if (currentOptions?.onSettled) {
        currentOptions.onSettled(data, undefined);
      }
    });
  };
  
  mockFn.setError = async (error: TError) => {
    await act(async () => {
      if (currentOptions?.onError) {
        currentOptions.onError(error);
      }
      if (currentOptions?.onSettled) {
        currentOptions.onSettled(undefined, error);
      }
    });
  };
  
  return mockFn;
}

/**
 * Example usage:
 * 
 * // In your test setup:
 * const validateFeedUrlMock = createMockMutation<'feed.validateFeedUrl'>();
 * 
 * // Mock the trpc object
 * vi.mock('../../lib/trpc', () => ({
 *   trpc: {
 *     feed: {
 *       validateFeedUrl: {
 *         useMutation: (options) => validateFeedUrlMock(options)
 *       }
 *     }
 *   }
 * }));
 * 
 * // In your test:
 * // Trigger success callback
 * await validateFeedUrlMock.mockSuccess({ isValid: true, feedTitle: 'Example Feed' });
 */ 