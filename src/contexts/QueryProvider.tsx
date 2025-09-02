/**
 * React Query Provider
 * 
 * Sets up QueryClient with optimized configuration for the Production Rebellion app.
 * Includes proper error boundaries and development tools integration.
 */

'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Configure QueryClient with Production Rebellion-specific settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Prevent refetch on window focus for better UX during work sessions
      refetchOnWindowFocus: false,
      // Retry failed requests 2 times (reasonable for Supabase)
      retry: 2,
      // Keep unused data for 5 minutes (good balance for productivity app)
      gcTime: 5 * 60 * 1000,
      // Consider data stale after 1 minute (fresh enough for real-time feel)
      staleTime: 60 * 1000,
    },
    mutations: {
      // Retry failed mutations once (user can retry manually if needed)
      retry: 1,
    },
  },
});

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Show devtools in development for debugging */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}

export default QueryProvider;