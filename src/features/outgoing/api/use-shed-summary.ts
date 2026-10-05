import { queryOptions, useQuery, type UseQueryOptions } from '@tanstack/react-query';

import type { ShedSummaryGroup } from '@/features/outgoing/api/types';

import { getShedSummary } from './get-shed-summary';
import { outgoingGatePassKeys } from './query-keys';

export function shedSummaryQueryOptions() {
  return queryOptions({
    queryKey: outgoingGatePassKeys.shedSummary(),
    queryFn: getShedSummary,
  });
}

type UseShedSummaryOptions = Omit<
  UseQueryOptions<
    ShedSummaryGroup[],
    Error,
    ShedSummaryGroup[],
    ReturnType<typeof outgoingGatePassKeys.shedSummary>
  >,
  'queryKey' | 'queryFn'
>;

export function useShedSummary(options?: UseShedSummaryOptions) {
  return useQuery({
    ...shedSummaryQueryOptions(),
    ...options,
  });
}
