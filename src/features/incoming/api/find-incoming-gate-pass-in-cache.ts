import type { QueryClient } from '@tanstack/react-query';

import { incomingGatePassKeys } from './query-keys';
import type { IncomingGatePass, IncomingGatePassListResult } from './types';

export function findIncomingGatePassInCache(
  queryClient: QueryClient,
  id: string,
): IncomingGatePass | undefined {
  const listQueries = queryClient.getQueriesData<IncomingGatePassListResult>({
    queryKey: incomingGatePassKeys.lists(),
  });

  for (const [, data] of listQueries) {
    const match = data?.incomingGatePasses.find((pass) => pass._id === id);
    if (match) return match;
  }

  const searchQueries = queryClient.getQueriesData<IncomingGatePassListResult>({
    queryKey: incomingGatePassKeys.searches(),
  });

  for (const [, data] of searchQueries) {
    const match = data?.incomingGatePasses.find((pass) => pass._id === id);
    if (match) return match;
  }

  return undefined;
}
