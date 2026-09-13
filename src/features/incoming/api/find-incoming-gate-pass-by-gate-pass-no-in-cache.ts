import type { QueryClient } from '@tanstack/react-query';

import { incomingGatePassKeys } from './query-keys';
import type { IncomingGatePass, IncomingGatePassListResult } from './types';

function farmerLinkIdFromPass(pass: IncomingGatePass): string {
  const link = pass.farmerStorageLinkId;
  return typeof link === 'string' ? link : (link._id ?? '');
}

function scanLists(
  queries: [unknown, IncomingGatePassListResult | undefined][],
  gatePassNo: number,
  farmerStorageLinkId?: string,
): IncomingGatePass | undefined {
  for (const [, data] of queries) {
    const match = data?.incomingGatePasses.find((pass) => {
      if (pass.gatePassNo !== gatePassNo) return false;
      if (!farmerStorageLinkId) return true;
      return farmerLinkIdFromPass(pass) === farmerStorageLinkId;
    });
    if (match) return match;
  }

  return undefined;
}

export function findIncomingGatePassByGatePassNoInCache(
  queryClient: QueryClient,
  gatePassNo: number,
  farmerStorageLinkId?: string,
): IncomingGatePass | undefined {
  const listQueries = queryClient.getQueriesData<IncomingGatePassListResult>({
    queryKey: incomingGatePassKeys.lists(),
  });

  const fromLists = scanLists(listQueries, gatePassNo, farmerStorageLinkId);
  if (fromLists) return fromLists;

  const searchQueries = queryClient.getQueriesData<IncomingGatePassListResult>({
    queryKey: incomingGatePassKeys.searches(),
  });

  return scanLists(searchQueries, gatePassNo, farmerStorageLinkId);
}
