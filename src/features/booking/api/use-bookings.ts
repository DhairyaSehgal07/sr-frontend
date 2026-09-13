import {
  keepPreviousData,
  queryOptions,
  useQuery,
  type UseQueryOptions,
} from '@tanstack/react-query';

import { getBookings } from './get-bookings';
import { bookingKeys } from './query-keys';
import type { BookingListParams, BookingListResult } from './types';

export function bookingsQueryOptions(params: BookingListParams) {
  return queryOptions({
    queryKey: bookingKeys.list(params),
    queryFn: () => getBookings(params),
    placeholderData: keepPreviousData,
  });
}

type UseBookingsOptions = Omit<
  UseQueryOptions<BookingListResult, Error, BookingListResult, ReturnType<typeof bookingKeys.list>>,
  'queryKey' | 'queryFn' | 'placeholderData'
>;

export function useBookings(params: BookingListParams, options?: UseBookingsOptions) {
  return useQuery({
    ...bookingsQueryOptions(params),
    ...options,
  });
}
