import {
  keepPreviousData,
  queryOptions,
  useQuery,
  type UseQueryOptions,
} from '@tanstack/react-query';

import { getBookingEdits } from './get-booking-edits';
import { bookingKeys } from './query-keys';
import type { BookingEditsListParams, BookingEditsListResult } from './types';

export function bookingEditsQueryOptions(params: BookingEditsListParams) {
  return queryOptions({
    queryKey: bookingKeys.edits(params),
    queryFn: () => getBookingEdits(params),
    placeholderData: keepPreviousData,
  });
}

type UseBookingEditsOptions = Omit<
  UseQueryOptions<
    BookingEditsListResult,
    Error,
    BookingEditsListResult,
    ReturnType<typeof bookingKeys.edits>
  >,
  'queryKey' | 'queryFn' | 'placeholderData'
>;

export function useBookingEdits(params: BookingEditsListParams, options?: UseBookingEditsOptions) {
  return useQuery({
    ...bookingEditsQueryOptions(params),
    ...options,
  });
}
