import type { QueryClient } from '@tanstack/react-query';

import { gradingGatePassKeys } from './query-keys';
import type { GradingGatePass, GradingGatePassListResult } from './types';

export function findGradingGatePassInCache(
  queryClient: QueryClient,
  id: string,
): GradingGatePass | undefined {
  const listQueries = queryClient.getQueriesData<GradingGatePassListResult>({
    queryKey: gradingGatePassKeys.lists(),
  });

  for (const [, data] of listQueries) {
    const match = data?.gradingGatePasses.find((pass) => pass._id === id);
    if (match) return match;
  }

  const searchQueries = queryClient.getQueriesData<GradingGatePassListResult>({
    queryKey: gradingGatePassKeys.searches(),
  });

  for (const [, data] of searchQueries) {
    const match = data?.gradingGatePasses.find((pass) => pass._id === id);
    if (match) return match;
  }

  return undefined;
}
