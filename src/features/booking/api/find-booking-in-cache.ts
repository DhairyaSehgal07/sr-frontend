import type { QueryClient } from '@tanstack/react-query';

import { bookingKeys } from './query-keys';
import type { Booking, BookingListResult } from './types';

export function findBookingInCache(queryClient: QueryClient, id: string): Booking | undefined {
  const listQueries = queryClient.getQueriesData<BookingListResult>({
    queryKey: bookingKeys.lists(),
  });

  for (const [, data] of listQueries) {
    const match = data?.bookings.find((booking) => booking._id === id);
    if (match) return match;
  }

  const searchQueries = queryClient.getQueriesData<BookingListResult>({
    queryKey: bookingKeys.searches(),
  });

  for (const [, data] of searchQueries) {
    const match = data?.bookings.find((booking) => booking._id === id);
    if (match) return match;
  }

  return undefined;
}
