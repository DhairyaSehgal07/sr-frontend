import apiClient, { getApiErrorMessage } from '@/lib/api-client';
import { getHttpStatusFromError } from '@/lib/http-error';

import type { BookingListParams, BookingListResult, GetBookingsResponse } from './types';

const EMPTY_RESULT: BookingListResult = {
  bookings: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

export function buildBookingListParams(params: BookingListParams): Record<string, string | number> {
  const query: Record<string, string | number> = {};

  if (params.page != null) query.page = params.page;
  if (params.limit != null) query.limit = params.limit;
  if (params.sortOrder) query.sortOrder = params.sortOrder;

  return query;
}

export async function getBookings(params: BookingListParams = {}): Promise<BookingListResult> {
  try {
    const { data } = await apiClient.get<GetBookingsResponse>('/booking/', {
      params: buildBookingListParams(params),
    });

    if (!data.success) {
      throw new Error(data.message ?? 'Failed to load bookings');
    }

    return data.data;
  } catch (error) {
    if (getHttpStatusFromError(error) === 404) {
      return {
        ...EMPTY_RESULT,
        pagination: {
          ...EMPTY_RESULT.pagination,
          limit: params.limit ?? EMPTY_RESULT.pagination.limit,
        },
      };
    }

    throw new Error(getApiErrorMessage(error, 'Failed to load bookings'), {
      cause: error,
    });
  }
}
