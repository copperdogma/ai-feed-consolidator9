import { createTRPCReact } from '@trpc/react-query'
import type { AppRouter } from './server-types'

// Define a proper type for the router
export type AppRouterType = AppRouter;

// This helps ensure type safety while allowing the client to build without server access
export const trpc = createTRPCReact<AppRouterType>();

// These can be used with type assertions when needed
export type RouterInput = any;
export type RouterOutput = any;
