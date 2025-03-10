import superjson from 'superjson';
import { useState, useEffect } from 'react';
import { QueryClient } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { trpc } from 'lib/trpc';
import { getIdToken } from 'firebase/auth';
import { auth } from './lib/firebase';

// Create a query client with auth headers
export const useQueryTrpcClient = () => {
  const APP_URL = import.meta.env.VITE_APP_API_URL;
  if (!APP_URL) throw new Error('No app url env variable found');

  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() => {
    const links = [
      httpBatchLink({
        url: APP_URL,
        async headers() {
          const user = auth.currentUser;
          if (!user) return {};
          try {
            const token = await getIdToken(user, true);
            return {
              Authorization: token ? `Bearer ${token}` : '',
            };
          } catch (error) {
            console.error('Error getting token:', error);
            return {};
          }
        },
        fetch(url, options) {
          return fetch(url, {
            ...options,
            credentials: 'include',
          });
        },
      }),
    ];

    // @ts-ignore - ignore TypeScript errors for now
    return trpc.createClient({
      links,
      transformer: superjson,
    });
  });

  return { queryClient, trpcClient };
};

// Create a function to get the trpc links with auth
export const getTrpcLinks = (getToken?: () => Promise<string | null>) => {
  const APP_URL = import.meta.env.VITE_APP_API_URL;
  if (!APP_URL) throw new Error('No app url env variable found');

  return [
    httpBatchLink({
      url: APP_URL,
      async headers() {
        if (!getToken) return {};
        const token = await getToken();
        return {
          Authorization: token ? `Bearer ${token}` : '',
        };
      },
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: 'include',
        });
      },
    }),
  ];
};
