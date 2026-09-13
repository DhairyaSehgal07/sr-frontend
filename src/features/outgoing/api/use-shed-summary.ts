import { queryOptions, useQuery, type UseQueryOptions } from '@tanstack/react-query';

import type { BookingVarietySummary } from '@/features/booking/types/booking-summary';

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
    BookingVarietySummary[],
    Error,
    BookingVarietySummary[],
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
