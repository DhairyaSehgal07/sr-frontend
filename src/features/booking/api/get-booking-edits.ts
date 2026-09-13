import apiClient, { getApiErrorMessage } from '@/lib/api-client';
import { getHttpStatusFromError } from '@/lib/http-error';

import type {
  BookingEditsListParams,
  BookingEditsListResult,
  GetBookingEditsResponse,
} from './types';

const EMPTY_RESULT: BookingEditsListResult = {
  audits: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

export function buildBookingEditsParams(params: BookingEditsListParams): Record<string, number> {
  const query: Record<string, number> = {};

  if (params.page != null) query.page = params.page;
  if (params.limit != null) query.limit = params.limit;

  return query;
}

export async function getBookingEdits(
  params: BookingEditsListParams = {},
): Promise<BookingEditsListResult> {
  try {
    const { data } = await apiClient.get<GetBookingEditsResponse>('/booking/edits', {
      params: buildBookingEditsParams(params),
    });

    if (!data.success) {
      throw new Error(data.message ?? 'Failed to load booking edits');
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

    throw new Error(getApiErrorMessage(error, 'Failed to load booking edits'), {
      cause: error,
    });
  }
}
