import {
  keepPreviousData,
  queryOptions,
  useQuery,
  type UseQueryOptions,
} from '@tanstack/react-query';

import { getIncomingGatePassesByFarmer } from './get-incoming-gate-passes-by-farmer';
import { incomingGatePassKeys } from './query-keys';
import type { IncomingGatePassesByFarmerParams, IncomingGatePassListResult } from './types';

const DEFAULT_PARAMS: IncomingGatePassesByFarmerParams = {
  sortOrder: 'desc',
  status: 'ungraded',
};

export function incomingGatePassesByFarmerQueryOptions(
  farmerStorageLinkId: string,
  params: IncomingGatePassesByFarmerParams = DEFAULT_PARAMS,
) {
  return queryOptions({
    queryKey: incomingGatePassKeys.byFarmer(farmerStorageLinkId, params),
    queryFn: () => getIncomingGatePassesByFarmer(farmerStorageLinkId, params),
    placeholderData: keepPreviousData,
    enabled: farmerStorageLinkId.trim().length > 0,
  });
}

type UseIncomingGatePassesByFarmerOptions = Omit<
  UseQueryOptions<
    IncomingGatePassListResult,
    Error,
    IncomingGatePassListResult,
    ReturnType<typeof incomingGatePassKeys.byFarmer>
  >,
  'queryKey' | 'queryFn' | 'placeholderData'
>;

export function useIncomingGatePassesByFarmer(
  farmerStorageLinkId: string,
  params: IncomingGatePassesByFarmerParams = DEFAULT_PARAMS,
  options?: UseIncomingGatePassesByFarmerOptions,
) {
  return useQuery({
    ...incomingGatePassesByFarmerQueryOptions(farmerStorageLinkId, params),
    ...options,
  });
}
