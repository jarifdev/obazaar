import {
  defaultShouldDehydrateQuery,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query';
import superjson from 'superjson';

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,
      },
    },
  });
}

/**
 * Helper to dehydrate a QueryClient using superjson for safer server->client serialization.
 * Use this instead of calling `dehydrate(queryClient)` directly when you need custom
 * serialization or a custom shouldDehydrateQuery predicate.
 */
export function dehydrateQueryClient(queryClient: QueryClient) {
  const dehydrated = dehydrate(queryClient, {
    shouldDehydrateQuery: (query) =>
      defaultShouldDehydrateQuery(query) || query.state.status === 'pending',
  });

  // Serialize with superjson so Next's server -> client transport preserves dates/etc.
  return superjson.serialize(dehydrated);
}

export function deserializeDehydratedState(serialized: any) {
  return superjson.deserialize(serialized) as unknown;
}
