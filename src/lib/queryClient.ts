import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { getHttpStatusFromError } from '@/lib/http-error';

const isProduction = import.meta.env.MODE === 'production';

function shouldRetryRequest(failureCount: number, error: unknown, maxRetries: number) {
  const status = getHttpStatusFromError(error);
  if (status !== undefined && status >= 400 && status < 500) return false;
  return failureCount < maxRetries;
}

function handleGlobalError(error: unknown, context?: string) {
  // Replace with your logger / toast system (e.g. Sentry, react-hot-toast)
  if (!isProduction) {
    console.error(`[QueryClient${context ? ` – ${context}` : ''}]`, error);
  }
}

export const queryClient = new QueryClient({
  // ─── Caches with global error handlers ────────────────────────────────────
  queryCache: new QueryCache({
    onError(error, query) {
      // Only surface errors for queries that have stale data — first-load
      // errors are handled locally by the component's `isError` state.
      if (query.state.data !== undefined) {
        handleGlobalError(error, String(query.queryKey));
      }
    },
  }),

  mutationCache: new MutationCache({
    onError(error, _variables, _context, mutation) {
      if (mutation.meta?.suppressGlobalError) return;
      handleGlobalError(error, mutation.options.mutationKey?.toString());
    },
  }),

  // ─── Default options ───────────────────────────────────────────────────────
  defaultOptions: {
    queries: {
      // Data is fresh for 1 minute; after that it's eligible for a background refetch.
      staleTime: 1000 * 60,

      // Keep unused data in cache for 5 minutes before GC.
      gcTime: 1000 * 60 * 5,

      // Don't refetch while the tab is hidden; do it when the user comes back.
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: true,

      // Exponential back-off: 1 s → 2 s → 4 s (capped at 30 s). Skip 4xx.
      retry: (failureCount, error) => shouldRetryRequest(failureCount, error, isProduction ? 3 : 1),
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30_000),

      // Prevents the query from being treated as failed while retrying.
      // networkMode: 'offlineFirst' // ← uncomment for PWA / offline-first apps
    },

    mutations: {
      // Mutations are fire-and-forget by default — add at least 1 retry
      // for transient network blips, but don't retry on 4xx errors.
      retry: (failureCount, error) => shouldRetryRequest(failureCount, error, 2),
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
    },
  },
});
