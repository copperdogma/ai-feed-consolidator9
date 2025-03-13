import { createTRPCReact } from '@trpc/react-query'
import type { AppRouter, RouterInput as ServerInputs, RouterOutput as ServerOutputs } from './server-types'

// Define a proper type for the router
export type AppRouterType = AppRouter;

// This helps ensure type safety while allowing the client to build without server access
export const trpc = createTRPCReact<AppRouterType>();

// Properly typed router inputs and outputs
export type RouterInput = ServerInputs;
export type RouterOutput = ServerOutputs;
