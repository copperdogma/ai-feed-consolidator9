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
    auth: {
      register: any;
      login: any;
    };
    user: {
      getProfile: any;
      updateProfile: any;
    };
    feed: {
      validateFeedUrl: any;
      discoverFeeds: any;
      addFeedSource: any;
      listFeedSources: any;
      getFeedSource: any;
      updateFeedSource: any;
      deleteFeedSource: any;
      refreshFeed: any;
    };
    admin: {
      getFeedRefreshStatus: any;
      startFeedRefreshService: any;
      stopFeedRefreshService: any;
      runFeedRefreshCycle: any;
    };
  };
}

export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>; 