import { vi } from 'vitest';

/**
 * Creates a deeply mocked version of an object, similar to jest-mock-extended's mockDeep
 * but using Vitest's mocking capabilities instead.
 * 
 * @param template Optional template object with predefined mock implementations
 * @returns A deeply mocked object where all properties and methods are Vitest mocks
 */
export function mockDeep<T extends object>(template: Partial<T> = {}): T {
  const cache = new Map<string, any>();
  
  const handler: ProxyHandler<any> = {
    get: (target, prop) => {
      // Return the property if it's already defined
      if (prop in target) {
        return target[prop];
      }

      // Handle special properties
      if (prop === 'then' || prop === 'catch' || prop === 'finally') {
        return undefined; // Make sure the object is not thenable
      }

      // Check if we've already created a mock for this property path
      const propString = prop.toString();
      if (cache.has(propString)) {
        return cache.get(propString);
      }

      // For functions, create a vitest mock
      const mockFn = vi.fn();
      
      // Make methods return promises if called
      mockFn.mockImplementation((...args: unknown[]) => {
        return Promise.resolve(undefined);
      });
      
      // For objects (especially Prisma models), create a nested proxy
      const value = typeof prop === 'string' && !prop.startsWith('_') && isUpperCase(prop.charAt(0))
        ? new Proxy({}, handler) // Create nested proxy for models like User, Topic, etc.
        : mockFn;
        
      // Store in the target and cache
      target[prop] = value;
      cache.set(propString, value);
      
      return value;
    }
  };

  // Start with an empty object or the provided template
  const mock = { ...template };
  
  // Create the main proxy
  const proxy = new Proxy(mock, handler) as T;
  
  // For Prisma specifically, pre-initialize common model properties
  if ('$connect' in mock || '$disconnect' in mock) {
    // This looks like a PrismaClient, pre-initialize models
    const models = ['user', 'topic', 'content', 'source', 'summary', 'activity', 'contentTopic'];
    
    for (const model of models) {
      const modelProxy = new Proxy({}, handler);
      
      // Set up common methods
      const methods = ['findUnique', 'findMany', 'create', 'update', 'delete', 'count'];
      for (const method of methods) {
        const methodMock = vi.fn().mockImplementation(() => Promise.resolve());
        modelProxy[method] = methodMock;
      }
      
      // @ts-ignore - Dynamically setting properties
      proxy[model] = modelProxy;
    }
  }
  
  return proxy;
}

/**
 * Helper function to check if a character is uppercase
 */
function isUpperCase(char: string): boolean {
  return char === char.toUpperCase() && char !== char.toLowerCase();
}

/**
 * Creates a mock instance of a class
 * 
 * @param constructor The class constructor
 * @param template Optional template object with predefined mock implementations
 * @returns A mocked instance of the class
 */
export function mockInstance<T extends object>(constructor: new (...args: any[]) => T, template: Partial<T> = {}): T {
  return mockDeep<T>(template);
}

/**
 * Helper to create a mocked Prisma client with common methods pre-initialized
 */
export function mockPrisma() {
  return mockDeep<any>({
    $connect: vi.fn(),
    $disconnect: vi.fn()
  });
} 