import apiClient, { getApiErrorMessage } from '@/lib/api-client';
import { getHttpStatusFromError } from '@/lib/http-error';

import type { BookingListResult, SearchBookingBody, SearchBookingsResponse } from './types';

const EMPTY_RESULT: BookingListResult = {
  bookings: [],
  pagination: {
    page: 1,
    limit: 0,
    total: 0,
    totalPages: 0,
  },
};

function toSearchListResult(bookings: BookingListResult['bookings']): BookingListResult {
  const total = bookings.length;

  return {
    bookings,
    pagination: {
      page: 1,
      limit: total,
      total,
      totalPages: 1,
    },
  };
}

export async function searchBookings(body: SearchBookingBody): Promise<BookingListResult> {
  try {
    const { data } = await apiClient.post<SearchBookingsResponse>('/booking/search', body);

    if (!data.success) {
      throw new Error(data.message ?? 'Failed to search bookings');
    }

    return toSearchListResult(data.data?.bookings ?? []);
  } catch (error) {
    if (getHttpStatusFromError(error) === 404) {
      return EMPTY_RESULT;
    }

    throw new Error(getApiErrorMessage(error, 'Failed to search bookings'), {
      cause: error,
    });
  }
}
