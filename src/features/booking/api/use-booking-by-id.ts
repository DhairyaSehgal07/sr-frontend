import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { findBookingInCache } from './find-booking-in-cache';
import type { Booking } from './types';
import { useBookings } from './use-bookings';

const FALLBACK_LIST_PARAMS = {
  page: 1,
  limit: 100,
  sortOrder: 'desc' as const,
};

export function useBookingById(id: string) {
  const queryClient = useQueryClient();

  const cachedBooking = useMemo(() => findBookingInCache(queryClient, id), [queryClient, id]);

  const fallbackQuery = useBookings(FALLBACK_LIST_PARAMS, {
    enabled: cachedBooking == null,
  });

  const fetchedBooking = useMemo(
    () => fallbackQuery.data?.bookings.find((booking) => booking._id === id),
    [fallbackQuery.data, id],
  );

  const booking: Booking | null = cachedBooking ?? fetchedBooking ?? null;

  return {
    booking,
    isLoading: cachedBooking == null && fallbackQuery.isLoading,
    isError: cachedBooking == null && fallbackQuery.isError,
    error: cachedBooking == null ? fallbackQuery.error : null,
    isFromCache: cachedBooking != null,
  };
}
