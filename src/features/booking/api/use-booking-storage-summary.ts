import { queryOptions, useQuery, type UseQueryOptions } from '@tanstack/react-query';

import { getBookingStorageSummary } from './get-booking-storage-summary';
import { bookingKeys } from './query-keys';
import type { SummaryVariety } from './summary-types';

export function bookingStorageSummaryQueryOptions() {
  return queryOptions({
    queryKey: bookingKeys.storageSummary(),
    queryFn: getBookingStorageSummary,
  });
}

type UseBookingStorageSummaryOptions = Omit<
  UseQueryOptions<
    SummaryVariety[],
    Error,
    SummaryVariety[],
    ReturnType<typeof bookingKeys.storageSummary>
  >,
  'queryKey' | 'queryFn'
>;

export function useBookingStorageSummary(options?: UseBookingStorageSummaryOptions) {
  return useQuery({
    ...bookingStorageSummaryQueryOptions(),
    ...options,
  });
}
