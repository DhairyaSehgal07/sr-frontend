import {
  keepPreviousData,
  queryOptions,
  useQuery,
  type UseQueryOptions,
} from '@tanstack/react-query';

import { incomingGatePassKeys } from './query-keys';
import { searchIncomingGatePasses } from './search-incoming-gate-passes';
import type { IncomingGatePassListResult } from './types';

export function searchIncomingGatePassQueryOptions(number: number) {
  return queryOptions({
    queryKey: incomingGatePassKeys.search(number),
    queryFn: () => searchIncomingGatePasses({ number }),
    placeholderData: keepPreviousData,
  });
}

type UseSearchIncomingGatePassOptions = Omit<
  UseQueryOptions<
    IncomingGatePassListResult,
    Error,
    IncomingGatePassListResult,
    ReturnType<typeof incomingGatePassKeys.search>
  >,
  'queryKey' | 'queryFn' | 'placeholderData'
>;

export function useSearchIncomingGatePass(
  number: number,
  options?: UseSearchIncomingGatePassOptions,
) {
  return useQuery({
    ...searchIncomingGatePassQueryOptions(number),
    ...options,
  });
}
