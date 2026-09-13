import type { QueryClient } from '@tanstack/react-query';

import { storageGatePassKeys } from './query-keys';
import type { StorageGatePass, StorageGatePassListResult } from './types';

export function findStorageGatePassInCache(
  queryClient: QueryClient,
  id: string,
): StorageGatePass | undefined {
  const listQueries = queryClient.getQueriesData<StorageGatePassListResult>({
    queryKey: storageGatePassKeys.lists(),
  });

  for (const [, data] of listQueries) {
    const match = data?.storageGatePasses.find((pass) => pass._id === id);
    if (match) return match;
  }

  const searchQueries = queryClient.getQueriesData<StorageGatePassListResult>({
    queryKey: storageGatePassKeys.searches(),
  });

  for (const [, data] of searchQueries) {
    const match = data?.storageGatePasses.find((pass) => pass._id === id);
    if (match) return match;
  }

  return undefined;
}
