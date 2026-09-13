import {
  keepPreviousData,
  queryOptions,
  useQuery,
  type UseQueryOptions,
} from '@tanstack/react-query';

import { getIncomingGatePasses } from './get-incoming-gate-passes';
import { incomingGatePassKeys } from './query-keys';
import type { IncomingGatePassListParams, IncomingGatePassListResult } from './types';

export function incomingGatePassesQueryOptions(params: IncomingGatePassListParams) {
  return queryOptions({
    queryKey: incomingGatePassKeys.list(params),
    queryFn: () => getIncomingGatePasses(params),
    placeholderData: keepPreviousData,
  });
}

type UseIncomingGatePassesOptions = Omit<
  UseQueryOptions<
    IncomingGatePassListResult,
    Error,
    IncomingGatePassListResult,
    ReturnType<typeof incomingGatePassKeys.list>
  >,
  'queryKey' | 'queryFn' | 'placeholderData'
>;

export function useIncomingGatePasses(
  params: IncomingGatePassListParams,
  options?: UseIncomingGatePassesOptions,
) {
  return useQuery({
    ...incomingGatePassesQueryOptions(params),
    ...options,
  });
}
