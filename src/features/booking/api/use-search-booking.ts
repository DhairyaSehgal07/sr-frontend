import {
  keepPreviousData,
  queryOptions,
  useQuery,
  type UseQueryOptions,
} from '@tanstack/react-query';

import { searchBookings } from './search-bookings';
import { bookingKeys } from './query-keys';
import type { BookingListResult } from './types';

export function searchBookingQueryOptions(number: number) {
  return queryOptions({
    queryKey: bookingKeys.search(number),
    queryFn: () => searchBookings({ number }),
    placeholderData: keepPreviousData,
  });
}

type UseSearchBookingOptions = Omit<
  UseQueryOptions<
    BookingListResult,
    Error,
    BookingListResult,
    ReturnType<typeof bookingKeys.search>
  >,
  'queryKey' | 'queryFn' | 'placeholderData'
>;

export function useSearchBooking(number: number, options?: UseSearchBookingOptions) {
  return useQuery({
    ...searchBookingQueryOptions(number),
    ...options,
  });
}
