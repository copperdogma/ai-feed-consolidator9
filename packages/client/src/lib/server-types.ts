/**
 * This file contains type definitions from the server
 * that are needed by the client.
 * 
 * Instead of importing directly from server code (which causes
 * Vite build issues), we define the types here.
 */

import { type inferRouterInputs, type inferRouterOutputs } from '@trpc/server';
import { type AnyRouter } from '@trpc/server';

// This is a simplified version of the actual server router structure
// Just enough for TypeScript to be happy
export interface AppRouter extends AnyRouter {
  _def: any;
  createCaller: any;
  getErrorShape: any;
  router: {
    todo: {
      list: any;
      add: any;
      edit: any;
      delete: any;
    };
    auth: {
      register: any;
      login: any;
    };
  };
}

export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>; 