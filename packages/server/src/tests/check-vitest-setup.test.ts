/**
 * Simple test to verify Vitest setup is working
 */
import { describe, it, expect, vi } from 'vitest';

describe('Vitest Setup', () => {
  it('should work with ESM', () => {
    expect(1 + 1).toBe(2);
  });

  it('can handle async/await', async () => {
    const result = await Promise.resolve(42);
    expect(result).toBe(42);
  });

  it('can use mock functions', () => {
    const mockFn = vi.fn(() => 'mocked');
    const result = mockFn();
    expect(mockFn).toHaveBeenCalled();
    expect(result).toBe('mocked');
  });
}); 