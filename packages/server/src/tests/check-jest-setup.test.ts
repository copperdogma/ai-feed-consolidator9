/**
 * Simple test to verify Jest setup is working
 */
import { describe, it, expect, jest } from '@jest/globals';

describe('Jest Setup', () => {
  it('should work with ESM', () => {
    expect(1 + 1).toBe(2);
  });

  it('can handle async/await', async () => {
    const result = await Promise.resolve(42);
    expect(result).toBe(42);
  });

  it('can use mock functions', () => {
    const mockFn = jest.fn(() => 'mocked');
    const result = mockFn();
    expect(mockFn).toHaveBeenCalled();
    expect(result).toBe('mocked');
  });
}); 