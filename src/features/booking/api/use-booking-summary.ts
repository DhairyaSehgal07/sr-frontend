import { queryOptions, useQuery, type UseQueryOptions } from '@tanstack/react-query';

import { getBookingSummary } from './get-booking-summary';
import { bookingKeys } from './query-keys';
import type { SummaryVariety } from './summary-types';

export function bookingSummaryQueryOptions() {
  return queryOptions({
    queryKey: bookingKeys.summary(),
    queryFn: getBookingSummary,
  });
}

type UseBookingSummaryOptions = Omit<
  UseQueryOptions<
    SummaryVariety[],
    Error,
    SummaryVariety[],
    ReturnType<typeof bookingKeys.summary>
  >,
  'queryKey' | 'queryFn'
>;

export function useBookingSummary(options?: UseBookingSummaryOptions) {
  return useQuery({
    ...bookingSummaryQueryOptions(),
    ...options,
  });
}
